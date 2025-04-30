'use client';

import { useState, useEffect, useRef } from 'react';
import { ExitInterviewData } from '../utils/types';
import { analyzeSentiment } from '../utils/sentimentAnalysis';
import WordFilter from './WordFilter';

interface ResultsTableProps {
  data: ExitInterviewData[];
  onAnalysisComplete: (analyzedData: ExitInterviewData[]) => void;
}

export default function ResultsTable({ data, onAnalysisComplete }: ResultsTableProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [analyzedData, setAnalyzedData] = useState<ExitInterviewData[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [filterWords, setFilterWords] = useState<string[]>(['abuse']);
  const initializedRef = useRef(false);
  
  // Initialize analyzed data when component first mounts or data changes
  useEffect(() => {
    setAnalyzedData(data);
    
    // Only run analysis if data has no sentiment scores yet
    const needsAnalysis = data.length > 0 && data.some(item => item.sentimentScore === undefined);
    
    if (needsAnalysis && !initializedRef.current) {
      initializedRef.current = true;
      startAnalysis();
    }
  }, [data]);
  
  const startAnalysis = async () => {
    if (analyzing) return;
    
    setAnalyzing(true);
    setCurrentIndex(0);
    let usedFallback = false;
    
    const newData = [...data];
    
    for (let i = 0; i < newData.length; i++) {
      if (!newData[i].comment) continue;
      
      try {
        setCurrentIndex(i);
        
        // Only analyze items without a sentiment score
        if (newData[i].sentimentScore === undefined) {
          try {
            const score = await analyzeSentiment(newData[i].comment);
            newData[i].sentimentScore = score;
            
            // If we reach this point without error on the first item, we're probably not using fallback
            if (i === 0) {
              usedFallback = false;
            }
          } catch (error) {
            console.error(`Error analyzing comment ${i}:`, error);
            // Use a neutral score if analysis fails
            newData[i].sentimentScore = 5;
            usedFallback = true;
          }
          
          // Update analyzed data without triggering a re-analysis
          setAnalyzedData([...newData]);
        }
      } catch (error) {
        console.error(`Error processing comment ${i}:`, error);
      }
    }
    
    setUsingFallback(usedFallback);
    setAnalyzing(false);
    onAnalysisComplete(newData);
  };
  
  const getSentimentColor = (score?: number): string => {
    if (score === undefined) return '';
    if (score <= 3) return 'bg-red-100 text-red-800';
    if (score <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const containsFilterWord = (comment: string): boolean => {
    if (!comment) return false;
    const lowerComment = comment.toLowerCase();
    return filterWords.some(word => lowerComment.includes(word.toLowerCase()));
  };
  
  const handleFilterChange = (newFilters: string[]) => {
    setFilterWords(newFilters);
  };
  
  if (!analyzedData.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No data available. Please upload an Excel file.
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-x-auto">
      <WordFilter onFilterChange={handleFilterChange} />
      
      {analyzing && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md">
          Analyzing comments: {currentIndex + 1} of {data.length}
        </div>
      )}
      
      {usingFallback && !analyzing && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          <p className="font-medium">⚠️ Using simplified sentiment analysis</p>
          <p className="text-sm mt-1">
            Due to connection issues with OpenAI, a simple word-based sentiment analysis is being used. 
            Results may be less accurate.
          </p>
        </div>
      )}
      
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
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sentiment Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {analyzedData.map((item) => {
            const hasFilterWord = containsFilterWord(item.comment);
            return (
            <tr key={item.id}>
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
                <div className={`${hasFilterWord 
                  ? 'bg-red-200 p-2 rounded border-2 border-red-500' 
                  : item.sentimentScore !== undefined && item.sentimentScore <= 3 
                  ? 'bg-red-50 p-2 rounded' 
                  : ''}`}>
                  {item.comment || <span className="text-red-500 italic">Empty</span>}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.sentimentScore !== undefined ? (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSentimentColor(item.sentimentScore)}`}>
                    {item.sentimentScore.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-gray-400">Pending</span>
                )}
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
} 