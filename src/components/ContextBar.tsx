import React from 'react';
import { SessionContext } from '../types';

interface ContextBarProps {
  context: SessionContext;
  onChange: (context: SessionContext) => void;
}

const INSTRUCTORS = ["Mary Joy", "Kingpower", "Jerry Ekpo"];
const TARGET_ACCOUNTS = ["HA", "MDP"];

export default function ContextBar({ context, onChange }: ContextBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...context, [name]: value });
  };

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-wrap">
      <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Team Member</label>
        <input 
          type="text" 
          name="team_member" 
          placeholder="Enter name..." 
          value={context.team_member} 
          onChange={handleChange} 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400" 
        />
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Team</label>
        <select name="team" value={context.team} onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="A">Team A</option>
          <option value="B">Team B</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Instructor</label>
        <select name="instructor" value={context.instructor} onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="">Select...</option>
          {INSTRUCTORS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Target Account</label>
        <select name="target_account" value={context.target_account} onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="">Select...</option>
          {TARGET_ACCOUNTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1 w-40">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Entry Date</label>
        <input type="date" name="date" value={context.date} onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20" />
      </div>
    </div>
  );
}
