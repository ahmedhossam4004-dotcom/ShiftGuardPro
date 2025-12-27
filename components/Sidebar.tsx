
import React from 'react';
import { Role } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onToggle: () => void;
  role: Role;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange, onToggle, role }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', roles: ['Owner', 'Admin'] },
    { id: 'workers', label: 'Tracking Grid', icon: 'fa-users' },
    { id: 'reports', label: 'Activity Logs', icon: 'fa-file-lines' },
    { id: 'loginlogs', label: 'Login Logs', icon: 'fa-key', roles: ['Owner'] },
    { id: 'registrationlogs', label: 'Registered Users', icon: 'fa-user-lock', roles: ['Owner'] },
    { id: 'settings', label: 'Configuration', icon: 'fa-gears', roles: ['Owner'] },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-slate-900 text-white transition-all duration-300 z-50 
      ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}>
      
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800">
        <div className={`flex items-center space-x-3 overflow-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0 w-0'}`}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-halved"></i>
          </div>
          <span className="font-bold text-lg whitespace-nowrap">ShiftGuard</span>
        </div>
        <button onClick={onToggle} className="p-3 hover:bg-slate-800 rounded-lg transition-colors lg:p-2">
          <i className={`fas ${isOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
        </button>
      </div>

      <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-140px)]">
        {menuItems.map((item) => {
          if (item.roles && !item.roles.includes(role)) return null;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center p-4 rounded-xl transition-all lg:p-3 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-6 text-center text-xl lg:text-lg`}></i>
              <span className={`ml-4 font-bold text-base lg:text-sm overflow-hidden whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-0 w-full px-4">
        <div className={`bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 transition-all ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center space-x-2 mb-2">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{role} ACCESS</span>
          </div>
          <p className="text-[10px] text-slate-500">Authorized node active. Monitoring 66 stations.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
