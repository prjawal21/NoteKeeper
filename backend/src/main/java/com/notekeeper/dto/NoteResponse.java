package com.notekeeper.dto;

import java.time.LocalDateTime;
import java.util.List;

public class NoteResponse {

    private Long id;
    private String title;
    private String content;
    private List<String> tags;
    private Boolean isPrivate;
    private String password;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long ownerId;

    // Constructors
    public NoteResponse() {}

    public NoteResponse(Long id, String title, String content, List<String> tags, 
                       Boolean isPrivate, String password, LocalDateTime createdAt, LocalDateTime updatedAt, Long ownerId) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.isPrivate = isPrivate;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ownerId = ownerId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public Boolean getIsPrivate() {
        return isPrivate;
    }

    public void setIsPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    @Override
    public String toString() {
        return "NoteResponse{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", content='" + (content != null ? content.substring(0, Math.min(content.length(), 50)) + "..." : null) + '\'' +
                ", tags=" + tags +
                ", isPrivate=" + isPrivate +
                ", password=" + (password != null ? "[PROTECTED]" : "null") +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", ownerId=" + ownerId +
                '}';
    }
}
