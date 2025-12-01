import React, { useState } from 'react';
import { UploadedFile, SimilarityResult } from '../types';
import { compareDocuments } from '../services/geminiService';
import { FileUpload } from './FileUpload';
import { ArrowRightLeft, Check, XCircle, Loader2 } from 'lucide-react';

export const SimilarityView: React.FC = () => {
    const [file1, setFile1] = useState<UploadedFile | null>(null);
    const [file2, setFile2] = useState<UploadedFile | null>(null);
    const [result, setResult] = useState<SimilarityResult | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCompare = async () => {
        if (!file1 || !file2) return;
        setIsComparing(true);
        setError(null);
        try {
            const data = await compareDocuments(
                { base64: file1.base64, mimeType: file1.mimeType },
                { base64: file2.base64, mimeType: file2.mimeType }
            );
            setResult(data);
        } catch (err) {
            setError("Failed to compare documents. Please try again.");
        } finally {
            setIsComparing(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Document Similarity Checker</h2>
                <p className="text-slate-400 text-sm">Upload two documents to compare their content, layout, and authenticity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                 {/* Connection Line Visual */}
                 <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-800 border border-slate-600 p-2 rounded-full">
                    <ArrowRightLeft className="text-blue-400" />
                 </div>

                 <FileUpload 
                    label="Upload Original / First Doc"
                    selectedFile={file1}
                    onFileSelect={setFile1}
                    onClear={() => { setFile1(null); setResult(null); }}
                 />
                 <FileUpload 
                    label="Upload Comparison Doc"
                    selectedFile={file2}
                    onFileSelect={setFile2}
                    onClear={() => { setFile2(null); setResult(null); }}
                 />
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleCompare}
                    disabled={!file1 || !file2 || isComparing}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    {isComparing ? <><Loader2 className="animate-spin" /> Comparing...</> : "Compare Documents"}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-center">
                    {error}
                </div>
            )}

            {result && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden animate-slide-up">
                    <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex flex-col items-center">
                         <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Similarity Match</span>
                         <div className="relative h-24 w-full max-w-md bg-slate-700 rounded-full overflow-hidden">
                             <div 
                                className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-4 ${
                                    result.similarityScore > 80 ? 'bg-green-500' : result.similarityScore > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${result.similarityScore}%` }}
                             >
                                <span className="text-white font-bold text-xl drop-shadow-md">{result.similarityScore}%</span>
                             </div>
                         </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <h4 className="text-white font-semibold mb-2">Analysis Explanation</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-lg">
                                <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                                    <Check size={18} /> Matches & Similarities
                                </h4>
                                <ul className="space-y-2">
                                    {result.similarities.map((item, i) => (
                                        <li key={i} className="text-slate-300 text-sm flex gap-2">
                                            <span className="text-green-500">•</span> {item}
                                        </li>
                                    ))}
                                    {result.similarities.length === 0 && <li className="text-slate-500 text-sm italic">None detected.</li>}
                                </ul>
                            </div>

                            <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-lg">
                                <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                                    <XCircle size={18} /> Differences & Discrepancies
                                </h4>
                                <ul className="space-y-2">
                                    {result.differences.map((item, i) => (
                                        <li key={i} className="text-slate-300 text-sm flex gap-2">
                                            <span className="text-red-500">•</span> {item}
                                        </li>
                                    ))}
                                    {result.differences.length === 0 && <li className="text-slate-500 text-sm italic">None detected.</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
