import React from 'react';
import { FileText } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900 text-center px-8">
      <div className="mb-8">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2 font-inter">
          Select a note to start editing
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-inter">
          Choose a note from the sidebar or create a new one
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
