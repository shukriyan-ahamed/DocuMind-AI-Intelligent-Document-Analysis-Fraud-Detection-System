import React, { useState } from 'react';
import { 
  FileSearch, 
  MessageSquareText, 
  Files, 
  Menu, 
  LayoutDashboard,
  Github
} from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { ChatInterface } from './components/ChatInterface';
import { SimilarityView } from './components/SimilarityView';
import { analyzeDocument } from './services/geminiService';
import { AnalysisResult, AnalysisStatus, UploadedFile } from './types';
import { Brain } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'chat' | 'compare'>('analyze');
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAnalyze = async (uploadedFile: UploadedFile) => {
    setFile(uploadedFile);
    setStatus(AnalysisStatus.ANALYZING);
    setResult(null);
    setError(null);
    setActiveTab('analyze');

    try {
      const data = await analyzeDocument(uploadedFile.base64, uploadedFile.mimeType);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze document. Please ensure the file is valid and try again.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const clearSession = () => {
    setFile(null);
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    setError(null);
  };

  const navItems = [
    { id: 'analyze', label: 'Dashboard & Analysis', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat with Document', icon: MessageSquareText },
    { id: 'compare', label: 'Similarity Check', icon: Files },
  ] as const;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-emerald-500 p-2 rounded-lg">
            <Brain className="text-white h-5 w-5" />

          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            DocuMind AI
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-2"></p>
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
              </div>
           </div>
           <a href="#" className="flex items-center gap-2 text-xs text-slate-500 mt-4 hover:text-slate-300 transition-colors justify-center">
             <Github size={14} /> Open Source Project
           </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header (Mobile) */}
        <header className="lg:hidden h-16 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/90 backdrop-blur">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-slate-200">DocuMind AI</span>
          <div className="w-8" />
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-hide">
          <div className="max-w-5xl mx-auto space-y-6">

            {activeTab === 'compare' ? (
                // Similarity View is standalone
                <SimilarityView />
            ) : (
                // Analyze and Chat Views depend on single file context
                <>
                    {/* File Upload Section */}
                    {(!file || status === AnalysisStatus.IDLE) && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-white mb-4">Intelligent Document Analysis</h2>
                                <p className="text-slate-400 max-w-2xl mx-auto">
                                    Upload documents to extract text, detect fraud, summarize content, and analyze entities using advanced AI.
                                </p>
                            </div>
                            <div className="h-64">
                                <FileUpload 
                                    onFileSelect={handleAnalyze} 
                                    selectedFile={file} 
                                    onClear={clearSession} 
                                    label="Drop your document here (PDF/Image)"
                                />
                            </div>
                            
                            {/* Feature Grid for Landing */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12">
                                {[
                                    { title: "Smart OCR", desc: "Extract text from images and scans instantly." },
                                    { title: "Fraud Detection", desc: "Identify font inconsistencies & tampering." },
                                    { title: "Auto Summary", desc: "Get concise summaries in seconds." },
                                    { title: "Entity Extraction", desc: "Pull names, dates, and prices automatically." },
                                    { title: "Doc Classification", desc: "Auto-tag invoices, resumes, and more." },
                                    { title: "Contextual Chat", desc: "Ask questions directly to your documents." }
                                ].map((feature, idx) => (
                                    <div key={idx} className="bg-slate-800/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-800 transition-colors">
                                        <h3 className="text-blue-400 font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-slate-400 text-sm">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {status === AnalysisStatus.ANALYZING && (
                        <div className="flex flex-col items-center justify-center h-[50vh] animate-fade-in">
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                                <Brain className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Analyzing Document...</h3>
                            <p className="text-slate-400 mt-2">Extracting entities, checking authenticity, and summarizing.</p>
                        </div>
                    )}

                    {/* Error State */}
                    {status === AnalysisStatus.ERROR && (
                        <div className="flex flex-col items-center justify-center h-[50vh] animate-fade-in text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white">Analysis Failed</h3>
                            <p className="text-red-400 mt-2 max-w-md">{error}</p>
                            <button 
                                onClick={clearSession}
                                className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Results / Chat Display */}
                    {status === AnalysisStatus.COMPLETED && file && result && (
                        <div className="animate-fade-in space-y-6">
                            
                            {/* Top Bar with File Info & Switcher */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 sticky top-0 z-10 backdrop-blur">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                                        <FileSearch className="text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-sm truncate max-w-[200px]">{file.file.name}</h3>
                                        <p className="text-xs text-slate-500">Analyzed successfully</p>
                                    </div>
                                </div>

                                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                                    <button
                                        onClick={() => setActiveTab('analyze')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'analyze' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Analysis
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('chat')}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Chat
                                    </button>
                                </div>

                                <button onClick={clearSession} className="text-xs text-slate-400 hover:text-white underline">
                                    Analyze New File
                                </button>
                            </div>

                            {/* Content based on Tab */}
                            {activeTab === 'analyze' ? (
                                <AnalysisView result={result} />
                            ) : (
                                <ChatInterface file={file} />
                            )}
                        </div>
                    )}
                </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
