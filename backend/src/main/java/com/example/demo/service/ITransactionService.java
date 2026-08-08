package com.example.demo.service;

import com.example.demo.entity.Account;
import com.example.demo.entity.Transaction;

import java.util.List;

public interface ITransactionService {
    Transaction deposit(Account account, Double amount);
    Transaction withdraw(Account account, Double amount);
    Transaction transfer(Account from, Account to, Double amount);
    Transaction getTransactionById(Integer id);
    List<Transaction> getTransactions();
    List<Transaction> getTransactionsByAccount(Account account);
    List<Transaction> getTransactionsByType(String transactionType);
}
