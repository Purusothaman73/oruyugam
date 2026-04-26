import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';
import { User as UserIcon, Calendar, Download } from 'lucide-react';

export const HistoryPage = () => {
  const { spendEntries, campaigns } = useStore();
  
  const entriesWithDetails = spendEntries.map(entry => {
    const campaign = campaigns.find(c => c.id === entry.campaignId);
    return {
      ...entry,
      campaignName: campaign?.campaignName || 'Unknown Campaign',
      brandName: campaign?.brandName || 'Unknown Brand',
      platform: campaign?.platform || 'Unknown'
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Spend Entry History</h1>
          <p className="text-slate-500">A detailed log of all manual budget updates.</p>
        </div>
        <button className="btn-secondary">
          <Download className="w-4 h-4" />
          Export History
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entered By</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {entriesWithDetails.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No spend entries recorded yet.</td>
              </tr>
            ) : (
              entriesWithDetails.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{entry.campaignName}</p>
                    <p className="text-xs text-slate-500">{entry.brandName} • {entry.platform}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="text-sm text-slate-700">{entry.enteredBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(entry.amount)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
