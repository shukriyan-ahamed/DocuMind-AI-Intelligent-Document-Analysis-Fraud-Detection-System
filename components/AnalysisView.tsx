import React, { useState } from 'react';
import { AnalysisResult, DocumentType, Entity } from '../types';
import { AlertTriangle, CheckCircle, FileText, Tag, BarChart3, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface AnalysisViewProps {
  result: AnalysisResult;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result }) => {
  const [summaryLevel, setSummaryLevel] = useState<'short' | 'medium' | 'long'>('medium');

  const getFraudColor = (score: number) => {
    if (score < 20) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const entitiesByCategory = result.entities.reduce((acc, entity) => {
    if (!acc[entity.category]) acc[entity.category] = [];
    acc[entity.category].push(entity);
    return acc;
  }, {} as Record<string, Entity[]>);

  const confidenceData = [
    { name: 'Confidence', value: result.confidenceScore },
    { name: 'Uncertainty', value: 1 - result.confidenceScore }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Document Type */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Classification</p>
            <p className="text-xl font-bold text-white mt-1">{result.documentType}</p>
          </div>
          <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
            <FileText size={20} />
          </div>
        </div>

        {/* Fraud Detection */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Fraud Risk</p>
            <div className="flex items-center gap-2 mt-1">
               <p className={`text-xl font-bold ${getFraudColor(result.fraudDetection.score)}`}>
                {result.fraudDetection.score}/100
              </p>
              {result.fraudDetection.isSuspicious ? (
                 <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">SUSPICIOUS</span>
              ) : (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">SAFE</span>
              )}
            </div>
           
          </div>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${result.fraudDetection.isSuspicious ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            <ShieldAlert size={20} />
          </div>
        </div>

        {/* Confidence */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex items-center justify-between">
            <div>
                 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AI Confidence</p>
                 <p className="text-xl font-bold text-emerald-400 mt-1">{(result.confidenceScore * 100).toFixed(0)}%</p>
            </div>
            <div className="h-12 w-12">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={confidenceData} 
                            innerRadius={15} 
                            outerRadius={22} 
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            <Cell fill="#34d399" />
                            <Cell fill="#334155" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Fraud Reasoning Details */}
      {result.fraudDetection.isSuspicious && (
        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex gap-3">
             <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
             <div>
                <h4 className="text-red-400 font-semibold text-sm">Potential Tampering Detected</h4>
                <p className="text-red-200/80 text-sm mt-1">{result.fraudDetection.reasoning}</p>
             </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex flex-wrap gap-4 items-center justify-between bg-slate-800/50">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400"/> Executive Summary
          </h3>
          <div className="flex bg-slate-900 p-1 rounded-lg">
            {(['short', 'medium', 'long'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSummaryLevel(level)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  summaryLevel === level 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 bg-slate-800/30">
          <p className="text-slate-300 leading-relaxed text-sm md:text-base">
            {levelContent(result, summaryLevel)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Extracted Entities */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-full">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Tag size={18} className="text-purple-400"/> Key Entities
                </h3>
            </div>
            <div className="p-4 overflow-y-auto max-h-[300px] scrollbar-hide space-y-4">
                {Object.entries(entitiesByCategory).map(([category, items]) => (
                    <div key={category}>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {(items as Entity[]).map((item, idx) => (
                                <span key={idx} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-1 rounded text-xs">
                                    {item.text}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
                 {result.entities.length === 0 && <p className="text-slate-500 italic text-sm">No entities detected.</p>}
            </div>
        </div>

        {/* OCR Text */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-full">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <FileText size={18} className="text-orange-400"/> Raw OCR Text
                </h3>
            </div>
            <div className="p-4 overflow-y-auto max-h-[300px] scrollbar-hide bg-slate-900/50">
                <p className="text-slate-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {result.ocrText}
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

const levelContent = (result: AnalysisResult, level: 'short' | 'medium' | 'long') => {
    switch(level) {
        case 'short': return result.summaryShort;
        case 'medium': return result.summaryMedium;
        case 'long': return result.summaryLong;
    }
}