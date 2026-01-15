import React, { useState } from 'react';
import { TranscriptionStatus } from '../types';

interface ResultDisplayProps {
  status: TranscriptionStatus;
  text: string;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ status, text, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `transcription_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (status === TranscriptionStatus.IDLE) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {status === TranscriptionStatus.COMPRESSING && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse">
           <div className="w-12 h-12 mb-4 relative">
             <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"></div>
           </div>
           <p className="text-slate-700 font-bold text-lg">音声を圧縮中...</p>
           <p className="text-slate-500 text-sm mt-2">ファイルを軽量化して送信準備をしています。</p>
        </div>
      )}

      {status === TranscriptionStatus.PROCESSING && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse">
           <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
           </div>
           <p className="text-slate-600 font-medium">音声を分析して文字起こし中...</p>
           <p className="text-slate-400 text-xs mt-2">音声の長さにより数秒〜数分かかります</p>
        </div>
      )}

      {status === TranscriptionStatus.ERROR && (
        <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <h3 className="text-red-800 font-bold text-lg mb-2">エラーが発生しました</h3>
           <p className="text-red-600 mb-6">{text}</p>
           <button 
             onClick={onReset}
             className="px-6 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium transition-colors"
           >
             やり直す
           </button>
        </div>
      )}

      {status === TranscriptionStatus.COMPLETED && (
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-50 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              文字起こし結果
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={handleCopy}
                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                title="コピー"
              >
                 {copied ? (
                   <>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                     <span>完了</span>
                   </>
                 ) : (
                   <>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                     </svg>
                     <span>コピー</span>
                   </>
                 )}
              </button>
              <button 
                onClick={handleDownload}
                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                title="保存"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>保存</span>
              </button>
            </div>
          </div>
          <div className="p-6 bg-white max-h-[60vh] overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-800 text-lg">
            {text}
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
             <button onClick={onReset} className="text-sm text-slate-500 hover:text-indigo-600 font-medium underline decoration-slate-300 hover:decoration-indigo-600 underline-offset-2 transition-all">
                新しい録音・ファイルを試す
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;