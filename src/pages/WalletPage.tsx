import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Smartphone,
  Building,
  Store,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { WithdrawModal } from '../components/payout/WithdrawModal';
import { ExplainableReceiptModal } from '../components/payout/ExplainableReceiptModal';
import { Payout } from '../types';

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { payouts, withdrawals, t } = useApp();

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payout | null>(null);
  const userWithdrawals = withdrawals.filter((withdrawal) => withdrawal.workerId === user?.uid);

  const userPayouts = payouts.filter(
    (p) => p.workerId === user?.uid && (p.status === 'verified' || p.status === 'disbursed' || p.status === 'paid')
  );

  // Link Total Parametric Credits directly to user's allocated parametric credits / pool
  const totalPayoutCredits =
    user?.parametricCredits !== undefined
      ? user.parametricCredits
      : user?.walletBalance !== undefined && user?.walletBalance > 0
      ? user.walletBalance
      : userPayouts.reduce((sum, p) => sum + p.amount, 0);
  const totalWithdrawn = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DEC8] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C241E]">
            {t('walletTitle')}
          </h1>
          <p className="mt-1 text-xs text-[#5C4F42] max-w-2xl">
            {t('walletSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setWithdrawModalOpen(true)}
          disabled={(user?.walletBalance || 0) <= 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E4D38] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#163B2B] transition-colors disabled:opacity-50"
        >
          <ArrowDownRight className="h-4 w-4" />
          <span>{t('withdrawFunds')}</span>
        </button>
      </div>

      {/* Main Balance Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl border border-[#D9CDB8] bg-[#F4EFE6] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7D7060]">
                {t('currentBalance')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1E4D38]/10 px-3 py-1 text-xs font-semibold text-[#1E4D38]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Available to Withdraw</span>
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight text-[#1E4D38]">
                ₹{user?.walletBalance || 0}
              </span>
              <span className="text-sm font-semibold text-[#5C4F42]">INR</span>
            </div>

            <p className="mt-2 text-xs text-[#5C4F42] leading-relaxed">
              Parametric micro-insurance benefit accumulated from verified climate distress events in {user?.zoneName}. Disbursed directly without claim adjusters.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#D9CDB8]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-[#5C4F42]">
              <span>Linked UPI: <strong className="font-mono text-[#2C241E]">{user?.upiId || 'Not set'}</strong></span>
            </div>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              disabled={(user?.walletBalance || 0) <= 0}
              className="text-xs font-bold text-[#1E4D38] hover:underline disabled:opacity-50"
            >
              Transfer Now →
            </button>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
            <span className="text-xs text-[#7D7060]">Total Parametric Credits</span>
            <div className="mt-1 text-2xl font-bold tabular-nums text-[#2C241E]">
              ₹{totalPayoutCredits}
            </div>
            <p className="mt-0.5 text-[11px] text-[#5C4F42]">
              {userPayouts.length} Automated payouts released
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-4.5">
            <span className="text-xs text-[#7D7060]">Total Withdrawn</span>
            <div className="mt-1 text-2xl font-bold tabular-nums text-[#C85A32]">
              ₹{totalWithdrawn}
            </div>
            <p className="mt-0.5 text-[11px] text-[#5C4F42]">
              Transferred to bank & UPI accounts
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Tabs */}
      <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#2C241E] mb-1">{t('recentTransactions')}</h3>
        <p className="text-xs text-[#7D7060] mb-5">
          Detailed ledger of climate protection credits and wallet disbursements
        </p>

        {userPayouts.length === 0 && userWithdrawals.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7D7060]">
            No transactions in your wallet ledger yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6DEC8] text-[#7D7060]">
                  <th className="py-3 px-3 font-semibold">Type</th>
                  <th className="py-3 px-3 font-semibold">Reference</th>
                  <th className="py-3 px-3 font-semibold">Channel</th>
                  <th className="py-3 px-3 font-semibold">Timestamp</th>
                  <th className="py-3 px-3 font-semibold text-right">Amount</th>
                  <th className="py-3 px-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DEC8]/60 text-[#2C241E]">
                {/* Payout Credits */}
                {userPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F4EFE6]/50">
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 rounded bg-[#E7F3EC] px-2 py-0.5 text-[10px] font-bold text-[#1E4D38]">
                        <ArrowDownRight className="h-3 w-3" />
                        Payout Credit
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">{p.id}</td>
                    <td className="py-3 px-3 text-[#5C4F42]">{p.tier} ({p.zoneName})</td>
                    <td className="py-3 px-3 font-mono text-[#7D7060]">{p.timestamp}</td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums text-[#1E4D38]">
                      +₹{p.amount}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="rounded-lg border border-[#D9CDB8] bg-white px-2 py-1 text-[11px] font-medium text-[#1E4D38] hover:bg-[#F4EFE6]"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Withdrawals */}
                {userWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#F4EFE6]/50">
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 rounded bg-[#FBECE5] px-2 py-0.5 text-[10px] font-bold text-[#C85A32]">
                        <ArrowUpRight className="h-3 w-3" />
                        Withdrawal
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">{w.id}</td>
                    <td className="py-3 px-3 text-[#5C4F42]">
                      {w.method} ({w.reference})
                    </td>
                    <td className="py-3 px-3 font-mono text-[#7D7060]">{w.timestamp}</td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums text-[#C85A32]">
                      -₹{w.amount}
                    </td>
                    <td className="py-3 px-3 text-right text-[10px] text-[#7D7060]">
                      Completed
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
      />

      {/* Receipt Modal */}
      <ExplainableReceiptModal
        payout={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
