package com.example.demo.controller;

import com.example.demo.dto.AccountRequest;
import com.example.demo.dto.AccountResponse;
import com.example.demo.entity.Account;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.service.IAccountService;
import com.example.demo.service.iUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/accounts")
public class AccountController {
    private final iUserService userService;
    private final IAccountService accountService;

    public AccountController(iUserService userService, IAccountService accountService) {
        this.userService = userService;
        this.accountService = accountService;
    }

    private AccountResponse toResponse(Account account) {
        AccountResponse r = new AccountResponse();
        r.setId(account.getId());
        r.setAccountNumber(account.getAccountNumber());
        r.setAccountHolderName(account.getAccountHolderName());
        r.setBalance(account.getBalance());
        r.setAccountType(account.getAccountType());
        r.setActive(account.isActive());
        r.setUserId(account.getUser().getId());
        return r;
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private void requireOwnershipOrAdmin(Account account, Authentication auth) {
        if (isAdmin(auth)) return;
        if (!account.getUser().getEmail().equalsIgnoreCase(auth.getName())) {
            throw new BadRequestException("You can only view your own account.");
        }
    }

    private String accountNumber() {
        while (true) {
            String candidate = "ACC" + ThreadLocalRandom.current().nextLong(100_000_000_000L, 1_000_000_000_000L);
            if (!accountService.accountNumberExists(candidate)) return candidate;
        }
    }

    @PostMapping
    public ResponseEntity<AccountResponse> addAccount(@Valid @RequestBody AccountRequest request) {
        User user = userService.getUserById(request.getUserId());
        Account account = new Account();
        account.setAccountHolderName(request.getAccountHolderName());
        account.setAccountType(request.getAccountType().toUpperCase());
        account.setBalance(request.getBalance());
        account.setActive(true);
        account.setAccountNumber(accountNumber());
        account.setUser(user);
        return new ResponseEntity<>(toResponse(accountService.createAccount(account)), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts().stream().map(this::toResponse).toList());
    }

    @GetMapping("/me")
    public ResponseEntity<List<AccountResponse>> myAccounts(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(accountService.getAccountsByUser(user).stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable Integer id, Authentication auth) {
        Account account = accountService.getAccountById(id);
        requireOwnershipOrAdmin(account, auth);
        return ResponseEntity.ok(toResponse(account));
    }

    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<AccountResponse> getAccountsByAccountNumber(@PathVariable String accountNumber, Authentication auth) {
        Account account = accountService.getAccountByAccountNumber(accountNumber);
        requireOwnershipOrAdmin(account, auth);
        return ResponseEntity.ok(toResponse(account));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AccountResponse>> getAccountsByUserId(@PathVariable Integer userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(accountService.getAccountsByUser(user).stream().map(this::toResponse).toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable Integer id, @Valid @RequestBody AccountRequest request) {
        User user = userService.getUserById(request.getUserId());
        Account account = new Account();
        account.setAccountHolderName(request.getAccountHolderName());
        account.setAccountType(request.getAccountType());
        account.setBalance(request.getBalance());
        account.setActive(true);
        account.setUser(user);
        return ResponseEntity.ok(toResponse(accountService.updateAccount(id, account)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AccountResponse> deleteAccount(@PathVariable Integer id) {
        return ResponseEntity.ok(toResponse(accountService.closeAccount(id)));
    }
}
