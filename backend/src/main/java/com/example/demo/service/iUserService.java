package com.example.demo.service;

import com.example.demo.entity.User;

import java.util.List;

public interface iUserService {
    public String RegisterUser(User user);
    public User getUserById(Integer  id);
    public User getUserByEmail(String email);
    public List<User> getUsers();
    public User updateUser(Integer id,User user);
    public void deleteUser(Integer id);

}
