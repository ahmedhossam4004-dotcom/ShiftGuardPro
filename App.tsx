
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Worker, AbsenceLog, Role, Team, AbsenceReason, LoginLog } from './types';
import { INITIAL_WORKERS } from './constants';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WorkerGrid from './components/WorkerGrid';
import Reporting from './components/Reporting';
import Settings from './components/Settings';
import LoginLogs from './components/LoginLogs';
import RegistrationLogs from './components/RegistrationLogs';
import ConfirmationModal from './components/ConfirmationModal';

const SUPABASE_URL = 'https://ggmafmuqjdhdhrhwupew.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbWFmbXVxamRoZGhyaHd1cGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTQzMTYsImV4cCI6MjA4MjA5MDMxNn0.LLiAOrASoDpOD65oMGsmDlXLf_-NIWjQMs5Ed-cwr1A';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'confirm' | 'alert';
  isDestructive: boolean;
  onConfirm: () => void;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sg_user');
    return saved ? JSON.parse(saved) : null;
  });

  const sortWorkers = useCallback((list: Worker[]) => {
    return [...list].sort((a, b) => {
      const numA = parseInt(a.pcNumber.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.pcNumber.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, []);

  const [workers, setWorkers] = useState<Worker[]>(sortWorkers(INITIAL_WORKERS));
  const [logs, setLogs] = useState<AbsenceLog[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [teamNames, setTeamNames] = useState<Record<Team, string>>({ A: 'Team A', B: 'Team B', C: 'Team C', D: 'Team D' });
  const [bridgeActive, setBridgeActive] = useState(true);

  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('sg_theme') === 'dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workers' | 'reports' | 'settings' | 'loginlogs' | 'registrationlogs'>(() => {
    if (localStorage.getItem('sg_user')) {
      const user = JSON.parse(localStorage.getItem('sg_user')!) as User;
      return user.role === 'User' ? 'workers' : 'dashboard';
    }
    return 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [isCloudReady, setIsCloudReady] = useState(false);
  
  const isSyncingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastPushedDataRef = useRef<string>('');
  const isDirtyRef = useRef(false);

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    isDestructive: false,
    onConfirm: () => {},
  });

  const showPopup = (title: string, message: string, type: 'confirm' | 'alert', onConfirm: () => void, isDestructive = false) => {
    setModal({ isOpen: true, title, message, type, onConfirm, isDestructive });
  };
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  /**
   * TRANSACTIONAL PUSH
   */
  const pushToCloud = useCallback(async (forcedPayload?: any) => {
    // If not initialized, don't push.
    // NOTE: We do NOT block if isSyncingRef is true if this is a FORCED push (user action).
    // This ensures user deletes/adds are not swallowed by a background pull.
    if (!hasInitializedRef.current) return;
    
    const activeState = forcedPayload ? forcedPayload.bridgeActive : bridgeActive;
    if (activeState === false && currentUser?.role !== 'Owner') return;
    
    const payload = forcedPayload || {
      workers: sortWorkers(workers),
      logs,
      registeredUsers,
      teamNames,
      loginLogs,
      bridgeActive,
      lastUpdated: Date.now()
    };

    const currentDataString = JSON.stringify(payload);
    
    if (currentDataString === lastPushedDataRef.current && !forcedPayload) {
        isDirtyRef.current = false;
        return;
    }

    isSyncingRef.current = true;
    setSyncing(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sync?id=eq.global-state`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ payload })
      });
      
      const result = await response.json();
      if (response.status === 404 || (Array.isArray(result) && result.length === 0)) {
        await fetch(`${SUPABASE_URL}/rest/v1/sync`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: 'global-state', payload })
        });
      }
      lastPushedDataRef.current = currentDataString;
      isDirtyRef.current = false; // Successfully synced
      setLastSyncTime(Date.now());
    } catch (e) {
      console.error("Cloud Transaction Failed:", e);
      // Keep isDirty true so auto-retry picks it up
    } finally {
      setSyncing(false);
      isSyncingRef.current = false;
    }
  }, [workers, logs, registeredUsers, teamNames, loginLogs, bridgeActive, currentUser, sortWorkers]);

  /**
   * ROBUST HEARTBEAT PULL
   */
  const pullFromCloud = useCallback(async (isInitial = false) => {
    if (isSyncingRef.current) return;
    
    // 1. Initial Dirty Check: Don't start pull if we have unsaved work
    if (isDirtyRef.current && !isInitial) return;
    
    setSyncing(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/sync?id=eq.global-state`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      });
      const data = await response.json();
      
      // 2. Post-Fetch Double Check (The "Zombie Fix")
      // If user performed an action (setting isDirty=true) WHILE the fetch was happening,
      // we MUST discard this fetch result, otherwise we overwrite their action.
      if (isDirtyRef.current && !isInitial) {
        console.warn("Sync conflict detected: Local changes prioritize over background pull.");
        return; 
      }
      
      if (data && data[0] && data[0].payload) {
        const cloudData = data[0].payload;
        
        if (cloudData.bridgeActive === false && currentUser?.role !== 'Owner') {
          setBridgeActive(false);
        }

        setWorkers(sortWorkers(cloudData.workers || INITIAL_WORKERS));
        setLogs(cloudData.logs || []);
        setRegisteredUsers(cloudData.registeredUsers || []);
        setTeamNames(cloudData.teamNames || { A: 'Team A', B: 'Team B', C: 'Team C', D: 'Team D' });
        setLoginLogs(cloudData.loginLogs || []);
        setBridgeActive(cloudData.bridgeActive !== undefined ? cloudData.bridgeActive : true);
        setLastSyncTime(Date.now());
        
        lastPushedDataRef.current = JSON.stringify(cloudData);
        // Only set dirty to false if we successfully applied cloud state
        // (Logic: we are now clean relative to cloud)
        isDirtyRef.current = false;

        if (isInitial) {
          hasInitializedRef.current = true;
          setIsCloudReady(true);
        }
      } else if (isInitial) {
        hasInitializedRef.current = true;
        setIsCloudReady(true);
        pushToCloud(); 
      }
    } catch (e) {
      console.error("Cloud Sync Error:", e);
    } finally {
      setSyncing(false);
    }
  }, [currentUser, sortWorkers, pushToCloud]);

  useEffect(() => {
    pullFromCloud(true);
    const interval = setInterval(() => {
      pullFromCloud();
    }, 7000); 
    return () => clearInterval(interval);
  }, [pullFromCloud]);

  useEffect(() => {
    if (hasInitializedRef.current && currentUser && isDirtyRef.current && !isSyncingRef.current) {
      const timeoutId = setTimeout(() => {
        pushToCloud();
      }, 1000); 
      return () => clearTimeout(timeoutId);
    }
  }, [workers, logs, registeredUsers, teamNames, loginLogs, bridgeActive, pushToCloud, currentUser]);

  useEffect(() => {
    localStorage.setItem('sg_theme', darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // --- TRANSACTIONAL HANDLERS (Calc -> Set -> Push) ---

  const handleRegisterUser = (newUser: User) => {
    isDirtyRef.current = true;
    const nextUsers = [...registeredUsers, newUser];
    setRegisteredUsers(nextUsers);
    
    pushToCloud({
      workers: sortWorkers(workers),
      logs,
      registeredUsers: nextUsers,
      teamNames,
      loginLogs,
      bridgeActive,
      lastUpdated: Date.now()
    });
  };

  const handleLogin = (user: User) => {
    isDirtyRef.current = true;
    const newLog: LoginLog = { id: `login-${Date.now()}`, username: user.username, role: user.role, timestamp: Date.now() };
    const nextLoginLogs = [newLog, ...loginLogs];
    
    setLoginLogs(nextLoginLogs);
    
    pushToCloud({
      workers: sortWorkers(workers),
      logs,
      registeredUsers,
      teamNames,
      loginLogs: nextLoginLogs,
      bridgeActive,
      lastUpdated: Date.now()
    });

    setCurrentUser(user);
    localStorage.setItem('sg_user', JSON.stringify(user));
    setActiveTab(user.role === 'User' ? 'workers' : 'dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sg_user');
  };

  const deleteWorker = useCallback((id: string) => {
    isDirtyRef.current = true;
    // Calc
    const nextWorkers = workers.filter(w => w.id !== id);
    // Set
    setWorkers(nextWorkers);
    // Push
    pushToCloud({
        workers: sortWorkers(nextWorkers),
        logs,
        registeredUsers,
        teamNames,
        loginLogs,
        bridgeActive,
        lastUpdated: Date.now()
    });
  }, [workers, logs, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud]);

  const handleAddWorker = useCallback((newWorker: Worker) => {
    isDirtyRef.current = true;
    const nextWorkers = sortWorkers([...workers, newWorker]);
    setWorkers(nextWorkers);
    pushToCloud({
        workers: nextWorkers,
        logs,
        registeredUsers,
        teamNames,
        loginLogs,
        bridgeActive,
        lastUpdated: Date.now()
    });
  }, [workers, logs, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud]);

  const toggleWorkerStatus = useCallback((workerId: string, reason: AbsenceReason = 'Other') => {
    if (!bridgeActive && currentUser?.role !== 'Owner') {
      showPopup('Operation Halt', 'The Cloud Bridge is currently suspended. Action denied.', 'alert', () => {});
      return;
    }

    isDirtyRef.current = true;
    const now = Date.now();
    let nextLogs = [...logs];
    const nextWorkers = workers.map(w => {
      if (w.id === workerId) {
        if (w.status === 'Active') {
          return { ...w, status: 'Away' as const, lastAbsenceStart: now, currentReason: reason };
        } else {
          const duration = Math.floor((now - (w.lastAbsenceStart || now)) / 1000);
          const newLog: AbsenceLog = {
            id: `log-${now}-${w.id}`,
            workerId: w.id,
            startTime: w.lastAbsenceStart || now,
            endTime: now,
            duration: Math.max(0, duration),
            reason: w.currentReason || 'Other',
            date: new Date().toISOString().split('T')[0]
          };
          nextLogs = [newLog, ...nextLogs];
          return { 
            ...w, 
            status: 'Active' as const, 
            lastAbsenceStart: undefined, 
            currentReason: undefined, 
            totalAbsenceToday: w.totalAbsenceToday + Math.max(0, duration) 
          };
        }
      }
      return w;
    });

    setWorkers(sortWorkers(nextWorkers));
    setLogs(nextLogs);

    pushToCloud({
      workers: sortWorkers(nextWorkers),
      logs: nextLogs,
      registeredUsers,
      teamNames,
      loginLogs,
      bridgeActive,
      lastUpdated: now
    });
  }, [workers, logs, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud, currentUser]);

  const handleBulkAction = useCallback((targetTeam: Team | 'ALL', targetStatus: 'Active' | 'Away', reason: AbsenceReason = 'Other') => {
    if (!bridgeActive && currentUser?.role !== 'Owner') return;

    isDirtyRef.current = true;
    const now = Date.now();
    let nextLogs = [...logs];
    
    const nextWorkers = workers.map(w => {
      if (targetTeam === 'ALL' || w.team === targetTeam) {
        if (w.status === targetStatus) return w;
        if (targetStatus === 'Away') {
          return { ...w, status: 'Away' as const, lastAbsenceStart: now, currentReason: reason };
        } else {
          const duration = Math.floor((now - (w.lastAbsenceStart || now)) / 1000);
          const newLog: AbsenceLog = {
            id: `log-${now}-${w.id}`,
            workerId: w.id,
            startTime: w.lastAbsenceStart || now,
            endTime: now,
            duration: Math.max(0, duration),
            reason: w.currentReason || 'Other',
            date: new Date().toISOString().split('T')[0]
          };
          nextLogs = [newLog, ...nextLogs];
          return { 
            ...w, 
            status: 'Active' as const, 
            lastAbsenceStart: undefined, 
            currentReason: undefined, 
            totalAbsenceToday: w.totalAbsenceToday + Math.max(0, duration)
          };
        }
      }
      return w;
    });

    setWorkers(sortWorkers(nextWorkers));
    setLogs(nextLogs);

    pushToCloud({
      workers: sortWorkers(nextWorkers),
      logs: nextLogs,
      registeredUsers,
      teamNames,
      loginLogs,
      bridgeActive,
      lastUpdated: now
    });
  }, [workers, logs, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud, currentUser]);

  const handleToggleBridge = () => {
    if (currentUser?.role !== 'Owner') return;
    const nextState = !bridgeActive;
    setBridgeActive(nextState);
    isDirtyRef.current = true;
    pushToCloud({
      workers: sortWorkers(workers),
      logs,
      registeredUsers,
      teamNames,
      loginLogs,
      bridgeActive: nextState,
      lastUpdated: Date.now()
    });
  };

  // --- NEW FEATURES & DELETION HANDLERS ---

  const handleDeleteLog = useCallback((id: string) => {
    isDirtyRef.current = true;
    const nextLogs = logs.filter(l => l.id !== id);
    setLogs(nextLogs);
    pushToCloud({
        workers: sortWorkers(workers),
        logs: nextLogs, // Use new
        registeredUsers,
        teamNames,
        loginLogs,
        bridgeActive,
        lastUpdated: Date.now()
    });
  }, [logs, workers, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud]);

  const handleDeleteLoginLog = useCallback((id: string) => {
    isDirtyRef.current = true;
    const nextLoginLogs = loginLogs.filter(l => l.id !== id);
    setLoginLogs(nextLoginLogs);
    pushToCloud({
        workers: sortWorkers(workers),
        logs,
        registeredUsers,
        teamNames,
        loginLogs: nextLoginLogs, // Use new
        bridgeActive,
        lastUpdated: Date.now()
    });
  }, [logs, workers, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud]);

  const handleDeleteRegisteredUser = useCallback((id: string) => {
    isDirtyRef.current = true;
    const nextUsers = registeredUsers.filter(u => u.id !== id);
    setRegisteredUsers(nextUsers);
    pushToCloud({
        workers: sortWorkers(workers),
        logs,
        registeredUsers: nextUsers, // Use new
        teamNames,
        loginLogs,
        bridgeActive,
        lastUpdated: Date.now()
    });
  }, [logs, workers, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud]);

  const handleRenameTeam = useCallback((team: Team, newName: string) => {
    isDirtyRef.current = true;
    const nextTeams = { ...teamNames, [team]: newName };
    setTeamNames(nextTeams);
    pushToCloud({
        workers: sortWorkers(workers),
        logs,
        registeredUsers,
        teamNames: nextTeams, // Use new
        loginLogs,
        bridgeActive,
        lastUpdated: Date.now()
    });
  }, [logs, workers, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud]);

  const handleFlushLogs = useCallback(() => {
    isDirtyRef.current = true;
    setLogs([]);
    pushToCloud({
        workers: sortWorkers(workers),
        logs: [],
        registeredUsers,
        teamNames,
        loginLogs,
        bridgeActive,
        lastUpdated: Date.now()
    });
  }, [workers, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud]);

  const handleResetSystem = useCallback(() => {
    isDirtyRef.current = true;
    const resetWorkers = sortWorkers(INITIAL_WORKERS);
    setWorkers(resetWorkers);
    pushToCloud({
        workers: resetWorkers,
        logs,
        registeredUsers,
        teamNames,
        loginLogs,
        bridgeActive,
        lastUpdated: Date.now()
    });
  }, [logs, registeredUsers, teamNames, loginLogs, bridgeActive, sortWorkers, pushToCloud]);

  const handleManualSync = useCallback(() => {
    // If dirty, push first to save changes, then pull.
    if (isDirtyRef.current) {
        pushToCloud();
    } else {
        pullFromCloud();
    }
  }, [pushToCloud, pullFromCloud]);

  const handleUpdateWorker = (id: string, updates: Partial<Worker>) => {
    isDirtyRef.current = true;
    const nextWorkers = workers.map(w => w.id === id ? {...w, ...updates} : w);
    setWorkers(sortWorkers(nextWorkers));
    pushToCloud({
        workers: sortWorkers(nextWorkers),
        logs,
        registeredUsers,
        teamNames,
        loginLogs,
        bridgeActive,
        lastUpdated: Date.now()
    });
  };

  return (
    <div className={`flex h-[100dvh] overflow-hidden transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      <ConfirmationModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} isDestructive={modal.isDestructive} onConfirm={modal.onConfirm} onCancel={closeModal} darkMode={darkMode} />

      {!currentUser ? (
        <LoginPage onLogin={handleLogin} onRegister={handleRegisterUser} registeredUsers={registeredUsers} isCloudReady={isCloudReady} />
      ) : (
        <>
          {isSidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
          <Sidebar isOpen={isSidebarOpen} activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} role={currentUser.role} />
          <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
            <Header user={currentUser} onLogout={handleLogout} lastUpdated={new Date(lastSyncTime)} darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} syncing={syncing} lastSyncTime={lastSyncTime} bridgeActive={bridgeActive} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth scrollbar-hide">
              {activeTab === 'dashboard' && <Dashboard workers={workers} logs={logs} teamNames={teamNames} darkMode={darkMode} />}
              {activeTab === 'workers' && <WorkerGrid workers={workers} onToggleStatus={toggleWorkerStatus} onUpdateWorker={handleUpdateWorker} onDeleteWorker={deleteWorker} onBulkAction={handleBulkAction} onAddWorker={handleAddWorker} teamNames={teamNames} role={currentUser.role} currentUsername={currentUser.username} darkMode={darkMode} />}
              {activeTab === 'reports' && <Reporting logs={logs} workers={workers} teamNames={teamNames} darkMode={darkMode} userRole={currentUser.role} currentUsername={currentUser.username} onDeleteLog={handleDeleteLog} />}
              {activeTab === 'settings' && <Settings workers={workers} onAddWorker={handleAddWorker} teamNames={teamNames} onRenameTeam={handleRenameTeam} onFlushLogs={handleFlushLogs} onResetToInitial={handleResetSystem} onManualSync={handleManualSync} syncing={syncing} role={currentUser.role} darkMode={darkMode} bridgeActive={bridgeActive} onToggleBridge={handleToggleBridge} />}
              {activeTab === 'loginlogs' && <LoginLogs logs={loginLogs} darkMode={darkMode} onDeleteLog={handleDeleteLoginLog} />}
              {activeTab === 'registrationlogs' && <RegistrationLogs users={registeredUsers} darkMode={darkMode} onDeleteUser={handleDeleteRegisteredUser} />}
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
