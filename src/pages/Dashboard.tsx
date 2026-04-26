import { 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  Wallet, 
  ArrowUpRight, 
  Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatPercent, cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const Dashboard = () => {
  const { getCampaignsWithStats, users, currentUser } = useStore();
  const campaigns = getCampaignsWithStats();
  const isAdmin = currentUser?.role === 'Admin';

  const getOwnerInfo = (id: string) => {
    const user = users.find(u => u.id === id);
    return user || { name: 'Unknown', color: '#cbd5e1' };
  };
  
  const totalBudget = campaigns.reduce((sum, c) => sum + c.totalBudget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalRemaining = totalBudget - totalSpent;
  
  const lowBudgetCampaigns = campaigns.filter(c => (c.remainingBalance / c.totalBudget) < 0.2 && c.status === 'Active');
  const endingToday = campaigns.filter(c => c.remainingDays === 0 && c.status === 'Active');
  const rechargeNeeded = campaigns.filter(c => c.status === 'Recharge Needed' || c.topupRequired);

  const stats = [
    { 
      label: 'Live Campaigns', 
      value: campaigns.filter(c => c.status === 'Active').length, 
      icon: MegaphoneIcon, 
      color: 'bg-slate-800' 
    },
    { 
      label: 'Total Budget', 
      value: formatCurrency(totalBudget), 
      icon: Wallet, 
      color: 'bg-brand-green' 
    },
    { 
      label: 'Total Spend', 
      value: formatCurrency(totalSpent), 
      icon: TrendingUp, 
      color: 'bg-slate-700' 
    },
    { 
      label: 'Remaining', 
      value: formatCurrency(totalRemaining), 
      icon: ArrowUpRight, 
      color: 'bg-brand-green/80' 
    },
  ];

  const alerts = [
    { label: 'Low Budget', count: lowBudgetCampaigns.length, color: 'text-amber-500', icon: AlertCircle },
    { label: 'Ending Today', count: endingToday.length, color: 'text-red-500', icon: Clock },
    { label: 'Recharge Needed', count: rechargeNeeded.length, color: 'text-orange-500', icon: Calendar },
  ];

  const chartData = campaigns.slice(0, 5).map(c => ({
    name: c.campaignName.substring(0, 15) + '...',
    spent: c.totalSpent,
    budget: c.totalBudget,
  }));

  const platformData = [
    { name: 'Meta', value: campaigns.filter(c => c.platform === 'Meta').length },
    { name: 'Google', value: campaigns.filter(c => c.platform === 'Google').length },
  ];

  const COLORS = ['#1e293b', '#fbbf24'];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-brand-navy tracking-tighter italic">COMMAND CENTER</h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time advertising performance & financial control.</p>
        </div>
        <div className="flex gap-3 bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-white">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Global Pacing</p>
            <p className="text-2xl font-black text-brand-navy">{formatPercent((totalSpent / totalBudget) * 100)}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="neo-card p-8 flex flex-col justify-between hover:scale-105 transition-transform duration-500">
            <div className={cn("w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg mb-6", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-brand-navy mt-1 tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Outstanding Payments Alert */}
      {campaigns.filter(c => c.paymentStatus === 'Pending').length > 0 && (
        <div className="neo-card p-8 border-l-8 border-rose-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-xl font-black text-rose-600 italic tracking-tighter uppercase">Payment Due Alert</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns
              .filter(c => c.paymentStatus === 'Pending')
              .map(c => (
                <div key={c.id} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black text-rose-900 uppercase tracking-tight">{c.clientName}</p>
                    <p className="text-[10px] text-rose-600 font-bold tracking-widest">{c.brandName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-rose-900">{formatCurrency(c.totalBudget)}</p>
                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-tighter" style={{ color: getOwnerInfo(c.assignedTo).color }}>{getOwnerInfo(c.assignedTo).name.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Payment Verification Required (Marked Paid but not Admin Acknowledged) */}
      {campaigns.filter(c => c.paymentStatus === 'Paid' && !c.adminAcknowledged).length > 0 && (
        <div className="neo-card p-8 border-l-8 border-amber-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-xl font-black text-amber-600 italic tracking-tighter uppercase">Verification Required</h3>
          </div>
          <p className="text-xs text-amber-700 font-medium mb-4">Client states payment is done, but Admin hasn't acknowledged credit yet. Team members: verify proof of payment.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns
              .filter(c => c.paymentStatus === 'Paid' && !c.adminAcknowledged)
              .map(c => (
                <div key={c.id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black text-amber-900 uppercase tracking-tight">{c.clientName}</p>
                    <p className="text-[10px] text-amber-600 font-bold tracking-widest">{c.paymentMode} on {c.paymentDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-amber-900">{formatCurrency(c.totalBudget)}</p>
                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-tighter" style={{ color: getOwnerInfo(c.assignedTo).color }}>{getOwnerInfo(c.assignedTo).name.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Live Operations Feed */}
      <div className="neo-card p-8 bg-slate-50/30">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
          <h3 className="text-xl font-black text-brand-navy italic tracking-tighter uppercase">Operations Pulse</h3>
        </div>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
          {[...useStore.getState().spendEntries]
            .sort((a, b) => b.id.localeCompare(a.id)) // Real apps use timestamps
            .slice(0, 10)
            .map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-white shadow-sm animate-in fade-in slide-in-from-left duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                    {entry.enteredBy.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-brand-navy">
                      {entry.enteredBy} <span className="font-medium text-slate-400">updated spend for</span> 
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: users.find(u => u.name === entry.enteredBy)?.color || '#788023' }}>
                      {useStore.getState().campaigns.find(c => c.id === entry.campaignId)?.campaignName || 'Campaign'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-brand-navy">{formatCurrency(entry.amount)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          {useStore.getState().spendEntries.length === 0 && (
            <div className="text-center py-12 text-slate-400 italic">No activity recorded today.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 neo-card p-8">
          <h3 className="text-xl font-black text-brand-navy mb-8 tracking-tighter italic">PERFORMANCE OVERVIEW</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255, 204, 0, 0.05)'}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '20px 20px 60px #d1d9e6', backgroundColor: '#f5f7fa'}}
                />
                <Bar dataKey="budget" fill="#e2e8f0" radius={[10, 10, 0, 0]} name="Budget" barSize={40} />
                <Bar dataKey="spent" fill="#788023" radius={[10, 10, 0, 0]} name="Actual" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="neo-card p-8 flex flex-col">
          <h3 className="text-xl font-black text-brand-navy mb-8 tracking-tighter italic">CRITICAL RADAR</h3>
          <div className="space-y-6 flex-1">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/50 border border-white">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl bg-white shadow-md shadow-slate-200", alert.color)}>
                    <alert.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700">{alert.label}</span>
                </div>
                <span className={cn("text-2xl font-black", alert.count > 0 ? alert.color : "text-slate-200")}>
                  {alert.count}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-8 neo-btn-secondary w-full">Detailed Radar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6">Campaigns by Platform</h3>
          <div className="flex items-center">
            <div className="w-1/2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4">
              {platformData.map((data, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}} />
                    <span className="text-slate-600 font-medium">{data.name}</span>
                  </div>
                  <span className="font-bold">{data.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity / Priority Campaigns */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">High Priority Campaigns</h3>
          <div className="space-y-4">
            {campaigns
              .filter(c => c.priority === 'High')
              .slice(0, 3)
              .map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white",
                      c.platform === 'Meta' ? 'bg-blue-600' : 'bg-slate-900'
                    )}>
                      {c.platform === 'Meta' ? 'M' : 'G'}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{c.campaignName}</p>
                      <p className="text-xs text-slate-500">{c.brandName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(c.remainingBalance)}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Left</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Admin Intervention Section */}
      {isAdmin && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Critical Attention Required</h3>
              <p className="text-sm text-slate-500">Campaigns at risk. Coordinate with the assigned team members.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Campaign</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Issue</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Owner</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Creator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {campaigns
                  .filter(c => 
                    (c.remainingBalance / c.totalBudget) < 0.2 || 
                    c.topupRequired || 
                    c.remainingDays === 0 || 
                    c.status === 'Recharge Needed'
                  )
                  .map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-slate-900">{c.campaignName}</p>
                        <p className="text-[10px] text-slate-500">{c.brandName}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "status-badge",
                          c.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-bold text-red-600">
                          {(c.remainingBalance / c.totalBudget) < 0.2 ? "Low Budget" : 
                           c.remainingDays === 0 ? "Expiring Today" : "Needs Recharge"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-black italic uppercase tracking-tighter" style={{ color: getOwnerInfo(c.assignedTo).color }}>
                          {getOwnerInfo(c.assignedTo).name}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        {c.createdBy}
                      </td>
                    </tr>
                  ))}
                {campaigns.filter(c => (c.remainingBalance / c.totalBudget) < 0.2 || c.topupRequired || c.remainingDays === 0).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No campaigns currently require immediate intervention.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for missing icon
const MegaphoneIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 13v-2Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
);
