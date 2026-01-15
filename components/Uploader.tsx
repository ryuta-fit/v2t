import React, { useRef, useState } from 'react';

interface UploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const Uploader: React.FC<UploaderProps> = ({ onFileSelect, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Basic validation for audio types
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      alert("音声または動画ファイルを選択してください。");
      return;
    }
    setFileName(file.name);
    onFileSelect(file);
  };

  const triggerFileInput = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div 
      className={`
        flex flex-col items-center justify-center w-full max-w-lg mx-auto h-64
        border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        accept="audio/*,video/*" 
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center justify-center p-6 text-center">
        {fileName ? (
          <>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700 break-all px-4">{fileName}</p>
            <p className="text-xs text-slate-500 mt-2">クリックして変更</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-base font-medium text-slate-700">ファイルをドラッグ＆ドロップ</p>
            <p className="text-sm text-slate-500 mt-1">または クリックして選択</p>
            <p className="text-xs text-slate-400 mt-4">MP3, WAV, M4A, AAC など</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Uploader;