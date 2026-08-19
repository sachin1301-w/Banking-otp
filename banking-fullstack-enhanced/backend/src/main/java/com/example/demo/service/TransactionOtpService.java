package com.example.demo.service;

import com.example.demo.dto.OtpChallengeResponse;
import com.example.demo.entity.Account;
import com.example.demo.entity.Transaction;
import com.example.demo.entity.TransactionOtpChallenge;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.InsufficientBalanceException;
import com.example.demo.exception.OtpVerificationException;
import com.example.demo.repo.TransactionOtpChallengeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
public class TransactionOtpService {

    private final TransactionOtpChallengeRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionOtpMailService mailService;
    private final IAccountService accountService;
    private final ITransactionService transactionService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${otp.expiration-minutes:5}")
    private int expirationMinutes;

    @Value("${otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${otp.resend-cooldown-seconds:30}")
    private int resendCooldownSeconds;

    public TransactionOtpService(TransactionOtpChallengeRepository otpRepository,
                                 PasswordEncoder passwordEncoder,
                                 TransactionOtpMailService mailService,
                                 IAccountService accountService,
                                 ITransactionService transactionService) {
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    public OtpChallengeResponse requestDeposit(Account account, Double amount, String authenticatedEmail) {
        validateOwner(account, authenticatedEmail);
        validateAmount(amount);
        requireActive(account);
        return createChallenge("DEPOSIT", account, null, amount, authenticatedEmail);
    }

    public OtpChallengeResponse requestWithdraw(Account account, Double amount, String authenticatedEmail) {
        validateOwner(account, authenticatedEmail);
        validateAmount(amount);
        requireActive(account);
        if (account.getBalance() < amount) {
            throw new InsufficientBalanceException("Insufficient balance.");
        }
        return createChallenge("WITHDRAW", account, null, amount, authenticatedEmail);
    }

    public OtpChallengeResponse requestTransfer(Account source, Account target, Double amount, String authenticatedEmail) {
        validateOwner(source, authenticatedEmail);
        validateAmount(amount);
        requireActive(source);
        requireActive(target);
        if (source.getAccountNumber().equals(target.getAccountNumber())) {
            throw new BadRequestException("Cannot transfer to the same account.");
        }
        if (source.getBalance() < amount) {
            throw new InsufficientBalanceException("Insufficient balance.");
        }
        return createChallenge("TRANSFER", source, target, amount, authenticatedEmail);
    }

    private OtpChallengeResponse createChallenge(String operation,
                                                 Account source,
                                                 Account target,
                                                 Double amount,
                                                 String authenticatedEmail) {
        String email = authenticatedEmail.trim().toLowerCase(Locale.ROOT);
        enforceCooldown(email);
        invalidatePreviousChallenge(email);

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        LocalDateTime now = LocalDateTime.now();

        TransactionOtpChallenge challenge = new TransactionOtpChallenge();
        challenge.setId(UUID.randomUUID().toString());
        challenge.setUserEmail(email);
        challenge.setOperation(operation);
        challenge.setSourceAccountNumber(source.getAccountNumber());
        challenge.setTargetAccountNumber(target == null ? null : target.getAccountNumber());
        challenge.setAmount(amount);
        challenge.setOtpHash(passwordEncoder.encode(otp));
        challenge.setExpiresAt(now.plusMinutes(expirationMinutes));
        challenge.setAttempts(0);
        challenge.setConsumed(false);
        otpRepository.save(challenge);

        try {
            mailService.sendOtp(
                    email,
                    source.getUser().getFullName(),
                    otp,
                    operation,
                    amount,
                    source.getAccountNumber(),
                    target == null ? null : target.getAccountNumber(),
                    expirationMinutes
            );
        } catch (RuntimeException ex) {
            otpRepository.deleteById(challenge.getId());
            throw ex;
        }

        OtpChallengeResponse response = new OtpChallengeResponse();
        response.setChallengeId(challenge.getId());
        response.setMaskedEmail(maskEmail(email));
        response.setExpiresInSeconds(expirationMinutes * 60L);
        response.setOperation(operation);
        response.setMessage("A 6-digit OTP was sent to " + response.getMaskedEmail() + ". No money has moved yet.");
        return response;
    }

    @Transactional(noRollbackFor = OtpVerificationException.class)
    public Transaction verifyAndExecute(String challengeId, String otp, String authenticatedEmail) {
        String email = authenticatedEmail.trim().toLowerCase(Locale.ROOT);
        TransactionOtpChallenge challenge = otpRepository.findByIdForUpdate(challengeId)
                .orElseThrow(() -> new OtpVerificationException("OTP request was not found. Please request a new OTP."));

        if (!challenge.getUserEmail().equalsIgnoreCase(email)) {
            throw new OtpVerificationException("This OTP request does not belong to the signed-in user.");
        }
        if (challenge.isConsumed()) {
            throw new OtpVerificationException("This OTP has already been used. Please request a new OTP.");
        }
        if (LocalDateTime.now().isAfter(challenge.getExpiresAt())) {
            challenge.setConsumed(true);
            otpRepository.save(challenge);
            throw new OtpVerificationException("OTP expired. Please request a new OTP.");
        }
        if (challenge.getAttempts() >= maxAttempts) {
            challenge.setConsumed(true);
            otpRepository.save(challenge);
            throw new OtpVerificationException("Too many incorrect OTP attempts. Please request a new OTP.");
        }

        if (!passwordEncoder.matches(otp, challenge.getOtpHash())) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            if (challenge.getAttempts() >= maxAttempts) {
                challenge.setConsumed(true);
            }
            otpRepository.save(challenge);
            int remaining = Math.max(0, maxAttempts - challenge.getAttempts());
            if (remaining == 0) {
                throw new OtpVerificationException("Incorrect OTP. This OTP request is now locked; request a new OTP.");
            }
            throw new OtpVerificationException("Incorrect OTP. " + remaining + " attempt(s) remaining.");
        }

        Account source = accountService.getAccountByAccountNumber(challenge.getSourceAccountNumber());
        validateOwner(source, email);

        Transaction transaction = switch (challenge.getOperation()) {
            case "DEPOSIT" -> transactionService.deposit(source, challenge.getAmount());
            case "WITHDRAW" -> transactionService.withdraw(source, challenge.getAmount());
            case "TRANSFER" -> {
                Account target = accountService.getAccountByAccountNumber(challenge.getTargetAccountNumber());
                yield transactionService.transfer(source, target, challenge.getAmount());
            }
            default -> throw new BadRequestException("Unsupported OTP transaction type.");
        };

        challenge.setConsumed(true);
        challenge.setVerifiedAt(LocalDateTime.now());
        otpRepository.save(challenge);
        return transaction;
    }

    private void invalidatePreviousChallenge(String email) {
        otpRepository.findTopByUserEmailAndConsumedFalseOrderByCreatedAtDesc(email).ifPresent(previous -> {
            if (!previous.isConsumed()) {
                previous.setConsumed(true);
                otpRepository.save(previous);
            }
        });
    }

    private void enforceCooldown(String email) {
        otpRepository.findTopByUserEmailAndConsumedFalseOrderByCreatedAtDesc(email).ifPresent(previous -> {
            if (previous.getCreatedAt() == null) return;
            long elapsed = Duration.between(previous.getCreatedAt(), LocalDateTime.now()).getSeconds();
            if (!previous.isConsumed() && LocalDateTime.now().isBefore(previous.getExpiresAt()) && elapsed < resendCooldownSeconds) {
                long wait = resendCooldownSeconds - elapsed;
                throw new BadRequestException("Please wait " + wait + " second(s) before requesting another OTP.");
            }
        });
    }

    private void validateOwner(Account account, String authenticatedEmail) {
        if (account.getUser() == null || !account.getUser().getEmail().equalsIgnoreCase(authenticatedEmail)) {
            throw new BadRequestException("You can only transact on your own account.");
        }
    }

    private void validateAmount(Double amount) {
        if (amount == null || !Double.isFinite(amount) || amount <= 0) {
            throw new BadRequestException("Amount must be greater than zero.");
        }
    }

    private void requireActive(Account account) {
        if (!account.isActive()) {
            throw new BadRequestException("Account is inactive.");
        }
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) return "***" + email.substring(Math.max(0, at));
        String local = email.substring(0, at);
        String domain = email.substring(at);
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + domain;
    }
}
