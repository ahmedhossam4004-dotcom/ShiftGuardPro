
import React, { useState } from 'react';
import { Worker, Team, Role } from '../types';

interface SettingsProps {
  workers: Worker[];
  onAddWorker: (worker: Worker) => void;
  teamNames: Record<Team, string>;
  onRenameTeam: (team: Team, newName: string) => void;
  onFlushLogs: () => void;
  onResetToInitial: () => void;
  onManualSync: () => void;
  syncing: boolean;
  role: Role;
  darkMode: boolean;
  bridgeActive: boolean;
  onToggleBridge: () => void;
}

const Settings: React.FC<SettingsProps> = ({ workers, onAddWorker, teamNames, onRenameTeam, onFlushLogs, onResetToInitial, onManualSync, syncing, role, darkMode, bridgeActive, onToggleBridge }) => {
  const [editingTeams, setEditingTeams] = useState(false);
  
  // New Worker Form State
  const [newName, setNewName] = useState('');
  const [newPC, setNewPC] = useState('');
  const [newTeam, setNewTeam] = useState<Team>('A');
  const [error, setError] = useState('');

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newName.trim() || !newPC.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const pcFormatted = newPC.toUpperCase().startsWith('PC-') ? newPC.toUpperCase() : `PC-${newPC}`;
    
    if (workers.some(w => w.pcNumber === pcFormatted)) {
      setError('PC Number already assigned to another worker.');
      return;
    }

    const newWorker: Worker = {
      id: `worker-${Date.now()}`,
      pcNumber: pcFormatted,
      name: newName.trim(),
      team: newTeam,
      status: 'Active',
      totalAbsenceToday: 0
    };

    onAddWorker(newWorker);
    setNewName('');
    setNewPC('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Cloud Bridge Panel */}
      <div className={`p-8 rounded-[40px] border shadow-xl transition-all ${!bridgeActive ? 'bg-amber-950/10 border-amber-900/30' : (darkMode ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50 border-blue-100')}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg transition-colors ${!bridgeActive ? 'bg-amber-600' : 'bg-blue-600'} ${syncing && bridgeActive ? 'animate-pulse' : ''}`}>
              <i className={`fas ${!bridgeActive ? 'fa-link-slash' : (syncing ? 'fa-sync fa-spin' : 'fa-satellite-dish')}`}></i>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">{bridgeActive ? 'Cloud Bridge Active' : 'Cloud Bridge Suspended'}</h3>
              <p className="text-xs text-slate-500 font-bold">Project Node: ggmafmuqjdhdhrhwupew</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             {role === 'Owner' && (
                <button 
                  onClick={onToggleBridge}
                  className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${bridgeActive ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                >
                   {bridgeActive ? 'Suspend Global Bridge' : 'Reactivate Global Bridge'}
                </button>
             )}
             <button 
              onClick={onManualSync}
              disabled={syncing || !bridgeActive}
              className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-900 text-white hover:bg-slate-800'} ${(syncing || !bridgeActive) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <i className={`fas ${syncing ? 'fa-sync fa-spin' : 'fa-rotate'} mr-2`}></i> 
              Force Sync
            </button>
          </div>
        </div>
        <p className={`mt-6 p-4 rounded-2xl text-[10px] font-bold leading-relaxed border border-dashed ${darkMode ? 'bg-slate-900/30 border-slate-800 text-slate-500' : 'bg-white/50 border-blue-100 text-slate-400'}`}>
          {bridgeActive 
            ? 'Heartbeat synchronization active. High-frequency updates configured to automatically broadcast changes every 7 seconds.'
            : 'Operational Halt: The Cloud Bridge is currently suspended. Data changes made locally will not sync across the network until the Owner reactivates the node.'}
        </p>
      </div>

      {/* Add Worker Section */}
      <div className={`rounded-[40px] border shadow-sm p-8 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-100'}`}>
        <h2 className="text-2xl font-black mb-8 flex items-center">
          <i className="fas fa-user-plus text-blue-500 mr-3"></i>
          Personnel Enrollment
        </h2>
        <form onSubmit={handleAddWorker} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Worker Name</label>
            <input 
              type="text" 
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl border outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200 focus:border-blue-500'}`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PC Number</label>
            <input 
              type="text" 
              placeholder="e.g. 67"
              value={newPC}
              onChange={(e) => setNewPC(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl border outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200 focus:border-blue-500'}`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Team</label>
            <select 
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value as Team)}
              className={`w-full px-4 py-3 rounded-2xl border outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200 focus:border-blue-500'}`}
            >
              {(Object.keys(teamNames) as Team[]).map(t => <option key={t} value={t}>{teamNames[t]}</option>)}
            </select>
          </div>
          <button type="submit" className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-900/20 hover:bg-blue-500 active:scale-95 transition-all">
            Enroll Staff
          </button>
        </form>
        {error && <p className="mt-4 text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">{error}</p>}
      </div>

      <div className={`rounded-[40px] border shadow-sm p-8 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-100'}`}>
         <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black flex items-center">
              <i className="fas fa-sitemap text-blue-500 mr-3"></i>
              Operations Hub
            </h2>
            <button 
              onClick={() => setEditingTeams(!editingTeams)} 
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${darkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}
            >
              {editingTeams ? 'Lock Configuration' : 'Edit Structure'}
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(teamNames) as Team[]).map(tId => (
               <div key={tId} className={`flex items-center p-5 rounded-3xl border transition-all ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black mr-4 ${tId === 'A' ? 'bg-blue-600' : tId === 'B' ? 'bg-purple-600' : tId === 'C' ? 'bg-emerald-600' : 'bg-orange-600'}`}>
                    {tId}
                  </div>
                  {editingTeams ? (
                    <input 
                      className={`flex-1 bg-transparent border-b font-bold py-1 outline-none transition-colors ${darkMode ? 'border-slate-700 text-white focus:border-blue-500' : 'border-gray-300 text-slate-800 focus:border-blue-500'}`}
                      value={teamNames[tId]}
                      onChange={(e) => onRenameTeam(tId, e.target.value)}
                    />
                  ) : (
                    <span className="font-bold flex-1">{teamNames[tId]}</span>
                  )}
               </div>
            ))}
         </div>
      </div>

      {role === 'Owner' && (
        <div className={`rounded-[40px] border p-10 transition-colors ${darkMode ? 'bg-rose-950/10 border-rose-900/30' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <i className="fas fa-radiation text-rose-500 text-2xl"></i>
            <h3 className={`text-xl font-black ${darkMode ? 'text-rose-400' : 'text-rose-900'}`}>Danger Zone</h3>
          </div>
          <p className="text-sm mb-8 opacity-70 font-medium">Resetting these parameters will update all linked devices globally. All existing staff data will be synchronized across the cloud node.</p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => {
                if(confirm("Flush all operational logs for all connected devices?")) onFlushLogs();
              }} 
              className="px-8 py-4 bg-white border border-rose-200 text-rose-600 font-black rounded-2xl hover:bg-rose-600 hover:text-white transition-all text-xs uppercase tracking-widest shadow-sm"
            >
              Flush Global Logs
            </button>
            <button 
              onClick={() => {
                if(confirm("This will restore the original 66 workers and wipe any custom staff. Proceed?")) onResetToInitial();
              }} 
              className="px-8 py-4 bg-white border border-rose-200 text-rose-600 font-black rounded-2xl hover:bg-rose-600 hover:text-white transition-all text-xs uppercase tracking-widest shadow-sm"
            >
              Global Roster Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
