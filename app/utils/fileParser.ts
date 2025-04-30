import * as XLSX from 'xlsx';
import { ExitInterviewData } from './types';

export const parseExcelFile = (file: File): Promise<ExitInterviewData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        
        // Check if the file is CSV or Excel
        const isCSV = file.name.endsWith('.csv');
        
        let jsonData: any[] = [];
        
        if (isCSV) {
          // Parse as CSV
          const csv = data as string;
          // Use XLSX's CSV parser
          const workbook = XLSX.read(csv, { type: 'string' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Parsed CSV data:', jsonData);
        } else {
          // Parse as Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Log all sheet names for debugging
          console.log('Excel sheets:', workbook.SheetNames);
          
          // Try to find a sheet with data
          const sheetName = workbook.SheetNames[0]; // Default to first sheet
          const worksheet = workbook.Sheets[sheetName];
          
          // Try multiple ways to parse the sheet
          // 1. First try the default sheet_to_json
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Method 1 - Default parsing:', jsonData);
          
          // 2. If that doesn't produce data, try with headers
          if (!jsonData.length || (jsonData[0] && Object.keys(jsonData[0] as object).length === 0)) {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log('Method 2 - Row-based parsing:', jsonData);
          }
          
          // 3. Try to parse it with raw: true if needed
          if (!jsonData.length || (jsonData[0] && Object.keys(jsonData[0] as object).length === 0)) {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
            console.log('Method 3 - Raw parsing:', jsonData);
          }
        }
        
        // If we've got a 2D array from method 2, convert it to objects
        if (Array.isArray(jsonData[0])) {
          const headers = jsonData[0] as string[];
          jsonData = jsonData.slice(1).map((row: any) => {
            const obj: Record<string, any> = {};
            headers.forEach((header, i) => {
              if (header) obj[header] = row[i] || '';
            });
            return obj;
          });
          console.log('Converted array data to objects:', jsonData);
        }
        
        // Create a sample object with default fields if nothing worked
        if (!jsonData.length) {
          // If CSV or Excel parsing didn't work, create some dummy data
          jsonData = [{ row: 1, empty: true }];
        }
        
        // Finally map to our data structure
        const parsedData: ExitInterviewData[] = jsonData.map((row: any, index) => {
          // Check if this is an empty object
          const isEmpty = Object.keys(row as object).length === 0 || 
                          (Object.keys(row as object).length === 1 && 'empty' in row);
          
          // Make a best effort to find fields based on the user's specific column names
          // Known columns: Date, Question, Comment, Group, Driver/Value
          let departmentValue = '';
          let positionValue = '';
          let exitDateValue = '';
          let commentValue = '';
          
          // Only try to extract values if we have actual data
          if (!isEmpty) {
            // Find exact matches for the user's column names
            for (const key of Object.keys(row as object)) {
              const value = row[key] || '';
              
              if (key === 'Date') {
                exitDateValue = value;
              } else if (key === 'Group') {
                departmentValue = value;
              } else if (key === 'Driver/Value') {
                positionValue = value; 
              } else if (key === 'Comment') {
                commentValue = value;
              } else if (key === 'Question' && !commentValue) {
                // Use Question as a fallback for Comment if Comment is empty
                commentValue = value;
              }
            }
          }
          
          return {
            id: `exit-${index}`,
            department: departmentValue,
            position: positionValue,
            exitDate: exitDateValue,
            comment: commentValue,
            // Store the original row for debugging
            _originalRow: row
          };
        });
        
        // Log the final parsed data
        console.log('Final parsed data:', parsedData);
        
        resolve(parsedData);
      } catch (error) {
        console.error('Error parsing file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    // Use different reader method for CSV vs Excel
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

export const saveToLocalStorage = (data: ExitInterviewData[], key = 'exitInterviewData') => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getFromLocalStorage = (key = 'exitInterviewData'): ExitInterviewData[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}; 