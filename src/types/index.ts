export type Language = 'en' | 'te' | 'hi';
export type UserRole = 'worker' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  zoneId: string;
  zoneName: string;
  dailyWage: number;
  trade: string;
  language: Language;
  role: UserRole;
  walletBalance: number;
  parametricCredits?: number;
  daysProtected: number;
  policyActive: boolean;
  upiId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Zone {
  id: string;
  name: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  currentTemp: number; // in Celsius
  currentRain: number; // in mm/hr
  currentRiskScore: number; // 0-100
  status: 'safe' | 'moderate' | 'critical';
  activeWorkersCount: number;
  lastWeatherUpdate: string;
  highRiskReason?: string;
}

export interface RiskObservation {
  id: string;
  zoneId: string;
  zoneName: string;
  temp: number;
  rain: number;
  riskScore: number;
  capturedAt: string;
  source: 'demo-simulation';
}

export interface WeatherCondition {
  temp: number;
  rain: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

export type PayoutStatus = 'queued' | 'pending_confirmation' | 'verified' | 'paid' | 'disbursed' | 'declined';

export interface Payout {
  id: string;
  workerId: string;
  workerName: string;
  zoneId: string;
  zoneName: string;
  riskScore: number;
  weatherSnapshot: {
    temp: number;
    rain: number;
    condition: string;
  };
  tier: string; // e.g. "Tier 1 (30%)", "Tier 2 (60%)", "Tier 3 (80%)"
  percentage: number; // 30, 60, 80
  dailyWage: number;
  amount: number;
  status: PayoutStatus;
  confirmationsCount: number;
  requiredConfirmations: number;
  confirmedBy: string[];
  timestamp: string;
  createdAt: string;
  smsDispatched: boolean;
  smsText: string;
  adminOverridden?: boolean;
}

export interface PeerConfirmation {
  id: string;
  payoutId: string;
  zoneId: string;
  verifierId: string;
  verifierName: string;
  verifierTrade?: string;
  verifierLat: number;
  verifierLng: number;
  conditionReported: 'heavy_rain' | 'extreme_heat' | 'waterlogging' | 'normal';
  confirmed: boolean;
  fraudCheckPassed: boolean;
  timestamp: string;
}

export interface SmsLog {
  id: string;
  workerId: string;
  workerName: string;
  phone: string;
  language: Language;
  message: string;
  type: 'RISK_ALERT' | 'CONFIRMATION_REQUEST' | 'PAYOUT_CREDITED' | 'POLICY_ACTIVE';
  timestamp: string;
  delivered: boolean;
}

export interface Withdrawal {
  id: string;
  workerId: string;
  amount: number;
  method: 'UPI' | 'Bank Account' | 'Seva Kendra Kiosk';
  reference: string;
  timestamp: string;
  status: 'completed' | 'processing';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'payout' | 'risk' | 'system' | 'confirmation';
  read: boolean;
  actionUrl?: string;
}
