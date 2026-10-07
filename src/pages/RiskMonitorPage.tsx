import React, { useState } from 'react';
import {
  CloudRain,
  Thermometer,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Info,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Wind,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { calculateParametricRisk } from '../utils/weatherEngine';

export const RiskMonitorPage: React.FC = () => {
  const { user } = useAuth();
  const {
    zones,
    riskHistory,
    selectedZoneId,
    setSelectedZoneId,
    activeZone,
    refreshZoneWeather,
    simulateDistressSurge,
    t,
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual interactive knobs to let judges/users test the algorithm
  const [interactiveTemp, setInteractiveTemp] = useState<number>(activeZone?.currentTemp || 38.5);
  const [interactiveRain, setInteractiveRain] = useState<number>(activeZone?.currentRain || 20);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(false);

  const currentTemp = interactiveMode ? interactiveTemp : (activeZone?.currentTemp || 36);
  const currentRain = interactiveMode ? interactiveRain : (activeZone?.currentRain || 10);

  const calc = calculateParametricRisk(currentTemp, currentRain);
  const selectedHistory = riskHistory
    .filter((item) => item.zoneId === selectedZoneId)
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
    .slice(-12);
  const chartPoints = selectedHistory.map((item, index) => ({
    ...item,
    x: selectedHistory.length < 2 ? 50 : 4 + (index / (selectedHistory.length - 1)) * 92,
    y: 94 - (item.riskScore / 100) * 84,
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshZoneWeather(selectedZoneId);
    if (activeZone) {
      setInteractiveTemp(activeZone.currentTemp);
      setInteractiveRain(activeZone.currentRain);
    }
    setIsRefreshing(false);
  };

  const handleApplyCustomDistress = () => {
    simulateDistressSurge(selectedZoneId, currentRain > 25 ? 'rain' : 'heat');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DEC8] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C241E]">
            {t('riskMonitorTitle')}
          </h1>
          <p className="mt-1 text-xs text-[#5C4F42] max-w-2xl">
            {t('riskMonitorSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInteractiveMode((p) => !p)}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
              interactiveMode
                ? 'border-[#C85A32] bg-[#FBECE5] text-[#C85A32]'
                : 'border-[#E6DEC8] bg-[#F4EFE6] text-[#4A3F35] hover:bg-[#EAE2D2]'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>{interactiveMode ? 'Testing Custom Knobs' : 'Interactive Knobs'}</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-[#1E4D38] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#163B2B] transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : t('refreshWeather')}</span>
          </button>
        </div>
      </div>

      {/* Zone Selector Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          const isHigh = zone.currentRiskScore > 70;
          const isMed = zone.currentRiskScore > 40 && zone.currentRiskScore <= 70;

          return (
            <button
              key={zone.id}
              onClick={() => {
                setSelectedZoneId(zone.id);
                setInteractiveTemp(zone.currentTemp);
                setInteractiveRain(zone.currentRain);
              }}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'border-[#1E4D38] bg-[#1E4D38] text-white shadow-xs'
                  : 'border-[#E6DEC8] bg-[#FDFCF7] text-[#4A3F35] hover:bg-[#F4EFE6]'
              }`}
            >
              <span className="font-bold">{zone.name}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : isHigh
                    ? 'bg-[#FBECE5] text-[#C85A32]'
                    : isMed
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-[#E7F3EC] text-[#1E4D38]'
                }`}
              >
                {zone.currentRiskScore}
              </span>
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#2C241E]">Risk history · {activeZone?.name}</h2>
            <p className="mt-1 text-[11px] text-[#7D7060]">Recent stored readings; refresh or simulate conditions to add points.</p>
          </div>
          <span className="w-fit rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-900">Demo simulation · not live weather</span>
        </div>
        {chartPoints.length > 0 ? (
          <>
            <div className="mt-4 h-40 w-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label={`Simulated risk history for ${activeZone?.name}`}>
                {[10, 30, 50, 70, 90].map((y) => (
                  <line key={y} x1="4" x2="96" y1={y} y2={y} stroke="#E6DEC8" strokeWidth="0.6" />
                ))}
                <polyline
                  points={chartPoints.map((point) => `${point.x},${point.y}`).join(' ')}
                  fill="none"
                  stroke="#1E4D38"
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                />
                {chartPoints.map((point) => (
                  <circle key={point.id} cx={point.x} cy={point.y} r="1.8" fill={point.riskScore > 70 ? '#C85A32' : '#1E4D38'}>
                    <title>{`${new Date(point.capturedAt).toLocaleString()} · Risk ${point.riskScore}, ${point.temp}°C, ${point.rain} mm/h`}</title>
                  </circle>
                ))}
              </svg>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#7D7060]">
              <span>Lower risk</span>
              <span>Score 0–100</span>
              <span>Higher risk</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {chartPoints.slice(-4).reverse().map((point) => (
                <div key={point.id} className="rounded-lg bg-[#F4EFE6] p-2 text-[10px]">
                  <div className="font-semibold text-[#2C241E]">Risk {point.riskScore}</div>
                  <div className="mt-0.5 text-[#7D7060]">{new Date(point.capturedAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 rounded-lg bg-[#F4EFE6] p-4 text-xs text-[#7D7060]">No readings stored for this zone yet.</p>
        )}
      </section>

      {/* Interactive Simulator Knobs Panel (When Active) */}
      {interactiveMode && (
        <div className="rounded-2xl border border-[#C85A32]/40 bg-[#FBECE5]/40 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#C85A32]" />
              <span className="text-xs font-bold text-[#9C3D1B] uppercase tracking-wider">
                Parametric Simulation Knobs
              </span>
            </div>
            <span className="text-[11px] text-[#783015]">
              Adjust temperature & rain to test algorithmic triggers live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between font-semibold text-[#2C241E] mb-1">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-[#C85A32]" />
                  Ambient Temperature (°C)
                </span>
                <span className="font-bold tabular-nums text-base text-[#C85A32]">{interactiveTemp}°C</span>
              </div>
              <input
                type="range"
                min="28"
                max="48"
                step="0.5"
                value={interactiveTemp}
                onChange={(e) => setInteractiveTemp(Number(e.target.value))}
                className="w-full accent-[#C85A32]"
              />
              <div className="flex justify-between text-[10px] text-[#7D7060] mt-1">
                <span>28°C (Mild)</span>
                <span>38°C (Elevated)</span>
                <span>44°C+ (Heatwave Alert)</span>
              </div>
            </div>

            {/* Rain Slider */}
            <div>
              <div className="flex justify-between font-semibold text-[#2C241E] mb-1">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="h-4 w-4 text-blue-600" />
                  Precipitation Rate (mm/hr)
                </span>
                <span className="font-bold tabular-nums text-base text-blue-700">{interactiveRain} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="65"
                step="1"
                value={interactiveRain}
                onChange={(e) => setInteractiveRain(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-[#7D7060] mt-1">
                <span>0 mm/h (Dry)</span>
                <span>20 mm/h (Heavy)</span>
                <span>50 mm/h+ (Inundation)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EAD0C5] flex items-center justify-between">
            <span className="text-xs text-[#5C4F42]">
              Triggered Payout at this level:{' '}
              <strong className="text-[#1E4D38] font-bold">
                {calc.tier} ({calc.payoutPercentage}% = ₹{Math.round((user?.dailyWage || 700) * calc.payoutPercentage / 100)})
              </strong>
            </span>
            <button
              onClick={handleApplyCustomDistress}
              className="rounded-xl bg-[#C85A32] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#B34B24]"
            >
              Dispatch Trigger Claim
            </button>
          </div>
        </div>
      )}

      {/* Main Telemetry Breakdown (Formula weighted 60% Temp + 40% Rain) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric 1: Temperature (60% Weight) */}
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7D7060]">
                <Thermometer className="h-4 w-4 text-[#C85A32]" />
                {t('temperature')}
              </span>
              <span className="rounded bg-[#FBECE5] px-2 py-0.5 text-[10px] font-bold text-[#C85A32]">
                {t('tempWeightBadge')}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tabular-nums tracking-tight text-[#2C241E]">
                {currentTemp}°C
              </span>
              <span className="text-xs text-[#7D7060]">Thermal Sensor</span>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-[#5C4F42]">
                <span>Component Score</span>
                <span className="font-bold tabular-nums">{calc.tempScore} / 100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EAE2D2] overflow-hidden">
                <div
                  className="h-full bg-[#C85A32] transition-all duration-300"
                  style={{ width: `${calc.tempScore}%` }}
                />
              </div>
              <p className="text-[11px] text-[#7D7060]">
                Normalized heatwave distress threshold calculated on 30°C to 46°C baseline.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#E6DEC8]/60 text-xs text-[#5C4F42]">
            Weighted Contribution:{' '}
            <strong className="font-mono text-[#2C241E]">
              {Math.round(calc.tempScore * 0.6)} pts
            </strong>
          </div>
        </div>

        {/* Metric 2: Rainfall (40% Weight) */}
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7D7060]">
                <CloudRain className="h-4 w-4 text-blue-600" />
                {t('rainfall')}
              </span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                {t('rainWeightBadge')}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tabular-nums tracking-tight text-[#2C241E]">
                {currentRain}
              </span>
              <span className="text-xs text-[#7D7060]">mm / hr</span>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-[#5C4F42]">
                <span>Component Score</span>
                <span className="font-bold tabular-nums">{calc.rainScore} / 100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EAE2D2] overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${calc.rainScore}%` }}
                />
              </div>
              <p className="text-[11px] text-[#7D7060]">
                Inundation rate calculated on 2 mm/hr to 60 mm/hr cloudburst threshold.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#E6DEC8]/60 text-xs text-[#5C4F42]">
            Weighted Contribution:{' '}
            <strong className="font-mono text-[#2C241E]">
              {Math.round(calc.rainScore * 0.4)} pts
            </strong>
          </div>
        </div>

        {/* Metric 3: Total Parametric Formula */}
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#F4EFE6] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7D7060]">
                Combined Risk Formula
              </span>
              <span className="text-xs font-mono font-bold text-[#1E4D38]">0–100 Scale</span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold tabular-nums tracking-tight text-[#1E4D38]">
                {calc.totalScore}
              </span>
              <span className="text-xs font-bold text-[#5C4F42]">/ 100 Risk</span>
            </div>

            <div className="mt-3 rounded-xl border border-[#D9CDB8] bg-white p-3 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-[#5C4F42]">
                <span>Temp (60%):</span>
                <span>{calc.tempScore} × 0.60 = {Math.round(calc.tempScore * 0.60)}</span>
              </div>
              <div className="flex justify-between text-[#5C4F42]">
                <span>Rain (40%):</span>
                <span>{calc.rainScore} × 0.40 = {Math.round(calc.rainScore * 0.40)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-200 font-bold text-[#1E4D38]">
                <span>Total Score:</span>
                <span>{calc.totalScore}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-[#EAE2D2] p-2.5 text-center text-xs">
            <span className="text-[#5C4F42]">Primary Factor: </span>
            <strong className="text-[#2C241E]">{calc.primaryRiskFactor}</strong>
          </div>
        </div>
      </div>

      {/* Tiered Payout Rules (Requirement 4) */}
      <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#2C241E]">{t('thresholdTiers')}</h3>
          <p className="text-xs text-[#5C4F42]">{t('activeTiersBanner')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Tier 0 */}
          <div
            className={`rounded-xl border p-4 transition-all ${
              calc.tier === 'None'
                ? 'border-[#1E4D38] bg-[#E7F3EC] shadow-xs'
                : 'border-[#E6DEC8] bg-[#F9F7F2]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#2C241E]">Safe Baseline</span>
              <span className="font-mono text-[#7D7060]">≤ 40</span>
            </div>
            <div className="mt-2 text-xl font-bold text-[#7D7060]">0% Payout</div>
            <p className="mt-1 text-[11px] text-[#5C4F42]">
              Normal operating conditions. Street carts operate normally without severe income loss.
            </p>
          </div>

          {/* Tier 1 */}
          <div
            className={`rounded-xl border p-4 transition-all ${
              calc.tier === 'Tier 1'
                ? 'border-amber-500 bg-amber-50 shadow-xs'
                : 'border-[#E6DEC8] bg-[#F9F7F2]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#2C241E]">Tier 1 Distress</span>
              <span className="font-mono text-amber-800">&gt; 40</span>
            </div>
            <div className="mt-2 text-xl font-bold text-amber-900">30% Daily Wage</div>
            <p className="mt-1 text-[11px] text-[#5C4F42]">
              Moderate squall or midday heat causes customer footfall drop. Disburses ~₹225.
            </p>
          </div>

          {/* Tier 2 */}
          <div
            className={`rounded-xl border p-4 transition-all ${
              calc.tier === 'Tier 2'
                ? 'border-[#C85A32] bg-[#FBECE5] shadow-xs'
                : 'border-[#E6DEC8] bg-[#F9F7F2]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#2C241E]">Tier 2 Severe</span>
              <span className="font-mono text-[#C85A32]">&gt; 70</span>
            </div>
            <div className="mt-2 text-xl font-bold text-[#C85A32]">60% Daily Wage</div>
            <p className="mt-1 text-[11px] text-[#5C4F42]">
              Heavy inundation or 43°C heat forcing carts to pack up. Disburses ~₹450.
            </p>
          </div>

          {/* Tier 3 */}
          <div
            className={`rounded-xl border p-4 transition-all ${
              calc.tier === 'Tier 3'
                ? 'border-red-600 bg-red-50 shadow-xs'
                : 'border-[#E6DEC8] bg-[#F9F7F2]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#2C241E]">Tier 3 Disaster</span>
              <span className="font-mono text-red-700">&gt; 90</span>
            </div>
            <div className="mt-2 text-xl font-bold text-red-800">80% Daily Wage</div>
            <p className="mt-1 text-[11px] text-[#5C4F42]">
              Severe cloudburst or dangerous heatwave closure. Maximum immediate relief (~₹600).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
