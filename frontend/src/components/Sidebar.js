import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { AuthContext } from '../contexts/AuthContext';
import { Search, Plus, Settings as SettingsIcon, LogOut, Trash2, Sun, Moon } from 'lucide-react';
import Settings from './Settings';

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hoveredNote, setHoveredNote] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  const { notes, loading, deleteNote, setCurrentNote, fetchNotes } = useNotes();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id: currentNoteId } = useParams();

  // Fetch notes when the component mounts or when search term changes
  useEffect(() => {
    fetchNotes(searchTerm);
  }, [searchTerm, fetchNotes]);

  const handleNewNote = () => {
    setCurrentNote(null);
    navigate('/dashboard/note/new');
  };

  const handleNoteClick = (noteId) => {
    navigate(`/dashboard/note/${noteId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showNotification = (message, bgClasses, iconPath) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm ${bgClasses}`;
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="${iconPath}" clip-rule="evenodd"></path>
      </svg>
      <span class="flex-1 text-sm font-medium">${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      if (noteId === 'welcome-note' || noteId === 'feature-showcase') {
        showNotification(
          'Example notes cannot be deleted',
          'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
          'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
        );
        return;
      }
      
      const success = await deleteNote(noteId);
      setShowDeleteModal(false);
      setNoteToDelete(null);
      
      if (success) {
        // Always navigate to dashboard after successful deletion
        navigate('/dashboard');
        
        showNotification(
          'Note deleted successfully',
          'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
          'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
        );
      } else {
        showNotification(
          'Failed to delete note',
          'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
          'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
        );
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setShowDeleteModal(false);
      setNoteToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (noteToDelete) {
      await handleDeleteNote(noteToDelete);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setNoteToDelete(null);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white font-inter">NoteKeeper</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
          Welcome, {user?.email?.split('@')[0]}!
        </p>
      </div>

      {/* New Note Button */}
      <div className="p-4">
        <button
          onClick={handleNewNote}
          className="w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium font-inter"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-inter"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-4">
        {filteredNotes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm font-inter">
            {searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentNoteId === note.id?.toString()
                    ? 'bg-gray-100 dark:bg-gray-800 shadow-sm'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleNoteClick(note.id)}
                onMouseEnter={() => setHoveredNote(note.id)}
                onMouseLeave={() => setHoveredNote(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm truncate font-inter ${
                      currentNoteId === note.id?.toString()
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {note.isPrivate && (
                        <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                      )}
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className={`text-xs mt-1 line-clamp-2 font-inter ${
                      currentNoteId === note.id?.toString()
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {note.isPrivate ? (
                        <span className="text-yellow-600 dark:text-yellow-400">🔒 Private Note</span>
                      ) : note.content ? (
                        note.content
                          .replace(/<[^>]*>?/gm, '')
                          .replace(/&[a-z0-9]+;/gi, '')
                          .replace(/[^\x00-\x7F]/g, '')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .substring(0, 60)
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No content</span>
                      )}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-inter">
                        {new Date(note.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-inter"
                          >
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-inter">+{note.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {hoveredNote === note.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note.id);
                        setShowDeleteModal(true);
                      }}
                      className="ml-2 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group-hover:opacity-100 opacity-0"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-96 mx-4 transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Note</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
