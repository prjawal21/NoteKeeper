package com.notekeeper.controller;

import com.notekeeper.dto.NoteRequest;
import com.notekeeper.dto.NoteResponse;
import com.notekeeper.security.JwtUtil;
import com.notekeeper.service.NoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
@CrossOrigin(origins = "*")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<Page<NoteResponse>> getAllNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {
        
        String token = extractToken(request);
        Long userId = jwtUtil.extractUserId(token);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<NoteResponse> notes = noteService.searchNotes(userId, search, pageable);
        
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteResponse> getNoteById(@PathVariable Long id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            Long userId = jwtUtil.extractUserId(token);
            
            NoteResponse note = noteService.getNoteById(id, userId);
            return ResponseEntity.ok(note);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(@Valid @RequestBody NoteRequest request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            Long userId = jwtUtil.extractUserId(token);
            
            NoteResponse note = noteService.createNote(request, userId);
            return ResponseEntity.ok(note);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request,
            HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            Long userId = jwtUtil.extractUserId(token);
            
            NoteResponse note = noteService.updateNote(id, request, userId);
            return ResponseEntity.ok(note);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id, HttpServletRequest request) {
        try {
            String token = extractToken(request);
            Long userId = jwtUtil.extractUserId(token);
            
            noteService.deleteNote(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/tags")
    public ResponseEntity<List<String>> getTags(HttpServletRequest request) {
        try {
            String token = extractToken(request);
            Long userId = jwtUtil.extractUserId(token);
            
            List<String> tags = noteService.getTagsByUserId(userId);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        throw new RuntimeException("Invalid token");
    }
}
