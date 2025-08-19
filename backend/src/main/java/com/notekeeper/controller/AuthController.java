package com.notekeeper.controller;

import com.notekeeper.dto.AuthRequest;
import com.notekeeper.dto.AuthResponse;
import com.notekeeper.dto.ErrorResponse;
import com.notekeeper.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            logger.error("Invalid registration request: missing email or password");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Email and password are required"));
        }
        logger.info("Received registration request for email: {}", request.getEmail());
        try {
            AuthResponse response = userService.register(request);
            logger.info("Registration successful for email: {}", request.getEmail());
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            logger.error("Registration failed with RuntimeException: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Registration failed with unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new ErrorResponse("Registration failed. Please try again."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Login failed. Please try again."));
        }
    }
}
