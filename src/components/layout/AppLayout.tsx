import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SmsLogDrawer } from '../sms/SmsLogDrawer';
import { useApp } from '../../context/AppContext';
import { WifiOff, AlertCircle } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [smsDrawerOpen, setSmsDrawerOpen] = useState(false);
  const { isOffline, t } = useApp();

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#2C241E] flex flex-col font-sans">
      {/* Offline Resilience Banner */}
      {isOffline && (
        <div className="bg-[#9C3D1B] text-white px-4 py-2.5 text-xs font-medium shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 shrink-0 text-amber-200" />
              <span>{t('offlineBanner')}</span>
            </div>
            <span className="hidden sm:inline-block rounded bg-black/20 px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase">
              Local IndexedCache
            </span>
          </div>
        </div>
      )}

      {/* Main Structural Layout */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Viewport with Left Margin for Desktop Sidebar */}
        <div className="flex flex-1 flex-col lg:pl-72 min-w-0">
          {/* Top Bar */}
          <TopBar
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenSmsDrawer={() => setSmsDrawerOpen(true)}
          />

          {/* Page Outlet */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Low-Bandwidth SMS Simulation Drawer */}
      <SmsLogDrawer isOpen={smsDrawerOpen} onClose={() => setSmsDrawerOpen(false)} />
    </div>
  );
};
