package com.example.demo.service;

import com.example.demo.dto.UserResponse;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repo.iuserrepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final iuserrepo userRepository;

    public AdminService(iuserrepo userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    public UserResponse promoteToAdmin(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("User not found: " + id));
        user.setRole("ADMIN");
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse setUserActive(Integer id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("User not found: " + id));
        user.setActive(active);
        return toUserResponse(userRepository.save(user));
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setActive(user.getActive());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
