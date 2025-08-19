package com.notekeeper.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.notekeeper.dto.NoteRequest;
import com.notekeeper.dto.NoteResponse;
import com.notekeeper.entity.Note;
import com.notekeeper.entity.User;
import com.notekeeper.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    public Page<NoteResponse> getAllNotesByUser(Long userId, Pageable pageable) {
        Page<Note> notes = noteRepository.findByOwnerIdOrderByUpdatedAtDesc(userId, pageable);
        return notes.map(this::convertToResponse);
    }

    public Page<NoteResponse> searchNotes(Long userId, String searchTerm, Pageable pageable) {
        Page<Note> notes;
        
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            notes = noteRepository.findByOwnerIdAndSearchTerm(userId, searchTerm, pageable);
        } else {
            notes = noteRepository.findByOwnerIdOrderByUpdatedAtDesc(userId, pageable);
        }
        
        return notes.map(this::convertToResponse);
    }

    public NoteResponse getNoteById(Long noteId, Long userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        return convertToResponse(note);
    }

    public NoteResponse createNote(NoteRequest request, Long userId) {
        User user = userService.findById(userId);
        
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setOwner(user);
        note.setIsPrivate(request.getIsPrivate());
        note.setPassword(request.getPassword());
        
        if (request.getTags() != null) {
            try {
                note.setTags(objectMapper.writeValueAsString(request.getTags()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error processing tags", e);
            }
        }
        
        Note savedNote = noteRepository.save(note);
        return convertToResponse(savedNote);
    }

    public NoteResponse updateNote(Long noteId, NoteRequest request, Long userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setIsPrivate(request.getIsPrivate());
        note.setPassword(request.getPassword());
        
        if (request.getTags() != null) {
            try {
                note.setTags(objectMapper.writeValueAsString(request.getTags()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error processing tags", e);
            }
        }
        
        Note updatedNote = noteRepository.save(note);
        return convertToResponse(updatedNote);
    }

    public void deleteNote(Long noteId, Long userId) {
        if (!noteRepository.existsByIdAndOwnerId(noteId, userId)) {
            throw new RuntimeException("Note not found or access denied");
        }
        
        noteRepository.deleteById(noteId);
    }

    public List<String> getTagsByUserId(Long userId) {
        return noteRepository.findDistinctTagsByOwnerId(userId);
    }

    private NoteResponse convertToResponse(Note note) {
        List<String> tags = null;
        if (note.getTags() != null) {
            try {
                tags = objectMapper.readValue(note.getTags(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                tags = new ArrayList<>();
            }
        }
        
        return new NoteResponse(
            note.getId(),
            note.getTitle(),
            note.getContent(),
            tags,
            note.getIsPrivate(),
            note.getPassword(),
            note.getCreatedAt(),
            note.getUpdatedAt(),
            note.getOwner().getId()
        );
    }
}
