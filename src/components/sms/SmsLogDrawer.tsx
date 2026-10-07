import React from 'react';
import { X, MessageSquare, CheckCheck, Smartphone, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SmsLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsLogDrawer: React.FC<SmsLogDrawerProps> = ({ isOpen, onClose }) => {
  const { smsLogs, t } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFCF7] border-l border-[#E6DEC8] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E6DEC8] bg-[#F4EFE6] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E4D38] text-white">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2C241E]">{t('smsLogsTitle')}</h3>
                <p className="text-[11px] text-[#7D7060]">Keypad & feature-phone notifications</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#7D7060] hover:bg-[#EAE2D2]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Explanation banner for judges/demo */}
          <div className="bg-[#FBECE5] border-b border-[#EAD0C5] p-3.5 text-xs text-[#9C3D1B]">
            <p className="font-semibold">Simulated SMS Broadcast Gateway</p>
            <p className="mt-0.5 text-[11px] text-[#783015] leading-relaxed">
              Dispatches automated cellular SMS in Telugu, Hindi, or English so low-literacy vendors without 4G/smartphones receive immediate confirmation of risk alerts and wallet deposits.
            </p>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {smsLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7D7060]">
                No SMS dispatches yet. Trigger a weather alert or peer confirmation to dispatch simulated SMS.
              </div>
            ) : (
              smsLogs.map((sms) => (
                <div
                  key={sms.id}
                  className="rounded-xl border border-[#E6DEC8] bg-[#F9F7F2] p-3.5 shadow-xs transition-all hover:border-[#D0C2A5]"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#7D7060]">
                    <span className="font-mono font-semibold text-[#1E4D38]">
                      To: {sms.workerName} ({sms.phone})
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(sms.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* SMS Bubble styled like classic phone message */}
                  <div className="mt-2 rounded-lg border border-[#D9CDB8] bg-white p-3 font-sans text-xs leading-relaxed text-[#2C241E]">
                    <p className="whitespace-pre-line">{sms.message}</p>
                    <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-1.5 text-[10px] text-stone-500">
                      <span className="font-mono uppercase">{sms.type.replace('_', ' ')}</span>
                      <span className="flex items-center gap-1 text-[#1E4D38] font-semibold">
                        <CheckCheck className="h-3 w-3 text-[#1E4D38]" />
                        Delivered
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer stats */}
          <div className="border-t border-[#E6DEC8] bg-[#F4EFE6] px-5 py-3 text-xs text-[#7D7060] flex items-center justify-between">
            <span>Total Cellular Dispatches</span>
            <span className="font-mono font-bold text-[#1E4D38]">{smsLogs.length} Messages</span>
          </div>
        </div>
      </div>
    </div>
  );
};
