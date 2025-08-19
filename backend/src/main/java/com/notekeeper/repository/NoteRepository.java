package com.notekeeper.repository;

import com.notekeeper.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    
    Page<Note> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId, Pageable pageable);
    
    @Query("SELECT n FROM Note n WHERE n.owner.id = :ownerId AND " +
           "(LOWER(n.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY n.updatedAt DESC")
    Page<Note> findByOwnerIdAndSearchTerm(@Param("ownerId") Long ownerId, 
                                         @Param("searchTerm") String searchTerm,
                                         Pageable pageable);
    
    @Query("SELECT DISTINCT JSON_UNQUOTE(JSON_EXTRACT(n.tags, '$[*]')) FROM Note n WHERE n.owner.id = :ownerId")
    List<String> findDistinctTagsByOwnerId(@Param("ownerId") Long ownerId);
    
    boolean existsByIdAndOwnerId(Long id, Long ownerId);
}
