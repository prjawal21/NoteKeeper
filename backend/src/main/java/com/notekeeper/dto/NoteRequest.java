package com.notekeeper.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class NoteRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;

    private String content;

    private List<String> tags;

    private Boolean isPrivate = false;

    private String password;

    // Constructors
    public NoteRequest() {}

    public NoteRequest(String title, String content, List<String> tags, Boolean isPrivate, String password) {
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.isPrivate = isPrivate;
        this.password = password;
    }

    // Getters and Setters
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

    @Override
    public String toString() {
        return "NoteRequest{" +
                "title='" + title + '\'' +
                ", content='" + (content != null ? content.substring(0, Math.min(content.length(), 50)) + "..." : null) + '\'' +
                ", tags=" + tags +
                ", isPrivate=" + isPrivate +
                ", password=" + (password != null ? "[PROTECTED]" : "null") +
                '}';
    }
}
