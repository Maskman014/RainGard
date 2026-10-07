import React, { useState } from 'react';
import {
  ReceiptText,
  FileCheck2,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ExplainableReceiptModal } from '../components/payout/ExplainableReceiptModal';
import { ClaimTimelineModal } from '../components/payout/ClaimTimelineModal';
import { Payout } from '../types';

export const PayoutHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { payouts, confirmations, withdrawals, t } = useApp();

  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [timelinePayout, setTimelinePayout] = useState<Payout | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Workers see their own payouts; Admins see system-wide payouts
  const relevantPayouts =
    user?.role === 'admin' ? payouts : payouts.filter((p) => p.workerId === user?.uid);

  const filtered = relevantPayouts.filter((p) => {
    const matchesStatus =
      filterStatus === 'all' ? true : p.status === filterStatus;
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.zoneName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPaid = relevantPayouts
    .filter((p) => ['verified', 'paid', 'disbursed'].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);

  const exportStatement = () => {
    const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const columns = ['Record Type', 'ID', 'Date', 'Worker', 'Zone', 'Amount INR', 'Status', 'Details'];
    const claimRows = relevantPayouts.map((payout) => [
      'Payout',
      payout.id,
      payout.createdAt || payout.timestamp,
      payout.workerName,
      payout.zoneName,
      payout.amount,
      payout.status,
      `${payout.tier}; risk ${payout.riskScore}; ${payout.confirmationsCount}/${payout.requiredConfirmations} confirmations`,
    ]);
    const withdrawalRows = withdrawals
      .filter((withdrawal) => user?.role === 'admin' || withdrawal.workerId === user?.uid)
      .map((withdrawal) => [
        'Withdrawal',
        withdrawal.id,
        withdrawal.timestamp,
        user?.role === 'admin' ? withdrawal.workerId : user?.name || '',
        '',
        withdrawal.amount,
        withdrawal.status,
        `${withdrawal.method}; ${withdrawal.reference}`,
      ]);
    const csv = [columns, ...claimRows, ...withdrawalRows]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `rainguard-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DEC8] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C241E]">
            {t('payoutHistoryTitle')}
          </h1>
          <p className="mt-1 text-xs text-[#5C4F42] max-w-2xl">
            {t('payoutHistorySubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportStatement}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D9CDB8] bg-[#FDFCF7] px-3 py-2 text-xs font-semibold text-[#1E4D38] hover:bg-[#F4EFE6]"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <div className="rounded-xl border border-[#D9CDB8] bg-[#F4EFE6] px-4 py-2 text-right">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#7D7060]">
              Total Parametric Payouts
            </span>
            <div className="text-lg font-extrabold tabular-nums text-[#1E4D38]">
              ₹{totalPaid}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] p-1 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-[#1E4D38] font-bold shadow-xs'
                : 'text-[#5C4F42] hover:text-[#2C241E]'
            }`}
          >
            All ({relevantPayouts.length})
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              filterStatus === 'verified'
                ? 'bg-white text-[#1E4D38] font-bold shadow-xs'
                : 'text-[#5C4F42] hover:text-[#2C241E]'
            }`}
          >
            Paid ({relevantPayouts.filter((p) => p.status === 'verified').length})
          </button>
          <button
            onClick={() => setFilterStatus('pending_confirmation')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              filterStatus === 'pending_confirmation'
                ? 'bg-white text-[#1E4D38] font-bold shadow-xs'
                : 'text-[#5C4F42] hover:text-[#2C241E]'
            }`}
          >
            Verifying ({relevantPayouts.filter((p) => p.status === 'pending_confirmation').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D7060]" />
          <input
            type="text"
            placeholder="Search claim ID or zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#D0C2A5] bg-[#FDFCF7] pl-8.5 pr-3 py-1.5 text-xs text-[#2C241E] focus:border-[#1E4D38] focus:outline-none"
          />
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7D7060]">
            No payout transactions match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6DEC8] text-[#7D7060]">
                  <th className="py-3 px-3 font-semibold">Claim ID</th>
                  <th className="py-3 px-3 font-semibold">Beneficiary</th>
                  <th className="py-3 px-3 font-semibold">Sector & Trigger</th>
                  <th className="py-3 px-3 font-semibold">Telemetry Snapshot</th>
                  <th className="py-3 px-3 font-semibold">Parametric Tier</th>
                  <th className="py-3 px-3 font-semibold text-right">Disbursed</th>
                  <th className="py-3 px-3 font-semibold">Peer Quorum</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold text-right">Claim details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DEC8]/60 text-[#2C241E]">
                {filtered.map((payout) => (
                  <tr key={payout.id} className="hover:bg-[#F4EFE6]/60 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-medium">{payout.id}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold">{payout.workerName}</div>
                      <div className="text-[10px] text-[#7D7060]">₹{payout.dailyWage}/day</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium">{payout.zoneName}</div>
                      <div className="text-[10px] text-[#7D7060]">{payout.timestamp}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[#5C4F42]">
                      <div className="font-semibold text-[#2C241E]">
                        Score: <strong className="tabular-nums">{payout.riskScore}/100</strong>
                      </div>
                      <div className="text-[10px]">
                        {payout.weatherSnapshot.temp}°C · {payout.weatherSnapshot.rain} mm/h
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#C85A32]">{payout.tier}</td>
                    <td className="py-3.5 px-3 text-right font-bold tabular-nums text-sm text-[#1E4D38]">
                      ₹{payout.amount}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[11px] text-[#1E4D38] font-semibold">
                        {payout.confirmationsCount} / {payout.requiredConfirmations}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          payout.status === 'verified'
                            ? 'bg-[#E7F3EC] text-[#1E4D38]'
                            : payout.status === 'pending_confirmation'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {payout.status === 'verified' && <CheckCircle2 className="h-3 w-3" />}
                        {payout.status === 'pending_confirmation' && <Clock className="h-3 w-3" />}
                        {payout.status === 'verified'
                          ? 'Paid to Wallet'
                          : payout.status === 'pending_confirmation'
                          ? 'Awaiting Peers'
                          : 'Declined'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => setTimelinePayout(payout)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#D9CDB8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1E4D38] hover:bg-[#F4EFE6] transition-colors"
                        >
                          <Clock className="h-3 w-3" />
                          Timeline
                        </button>
                        <button
                          onClick={() => setSelectedPayout(payout)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#D9CDB8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1E4D38] hover:bg-[#F4EFE6] transition-colors"
                        >
                          <FileCheck2 className="h-3 w-3" />
                          Receipt
                        </button>
                      </div>
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
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
      />
      <ClaimTimelineModal
        payout={timelinePayout}
        confirmations={confirmations}
        onClose={() => setTimelinePayout(null)}
      />
    </div>
  );
};
