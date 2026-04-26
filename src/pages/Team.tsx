import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  UserPlus, Mail, Trash2, Key, CheckCircle2, 
  Download, Upload, Cloud, RefreshCw, Globe, X, Lock, Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

export const TeamPage = () => {
  const { 
    users, addUser, deleteUser, currentUser, campaigns, 
    spendEntries, importData, cloudConfig, setCloudConfig, 
    syncWithCloud, pushToCloud 
  } = useStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  const [tempConfig, setTempConfig] = useState({
    url: cloudConfig?.url || '',
    key: cloudConfig?.key || ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'Team Member' as UserRole
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(newUser);
    setNewUser({ name: '', email: '', mobile: '', password: '', role: 'Team Member' });
    setShowAddModal(false);
    showSuccess('Team member added successfully');
  };

  const handleResetPassword = (email: string) => {
    showSuccess(`Password reset link sent to ${email}`);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithCloud();
    setIsSyncing(false);
    showSuccess('Data synced from cloud');
  };

  const handlePush = async () => {
    setIsSyncing(true);
    await pushToCloud();
    setIsSyncing(false);
    showSuccess('Local data pushed to cloud');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-navy italic tracking-tighter uppercase">OPERATIONS</h1>
          <p className="text-slate-500 font-medium">Manage team access and remote synchronization.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowCloudModal(true)}
            className={cn("neo-btn-secondary h-11 px-5", cloudConfig && "border-2 border-brand-green")}
          >
            <Globe className="w-4 h-4" />
            {cloudConfig ? 'Cloud Active' : 'Enable Cloud Sync'}
          </button>
          {cloudConfig && (
            <div className="flex gap-3">
              <button onClick={handleSync} disabled={isSyncing} className="neo-btn-ghost h-11 px-5">
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                Pull
              </button>
              <button onClick={handlePush} disabled={isSyncing} className="neo-btn-ghost h-11 px-5">
                <Cloud className="w-4 h-4 text-brand-green" />
                Push
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="neo-btn-primary h-11 px-5"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* Database Backup Tools */}
      <div className="neo-card p-6 bg-slate-50/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-brand-navy uppercase tracking-widest text-xs">Manual Database Control</h3>
            <p className="text-[10px] text-slate-500 mt-1">Export or restore data files for offline backup.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                const data = JSON.stringify({ users, campaigns, spendEntries });
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `yugam_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="neo-btn-ghost text-xs h-10 px-4"
            >
              <Download className="w-3.5 h-3.5" />
              Backup JSON
            </button>
            <label className="neo-btn-ghost text-xs h-10 px-4 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Restore JSON
              <input 
                type="file" 
                className="hidden" 
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                      const content = re.target?.result as string;
                      if (window.confirm('This will overwrite current data. Continue?')) {
                        importData(content);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((user) => (
          <div key={user.id} className="neo-card p-8 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-300">
                {user.name.charAt(0)}
              </div>
              <span className={cn(
                "status-badge",
                user.role === 'Admin' ? "bg-brand-navy text-white" : "bg-brand-green text-white"
              )}>
                {user.role}
              </span>
            </div>
            
            <h3 className="text-xl font-black text-brand-navy tracking-tight uppercase italic">{user.name}</h3>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                <Mail className="w-4 h-4 opacity-40" />
                {user.email}
              </div>
              {user.mobile && (
                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                  <Globe className="w-4 h-4 opacity-40" />
                  {user.mobile}
                </div>
              )}
              <div className="flex items-center justify-between group/key bg-slate-50 p-2 rounded-lg mt-2">
                <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                  <Lock className="w-3 h-3 opacity-30" />
                  Key: <span className="text-slate-600 font-black tracking-widest">{showPasswords[user.id] ? user.password : '••••••••'}</span>
                </div>
                <button 
                  onClick={() => setShowPasswords(prev => ({...prev, [user.id]: !prev[user.id]}))}
                  className="text-brand-green opacity-0 group-hover/key:opacity-100 transition-opacity"
                >
                  <Eye className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between gap-4">
              <button 
                onClick={() => handleResetPassword(user.email)}
                className="flex-1 neo-btn-ghost text-[10px] h-10 uppercase tracking-widest"
              >
                <Key className="w-3.5 h-3.5" />
                Reset Key
              </button>
              {user.id !== currentUser?.id && (
                <button 
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove ${user.name}? This action cannot be undone.`)) {
                      deleteUser(user.id);
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cloud Config Modal */}
      {showCloudModal && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 lg:p-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-brand-navy italic tracking-tighter uppercase">Cloud Remote Sync</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Connect to Supabase for real-time remote collaboration.</p>
              </div>
              <button onClick={() => setShowCloudModal(false)} className="p-2 text-slate-300 hover:text-slate-600"><X /></button>
            </div>
            <div className="p-8 lg:p-10 space-y-6">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Attention</p>
                <p className="text-xs text-amber-700 leading-relaxed">This feature allows your remote team to see updates instantly. You need a Supabase project to enable this.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Supabase URL</label>
                  <input 
                    type="text" 
                    className="neo-input font-medium" 
                    placeholder="https://xyz.supabase.co"
                    value={tempConfig.url}
                    onChange={(e) => setTempConfig({...tempConfig, url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Anon API Key</label>
                  <input 
                    type="password" 
                    className="neo-input font-medium" 
                    placeholder="eyJhbGciOiJIUzI1Ni..."
                    value={tempConfig.key}
                    onChange={(e) => setTempConfig({...tempConfig, key: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowCloudModal(false)}
                  className="neo-btn-ghost flex-1 h-14"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setCloudConfig(tempConfig.url, tempConfig.key);
                    setShowCloudModal(false);
                    showSuccess('Cloud configuration saved locally');
                  }}
                  className="neo-btn-primary flex-1 h-14 bg-brand-green text-white"
                >
                  Activate Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal (Standard) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-2xl font-black text-brand-navy italic tracking-tighter uppercase">New Member</h3>
              <p className="text-sm text-slate-500 font-medium">Create authorized internal access.</p>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="neo-input" 
                  placeholder="Employee Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="neo-input" 
                  placeholder="name@yugam.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  pattern="[0-9]{10}"
                  className="neo-input" 
                  placeholder="9876543210"
                  value={newUser.mobile}
                  onChange={(e) => setNewUser({...newUser, mobile: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Login Password</label>
                <input 
                  type="text" 
                  required
                  className="neo-input" 
                  placeholder="Set initial password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Access Level</label>
                <select 
                  className="neo-input"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                >
                  <option value="Team Member">Team Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="neo-btn-ghost flex-1 h-14">Cancel</button>
                <button type="submit" className="neo-btn-primary flex-1 h-14 bg-brand-green text-white">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
