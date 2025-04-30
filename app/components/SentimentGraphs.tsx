'use client';

import { useState, useEffect } from 'react';
import { ExitInterviewData } from '../utils/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface SentimentGraphsProps {
  data: ExitInterviewData[];
}

export default function SentimentGraphs({ data }: SentimentGraphsProps) {
  const [timelineData, setTimelineData] = useState<any>({});
  const [departmentData, setDepartmentData] = useState<any>({});
  const [distributionData, setDistributionData] = useState<any>({});
  
  useEffect(() => {
    if (data.length === 0) return;
    
    // Debug log sample dates to help troubleshoot
    logDateFormats();
    
    prepareTimelineData();
    prepareDepartmentData();
    prepareDistributionData();
  }, [data]);
  
  const logDateFormats = () => {
    console.log('Debugging date formats:');
    const sampleItems = data.slice(0, 5); // look at first 5 items
    
    sampleItems.forEach((item, index) => {
      console.log(`Sample ${index}:`, {
        exitDate: item.exitDate,
        type: typeof item.exitDate,
        isString: typeof item.exitDate === 'string',
        isValid: item.exitDate && !isNaN(new Date(item.exitDate).getTime())
      });
    });
  };
  
  const prepareTimelineData = () => {
    // Function to parse various date formats
    const parseDate = (dateStr: any): Date | null => {
      // Handle null/undefined values
      if (!dateStr) {
        return null;
      }
      
      // If already a Date object
      if (dateStr instanceof Date) {
        return isNaN(dateStr.getTime()) ? null : dateStr;
      }
      
      // If it's a number (possibly an Excel serial date)
      if (typeof dateStr === 'number') {
        // Excel serial date (days since 1/1/1900)
        // Adjusting for Excel's leap year bug with 1900
        const excelEpoch = new Date(1900, 0, 1);
        const daysSinceEpoch = dateStr - 1; // Excel counts 1/1/1900 as day 1
        const millisecondsSinceEpoch = daysSinceEpoch * 24 * 60 * 60 * 1000;
        const date = new Date(excelEpoch.getTime() + millisecondsSinceEpoch);
        return date;
      }
      
      // If it's a string
      if (typeof dateStr === 'string') {
        // Try mm/dd/yyyy format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // Try to parse as month/day/year (American format)
          const month = parseInt(parts[0]) - 1;
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          const date = new Date(year, month, day);
          
          // Check if date is valid
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
        
        // Try standard date parsing as a fallback
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // If we've reached here, we couldn't parse the date
      console.error('Unparseable date:', dateStr);
      return null;
    };
    
    // Filter out items without valid dates or sentiment scores
    const validData = [...data]
      .filter(item => item.exitDate && item.sentimentScore !== undefined)
      .map(item => ({
        ...item,
        parsedDate: parseDate(item.exitDate)
      }))
      .filter(item => item.parsedDate !== null) // Remove items with unparseable dates
      .sort((a, b) => {
        return (a.parsedDate as Date).getTime() - (b.parsedDate as Date).getTime();
      });
    
    // Check if we have any data to display
    if (validData.length === 0) {
      console.warn('No valid dates found for timeline chart');
      setTimelineData({
        labels: [],
        datasets: []
      });
      return;
    }

    // Group by full date for daily granularity
    const dateGroups: Record<string, number[]> = {};
    
    validData.forEach(item => {
      try {
        const date = item.parsedDate as Date;
        // Format as ISO date string without time (YYYY-MM-DD)
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dateGroups[dateKey]) {
          dateGroups[dateKey] = [];
        }
        
        if (item.sentimentScore !== undefined) {
          dateGroups[dateKey].push(item.sentimentScore);
        }
      } catch (error) {
        console.error('Error processing date:', item.exitDate, error);
      }
    });
    
    // Calculate average score for each day
    const sortedKeys = Object.keys(dateGroups).sort(); // ISO dates sort chronologically
    
    // Format dates for display
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };
    
    const formattedLabels = sortedKeys.map(formatDate);
    
    const averageScores = sortedKeys.map(key => {
      const scores = dateGroups[key];
      const sum = scores.reduce((acc, score) => acc + score, 0);
      return sum / scores.length;
    });
    
    setTimelineData({
      labels: formattedLabels,
      datasets: [
        {
          label: 'Sentiment Score by Day',
          data: averageScores,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2, // Slight curve to the line
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    });
  };
  
  const prepareDepartmentData = () => {
    // Group by department
    const departmentGroups: Record<string, number[]> = {};
    
    data.forEach(item => {
      if (!item.department || item.sentimentScore === undefined) return;
      
      if (!departmentGroups[item.department]) {
        departmentGroups[item.department] = [];
      }
      
      departmentGroups[item.department].push(item.sentimentScore);
    });
    
    // Calculate average score for each department
    const labels = Object.keys(departmentGroups);
    const averageScores = labels.map(label => {
      const scores = departmentGroups[label];
      const sum = scores.reduce((acc, score) => acc + score, 0);
      return sum / scores.length;
    });
    
    setDepartmentData({
      labels,
      datasets: [
        {
          label: 'Average Department Sentiment',
          data: averageScores,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    });
  };
  
  const prepareDistributionData = () => {
    // Create buckets for score distribution
    const scoreBuckets: Record<string, number> = {
      'Very Negative (0-2)': 0,
      'Negative (2-4)': 0,
      'Neutral (4-6)': 0,
      'Positive (6-8)': 0,
      'Very Positive (8-10)': 0
    };
    
    data.forEach(item => {
      if (item.sentimentScore === undefined) return;
      
      const score = item.sentimentScore;
      
      if (score < 2) {
        scoreBuckets['Very Negative (0-2)']++;
      } else if (score < 4) {
        scoreBuckets['Negative (2-4)']++;
      } else if (score < 6) {
        scoreBuckets['Neutral (4-6)']++;
      } else if (score < 8) {
        scoreBuckets['Positive (6-8)']++;
      } else {
        scoreBuckets['Very Positive (8-10)']++;
      }
    });
    
    setDistributionData({
      labels: Object.keys(scoreBuckets),
      datasets: [
        {
          label: 'Distribution of Sentiment Scores',
          data: Object.values(scoreBuckets),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)',
          ],
        },
      ],
    });
  };
  
  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No data available for charts. Please upload data first.
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-6">Sentiment Analysis Trends</h2>
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Sentiment Over Time (Daily)</h3>
          {timelineData.labels && timelineData.labels.length > 0 ? (
            <div className="h-80">
              <Line 
                data={timelineData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      min: 0,
                      max: 10,
                      title: {
                        display: true,
                        text: 'Sentiment Score'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Date'
                      },
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 20 // Limit the number of ticks to avoid overcrowding
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        title: function(context) {
                          return context[0].label;
                        },
                        label: function(context) {
                          return `Score: ${context.parsed.y.toFixed(2)}`;
                        }
                      }
                    },
                    legend: {
                      position: 'top',
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <p className="text-center text-gray-500">No timeline data available. Check your date formats.</p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Sentiment By Department</h3>
          {departmentData.labels && departmentData.labels.length > 0 ? (
            <div className="h-80">
              <Bar 
                data={departmentData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      min: 0,
                      max: 10,
                      title: {
                        display: true,
                        text: 'Average Sentiment Score'
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `Average score: ${context.parsed.y.toFixed(2)}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <p className="text-center text-gray-500">No department data available.</p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Distribution of Sentiment Scores</h3>
          {distributionData.labels && distributionData.labels.length > 0 ? (
            <div className="h-80">
              <Bar 
                data={distributionData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Number of Comments'
                      }
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <p className="text-center text-gray-500">No distribution data available.</p>
          )}
        </div>
      </div>
    </div>
  );
} 