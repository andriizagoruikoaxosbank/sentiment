'use client';

import { useState } from 'react';
import { parseExcelFile, saveToLocalStorage } from '../utils/fileParser';
import { ExitInterviewData } from '../utils/types';

interface FileUploaderProps {
  onDataLoaded: (data: ExitInterviewData[]) => void;
}

export default function FileUploader({ onDataLoaded }: FileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check if file is Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setError('Please upload an Excel file (.xlsx, .xls) or CSV file (.csv)');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await parseExcelFile(file);
      saveToLocalStorage(data);
      onDataLoaded(data);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Error processing your file. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Exit Interview Data</h2>
      
      <div className="mb-4">
        <label 
          htmlFor="file-upload" 
          className="block w-full cursor-pointer text-center py-2 px-4 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-500 focus:outline-none"
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-gray-600">
              {isLoading ? 'Processing...' : 'Upload CSV'}
            </span>
          </div>
          <input 
            id="file-upload" 
            name="file-upload" 
            type="file" 
            className="hidden" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 