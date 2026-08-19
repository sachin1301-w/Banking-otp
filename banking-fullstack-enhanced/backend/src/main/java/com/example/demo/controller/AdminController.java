package com.example.demo.controller;

import com.example.demo.dto.UserResponse;
import com.example.demo.service.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @PatchMapping("/users/{id}/promote")
    public UserResponse promoteToAdmin(@PathVariable Integer id) {
        return adminService.promoteToAdmin(id);
    }

    @PatchMapping("/users/{id}/deactivate")
    public UserResponse deactivateUser(@PathVariable Integer id) {
        return adminService.setUserActive(id, false);
    }

    @PatchMapping("/users/{id}/activate")
    public UserResponse activateUser(@PathVariable Integer id) {
        return adminService.setUserActive(id, true);
    }
}
