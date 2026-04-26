import { useStore } from '../store/useStore';
import { formatCurrency, cn } from '../lib/utils';
import { AlertTriangle, AlertCircle, Clock, BatteryLow } from 'lucide-react';

export const AlertsPage = () => {
  const { getCampaignsWithStats, users } = useStore();
  const campaigns = getCampaignsWithStats();

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  const alerts = [
    ...campaigns
      .filter(c => (c.remainingBalance / c.totalBudget) < 0.2 && c.status === 'Active')
      .map(c => ({
        type: 'low-budget',
        campaign: c,
        title: 'Critical Budget Alert',
        message: `Only ${Math.round((c.remainingBalance / c.totalBudget) * 100)}% budget remaining.`,
        icon: BatteryLow,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
      })),
    ...campaigns
      .filter(c => c.remainingDays === 0 && c.status === 'Active')
      .map(c => ({
        type: 'ending',
        campaign: c,
        title: 'Campaign Expiring Today',
        message: `End date reached. Campaign requires immediate review or extension.`,
        icon: Clock,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      })),
    ...campaigns
      .filter(c => c.topupRequired)
      .map(c => ({
        type: 'recharge',
        campaign: c,
        title: 'Recharge Needed',
        message: 'Campaign marked as requiring a budget top-up.',
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      })),
    ...campaigns
      .filter(c => c.totalSpent > c.totalBudget)
      .map(c => ({
        type: 'overspending',
        campaign: c,
        title: 'Overspending Warning',
        message: `Actual spend exceeds allocated budget by ${formatCurrency(c.totalSpent - c.totalBudget)}.`,
        icon: AlertTriangle,
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300'
      }))
  ];

  const copyAlerts = () => {
    const text = alerts.map(a => 
      `🚨 *${a.title}*\nCampaign: ${a.campaign.campaignName}\nIssue: ${a.message}\nAssigned to: ${getUserName(a.campaign.assignedTo)}\n---`
    ).join('\n');
    navigator.clipboard.writeText(text);
    alert('Alert summary copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Urgent Alerts</h1>
          <p className="text-slate-500">Immediate actions required for active campaigns.</p>
        </div>
        {alerts.length > 0 && (
          <button onClick={copyAlerts} className="btn-secondary">
            Copy Summary for Team
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">All Clear!</h3>
          <p className="text-slate-500 max-w-xs">No critical budget or expiry issues detected at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert, i) => (
            <div key={i} className={cn(
              "p-5 rounded-2xl border-l-4 shadow-sm animate-in slide-in-from-bottom-2 duration-300",
              alert.bgColor,
              alert.borderColor
            )}>
              <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-lg bg-white", alert.color)}>
                  <alert.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={cn("font-bold", alert.color)}>{alert.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority: High</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-1">{alert.campaign.campaignName}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Created by: <span className="text-slate-700">{alert.campaign.createdBy}</span> • 
                    Assigned to: <span className="text-slate-700">{getUserName(alert.campaign.assignedTo)}</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{alert.message}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      View Campaign
                    </button>
                    <button className={cn("text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90", 
                      alert.type === 'recharge' ? 'bg-orange-500' : 'bg-slate-900'
                    )}>
                      {alert.type === 'recharge' ? 'Process Recharge' : 'Fix Issue'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
