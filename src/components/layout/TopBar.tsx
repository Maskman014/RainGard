import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Languages,
  Wifi,
  WifiOff,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../types';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onOpenSidebar: () => void;
  onOpenSmsDrawer: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSidebar, onOpenSmsDrawer }) => {
  const {
    language,
    setLanguage,
    isOffline,
    toggleOffline,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    smsLogs,
    t,
  } = useApp();

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const languages: { code: Language; label: string; sub: string }[] = [
    { code: 'en', label: 'English', sub: 'Default' },
    { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
    { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E6DEC8] bg-[#F9F7F2]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left zone: Hamburger & Page context indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] text-[#4A3F35] hover:bg-[#EAE2D2] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#1E4D38] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7D7060]">
              {isOffline ? 'Offline Cache Active' : 'Live Parametric Oracle'}
            </span>
          </div>
          <p className="text-sm font-bold text-[#2C241E]">
            {user?.role === 'admin' ? 'District Administration Portal' : `${user?.zoneName || 'Vendor District'}`}
          </p>
        </div>
      </div>

      {/* Right zone: Controls (Language, Large-text, Offline, SMS, Notifications) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Toggle */}
        <button
          onClick={toggleOffline}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
            isOffline
              ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
              : 'border-[#E6DEC8] bg-[#F4EFE6] text-[#5C4F42] hover:bg-[#EAE2D2]'
          }`}
          title="Toggle Offline Simulation Banner"
        >
          {isOffline ? (
            <>
              <WifiOff className="h-4 w-4 text-amber-700" />
              <span className="hidden md:inline">{t('offlineMode')}</span>
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 text-[#1E4D38]" />
              <span className="hidden md:inline">{t('onlineMode')}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Log out"
          className="flex h-10 items-center gap-1.5 rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] px-2.5 text-xs font-semibold text-[#9C3D1B] transition-colors hover:bg-[#FBECE5] sm:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu((p) => !p)}
            className="flex items-center gap-1.5 rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] px-3 py-2 text-xs font-semibold text-[#3C3228] hover:bg-[#EAE2D2]"
          >
            <Languages className="h-4 w-4 text-[#7D7060]" />
            <span>
              {language === 'en' ? 'EN' : language === 'te' ? 'తెలుగు' : 'हिंदी'}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#E6DEC8] bg-[#FDFCF7] py-1.5 shadow-lg z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs font-medium transition-colors ${
                    language === lang.code
                      ? 'bg-[#EAE2D2] text-[#1E4D38] font-bold'
                      : 'text-[#4A3F35] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <span>{lang.label}</span>
                  <span className="text-[10px] text-[#7D7060]">{lang.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Low-Bandwidth SMS Simulation Drawer Trigger */}
        <button
          onClick={onOpenSmsDrawer}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] text-[#4A3F35] hover:bg-[#EAE2D2]"
          title="View Simulated Low-Bandwidth SMS Logs"
        >
          <MessageSquare className="h-4.5 w-4.5" />
          {smsLogs.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#C85A32] text-[10px] font-bold text-white">
              {smsLogs.length}
            </span>
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((p) => !p)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] text-[#4A3F35] hover:bg-[#EAE2D2]"
            aria-label="View notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#1E4D38] text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-[#E6DEC8] px-4 py-3">
                <span className="text-sm font-bold text-[#2C241E]">{t('notifications')}</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[#1E4D38] font-medium hover:underline"
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E6DEC8]/50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#7D7060]">{t('noNotifications')}</div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationRead(item.id)}
                      className={`flex gap-3 p-3.5 transition-colors cursor-pointer ${
                        item.read ? 'bg-transparent' : 'bg-[#F4EFE6]/70'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === 'payout' ? (
                          <CheckCircle2 className="h-4 w-4 text-[#1E4D38]" />
                        ) : item.type === 'risk' ? (
                          <AlertTriangle className="h-4 w-4 text-[#C85A32]" />
                        ) : (
                          <Info className="h-4 w-4 text-[#7D7060]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#2C241E]">{item.title}</p>
                          <span className="text-[10px] text-[#7D7060]">{item.timestamp}</span>
                        </div>
                        <p className="mt-1 text-xs text-[#5C4F42] leading-relaxed">{item.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
