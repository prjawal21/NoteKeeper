import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState([]);
  const [lastCreatedNote, setLastCreatedNote] = useState(null);

  // Store notes in localStorage for persistence
  const getStoredNotes = () => {
    try {
      const stored = localStorage.getItem('notekeeper-notes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading stored notes:', error);
    }
    
    // Return default example notes
    return [
      {
        id: 'feature-showcase',
        title: 'Feature Showcase & Demo',
        content: '# 🚀 NoteKeeper Feature Showcase\n\nThis note demonstrates **every feature** available in NoteKeeper. Feel free to edit and experiment!\n\n## 📝 Text Formatting Examples\n\n### Basic Formatting\n- **Bold text** for emphasis\n- *Italic text* for subtle emphasis\n- ***Bold and italic*** for maximum impact\n- `inline code` for technical terms\n- ~~Strikethrough~~ for corrections\n\n### Headings Hierarchy\n# Heading 1 - Main Title\n## Heading 2 - Section\n### Heading 3 - Subsection\n\n## 📋 Lists and Structure\n\n### Unordered Lists\n- Main point one\n  - Sub-point A\n  - Sub-point B\n- Main point two\n- Main point three\n\n### Ordered Lists\n1. **Planning Phase**\n   - Research requirements\n   - Create wireframes\n2. **Development Phase**\n   - Set up environment\n   - Write code\n3. **Testing Phase**\n   - Unit tests\n   - Integration tests\n\n## 💻 Code Examples\n\n### JavaScript\n```javascript\nconst noteKeeper = {\n  features: ["markdown", "tags", "search", "privacy"],\n  createNote: (title, content) => {\n    return { title, content, createdAt: new Date() };\n  }\n};\n```\n\n### Python\n```python\ndef organize_notes(notes):\n    """Organize notes by tags"""\n    organized = {}\n    for note in notes:\n        for tag in note.tags:\n            if tag not in organized:\n                organized[tag] = []\n            organized[tag].append(note)\n    return organized\n```\n\n## 🎯 Advanced Features\n\n### Blockquotes\n> "The secret to getting ahead is getting started." - Mark Twain\n\n> **Important Note**: This is a multi-line blockquote\n> that can span several lines and contain\n> **formatted text** as well.\n\n### Tables (if supported)\n| Feature | Status | Priority |\n|---------|--------|----------|\n| Markdown | ✅ Done | High |\n| Tags | ✅ Done | High |\n| Search | ✅ Done | Medium |\n| Export | 🔄 WIP | Low |\n\n## 🔗 Links and References\n\n- [Markdown Guide](https://www.markdownguide.org/)\n- [NoteKeeper Documentation](#)\n- Internal note references work too!\n\n## 🎨 Styling Tips\n\n---\n\n**Horizontal rules** (above) help separate sections.\n\n### Emoji Usage\n- 📚 For learning and education\n- 💡 For ideas and inspiration\n- ⚡ For quick notes and reminders\n- 🔥 For important or urgent items\n\n---\n\n*This note showcases the full power of NoteKeeper. Try editing it, adding tags, or making it private to explore all features!*',
        tags: ['demo', 'features', 'markdown', 'examples', 'tutorial'],
        isPrivate: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  };
  
  const saveNotesToStorage = (notesToSave) => {
    try {
      localStorage.setItem('notekeeper-notes', JSON.stringify(notesToSave));
    } catch (error) {
      console.error('Error saving notes to storage:', error);
    }
  };

  const fetchNotes = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const storedNotes = getStoredNotes();
      console.log('Fetching notes from storage:', storedNotes.length, 'notes found');
      let fetchedNotes = storedNotes;
      
      // Filter by search term if provided
      if (search) {
        fetchedNotes = storedNotes.filter(note => 
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.content.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      setNotes(fetchedNotes);
      console.log('Notes state updated with:', fetchedNotes.length, 'notes');
    } catch (error) {
      console.error('Error fetching notes:', error);
      const defaultNotes = getStoredNotes();
      setNotes(defaultNotes);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNoteById = useCallback(async (id) => {
    // Handle example notes
    if (id === 'welcome-note' || id === 'feature-showcase') {
      const storedNotes = getStoredNotes();
      const note = storedNotes.find(n => n.id === id);
      if (note) {
        setCurrentNote(note);
        return note;
      }
    }
    
    // Clear current note for new notes
    if (id === 'new') {
      setCurrentNote(null);
      return null;
    }
    
    // Look for note in stored notes
    const storedNotes = getStoredNotes();
    const note = storedNotes.find(n => n.id === id);
    
    if (note) {
      setCurrentNote(note);
      return note;
    } else {
      // Note not found - likely deleted
      console.log('Note not found:', id);
      setCurrentNote(null);
      return null;
    }
  }, []);

  const createNote = useCallback(async (noteData) => {
    // Prevent creating duplicate notes with same content
    if (!noteData.title?.trim() && !noteData.content?.trim()) {
      return null;
    }
    
    // Check if a similar note already exists (same title and content)
    const existingNote = notes.find(note => 
      note.title === noteData.title && 
      note.content === noteData.content
    );
    
    if (existingNote) {
      setCurrentNote(existingNote);
      return existingNote;
    }
    
    // Create local note with unique ID
    const localNote = {
      ...noteData,
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedNotes = [localNote, ...notes];
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setCurrentNote(localNote);
    console.log('Local note created:', localNote.id);
    return localNote;
  }, [notes]);

  const updateNote = useCallback(async (id, noteData) => {
    try {
      const updatedNote = {
        ...noteData,
        id,
        updatedAt: new Date().toISOString()
      };
      
      const updatedNotes = notes.map(note => 
        note.id === id ? updatedNote : note
      );
      
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
      
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }
      
      console.log('Note updated successfully:', id);
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  }, [currentNote, notes]);

  const deleteNote = useCallback(async (id) => {
    try {
      // Don't allow deleting example notes
      if (id === 'welcome-note' || id === 'feature-showcase') {
        return false;
      }
      
      // Get current notes from localStorage
      const currentStoredNotes = getStoredNotes();
      
      // Check if note exists
      const noteExists = currentStoredNotes.some(note => note.id === id);
      if (!noteExists) {
        return false;
      }
      
      // Create new array without the deleted note
      const updatedNotes = currentStoredNotes.filter(note => note.id !== id);
      
      // Save to localStorage
      saveNotesToStorage(updatedNotes);
      
      // Update React state with the new notes array
      setNotes(updatedNotes);
      
      // Clear current note if it's the one being deleted
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
      
      return true;
    } catch (error) {
      console.error('💥 Error deleting note:', error);
      return false;
    }
  }, [currentNote, notes]);

  const fetchTags = useCallback(async () => {
    try {
      const response = await axios.get('/api/notes/tags');
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  useEffect(() => {
    // Initialize notes from localStorage on app start
    const storedNotes = getStoredNotes();
    setNotes(storedNotes);
  }, []);

  const value = {
    notes,
    currentNote,
    loading,
    searchTerm,
    tags,
    setSearchTerm,
    setCurrentNote,
    fetchNotes,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    fetchTags
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};
