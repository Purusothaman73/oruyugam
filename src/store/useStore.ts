import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campaign, SpendEntry, User, CampaignWithCalculations, UserRole } from '../types';
import { differenceInDays, startOfDay, parseISO } from 'date-fns';
import { createClient } from '@supabase/supabase-js';

interface AppState {
  currentUser: User | null;
  users: User[];
  campaigns: Campaign[];
  spendEntries: SpendEntry[];
  cloudConfig: { url: string; key: string } | null;
  
  // Actions
  login: (identifier: string, role: UserRole) => void;
  logout: () => void;
  setCloudConfig: (url: string, key: string) => void;
  syncWithCloud: () => Promise<void>;
  pushToCloud: () => Promise<void>;
  
  addCampaign: (campaign: Omit<Campaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  
  addSpendEntry: (entry: Omit<SpendEntry, 'id'>) => void;
  addBulkSpendEntries: (entries: Omit<SpendEntry, 'id'>[]) => void;
  
  getClients: () => string[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  rechargeCampaign: (id: string, amount: number, enteredBy: string, mode: string) => void;
  
  // Selectors
  getCampaignsWithStats: () => CampaignWithCalculations[];
  importData: (data: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [
        { id: 'admin-1', name: 'Yugam Admin', email: 'admin@yugam.com', mobile: '9999999999', password: 'password', color: '#0a1128', role: 'Admin' },
      ],
      campaigns: [],
      spendEntries: [],

      cloudConfig: null,

      setCloudConfig: (url, key) => set({ cloudConfig: { url, key } }),

      syncWithCloud: async () => {
        const { cloudConfig } = get();
        if (!cloudConfig?.url || !cloudConfig?.key) return;
        
        try {
          const supabase = createClient(cloudConfig.url, cloudConfig.key);
          const { data: remoteData, error } = await supabase
            .from('yugam_sync')
            .select('payload')
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) throw error;
          if (remoteData?.[0]?.payload) {
            const parsed = remoteData[0].payload;
            set({
              users: parsed.users || get().users,
              campaigns: parsed.campaigns || [],
              spendEntries: parsed.spendEntries || [],
            });
          }
        } catch (e) {
          console.error('Cloud Sync Failed', e);
        }
      },

      pushToCloud: async () => {
        const { cloudConfig, users, campaigns, spendEntries } = get();
        if (!cloudConfig?.url || !cloudConfig?.key) return;

        try {
          const supabase = createClient(cloudConfig.url, cloudConfig.key);
          const { error } = await supabase
            .from('yugam_sync')
            .insert([{ payload: { users, campaigns, spendEntries } }]);

          if (error) throw error;
        } catch (e) {
          console.error('Cloud Push Failed', e);
        }
      },

      login: (identifier, role) => {
        // Find user by email or mobile
        const user = get().users.find(u => 
          (u.email === identifier || u.mobile === identifier) && u.role === role
        );
        
        // We'll pass through if user exists. 
        // Real-world: you'd also check u.password === enteredPassword
        if (user) set({ currentUser: user });
      },
      
      logout: () => set({ currentUser: null }),

      addCampaign: (campaign) => set((state) => ({
        campaigns: [...state.campaigns, { ...campaign, id: Math.random().toString(36).substr(2, 9) }]
      })),

      updateCampaign: (id, updates) => set((state) => ({
        campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      deleteCampaign: (id) => set((state) => ({
        campaigns: state.campaigns.filter(c => c.id !== id)
      })),

      rechargeCampaign: (id: string, amount: number, enteredBy: string, mode: string) => {
        set((state) => ({
          campaigns: state.campaigns.map(c => 
            c.id === id ? { ...c, totalBudget: c.totalBudget + amount, topupRequired: false, lastUpdatedBy: enteredBy, lastUpdatedDate: new Date().toISOString().split('T')[0] } : c
          ),
          spendEntries: [...state.spendEntries, {
            id: Math.random().toString(36).substr(2, 9),
            campaignId: id,
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            enteredBy,
            note: `RECHARGE: +${amount} | MODE: ${mode}`
          }]
        }));
        get().pushToCloud();
      },

      addUser: (user) => set((state) => {
        const teamColors = ['#788023', '#4f46e5', '#e11d48', '#d97706', '#0891b2', '#7c3aed', '#db2777'];
        const randomColor = teamColors[state.users.length % teamColors.length];
        return {
          users: [...state.users, { ...user, color: user.color || randomColor, id: Math.random().toString(36).substr(2, 9) }]
        };
      }),

      updateUser: (id, updates) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
      })),

      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),

      getClients: () => {
        const { campaigns } = get();
        return Array.from(new Set(campaigns.map(c => c.clientName))).sort();
      },

      addBulkSpendEntries: (entries) => set((state) => {
        const newEntries = [...state.spendEntries, ...entries.map(e => ({ ...e, id: Math.random().toString(36).substr(2, 9) }))];
        const today = new Date().toISOString().split('T')[0];
        
        const updatedCampaigns = state.campaigns.map(c => {
          const entry = entries.find(e => e.campaignId === c.id);
          if (entry) {
            return { ...c, lastUpdatedBy: entry.enteredBy, lastUpdatedDate: today };
          }
          return c;
        });

        return { spendEntries: newEntries, campaigns: updatedCampaigns };
      }),

      addSpendEntry: (entry) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => {
          const newEntries = [...state.spendEntries, { ...entry, id }];
          const updatedCampaigns = state.campaigns.map(c => {
            if (c.id === entry.campaignId) {
              return {
                ...c,
                lastUpdatedBy: entry.enteredBy,
                lastUpdatedDate: entry.date
              };
            }
            return c;
          });
          return { spendEntries: newEntries, campaigns: updatedCampaigns };
        });
        get().pushToCloud(); // Auto-sync
      },

      getCampaignsWithStats: () => {
        const { campaigns, spendEntries } = get();
        const today = startOfDay(new Date());

        return campaigns.map(c => {
          const campaignSpend = spendEntries
            .filter(s => s.campaignId === c.id)
            .reduce((sum, s) => sum + s.amount, 0);
          
          const remainingBalance = c.totalBudget - campaignSpend;
          const end = parseISO(c.endDate);
          const remainingDays = Math.max(0, differenceInDays(end, today));
          const pacing = (campaignSpend / c.totalBudget) * 100;

          return {
            ...c,
            totalSpent: campaignSpend,
            remainingBalance,
            remainingDays,
            pacing
          };
        });
      },

      importData: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          set({
            users: parsed.users || get().users,
            campaigns: parsed.campaigns || [],
            spendEntries: parsed.spendEntries || [],
          });
          alert('Data imported successfully!');
        } catch (e) {
          alert('Invalid data format.');
        }
      }
    }),
    {
      name: 'yugam-ads-v2',
    }
  )
);
