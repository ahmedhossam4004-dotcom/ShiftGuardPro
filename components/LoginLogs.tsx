
import React from 'react';
import { LoginLog } from '../types';

interface LoginLogsProps {
  logs: LoginLog[];
  darkMode: boolean;
  onDeleteLog: (id: string) => void;
}

const LoginLogs: React.FC<LoginLogsProps> = ({ logs, darkMode, onDeleteLog }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className={`p-6 md:p-8 rounded-[40px] border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className={`text-2xl font-black transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Security Access Logs</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Audit trail of all system authentication events</p>
          </div>
          <div className={`px-4 py-2 rounded-2xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-200 text-slate-500'}`}>
            <span className="text-xs font-black">{logs.length} SESSIONS RECORDED</span>
          </div>
        </div>

        {/* Mobile View: Card Layout */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {logs.length > 0 ? logs.map(log => (
            <div key={log.id} className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    {log.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`text-sm font-black ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{log.username}</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                      log.role === 'Owner' ? 'border-rose-500/30 text-rose-500' :
                      log.role === 'Admin' ? 'border-amber-500/30 text-amber-500' :
                      'border-blue-500/30 text-blue-500'
                    }`}>
                      {log.role}
                    </span>
                  </div>
                </div>
                <button onClick={() => onDeleteLog(log.id)} className="text-slate-400 hover:text-rose-500 p-2"><i className="fas fa-trash-can"></i></button>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 border-t border-slate-700/30 pt-3">
                <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center text-slate-500 font-black text-[10px] uppercase tracking-widest">No access history</div>
          )}
        </div>

        {/* Desktop View: Table Layout */}
        <div className={`hidden md:block overflow-hidden rounded-3xl border transition-colors ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <table className="w-full text-left">
            <thead className={`text-[10px] uppercase font-black tracking-widest transition-colors ${darkMode ? 'bg-slate-800/50 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
              <tr>
                <th className="px-8 py-5">User</th>
                <th className="px-8 py-5">Authorized Role</th>
                <th className="px-8 py-5">Access Timestamp</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${darkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {logs.length > 0 ? logs.map(log => (
                <tr key={log.id} className={`transition-all ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                        {log.username.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-sm font-black ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{log.username}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                      log.role === 'Owner' ? 'border-rose-500/30 bg-rose-500/10 text-rose-500' :
                      log.role === 'Admin' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
                      'border-blue-500/30 bg-blue-500/10 text-blue-500'
                    }`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => onDeleteLog(log.id)}
                      className={`p-2.5 rounded-xl transition-all ${darkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-950/30' : 'text-gray-300 hover:text-rose-600 hover:bg-rose-50'}`}
                    >
                      <i className="fas fa-trash-can text-sm"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-24 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest">No access history recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoginLogs;
