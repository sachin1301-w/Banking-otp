package com.example.demo.service;

import com.example.demo.entity.Account;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.repo.iAccountrepo;
import com.example.demo.repo.iuserrepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class UserServiceImpl implements iUserService {
    private final iuserrepo repo;
    private final iAccountrepo accountRepo;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(iuserrepo repo, iAccountrepo accountRepo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.accountRepo = accountRepo;
        this.passwordEncoder = passwordEncoder;
    }

    private String generateAccountNumber() {
        String number;
        do {
            long value = ThreadLocalRandom.current().nextLong(100_000_000_000L, 1_000_000_000_000L);
            number = "ACC" + value;
        } while (accountRepo.existsByAccountNumber(number));
        return number;
    }

    @Override
    @Transactional
    public String RegisterUser(User user) {
        String email = user.getEmail().trim().toLowerCase();
        String phone = user.getPhoneNumber().trim();
        if (repo.existsByEmail(email)) throw new BadRequestException("Email already exists.");
        if (repo.existsByPhoneNumber(phone)) throw new BadRequestException("Phone number already exists.");

        user.setEmail(email);
        user.setPhoneNumber(phone);
        user.setRole("USER");
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = repo.save(user);

        // Every newly registered customer gets a usable zero-balance savings account.
        Account account = new Account();
        account.setUser(saved);
        account.setAccountHolderName(saved.getFullName());
        account.setAccountType("SAVINGS");
        account.setAccountNumber(generateAccountNumber());
        account.setBalance(0.0);
        account.setActive(true);
        accountRepo.save(account);

        return "User registered successfully";
    }

    @Override
    public User getUserById(Integer id) {
        return repo.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Override
    public User getUserByEmail(String email) {
        User user = repo.findByEmail(email.trim().toLowerCase());
        if (user == null) throw new UserNotFoundException("User not found");
        return user;
    }

    @Override public List<User> getUsers() { return repo.findAll(); }

    @Override
    public User updateUser(Integer id, User user) {
        User current = repo.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));
        current.setFullName(user.getFullName());
        current.setEmail(user.getEmail().trim().toLowerCase());
        current.setPhoneNumber(user.getPhoneNumber().trim());
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            current.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        repo.save(current);
        return current;
    }

    @Override
    public void deleteUser(Integer id) {
        Optional<User> optional = repo.findById(id);
        if (optional.isEmpty()) throw new UserNotFoundException("User not found");
        repo.deleteById(id);
    }
}
