export type Platform = 'Meta' | 'Google';
export type CampaignStatus = 'Active' | 'Paused' | 'Completed' | 'Recharge Needed';
export type Priority = 'High' | 'Medium' | 'Low';
export type UserRole = 'Admin' | 'Team Member';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  password?: string;
  color?: string; // Hex code for color-coding team members
  role: UserRole;
  avatar?: string;
}

export interface SpendEntry {
  id: string;
  campaignId: string;
  date: string;
  amount: number;
  enteredBy: string;
  note?: string;
  metrics?: {
    leads?: number;
    clicks?: number;
    conversions?: number;
    impressions?: number;
  };
}

export interface Campaign {
  id: string;
  clientName: string;
  brandName: string;
  platform: Platform;
  campaignName: string;
  objective: string;
  createdBy: string;
  assignedTo: string; // User ID
  startDate: string;
  endDate: string;
  isEvergreen: boolean; // For perpetual campaigns like Google Ads
  gstType: 'Inclusive' | 'Exclusive';
  paymentStatus: 'Paid' | 'Pending';
  adminAcknowledged: boolean;
  paymentMode?: string;
  paymentDate?: string;
  totalBudget: number;
  dailyBudgetLimit: number;
  status: CampaignStatus;
  priority: Priority;
  notes: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
  topupRequired: boolean;
}

export interface CampaignWithCalculations extends Campaign {
  totalSpent: number;
  remainingBalance: number;
  remainingDays: number;
  pacing: number; // Percent of expected spend vs actual
}
