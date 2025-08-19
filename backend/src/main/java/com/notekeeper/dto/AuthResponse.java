package com.notekeeper.dto;

import java.time.LocalDateTime;

public class AuthResponse {

    private String token;
    private String email;
    private Long userId;
    private LocalDateTime expiresAt;

    // Constructors
    public AuthResponse() {}

    public AuthResponse(String token, String email, Long userId, LocalDateTime expiresAt) {
        this.token = token;
        this.email = email;
        this.userId = userId;
        this.expiresAt = expiresAt;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='" + (token != null ? token.substring(0, Math.min(token.length(), 20)) + "..." : null) + '\'' +
                ", email='" + email + '\'' +
                ", userId=" + userId +
                ", expiresAt=" + expiresAt +
                '}';
    }
}
