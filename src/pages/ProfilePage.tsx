import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  Briefcase,
  Phone,
  IndianRupee,
  Save,
  CheckCircle2,
  LogOut,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { UserAvatar } from '../components/UserAvatar';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { zones, language, setLanguage, t } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [trade, setTrade] = useState(user?.trade || '');
  const [zoneId, setZoneId] = useState(user?.zoneId || 'hyd-charminar');
  const [dailyWage, setDailyWage] = useState(user?.dailyWage || 700);
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedZone = zones.find((z) => z.id === zoneId);
    await updateProfile({
      name,
      phone,
      trade,
      zoneId,
      zoneName: selectedZone?.name || user?.zoneName,
      dailyWage,
      upiId,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="border-b border-[#E6DEC8] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#2C241E]">
          {t('profileTitle')}
        </h1>
        <p className="mt-1 text-xs text-[#5C4F42]">
          {t('profileSubtitle')}
        </p>
      </div>

      {/* Coverage Status Card */}
      <div className="rounded-2xl border border-[#D9CDB8] bg-[#F4EFE6] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} className="h-12 w-12 rounded-2xl text-lg" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#2C241E]">{user?.name}</h2>
              <span className="rounded-md bg-[#1E4D38]/10 px-2 py-0.5 text-[10px] font-bold text-[#1E4D38]">
                {user?.role === 'admin' ? 'NGO Officer' : 'Verified Vendor'}
              </span>
            </div>
            <p className="text-xs text-[#5C4F42] mt-0.5">
              {user?.trade} · {user?.zoneName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:border-l sm:border-[#D9CDB8] sm:pl-6 text-xs">
          <div>
            <span className="text-[#7D7060]">Days Protected</span>
            <div className="text-lg font-bold tabular-nums text-[#2C241E]">
              {user?.daysProtected || 30} Days
            </div>
          </div>
          <div>
            <span className="text-[#7D7060]">Policy Status</span>
            <div className="text-sm font-bold text-[#1E4D38] flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5 shadow-xs">
        <div className="flex flex-col gap-2 border-b border-[#E6DEC8] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#2C241E]">Coverage summary</h2>
            <p className="mt-1 text-xs text-[#7D7060]">Illustrative demo terms based on your current daily wage.</p>
          </div>
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${user?.policyActive ? 'bg-[#E7F3EC] text-[#1E4D38]' : 'bg-stone-100 text-stone-600'}`}>
            <Calendar className="h-3.5 w-3.5" />
            {user?.policyActive ? 'Active demo policy' : 'Inactive'}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Tier 1 · Risk > 40', percent: 30 },
            { label: 'Tier 2 · Risk > 70', percent: 60 },
            { label: 'Tier 3 · Risk > 90', percent: 80 },
          ].map((tier) => (
            <div key={tier.label} className="rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] p-3">
              <div className="text-[11px] font-semibold text-[#5C4F42]">{tier.label}</div>
              <div className="mt-2 text-lg font-bold tabular-nums text-[#1E4D38]">
                ₹{Math.round((user?.dailyWage || 0) * tier.percent / 100)}
                <span className="ml-1 text-[11px] font-medium text-[#7D7060]">({tier.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[#7D7060]">
          The demo uses a weighted temperature/rain risk score and peer confirmation. It is not a real insurance policy; weather, eligibility, claims, and payments are simulated.
        </p>
      </section>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs space-y-4">
        {savedSuccess && (
          <div className="rounded-xl bg-[#E7F3EC] p-3 text-xs font-semibold text-[#1E4D38] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Profile and baseline coverage terms updated on this device.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-semibold text-[#4A3F35] mb-1">
              {t('fullName')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D7060]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#D0C2A5] bg-white pl-8.5 pr-3 py-2 text-xs text-[#2C241E] focus:outline-none focus:border-[#1E4D38]"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-semibold text-[#4A3F35] mb-1">
              {t('phoneNumber')}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D7060]" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#D0C2A5] bg-white pl-8.5 pr-3 py-2 text-xs font-mono text-[#2C241E] focus:outline-none focus:border-[#1E4D38]"
                required
              />
            </div>
          </div>

          {/* Trade Category */}
          <div>
            <label className="block font-semibold text-[#4A3F35] mb-1">
              {t('tradeCategory')}
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D7060]" />
              <input
                type="text"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                placeholder="e.g. Fruit cart, Chai stall, Flower seller"
                className="w-full rounded-xl border border-[#D0C2A5] bg-white pl-8.5 pr-3 py-2 text-xs text-[#2C241E] focus:outline-none focus:border-[#1E4D38]"
                required
              />
            </div>
          </div>

          {/* Market Zone */}
          <div>
            <label className="block font-semibold text-[#4A3F35] mb-1">
              {t('selectZone')}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D7060]" />
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full rounded-xl border border-[#D0C2A5] bg-white pl-8.5 pr-3 py-2 text-xs text-[#2C241E] focus:outline-none focus:border-[#1E4D38]"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Daily Wage */}
          <div>
            <label className="block font-semibold text-[#4A3F35] mb-1">
              {t('dailyWageInr')}
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D7060]" />
              <input
                type="number"
                min={200}
                max={4000}
                step={50}
                value={dailyWage}
                onChange={(e) => setDailyWage(Number(e.target.value))}
                className="w-full rounded-xl border border-[#D0C2A5] bg-white pl-8.5 pr-3 py-2 text-xs font-bold tabular-nums text-[#2C241E] focus:outline-none focus:border-[#1E4D38]"
                required
              />
            </div>
            <p className="mt-1 text-[10px] text-[#7D7060]">
              Parametric disbursements will compute 30%, 60%, or 80% against this amount.
            </p>
          </div>

          {/* UPI ID */}
          <div>
            <label className="block font-semibold text-[#4A3F35] mb-1">
              Preferred UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. mobile@upi"
              className="w-full rounded-xl border border-[#D0C2A5] bg-white px-3.5 py-2 text-xs font-mono text-[#2C241E] focus:outline-none focus:border-[#1E4D38]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#E6DEC8] flex items-center justify-between">
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:underline"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('logout')}</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E4D38] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#163B2B] transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{t('saveChanges')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
