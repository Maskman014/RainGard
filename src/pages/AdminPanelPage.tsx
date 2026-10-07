import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Flag,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile, Payout } from '../types';
import { ExplainableReceiptModal } from '../components/payout/ExplainableReceiptModal';

const DEFAULT_VENDORS: UserProfile[] = [
  {
    uid: 'demo-worker-ramesh-101',
    name: 'Ramesh Kumar',
    phone: '+91 98480 23145',
    zoneId: 'hyd-charminar',
    zoneName: 'Charminar Heritage Bazaar',
    dailyWage: 750,
    trade: 'Fruit & Vegetable Cart',
    language: 'te',
    role: 'worker',
    walletBalance: 1450,
    parametricCredits: 1450,
    daysProtected: 42,
    policyActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'demo-worker-lakshmi-102',
    name: 'Lakshmi Devi',
    phone: '+91 99890 87412',
    zoneId: 'hyd-koti',
    zoneName: 'Koti Sultan Bazaar',
    dailyWage: 600,
    trade: 'Flower Garland Stall',
    language: 'te',
    role: 'worker',
    walletBalance: 980,
    parametricCredits: 980,
    daysProtected: 30,
    policyActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'demo-worker-suresh-103',
    name: 'Suresh Yadav',
    phone: '+91 97001 22334',
    zoneId: 'hyd-ameerpet',
    zoneName: 'Ameerpet Commercial Cross',
    dailyWage: 800,
    trade: 'Chai & Snacks Cart',
    language: 'hi',
    role: 'worker',
    walletBalance: 640,
    parametricCredits: 640,
    daysProtected: 18,
    policyActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const AdminPanelPage: React.FC = () => {
  const { user } = useAuth();
  const {
    zones,
    payouts,
    confirmations,
    adminOverridePayout,
    adminTriggerSectorRelief,
    simulatePeerConsensus,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'payouts' | 'workers' | 'zones'>('payouts');
  const [workers, setWorkers] = useState<UserProfile[]>(DEFAULT_VENDORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Payout | null>(null);

  const combinedClaims = payouts;

  // Calculate sum of disbursed claim amounts from the claims collection (status == 'disbursed' | 'verified' | 'paid')
  const totalDisbursed = combinedClaims
    .filter((p) => p.status === 'disbursed' || p.status === 'verified' || p.status === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const highRiskZones = zones.filter((z) => z.currentRiskScore > 40);
  const passedChecks = confirmations.filter((confirmation) => confirmation.fraudCheckPassed).length;
  const fraudPassRate = confirmations.length
    ? Math.round((passedChecks / confirmations.length) * 100)
    : null;
  const claimsByZone = zones
    .map((zone) => ({
      ...zone,
      claims: combinedClaims.filter((claim) => claim.zoneId === zone.id),
    }))
    .sort((a, b) => b.claims.length - a.claims.length);
  const confirmerStats = confirmations.reduce<
    Record<string, { name: string; total: number; passed: number }>
  >((stats, confirmation) => {
    const current = stats[confirmation.verifierId] || {
      name: confirmation.verifierName,
      total: 0,
      passed: 0,
    };
    current.total += 1;
    if (confirmation.confirmed && confirmation.fraudCheckPassed) current.passed += 1;
    stats[confirmation.verifierId] = current;
    return stats;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DEC8] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-[#1E4D38] px-2.5 py-0.5 text-[11px] font-bold text-white mb-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>NGO Field Director Console</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C241E]">
            {t('adminTitle')}
          </h1>
          <p className="mt-1 text-xs text-[#5C4F42] max-w-2xl">
            {t('adminSubtitle')}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-[#D9CDB8] bg-[#F4EFE6] p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('payouts')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeTab === 'payouts'
                ? 'bg-white text-[#1E4D38] font-bold shadow-xs'
                : 'text-[#5C4F42] hover:text-[#2C241E]'
            }`}
          >
            Claims ({combinedClaims.length})
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeTab === 'workers'
                ? 'bg-white text-[#1E4D38] font-bold shadow-xs'
                : 'text-[#5C4F42] hover:text-[#2C241E]'
            }`}
          >
            Vendors ({workers.length})
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              activeTab === 'zones'
                ? 'bg-white text-[#1E4D38] font-bold shadow-xs'
                : 'text-[#5C4F42] hover:text-[#2C241E]'
            }`}
          >
            Zones ({zones.length})
          </button>
        </div>
      </div>

      {/* Aggregate KPI Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
          <span className="text-xs text-[#7D7060]">{t('totalWorkersEnrolled')}</span>
          <div className="mt-1 text-2xl font-bold tabular-nums text-[#2C241E]">
            {workers.length} Vendors
          </div>
          <p className="mt-0.5 text-[11px] text-[#1E4D38] font-medium">Demo roster</p>
        </div>

        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
          <span className="text-xs text-[#7D7060]">{t('totalClaimsPaid')}</span>
          <div className="mt-1 text-2xl font-bold tabular-nums text-[#1E4D38]">
            ₹{totalDisbursed}
          </div>
          <p className="mt-0.5 text-[11px] text-[#5C4F42]">Verified / paid demo claims</p>
        </div>

        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
          <span className="text-xs text-[#7D7060]">{t('highRiskZonesCount')}</span>
          <div className="mt-1 text-2xl font-bold tabular-nums text-[#C85A32]">
            {highRiskZones.length} / {zones.length}
          </div>
          <p className="mt-0.5 text-[11px] text-[#C85A32] font-medium">Score &gt; 40 Threshold</p>
        </div>

        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
          <span className="text-xs text-[#7D7060]">Fraud Check Pass Rate</span>
          <div className="mt-1 text-2xl font-bold tabular-nums text-[#1E4D38]">
            {fraudPassRate === null ? '—' : `${fraudPassRate}%`}
          </div>
          <p className="mt-0.5 text-[11px] text-[#5C4F42]">{confirmations.length} recorded peer checks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5">
          <h2 className="text-sm font-bold text-[#2C241E]">Claims by market zone</h2>
          <p className="mt-1 text-[11px] text-[#7D7060]">Counts from locally stored demo claims</p>
          <div className="mt-4 space-y-3">
            {claimsByZone.map((zone) => (
              <div key={zone.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-[#4A3F35]">{zone.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-[#1E4D38]">
                    {zone.claims.length} · ₹{zone.claims.reduce((sum, claim) => sum + claim.amount, 0)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EAE2D2]">
                  <div
                    className="h-full rounded-full bg-[#1E4D38]"
                    style={{
                      width: `${combinedClaims.length ? (zone.claims.length / combinedClaims.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5">
          <h2 className="text-sm font-bold text-[#2C241E]">Peer verifier record</h2>
          <p className="mt-1 text-[11px] text-[#7D7060]">Successful, in-zone distress confirmations / all checks</p>
          {Object.keys(confirmerStats).length === 0 ? (
            <p className="mt-4 rounded-xl bg-[#F4EFE6] p-3 text-xs text-[#7D7060]">
              No peer confirmations recorded in this browser yet.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-[#E6DEC8]">
              {Object.entries(confirmerStats).map(([id, stat]) => (
                <div key={id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                  <span className="min-w-0 truncate font-medium text-[#4A3F35]">{stat.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-[#1E4D38]">
                    {stat.passed} passed · {stat.total - stat.passed} failed / {stat.total} checks
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Tab 1: Payout Claims with Manual Override */}
      {activeTab === 'payouts' && (
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-[#2C241E]">{t('allPayoutsList')}</h3>
              <p className="text-xs text-[#7D7060]">
                Review algorithmic claims and apply manual manager overrides if peer quorum is delayed.
              </p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search vendor or zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#D0C2A5] bg-[#F9F7F2] px-3.5 py-1.5 text-xs text-[#2C241E] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6DEC8] text-[#7D7060]">
                  <th className="py-3 px-3 font-semibold">Claim ID</th>
                  <th className="py-3 px-3 font-semibold">Beneficiary</th>
                  <th className="py-3 px-3 font-semibold">Sector</th>
                  <th className="py-3 px-3 font-semibold">Telemetry Score</th>
                  <th className="py-3 px-3 font-semibold text-right">Amount</th>
                  <th className="py-3 px-3 font-semibold">Quorum</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold text-right">Manager Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DEC8]/60 text-[#2C241E]">
                {combinedClaims
                  .filter((p) => {
                    if (!searchTerm) return true;
                    const q = searchTerm.toLowerCase();
                    return (
                      p.workerName.toLowerCase().includes(q) ||
                      p.zoneName.toLowerCase().includes(q) ||
                      p.id.toLowerCase().includes(q)
                    );
                  })
                  .map((payout) => {
                    const isDisbursedOrVerified =
                      payout.status === 'verified' || payout.status === 'disbursed' || payout.status === 'paid';
                    return (
                      <tr key={payout.id} className="hover:bg-[#F4EFE6]/50">
                        <td className="py-3.5 px-3 font-mono font-medium">{payout.id}</td>
                        <td className="py-3.5 px-3 font-bold">{payout.workerName}</td>
                        <td className="py-3.5 px-3">{payout.zoneName}</td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold tabular-nums text-[#C85A32]">
                            {payout.riskScore}/100
                          </span>
                          <span className="text-[10px] text-[#7D7060] block">{payout.tier}</span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold tabular-nums text-sm text-[#1E4D38]">
                          ₹{payout.amount}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span>
                              {payout.confirmationsCount} / {payout.requiredConfirmations}
                            </span>
                            {payout.confirmationsCount < payout.requiredConfirmations && !isDisbursedOrVerified && (
                              <button
                                onClick={() => simulatePeerConsensus(payout.id)}
                                className="rounded bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 transition-colors"
                                title="Auto-confirm peer consensus to 2/2"
                              >
                                Auto 2/2
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isDisbursedOrVerified
                                ? 'bg-[#E7F3EC] text-[#1E4D38]'
                                : payout.status === 'pending_confirmation'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {payout.status === 'disbursed'
                              ? 'DISBURSED'
                              : payout.status === 'verified'
                              ? 'VERIFIED'
                              : payout.status === 'pending_confirmation'
                              ? 'PENDING'
                              : payout.status.toUpperCase()}
                            {payout.adminOverridden && ' (OVERRIDDEN)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedReceipt(payout)}
                              className="rounded-lg border border-[#D9CDB8] bg-white px-2 py-1 text-[11px] font-medium text-[#1E4D38] hover:bg-[#F4EFE6]"
                              title="Explainable Receipt"
                            >
                              Receipt
                            </button>

                            {!isDisbursedOrVerified && (
                              <button
                                onClick={() => adminOverridePayout(payout.id, 'approve')}
                                className="rounded-lg bg-[#1E4D38] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#163B2B]"
                              >
                                Approve
                              </button>
                            )}

                            {payout.status !== 'declined' && (
                              <button
                                onClick={() => adminOverridePayout(payout.id, 'decline')}
                                className="rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Registered Vendors Roster */}
      {activeTab === 'workers' && (
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#2C241E] mb-1">{t('workerList')}</h3>
          <p className="text-xs text-[#7D7060] mb-5">
            Active vendor profiles, registered daily baseline wages, and assigned vending spots.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6DEC8] text-[#7D7060]">
                  <th className="py-3 px-3 font-semibold">Vendor Name</th>
                  <th className="py-3 px-3 font-semibold">Contact</th>
                  <th className="py-3 px-3 font-semibold">Assigned Sector</th>
                  <th className="py-3 px-3 font-semibold">Vending Trade</th>
                  <th className="py-3 px-3 font-semibold text-right">Daily Baseline Wage</th>
                  <th className="py-3 px-3 font-semibold text-right">Wallet Balance</th>
                  <th className="py-3 px-3 font-semibold">Policy Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DEC8]/60 text-[#2C241E]">
                {workers.map((w) => (
                  <tr key={w.uid} className="hover:bg-[#F4EFE6]/50">
                    <td className="py-3 px-3 font-bold">{w.name}</td>
                    <td className="py-3 px-3 font-mono text-[#7D7060]">{w.phone}</td>
                    <td className="py-3 px-3 font-medium">{w.zoneName}</td>
                    <td className="py-3 px-3 text-[#5C4F42]">{w.trade}</td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums">
                      ₹{w.dailyWage}/day
                    </td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums text-[#1E4D38]">
                      ₹{w.walletBalance}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 rounded bg-[#E7F3EC] px-2 py-0.5 text-[10px] font-bold text-[#1E4D38]">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Sector Emergency Relief Trigger */}
      {activeTab === 'zones' && (
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#2C241E]">
              District Emergency Climate Action
            </h3>
            <p className="text-xs text-[#7D7060]">
              In case of sudden extreme urban flooding, metro collapse, or catastrophic storm surges, authorized NGO directors can trigger immediate sector-wide emergency disbursements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="rounded-xl border border-[#E6DEC8] bg-[#F9F7F2] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#2C241E]">{zone.name}</h4>
                    <span className="font-bold tabular-nums text-xs text-[#C85A32]">
                      Score: {zone.currentRiskScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-[#7D7060] mt-0.5">
                    {zone.city} · {zone.activeWorkersCount} Enrolled Vendors
                  </p>
                  <p className="text-[11px] text-[#5C4F42] mt-2">
                    Current readings: {zone.currentTemp}°C · {zone.currentRain} mm/h
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6DEC8] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#7D7060]">Emergency Payout:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => adminTriggerSectorRelief(zone.id, 60)}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                    >
                      Disburse 60%
                    </button>
                    <button
                      onClick={() => adminTriggerSectorRelief(zone.id, 80)}
                      className="rounded-lg bg-[#C85A32] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#B34B24]"
                    >
                      Disburse 80%
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ExplainableReceiptModal
        payout={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
