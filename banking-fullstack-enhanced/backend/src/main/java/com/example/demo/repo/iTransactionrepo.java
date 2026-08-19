package com.example.demo.repo;

import com.example.demo.entity.Account;
import com.example.demo.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface iTransactionrepo extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByAccountOrderByCreatedAtDesc(Account account);
    List<Transaction> findByTransactionTypeOrderByCreatedAtDesc(String transactionType);
    List<Transaction> findAllByOrderByCreatedAtDesc();
}
