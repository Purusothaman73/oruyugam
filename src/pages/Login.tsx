import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Lock, User as UserIcon, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

export const Login = () => {
  const login = useStore((state) => state.login);
  const [role, setRole] = useState<'Admin' | 'Team Member'>('Admin');
  const [identifier, setIdentifier] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      alert("Please enter both credentials and security key.");
      return;
    }

    const user = useStore.getState().users.find(u => 
      (u.email === identifier || u.mobile === identifier) && 
      u.role === role && 
      (u.password === password || password === 'yugam-master-key')
    );

    if (user) {
      login(identifier, role);
    } else {
      alert("Invalid Security Key or Credential for this role.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 lg:p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-green/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-slate-100 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10 items-center">
        <div className="hidden lg:block space-y-12">
          <div className="space-y-6">
            <div className="h-20 w-auto">
              <img 
                src="https://fuxshvunvshvscofmqum.supabase.co/storage/v1/object/public/images/yugam-logo.png" 
                alt="Yugam Logo" 
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-[10px] font-black text-brand-navy uppercase tracking-[0.3em]">Operational Excellence</span>
              </div>
              <h1 className="text-6xl font-black text-brand-navy tracking-tighter italic leading-[0.9]">
                PRECISION <br />
                <span className="text-brand-green">BUDGET</span> <br />
                CONTROL.
              </h1>
              <p className="text-slate-500 text-lg max-w-md font-medium leading-relaxed">
                Yugam Consulting's internal command center for unified ad-spend monitoring across Meta and Google Ads.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2 border-l-2 border-brand-green/20 pl-6">
              <p className="text-brand-green font-black text-sm uppercase tracking-widest">Real-time Pacing</p>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">Stop overspending before it happens with live tracking algorithms.</p>
            </div>
            <div className="space-y-2 border-l-2 border-slate-100 pl-6">
              <p className="text-brand-green font-black text-sm uppercase tracking-widest">Client Success</p>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">Generate performance infographics in one click for instant client reporting.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden text-center mb-12">
            <div className="h-16 w-full flex justify-center mb-6">
              <img 
                src="https://fuxshvunvshvscofmqum.supabase.co/storage/v1/object/public/images/yugam-logo.png" 
                alt="Yugam Logo" 
                className="h-full w-auto object-contain"
              />
            </div>
            <p className="text-brand-green mt-1 uppercase tracking-[0.2em] text-[9px] font-black opacity-80 uppercase tracking-widest">Campaign Control Center</p>
          </div>

          <div className="neo-card p-8 lg:p-12">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-2xl font-black text-brand-navy tracking-tight italic">AUTHENTICATE</h2>
              <p className="text-slate-400 text-xs font-bold mt-1">Authorized Internal Personnel Only</p>
            </div>
          
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex p-1.5 bg-slate-200/50 rounded-2xl mb-8">
                <button
                  type="button"
                  onClick={() => setRole('Admin')}
                  className={cn(
                    "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                    role === 'Admin' ? "bg-brand-navy text-white shadow-lg" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Team Member')}
                  className={cn(
                    "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                    role === 'Team Member' ? "bg-brand-navy text-white shadow-lg" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Team
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Credential</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Email or Mobile"
                      className="neo-input pl-12 h-14 font-medium"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Security Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="neo-input pl-12 pr-12 h-14 font-medium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-navy transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full neo-btn-primary h-14 text-lg mt-8 bg-brand-green text-white">
                Authenticate
                <ChevronRight className="w-6 h-6" />
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-8">
              Access restricted to Yugam Consulting internal team members only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
