
import React, { useState, useMemo } from 'react';
import { AbsenceLog, Worker, Team, AbsenceReason, Role } from '../types';
import { GoogleGenAI } from "@google/genai";
import { TEAM_COLORS } from '../constants';

interface ReportingProps {
  logs: AbsenceLog[];
  workers: Worker[];
  teamNames: Record<Team, string>;
  darkMode: boolean;
  userRole: Role;
  currentUsername: string;
  onDeleteLog: (id: string) => void;
}

const Reporting: React.FC<ReportingProps> = ({ logs, workers, teamNames, darkMode, userRole, currentUsername, onDeleteLog }) => {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchName, setSearchName] = useState('');
  const [teamFilter, setTeamFilter] = useState<Team | 'ALL'>('ALL');
  const [reasonFilter, setReasonFilter] = useState<AbsenceReason | 'ALL'>('ALL');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const worker = workers.find(w => w.id === log.workerId);
      
      // Strict User Logic: Only see their own logs
      const isSelf = userRole === 'User' ? worker?.name.toLowerCase().trim() === currentUsername.toLowerCase().trim() : true;
      if (!isSelf) return false;

      const matchesDate = log.date === filterDate;
      const matchesName = !searchName || worker?.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesTeam = teamFilter === 'ALL' || worker?.team === teamFilter;
      const matchesReason = reasonFilter === 'ALL' || log.reason === reasonFilter;
      return matchesDate && matchesName && matchesTeam && matchesReason;
    });
  }, [logs, filterDate, searchName, teamFilter, reasonFilter, workers, userRole, currentUsername]);

  const stats = useMemo(() => {
    const totalSec = filteredLogs.reduce((acc, l) => acc + l.duration, 0);
    const reasonCounts: Record<string, number> = {};
    filteredLogs.forEach(l => reasonCounts[l.reason] = (reasonCounts[l.reason] || 0) + 1);
    const topReason = Object.entries(reasonCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    return {
      totalTime: `${Math.floor(totalSec / 3600)}h ${Math.floor((totalSec % 3600) / 60)}m`,
      avgTime: filteredLogs.length ? `${Math.floor((totalSec / filteredLogs.length) / 60)}m` : '0m',
      topReason
    };
  }, [filteredLogs]);

  const generateAIInsight = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = `Shift Data: ${filterDate}, Total Absences: ${filteredLogs.length}, Total Downtime: ${stats.totalTime}, Most Common Reason: ${stats.topReason}. Analyze for trends.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: summary,
        config: { systemInstruction: 'Brief operations summary for ShiftGuard users.' }
      });
      setAiInsight(response.text || 'No data.');
    } catch (err) { setAiInsight("Analysis failed."); } finally { setIsGenerating(false); }
  };

  const REASONS: AbsenceReason[] = ['Break', 'Lunch', 'Meeting', 'Emergency', 'System Issue', 'Other'];
  const canDelete = userRole === 'Owner' || userRole === 'Admin';

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className={`text-2xl font-black transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {userRole === 'User' ? 'My Activity History' : 'Shift Activity Logs'}
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            {userRole === 'User' ? 'Your personal shift tracking metrics' : 'Global operational audit across all stations'}
          </p>
        </div>
        <button 
          onClick={generateAIInsight} 
          disabled={isGenerating} 
          className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg disabled:opacity-50 transition-colors w-full md:w-auto ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          {isGenerating ? 'Analyzing...' : 'AI Insights'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Downtime', val: stats.totalTime, color: 'blue' },
          { label: 'Total Logs', val: filteredLogs.length, color: 'indigo' },
          { label: 'Avg Duration', val: stats.avgTime, color: 'emerald' },
          { label: 'Primary Reason', val: stats.topReason, color: 'amber' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-2xl border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-lg md:text-xl font-black transition-colors ${darkMode ? `text-${s.color}-400` : `text-${s.color}-600`}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {aiInsight && (
        <div className={`p-5 rounded-2xl border animate-scale-up ${darkMode ? 'bg-blue-950/20 border-blue-900/50 text-blue-100' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <i className="fas fa-robot text-blue-500"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">AI Productivity Analysis</span>
          </div>
          <p className="text-sm font-medium italic">"{aiInsight}"</p>
        </div>
      )}

      <div className={`p-4 md:p-6 rounded-[32px] border shadow-sm space-y-6 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1 w-full md:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className={`block w-full px-4 py-2 border rounded-xl font-bold text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-gray-200'}`} />
          </div>
          
          {userRole !== 'User' && (
            <>
              <div className="space-y-1 flex-1 min-w-[200px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Staff</label>
                <input placeholder="Name or PC..." value={searchName} onChange={e => setSearchName(e.target.value)} className={`w-full px-4 py-2 border rounded-xl font-bold text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-gray-200'}`} />
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <div className="space-y-1 flex-1 md:w-40">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team</label>
                  <select value={teamFilter} onChange={e => setTeamFilter(e.target.value as any)} className={`block w-full px-4 py-2 border rounded-xl font-bold text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-gray-200'}`}>
                    <option value="ALL">All Teams</option>
                    {(Object.keys(teamNames) as Team[]).map(t => <option key={t} value={t}>{teamNames[t]}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className={`space-y-1 ${userRole === 'User' ? 'w-full md:w-40' : 'flex-1 md:w-40'}`}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
            <select value={reasonFilter} onChange={e => setReasonFilter(e.target.value as any)} className={`block w-full px-4 py-2 border rounded-xl font-bold text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-gray-200'}`}>
              <option value="ALL">All Reasons</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Mobile-First Card View */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {filteredLogs.length > 0 ? filteredLogs.map(log => {
            const w = workers.find(work => work.id === log.workerId);
            return (
              <div key={log.id} className={`p-4 rounded-2xl border flex flex-col gap-3 transition-colors ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${w ? TEAM_COLORS[w.team] : 'bg-gray-400'}`}>
                      {w?.pcNumber.split('-')[1]}
                    </span>
                    <div>
                      <p className={`text-sm font-black transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{w?.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{w ? teamNames[w.team] : 'N/A'}</p>
                    </div>
                  </div>
                  {canDelete && (
                    <button onClick={() => onDeleteLog(log.id)} className="text-rose-500 p-1">
                      <i className="fas fa-trash-can"></i>
                    </button>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                   <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg w-fit mb-1 ${
                        log.reason === 'Emergency' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'
                      }`}>{log.reason}</span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {log.endTime ? new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </span>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Downtime</p>
                      <p className={`text-sm font-black ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {Math.floor(log.duration / 60)}m {log.duration % 60}s
                      </p>
                   </div>
                </div>
              </div>
            );
          }) : (
            <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No activity found</p>
          )}
        </div>

        {/* Desktop Table View */}
        <div className={`hidden lg:block overflow-hidden rounded-2xl border transition-colors ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <table className="w-full text-left">
            <thead className={`text-[10px] uppercase font-black tracking-widest transition-colors ${darkMode ? 'bg-slate-800/50 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4 text-right">Downtime</th>
                {canDelete && <th className="px-6 py-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${darkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {filteredLogs.length > 0 ? filteredLogs.map(log => {
                const w = workers.find(work => work.id === log.workerId);
                return (
                  <tr key={log.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${w ? TEAM_COLORS[w.team] : 'bg-gray-400'}`}>
                          {w?.pcNumber.split('-')[1]}
                        </span>
                        <div>
                          <p className={`text-sm font-black transition-colors ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{w?.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{w ? teamNames[w.team] : 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                        log.reason === 'Emergency' ? (darkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-600') :
                        log.reason === 'Lunch' ? (darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600') :
                        (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')
                      }`}>
                        {log.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500">
                        <span>{new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <i className="fas fa-arrow-right text-[8px] opacity-30"></i>
                        <span>{log.endTime ? new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-black transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {Math.floor(log.duration / 60)}m <span className="text-slate-500">{log.duration % 60}s</span>
                      </span>
                    </td>
                    {canDelete && (
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => onDeleteLog(log.id)}
                          className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-950/30' : 'text-gray-300 hover:text-rose-600 hover:bg-rose-50'}`}
                        >
                          <i className="fas fa-trash-can text-sm"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={canDelete ? 5 : 4} className="py-20 text-center text-gray-400 font-medium">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
