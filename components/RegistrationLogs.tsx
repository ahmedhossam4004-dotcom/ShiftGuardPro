
import React from 'react';
import { User } from '../types';

interface RegistrationLogsProps {
  users: User[];
  darkMode: boolean;
  onDeleteUser: (id: string) => void;
}

const RegistrationLogs: React.FC<RegistrationLogsProps> = ({ users, darkMode, onDeleteUser }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`p-8 rounded-[40px] border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`text-2xl font-black transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>System Account Audit</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Full access control & credential recovery</p>
          </div>
          <div className={`px-4 py-2 rounded-2xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-200 text-slate-500'}`}>
            <span className="text-xs font-black">{users.length} SECURE NODES REGISTERED</span>
          </div>
        </div>

        <div className={`overflow-x-auto rounded-3xl border transition-colors ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <table className="w-full text-left min-w-[900px]">
            <thead className={`text-[10px] uppercase font-black tracking-widest transition-colors ${darkMode ? 'bg-slate-800/50 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
              <tr>
                <th className="px-6 py-5">User Identity</th>
                <th className="px-6 py-5">Email Address</th>
                <th className="px-6 py-5">Recovery Password</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Creation</th>
                <th className="px-6 py-5 text-center">Security</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${darkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {[...users].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)).map(user => (
                <tr key={user.id} className={`transition-all ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-sm font-black ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-xs font-medium transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {user.email || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <code className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${darkMode ? 'bg-slate-800 text-blue-400' : 'bg-gray-100 text-blue-600'}`}>
                      {user.password || '********'}
                    </code>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                      user.role === 'Owner' ? 'border-rose-500 text-rose-500' :
                      user.role === 'Admin' ? 'border-amber-500 text-amber-500' :
                      'border-blue-500 text-blue-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-xs font-bold transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'System'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-rose-600 transition-colors"
                      title="Terminate Access"
                    >
                      <i className="fas fa-user-slash text-sm"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistrationLogs;
