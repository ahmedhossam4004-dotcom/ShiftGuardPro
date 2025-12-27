
import React from 'react';
import { Worker, AbsenceLog, Team } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DashboardProps {
  workers: Worker[];
  logs: AbsenceLog[];
  teamNames: Record<Team, string>;
  darkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ workers, logs, teamNames, darkMode }) => {
  const activeCount = workers.filter(w => w.status === 'Active').length;
  const awayCount = workers.filter(w => w.status === 'Away').length;
  const productivity = workers.length > 0 ? Math.round((activeCount / workers.length) * 100) : 0;

  // Peak Absence Time Data (last 12 hours of shifts)
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = (i + 8); // Start from 8 AM
    const count = logs.filter(l => {
      const h = new Date(l.startTime).getHours();
      return h === hour;
    }).length;
    return { hour: `${hour}:00`, count };
  });

  const recentActivity = logs.slice(0, 5).map(log => {
    const worker = workers.find(w => w.id === log.workerId);
    return { ...log, workerName: worker?.name, pc: worker?.pcNumber };
  });

  const COLORS = ['#3b82f6', '#ef4444'];
  const statusData = [
    { name: 'Active', value: activeCount },
    { name: 'Away', value: awayCount }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', val: workers.length, icon: 'fa-users', color: 'blue' },
          { label: 'Live Active', val: activeCount, icon: 'fa-check-circle', color: 'emerald' },
          { label: 'Live Away', val: awayCount, icon: 'fa-clock', color: 'rose' },
          { label: 'Effort %', val: `${productivity}%`, icon: 'fa-bolt', color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-3xl border shadow-sm flex items-center space-x-4 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            <div className={`p-3 rounded-2xl ${darkMode ? `bg-${stat.color}-900/30 text-${stat.color}-400` : `bg-${stat.color}-50 text-${stat.color}-600`}`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 rounded-[32px] border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
              <i className="fas fa-chart-line text-blue-500"></i>
              <span>Peak Absence Trends (Hourly)</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      color: darkMode ? '#f8fafc' : '#0f172a'
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-6 rounded-[32px] border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Recent Logged Movements</h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-100/50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-slate-400'}`}>
                      {act.pc?.split('-')[1]}
                    </div>
                    <div>
                      <p className={`text-sm font-bold transition-colors ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{act.workerName}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{new Date(act.startTime).toLocaleTimeString()} • {act.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-500">{Math.floor(act.duration / 60)}m {act.duration % 60}s</span>
                  </div>
                </div>
              )) : (
                <p className="text-center py-10 text-gray-400 font-medium">No movement logged today.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all"></div>
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Live Monitor</h3>
            <p className="text-3xl font-black mb-6">Healthy Ops</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-white/50 mb-1">ACTIVE</p>
                <p className="text-xl font-black text-blue-400">{activeCount}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-white/50 mb-1">AWAY</p>
                <p className="text-xl font-black text-rose-400">{awayCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
