package com.example.demo.service;

import com.example.demo.entity.Account;
import com.example.demo.entity.Transaction;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.InsufficientBalanceException;
import com.example.demo.exception.TransactionNotFoundException;
import com.example.demo.repo.iAccountrepo;
import com.example.demo.repo.iTransactionrepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TransactionServiceImpl implements ITransactionService {
    private final iTransactionrepo transactionRepo;
    private final iAccountrepo accountRepo;

    public TransactionServiceImpl(iTransactionrepo transactionRepo, iAccountrepo accountRepo) {
        this.transactionRepo = transactionRepo;
        this.accountRepo = accountRepo;
    }

    private void validateAmount(Double amount) {
        if (amount == null || !Double.isFinite(amount) || amount <= 0) {
            throw new BadRequestException("Amount must be greater than zero.");
        }
    }

    private Account locked(String accountNumber) {
        return accountRepo.findByAccountNumberForUpdate(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found."));
    }

    private void requireActive(Account account) {
        if (!account.isActive()) {
            throw new BadRequestException("Account is inactive.");
        }
    }

    private Transaction record(Account account, Double amount, String type,
                               String counterparty, String referenceId) {
        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setAmount(amount);
        tx.setTransactionType(type);
        tx.setStatus("SUCCESS");
        tx.setCounterpartyAccountNumber(counterparty);
        tx.setReferenceId(referenceId);
        tx.setBalanceAfter(account.getBalance());
        return transactionRepo.save(tx);
    }

    @Override
    @Transactional
    public Transaction deposit(Account account, Double amount) {
        validateAmount(amount);
        Account current = locked(account.getAccountNumber());
        requireActive(current);
        current.setBalance(current.getBalance() + amount);
        accountRepo.save(current);
        return record(current, amount, "DEPOSIT", null, "DEP-" + UUID.randomUUID());
    }

    @Override
    @Transactional
    public Transaction withdraw(Account account, Double amount) {
        validateAmount(amount);
        Account current = locked(account.getAccountNumber());
        requireActive(current);
        if (current.getBalance() < amount) {
            throw new InsufficientBalanceException("Insufficient balance.");
        }
        current.setBalance(current.getBalance() - amount);
        accountRepo.save(current);
        return record(current, amount, "WITHDRAW", null, "WDL-" + UUID.randomUUID());
    }

    @Override
    @Transactional
    public Transaction transfer(Account from, Account to, Double amount) {
        validateAmount(amount);
        if (from.getAccountNumber().equals(to.getAccountNumber())) {
            throw new BadRequestException("Cannot transfer to the same account.");
        }

        // Lock in a stable order to reduce deadlock risk when two transfers cross.
        String firstNumber = from.getAccountNumber().compareTo(to.getAccountNumber()) < 0
                ? from.getAccountNumber() : to.getAccountNumber();
        String secondNumber = firstNumber.equals(from.getAccountNumber())
                ? to.getAccountNumber() : from.getAccountNumber();
        Account first = locked(firstNumber);
        Account second = locked(secondNumber);
        Account source = first.getAccountNumber().equals(from.getAccountNumber()) ? first : second;
        Account target = source == first ? second : first;

        requireActive(source);
        requireActive(target);
        if (source.getBalance() < amount) {
            throw new InsufficientBalanceException("Insufficient balance.");
        }

        source.setBalance(source.getBalance() - amount);
        target.setBalance(target.getBalance() + amount);
        accountRepo.save(source);
        accountRepo.save(target);

        String reference = "TRF-" + UUID.randomUUID();
        Transaction outgoing = record(source, amount, "TRANSFER_OUT", target.getAccountNumber(), reference);
        record(target, amount, "TRANSFER_IN", source.getAccountNumber(), reference);
        return outgoing;
    }

    @Override
    public Transaction getTransactionById(Integer id) {
        return transactionRepo.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found."));
    }

    @Override
    public List<Transaction> getTransactions() {
        return transactionRepo.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Transaction> getTransactionsByAccount(Account account) {
        return transactionRepo.findByAccountOrderByCreatedAtDesc(account);
    }

    @Override
    public List<Transaction> getTransactionsByType(String transactionType) {
        return transactionRepo.findByTransactionTypeOrderByCreatedAtDesc(transactionType);
    }
}
