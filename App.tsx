import React, { useState } from 'react';
import { AppMode, TranscriptionStatus } from './types';
import { transcribeAudio } from './services/geminiService';
import { compressAudio } from './utils/audioHelpers';
import Recorder from './components/Recorder';
import Uploader from './components/Uploader';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.RECORD);
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [resultText, setResultText] = useState<string>('');
  const [modelName, setModelName] = useState<string>('gemini-3-flash-preview');
  
  const handleAudioReady = async (blob: Blob, mimeType: string) => {
    setStatus(TranscriptionStatus.PROCESSING);
    setResultText('');
    
    try {
      const text = await transcribeAudio(blob, mimeType, modelName);
      setResultText(text);
      setStatus(TranscriptionStatus.COMPLETED);
    } catch (error) {
      setResultText(error instanceof Error ? error.message : "予期せぬエラーが発生しました。");
      setStatus(TranscriptionStatus.ERROR);
    }
  };

  const handleFileSelect = async (file: File) => {
    // If file is larger than 2MB, try to compress it first to save bandwidth and fit API limits.
    // 2MB is arbitrary, but usually safe for short clips.
    if (file.size > 2 * 1024 * 1024) {
      try {
        setStatus(TranscriptionStatus.COMPRESSING);
        // Wait a tick to let UI update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const compressedBlob = await compressAudio(file);
        // Compressed audio is always WAV (audio/wav)
        await handleAudioReady(compressedBlob, 'audio/wav');
      } catch (e) {
        console.error("Compression failed, trying original file", e);
        // Fallback to original if compression fails
        await handleAudioReady(file, file.type);
      }
    } else {
      await handleAudioReady(file, file.type);
    }
  };

  const handleReset = () => {
    setStatus(TranscriptionStatus.IDLE);
    setResultText('');
  };

  const getModelDisplayName = () => {
    if (modelName === 'gemini-3-pro-preview') return 'Gemini 3 Pro';
    return 'Gemini 3 Flash';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">
                Gemini Voice Scribe
              </h1>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Produced by 百歳製造所
              </span>
            </div>
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="hidden sm:inline">Powered by</span> {getModelDisplayName()}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-10 flex-grow w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3">AI 音声文字起こし</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            マイクで録音するか、ファイルをアップロードしてください。<br/>
            Gemini AIが瞬時にテキストに変換します。
          </p>
        </div>

        {/* Status Handling: Only show Input UI when IDLE */}
        {status === TranscriptionStatus.IDLE && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Model Selector */}
            <div className="flex justify-center">
              <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => setModelName('gemini-3-flash-preview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    modelName === 'gemini-3-flash-preview'
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Flash (高速)
                </button>
                <button
                  onClick={() => setModelName('gemini-3-pro-preview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    modelName === 'gemini-3-pro-preview'
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Pro (高精度)
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
              <button
                onClick={() => setMode(AppMode.RECORD)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  mode === AppMode.RECORD
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                マイク録音
              </button>
              <button
                onClick={() => setMode(AppMode.UPLOAD)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  mode === AppMode.UPLOAD
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                ファイル
              </button>
            </div>

            {/* Content Area */}
            <div className="transition-all duration-300">
              {mode === AppMode.RECORD ? (
                <Recorder 
                  onAudioReady={handleAudioReady} 
                  isProcessing={false}
                />
              ) : (
                <Uploader 
                  onFileSelect={handleFileSelect} 
                  isProcessing={false}
                />
              )}
            </div>

            {/* Limitations Notice */}
            <div className="max-w-xl mx-auto mt-8 bg-slate-100 rounded-xl p-5 border border-slate-200">
               <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                 </svg>
                 ご利用上の注意・制限
               </h3>
               <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                  <li><strong>自動圧縮機能:</strong> 2MB以上のファイルは、自動的に軽量化（16kHz/モノラル）されてから送信されます。これにより長い音声の送信が可能になります。</li>
                  <li><strong>ファイルサイズ制限:</strong> APIの仕様上、送信データは約20MBが上限です。自動圧縮後でも超える場合はエラーになります。</li>
                  <li>Proモデルは高精度ですが、処理に時間がかかる場合があります。長い音声にはFlashモデルの利用もご検討ください。</li>
                  <li>アップロードされたデータはAI処理にのみ使用され、サーバーに保存されることはありません。</li>
               </ul>
            </div>
          </div>
        )}

        {/* Results Area */}
        <ResultDisplay 
          status={status} 
          text={resultText} 
          onReset={handleReset} 
        />
        
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm bg-white border-t border-slate-100 mt-10">
        <div className="flex flex-col items-center justify-center gap-1">
          <p className="font-semibold text-slate-500">百歳製造所</p>
          <p className="text-xs">&copy; {new Date().getFullYear()} Hyakusai Seizosho. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;