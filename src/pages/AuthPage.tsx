import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  ShieldCheck,
  User,
  Phone,
  Briefcase,
  MapPin,
  IndianRupee,
  Languages,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole, Language } from '../types';
import { UserAvatar } from '../components/UserAvatar';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerProfile, loginAsDemoUser } = useAuth();
  const { zones, t, setLanguage, language } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('worker');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('Fruit & Vegetable Vendor');
  const [zoneId, setZoneId] = useState('hyd-charminar');
  const [dailyWage, setDailyWage] = useState(700);
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [loading, setLoading] = useState(false);
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const selectedZone = zones.find((z) => z.id === zoneId);

    await registerProfile({
      name: name || (role === 'admin' ? 'District Manager' : 'Street Merchant'),
      phone: phone || '+91 98480 00000',
      trade,
      zoneId,
      zoneName: selectedZone?.name || 'Charminar Heritage Bazaar',
      dailyWage: Number(dailyWage),
      language: selectedLang,
      role,
    });
    setLanguage(selectedLang);
    setLoading(false);
    navigate('/');
  };

  const handleDemoSelect = async (key: 'ramesh' | 'lakshmi' | 'priya') => {
    await loginAsDemoUser(key);
    navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6 sm:py-12">
      <div className="max-w-md w-full mx-auto">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C85A32] text-white shadow-md mb-3">
            <Droplets className="h-8 w-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2C241E]">
            RainGuard
          </h1>
          <p className="mt-1 text-xs text-[#5C4F42]">
            {t('appSubtitle')}
          </p>
        </div>

        {/* Demo profiles are shown only when requested */}
        <div className="mb-6 rounded-2xl border border-[#D9CDB8] bg-[#F4EFE6] p-3 text-xs">
          <button
            type="button"
            aria-expanded={showDemoProfiles}
            onClick={() => setShowDemoProfiles((shown) => !shown)}
            className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left hover:bg-[#EAE2D2]"
          >
            <span>
              <span className="block font-bold text-[#2C241E]">Explore demo profiles</span>
              <span className="mt-0.5 block text-[11px] text-[#7D7060]">Choose a sample worker or NGO admin</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-[#1E4D38] transition-transform ${showDemoProfiles ? 'rotate-180' : ''}`} />
          </button>
          {showDemoProfiles && (
            <div className="mt-2 space-y-2 border-t border-[#D9CDB8] pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[#7D7060] text-[11px]">
                  {t('demoAccounts')}
                </span>
                <span className="rounded bg-[#1E4D38]/10 px-2 py-0.5 text-[10px] font-bold text-[#1E4D38]">
                  Local Demo · This Device
                </span>
              </div>
              <div className="space-y-2">
            <button
              onClick={() => handleDemoSelect('ramesh')}
              className="w-full flex items-center justify-between rounded-xl border border-[#D0C2A5] bg-white p-2.5 text-left hover:border-[#1E4D38] transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={{ uid: 'demo-worker-ramesh-101', name: 'Ramesh Kumar', role: 'worker' }} className="h-10 w-10 text-xs" />
                <div>
                  <span className="font-bold text-[#2C241E]">Ramesh Kumar</span>
                  <span className="text-[11px] text-[#7D7060] block">Fruit Vendor · Charminar (₹750/day)</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#1E4D38]">Select →</span>
            </button>

            <button
              onClick={() => handleDemoSelect('lakshmi')}
              className="w-full flex items-center justify-between rounded-xl border border-[#D0C2A5] bg-white p-2.5 text-left hover:border-[#1E4D38] transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={{ uid: 'demo-worker-lakshmi-102', name: 'Lakshmi Devi', role: 'worker' }} className="h-10 w-10 text-xs" />
                <div>
                  <span className="font-bold text-[#2C241E]">Lakshmi Devi</span>
                  <span className="text-[11px] text-[#7D7060] block">Flower Garland Stall · Koti (₹600/day)</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#1E4D38]">Select →</span>
            </button>

            <button
              onClick={() => handleDemoSelect('priya')}
              className="w-full flex items-center justify-between rounded-xl border border-[#D0C2A5] bg-white p-2.5 text-left hover:border-[#1E4D38] transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={{ uid: 'demo-admin-priya-201', name: 'Priya Sharma', role: 'admin' }} className="h-10 w-10 text-xs" />
                <div>
                  <span className="font-bold text-[#2C241E]">Priya Sharma (NGO)</span>
                  <span className="text-[11px] text-[#7D7060] block">Zone Manager · District Admin</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#1E4D38]">Select →</span>
            </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Auth Form Container */}
        <div className="rounded-3xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 sm:p-8 shadow-xs">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#EAE2D2] p-1 text-xs font-semibold mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-lg py-2 transition-colors ${
                mode === 'login'
                  ? 'bg-white text-[#1E4D38] shadow-xs'
                  : 'text-[#5C4F42] hover:text-[#2C241E]'
              }`}
            >
              {t('signInBtn')}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-lg py-2 transition-colors ${
                mode === 'register'
                  ? 'bg-white text-[#1E4D38] shadow-xs'
                  : 'text-[#5C4F42] hover:text-[#2C241E]'
              }`}
            >
              {t('registerBtn')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div>
              <label className="block font-semibold text-[#4A3F35] mb-1.5">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`rounded-xl border p-2.5 text-center font-medium transition-colors ${
                    role === 'worker'
                      ? 'border-[#1E4D38] bg-[#1E4D38] text-white shadow-xs font-bold'
                      : 'border-[#D0C2A5] bg-white text-[#5C4F42] hover:bg-[#F4EFE6]'
                  }`}
                >
                  {t('roleWorker')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`rounded-xl border p-2.5 text-center font-medium transition-colors ${
                    role === 'admin'
                      ? 'border-[#1E4D38] bg-[#1E4D38] text-white shadow-xs font-bold'
                      : 'border-[#D0C2A5] bg-white text-[#5C4F42] hover:bg-[#F4EFE6]'
                  }`}
                >
                  {t('roleAdmin')}
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block font-semibold text-[#4A3F35] mb-1">
                {t('fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D7060]" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#D0C2A5] bg-white pl-8.5 pr-3 py-2 text-xs text-[#2C241E] focus:outline-none focus:border-[#1E4D38]"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold text-[#4A3F35] mb-1">
                {t('phoneNumber')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D7060]" />
                <input
                  type="text"
                  placeholder="+91 98480 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#D0C2A5] bg-white pl-8.5 pr-3 py-2 text-xs font-mono text-[#2C241E] focus:outline-none focus:border-[#1E4D38]"
                  required
                />
              </div>
            </div>

            {/* If Registering or Worker: Collect Sector & Wage */}
            {role === 'worker' && (
              <>
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

                <div>
                  <label className="block font-semibold text-[#4A3F35] mb-1">
                    {t('dailyWageInr')}
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7D7060]" />
                    <input
                      type="number"
                      min={200}
                      max={3000}
                      step={50}
                      value={dailyWage}
                      onChange={(e) => setDailyWage(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#D0C2A5] bg-white pl-8.5 pr-3 py-2 text-xs font-bold tabular-nums text-[#2C241E] focus:outline-none focus:border-[#1E4D38]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3F35] mb-1">
                    Language Preference for SMS
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLang('en')}
                      className={`rounded-lg border p-1.5 text-center text-xs font-medium ${
                        selectedLang === 'en'
                          ? 'border-[#1E4D38] bg-[#1E4D38] text-white font-bold'
                          : 'border-[#D0C2A5] bg-white text-[#5C4F42]'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLang('te')}
                      className={`rounded-lg border p-1.5 text-center text-xs font-medium ${
                        selectedLang === 'te'
                          ? 'border-[#1E4D38] bg-[#1E4D38] text-white font-bold'
                          : 'border-[#D0C2A5] bg-white text-[#5C4F42]'
                      }`}
                    >
                      తెలుగు
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLang('hi')}
                      className={`rounded-lg border p-1.5 text-center text-xs font-medium ${
                        selectedLang === 'hi'
                          ? 'border-[#1E4D38] bg-[#1E4D38] text-white font-bold'
                          : 'border-[#D0C2A5] bg-white text-[#5C4F42]'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E4D38] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#163B2B] transition-colors disabled:opacity-60"
              >
                <span>{mode === 'login' ? t('signInBtn') : t('registerBtn')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-[11px] text-[#7D7060]">
            Demo data stays in this browser. No cloud account is required.
          </p>
        </div>
      </div>
    </div>
  );
};
