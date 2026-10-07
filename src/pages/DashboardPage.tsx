import React, { useState } from 'react';
import {
  CloudRain,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Zap,
  ArrowRight,
  Droplets,
  Calendar,
  Wallet,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ExplainableReceiptModal } from '../components/payout/ExplainableReceiptModal';
import { Payout } from '../types';
import { getPersonaImage } from '../utils/personaImages';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    activeZone,
    zones,
    payouts,
    confirmations,
    refreshZoneWeather,
    simulateDistressSurge,
    simulatePeerConsensus,
    isOffline,
    t,
  } = useApp();

  const [selectedReceipt, setSelectedReceipt] = useState<Payout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute metrics
  const userPayouts = payouts.filter((p) => p.workerId === user?.uid);
  const totalEarned = userPayouts
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayout = userPayouts.find(
    (p) => p.status === 'pending_confirmation' || p.status === 'queued'
  );

  const verifiedPayouts = userPayouts.filter((p) => p.status === 'verified' || p.status === 'paid' || p.status === 'disbursed');
  const claimLifecycle = [
    { label: 'Triggered', value: userPayouts.length },
    { label: 'Awaiting peers', value: userPayouts.filter((p) => p.status === 'pending_confirmation' || p.status === 'queued').length },
    { label: 'Verified', value: verifiedPayouts.length },
  ];
  const avgZoneRisk = Math.round(
    zones.reduce((sum, zone) => sum + zone.currentRiskScore, 0) / Math.max(zones.length, 1)
  );
  const relevantConfirmations = confirmations.filter((confirmation) =>
    userPayouts.some((payout) => payout.id === confirmation.payoutId)
  );
  const passedConfirmations = relevantConfirmations.filter(
    (confirmation) => confirmation.confirmed && confirmation.fraudCheckPassed
  ).length;
  const trustScore = relevantConfirmations.length
    ? Math.round((passedConfirmations / relevantConfirmations.length) * 100)
    : null;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshZoneWeather();
    setIsRefreshing(false);
  };

  const riskScore = activeZone?.currentRiskScore || 24;
  let riskColor = 'text-[#1E4D38]';
  let riskBg = 'bg-[#E7F3EC] border-[#B7D8C5]';
  let riskLevel = 'Safe Operating Weather';

  if (riskScore > 70) {
    riskColor = 'text-[#9C3D1B]';
    riskBg = 'bg-[#FBECE5] border-[#EAD0C5]';
    riskLevel = 'Critical Distress (Tier 2/3)';
  } else if (riskScore > 40) {
    riskColor = 'text-amber-800';
    riskBg = 'bg-amber-50 border-amber-200';
    riskLevel = 'Moderate Distress (Tier 1 Triggered)';
  }

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E6DEC8] bg-[#F4EFE6] p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1E4D38]/10 px-3 py-1 text-xs font-semibold text-[#1E4D38] mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{t('policyActiveBadge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2C241E]">
              {t('welcomeBack')}, {user?.name}
            </h1>
            <p className="mt-2 text-sm text-[#5C4F42] leading-relaxed">
              Assigned to <strong className="text-[#1E4D38]">{user?.zoneName}</strong> with baseline coverage of{' '}
              <strong className="text-[#2C241E]">₹{user?.dailyWage}/day</strong>. Your income is protected against extreme heat and monsoon waterlogging.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1E4D38] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#163B2B] transition-colors disabled:opacity-60"
              >
                <Zap className="h-4 w-4" />
                <span>{isRefreshing ? 'Checking Sensors...' : t('refreshWeather')}</span>
              </button>

              <button
                onClick={() => simulateDistressSurge(user?.zoneId || 'hyd-charminar', 'rain')}
                className="inline-flex items-center gap-2 rounded-xl border border-[#C85A32] bg-[#FBECE5] px-4 py-2.5 text-xs font-semibold text-[#C85A32] hover:bg-[#F7DDD1] transition-colors"
                title="Test how real-time rain trigger releases parametric compensation"
              >
                <CloudRain className="h-4 w-4" />
                <span>Simulate Rain Surge (Test)</span>
              </button>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="relative h-44 w-full md:w-72 shrink-0 overflow-hidden rounded-2xl border border-[#D9CDB8] shadow-sm">
            <img
              src={getPersonaImage(user)}
              alt={`${user?.name || 'RainGuard member'} profile`}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Graceful fallback container
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
              <p className="text-[11px] font-medium text-white/90">
                Parametric micro-safety net for daily-wage merchants
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Risk Meter & Active Payout Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Risk Score Card */}
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-[#7D7060]">
                {t('todayRiskScore')}
              </span>
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${riskBg} ${riskColor}`}>
                {riskLevel}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-extrabold tabular-nums tracking-tight text-[#2C241E]">
                {riskScore}
              </span>
              <span className="text-sm font-semibold text-[#7D7060]">/ 100 Risk Index</span>
            </div>

            <p className="mt-2 text-xs text-[#5C4F42]">
              {t('riskScaleExplainer')}. Trigger threshold:{' '}
              <strong className="text-[#C85A32]">&gt; 40 score</strong>.
            </p>

            {/* Visual Risk Progress Bar */}
            <div className="mt-4 space-y-1">
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#EAE2D2]">
                <div
                  className={`h-full transition-all duration-500 ${
                    riskScore > 70 ? 'bg-[#C85A32]' : riskScore > 40 ? 'bg-amber-600' : 'bg-[#1E4D38]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#7D7060]">
                <span>0 (Comfortable)</span>
                <span>40 (Trigger Tier 1)</span>
                <span>70 (Tier 2)</span>
                <span>100 (Disaster)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E6DEC8]/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-[#5C4F42]">
              <span>Temp: <strong>{activeZone?.currentTemp}°C</strong></span>
              <span>·</span>
              <span>Rain: <strong>{activeZone?.currentRain} mm/h</strong></span>
            </div>
            <Link
              to="/risk-monitor"
              className="inline-flex items-center gap-1 font-semibold text-[#1E4D38] hover:underline"
            >
              <span>View Telemetry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Current Payout Status Card */}
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-[#7D7060]">
                {t('currentPayoutStatus')}
              </span>
              <span className="text-xs font-mono text-[#7D7060]">Auto-Oracle</span>
            </div>

            {pendingPayout ? (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-700" />
                    <span>Payout Queued: ₹{pendingPayout.amount}</span>
                  </div>
                  <span className="rounded bg-amber-200/60 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                    {pendingPayout.tier}
                  </span>
                </div>
                <p className="mt-2 text-xs text-amber-950 leading-relaxed">
                  Weather distress detected in {pendingPayout.zoneName}. Peer vendors are verifying ground condition to release funds.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-amber-200">
                  <span className="text-amber-800">
                    Confirmations: <strong>{pendingPayout.confirmationsCount} / {pendingPayout.requiredConfirmations}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => simulatePeerConsensus(pendingPayout.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#1E4D38] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#163B2B] shadow-xs"
                      title="Auto-confirm peer verification"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Auto-Confirm (2/2)</span>
                    </button>
                    <Link
                      to="/confirmations"
                      className="font-bold text-[#1E4D38] hover:underline"
                    >
                      Check Peer Status →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-[#B7D8C5] bg-[#E7F3EC]/70 p-4">
                <div className="flex items-center gap-2 text-[#1E4D38] font-bold text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{t('statusSafe')}</span>
                </div>
                <p className="mt-2 text-xs text-[#2A4839] leading-relaxed">
                  Your baseline wage of ₹{user?.dailyWage} is safeguarded. If weather crosses risk score 40, your payout will be algorithmically released without paperwork.
                </p>
                <div className="mt-3 text-[11px] text-[#426854]">
                  Last synced: {activeZone ? new Date(activeZone.lastWeatherUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E6DEC8]/60 flex items-center justify-between text-xs">
            <span className="text-[#7D7060]">Wallet Balance: <strong className="text-[#1E4D38]">₹{user?.walletBalance || 0}</strong></span>
            <Link
              to="/wallet"
              className="inline-flex items-center gap-1 font-semibold text-[#1E4D38] hover:underline"
            >
              <span>Manage Wallet</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Protection Metrics (Anti-slop, clean unboxed figures with tabular-nums) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#7D7060] mb-3">
          {t('quickStats')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
            <span className="text-xs text-[#7D7060]">{t('totalEarnedPayouts')}</span>
            <div className="mt-2 text-2xl font-bold tabular-nums text-[#1E4D38]">
              ₹{totalEarned}
            </div>
            <p className="mt-1 text-[11px] text-[#5C4F42]">Direct climate relief</p>
          </div>

          <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
            <span className="text-xs text-[#7D7060]">{t('daysProtected')}</span>
            <div className="mt-2 text-2xl font-bold tabular-nums text-[#2C241E]">
              {user?.daysProtected || 30} Days
            </div>
            <p className="mt-1 text-[11px] text-[#5C4F42]">Continuous coverage</p>
          </div>

          <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
            <span className="text-xs text-[#7D7060]">{t('dailyDeclaredWage')}</span>
            <div className="mt-2 text-2xl font-bold tabular-nums text-[#2C241E]">
              ₹{user?.dailyWage || 700}
            </div>
            <p className="mt-1 text-[11px] text-[#5C4F42]">Baseline replacement</p>
          </div>

          <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
            <span className="text-xs text-[#7D7060]">Available in Wallet</span>
            <div className="mt-2 text-2xl font-bold tabular-nums text-[#C85A32]">
              ₹{user?.walletBalance || 0}
            </div>
            <p className="mt-1 text-[11px] text-[#5C4F42]">Instant UPI ready</p>
          </div>
        </div>
      </div>

      {/* Quick Ops Snapshot */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D7060]">Market risk snapshot</span>
            <TrendingUp className="h-4 w-4 text-[#1E4D38]" />
          </div>
          <div className="mt-3 text-2xl font-bold tabular-nums text-[#2C241E]">{avgZoneRisk}</div>
          <p className="mt-1 text-[11px] text-[#5C4F42]">Average current risk across {zones.length} demo markets</p>
          <div className="mt-3 text-[11px] text-[#1E4D38] font-semibold">Demo telemetry · not a forecast</div>
        </div>

        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D7060]">Peer verification</span>
            <ShieldCheck className="h-4 w-4 text-[#1E4D38]" />
          </div>
          <div className="mt-3 text-2xl font-bold tabular-nums text-[#2C241E]">{trustScore === null ? '—' : `${trustScore}%`}</div>
          <p className="mt-1 text-[11px] text-[#5C4F42]">Passed peer checks for your claims</p>
          <div className="mt-3 text-[11px] text-[#1E4D38] font-semibold">{relevantConfirmations.length} recorded checks</div>
        </div>

        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D7060]">Claim lifecycle</span>
            <Clock className="h-4 w-4 text-[#1E4D38]" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {claimLifecycle.map((item) => (
              <div key={item.label} className="rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] p-3">
                <div className="text-[10px] uppercase tracking-wider text-[#7D7060]">{item.label}</div>
                <div className="mt-2 text-xl font-bold tabular-nums text-[#2C241E]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5 xl:col-span-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#7D7060]">Local demo storage</div>
              <div className="mt-2 text-lg font-bold text-[#2C241E]">
                {isOffline ? 'Offline simulation enabled' : 'Browser storage active'}
              </div>
              <p className="mt-1 text-[11px] text-[#5C4F42]">
                Demo records are saved in this browser; no server sync is configured.
              </p>
            </div>
            <div className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isOffline ? 'bg-amber-100 text-amber-900' : 'bg-[#E7F3EC] text-[#1E4D38]'}`}>
              {isOffline ? 'Offline mode' : 'Local-only'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payouts Table Preview */}
      <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#2C241E]">Recent Parametric Payouts</h3>
            <p className="text-xs text-[#7D7060]">Algorithmic disbursements triggered by weather anomalies</p>
          </div>
          <Link
            to="/payouts"
            className="text-xs font-semibold text-[#1E4D38] hover:underline"
          >
            View Full Ledger →
          </Link>
        </div>

        {userPayouts.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7D7060]">
            No payouts recorded yet. Use "Simulate Rain Surge" to test the automated parametric payout engine.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6DEC8] text-[#7D7060]">
                  <th className="py-3 px-3 font-semibold">Claim ID</th>
                  <th className="py-3 px-3 font-semibold">Market Zone</th>
                  <th className="py-3 px-3 font-semibold">Risk Score</th>
                  <th className="py-3 px-3 font-semibold">Tier Trigger</th>
                  <th className="py-3 px-3 font-semibold text-right">Amount</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DEC8]/60 text-[#2C241E]">
                {userPayouts.slice(0, 3).map((payout) => (
                  <tr key={payout.id} className="hover:bg-[#F4EFE6]/60 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-medium">{payout.id}</td>
                    <td className="py-3.5 px-3">{payout.zoneName}</td>
                    <td className="py-3.5 px-3 font-bold tabular-nums">
                      <span className={payout.riskScore > 70 ? 'text-[#C85A32]' : 'text-amber-800'}>
                        {payout.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-3">{payout.tier}</td>
                    <td className="py-3.5 px-3 font-bold tabular-nums text-right text-[#1E4D38]">
                      ₹{payout.amount}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          payout.status === 'verified'
                            ? 'bg-[#E7F3EC] text-[#1E4D38]'
                            : payout.status === 'pending_confirmation'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {payout.status === 'verified' ? 'Paid' : 'Pending Verification'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedReceipt(payout)}
                        className="rounded-lg border border-[#D9CDB8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#1E4D38] hover:bg-[#F4EFE6]"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Explainable Receipt Modal */}
      <ExplainableReceiptModal
        payout={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
