import React from 'react';
import { Droplets } from 'lucide-react';

interface SplashScreenProps {
  onSkip: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onSkip }) => (
  <main
    className="rainguard-splash fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F9F7F2] px-6 text-center"
    onClick={onSkip}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') onSkip();
    }}
    role="button"
    tabIndex={0}
    aria-label="RainGuard is loading. Tap or press Enter to continue to sign in."
  >
    <div className="rainguard-splash-lockup">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#C85A32] text-white shadow-xl shadow-[#C85A32]/20">
        <Droplets className="h-11 w-11 stroke-[2.1]" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#1E4D38]">RainGuard</h1>
    </div>

    <p className="rainguard-splash-tagline mt-3 text-sm text-[#5C4F42] sm:text-base">
      Parametric micro-insurance for street vendors
    </p>

    <div className="rainguard-splash-progress mt-10 h-1 w-32 overflow-hidden rounded-full bg-[#E6DEC8]" aria-hidden="true">
      <div className="h-full w-full origin-left rounded-full bg-[#1E4D38]" />
    </div>
    <span className="sr-only">Loading RainGuard</span>

    <style>{`
      .rainguard-splash-lockup {
        animation: rainguard-enter 650ms cubic-bezier(.2,.8,.2,1) both,
          rainguard-exit 350ms ease-in 1.75s both;
      }
      .rainguard-splash-tagline {
        animation: rainguard-fade-in 450ms ease-out 450ms both,
          rainguard-exit 350ms ease-in 1.75s both;
      }
      .rainguard-splash-progress {
        animation: rainguard-fade-in 400ms ease-out 700ms both,
          rainguard-exit 300ms ease-in 1.8s both;
      }
      .rainguard-splash-progress > div {
        animation: rainguard-progress 1.25s ease-in-out 700ms both;
      }
      @keyframes rainguard-enter {
        from { opacity: 0; transform: translateY(10px) scale(.88); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes rainguard-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes rainguard-exit {
        to { opacity: 0; transform: translateY(-6px) scale(.97); }
      }
      @keyframes rainguard-progress {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .rainguard-splash-lockup, .rainguard-splash-tagline, .rainguard-splash-progress,
        .rainguard-splash-progress > div { animation-duration: 1ms; animation-delay: 0ms; }
      }
    `}</style>
  </main>
);
