
import React, { useState, useMemo, useEffect } from 'react';
import { Worker, Team, Role, AbsenceReason } from '../types';
import { TEAM_COLORS } from '../constants';

interface WorkerGridProps {
  workers: Worker[];
  onToggleStatus: (id: string, reason?: AbsenceReason) => void;
  onUpdateWorker: (id: string, updates: Partial<Worker>) => void;
  onDeleteWorker: (id: string) => void;
  onBulkAction: (team: Team | 'ALL', target: 'Active' | 'Away', reason?: AbsenceReason) => void;
  onAddWorker?: (worker: Worker) => void;
  teamNames: Record<Team, string>;
  role: Role;
  currentUsername: string;
  darkMode: boolean;
}

const WorkerGrid: React.FC<WorkerGridProps> = ({ workers, onToggleStatus, onUpdateWorker, onDeleteWorker, onBulkAction, onAddWorker, teamNames, role, currentUsername, darkMode }) => {
  const [activeTeam, setActiveTeam] = useState<Team | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => {
      if (role === 'User') {
        return w.name.toLowerCase().trim() === currentUsername.toLowerCase().trim();
      }
      const matchesTeam = activeTeam === 'ALL' || w.team === activeTeam;
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) || 
                           w.pcNumber.toLowerCase().includes(search.toLowerCase());
      return matchesTeam && matchesSearch;
    });
  }, [workers, activeTeam, search, role, currentUsername]);

  if (role === 'User') {
    const userWorker = filteredWorkers[0];
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] max-w-4xl mx-auto px-6 animate-fade-in">
        {!userWorker ? (
          <div className={`p-16 rounded-[48px] border-2 border-dashed text-center w-full shadow-2xl transition-all ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-100'}`}>
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-desktop text-blue-500 text-3xl"></i>
            </div>
            <h3 className="font-black text-2xl mb-4 tracking-tight">Workstation Unlinked</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
              Terminal identity <span className="text-blue-500">"{currentUsername}"</span> is not currently mapped <br/>
              to a physical PC Asset by an administrator.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-12">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-2">
                <i className="fas fa-shield-check text-[10px] mr-2 animate-pulse"></i>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">SECURE LIVE TERMINAL</span>
              </div>
              <h2 className={`text-5xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>Shift Control Monitor</h2>
            </div>
            
            <div className="relative group max-w-lg mx-auto transform scale-110">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[48px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <WorkerCard 
                  worker={userWorker} 
                  teamName={teamNames[userWorker.team]} 
                  onToggle={(reason) => onToggleStatus(userWorker.id, reason)} 
                  onEdit={(updates) => onUpdateWorker(userWorker.id, updates)} 
                  onDelete={() => onDeleteWorker(userWorker.id)} 
                  role={role} 
                  canControl={true} 
                  canEdit={false} 
                  darkMode={darkMode} 
                  isLarge={true}
                />
            </div>

            <div className={`p-8 rounded-[40px] border border-dashed text-center ${darkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-blue-50/20'}`}>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Operational Integrity</p>
               <p className="text-xs font-medium italic text-slate-400">"Only use the Confirm Return button when you have physically resumed your position at the workstation."</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
            <div className={`flex flex-1 p-1 rounded-2xl border shadow-sm overflow-x-auto scrollbar-hide transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
              <button onClick={() => setActiveTeam('ALL')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTeam === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Global View</button>
              {(Object.keys(teamNames) as Team[]).map((teamId) => (
                <button key={teamId} onClick={() => setActiveTeam(teamId)} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTeam === teamId ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>{teamNames[teamId]}</button>
              ))}
            </div>
            
            {(role === 'Owner' || role === 'Admin') && (
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className={`hidden sm:flex items-center space-x-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-slate-900 shadow-xl transition-all active:scale-95`}
                >
                  <i className="fas fa-plus"></i>
                  <span>New Station</span>
                </button>
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 group">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
            <input type="text" placeholder="Search staff or PC Assets..." className={`pl-11 pr-4 py-3 border rounded-2xl outline-none w-full shadow-sm font-bold transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-blue-500' : 'bg-white border-gray-200 focus:border-blue-500'}`} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          
          {(role === 'Owner' || role === 'Admin') && (
            <div className="flex gap-2">
              <button onClick={() => onBulkAction(activeTeam, 'Away', 'Meeting')} className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all ${darkMode ? 'bg-rose-950 text-rose-400 border border-rose-900/50' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>Bulk Away</button>
              <button onClick={() => onBulkAction(activeTeam, 'Active')} className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all ${darkMode ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>Bulk Back</button>
              <button onClick={() => setShowAddForm(true)} className="sm:hidden p-4 rounded-2xl bg-slate-900 text-white shadow-xl"><i className="fas fa-plus"></i></button>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (role === 'Owner' || role === 'Admin') && (
        <QuickAddForm onAdd={(w) => { onAddWorker?.(w); setShowAddForm(false); }} onCancel={() => setShowAddForm(false)} teamNames={teamNames} workers={workers} darkMode={darkMode} />
      )}

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 pb-12">
        {filteredWorkers.map(worker => (
          <WorkerCard key={worker.id} worker={worker} teamName={teamNames[worker.team]} onToggle={(reason) => onToggleStatus(worker.id, reason)} onEdit={(up) => onUpdateWorker(worker.id, up)} onDelete={() => onDeleteWorker(worker.id)} role={role} canControl={true} canEdit={role === 'Owner' || role === 'Admin'} darkMode={darkMode} />
        ))}
      </div>
    </div>
  );
};

const QuickAddForm: React.FC<{ onAdd: (w: Worker) => void; onCancel: () => void; teamNames: Record<Team, string>; workers: Worker[]; darkMode: boolean; }> = ({ onAdd, onCancel, teamNames, workers, darkMode }) => {
  const [name, setName] = useState('');
  const [pc, setPc] = useState('');
  const [team, setTeam] = useState<Team>('A');
  const [err, setErr] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const pcFormatted = pc.toUpperCase().startsWith('PC-') ? pc.toUpperCase() : `PC-${pc}`;
    if (workers.some(w => w.pcNumber === pcFormatted)) return setErr('PC ID is already assigned');
    if (!name || !pc) return setErr('All fields are required');
    
    onAdd({
      id: `worker-${Date.now()}`,
      name: name.trim(),
      pcNumber: pcFormatted,
      team,
      status: 'Active',
      totalAbsenceToday: 0
    });
  };

  return (
    <div className={`p-8 rounded-[40px] border-2 shadow-2xl animate-scale-up ${darkMode ? 'bg-slate-900 border-blue-900/30' : 'bg-white border-blue-100'}`}>
      <div className="flex items-center space-x-3 mb-6">
        <i className="fas fa-microchip text-blue-500"></i>
        <h3 className="font-black text-lg uppercase tracking-tight">Deploy New Station</h3>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div><label className="text-[10px] font-black uppercase text-slate-500 ml-1">PC Number</label><input autoFocus value={pc} onChange={e => setPc(e.target.value)} placeholder="e.g. 67" className={`w-full px-5 py-3 rounded-2xl border outline-none font-bold ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50'}`} /></div>
        <div><label className="text-[10px] font-black uppercase text-slate-500 ml-1">Staff Member</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className={`w-full px-5 py-3 rounded-2xl border outline-none font-bold ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50'}`} /></div>
        <div><label className="text-[10px] font-black uppercase text-slate-500 ml-1">Team Hub</label><select value={team} onChange={e => setTeam(e.target.value as Team)} className={`w-full px-5 py-3 rounded-2xl border outline-none font-black text-[11px] uppercase tracking-widest ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50'}`}>{Object.keys(teamNames).map(t => <option key={t} value={t}>{teamNames[t as Team]}</option>)}</select></div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Establish</button>
          <button type="button" onClick={onCancel} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-slate-600'}`}>Abort</button>
        </div>
      </form>
      {err && <p className="text-rose-500 text-[10px] font-black uppercase mt-3 ml-1 animate-pulse"><i className="fas fa-exclamation-triangle mr-1"></i>{err}</p>}
    </div>
  );
};

const WorkerCard: React.FC<{ worker: Worker; teamName: string; onToggle: (reason?: AbsenceReason) => void; onEdit: (updates: Partial<Worker>) => void; onDelete: () => void; role: Role; canControl: boolean; canEdit: boolean; darkMode: boolean; isLarge?: boolean; }> = ({ worker, teamName, onToggle, onEdit, onDelete, role, canControl, canEdit, darkMode, isLarge }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(worker.name);
  const [editPC, setEditPC] = useState(worker.pcNumber);
  const [showReasons, setShowReasons] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: any;
    if (worker.status === 'Away' && worker.lastAbsenceStart) {
      interval = setInterval(() => setElapsed(Math.floor((Date.now() - worker.lastAbsenceStart!) / 1000)), 1000);
    } else setElapsed(0);
    return () => clearInterval(interval);
  }, [worker.status, worker.lastAbsenceStart]);

  const formatTime = (seconds: number) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const REASONS: AbsenceReason[] = ['Break', 'Lunch', 'Meeting', 'Emergency', 'System Issue', 'Other'];

  const saveEdit = () => {
    onEdit({ name: editName, pcNumber: editPC.toUpperCase().startsWith('PC-') ? editPC.toUpperCase() : `PC-${editPC}` });
    setIsEditing(false);
  };

  return (
    <div className={`relative flex flex-col rounded-[32px] md:rounded-[40px] border transition-all duration-500 ${isLarge ? 'p-8 shadow-2xl' : 'shadow-sm'} ${worker.status === 'Away' ? (darkMode ? 'border-rose-900/50 bg-rose-950/20 shadow-inner' : 'border-rose-200 bg-rose-50/20 shadow-inner') : (darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100')}`}>
      <div className={`flex items-center justify-between px-4 pt-4 pb-2 ${isLarge ? 'mb-4' : ''}`}>
        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black text-white shadow-lg ${TEAM_COLORS[worker.team]}`}>{teamName.toUpperCase()}</div>
        {isEditing ? (
          <input className={`w-16 bg-transparent border-b-2 outline-none text-xs font-black ${darkMode ? 'text-white border-blue-500' : 'text-slate-800 border-blue-600'}`} value={editPC} onChange={(e) => setEditPC(e.target.value)} />
        ) : (
          <div className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{worker.pcNumber}</div>
        )}
      </div>

      <div className="px-4 pb-4">
        {isEditing ? (
          <input autoFocus className={`w-full text-xl font-black border-b-2 outline-none bg-transparent mb-2 ${darkMode ? 'text-white border-blue-500' : 'text-slate-800 border-blue-600'}`} value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} />
        ) : (
          <h4 className={`${isLarge ? 'text-3xl' : 'text-xl'} font-black truncate leading-tight mb-1 ${darkMode ? 'text-slate-50' : 'text-slate-950'}`}>{worker.name}</h4>
        )}
        <div className={`inline-flex items-center space-x-2 mt-2 px-3 py-1 rounded-full ${worker.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          <span className={`w-2 h-2 rounded-full ${worker.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
          <span className="text-[9px] font-black uppercase tracking-widest">{worker.status === 'Away' ? (worker.currentReason || 'OUT OF OFFICE') : 'OPERATIONAL'}</span>
        </div>
      </div>

      <div className={`px-4 mb-4 ${isLarge ? 'py-6' : 'py-2'}`}>
        <div className={`py-6 md:py-8 rounded-[32px] flex items-center justify-center border transition-all ${worker.status === 'Away' ? (darkMode ? 'bg-rose-950/40 border-rose-900/50' : 'bg-white border-rose-100 shadow-inner') : (darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-100')}`}>
          <span className={`font-mono ${isLarge ? 'text-6xl' : 'text-3xl md:text-4xl'} font-black ${worker.status === 'Away' ? 'text-rose-500' : (darkMode ? 'text-slate-700' : 'text-slate-300')}`}>{worker.status === 'Away' ? formatTime(elapsed) : '00:00'}</span>
        </div>
      </div>

      <div className="px-4 mb-6">
        {worker.status === 'Active' ? (
          role === 'User' ? (
             <div className={`w-full py-6 text-center rounded-[24px] border-2 border-dashed transition-all ${darkMode ? 'border-slate-800 text-slate-700' : 'border-slate-100 text-slate-300'}`}>
                <span className="text-[12px] font-black uppercase tracking-[0.4em]">SHIFT ACTIVE</span>
             </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowReasons(!showReasons)} 
                className={`w-full py-5 rounded-[24px] text-[10px] font-black text-white shadow-xl transition-all active:scale-[0.98] ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-950'} hover:bg-blue-600 hover:shadow-blue-900/30`}
              >
                RECORD ABSENCE
              </button>
              {showReasons && (
                <div className={`absolute bottom-full left-0 w-full mb-3 border rounded-[28px] shadow-2xl p-3 z-50 grid grid-cols-2 gap-2 animate-scale-up ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-slate-600'}`}>
                  {REASONS.map(r => <button key={r} onClick={() => { onToggle(r); setShowReasons(false); }} className={`text-[10px] font-black uppercase py-4 px-2 rounded-2xl transition-all ${darkMode ? 'hover:bg-slate-700 hover:text-blue-400' : 'hover:bg-blue-50 hover:text-blue-600'}`}>{r}</button>)}
                </div>
              )}
            </div>
          )
        ) : (
          <button 
            disabled={!canControl} 
            onClick={() => onToggle()} 
            className="w-full py-6 rounded-[24px] text-[11px] font-black text-white bg-emerald-600 shadow-2xl shadow-emerald-500/30 active:scale-[0.97] hover:bg-emerald-500 transition-all animate-pulse"
          >
            CONFIRM RETURN
          </button>
        )}
      </div>

      {!isLarge && (
        <div className={`mt-auto px-4 py-4 border-t flex justify-center space-x-8 transition-colors ${darkMode ? 'border-slate-800 bg-slate-800/20' : 'border-gray-50 bg-gray-50/40'}`}>
          {canEdit && (
            <>
              {isEditing ? (
                 <button onClick={saveEdit} className="text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400"><i className="fas fa-check mr-2"></i>Apply</button>
              ) : (
                <button onClick={() => setIsEditing(true)} className={`flex items-center space-x-2 text-[10px] font-bold uppercase transition-colors ${darkMode ? 'text-slate-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'}`}><i className="fas fa-edit text-[9px]"></i><span>Modify</span></button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="flex items-center space-x-2 text-[10px] font-bold uppercase text-gray-400 hover:text-rose-600 transition-colors"><i className="fas fa-trash text-[9px]"></i><span>Eject</span></button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerGrid;
