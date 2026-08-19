package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.Account;
import com.example.demo.entity.Transaction;
import com.example.demo.exception.BadRequestException;
import com.example.demo.service.IAccountService;
import com.example.demo.service.ITransactionService;
import com.example.demo.service.TransactionOtpService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final ITransactionService transactionService;
    private final IAccountService accountService;
    private final TransactionOtpService otpService;

    public TransactionController(ITransactionService transactionService,
                                 IAccountService accountService,
                                 TransactionOtpService otpService) {
        this.transactionService = transactionService;
        this.accountService = accountService;
        this.otpService = otpService;
    }

    private TransactionResponse toResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setTransactionType(transaction.getTransactionType());
        response.setAmount(transaction.getAmount());
        response.setCreatedAt(transaction.getCreatedAt());
        response.setAccountNumber(transaction.getAccount().getAccountNumber());
        response.setStatus(transaction.getStatus());
        response.setReferenceId(transaction.getReferenceId());
        response.setCounterpartyAccountNumber(transaction.getCounterpartyAccountNumber());
        response.setBalanceAfter(transaction.getBalanceAfter());
        return response;
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private void requireOwnershipOrAdmin(Account account, Authentication auth) {
        if (isAdmin(auth)) return;
        if (account.getUser() == null || !account.getUser().getEmail().equalsIgnoreCase(auth.getName())) {
            throw new BadRequestException("You can only view your own account transactions.");
        }
    }

    /**
     * Step 1: validate the requested deposit and email a one-time OTP.
     * No balance is changed here.
     */
    @PostMapping("/deposit")
    public ResponseEntity<OtpChallengeResponse> requestDepositOtp(@Valid @RequestBody DepositRequest request,
                                                                  Authentication auth) {
        Account account = accountService.getAccountByAccountNumber(request.getAccountNumber());
        return ResponseEntity.ok(otpService.requestDeposit(account, request.getAmount(), auth.getName()));
    }

    /** Step 1 for withdrawal. No balance is changed until /otp/verify succeeds. */
    @PostMapping("/withdraw")
    public ResponseEntity<OtpChallengeResponse> requestWithdrawOtp(@Valid @RequestBody WithdrawRequest request,
                                                                   Authentication auth) {
        Account account = accountService.getAccountByAccountNumber(request.getAccountNumber());
        return ResponseEntity.ok(otpService.requestWithdraw(account, request.getAmount(), auth.getName()));
    }

    /** Step 1 for transfer. No money moves until /otp/verify succeeds. */
    @PostMapping("/transfer")
    public ResponseEntity<OtpChallengeResponse> requestTransferOtp(@Valid @RequestBody TransferRequest request,
                                                                   Authentication auth) {
        Account from = accountService.getAccountByAccountNumber(request.getFromAccountNumber());
        Account to = accountService.getAccountByAccountNumber(request.getToAccountNumber());
        return ResponseEntity.ok(otpService.requestTransfer(from, to, request.getAmount(), auth.getName()));
    }

    /**
     * Step 2: verify the OTP and execute the exact transaction stored in the challenge.
     * The client cannot change the amount/account while confirming.
     */
    @PostMapping("/otp/verify")
    public ResponseEntity<TransactionResponse> verifyOtpAndExecute(@Valid @RequestBody OtpVerifyRequest request,
                                                                   Authentication auth) {
        Transaction transaction = otpService.verifyAndExecute(
                request.getChallengeId(), request.getOtp(), auth.getName()
        );
        return ResponseEntity.ok(toResponse(transaction));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions() {
        return ResponseEntity.ok(transactionService.getTransactions().stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable Integer id,
                                                                  Authentication auth) {
        Transaction transaction = transactionService.getTransactionById(id);
        requireOwnershipOrAdmin(transaction.getAccount(), auth);
        return ResponseEntity.ok(toResponse(transaction));
    }

    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByAccount(@PathVariable String accountNumber,
                                                                               Authentication auth) {
        Account account = accountService.getAccountByAccountNumber(accountNumber);
        requireOwnershipOrAdmin(account, auth);
        return ResponseEntity.ok(transactionService.getTransactionsByAccount(account).stream().map(this::toResponse).toList());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByType(@PathVariable String type) {
        return ResponseEntity.ok(transactionService.getTransactionsByType(type).stream().map(this::toResponse).toList());
    }
}
