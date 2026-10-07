import React from 'react';
import { CheckCircle2, Clock, X, ShieldCheck, CloudRain } from 'lucide-react';
import { Payout, PeerConfirmation } from '../../types';

interface ClaimTimelineModalProps {
  payout: Payout | null;
  confirmations: PeerConfirmation[];
  onClose: () => void;
}

export const ClaimTimelineModal: React.FC<ClaimTimelineModalProps> = ({
  payout,
  confirmations,
  onClose,
}) => {
  if (!payout) return null;

  const claimConfirmations = confirmations
    .filter((confirmation) => confirmation.payoutId === payout.id)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const triggerDate = new Date(payout.createdAt);
  const hasTriggerDate = !Number.isNaN(triggerDate.getTime());
  const isComplete = ['verified', 'paid', 'disbursed'].includes(payout.status);
  const statusLabel = payout.status.replaceAll('_', ' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="claim-timeline-title">
      <button className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={onClose} aria-label="Close claim timeline" />
      <section className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#E6DEC8] pb-4">
          <div>
            <h2 id="claim-timeline-title" className="text-lg font-bold text-[#2C241E]">Claim timeline</h2>
            <p className="mt-1 font-mono text-xs text-[#7D7060]">{payout.id} · {payout.workerName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7D7060] hover:bg-[#EAE2D2]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-4 rounded-xl bg-[#F4EFE6] p-3 text-xs">
          Current status: <strong className="capitalize text-[#1E4D38]">{statusLabel}</strong>
          <span className="ml-2">· ₹{payout.amount} · {payout.zoneName}</span>
        </div>

        <ol className="mt-5 space-y-0">
          <li className="relative flex gap-3 pb-5">
            <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E7F3EC] text-[#1E4D38]">
              <CloudRain className="h-4 w-4" />
            </div>
            <div className="border-l-2 border-[#D9CDB8] pl-1">
              <h3 className="text-sm font-semibold text-[#2C241E]">Claim triggered</h3>
              <p className="mt-1 text-xs text-[#5C4F42]">
                Risk {payout.riskScore}/100 · {payout.weatherSnapshot.condition} · {payout.weatherSnapshot.temp}°C · {payout.weatherSnapshot.rain} mm/h
              </p>
              <time className="mt-1 block text-[11px] text-[#7D7060]">
                {hasTriggerDate ? triggerDate.toLocaleString() : payout.timestamp}
              </time>
            </div>
          </li>
          {claimConfirmations.map((confirmation) => (
            <li key={confirmation.id} className="relative flex gap-3 pb-5">
              <div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${confirmation.confirmed && confirmation.fraudCheckPassed ? 'bg-[#E7F3EC] text-[#1E4D38]' : 'bg-amber-100 text-amber-800'}`}>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="border-l-2 border-[#D9CDB8] pl-1">
                <h3 className="text-sm font-semibold text-[#2C241E]">Peer report · {confirmation.verifierName}</h3>
                <p className="mt-1 text-xs text-[#5C4F42]">
                  {confirmation.conditionReported.replaceAll('_', ' ')} · {confirmation.confirmed ? 'distress confirmed' : 'distress not confirmed'}
                </p>
                <p className="mt-1 text-[11px] text-[#7D7060]">
                  Sector check: {confirmation.fraudCheckPassed ? 'passed' : 'failed'} · {confirmation.timestamp}
                </p>
              </div>
            </li>
          ))}
          <li className="flex gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isComplete ? 'bg-[#E7F3EC] text-[#1E4D38]' : 'bg-amber-100 text-amber-800'}`}>
              {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#2C241E]">
                {isComplete ? 'Verification complete' : payout.status === 'declined' ? 'Claim declined' : 'Awaiting verification'}
              </h3>
              <p className="mt-1 text-xs text-[#5C4F42]">
                {payout.confirmationsCount}/{payout.requiredConfirmations} peer confirmations recorded.
                {payout.adminOverridden ? ' An admin override is recorded; its event time is not stored in this demo.' : ''}
              </p>
            </div>
          </li>
        </ol>
        {claimConfirmations.length === 0 && payout.confirmationsCount > 0 && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
            This older demo claim has a quorum count but no individual confirmation event records.
          </p>
        )}
        <p className="mt-5 border-t border-[#E6DEC8] pt-3 text-[11px] text-[#7D7060]">
          Demo audit history only. Withdrawals are recorded against a worker wallet, not linked to an individual claim.
        </p>
      </section>
    </div>
  );
};
