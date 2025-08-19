import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { 
  Save, 
  Eye, 
  Edit,
  Check,
  Lock, 
  Unlock,
  Bold,
  Italic,
  Underline,
  List,
  Quote,
  Plus,
  Shield,
  Type,
  Heading1,
  Heading2,
  ListOrdered
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CustomNotification from './CustomNotification';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNote, fetchNoteById, createNote, updateNote } = useNotes();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedFont, setSelectedFont] = useState('inter');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notePassword, setNotePassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  // Private note states
  const [tempPassword, setTempPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isNoteLocked, setIsNoteLocked] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error', ''
  const [notification, setNotification] = useState(null);
  const [activeFormats, setActiveFormats] = useState(new Set());
  // List modes (Markdown-like helpers)
  const [isBulletListMode, setIsBulletListMode] = useState(false);
  const [isNumberListMode, setIsNumberListMode] = useState(false);
  const [orderedCounter, setOrderedCounter] = useState(1);
  
  const textareaRef = useRef(null);

  const fonts = [
    { value: 'helvetica', label: 'Helvetica', description: 'Classic sans-serif' },
    { value: 'arial', label: 'Arial', description: 'Standard sans-serif' },
    { value: 'roboto', label: 'Roboto', description: 'Modern, clean sans' },
    { value: 'open-sans', label: 'Open Sans', description: 'Friendly sans-serif' },
    { value: 'lato', label: 'Lato', description: 'Semi-rounded sans' },
    { value: 'montserrat', label: 'Montserrat', description: 'Geometric sans' },
    { value: 'poppins', label: 'Poppins', description: 'Geometric, clean' },
    { value: 'times-new-roman', label: 'Times New Roman', description: 'Classic serif' },
    { value: 'georgia', label: 'Georgia', description: 'Elegant serif' },
    { value: 'futura', label: 'Futura', description: 'Modern geometric' }
  ];

  // Reset function to clear all note state
  const resetNote = useCallback(() => {
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
    setNotePassword('');
    setIsPrivate(false);
    setIsNoteLocked(false);
    setSaved(false);
    setActiveFormats(new Set());
    setIsBulletListMode(false);
    setIsNumberListMode(false);
    setOrderedCounter(1);
    setSaveStatus('');
    
    // Reset the contentEditable div
    if (textareaRef.current) {
      textareaRef.current.innerHTML = '';
      textareaRef.current.focus();
    }
  }, []);

  // Handle note loading and state management
  useEffect(() => {
    const loadNote = async () => {
      // Reset state for new note
      if (id === 'new') {
        resetNote();
        return;
      }
      
      // Load existing note
      const note = await fetchNoteById(id);
      if (!note) return;
      
      // Always set the title
      setTitle(note.title || '');
      
      // Handle private note logic
      if (note.isPrivate && note.password) {
        // Private note - lock it
        setIsPrivate(true);
        setIsNoteLocked(true);
        setNotePassword(note.password);
        // Clear content when locked
        setContent('');
        setTags([]);
        // Clear contentEditable div
        if (textareaRef.current) {
          textareaRef.current.innerHTML = '';
        }
      } else {
        // Public note
        setIsPrivate(false);
        setIsNoteLocked(false);
        setNotePassword('');
        // Only set content if it's not a private note
        setContent(note.content || '');
        setTags(note.tags || []);
        setSaved(true);
        
        // Update contentEditable div for public notes only
        if (textareaRef.current) {
          textareaRef.current.innerHTML = note.content || '';
        }
      }
    };
    
    loadNote();
  }, [id, fetchNoteById, resetNote]);
  
  // Add effect to handle route changes
  useEffect(() => {
    // This will run when the component mounts or when the id changes
    if (id === 'new') {
      resetNote();
    }
  }, [id, resetNote]);

  useEffect(() => {
    // Mark as unsaved when content changes
    if (title || content) {
      setSaved(false);
    } else {
      setSaved(true);
    }
  }, [title, content, tags, isPrivate]);

  const handleSave = async (isManualSave = false) => {
    if (!title.trim()) {
      if (isManualSave) {
        setSaveStatus('error');
        setNotification({ message: 'Failed to save note', type: 'error' });
        setTimeout(() => setSaveStatus(''), 2000);
      }
      return;
    }

    setLoading(true);
    if (isManualSave) setSaveStatus('saving');
    
    try {
      const noteData = {
        title: title.trim(),
        content,
        tags,
        isPrivate,
        password: isPrivate ? notePassword : ''
      };

      if (id) {
        await updateNote(id, noteData);
        if (isManualSave) {
          setSaveStatus('saved');
          setNotification({ message: 'Note saved successfully', type: 'success' });
          setTimeout(() => setSaveStatus(''), 2000);
        }
      } else {
        const newNote = await createNote(noteData);
        if (newNote) {
          navigate(`/dashboard/note/${newNote.id}`);
          if (isManualSave) {
            setSaveStatus('saved');
            setNotification({ message: 'Note saved successfully', type: 'success' });
            setTimeout(() => setSaveStatus(''), 2000);
          }
        }
      }
      setSaved(true);
    } catch (error) {
      console.error('Save error:', error);
      if (isManualSave) {
        setSaveStatus('error');
        setNotification({ message: 'Failed to save note', type: 'error' });
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      e.preventDefault();
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'tagInput') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const applyFormatting = (command, value = null) => {
    if (!textareaRef.current) return;
    textareaRef.current.focus();

    // Smooth formatting: wrap in requestAnimationFrame to allow CSS transitions
    window.requestAnimationFrame(() => {
      if (value !== null) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false, null);
      }

      const normalized = textareaRef.current.innerHTML
        .replace(/&nbsp;/g, ' ')
        .replace(/<div><br><\/div>/g, '<br>');
      textareaRef.current.innerHTML = normalized;
      setContent(normalized);
      updateActiveFormats();
    });
  };

  const updateActiveFormats = () => {
    const formats = new Set();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    
    // Check for blockquote and headers
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let node = selection.anchorNode;
      while (node && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.parentNode;
      }
      while (node && node !== textareaRef.current) {
        if (node.tagName === 'BLOCKQUOTE') {
          formats.add('quote');
        }
        if (node.tagName === 'H1') {
          formats.add('h1');
        }
        if (node.tagName === 'H2') {
          formats.add('h2');
        }
        node = node.parentNode;
      }
    }
    
    setActiveFormats(formats);
  };

  const insertBulletList = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        document.execCommand('insertText', false, '- ');
        const newContent = textareaRef.current.innerHTML;
        setContent(newContent);
      }
    }
  };

  const insertNumberedList = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        document.execCommand('insertText', false, '1. ');
        const newContent = textareaRef.current.innerHTML;
        setContent(newContent);
      }
    }
  };

  const toggleQuote = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      if (activeFormats.has('quote')) {
        // Remove blockquote
        applyFormatting('formatBlock', 'div');
      } else {
        // Add blockquote with italic formatting
        applyFormatting('formatBlock', 'blockquote');
        setTimeout(() => {
          applyFormatting('italic');
        }, 10);
      }
    }
  };

  const toggleH1 = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      if (activeFormats.has('h1')) {
        // Remove H1
        applyFormatting('formatBlock', 'div');
      } else {
        // Add H1 with bold formatting
        applyFormatting('formatBlock', 'h1');
        setTimeout(() => {
          applyFormatting('bold');
        }, 10);
      }
    }
  };

  const toggleH2 = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      if (activeFormats.has('h2')) {
        // Remove H2
        applyFormatting('formatBlock', 'div');
      } else {
        // Add H2 with bold formatting
        applyFormatting('formatBlock', 'h2');
        setTimeout(() => {
          applyFormatting('bold');
        }, 10);
      }
    }
  };

  const insertText = (text) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      document.execCommand('insertText', false, text);
      const newContent = textareaRef.current.innerHTML;
      setContent(newContent);
    }
  };

  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormatting('underline');
          break;
        default:
          break;
      }
    }
    
    // Handle Enter key for lists: continue list when cursor is at end of a list item
    if (e.key === 'Enter') {
      // Only handle list modes if they're active
      if (isBulletListMode) {
        e.preventDefault();
        document.execCommand('insertText', false, '\n- ');
        setTimeout(updateActiveFormats, 0);
        return;
      }
      if (isNumberListMode) {
        e.preventDefault();
        const next = orderedCounter;
        document.execCommand('insertText', false, `\n${next}. `);
        setOrderedCounter(next + 1);
        setTimeout(updateActiveFormats, 0);
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const container = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer;

      // Continue unordered list
      if (container.closest('ul')) {
        // Let browser insert new li, then ensure an li exists
        setTimeout(() => {
          const li = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer;
          if (!li || li.tagName !== 'LI') {
            document.execCommand('insertUnorderedList');
          }
          updateActiveFormats();
        }, 0);
        return;
      }

      // Continue ordered list
      if (container.closest('ol')) {
        setTimeout(() => {
          const li = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer;
          if (!li || li.tagName !== 'LI') {
            document.execCommand('insertOrderedList');
          }
          updateActiveFormats();
        }, 0);
        return;
      }

      // Markdown-style lists fallback
      const line = container.textContent || '';
      const bulletMatch = line.match(/^(\s*)-\s.*$/);
      const numMatch = line.match(/^(\s*)(\d+)\.\s.*$/);
      if (bulletMatch) {
        e.preventDefault();
        const indent = bulletMatch[1];
        document.execCommand('insertText', false, '\n' + indent + '- ');
        return;
      }
      if (numMatch) {
        e.preventDefault();
        const indent = numMatch[1];
        const next = parseInt(numMatch[2], 10) + 1;
        document.execCommand('insertText', false, `\n${indent}${next}. `);
        return;
      }
    }
  };

  const makeNotePublic = async () => {
    if (!tempPassword) {
      setPasswordError('Please enter a password');
      return;
    }

    try {
      setIsProcessing(true);
      
      if (tempPassword === notePassword) {
        // Update the note to be public
        await updateNote(id, {
          ...currentNote,
          isPrivate: false,
          password: ''
        });
        
        // Update local state
        setIsPrivate(false);
        setNotePassword('');
        setShowUnlockDialog(false);
        setTempPassword('');
        
        setNotification({ 
          message: 'Note is now public', 
          type: 'success',
          duration: 2000
        });
      } else {
        throw new Error('Incorrect password');
      }
    } catch (error) {
      setPasswordError('Incorrect password. Please try again.');
      setTempPassword('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrivateToggle = async () => {
    if (isProcessing) return;
    
    if (!isPrivate) {
      // Turning on private mode - ask for password
      setShowPasswordDialog(true);
      setPasswordError('');
      setTempPassword('');
      setConfirmPassword('');
    } else {
      // When turning off private mode, show unlock dialog first for confirmation
      setShowUnlockDialog(true);
      setTempPassword('');
      setPasswordError('');
      setNotification({ 
        message: 'Please enter the password to make this note public', 
        type: 'info',
        duration: 5000
      });
      
      // Store the current content before locking
      const currentContent = textareaRef.current?.innerHTML || '';
      
      // Update the note with the current content before showing the unlock dialog
      if (id && id !== 'new') {
        try {
          await updateNote(id, {
            title,
            content: currentContent,
            tags,
            isPrivate: true,
            password: notePassword
          });
        } catch (error) {
          console.error('Failed to save before locking:', error);
          setNotification({
            message: 'Failed to save note before locking',
            type: 'error',
            duration: 3000
          });
        }
      }
    }
  };

  const handlePasswordSet = async () => {
    // Reset any previous errors
    setPasswordError('');
    
    // Validate password
    if (tempPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters long');
      return;
    }
    
    if (tempPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Update local state
      setNotePassword(tempPassword);
      setIsPrivate(true);
      setIsNoteLocked(true);
      
      // Update the note with the new password
      if (id && id !== 'new') {
        await updateNote(id, {
          title,
          content,
          tags,
          isPrivate: true,
          password: tempPassword
        });
      }
      
      // Reset and notify
      setShowPasswordDialog(false);
      setTempPassword('');
      setConfirmPassword('');
      setNotification({ 
        message: 'Note is now private and secured', 
        type: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to set password:', error);
      setPasswordError('Failed to secure note. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const lockNote = () => {
    if (isPrivate && notePassword) {
      setIsNoteLocked(true);
      // Clear the content when locking
      setContent('');
      // Clear the contentEditable div
      if (textareaRef.current) {
        textareaRef.current.innerHTML = '';
      }
    }
  };

  const handleUnlockNote = async () => {
    if (!tempPassword) {
      setPasswordError('Please enter a password');
      return;
    }

    try {
      setIsProcessing(true);
      
      if (tempPassword === notePassword) {
        // Just unlock the note without changing its private status
        setIsNoteLocked(false);
        setShowUnlockDialog(false);
        setTempPassword('');
        
        // Fetch the note content again to ensure we have the latest
        const note = await fetchNoteById(id);
        if (note) {
          setContent(note.content || '');
          setTags(note.tags || []);
          // Update contentEditable div
          if (textareaRef.current) {
            textareaRef.current.innerHTML = note.content || '';
          }
        }
        
        setNotification({ 
          message: 'Note unlocked', 
          type: 'success',
          duration: 2000
        });
      } else {
        throw new Error('Incorrect password');
      }
    } catch (error) {
      setPasswordError('Incorrect password. Please try again.');
      setTempPassword('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync content with contentEditable div
  useEffect(() => {
    if (textareaRef.current && !isPreview) {
      // Apply current font when not in preview mode
      if (selectedFont) {
        textareaRef.current.style.fontFamily = getFontClass(selectedFont);
      }
    }
  }, [isPreview, selectedFont]);

  // Handle font dropdown and outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close font dropdown when clicking outside
      if (showFontDropdown && !event.target.closest('.font-dropdown-container')) {
        setShowFontDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFontDropdown]);

  // Handle font selection and apply to editor
  useEffect(() => {
    if (textareaRef.current) {
      const fontClass = getFontClass(selectedFont);
      const fontFamily = getFontFamily(selectedFont);
      const editor = textareaRef.current;
      
      // Save current selection
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      
      // Apply font to the editor
      editor.style.fontFamily = fontFamily;
      
      // If there's selected text, apply the font to the selection
      if (range && !range.collapsed) {
        document.execCommand('fontName', false, fontFamily);
      }
      
      // Restore selection if possible
      if (range) {
        try {
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          console.error('Error restoring selection:', e);
        }
      }
    }
  }, [selectedFont]);

  // Removed extra syncing effect to avoid caret resets during typing

  // Toggle between preview and edit modes
  const togglePreview = () => {
    if (!isPreview) {
      // Save current content before switching to preview
      setContent(textareaRef.current?.innerHTML || '');
    }
    setIsPreview(!isPreview);
  };

  // Close font dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFontDropdown && !event.target.closest('.font-dropdown-container')) {
        setShowFontDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFontDropdown]);

  // Get font class for the editor
  const getFontClass = (fontValue) => {
    const fontMap = {
      'helvetica': 'font-sans',
      'arial': 'font-sans',
      'roboto': 'font-sans',
      'open-sans': 'font-sans',
      'lato': 'font-sans',
      'montserrat': 'font-sans',
      'poppins': 'font-sans',
      'times-new-roman': 'font-serif',
      'georgia': 'font-serif',
      'futura': 'font-sans'
    };
    return fontMap[fontValue] || 'font-sans';
  };
  
  // Get font family style for inline application
  const getFontFamily = (fontValue) => {
    const fontMap = {
      'helvetica': '"Helvetica Neue", Arial, sans-serif',
      'arial': 'Arial, sans-serif',
      'roboto': '"Roboto", Arial, sans-serif',
      'open-sans': '"Open Sans", Arial, sans-serif',
      'lato': '"Lato", Arial, sans-serif',
      'montserrat': '"Montserrat", Arial, sans-serif',
      'poppins': '"Poppins", Arial, sans-serif',
      'times-new-roman': '"Times New Roman", Times, serif',
      'georgia': 'Georgia, serif',
      'futura': 'Futura, Arial, sans-serif'
    };
    return fontMap[fontValue] || 'Arial, sans-serif';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>{content ? (content.match(/<p>|<div>|<h[1-6]>|<li>/g) || ['']).length : 1} lines</span>
          <span>Font: {fonts.find(f => f.value === selectedFont)?.label}</span>
          {isPrivate && (
            <span className="text-red-500 flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              Protected
            </span>
          )}
        </div>
        <div>
          Last updated: {currentNote?.updatedAt ? new Date(currentNote.updatedAt).toLocaleString() : 'Never'}
        </div>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrivateToggle}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isPrivate 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' 
                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {isPrivate ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{isPrivate ? 'Make Public' : 'Make Private'}</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              loading
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : saved
                ? 'bg-gray-600 dark:bg-gray-700 text-white dark:text-gray-300'
                : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Saving...' : saved ? 'Saved' : 'Save'}</span>
          </button>
          
        </div>
      </div>
 
      {/* Tags */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            name="tagInput"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-inter"
          />
          <button
            onClick={handleAddTag}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Add tag"
          >
            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-red-600 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
 
      {/* Formatting Toolbar */}
      {!isNoteLocked && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
          <div className="flex items-center justify-between">
            {/* Left: Font family and headings */}
            <div className="flex items-center space-x-2">
              {/* Font Family Dropdown */}
              <div className="relative font-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFontDropdown(!showFontDropdown);
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
                >
                  <Type className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Font</div>
                    <div className="font-medium truncate">
                      {fonts.find(f => f.value === selectedFont)?.label || 'Select font'}
                    </div>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${
                      showFontDropdown ? 'rotate-180' : ''
                    }`} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </button>
                {showFontDropdown && (
                  <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 max-h-72 overflow-y-auto">
                    {fonts.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => {
                          setSelectedFont(font.value);
                          setShowFontDropdown(false);
                          textareaRef.current?.focus();
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          selectedFont === font.value
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-medium">{font.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{font.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

              {/* Headings */}
              <button
                onClick={() => applyFormatting('formatBlock', '<h1>')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  activeFormats.has('h1') ? 'bg-gray-200 dark:bg-gray-700 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Heading 1"
              >
                H1
              </button>
              <button
                onClick={() => applyFormatting('formatBlock', '<h2>')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  activeFormats.has('h2') ? 'bg-gray-200 dark:bg-gray-700 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Heading 2"
              >
                H2
              </button>
            </div>

            {/* Center: Inline formatting */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => applyFormatting('bold')}
                className={`p-1.5 rounded transition-all duration-150 ease-out ${
                  activeFormats.has('bold') ? 'bg-gray-200 dark:bg-gray-700 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => applyFormatting('italic')}
                className={`p-1.5 rounded transition-all duration-150 ease-out ${
                  activeFormats.has('italic') ? 'bg-gray-200 dark:bg-gray-700 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => applyFormatting('underline')}
                className={`p-1.5 rounded transition-all duration-150 ease-out ${
                  activeFormats.has('underline') ? 'bg-gray-200 dark:bg-gray-700 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Right: Lists and quote */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const wasActive = isBulletListMode;
                  setIsBulletListMode(!wasActive);
                  setIsNumberListMode(false);
                  
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                    if (!wasActive) {
                      document.execCommand('insertText', false, '- ');
                    }
                  }
                  
                  if (wasActive) {
                    // Exit list mode
                    setOrderedCounter(1);
                  }
                }}
                className={`p-1.5 rounded transition-all duration-200 ${isBulletListMode ? 'bg-gray-200 dark:bg-gray-700 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Bullet List (-)"
              >
                <List className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => {
                  const wasActive = isNumberListMode;
                  setIsNumberListMode(!wasActive);
                  setIsBulletListMode(false);
                  
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                    if (!wasActive) {
                      const counter = orderedCounter;
                      document.execCommand('insertText', false, `${counter}. `);
                      setOrderedCounter(counter + 1);
                    }
                  }
                  
                  if (wasActive) {
                    // Reset counter when turning off
                    setOrderedCounter(1);
                  }
                }}
                className={`p-1.5 rounded transition-all duration-200 ${isNumberListMode ? 'bg-gray-200 dark:bg-gray-700 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Numbered List (1., 2., 3., ...)"
              >
                <ListOrdered className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => applyFormatting('formatBlock', '<blockquote>')}
                className={`p-1.5 rounded transition-all duration-200 ${
                  activeFormats.has('quote') ? 'bg-gray-200 dark:bg-gray-700 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Quote"
              >
                <Quote className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toggle Buttons */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-4 pt-2 pb-1 border-b border-gray-200 dark:border-gray-800">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (!isPreview) return;
                setIsPreview(false);
                // Focus the editor when switching to write mode
                setTimeout(() => {
                  if (textareaRef.current) {
                    // Restore editor content when switching back to write mode
                    textareaRef.current.innerHTML = content || '';
                    textareaRef.current.focus();
                  }
                }, 0);
              }}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                !isPreview 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              disabled={isNoteLocked}
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Write
            </button>
            <button
              onClick={() => {
                if (isPreview) return;
                // Save content before switching to preview
                const newContent = textareaRef.current?.innerHTML || '';
                setContent(newContent);
                setIsPreview(true);
              }}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isPreview 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              disabled={isNoteLocked}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Preview
            </button>
          </div>
        </div>
        
        {/* Editor/Preview Content */}
        <div className="flex-1 overflow-auto p-4">
        {isNoteLocked ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">This note is locked</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
              This is a private note. Please enter the password to view and edit its contents.
            </p>
            <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
              <input
                type="password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleUnlockNote()}
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
              )}
              <button
                onClick={handleUnlockNote}
                disabled={!tempPassword}
                className="w-full flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Unlock className="w-5 h-5 mr-2" />
                Unlock Note
              </button>
            </div>
          </div>
        ) : isPreview ? (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="h-full">
            <div
              ref={textareaRef}
              contentEditable
              suppressContentEditableWarning={true}
              dir="ltr"
              onInput={(e) => {
                const newContent = e.target.innerHTML;
                setContent(newContent === '<br>' ? '' : newContent);
                updateActiveFormats();
              }}
              onMouseUp={updateActiveFormats}
              onKeyUp={updateActiveFormats}
              onKeyDown={handleKeyDown}
              onPaste={(e) => {
                // Handle paste to maintain text direction
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
              }}
              className={`w-full h-full p-4 resize-none bg-transparent border-none outline-none text-gray-900 dark:text-white ${getFontClass(selectedFont)} prose prose-lg max-w-none dark:prose-invert rich-text-editor`}
              style={{
                minHeight: 'calc(100vh - 200px)',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                direction: 'ltr',
                unicodeBidi: 'isolate',
                textAlign: 'left'
              }}
              data-placeholder="Start writing your note..."
            />
          </div>
        )}
      </div>
      </div>

      {/* Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-96 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Set Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setTempPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setIsPrivate(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This note is password protected
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Create Password
                </label>
                <input
                  type="password"
                  value={tempPassword}
                  onChange={(e) => {
                    setTempPassword(e.target.value);
                    setPasswordError(''); // Clear error when typing
                  }}
                  placeholder="Create Password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError(''); // Clear error when typing
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSet()}
                  placeholder="Confirm Password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setTempPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setIsPrivate(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSet}
                disabled={tempPassword.length < 4}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  tempPassword.length >= 4
                    ? 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                Make Private
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Unlock Dialog */}
      {showUnlockDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {isPrivate ? 'Make Note Public' : 'Unlock Private Note'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {isPrivate 
                ? 'Enter the password to make this note public.'
                : 'This note is locked. Enter the password to unlock it.'
              }
            </p>
            <input
              type="password"
              value={tempPassword}
              onChange={(e) => {
                setTempPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && (isPrivate ? makeNotePublic() : handleUnlockNote())}
              autoFocus
            />
            {passwordError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUnlockDialog(false);
                  setTempPassword('');
                  setPasswordError('');
                }}
                disabled={isProcessing}
                className={`px-4 py-2 ${isProcessing ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={isPrivate ? makeNotePublic : handleUnlockNote}
                disabled={isProcessing || !tempPassword}
                className={`px-4 py-2 rounded-md text-white ${isProcessing || !tempPassword ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : isPrivate ? 'Make Public' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Notification */}
      {notification && (
        <CustomNotification
          key={`${notification.message}-${Date.now()}`}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default NoteEditor;