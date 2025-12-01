import React, { useCallback } from 'react';
import { Upload, FileType, X } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFileSelect: (file: UploadedFile) => void;
  selectedFile: UploadedFile | null;
  onClear: () => void;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, onClear, label = "Upload Document" }) => {
  
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 part only
      const base64 = result.split(',')[1];
      
      onFileSelect({
        file,
        previewUrl: file.type.startsWith('image/') ? result : '',
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  if (selectedFile) {
    return (
      <div className="relative border border-slate-700 bg-slate-800 rounded-lg p-4 flex items-center gap-4 h-full min-h-[150px]">
        <button 
          onClick={onClear}
          className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors text-slate-300"
        >
          <X size={16} />
        </button>
        
        <div className="flex-shrink-0 w-24 h-24 bg-slate-900 rounded flex items-center justify-center overflow-hidden border border-slate-700">
            {selectedFile.previewUrl ? (
                <img src={selectedFile.previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <FileType size={32} className="text-slate-400" />
            )}
        </div>
        
        <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-200">{selectedFile.file.name}</span>
            <span className="text-xs text-slate-400">{(selectedFile.file.size / 1024).toFixed(1)} KB</span>
            <span className="text-xs text-blue-400 uppercase mt-1">{selectedFile.file.type.split('/')[1]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[150px]">
      <label className="flex flex-col items-center justify-center w-full h-full border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 transition-all group">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-10 h-10 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">{label}</span></p>
          <p className="text-xs text-slate-500">PDF, PNG, JPG (MAX. 10MB)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFileChange}
          accept="image/*,application/pdf"
        />
      </label>
    </div>
  );
};
