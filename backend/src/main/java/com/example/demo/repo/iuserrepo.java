package com.example.demo.repo;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface iuserrepo  extends JpaRepository<User,Integer> {
    public User findByEmail(String email);
    public User findByPhoneNumber(String phoneNumber);
    public List<User> findByRole(String role);
    public boolean existsByEmail(String email);
    public boolean existsByPhoneNumber(String phoneNumber);
}
