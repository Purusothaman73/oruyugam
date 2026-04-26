import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  History, 
  AlertTriangle, 
  Users, 
  LogOut,
  X,
  Menu,
  Award
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const { currentUser, logout } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = currentUser?.role === 'Admin';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Megaphone, label: 'Campaigns', path: '/campaigns' },
    { icon: Award, label: 'Portfolio', path: '/portfolio' },
    { icon: History, label: 'Spend History', path: '/history' },
    { icon: AlertTriangle, label: 'Alerts', path: '/alerts' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: Users, label: 'Team', path: '/team' });
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2 h-full py-3">
          <img 
            src="https://fuxshvunvshvscofmqum.supabase.co/storage/v1/object/public/images/yugam-logo.png" 
            alt="Yugam Logo" 
            className="h-full w-auto object-contain"
          />
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-brand-navy">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      <div className={cn(
        "fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsOpen(false)} />

      {/* Sidebar Container */}
      <div className={cn(
        "h-screen w-72 bg-white text-brand-navy flex flex-col fixed left-0 top-0 shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-[60] transition-transform duration-500 ease-out lg:translate-x-0 border-r border-slate-100",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div className="h-12 w-full">
            <img 
              src="https://fuxshvunvshvscofmqum.supabase.co/storage/v1/object/public/images/yugam-logo.png" 
              alt="Yugam Logo" 
              className="h-full w-auto object-contain"
            />
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-brand-navy">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? "bg-brand-green text-white font-black shadow-xl shadow-brand-green/20" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-brand-green"
              )}
            >
              <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-white font-black text-sm">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black truncate tracking-tight">{currentUser?.name}</p>
              <p className="text-[9px] text-brand-green font-black uppercase tracking-widest truncate">{currentUser?.role}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 px-5 py-4 w-full rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
