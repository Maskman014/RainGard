import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Language,
  Zone,
  Payout,
  PeerConfirmation,
  SmsLog,
  Withdrawal,
  NotificationItem,
  RiskObservation,
} from '../types';
import {
  calculateParametricRisk,
  INITIAL_ZONES,
  weatherService,
} from '../utils/weatherEngine';
import { DEMO_CONFIRMATIONS, DEMO_PAYOUTS, DEMO_SMS_LOGS } from '../utils/demoData';
import { getTranslation } from '../utils/translations';
import { useAuth } from './AuthContext';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  largeText: boolean;
  toggleLargeText: () => void;
  isOffline: boolean;
  toggleOffline: () => void;
  zones: Zone[];
  riskHistory: RiskObservation[];
  selectedZoneId: string;
  setSelectedZoneId: (id: string) => void;
  activeZone: Zone | undefined;
  payouts: Payout[];
  confirmations: PeerConfirmation[];
  smsLogs: SmsLog[];
  withdrawals: Withdrawal[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshZoneWeather: (zoneId?: string) => Promise<void>;
  simulateDistressSurge: (zoneId: string, type: 'heat' | 'rain') => Promise<void>;
  simulatePeerConsensus: (payoutId: string) => Promise<boolean>;
  submitPeerConfirmation: (
    payoutId: string,
    condition: 'heavy_rain' | 'extreme_heat' | 'waterlogging' | 'normal',
    isDistress: boolean
  ) => Promise<boolean>;
  executeWithdrawal: (
    amount: number,
    method: 'UPI' | 'Bank Account' | 'Seva Kendra Kiosk',
    reference: string
  ) => Promise<boolean>;
  adminOverridePayout: (payoutId: string, action: 'approve' | 'flag' | 'decline') => Promise<void>;
  adminTriggerSectorRelief: (zoneId: string, percentage: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadLocalData<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalData<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save local demo data (${key}):`, error);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('rainguard_lang') as Language;
    return saved || 'en';
  });

  const [largeText, setLargeText] = useState<boolean>(() => {
    return localStorage.getItem('rainguard_large_text') === 'true';
  });

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [zones, setZones] = useState<Zone[]>(() => loadLocalData('rainguard_zones', INITIAL_ZONES));
  const [riskHistory, setRiskHistory] = useState<RiskObservation[]>(() =>
    loadLocalData(
      'rainguard_risk_history',
      INITIAL_ZONES.map((zone) => ({
        id: `seed-${zone.id}`,
        zoneId: zone.id,
        zoneName: zone.name,
        temp: zone.currentTemp,
        rain: zone.currentRain,
        riskScore: zone.currentRiskScore,
        capturedAt: zone.lastWeatherUpdate,
        source: 'demo-simulation' as const,
      }))
    )
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string>('hyd-charminar');
  const [payouts, setPayouts] = useState<Payout[]>(() => loadLocalData('rainguard_payouts', DEMO_PAYOUTS));
  const [confirmations, setConfirmations] = useState<PeerConfirmation[]>(() =>
    loadLocalData('rainguard_confirmations', DEMO_CONFIRMATIONS)
  );
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>(() => loadLocalData('rainguard_sms_logs', DEMO_SMS_LOGS));
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() =>
    loadLocalData('rainguard_withdrawals', [])
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Monsoon Alert Advisory',
      message: 'Charminar and Koti sectors are under elevated weather distress monitoring.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'risk',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Parametric Policy Verified',
      message: 'Your baseline daily wage is secured under the parametric protection pool.',
      timestamp: 'Yesterday',
      type: 'system',
      read: true,
    },
  ]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rainguard_lang', lang);
  };

  const toggleLargeText = () => {
    setLargeText((prev) => {
      const next = !prev;
      localStorage.setItem('rainguard_large_text', String(next));
      if (next) {
        document.documentElement.classList.add('large-text');
      } else {
        document.documentElement.classList.remove('large-text');
      }
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
  }, [largeText]);

  useEffect(() => saveLocalData('rainguard_zones', zones), [zones]);
  useEffect(() => saveLocalData('rainguard_risk_history', riskHistory), [riskHistory]);
  useEffect(() => saveLocalData('rainguard_payouts', payouts), [payouts]);
  useEffect(() => saveLocalData('rainguard_confirmations', confirmations), [confirmations]);
  useEffect(() => saveLocalData('rainguard_sms_logs', smsLogs), [smsLogs]);
  useEffect(() => saveLocalData('rainguard_withdrawals', withdrawals), [withdrawals]);

  const toggleOffline = () => {
    setIsOffline((prev) => !prev);
  };

  const t = useCallback(
    (key: string) => {
      return getTranslation(language, key);
    },
    [language]
  );

  // Refresh Weather & Auto-trigger Parametric Logic
  const refreshZoneWeather = async (targetZoneId?: string) => {
    const zoneToUpdate = targetZoneId || selectedZoneId;
    const currentZone = zones.find((z) => z.id === zoneToUpdate);
    if (!currentZone) return;

    const weather = await weatherService.fetchZoneWeather(
      currentZone.coordinates.lat,
      currentZone.coordinates.lng
    );

    const calculation = calculateParametricRisk(weather.temp, weather.rain);
    let status: 'safe' | 'moderate' | 'critical' = 'safe';
    if (calculation.totalScore > 70) status = 'critical';
    else if (calculation.totalScore > 40) status = 'moderate';

    const updatedZone: Zone = {
      ...currentZone,
      currentTemp: weather.temp,
      currentRain: weather.rain,
      currentRiskScore: calculation.totalScore,
      status,
      highRiskReason: calculation.primaryRiskFactor,
      lastWeatherUpdate: new Date().toISOString(),
    };

    setZones((prev) => prev.map((z) => (z.id === zoneToUpdate ? updatedZone : z)));
    setRiskHistory((prev) => [
      {
        id: `obs-${Date.now()}`,
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        temp: weather.temp,
        rain: weather.rain,
        riskScore: calculation.totalScore,
        capturedAt: updatedZone.lastWeatherUpdate,
        source: 'demo-simulation',
      },
      ...prev,
    ].slice(0, 500));

    // Check if payout should be auto-triggered
    if (calculation.payoutPercentage > 0 && user && user.role === 'worker') {
      const payoutAmount = Math.round((user.dailyWage * calculation.payoutPercentage) / 100);
      const newPayoutId = 'pay-' + Date.now().toString().slice(-6);

      const smsText =
        user.language === 'te'
          ? `రెయిన్‌గార్డ్: ${currentZone.name}లో తీవ్ర వాతావరణం (స్కోరు ${calculation.totalScore}) కారణంగా ₹${payoutAmount} క్లెయిమ్ ప్రారంభమైంది. తోటి వ్యాపారుల నిర్ధారణ తర్వాత విడుదలవుతుంది.`
          : user.language === 'hi'
          ? `रेनगार्ड: ${currentZone.name} में खराब मौसम (स्कोर ${calculation.totalScore}) के कारण ₹${payoutAmount} का दावा शुरू हुआ। साथी सत्यापन के बाद राशि जमा होगी।`
          : `RainGuard Alert: Weather distress (Score ${calculation.totalScore}) in ${currentZone.name}. Queued ₹${payoutAmount} payout awaiting peer ground confirmations.`;

      const newPayout: Payout = {
        id: newPayoutId,
        workerId: user.uid,
        workerName: user.name,
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        riskScore: calculation.totalScore,
        weatherSnapshot: {
          temp: weather.temp,
          rain: weather.rain,
          condition: weather.condition,
        },
        tier: `${calculation.tier} (${calculation.payoutPercentage}%)`,
        percentage: calculation.payoutPercentage,
        dailyWage: user.dailyWage,
        amount: payoutAmount,
        status: 'pending_confirmation',
        confirmationsCount: 0,
        requiredConfirmations: 2,
        confirmedBy: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        createdAt: new Date().toISOString(),
        smsDispatched: true,
        smsText,
      };

      setPayouts((prev) => [newPayout, ...prev]);

      // Add to SMS Logs
      const newSms: SmsLog = {
        id: 'sms-' + Date.now().toString().slice(-6),
        workerId: user.uid,
        workerName: user.name,
        phone: user.phone,
        language: user.language,
        message: smsText,
        type: 'RISK_ALERT',
        timestamp: new Date().toISOString(),
        delivered: true,
      };
      setSmsLogs((prev) => [newSms, ...prev]);
      // Push Notification
      setNotifications((prev) => [
        {
          id: 'notif-' + Date.now(),
          title: `Parametric Payout Queued (₹${payoutAmount})`,
          message: `${calculation.tier} triggered for ${currentZone.name}. Awaiting peer verification.`,
          timestamp: 'Just now',
          type: 'payout',
          read: false,
        },
        ...prev,
      ]);
    }
  };

  // Simulate Weather Distress Surge (for test & demo evaluation)
  const simulateDistressSurge = async (zoneId: string, type: 'heat' | 'rain') => {
    const currentZone = zones.find((z) => z.id === zoneId);
    if (!currentZone) return;

    let temp = currentZone.currentTemp;
    let rain = currentZone.currentRain;

    if (type === 'heat') {
      temp = 44.8;
      rain = 0;
    } else {
      temp = 29.4;
      rain = 52.0;
    }

    const calc = calculateParametricRisk(temp, rain);
    const updatedZone: Zone = {
      ...currentZone,
      currentTemp: temp,
      currentRain: rain,
      currentRiskScore: calc.totalScore,
      status: calc.totalScore > 70 ? 'critical' : 'moderate',
      highRiskReason: calc.primaryRiskFactor,
      lastWeatherUpdate: new Date().toISOString(),
    };

    setZones((prev) => prev.map((z) => (z.id === zoneId ? updatedZone : z)));
    setRiskHistory((prev) => [
      {
        id: `obs-${Date.now()}`,
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        temp,
        rain,
        riskScore: calc.totalScore,
        capturedAt: updatedZone.lastWeatherUpdate,
        source: 'demo-simulation',
      },
      ...prev,
    ].slice(0, 500));

    // Trigger payout immediately
    if (user) {
      const payoutAmount = Math.round((user.dailyWage * calc.payoutPercentage) / 100);
      const newPayoutId = 'pay-distress-' + Date.now().toString().slice(-5);

      const smsText =
        user.language === 'te'
          ? `రెయిన్‌గార్డ్: ${currentZone.name}లో తీవ్ర ${type === 'rain' ? 'భారీ వర్షం' : 'ఎండ తీవ్రత'} (స్కోరు ${calc.totalScore}) కారణంగా ₹${payoutAmount} రిలీజ్ అవ్వడానికి తోటి వ్యాపారుల నిర్ధారణ అభ్యర్థన పంపబడింది.`
          : `RainGuard: Severe ${type === 'rain' ? 'monsoon downpour' : 'heatwave surge'} (Score ${calc.totalScore}) recorded in ${currentZone.name}. ₹${payoutAmount} payout queued.`;

      const newPayout: Payout = {
        id: newPayoutId,
        workerId: user.uid,
        workerName: user.name,
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        riskScore: calc.totalScore,
        weatherSnapshot: {
          temp,
          rain,
          condition: type === 'rain' ? 'Severe Monsoon Inundation' : 'Extreme Heatwave',
        },
        tier: `${calc.tier} (${calc.payoutPercentage}%)`,
        percentage: calc.payoutPercentage,
        dailyWage: user.dailyWage,
        amount: payoutAmount,
        status: 'pending_confirmation',
        confirmationsCount: 0,
        requiredConfirmations: 2,
        confirmedBy: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        createdAt: new Date().toISOString(),
        smsDispatched: true,
        smsText,
      };

      setPayouts((prev) => [newPayout, ...prev]);

      // Add to SMS logs
      const newSms: SmsLog = {
        id: 'sms-' + Date.now().toString().slice(-6),
        workerId: user.uid,
        workerName: user.name,
        phone: user.phone,
        language: user.language,
        message: smsText,
        type: 'RISK_ALERT',
        timestamp: new Date().toISOString(),
        delivered: true,
      };
      setSmsLogs((prev) => [newSms, ...prev]);

      setNotifications((prev) => [
        {
          id: 'notif-' + Date.now(),
          title: `Severe Weather Trigger: ${calc.primaryRiskFactor}`,
          message: `Score ${calc.totalScore}/100. Payout ₹${payoutAmount} ready for peer confirmation.`,
          timestamp: 'Just now',
          type: 'risk',
          read: false,
        },
        ...prev,
      ]);
    }
  };

  // Peer consensus simulation trigger (0/2 -> 2/2) live handler
  const simulatePeerConsensus = async (payoutId: string): Promise<boolean> => {
    const targetPayout = payouts.find((p) => p.id === payoutId);
    if (!targetPayout) return false;

    const conf1: PeerConfirmation = {
      id: 'conf-peer-' + Date.now() + '-1',
      payoutId,
      zoneId: targetPayout.zoneId,
      verifierId: 'demo-worker-lakshmi-102',
      verifierName: 'Lakshmi Devi',
      verifierTrade: 'Flower Garland Stall',
      verifierLat: 17.3616 + (Math.random() - 0.5) * 0.003,
      verifierLng: 78.4747 + (Math.random() - 0.5) * 0.003,
      conditionReported: 'heavy_rain',
      confirmed: true,
      fraudCheckPassed: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    };

    const conf2: PeerConfirmation = {
      id: 'conf-peer-' + Date.now() + '-2',
      payoutId,
      zoneId: targetPayout.zoneId,
      verifierId: 'demo-worker-suresh-103',
      verifierName: 'Suresh Yadav',
      verifierTrade: 'Chai & Snacks Cart',
      verifierLat: 17.3618 + (Math.random() - 0.5) * 0.003,
      verifierLng: 78.4749 + (Math.random() - 0.5) * 0.003,
      conditionReported: 'heavy_rain',
      confirmed: true,
      fraudCheckPassed: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    };

    // Update confirmations in state
    setConfirmations((prev) => [conf1, conf2, ...prev]);

    // Update payout status to 2/2 and verified / disbursed
    const updatedPayout: Payout = {
      ...targetPayout,
      confirmationsCount: targetPayout.requiredConfirmations, // 2/2
      confirmedBy: [conf1.verifierId, conf2.verifierId],
      status: 'verified',
    };

    setPayouts((prev) => prev.map((p) => (p.id === payoutId ? updatedPayout : p)));

    if (user?.uid === targetPayout.workerId) {
      const newBalance = (user.walletBalance || 0) + targetPayout.amount;
      await updateProfile({
        walletBalance: newBalance,
        parametricCredits: newBalance,
      });
    }

    // Add SMS log
    const smsText = `RainGuard: Consensus verified (2/2)! ₹${targetPayout.amount} credited to wallet for ${targetPayout.workerName}. Ready for UPI withdrawal.`;
    const newSms: SmsLog = {
      id: 'sms-' + Date.now().toString().slice(-6),
      workerId: targetPayout.workerId,
      workerName: targetPayout.workerName,
      phone: user?.phone || '+91 98480 23145',
      language: user?.language || 'en',
      message: smsText,
      type: 'PAYOUT_CREDITED',
      timestamp: new Date().toISOString(),
      delivered: true,
    };
    setSmsLogs((prev) => [newSms, ...prev]);

    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: `Peer Consensus Reached (2/2): ₹${targetPayout.amount}`,
        message: `2 registered vendors confirmed ground distress for ${targetPayout.workerName}. Payout unlocked.`,
        timestamp: 'Just now',
        type: 'payout',
        read: false,
      },
      ...prev,
    ]);

    return true;
  };

  // Peer GPS Verification system
  const submitPeerConfirmation = async (
    payoutId: string,
    condition: 'heavy_rain' | 'extreme_heat' | 'waterlogging' | 'normal',
    isDistress: boolean
  ): Promise<boolean> => {
    if (!user) return false;

    const targetPayout = payouts.find((p) => p.id === payoutId);
    if (!targetPayout) return false;

    // Fraud check 1: cannot confirm own payout
    if (targetPayout.workerId === user.uid) {
      alert('Fraud Protection: You cannot peer-verify your own payout claim.');
      return false;
    }

    // Fraud check 2: zone sector match
    const fraudPassed = user.zoneId === targetPayout.zoneId;

    const newConfId = 'conf-' + Date.now().toString().slice(-6);
    const newConf: PeerConfirmation = {
      id: newConfId,
      payoutId,
      zoneId: targetPayout.zoneId,
      verifierId: user.uid,
      verifierName: user.name,
      verifierTrade: user.trade,
      verifierLat: 17.3616 + (Math.random() - 0.5) * 0.005,
      verifierLng: 78.4747 + (Math.random() - 0.5) * 0.005,
      conditionReported: condition,
      confirmed: isDistress,
      fraudCheckPassed: fraudPassed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    };

    setConfirmations((prev) => [newConf, ...prev]);

    if (isDistress && fraudPassed) {
      const nextCount = targetPayout.confirmationsCount + 1;
      const nextConfirmedBy = [...targetPayout.confirmedBy, user.uid];
      const reachedQuorum = nextCount >= targetPayout.requiredConfirmations;
      const newStatus = reachedQuorum ? 'verified' : 'pending_confirmation';

      const updatedPayout: Payout = {
        ...targetPayout,
        confirmationsCount: nextCount,
        confirmedBy: nextConfirmedBy,
        status: newStatus,
      };

      setPayouts((prev) => prev.map((p) => (p.id === payoutId ? updatedPayout : p)));

      // If reached quorum, release funds into the claimant worker's wallet
      if (reachedQuorum) {
        // If current active user is the claimant, update local context
        if (user.uid === targetPayout.workerId) {
          updateProfile({ walletBalance: (user.walletBalance || 0) + targetPayout.amount });
        }

        // Dispatch Confirmation Success SMS
        const creditSms: SmsLog = {
          id: 'sms-' + Date.now().toString().slice(-6),
          workerId: targetPayout.workerId,
          workerName: targetPayout.workerName,
          phone: user.phone,
          language: user.language,
          message: `RainGuard: ₹${targetPayout.amount} credited! Quorum of 2 peer vendors verified ground conditions. Ready to withdraw via UPI.`,
          type: 'PAYOUT_CREDITED',
          timestamp: new Date().toISOString(),
          delivered: true,
        };
        setSmsLogs((prev) => [creditSms, ...prev]);

        setNotifications((prev) => [
          {
            id: 'notif-' + Date.now(),
            title: `Payout Verified & Credited: ₹${targetPayout.amount}`,
            message: `Peer confirmations quorum reached for ${targetPayout.workerName}. Funds unlocked in wallet.`,
            timestamp: 'Just now',
            type: 'payout',
            read: false,
          },
          ...prev,
        ]);
      }
      return true;
    }

    return true;
  };

  // Execute Simulated Instant Withdrawal
  const executeWithdrawal = async (
    amount: number,
    method: 'UPI' | 'Bank Account' | 'Seva Kendra Kiosk',
    reference: string
  ): Promise<boolean> => {
    if (!user || user.walletBalance < amount || amount <= 0) return false;

    const newBalance = user.walletBalance - amount;
    await updateProfile({ walletBalance: newBalance });

    const withdrawalId = 'wth-' + Date.now().toString().slice(-6);
    const wDoc: Withdrawal = {
      id: withdrawalId,
      workerId: user.uid,
      amount,
      method,
      reference,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      status: 'completed',
    };

    // Add withdrawal SMS
    const smsText =
      user.language === 'te'
        ? `రెయిన్‌గార్డ్: మీ వాలెట్ నుండి ₹${amount} విజయవంతంగా ${method} ద్వారా పంపబడింది. రిఫరెన్స్: ${reference}`
        : user.language === 'hi'
        ? `रेनगार्ड: आपके वॉलेट से ₹${amount} सफलतापूर्वक ${method} द्वारा भेजा गया। संदर्भ: ${reference}`
        : `RainGuard: ₹${amount} disbursed to ${method} (${reference}). Updated wallet balance: ₹${newBalance}.`;

    const smsRecord: SmsLog = {
      id: 'sms-' + Date.now().toString().slice(-6),
      workerId: user.uid,
      workerName: user.name,
      phone: user.phone,
      language: user.language,
      message: smsText,
      type: 'PAYOUT_CREDITED',
      timestamp: new Date().toISOString(),
      delivered: true,
    };
    setSmsLogs((prev) => [smsRecord, ...prev]);
    setWithdrawals((prev) => [wDoc, ...prev]);

    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: `Withdrawal Successful: ₹${amount}`,
        message: `Disbursed to ${method}. Ref: ${reference}`,
        timestamp: 'Just now',
        type: 'system',
        read: false,
      },
      ...prev,
    ]);

    return true;
  };

  // Admin Override
  const adminOverridePayout = async (payoutId: string, action: 'approve' | 'flag' | 'decline') => {
    const target = payouts.find((p) => p.id === payoutId);
    if (!target) return;

    let newStatus: any = target.status;
    if (action === 'approve') newStatus = 'verified';
    if (action === 'decline') newStatus = 'declined';
    if (action === 'flag') newStatus = 'pending_confirmation';

    const updated = {
      ...target,
      status: newStatus,
      adminOverridden: true,
    };

    setPayouts((prev) => prev.map((p) => (p.id === payoutId ? updated : p)));

    if (action === 'approve' && user?.uid === target.workerId) {
      updateProfile({ walletBalance: (user.walletBalance || 0) + target.amount });
    }

    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: `Admin Action: Payout ${payoutId}`,
        message: `Status updated to ${newStatus} by NGO manager override.`,
        timestamp: 'Just now',
        type: 'system',
        read: false,
      },
      ...prev,
    ]);
  };

  const adminTriggerSectorRelief = async (zoneId: string, percentage: number) => {
    const targetZone = zones.find((z) => z.id === zoneId);
    if (!targetZone) return;

    // Trigger sector-wide emergency payout
    if (user) {
      const amount = Math.round((user.dailyWage * percentage) / 100);
      const newPayoutId = 'pay-sector-' + Date.now().toString().slice(-5);
      const p: Payout = {
        id: newPayoutId,
        workerId: user.uid,
        workerName: user.name,
        zoneId: targetZone.id,
        zoneName: targetZone.name,
        riskScore: 95,
        weatherSnapshot: {
          temp: targetZone.currentTemp,
          rain: targetZone.currentRain,
          condition: 'Admin Declared Sector Emergency Relief',
        },
        tier: `Sector Relief (${percentage}%)`,
        percentage,
        dailyWage: user.dailyWage,
        amount,
        status: 'verified',
        confirmationsCount: 2,
        requiredConfirmations: 2,
        confirmedBy: ['admin-emergency-override'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        createdAt: new Date().toISOString(),
        smsDispatched: true,
        smsText: `RainGuard Sector Emergency: ₹${amount} approved by NGO administration for ${targetZone.name}.`,
        adminOverridden: true,
      };

      setPayouts((prev) => [p, ...prev]);
      await updateProfile({ walletBalance: (user.walletBalance || 0) + amount });

      setNotifications((prev) => [
        {
          id: 'notif-' + Date.now(),
          title: `Sector Relief Disbursed: ₹${amount}`,
          message: `Emergency payout approved for ${targetZone.name}.`,
          timestamp: 'Just now',
          type: 'payout',
          read: false,
        },
        ...prev,
      ]);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        largeText,
        toggleLargeText,
        isOffline,
        toggleOffline,
        zones,
        riskHistory,
        selectedZoneId,
        setSelectedZoneId,
        activeZone,
        payouts,
        confirmations,
        smsLogs,
        withdrawals,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        refreshZoneWeather,
        simulateDistressSurge,
        simulatePeerConsensus,
        submitPeerConfirmation,
        executeWithdrawal,
        adminOverridePayout,
        adminTriggerSectorRelief,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
