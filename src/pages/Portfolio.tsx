import { useStore } from '../store/useStore';
import { formatCurrency, cn } from '../lib/utils';
import { 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Award, Target, Briefcase, TrendingUp, ShieldCheck } from 'lucide-react';

export const Portfolio = () => {
  const { getCampaignsWithStats, spendEntries } = useStore();
  const campaigns = getCampaignsWithStats();
  
  // Aggregate Stats
  const totalBudget = campaigns.reduce((sum, c) => sum + c.totalBudget, 0);
  
  const totalLeads = spendEntries.reduce((sum, s) => sum + (s.metrics?.leads || 0), 0);
  const cumulativeSpent = spendEntries.reduce((sum, s) => sum + s.amount, 0);
  
  const clients = Array.from(new Set(campaigns.map(c => c.clientName)));
  const brands = Array.from(new Set(campaigns.map(c => c.brandName)));

  const platformData = [
    { name: 'Meta Ads', value: campaigns.filter(c => c.platform === 'Meta').length, color: '#4f46e5' },
    { name: 'Google Ads', value: campaigns.filter(c => c.platform === 'Google').length, color: '#788023' },
  ];

  const highlights = [
    { label: 'Enterprises Managed', value: clients.length, icon: Briefcase, color: 'text-indigo-600' },
    { label: 'Cumulative Budget', value: formatCurrency(totalBudget), icon: ShieldCheck, color: 'text-brand-green' },
    { label: 'Actual Spend Executed', value: formatCurrency(cumulativeSpent), icon: TrendingUp, color: 'text-slate-800' },
    { label: 'Conversion Success', value: totalLeads, icon: Target, color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Branding */}
      <div className="relative h-64 lg:h-80 bg-brand-navy rounded-[3rem] overflow-hidden flex items-center justify-center text-center p-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-10 w-64 h-64 bg-brand-green blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-white blur-[120px] rounded-full" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-2xl rotate-3">
            <TrendingUp className="text-brand-green w-8 h-8 -rotate-3" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter italic">AGENCY PORTFOLIO</h1>
          <p className="text-brand-green font-black uppercase tracking-[0.4em] text-[10px] lg:text-xs">Yugam Consulting Performance Track Record</p>
        </div>
      </div>

      {/* High Level Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {highlights.map((h, i) => (
          <div key={i} className="neo-card p-8 text-center hover:scale-105 transition-transform">
            <div className={cn("w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6", h.color)}>
              <h.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.label}</p>
            <h3 className="text-2xl font-black text-brand-navy mt-1 tracking-tighter">{h.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Managed Brands */}
        <div className="neo-card p-10">
          <div className="flex items-center gap-3 mb-8">
            <Award className="text-brand-green w-6 h-6" />
            <h3 className="text-xl font-black text-brand-navy italic tracking-tighter uppercase">Brands Managed</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {brands.map((brand, i) => (
              <span key={i} className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-50 text-xs font-bold text-slate-600">
                {brand}
              </span>
            ))}
            {brands.length === 0 && <p className="text-slate-400 text-sm italic">No campaigns recorded yet.</p>}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="neo-card p-10">
          <h3 className="text-xl font-black text-brand-navy italic tracking-tighter uppercase mb-8">Ecosystem Reach</h3>
          <div className="flex items-center gap-12">
            <div className="w-1/2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4">
              {platformData.map((p, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.name}</span>
                    <span className="text-sm font-black text-brand-navy">{p.value} Projects</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-green" style={{ width: `${(p.value / campaigns.length) * 100 || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="neo-card p-10 bg-brand-green text-white flex flex-col lg:flex-row justify-between items-center gap-8 text-center lg:text-left">
        <div className="space-y-2">
          <h3 className="text-3xl font-black italic tracking-tighter">Ready to showcase?</h3>
          <p className="opacity-80 font-medium max-w-md text-sm">This profile is generated in real-time based on your successfully executed campaigns. Screenshot this page to share your agency's scale with potential clients.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-white text-brand-green px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-black/10 hover:scale-105 transition-transform"
        >
          Export Agency Deck
        </button>
      </div>
    </div>
  );
};
