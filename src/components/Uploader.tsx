import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, X } from 'lucide-react';
import { extractFromScreenshots, saveEntry } from '../lib/api';
import { SessionContext, ExtractedData } from '../types';
import { useToast } from '../lib/ToastContext';

interface UploaderProps {
  context: SessionContext;
}

export default function Uploader({ context }: UploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [type, setType] = useState<"New" | "Renewal">("New");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setExtracted(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (files.length === 1) {
      setExtracted(null);
    }
  };

  const handleExtract = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const data = await extractFromScreenshots(files);
      setExtracted(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to extract data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!extracted) return;
    setExtracted({ ...extracted, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!extracted || !context.team_member || !context.instructor || !context.target_account) {
      addToast('Please fill in all context fields (Team Member, Instructor, Account) before saving.', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await saveEntry({
        ...extracted,
        team_member: context.team_member,
        team: context.team,
        instructor: context.instructor,
        target_account: context.target_account,
        date: context.date,
        type: type,
      });
      
      setFiles([]);
      setExtracted(null);
      addToast('Entry saved successfully!', 'success');
      window.dispatchEvent(new CustomEvent('refresh-cycle'));
      
      // Clear file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err: any) {
      addToast(err.message || 'Failed to save entry', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
        Data Extraction
      </h2>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1 mb-2">Upload Screenshots (Profile + Receipt)</label>
        <input 
          type="file" 
          multiple 
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
        />
        
        {files.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600">
                <span className="truncate max-w-[150px]">{f.name}</span>
                <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
        
        {files.length > 0 && !extracted && (
          <button 
            onClick={handleExtract}
            disabled={loading}
            className="mt-5 h-[42px] px-6 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all disabled:opacity-50 w-full sm:w-auto"
          >
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>}
            {!loading && <UploadCloud size={18} />}
            {loading ? 'Analyzing...' : 'Extract Data via AI'}
          </button>
        )}
      </div>

      {extracted && (
        <div className={`bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 relative shadow-sm border-l-4 ${type === 'New' ? 'border-l-indigo-500' : 'border-l-orange-400'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subscriber Name</span>
              <input type="text" name="subscriber_name" value={extracted.subscriber_name} onChange={handleDataChange} className="text-sm font-bold border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none py-1 bg-transparent" />
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">TikTok Handle</span>
              <input type="text" name="tiktok_handle" value={extracted.tiktok_handle} onChange={handleDataChange} className="text-sm font-bold border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none py-1 bg-transparent" />
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Extracted</span>
              <input type="text" name="time" value={extracted.time} onChange={handleDataChange} className="text-sm font-bold border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none py-1 bg-transparent" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entry Type</span>
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={() => setType('New')} 
                  className={`px-3 py-1 text-[10px] font-bold rounded shadow-sm transition-colors ${type === 'New' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >NEW</button>
                <button 
                  onClick={() => setType('Renewal')} 
                  className={`px-3 py-1 text-[10px] font-bold rounded shadow-sm transition-colors ${type === 'Renewal' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >RENEWAL</button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button 
              onClick={() => { setExtracted(null); setFiles([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>}
              Confirm & Save Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
