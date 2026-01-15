import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getSupportedMimeType, formatDuration } from '../utils/audioHelpers';

interface RecorderProps {
  onAudioReady: (blob: Blob, mimeType: string) => void;
  isProcessing: boolean;
}

const Recorder: React.FC<RecorderProps> = ({ onAudioReady, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      
      if (!mimeType) {
        setPermissionError("このブラウザは音声録音をサポートしていません。");
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onAudioReady(blob, mimeType);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start Timer
      setDuration(0);
      timerIntervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setPermissionError("マイクへのアクセスが拒否されました。設定を確認してください。");
    }
  }, [onAudioReady]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-lg mx-auto">
      <div className={`text-4xl font-mono font-bold mb-8 transition-colors ${isRecording ? 'text-rose-500' : 'text-slate-700'}`}>
        {formatDuration(duration)}
      </div>

      <div className="relative group">
        {isRecording && (
           <span className="absolute -inset-4 rounded-full bg-rose-500 opacity-20 animate-ping"></span>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 ${
            isRecording 
              ? 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-300' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H9a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
      
      <p className="mt-6 text-sm text-slate-500 font-medium">
        {isRecording ? "録音中... クリックして停止" : "マイクをクリックして録音開始"}
      </p>

      {permissionError && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {permissionError}
        </div>
      )}
    </div>
  );
};

export default Recorder;