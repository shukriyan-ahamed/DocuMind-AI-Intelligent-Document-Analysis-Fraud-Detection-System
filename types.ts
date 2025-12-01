export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum DocumentType {
  RESUME = 'Resume',
  INVOICE = 'Invoice',
  LEGAL = 'Legal Document',
  MEDICAL = 'Medical Report',
  RESEARCH = 'Research Paper',
  RECEIPT = 'Receipt',
  OTHER = 'Other'
}

export interface Entity {
  text: string;
  category: string; // e.g., "Name", "Date", "Price", "Disease"
}

export interface AnalysisResult {
  ocrText: string;
  summaryShort: string;
  summaryMedium: string;
  summaryLong: string;
  documentType: DocumentType;
  confidenceScore: number;
  fraudDetection: {
    isSuspicious: boolean;
    score: number; // 0-100, where 100 is highly likely fake
    reasoning: string;
  };
  entities: Entity[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface SimilarityResult {
  similarityScore: number;
  explanation: string;
  differences: string[];
  similarities: string[];
}
