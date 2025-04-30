export interface ExitInterviewData {
  id: string;
  department: string;
  position: string;
  exitDate: string;
  comment: string;
  sentimentScore?: number;
  _originalRow?: any;
} 