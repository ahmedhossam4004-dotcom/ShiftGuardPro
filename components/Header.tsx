
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  lastUpdated: Date;
  darkMode: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  syncing?: boolean;
  lastSyncTime?: number;
  bridgeActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, lastUpdated, darkMode, onToggleTheme, onToggleSidebar, syncing, lastSyncTime, bridgeActive = true }) => {
  const [syncStatus, setSyncStatus] = useState('Syncing...');

  useEffect(() => {
    if (!bridgeActive) {
      setSyncStatus('Bridge Inactive');
      return;
    }

    if (syncing) {
      setSyncStatus('Syncing Cloud...');
    } else if (lastSyncTime) {
      const updateText = () => {
        const diff = Math.floor((Date.now() - lastSyncTime) / 1000);
        if (diff < 5) setSyncStatus('Just synced');
        else if (diff < 60) setSyncStatus(`Synced ${diff}s ago`);
        else setSyncStatus(`Synced ${Math.floor(diff / 60)}m ago`);
      };
      updateText();
      const interval = setInterval(updateText, 5000);
      return () => clearInterval(interval);
    }
  }, [syncing, lastSyncTime, bridgeActive]);

  return (
    <header className={`h-16 border-b px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center space-x-3 md:space-x-4">
        <button onClick={onToggleSidebar} className={`lg:hidden p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}>
          <i className="fas fa-bars text-lg"></i>
        </button>

        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${!bridgeActive ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : (darkMode ? 'bg-blue-500/10 border-blue-900/30 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600')}`}>
          <div className={`w-2 h-2 rounded-full ${!bridgeActive ? 'bg-amber-500' : (syncing ? 'bg-blue-400 animate-spin' : 'bg-blue-500 animate-pulse')}`}></div>
          <span className="font-black text-[9px] uppercase tracking-widest whitespace-nowrap">
            {syncStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <button onClick={onToggleTheme} className={`p-2.5 rounded-xl transition-all ${darkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
          <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>

        <div className="flex items-center space-x-3 border-r pr-4 hidden sm:flex">
          <div className="text-right">
            <p className={`text-sm font-black ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{user.username}</p>
            <p className="text-[9px] uppercase tracking-widest font-black text-blue-500">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <button onClick={onLogout} className={`p-2.5 rounded-lg transition-colors ${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
          <i className="fas fa-right-from-bracket text-lg"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
