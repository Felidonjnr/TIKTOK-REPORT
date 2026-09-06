import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Copy, CheckCircle } from 'lucide-react';
import { getEntries } from '../lib/api';
import { Entry, SessionContext } from '../types';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useToast } from '../lib/ToastContext';

interface ReportGeneratorProps {
  context: SessionContext;
}

export default function ReportGenerator({ context }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [reportText, setReportText] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { addToast } = useToast();

  const fetchReportData = useCallback(async (silent = false) => {
    if (!context.date) return;
    
    setLoading(true);
    try {
      const data = await getEntries(context.date, context.date);
      setEntries(data);
      generateText(data, context.date);
      
      if (!silent) {
        if (data.length > 0) {
          addToast('Report updated successfully.', 'success');
        } else {
          addToast('No entries found for this date.', 'info');
        }
      }
    } catch (err: any) {
      if (!silent) addToast(err.message || 'Failed to fetch report data', 'error');
    } finally {
      setLoading(false);
    }
  }, [context.date, addToast]);

  // Auto-fetch on mount, date change, and when a new entry is saved
  useEffect(() => {
    fetchReportData(true);
    
    const handleRefresh = () => fetchReportData(true);
    window.addEventListener('refresh-cycle', handleRefresh);
    return () => window.removeEventListener('refresh-cycle', handleRefresh);
  }, [fetchReportData]);

  const formatDayGroup = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (isToday(d)) return "Today";
      if (isYesterday(d)) return "Yesterday";
      return format(d, 'MMM do, yyyy');
    } catch {
      return dateStr;
    }
  };

  const generateText = (data: Entry[], targetDate: string) => {
    if (data.length === 0) {
      setReportText("No entries found for this date.");
      return;
    }

    const teamMembers = Array.from(new Set(data.map(d => d.team_member)));
    let text = "";

    for (const member of teamMembers) {
      const memberEntries = data.filter(d => d.team_member === member);
      const team = memberEntries[0].team;
      
      const newSubs = memberEntries.filter(e => e.type === "New");
      const renewals = memberEntries.filter(e => e.type === "Renewal");

      text += `Team Member: ${member}\n`;
      text += `Team: ${team}\n`;
      text += `Date: ${formatDayGroup(targetDate)}\n\n`;

      const appendSection = (title: string, list: Entry[]) => {
        text += `--- ${title} ---\n`;
        if (list.length === 0) {
          text += `None\n\n`;
          return;
        }

        let counter = 1;
        list.forEach(item => {
          text += `${counter}. ${item.subscriber_name} | ${item.tiktok_handle} | ${item.instructor} | ${item.target_account} | ${item.time}\n`;
          counter++;
        });
        text += `\n`;
      };

      appendSection("New Subscriptions", newSubs);
      appendSection("Renewals", renewals);

      text += `Totals:\n`;
      text += `Total Subscriptions: ${newSubs.length}\n`;
      text += `Total Renewals: ${renewals.length}\n`;
      text += `Total Records: ${newSubs.length + renewals.length}\n`;
      
      text += `\n`;
    }

    setReportText(text.trim());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          WhatsApp Report
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded shadow-sm">
          Auto-Sync Active
        </span>
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-green-400 leading-relaxed overflow-hidden flex flex-col min-h-[400px] border border-slate-800 shadow-inner relative">
        {loading && (
          <div className="absolute top-2 right-2">
             <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
          </div>
        )}
        <textarea 
          readOnly
          value={reportText}
          className="flex-1 bg-transparent border-none outline-none resize-none font-mono text-green-400 focus:ring-0 w-full"
        />
        <button 
          onClick={handleCopy}
          disabled={!reportText || reportText.includes('No entries')}
          className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
}
