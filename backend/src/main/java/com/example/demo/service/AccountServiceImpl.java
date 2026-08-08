package com.example.demo.service;

import com.example.demo.entity.Account;
import com.example.demo.entity.User;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repo.iAccountrepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class AccountServiceImpl implements IAccountService{
    private final iAccountrepo repo;
    public AccountServiceImpl(iAccountrepo repo) {
        this.repo = repo;
    }

    @Override
    public Account createAccount(Account account) {
        if(repo.existsByAccountNumber(account.getAccountNumber())){
             throw new BadRequestException("Account number already exists");
        }
        account.setActive(true);

        return repo.save(account);

    }

    @Override
    public boolean accountNumberExists(String accountNumber) {
        return repo.existsByAccountNumber(accountNumber);
    }

    @Override
    public Account getAccountById(Integer id) {
       Optional<Account> optional=repo.findById(id);
       if(optional.isPresent()){
           return optional.get();
       }
       else{
           throw new AccountNotFoundException("Account not found");
       }
    }

    @Override
    public Account getAccountByAccountNumber(String accountNumber) {
       Account acc= repo.findByAccountNumber(accountNumber);
       if(acc!=null){
           return acc;
       }
       else{
           throw new AccountNotFoundException("Account not found");
       }
    }

    @Override
    public List<Account> getAllAccounts() {
        return repo.findAll();
    }

    @Override
    public List<Account> getAccountsByUser(User user) {
        return repo.findByUser(user);
    }

    @Override
    public Account updateAccount(Integer id, Account account) {
        Optional<Account>optional=repo.findById(id);
        if(optional.isPresent()){
            Account acc=optional.get();
            acc.setAccountType(account.getAccountType());
            acc.setAccountHolderName(account.getAccountHolderName());
            repo.save(acc);
            return acc;
        }
        else{
            throw new AccountNotFoundException("Account not found");
        }
    }

    @Override
    public Account closeAccount(Integer id) {
        Optional<Account>optional=repo.findById(id);
        if(optional.isPresent()){
            Account account = optional.get();
            if (Math.abs(account.getBalance()) > 0.000001) {
                throw new BadRequestException("Account balance must be zero before closing the account.");
            }
            account.setActive(false);
            repo.save(account);
            return account;
        }
        else {
            throw new AccountNotFoundException("Account not found");
        }
    }
}
