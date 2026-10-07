import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CloudRain,
  ShieldCheck,
  ReceiptText,
  MapPin,
  Wallet,
  User,
  ShieldAlert,
  ArrowRightLeft,
  X,
  Droplets,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../UserAvatar';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useApp();
  const { user, loginAsDemoUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/auth', { replace: true });
  };

  const navLinks = [
    { to: '/', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/risk-monitor', label: t('navRiskMonitor'), icon: CloudRain },
    { to: '/confirmations', label: t('navConfirmations'), icon: ShieldCheck },
    { to: '/payouts', label: t('navPayoutHistory'), icon: ReceiptText },
    { to: '/zone-map', label: t('navZoneMap'), icon: MapPin },
    { to: '/wallet', label: t('navWallet'), icon: Wallet },
    { to: '/profile', label: t('navProfile'), icon: User },
    { to: '/admin', label: t('navAdmin'), icon: ShieldAlert, badge: 'NGO' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-[#E6DEC8] bg-[#F4EFE6] text-[#2C241E] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-[#E6DEC8] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C85A32] text-white shadow-xs">
              <Droplets className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1E4D38]">RainGuard</span>
              <p className="text-[11px] font-medium text-[#7D7060]">Micro-Insurance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D7060] hover:bg-[#EAE2D2] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1E4D38] text-[#FDFCF7] shadow-xs'
                      : 'text-[#4A3F35] hover:bg-[#EAE2D2] hover:text-[#1E4D38]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 shrink-0 opacity-80 group-hover:opacity-100" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-[#C85A32]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#C85A32]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Demo Persona Switcher (For Evaluation & Demonstrations) */}
        <div className="border-t border-[#E6DEC8] p-4">
          <button
            type="button"
            aria-expanded={showDemoProfiles}
            onClick={() => setShowDemoProfiles((shown) => !shown)}
            className="mb-2 flex w-full items-center justify-between text-[11px] font-semibold tracking-wider text-[#7D7060] uppercase"
          >
            <span>Switch Demo Persona</span>
            <ArrowRightLeft className={`h-3.5 w-3.5 transition-transform ${showDemoProfiles ? 'rotate-180' : ''}`} />
          </button>
          {showDemoProfiles && (
            <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-[#EAE2D2] p-1 text-xs font-medium">
            <button
              onClick={() => loginAsDemoUser('ramesh')}
              className={`rounded-md py-1.5 transition-colors ${
                user?.uid === 'demo-worker-ramesh-101'
                  ? 'bg-white text-[#1E4D38] shadow-xs font-semibold'
                  : 'text-[#5C4F42] hover:text-[#1E4D38]'
              }`}
            >
              <span className="flex flex-col items-center gap-1">
                <UserAvatar user={{ uid: 'demo-worker-ramesh-101', name: 'Ramesh Kumar', role: 'worker' }} className="h-7 w-7 text-[9px]" />
                <span>Ramesh</span>
              </span>
            </button>
            <button
              onClick={() => loginAsDemoUser('lakshmi')}
              className={`rounded-md py-1.5 transition-colors ${
                user?.uid === 'demo-worker-lakshmi-102'
                  ? 'bg-white text-[#1E4D38] shadow-xs font-semibold'
                  : 'text-[#5C4F42] hover:text-[#1E4D38]'
              }`}
            >
              <span className="flex flex-col items-center gap-1">
                <UserAvatar user={{ uid: 'demo-worker-lakshmi-102', name: 'Lakshmi Devi', role: 'worker' }} className="h-7 w-7 text-[9px]" />
                <span>Lakshmi</span>
              </span>
            </button>
            <button
              onClick={() => loginAsDemoUser('priya')}
              className={`rounded-md py-1.5 transition-colors ${
                user?.role === 'admin'
                  ? 'bg-[#1E4D38] text-white shadow-xs font-semibold'
                  : 'text-[#5C4F42] hover:text-[#1E4D38]'
              }`}
            >
              <span className="flex flex-col items-center gap-1">
                <UserAvatar user={{ uid: 'demo-admin-priya-201', name: 'Priya Sharma', role: 'admin' }} className="h-7 w-7 text-[9px]" />
                <span>Priya (NGO)</span>
              </span>
            </button>
            </div>
          )}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="border-t border-[#E6DEC8] bg-[#EFE9DC] p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} className="h-10 w-10 border border-[#D9CDB8] text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#2C241E]">{user?.name || 'Street Vendor'}</p>
              <p className="truncate text-xs text-[#7D7060]">
                {user?.role === 'admin' ? 'Field Coordinator' : user?.zoneName || 'Charminar'}
              </p>
            </div>
          </div>
          {user?.role === 'worker' && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-[#E2D8C3] px-3 py-2 text-xs">
              <span className="text-[#6B5E4F]">Daily Wage</span>
              <span className="font-bold tabular-nums text-[#1E4D38]">₹{user?.dailyWage}/day</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#D9CDB8] bg-[#F9F7F2] px-3 py-2 text-xs font-semibold text-[#9C3D1B] transition-colors hover:bg-[#FBECE5]"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
