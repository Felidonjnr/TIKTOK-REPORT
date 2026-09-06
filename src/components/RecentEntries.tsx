import React, { useEffect, useState } from 'react';
import { getRecentEntries, deleteEntry, updateEntry } from '../lib/api';
import { Entry } from '../types';
import { useToast } from '../lib/ToastContext';
import { Trash2, Edit2, X, Check, Clock, Search, Calendar } from 'lucide-react';

export default function RecentEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Entry>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const { addToast } = useToast();

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await getRecentEntries(50);
      setEntries(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch recent entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    const handleRefresh = () => fetchEntries();
    window.addEventListener('refresh-cycle', handleRefresh);
    return () => window.removeEventListener('refresh-cycle', handleRefresh);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await deleteEntry(id);
      addToast('Entry deleted successfully', 'success');
      setEntries(entries.filter(e => e.id !== id));
      window.dispatchEvent(new CustomEvent('refresh-cycle'));
    } catch (err: any) {
      addToast(err.message || 'Failed to delete entry', 'error');
    }
  };

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditForm(entry);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateEntry(editingId, editForm);
      addToast('Entry updated successfully', 'success');
      setEntries(entries.map(e => e.id === editingId ? { ...e, ...editForm } as Entry : e));
      setEditingId(null);
      window.dispatchEvent(new CustomEvent('refresh-cycle'));
    } catch (err: any) {
      addToast(err.message || 'Failed to update entry', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.subscriber_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tiktok_handle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate === '' || entry.date === filterDate;
    
    return matchesSearch && matchesDate;
  });

  if (loading && entries.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-center justify-center shadow-sm">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 gap-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Clock className="text-indigo-500 w-4 h-4" />
          Recent Entries
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name or handle..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-600"
            />
          </div>
          {(searchTerm || filterDate) && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterDate(''); }}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm font-medium">No matching entries found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="p-3 whitespace-nowrap">Date</th>
                <th className="p-3">Member</th>
                <th className="p-3">Subscriber</th>
                <th className="p-3">Handle</th>
                <th className="p-3">Type</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  {editingId === entry.id ? (
                    <>
                      <td className="p-2"><input type="date" name="date" value={editForm.date || ''} onChange={handleChange} className="w-full text-xs font-bold border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none py-1 bg-transparent" /></td>
                      <td className="p-2"><input type="text" name="team_member" value={editForm.team_member || ''} onChange={handleChange} className="w-full text-xs font-bold border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none py-1 bg-transparent" /></td>
                      <td className="p-2"><input type="text" name="subscriber_name" value={editForm.subscriber_name || ''} onChange={handleChange} className="w-full text-xs font-bold border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none py-1 bg-transparent" /></td>
                      <td className="p-2"><input type="text" name="tiktok_handle" value={editForm.tiktok_handle || ''} onChange={handleChange} className="w-full text-xs font-bold border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none py-1 bg-transparent" /></td>
                      <td className="p-2">
                        <select name="type" value={editForm.type || 'New'} onChange={handleChange} className="w-full text-xs font-bold border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none py-1 bg-transparent">
                          <option value="New">New</option>
                          <option value="Renewal">Renewal</option>
                        </select>
                      </td>
                      <td className="p-2 flex gap-2">
                        <button onClick={handleUpdate} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Save">
                          <Check size={14} />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="Cancel">
                          <X size={14} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 text-xs font-medium text-slate-500">{entry.date}</td>
                      <td className="p-3 text-xs font-bold text-slate-700">{entry.team_member}</td>
                      <td className="p-3 text-xs font-bold text-slate-900">{entry.subscriber_name}</td>
                      <td className="p-3 text-xs font-medium text-slate-500">{entry.tiktok_handle}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded shadow-sm ${entry.type === 'New' ? 'bg-indigo-600 text-white' : 'bg-orange-500 text-white'}`}>
                          {entry.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button onClick={() => startEdit(entry)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
