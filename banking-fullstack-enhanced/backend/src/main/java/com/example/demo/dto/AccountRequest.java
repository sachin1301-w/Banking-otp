package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class AccountRequest {
    @NotBlank
    private String accountHolderName;
    @NotBlank
    private String accountType;
    @PositiveOrZero
    @NotNull
    private Double balance;
    @NotNull
    private Integer userId;

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public AccountRequest() {
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

    public AccountRequest(String accountHolderName, Integer userId, Double balance, String accountType) {
        this.accountHolderName = accountHolderName;
        this.userId = userId;
        this.balance = balance;
        this.accountType = accountType;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
