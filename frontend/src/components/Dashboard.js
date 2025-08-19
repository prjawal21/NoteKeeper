import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';
import EmptyState from './EmptyState';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { fetchNotes, fetchTags } = useNotes();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, [fetchNotes, fetchTags]);

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<EmptyState />} />
          <Route path="/note/new" element={<NoteEditor />} />
          <Route path="/note/:id" element={<NoteEditor />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
