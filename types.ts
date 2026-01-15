export enum AppMode {
  RECORD = 'RECORD',
  UPLOAD = 'UPLOAD'
}

export enum TranscriptionStatus {
  IDLE = 'IDLE',
  COMPRESSING = 'COMPRESSING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface TranscriptionResult {
  text: string;
  timestamp: string;
}

export interface AudioMetadata {
  blob: Blob | null;
  mimeType: string;
  duration?: number;
  fileName?: string;
}