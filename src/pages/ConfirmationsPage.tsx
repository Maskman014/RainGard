import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  Info,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const ConfirmationsPage: React.FC = () => {
  const { user } = useAuth();
  const { payouts, confirmations, submitPeerConfirmation, simulatePeerConsensus, t } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'audit'>('pending');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Find payouts awaiting peer confirmation
  const pendingPayouts = payouts.filter(
    (p) => p.status === 'pending_confirmation'
  );

  const handleConfirm = async (
    payoutId: string,
    condition: 'heavy_rain' | 'extreme_heat' | 'waterlogging' | 'normal',
    isDistress: boolean
  ) => {
    setSubmittingId(payoutId);
    await submitPeerConfirmation(payoutId, condition, isDistress);
    setSubmittingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E6DEC8] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2C241E]">
              {t('confirmationsTitle')}
            </h1>
            <p className="mt-1 text-xs text-[#5C4F42] max-w-2xl">
              {t('confirmationsSubtitle')}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9CDB8] bg-[#F4EFE6] p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('pending')}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-[#1E4D38] font-bold shadow-xs'
                  : 'text-[#5C4F42] hover:text-[#2C241E]'
              }`}
            >
              Awaiting Verification ({pendingPayouts.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === 'audit'
                  ? 'bg-white text-[#1E4D38] font-bold shadow-xs'
                  : 'text-[#5C4F42] hover:text-[#2C241E]'
              }`}
            >
              Audit Log ({confirmations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Fraud Protection Guarantee Banner */}
      <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1E4D38]/10 text-[#1E4D38] shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-[#2C241E]">Two-Factor Decentralized Verification: </span>
            <span className="text-[#5C4F42]">
              Requires at least 2 registered peer vendors in the same market sector to verify ground distress before automated funds unlock.
            </span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono text-[#1E4D38]">
          <Navigation className="h-3.5 w-3.5" />
          <span>GPS Tolerance: &lt; 800m</span>
        </div>
      </div>

      {/* Tab 1: Pending Confirmations */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingPayouts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D0C2A5] bg-[#FDFCF7] p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAE2D2] text-[#7D7060]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#2C241E]">
                {t('noPendingVerifications')}
              </h3>
              <p className="mt-1 text-xs text-[#7D7060] max-w-sm mx-auto">
                When weather telemetry crosses the parametric threshold, nearby vendors will receive instant prompts to verify.
              </p>
            </div>
          ) : (
            pendingPayouts.map((payout) => {
              const isOwnClaim = payout.workerId === user?.uid;
              const hasAlreadyConfirmed = payout.confirmedBy.includes(user?.uid || '');
              const zoneMatch = user?.zoneId === payout.zoneId;

              return (
                <div
                  key={payout.id}
                  className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5 shadow-xs transition-all hover:border-[#D0C2A5]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6DEC8]/60 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#7D7060]">{payout.id}</span>
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          {payout.tier}
                        </span>
                        <span className="text-xs font-semibold text-[#1E4D38] tabular-nums">
                          Payout: ₹{payout.amount}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-[#2C241E]">
                        Claimant: {payout.workerName}
                      </h3>
                      <p className="text-xs text-[#5C4F42] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-[#C85A32]" />
                        <span>{payout.zoneName}</span>
                        <span>·</span>
                        <span>Risk Score: <strong className="tabular-nums">{payout.riskScore}/100</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] text-[#7D7060]">Quorum Progress</span>
                        <div className="text-sm font-bold tabular-nums text-[#1E4D38]">
                          {payout.confirmationsCount} / {payout.requiredConfirmations} Needed
                        </div>
                      </div>
                      {payout.confirmationsCount < payout.requiredConfirmations && (
                        <button
                          onClick={async () => {
                            setSubmittingId(payout.id);
                            await simulatePeerConsensus(payout.id);
                            setSubmittingId(null);
                          }}
                          disabled={submittingId === payout.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#C85A32] bg-[#FBECE5] px-2.5 py-1 text-xs font-semibold text-[#C85A32] hover:bg-[#F7DDD1] transition-colors"
                          title="Simulate live peer consensus from 2 nearby registered vendors"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>{submittingId === payout.id ? 'Simulating...' : 'Auto-Confirm (2/2)'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Weather snapshot for verifier */}
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-[#F4EFE6] p-3">
                      <span className="text-[#7D7060]">Weather Telemetry Trigger:</span>
                      <p className="mt-1 font-semibold text-[#2C241E]">
                        {payout.weatherSnapshot.condition} ({payout.weatherSnapshot.temp}°C, {payout.weatherSnapshot.rain} mm/h)
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F4EFE6] p-3">
                      <span className="text-[#7D7060]">GPS Location Verification:</span>
                      <p className="mt-1 font-semibold text-[#1E4D38] flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Registered Sector: {payout.zoneName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 border-t border-[#E6DEC8]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {isOwnClaim ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                          <Info className="h-4 w-4 text-amber-700 shrink-0" />
                          <span>Anti-Fraud Check: You cannot peer-verify your own claim.</span>
                        </div>
                        <button
                          onClick={async () => {
                            setSubmittingId(payout.id);
                            await simulatePeerConsensus(payout.id);
                            setSubmittingId(null);
                          }}
                          disabled={submittingId === payout.id}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C85A32] px-4 py-2 font-semibold text-white shadow-xs hover:bg-[#B34B25] transition-colors"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Simulate Peer Consensus (2/2)</span>
                        </button>
                      </div>
                    ) : hasAlreadyConfirmed ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5 text-[#1E4D38] font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>You have already confirmed ground conditions for this claim.</span>
                        </div>
                        {payout.confirmationsCount < payout.requiredConfirmations && (
                          <button
                            onClick={async () => {
                              setSubmittingId(payout.id);
                              await simulatePeerConsensus(payout.id);
                              setSubmittingId(null);
                            }}
                            disabled={submittingId === payout.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#C85A32] px-3.5 py-1.5 font-semibold text-white shadow-xs hover:bg-[#B34B25] transition-colors"
                          >
                            <Zap className="h-3.5 w-3.5" />
                            <span>Reach Quorum (2/2)</span>
                          </button>
                        )}
                      </div>
                    ) : !zoneMatch ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5 text-amber-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Zone Mismatch: You are assigned to {user?.zoneName}; this claim is in {payout.zoneName}.</span>
                        </div>
                        <button
                          onClick={async () => {
                            setSubmittingId(payout.id);
                            await simulatePeerConsensus(payout.id);
                            setSubmittingId(null);
                          }}
                          disabled={submittingId === payout.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#C85A32] px-3.5 py-1.5 font-semibold text-white shadow-xs hover:bg-[#B34B25] transition-colors"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Simulate Peer Consensus (2/2)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full flex-wrap gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleConfirm(payout.id, 'heavy_rain', true)}
                            disabled={submittingId === payout.id}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1E4D38] px-4 py-2 font-semibold text-white shadow-xs hover:bg-[#163B2B] transition-colors"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>{t('confirmDistressBtn')}</span>
                          </button>

                          <button
                            onClick={() => handleConfirm(payout.id, 'normal', false)}
                            disabled={submittingId === payout.id}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D0C2A5] bg-white px-4 py-2 font-semibold text-[#5C4F42] hover:bg-[#EAE2D2] transition-colors"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            <span>{t('reportNormalBtn')}</span>
                          </button>
                        </div>

                        <button
                          onClick={async () => {
                            setSubmittingId(payout.id);
                            await simulatePeerConsensus(payout.id);
                            setSubmittingId(null);
                          }}
                          disabled={submittingId === payout.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#C85A32] px-3.5 py-2 font-semibold text-white shadow-xs hover:bg-[#B34B25] transition-colors"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Simulate Full Quorum (2/2)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Audit Trail Log */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#2C241E] mb-3">
            Peer Ground Verification Audit Log
          </h3>
          <p className="text-xs text-[#7D7060] mb-5">
            Cryptographically logged peer ground votes protecting the micro-insurance pool from fraudulent claims.
          </p>

          {confirmations.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7D7060]">
              No verification records in ledger yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6DEC8] text-[#7D7060]">
                    <th className="py-3 px-3 font-semibold">Verifier Vendor</th>
                    <th className="py-3 px-3 font-semibold">Trade</th>
                    <th className="py-3 px-3 font-semibold">Claim ID</th>
                    <th className="py-3 px-3 font-semibold">Reported Condition</th>
                    <th className="py-3 px-3 font-semibold">Fraud Check</th>
                    <th className="py-3 px-3 font-semibold">Timestamp</th>
                    <th className="py-3 px-3 font-semibold text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DEC8]/60 text-[#2C241E]">
                  {confirmations.map((conf) => (
                    <tr key={conf.id} className="hover:bg-[#F4EFE6]/50">
                      <td className="py-3.5 px-3 font-bold">{conf.verifierName}</td>
                      <td className="py-3.5 px-3 text-[#5C4F42]">{conf.verifierTrade || 'Registered Merchant'}</td>
                      <td className="py-3.5 px-3 font-mono text-[#7D7060]">{conf.payoutId}</td>
                      <td className="py-3.5 px-3 font-semibold">
                        {conf.conditionReported.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 rounded bg-[#E7F3EC] px-2 py-0.5 text-[10px] font-bold text-[#1E4D38]">
                          <CheckCircle2 className="h-3 w-3" />
                          GPS Match Passed
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[#7D7060]">{conf.timestamp}</td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-bold ${
                            conf.confirmed ? 'text-[#1E4D38]' : 'text-amber-800'
                          }`}
                        >
                          {conf.confirmed ? 'Confirmed' : 'Disputed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
