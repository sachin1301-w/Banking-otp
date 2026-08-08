package com.example.demo.service;

import com.example.demo.entity.Account;
import com.example.demo.entity.User;

import java.util.List;

public interface IAccountService {
    public Account createAccount(Account account);
    public boolean accountNumberExists(String accountNumber);

    Account getAccountById(Integer id);

    Account getAccountByAccountNumber(String accountNumber);

    List<Account> getAllAccounts();

    List<Account> getAccountsByUser(User user);

    Account updateAccount(Integer id, Account account);

     Account closeAccount(Integer id);
}
