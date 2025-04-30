'use client';

import { ExitInterviewData } from '../utils/types';
import { useState } from 'react';

interface DataPreviewProps {
  data: ExitInterviewData[];
  onProceed: () => void;
}

export default function DataPreview({ data, onProceed }: DataPreviewProps) {
  const [showKeys, setShowKeys] = useState(false);
  
  if (!data.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No data available. Please upload an Excel file.
      </div>
    );
  }
  
  // Extract one row to show its raw data
  const sampleItem = data[0];
  const sampleKeys = Object.keys(sampleItem).filter(k => !k.startsWith('_'));
  
  // Get the original row data if available
  const originalRow = (sampleItem as any)._originalRow;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Data Preview</h2>
        <div className="text-sm text-gray-500">
          {data.length} records extracted
        </div>
      </div>
      
      {/* Debug info */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold">Debug Information</h3>
          <button 
            onClick={() => setShowKeys(!showKeys)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showKeys ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        {showKeys && (
          <div className="text-xs">
            <p><strong>Available fields:</strong> {sampleKeys.join(', ')}</p>
            
            <p className="mt-2"><strong>First mapped record:</strong></p>
            <pre className="mt-1 p-2 bg-gray-200 rounded overflow-x-auto">
              {JSON.stringify(sampleItem, null, 2)}
            </pre>
            
            {originalRow && (
              <>
                <p className="mt-2"><strong>Original Excel data (first row):</strong></p>
                <pre className="mt-1 p-2 bg-gray-200 rounded overflow-x-auto">
                  {JSON.stringify(originalRow, null, 2)}
                </pre>
                
                <div className="mt-2 p-2 bg-blue-100 text-blue-800 rounded">
                  <p><strong>Column Mapping:</strong></p>
                  <ul className="list-disc list-inside mt-1">
                    <li>'Date' → Exit Date</li>
                    <li>'Group' → Department</li>
                    <li>'Driver/Value' → Position</li>
                    <li>'Comment' → Comment</li>
                    <li>'Question' → Comment (fallback)</li>
                  </ul>
                </div>
              </>
            )}
            
            <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded">
              <p className="font-bold">Troubleshooting:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Make sure your Excel file has header rows with column names</li>
                <li>Your file should have columns: Date, Question, Comment, Group, Driver/Value</li>
                <li>Try saving your Excel file as .xlsx format before uploading</li>
                <li>Ensure your sheet is not password protected</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="w-full overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver/Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 5).map((item, index) => (
              <tr key={item.id || index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.department || <span className="text-red-500 italic">Empty</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.position || <span className="text-red-500 italic">Empty</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.exitDate || <span className="text-red-500 italic">Empty</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md break-words">
                  {item.comment ? (
                    item.comment
                  ) : (
                    <span className="text-red-500 italic">Empty</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length > 5 && (
        <p className="text-sm text-gray-500 mb-6">
          Showing 5 of {data.length} records. All records will be analyzed.
        </p>
      )}
      
      <div className="flex justify-center">
        <button
          onClick={onProceed}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Proceed with Sentiment Analysis
        </button>
      </div>
    </div>
  );
} 