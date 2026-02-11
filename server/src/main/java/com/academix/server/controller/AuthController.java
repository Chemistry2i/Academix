package com.academix.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.academix.server.service.UserService;
import com.academix.server.model.Student; 
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    // In-memory storage for testing (replace with database in production)
    private Map<String, Student> userStorage = new HashMap<>();
    private Long userIdCounter = 1L;
    
    /**
     * User Registration with Password Hashing - FOR TESTING
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody Student student) {
        try {
            // Check if email already exists
            if (userStorage.values().stream().anyMatch(u -> u.getEmail().equals(student.getEmail()))) {
                return ResponseEntity.badRequest().body("Email already exists!");
            }
            
            // Set ID for testing
            student.setId(userIdCounter++);
            
            // Hash the password before saving
            userService.prepareUserForSaving(student);
            
            // Store in memory for testing
            userStorage.put(student.getEmail(), student);
            
            // Return success with user info (password excluded by @JsonIgnore)
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully!");
            response.put("userId", student.getId());
            response.put("email", student.getEmail());
            response.put("fullName", student.getFullName());
            response.put("passwordHashed", student.getPassword() != null && student.getPassword().startsWith("$2"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
    
    /**
     * User Login with Password Verification - FOR TESTING
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            // Find user by email
            Student user = userStorage.get(loginRequest.getEmail());
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found!");
            }
            
            // Verify password
            if (userService.verifyPassword(loginRequest.getPassword(), user.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful!");
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("fullName", user.getFullName());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Invalid password!");
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage());
        }
    }
    
    /**
     * Change Password - FOR TESTING
     */
    @PutMapping("/change-password/{userId}")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, 
                                          @RequestBody ChangePasswordRequest request) {
        try {
            // Find user by ID
            Student user = userStorage.values().stream()
                .filter(u -> u.getId().equals(userId))
                .findFirst()
                .orElse(null);
                
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found!");
            }
            
            // Verify old password first
            if (userService.verifyPassword(request.getOldPassword(), user.getPassword())) {
                userService.updatePassword(user, request.getNewPassword());
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Password changed successfully!");
                response.put("userId", user.getId());
                response.put("passwordHashed", user.getPassword().startsWith("$2"));
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Old password is incorrect!");
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Password change failed: " + e.getMessage());
        }
    }
    
    /**
     * Get all registered users - FOR TESTING ONLY
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", userStorage.size());
        response.put("users", userStorage.values().stream()
            .map(user -> {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("email", user.getEmail());
                userData.put("fullName", user.getFullName());
                userData.put("district", user.getDistrict());
                userData.put("isActive", user.getIsActive());
                return userData;
            }).toList());
        return ResponseEntity.ok(response);
    }
    
    // DTOs for request bodies
    public static class LoginRequest {
        private String email;
        private String password;
        
        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
        
        // Getters and setters
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}