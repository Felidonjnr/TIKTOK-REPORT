import React, { useEffect, useState } from 'react';
import { getCycleInfo, resetCycle } from '../lib/api';
import { RefreshCcw } from 'lucide-react';
import { useToast } from '../lib/ToastContext';

interface CycleTrackerProps {
  teamMember: string;
}

export default function CycleTracker({ teamMember }: CycleTrackerProps) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchCycle = async () => {
    if (!teamMember) return;
    setLoading(true);
    try {
      const info = await getCycleInfo(teamMember);
      setCount(info.count);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch cycle info', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycle();
    
    // Listen for custom event to refresh
    const handleRefresh = () => fetchCycle();
    window.addEventListener('refresh-cycle', handleRefresh);
    return () => window.removeEventListener('refresh-cycle', handleRefresh);
  }, [teamMember]);

  const handleReset = async () => {
    if (!teamMember) return;
    if (confirm(`Are you sure you want to clear the cycle for ${teamMember}? This cannot be undone.`)) {
      setLoading(true);
      try {
        await resetCycle(teamMember);
        await fetchCycle();
        addToast('Cycle cleared successfully', 'success');
      } catch (err: any) {
        addToast(err.message || 'Failed to clear cycle', 'error');
        setLoading(false);
      }
    }
  };

  if (!teamMember) return null;

  const target = 20;
  const progress = Math.min((count / target) * 100, 100);

  return (
    <div className="bg-indigo-900 rounded-xl text-white p-4 shadow-lg flex items-center justify-between h-full">
      <div className="flex flex-col justify-center">
        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Payout Quota</p>
        <p className="text-lg font-bold">{count} / {target}</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end gap-1 w-24 hidden sm:flex">
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full ${count >= target ? 'bg-green-400' : 'bg-indigo-400'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <button 
          onClick={handleReset}
          disabled={loading}
          className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider disabled:opacity-50 flex items-center gap-1"
        >
          <RefreshCcw size={14} />
          Clear
        </button>
      </div>
    </div>
  );
}
