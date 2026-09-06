/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ContextBar from './components/ContextBar';
import CycleTracker from './components/CycleTracker';
import Uploader from './components/Uploader';
import ReportGenerator from './components/ReportGenerator';
import RecentEntries from './components/RecentEntries';
import ToastContainer from './components/ToastContainer';
import { ToastProvider } from './lib/ToastContext';
import { SessionContext } from './types';
import { format } from 'date-fns';

export default function App() {
  const [currentView, setCurrentView] = useState<'upload' | 'recent'>('upload');
  
  // Try to load context from localStorage if available
  const getInitialContext = (): SessionContext => {
    const saved = localStorage.getItem('minos_session_context');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // keep date dynamic for "today"
        return { ...parsed, date: format(new Date(), 'yyyy-MM-dd') };
      } catch (e) {}
    }
    return {
      team_member: '',
      team: 'A',
      instructor: '',
      target_account: '',
      date: format(new Date(), 'yyyy-MM-dd')
    };
  };

  const [context, setContext] = useState<SessionContext>(getInitialContext);

  useEffect(() => {
    localStorage.setItem('minos_session_context', JSON.stringify(context));
  }, [context]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-12">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h1 className="font-bold text-lg tracking-tight">TT-SubTracker</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ContextBar context={context} onChange={setContext} />
            </div>
            <div className="lg:col-span-1">
              <CycleTracker teamMember={context.team_member} />
            </div>
          </div>

          <div className="flex border-b border-slate-200 mt-2">
            <button 
              className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${currentView === 'upload' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              onClick={() => setCurrentView('upload')}
            >
              Upload & Report
            </button>
            <button 
              className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${currentView === 'recent' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              onClick={() => setCurrentView('recent')}
            >
              Recent Entries
            </button>
          </div>

          {currentView === 'upload' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Uploader context={context} />
              </div>
              <div>
                <ReportGenerator context={context} />
              </div>
            </div>
          ) : (
            <div className="h-[500px]">
              <RecentEntries />
            </div>
          )}
        </main>
      </div>
      <ToastContainer />
    </ToastProvider>
  );
}

