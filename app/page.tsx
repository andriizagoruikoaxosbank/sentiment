'use client';

import { useState, useEffect } from 'react';
import { ExitInterviewData } from './utils/types';
import { getFromLocalStorage, saveToLocalStorage } from './utils/fileParser';
import FileUploader from './components/FileUploader';
import DataPreview from './components/DataPreview';
import ResultsTable from './components/ResultsTable';
import SentimentGraphs from './components/SentimentGraphs';
import Footer from './components/Footer';

export default function Home() {
  const [data, setData] = useState<ExitInterviewData[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'results' | 'graphs'>('upload');

  // Load data from local storage on initial render
  useEffect(() => {
    const storedData = getFromLocalStorage();
    if (storedData.length > 0) {
      setData(storedData);
      
      // If the data already has sentiment scores, go to results, otherwise preview
      const hasScores = storedData.some(item => item.sentimentScore !== undefined);
      setStep(hasScores ? 'results' : 'preview');
    }
  }, []);

  const handleDataLoaded = (newData: ExitInterviewData[]) => {
    setData(newData);
    setStep('preview');
  };
  
  const handleProceedToAnalysis = () => {
    setStep('results');
  };

  const handleAnalysisComplete = (analyzedData: ExitInterviewData[]) => {
    saveToLocalStorage(analyzedData);
    setData(analyzedData);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-12">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-8">
          Exit Interview Sentiment Analysis
        </h1>
        
        {step === 'upload' && (
          <FileUploader onDataLoaded={handleDataLoaded} />
        )}
        
        {step === 'preview' && (
          <DataPreview 
            data={data} 
            onProceed={handleProceedToAnalysis} 
          />
        )}
        
        {step === 'results' && data.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">Analysis Results</h2>
            <ResultsTable 
              data={data} 
              onAnalysisComplete={handleAnalysisComplete} 
            />
          </div>
        )}

        {step === 'graphs' && data.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <SentimentGraphs data={data} />
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => setStep('upload')}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
              step === 'upload' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Upload
          </button>
          
          {data.length > 0 && (
            <>
              <button
                onClick={() => setStep('preview')}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                  step === 'preview' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Preview
              </button>
              
              <button
                onClick={() => setStep('results')}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                  step === 'results' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Results
              </button>
              
              <button
                onClick={() => setStep('graphs')}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                  step === 'graphs' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Graphs
              </button>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
