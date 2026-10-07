import React, { useState } from 'react';
import { X, ArrowDownRight, Smartphone, Building, Store, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { executeWithdrawal, t } = useApp();

  const [method, setMethod] = useState<'UPI' | 'Bank Account' | 'Seva Kendra Kiosk'>('UPI');
  const [amount, setAmount] = useState<number>(user?.walletBalance || 0);
  const [upiId, setUpiId] = useState<string>(user?.upiId || 'vendor@okhdfcbank');
  const [bankAccount, setBankAccount] = useState<string>('SBIN0004128 - 98214451299');
  const [kioskCode, setKioskCode] = useState<string>('SEVA-HYD-7729');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentBalance = user?.walletBalance || 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > currentBalance) return;

    setIsSubmitting(true);
    let ref = '';
    if (method === 'UPI') ref = upiId;
    else if (method === 'Bank Account') ref = bankAccount;
    else ref = kioskCode;

    const ok = await executeWithdrawal(amount, method, ref);
    setIsSubmitting(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E4D38] text-white">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C241E]">{t('withdrawFunds')}</h3>
              <p className="text-xs text-[#7D7060]">Instant disbursement to vendor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7D7060] hover:bg-[#EAE2D2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1E4D38]/10 text-[#1E4D38]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="mt-3 text-lg font-bold text-[#2C241E]">{t('withdrawalSuccess')}</h4>
            <p className="mt-1 text-xs text-[#7D7060]">
              ₹{amount} transferred via {method}
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="mt-5 space-y-4">
            {/* Balance info */}
            <div className="rounded-xl border border-[#D9CDB8] bg-[#F4EFE6] p-3 text-center">
              <span className="text-xs text-[#7D7060]">{t('currentBalance')}</span>
              <div className="text-2xl font-extrabold tabular-nums text-[#1E4D38]">
                ₹{currentBalance}
              </div>
            </div>

            {/* Method selection */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3F35] mb-1.5">
                Select Payout Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    method === 'UPI'
                      ? 'border-[#1E4D38] bg-[#1E4D38] text-white shadow-xs'
                      : 'border-[#E6DEC8] bg-white text-[#4A3F35] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Bank Account')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    method === 'Bank Account'
                      ? 'border-[#1E4D38] bg-[#1E4D38] text-white shadow-xs'
                      : 'border-[#E6DEC8] bg-white text-[#4A3F35] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <Building className="h-4 w-4" />
                  <span>Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Seva Kendra Kiosk')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    method === 'Seva Kendra Kiosk'
                      ? 'border-[#1E4D38] bg-[#1E4D38] text-white shadow-xs'
                      : 'border-[#E6DEC8] bg-white text-[#4A3F35] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  <span>Cash Kiosk</span>
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#4A3F35] mb-1">
                <span>{t('enterAmount')}</span>
                <button
                  type="button"
                  onClick={() => setAmount(currentBalance)}
                  className="text-[#1E4D38] hover:underline"
                >
                  Max (₹{currentBalance})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#7D7060]">
                  ₹
                </span>
                <input
                  type="number"
                  min={10}
                  max={currentBalance}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D0C2A5] bg-white pl-8 pr-4 py-2.5 text-sm font-bold tabular-nums text-[#2C241E] focus:border-[#1E4D38] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Dynamic reference input */}
            {method === 'UPI' && (
              <div>
                <label className="block text-xs font-semibold text-[#4A3F35] mb-1">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi"
                  className="w-full rounded-xl border border-[#D0C2A5] bg-white px-3.5 py-2 text-xs font-mono text-[#2C241E] focus:border-[#1E4D38] focus:outline-none"
                  required
                />
              </div>
            )}

            {method === 'Bank Account' && (
              <div>
                <label className="block text-xs font-semibold text-[#4A3F35] mb-1">
                  Bank Details (IFSC & Account No.)
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full rounded-xl border border-[#D0C2A5] bg-white px-3.5 py-2 text-xs font-mono text-[#2C241E] focus:border-[#1E4D38] focus:outline-none"
                  required
                />
              </div>
            )}

            {method === 'Seva Kendra Kiosk' && (
              <div className="rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] p-3 text-xs text-[#5C4F42]">
                <p className="font-semibold text-[#1E4D38]">Cash Collection at MeeSeva / Ward Center</p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Generates an SMS voucher token. Present your Aadhaar or Vendor Card at any Hyderabad MeeSeva center to collect physical cash instantly.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-5 flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-[#D0C2A5] py-2.5 text-xs font-semibold text-[#5C4F42] hover:bg-[#EAE2D2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || amount <= 0 || amount > currentBalance}
                className="flex-1 rounded-xl bg-[#1E4D38] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#163B2B] disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : t('confirmWithdrawal')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
