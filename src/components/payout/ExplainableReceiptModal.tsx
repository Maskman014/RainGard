import React from 'react';
import { X, CheckCircle2, ShieldCheck, Thermometer, CloudRain, Clock, Hash, FileCheck2 } from 'lucide-react';
import { Payout } from '../../types';
import { useApp } from '../../context/AppContext';

interface ExplainableReceiptModalProps {
  payout: Payout | null;
  onClose: () => void;
}

export const ExplainableReceiptModal: React.FC<ExplainableReceiptModalProps> = ({ payout, onClose }) => {
  const { t } = useApp();

  if (!payout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E4D38] text-white">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C241E]">Explainable Parametric Receipt</h3>
              <p className="text-xs text-[#7D7060]">Claim ID: {payout.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7D7060] hover:bg-[#EAE2D2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Highlight */}
        <div className="mt-5 rounded-xl border border-[#D9CDB8] bg-[#F4EFE6] p-4 text-center">
          <span className="text-xs font-semibold text-[#7D7060] uppercase tracking-wider">
            Automated Weather Compensation
          </span>
          <div className="mt-1 text-3xl font-extrabold tabular-nums text-[#1E4D38]">
            ₹{payout.amount}
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#1E4D38]/10 px-3 py-0.5 text-xs font-semibold text-[#1E4D38]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{payout.status === 'verified' ? 'Disbursed to Wallet' : 'Queued / In Verification'}</span>
          </div>
        </div>

        {/* Claim Details Table */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Worker & Sector */}
          <div className="rounded-xl border border-[#E6DEC8] bg-white p-3.5 space-y-2">
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-[#7D7060]">Beneficiary Worker</span>
              <span className="font-bold text-[#2C241E]">{payout.workerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-[#7D7060]">Sector & Zone</span>
              <span className="font-semibold text-[#2C241E]">{payout.zoneName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-[#7D7060]">Baseline Daily Wage</span>
              <span className="font-bold tabular-nums text-[#2C241E]">₹{payout.dailyWage} / day</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#7D7060]">Trigger Timestamp</span>
              <span className="font-mono text-[#2C241E]">{payout.timestamp}</span>
            </div>
          </div>

          {/* Telemetry Used */}
          <div className="rounded-xl border border-[#E6DEC8] bg-[#F9F7F2] p-3.5">
            <h4 className="font-bold text-[#2C241E] mb-2 flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-[#1E4D38]" />
              On-Ground Weather Telemetry Snapshot
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-[#E6DEC8]">
                <div className="flex items-center gap-1.5 text-[#7D7060]">
                  <Thermometer className="h-3.5 w-3.5 text-[#C85A32]" />
                  <span>Ambient Temp</span>
                </div>
                <div className="mt-1 text-base font-bold tabular-nums text-[#2C241E]">
                  {payout.weatherSnapshot.temp}°C
                </div>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-[#E6DEC8]">
                <div className="flex items-center gap-1.5 text-[#7D7060]">
                  <CloudRain className="h-3.5 w-3.5 text-blue-600" />
                  <span>Precipitation Rate</span>
                </div>
                <div className="mt-1 text-base font-bold tabular-nums text-[#2C241E]">
                  {payout.weatherSnapshot.rain} mm/hr
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#7D7060]">
              Condition: <strong className="text-[#2C241E]">{payout.weatherSnapshot.condition}</strong>
            </p>
          </div>

          {/* Transparent Formula Calculation */}
          <div className="rounded-xl border border-[#E6DEC8] bg-white p-3.5 space-y-2">
            <h4 className="font-bold text-[#2C241E]">Parametric Formula Breakdown</h4>
            <div className="rounded-lg bg-[#F4EFE6] p-2.5 text-[11px] font-mono leading-relaxed text-[#4A3F35]">
              <p>Risk Score = (Temp_Score × 60%) + (Rain_Score × 40%)</p>
              <p className="font-bold text-[#1E4D38] mt-1">Calculated Score: {payout.riskScore} / 100</p>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-[#7D7060]">Trigger Rule Applied</span>
              <span className="font-semibold text-[#C85A32]">{payout.tier}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#7D7060]">Calculation</span>
              <span className="font-mono tabular-nums text-[#1E4D38] font-bold">
                ₹{payout.dailyWage} × {payout.percentage}% = ₹{payout.amount}
              </span>
            </div>
          </div>

          {/* Peer Confirmations */}
          <div className="rounded-xl border border-[#E6DEC8] bg-[#F9F7F2] p-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#2C241E] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#1E4D38]" />
                Peer GPS Verifications
              </h4>
              <span className="font-semibold text-xs text-[#1E4D38]">
                {payout.confirmationsCount} / {payout.requiredConfirmations} Quorum
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#7D7060] leading-relaxed">
              {payout.confirmationsCount >= payout.requiredConfirmations
                ? 'Verified by adjacent vendors in the same market sector. Fraud check passed.'
                : 'Awaiting adjacent registered vendors to confirm ground distress conditions.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-[#1E4D38] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#163B2B] transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
