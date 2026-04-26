import { useStore } from '../store/useStore';
import { formatCurrency, cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Award, Target, MousePointer2, Users } from 'lucide-react';

export const ClientReport = ({ campaignId, onClose }: { campaignId: string, onClose: () => void }) => {
  const { getCampaignsWithStats, spendEntries } = useStore();
  const campaign = getCampaignsWithStats().find(c => c.id === campaignId);
  
  if (!campaign) return null;

  const history = spendEntries
    .filter(s => s.campaignId === campaignId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(s => ({
      date: new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      spend: s.amount,
      leads: s.metrics?.leads || 0,
      clicks: s.metrics?.clicks || 0
    }));

  const totalLeads = history.reduce((sum, h) => sum + h.leads, 0);
  const totalClicks = history.reduce((sum, h) => sum + h.clicks, 0);
  const avgCPL = totalLeads > 0 ? campaign.totalSpent / totalLeads : 0;

  return (
    <div className="fixed inset-0 bg-brand-navy/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="absolute top-8 right-8">
        <button onClick={onClose} className="text-white/50 hover:text-white font-black uppercase tracking-widest text-xs">Close Report</button>
      </div>

      <div id="capture-area" className="bg-[#f5f7fa] w-full max-w-4xl rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border-[6px] lg:border-[12px] border-white relative">
        {/* Branding Header */}
        <div className="bg-brand-navy p-6 lg:p-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <TrendingUp className="text-brand-green w-6 h-6" />
              </div>
              <h1 className="text-xl lg:text-2xl font-black italic tracking-tighter uppercase">YUGAM</h1>
            </div>
            <p className="text-white opacity-60 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em]">Campaign Performance Infographic</p>
          </div>
          <div className="lg:text-right">
            <h2 className="text-xl lg:text-2xl font-black tracking-tighter uppercase">{campaign.brandName}</h2>
            <p className="text-white/50 text-[10px] lg:text-xs font-bold">{campaign.campaignName}</p>
          </div>
        </div>

        <div className="p-6 lg:p-10 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white">
              <div className="flex items-center gap-2 mb-3 text-emerald-600">
                <Award className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Total Spend</span>
              </div>
              <p className="text-2xl font-black text-brand-navy">{formatCurrency(campaign.totalSpent)}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white">
              <div className="flex items-center gap-2 mb-3 text-indigo-600">
                <Target className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Total Leads</span>
              </div>
              <p className="text-2xl font-black text-brand-navy">{totalLeads}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white">
              <div className="flex items-center gap-2 mb-3 text-brand-gold">
                <MousePointer2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Avg. CPL</span>
              </div>
              <p className="text-2xl font-black text-brand-navy">{formatCurrency(avgCPL)}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white">
              <div className="flex items-center gap-2 mb-3 text-rose-600">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Total Clicks</span>
              </div>
              <p className="text-2xl font-black text-brand-navy">{totalClicks}</p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white p-4 lg:p-8 rounded-[2rem] lg:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
              <h3 className="font-black text-brand-navy italic tracking-tighter">SPEND VS. PERFORMANCE TREND</h3>
              <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-brand-green">
                  <div className="w-3 h-3 rounded-full bg-brand-green" /> Daily Spend
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <div className="w-3 h-3 rounded-full bg-slate-800" /> Daily Leads
                </div>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#788023" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#788023" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e293b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="spend" stroke="#788023" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={4} />
                  <Area type="monotone" dataKey="leads" stroke="#1e293b" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-between items-center px-6 py-4 bg-brand-navy/5 rounded-2xl border border-white">
            <p className="text-[10px] font-black text-brand-navy/40 uppercase tracking-[0.2em]">Generated via Yugam Consulting Command Center • {new Date().toLocaleDateString()}</p>
            <div className="flex items-center gap-2">
              <div className={cn("status-badge", campaign.platform === 'Meta' ? 'bg-blue-600 text-white' : 'bg-brand-navy text-white')}>
                {campaign.platform}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest text-center">Tip: Use Command+Shift+4 (Mac) or Win+Shift+S (Windows) to capture and share.</p>
      </div>
    </div>
  );
};
