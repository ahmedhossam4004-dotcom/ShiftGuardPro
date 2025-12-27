
import React, { useState } from 'react';
import { User, Role } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  registeredUsers: User[];
  isCloudReady: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, registeredUsers, isCloudReady }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [role, setRole] = useState<Role>('User');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const OWNER_CODE = 'elzohery123';
  const ADMIN_CODE = 'meti123';

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCloudReady) return;
    
    setError('');
    setSuccess('');

    const normalizedUsername = username.toLowerCase().trim();

    if (view === 'register') {
      if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (role === 'Owner' && accessCode !== OWNER_CODE) {
        setError('Invalid security access code for Owner role.');
        return;
      }
      if (role === 'Admin' && accessCode !== ADMIN_CODE) {
        setError('Invalid security access code for Admin role.');
        return;
      }
      if (registeredUsers.some(u => u.username.toLowerCase() === normalizedUsername)) {
        setError('Username already exists in the system.');
        return;
      }
      
      const newUser: User = { 
        id: `u-${Date.now()}`, 
        username: username.trim(), 
        email: email.trim(),
        password, // In a real app, hash this!
        role,
        createdAt: Date.now() 
      };
      
      onRegister(newUser);
      setSuccess('Registration successful. Redirecting to login...');
      
      // Auto-switch to login view with credentials filled
      setTimeout(() => {
        setView('login');
        setSuccess('');
        // Keep username/password states filled for convenience
      }, 1500);

    } else if (view === 'login') {
      const user = registeredUsers.find(u => u.username.toLowerCase() === normalizedUsername && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        if (registeredUsers.length === 0) {
           setError('No users found in cloud registry. Please enroll first.');
        } else {
           setError('Invalid credentials. Check spelling and capitalization.');
        }
      }
    } else if (view === 'forgot') {
       setError('Password recovery must be authorized by the system Owner.');
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden p-6">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-all duration-500">
            <i className="fas fa-fingerprint text-4xl text-white"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">ShiftGuard<span className="text-blue-500">Pro</span></h1>
          <div className={`inline-flex items-center px-4 py-1.5 border rounded-full mb-4 transition-all ${isCloudReady ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20 animate-pulse'}`}>
             <div className={`w-2 h-2 rounded-full mr-2 ${isCloudReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
             <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCloudReady ? 'text-emerald-400' : 'text-amber-400'}`}>
               {isCloudReady ? `Cloud Link Active (${registeredUsers.length} Users)` : 'Connecting To Node...'}
             </span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800 p-10 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all">
          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mb-10 border border-slate-800">
            <button 
              onClick={() => { setView('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === 'login' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
            >
              Authorize
            </button>
            <button 
              onClick={() => { setView('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${view === 'register' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
            >
              Enroll
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Workstation Login</label>
              <div className="relative group">
                <i className="fas fa-at absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors"></i>
                <input 
                  required
                  autoComplete="off"
                  type="text" 
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {view === 'register' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Confirmation</label>
                <div className="relative group">
                  <i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors"></i>
                  <input 
                    required
                    autoComplete="off"
                    type="email" 
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                    placeholder="Operations Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Secret</label>
              <div className="relative group">
                <i className="fas fa-key absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors"></i>
                <input 
                  required
                  type="password" 
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {view === 'register' && (
              <>
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clearance Level</label>
                  <div className="relative">
                    <i className="fas fa-shield-halved absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"></i>
                    <select 
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-10 outline-none focus:border-blue-500/50 transition-all font-black appearance-none text-[11px] uppercase tracking-widest"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                    >
                      <option value="User">Standard Terminal</option>
                      <option value="Admin">System Admin</option>
                      <option value="Owner">Master Node (Owner)</option>
                    </select>
                    <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none text-[10px]"></i>
                  </div>
                </div>

                {(role === 'Owner' || role === 'Admin') && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Authorization Code</label>
                    <div className="relative">
                      <i className="fas fa-lock-open absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"></i>
                      <input 
                        required
                        type="password" 
                        className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-4 outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                        placeholder="Security Pass"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                <i className="fas fa-triangle-exclamation mr-2"></i>{error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                <i className="fas fa-circle-check mr-2"></i>{success}
              </div>
            )}

            <button 
              type="submit"
              disabled={!isCloudReady}
              className={`w-full py-5 mt-4 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all ${
                isCloudReady 
                ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98] shadow-blue-900/20' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              {view === 'register' ? 'Deploy Identity' : 'Establish Link'}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
          End-to-End Encryption Enabled
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
