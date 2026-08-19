package com.example.demo.security;

import com.example.demo.entity.User;
import com.example.demo.repo.iuserrepo;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final iuserrepo repo;

    public CustomUserDetailsService(iuserrepo repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = repo.findByEmail(username.trim().toLowerCase());

        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        return new CustomUserDetails(user);
    }
}