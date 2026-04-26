import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Save, 
  Zap, 
  LayoutList, 
  History,
  Share2,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, cn } from '../lib/utils';
import { Platform, CampaignStatus } from '../types';
import * as XLSX from 'xlsx';
import { ClientReport } from '../components/ClientReport';

export const CampaignList = () => {
  const { 
    getCampaignsWithStats, currentUser, addSpendEntry, 
    users, addCampaign, addBulkSpendEntries, updateCampaign, 
    rechargeCampaign 
  } = useStore();
  const campaigns = getCampaignsWithStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'All'>('All');
  const [timeRange, setTimeRange] = useState<'All' | '30' | '90' | '180'>('All');
  
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkSpends, setBulkSpends] = useState<Record<string, string>>({});
  
  const [showSpendModal, setShowSpendModal] = useState<string | null>(null);
  const [showRechargeId, setShowRechargeId] = useState<string | null>(null);
  const [showReportId, setShowReportId] = useState<string | null>(null);
  const [showPaymentModalId, setShowPaymentModalId] = useState<string | null>(null);
  const [spendAmount, setSpendAmount] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeMode, setRechargeMode] = useState('Client Paid');
  const [paymentForm, setPaymentForm] = useState({ status: 'Pending', mode: '', date: '', adminAcknowledged: false });
  const [metrics, setMetrics] = useState({ leads: '', clicks: '' });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    clientName: '',
    brandName: '',
    platform: 'Meta' as Platform,
    campaignName: '',
    objective: 'Sales',
    assignedTo: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isEvergreen: false,
    gstType: 'Inclusive' as 'Inclusive' | 'Exclusive',
    paymentStatus: 'Pending' as 'Paid' | 'Pending',
    adminAcknowledged: false,
    paymentMode: '',
    paymentDate: '',
    totalBudget: 0,
    dailyBudgetLimit: 0,
    status: 'Active' as CampaignStatus,
    priority: 'Medium' as any,
    notes: '',
    topupRequired: false
  });

  const isAdmin = currentUser?.role === 'Admin';
  const myCampaigns = campaigns; // Full agency visibility
  
  const existingClients = Array.from(new Set(campaigns.map(c => c.clientName)));

  const getOwnerInfo = (id: string) => {
    const user = users.find(u => u.id === id);
    return user || { name: 'Unknown', color: '#cbd5e1' };
  };

  const filteredCampaigns = myCampaigns.filter(c => {
    const matchesSearch = c.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === 'All' || c.platform === selectedPlatform;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    
    let matchesRange = true;
    if (timeRange !== 'All') {
      const days = parseInt(timeRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      matchesRange = new Date(c.endDate) >= cutoff;
    }
    
    return matchesSearch && matchesPlatform && matchesStatus && matchesRange;
  });

  const handleBulkUpdate = () => {
    const entries = Object.entries(bulkSpends)
      .filter(([_, amount]) => amount && !isNaN(parseFloat(amount)))
      .map(([campaignId, amount]) => ({
        campaignId,
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
        enteredBy: currentUser?.name || 'Unknown',
        note: 'Bulk update'
      }));

    if (entries.length > 0) {
      addBulkSpendEntries(entries);
      setBulkSpends({});
      setIsBulkMode(false);
    }
  };

  const handleStatusToggle = (id: string, currentStatus: CampaignStatus) => {
    const nextStatus: CampaignStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    updateCampaign(id, { status: nextStatus });
  };

  const exportToExcel = () => {
    const data = filteredCampaigns.map(c => ({
      'Client': c.clientName,
      'Brand': c.brandName,
      'Platform': c.platform,
      'Campaign': c.campaignName,
      'Status': c.status,
      'Budget': c.totalBudget,
      'Spent': c.totalSpent,
      'Remaining': c.remainingBalance,
      'End Date': c.endDate
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Campaigns');
    XLSX.writeFile(wb, `Yugam_Campaigns_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSpendUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSpendModal || !spendAmount) return;

    addSpendEntry({
      campaignId: showSpendModal,
      amount: parseFloat(spendAmount),
      date: new Date().toISOString().split('T')[0],
      enteredBy: currentUser?.name || 'Unknown',
      note: 'Single update',
      metrics: {
        leads: metrics.leads ? parseInt(metrics.leads) : undefined,
        clicks: metrics.clicks ? parseInt(metrics.clicks) : undefined,
      }
    });

    setSpendAmount('');
    setMetrics({ leads: '', clicks: '' });
    setShowSpendModal(null);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCampaign.isEvergreen && new Date(newCampaign.endDate) < new Date(newCampaign.startDate)) {
      alert("End date cannot be before start date.");
      return;
    }

    if (newCampaign.totalBudget <= 0) {
      alert("Total budget must be greater than 0.");
      return;
    }

    addCampaign({
      ...newCampaign,
      createdBy: currentUser?.name || 'Admin',
      lastUpdatedBy: currentUser?.name || 'Admin',
      lastUpdatedDate: new Date().toISOString().split('T')[0]
    });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500">
            {isAdmin ? 'All active campaigns across the team.' : 'Manage your assigned campaigns and daily spend.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsBulkMode(!isBulkMode)}
            className={cn("neo-btn-secondary h-11 px-5", isBulkMode && "bg-brand-green text-white")}
          >
            {isBulkMode ? <LayoutList className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            {isBulkMode ? 'Standard View' : 'Lightning Update'}
          </button>
          <button onClick={exportToExcel} className="neo-btn-ghost h-11 px-5">
            <Download className="w-4 h-4" />
            Export
          </button>
          {isAdmin && (
            <button 
              onClick={() => {
                setNewCampaign({
                  ...newCampaign,
                  assignedTo: users.find(u => u.role === 'Team Member')?.id || ''
                });
                setShowCreateModal(true);
              }}
              className="neo-btn-primary h-11 px-5"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
          )}
        </div>
      </div>

      {/* Modern Search & Filters */}
      <div className="neo-card p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Quick search client, brand, or campaign..." 
            className="neo-input pl-12 h-12 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="neo-input h-12 text-sm px-4"
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value as any)}
        >
          <option value="All">All Platforms</option>
          <option value="Meta">Meta Ads</option>
          <option value="Google">Google Ads</option>
        </select>
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
          <select 
            className="neo-input h-12 text-sm px-4"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
            <option value="Recharge Needed">Recharge Needed</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Horizon</label>
          <select 
            className="neo-input h-12 text-sm px-4"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="All">All Time Archive</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="180">Last 6 Months</option>
          </select>
        </div>
      </div>

      {/* Table / Bulk Entry */}
      <div className="neo-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100/50 border-b border-white/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Overview</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Vitals</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCampaigns.map((c) => {
                const isUpdatedToday = c.lastUpdatedDate === new Date().toISOString().split('T')[0];
                return (
                  <tr key={c.id} className={cn(
                    "hover:bg-slate-50/50 transition-colors",
                    !isUpdatedToday && !isBulkMode && "bg-amber-50/30"
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-1.5 h-10 rounded-full" 
                          style={{ backgroundColor: getOwnerInfo(c.assignedTo).color }} 
                          title={`Assigned to ${getOwnerInfo(c.assignedTo).name}`}
                        />
                        <button 
                          disabled={!isAdmin && c.assignedTo !== currentUser?.id}
                          onClick={() => handleStatusToggle(c.id, c.status)}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                            c.status === 'Active' ? "bg-brand-green text-white shadow-lg" : "bg-slate-200 text-slate-500",
                            (!isAdmin && c.assignedTo !== currentUser?.id) && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {c.status === 'Active' ? 'ON' : 'OFF'}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 leading-tight">{c.campaignName}</p>
                            <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter",
                              c.gstType === 'Inclusive' ? "bg-slate-100 text-slate-400" : "bg-brand-green/10 text-brand-green border border-brand-green/20"
                            )}>
                              {c.gstType === 'Inclusive' ? 'GST Incl' : '+GST'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            <span className="font-black" style={{ color: getOwnerInfo(c.assignedTo).color }}>{getOwnerInfo(c.assignedTo).name.split(' ')[0]}</span> • {c.brandName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{formatCurrency(c.remainingBalance)}</span>
                          <span className="text-[10px] text-slate-400 font-medium italic">left of {formatCurrency(c.totalBudget)}</span>
                        </div>
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              c.pacing > 90 ? "bg-red-500" : c.pacing > 70 ? "bg-amber-500" : "bg-emerald-500"
                            )} 
                            style={{ width: `${Math.min(100, c.pacing)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isBulkMode ? (
                        <div className="relative w-32">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                          <input 
                            type="number" 
                            placeholder="Amount"
                            className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            value={bulkSpends[c.id] || ''}
                            onChange={(e) => setBulkSpends({...bulkSpends, [c.id]: e.target.value})}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {isUpdatedToday ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">
                              Updated Today
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md uppercase">
                              Update Required
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!isBulkMode && (
                        <div className="flex items-center gap-4">
                          { (isAdmin || c.assignedTo === currentUser?.id) ? (
                            <button 
                              onClick={() => setShowSpendModal(c.id)}
                              className="flex items-center gap-1.5 text-brand-green hover:text-brand-navy font-bold text-xs"
                            >
                              <History className="w-3.5 h-3.5" />
                              Update
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 text-slate-300 font-bold text-xs italic">
                              <Lock className="w-3.5 h-3.5" />
                              Locked
                            </span>
                          )}
                          <button 
                            onClick={() => setShowRechargeId(c.id)}
                            className="flex items-center gap-1.5 text-brand-green hover:text-brand-navy font-bold text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Recharge
                          </button>
                          <button 
                            onClick={() => {
                              setShowPaymentModalId(c.id);
                              setPaymentForm({
                                status: c.paymentStatus,
                                mode: c.paymentMode || '',
                                date: c.paymentDate || '',
                                adminAcknowledged: c.adminAcknowledged
                              });
                            }}
                            className={cn(
                              "flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl shadow-sm border transition-all hover:scale-110 relative",
                              c.paymentStatus === 'Paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                            )}
                          >
                            {c.paymentStatus === 'Paid' ? (
                              <>
                                Paid {c.adminAcknowledged && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                              </>
                            ) : 'Due'}
                          </button>
                          <button 
                            onClick={() => setShowReportId(c.id)}
                            className="flex items-center gap-1.5 text-brand-navy hover:text-brand-green font-black text-[10px] uppercase tracking-wider bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 transition-all hover:scale-110"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {isBulkMode && (
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <p className="font-bold">Bulk Update Mode</p>
              <p className="text-xs text-slate-400">{Object.keys(bulkSpends).length} campaigns pending update.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsBulkMode(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white">Cancel</button>
              <button 
                onClick={handleBulkUpdate}
                className="bg-amber-500 text-slate-900 px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                Save All Updates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legacy Single Update Modal for Details */}
      {showSpendModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Manual Spend Entry</h3>
              <p className="text-sm text-slate-500">Update today's actual spend for this campaign.</p>
            </div>
            <form onSubmit={handleSpendUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount Spent (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input 
                    autoFocus
                    type="number" 
                    step="0.01"
                    required
                    className="input-field pl-8" 
                    placeholder="0.00"
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Leads (Optional)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0"
                    value={metrics.leads}
                    onChange={(e) => setMetrics({...metrics, leads: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Clicks (Optional)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0"
                    value={metrics.clicks}
                    onChange={(e) => setMetrics({...metrics, clicks: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSpendModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-accent flex-1">Update Spend</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Create New Campaign</h3>
              <p className="text-sm text-slate-500">Configure budget and assign a team member.</p>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em]">Basic Identification</h4>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Client (Entity)</label>
                    <div className="relative">
                      <input 
                        list="client-list"
                        type="text" 
                        required 
                        className="neo-input h-11 text-sm" 
                        placeholder="Organization Name"
                        value={newCampaign.clientName} 
                        onChange={e => {
                          const val = e.target.value;
                          const existingBrand = campaigns.find(c => c.clientName === val)?.brandName;
                          setNewCampaign({
                            ...newCampaign, 
                            clientName: val,
                            brandName: existingBrand || newCampaign.brandName
                          });
                        }} 
                        autoComplete="off" 
                      />
                      <datalist id="client-list">
                        {existingClients.map(client => (
                          <option key={client} value={client} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Brand / Branch</label>
                    <input 
                      type="text" 
                      required 
                      className="neo-input h-11 text-sm" 
                      placeholder="Specific Brand or Branch"
                      value={newCampaign.brandName} 
                      onChange={e => setNewCampaign({...newCampaign, brandName: e.target.value})} 
                      autoComplete="off" 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Network</label>
                    <select 
                      className="neo-input h-11 text-sm" 
                      value={newCampaign.platform} 
                      onChange={e => {
                        const plat = e.target.value as any;
                        setNewCampaign({
                          ...newCampaign, 
                          platform: plat,
                          isEvergreen: plat === 'Google'
                        });
                      }}
                    >
                      <option value="Meta">Meta Ads (Facebook/Insta)</option>
                      <option value="Google">Google Ads (Search/YT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Campaign Title</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        required 
                        className="neo-input h-11 text-sm flex-1" 
                        placeholder="e.g. Lead Gen - May 24"
                        value={newCampaign.campaignName} 
                        onChange={e => setNewCampaign({...newCampaign, campaignName: e.target.value})} 
                        autoComplete="off" 
                      />
                      <button 
                        type="button"
                        onClick={() => setNewCampaign({
                          ...newCampaign, 
                          campaignName: `${newCampaign.brandName || 'Campaign'} - ${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear().toString().slice(-2)}`
                        })}
                        className="neo-btn-ghost h-11 px-3 text-[10px]"
                        title="Auto-generate Title"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Assign Team Member</label>
                  <select className="input-field" value={newCampaign.assignedTo} onChange={e => setNewCampaign({...newCampaign, assignedTo: e.target.value})}>
                    <option value="">Select Member</option>
                    {users.filter(u => u.role === 'Team Member').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">GST Billing</label>
                    <select className="input-field" value={newCampaign.gstType} onChange={e => setNewCampaign({...newCampaign, gstType: e.target.value as any})}>
                      <option value="Inclusive">Inclusive</option>
                      <option value="Exclusive">Exclusive (+18%)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                    <div className="flex items-center h-10 gap-2">
                      <input 
                        type="checkbox" 
                        id="evergreen"
                        className="w-4 h-4 rounded text-brand-green" 
                        checked={newCampaign.isEvergreen} 
                        onChange={e => setNewCampaign({...newCampaign, isEvergreen: e.target.checked})} 
                      />
                      <label htmlFor="evergreen" className="text-xs font-bold text-slate-500 uppercase">Evergreen</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em]">Financials & Schedule</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Start</label>
                    <input type="date" required className="neo-input h-10 text-xs" value={newCampaign.startDate} onChange={e => setNewCampaign({...newCampaign, startDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">End</label>
                    <input 
                      type="date" 
                      required={!newCampaign.isEvergreen} 
                      disabled={newCampaign.isEvergreen}
                      className="neo-input h-10 text-xs disabled:opacity-20" 
                      value={newCampaign.endDate} 
                      onChange={e => setNewCampaign({...newCampaign, endDate: e.target.value})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Total Budget</label>
                  <input 
                    type="number" 
                    required 
                    className="neo-input h-11 text-sm" 
                    placeholder="₹ 0.00"
                    value={newCampaign.totalBudget || ''} 
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewCampaign({...newCampaign, totalBudget: val});
                    }} 
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Limit</label>
                    {!newCampaign.isEvergreen && newCampaign.endDate && (
                      <button 
                        type="button"
                        onClick={() => {
                          const start = new Date(newCampaign.startDate);
                          const end = new Date(newCampaign.endDate);
                          const diffTime = Math.abs(end.getTime() - start.getTime());
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                          setNewCampaign({...newCampaign, dailyBudgetLimit: Math.round(newCampaign.totalBudget / diffDays)});
                        }}
                        className="text-[8px] font-black text-brand-green uppercase tracking-tighter hover:underline"
                      >
                        Auto-Calc
                      </button>
                    )}
                  </div>
                  <input 
                    type="number" 
                    required 
                    className="neo-input h-11 text-sm" 
                    placeholder="₹ 0.00"
                    value={newCampaign.dailyBudgetLimit || ''} 
                    onChange={e => setNewCampaign({...newCampaign, dailyBudgetLimit: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                  <select className="neo-input h-11 text-sm" value={newCampaign.priority} onChange={e => setNewCampaign({...newCampaign, priority: e.target.value as any})}>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-accent flex-1">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRechargeId && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-2xl font-black text-brand-navy italic tracking-tighter uppercase">Add Funds</h3>
              <p className="text-sm text-slate-500 font-medium">Extend the campaign's total budget.</p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                rechargeCampaign(showRechargeId, parseFloat(rechargeAmount), currentUser?.name || 'Unknown', rechargeMode);
                setShowRechargeId(null);
                setRechargeAmount('');
              }} 
              className="p-8 space-y-5"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Top-up Amount (INR)</label>
                  <input 
                    type="number" 
                    required
                    autoFocus
                    className="neo-input h-14" 
                    placeholder="e.g. 50000"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment Mode</label>
                  <select 
                    className="neo-input h-14"
                    value={rechargeMode}
                    onChange={(e) => setRechargeMode(e.target.value)}
                  >
                    <option value="Client Paid">Client Paid Directly</option>
                    <option value="Agency - UPI">Agency Paid (UPI)</option>
                    <option value="Agency - Card">Agency Paid (Card)</option>
                    <option value="Agency - Bank Transfer">Agency Paid (Bank)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowRechargeId(null)} className="neo-btn-ghost flex-1 h-14">Cancel</button>
                <button type="submit" className="neo-btn-primary flex-1 h-14 bg-brand-green text-white">Add Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModalId && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-2xl font-black text-brand-navy italic tracking-tighter uppercase">Client Payment</h3>
              <p className="text-sm text-slate-500 font-medium">Verify or update payment status for this campaign.</p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                updateCampaign(showPaymentModalId, {
                  paymentStatus: paymentForm.status as any,
                  paymentMode: paymentForm.mode,
                  paymentDate: paymentForm.date,
                  adminAcknowledged: paymentForm.adminAcknowledged
                });
                setShowPaymentModalId(null);
              }} 
              className="p-8 space-y-5"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Status</label>
                  <div className="flex p-1 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, status: 'Pending' })}
                      className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all",
                        paymentForm.status === 'Pending' ? "bg-rose-500 text-white shadow-lg" : "text-slate-500"
                      )}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, status: 'Paid' })}
                      className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all",
                        paymentForm.status === 'Paid' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-500"
                      )}
                    >
                      Paid
                    </button>
                  </div>
                </div>

                {paymentForm.status === 'Paid' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Mode</label>
                      <select 
                        className="neo-input"
                        value={paymentForm.mode}
                        onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                      >
                        <option value="">Select Mode</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Date</label>
                      <input 
                        type="date" 
                        className="neo-input"
                        value={paymentForm.date}
                        onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                      />
                    </div>
                    {isAdmin && (
                      <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                        <div>
                          <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Admin Acknowledgment</p>
                          <p className="text-[10px] text-slate-500 font-medium">Verify credit in bank/UPI</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentForm({ ...paymentForm, adminAcknowledged: !paymentForm.adminAcknowledged })}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                            paymentForm.adminAcknowledged ? "bg-brand-green shadow-inner" : "bg-slate-300"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                            paymentForm.adminAcknowledged ? "translate-x-6" : "translate-x-0"
                          )} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowPaymentModalId(null)} className="neo-btn-ghost flex-1 h-14">Cancel</button>
                <button type="submit" className="neo-btn-primary flex-1 h-14 bg-brand-green text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportId && (
        <ClientReport 
          campaignId={showReportId} 
          onClose={() => setShowReportId(null)} 
        />
      )}
    </div>
  );
};
