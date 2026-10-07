import React from 'react';
import { divIcon } from 'leaflet';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ZoneMapPage.css';
import {
  Thermometer,
  CloudRain,
  Users,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Zone } from '../types';

export const ZoneMapPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const {
    zones,
    selectedZoneId,
    setSelectedZoneId,
    simulateDistressSurge,
    refreshZoneWeather,
    t,
  } = useApp();

  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const handleAssignToZone = (zone: Zone) => {
    updateProfile({
      zoneId: zone.id,
      zoneName: zone.name,
    });
  };

  const workerCounts = zones.map(({ activeWorkersCount }) => activeWorkersCount);
  const minWorkers = Math.min(...workerCounts);
  const maxWorkers = Math.max(...workerCounts);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DEC8] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C241E]">
            {t('zoneMapTitle')}
          </h1>
          <p className="mt-1 text-xs text-[#5C4F42] max-w-2xl">
            {t('zoneMapSubtitle')}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#1E4D38]" />
            <span className="text-[#5C4F42]">{t('safeZone')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-[#5C4F42]">{t('moderateZone')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#C85A32]" />
            <span className="text-[#5C4F42]">{t('criticalZone')}</span>
          </div>
        </div>
      </div>

      {/* Main Map Viewport & Zone Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Leaflet street map */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2 text-[#7D7060] font-semibold">
              <Compass className="h-4 w-4 text-[#1E4D38]" />
              <span>Urban Vendor Grid — Telangana & Maharashtra Corridors</span>
            </div>
            <span className="font-mono text-[11px] text-[#7D7060]">Interactive Radar Nodes</span>
          </div>

          {/* OpenStreetMap Canvas */}
          <div className="relative w-full aspect-16/10 rounded-xl border border-[#E6DEC8] bg-[#F4EFE6] overflow-hidden">
            <MapContainer
              center={[17.4028, 78.4600]}
              zoom={12}
              scrollWheelZoom
              className="zone-leaflet-map"
              zoomControl
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
              {zones.map((zone) => {
                const isSelected = zone.id === selectedZoneId;
                const isAssigned = user?.zoneId === zone.id;
                const riskClass = zone.currentRiskScore > 70
                  ? 'critical'
                  : zone.currentRiskScore > 40
                    ? 'moderate'
                    : 'safe';
                const size = maxWorkers === minWorkers
                  ? 38
                  : Math.round(30 + ((zone.activeWorkersCount - minWorkers) / (maxWorkers - minWorkers)) * 18);
                const markerIcon = divIcon({
                  className: 'zone-marker-icon',
                  html: `<div class="zone-map-marker zone-map-marker--${riskClass}${isSelected ? ' zone-map-marker--selected' : ''}${zone.currentRiskScore > 70 ? ' zone-map-marker--pulse' : ''}" style="width:${size}px;height:${size}px"><span>${zone.currentRiskScore}</span></div>`,
                  iconSize: [size, size],
                  iconAnchor: [size / 2, size / 2],
                });

                return (
                  <Marker
                    key={zone.id}
                    position={[zone.coordinates.lat, zone.coordinates.lng]}
                    icon={markerIcon}
                    title={`${zone.name} — risk ${zone.currentRiskScore}, ${zone.activeWorkersCount} vendors protected`}
                    eventHandlers={{ click: () => setSelectedZoneId(zone.id) }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -size / 2]} className="zone-map-tooltip">
                      {zone.name.split(' ')[0]} {isAssigned ? '★' : ''}
                    </Tooltip>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#7D7060]">
            <span>Click any market node to inspect live micro-climate and vendor quotas</span>
            <span>★ Star marks your registered home market</span>
          </div>
        </div>

        {/* Selected Zone Detail Card (Inspector) */}
        <div className="rounded-2xl border border-[#E6DEC8] bg-[#FDFCF7] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E6DEC8]/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7D7060]">
                {t('selectedZoneDetail')}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  activeZone.currentRiskScore > 70
                    ? 'bg-[#FBECE5] text-[#C85A32]'
                    : activeZone.currentRiskScore > 40
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-[#E7F3EC] text-[#1E4D38]'
                }`}
              >
                {activeZone.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-[#2C241E]">{activeZone.name}</h3>
              <p className="text-xs text-[#7D7060]">{activeZone.city}, India</p>
            </div>

            {/* Score Display */}
            <div className="mt-4 rounded-xl border border-[#D9CDB8] bg-[#F4EFE6] p-4 text-center">
              <span className="text-xs text-[#7D7060]">Parametric Risk Index</span>
              <div className="text-4xl font-extrabold tabular-nums text-[#2C241E]">
                {activeZone.currentRiskScore}
                <span className="text-sm font-semibold text-[#7D7060]"> / 100</span>
              </div>
              <p className="mt-1 text-xs text-[#5C4F42]">
                {activeZone.highRiskReason || 'Operating within safe weather thresholds'}
              </p>
            </div>

            {/* Weather & Population Specs */}
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-[#7D7060] flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-[#C85A32]" />
                  Ambient Temperature
                </span>
                <span className="font-bold tabular-nums text-[#2C241E]">
                  {activeZone.currentTemp}°C
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-[#7D7060] flex items-center gap-1.5">
                  <CloudRain className="h-3.5 w-3.5 text-blue-600" />
                  Precipitation Rate
                </span>
                <span className="font-bold tabular-nums text-[#2C241E]">
                  {activeZone.currentRain} mm/h
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-[#7D7060] flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#1E4D38]" />
                  {t('activeVendors')}
                </span>
                <span className="font-bold tabular-nums text-[#1E4D38]">
                  {activeZone.activeWorkersCount} Vendors
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7D7060]">GPS Coordinates</span>
                <span className="font-mono text-[#5C4F42]">
                  {activeZone.coordinates.lat.toFixed(4)}, {activeZone.coordinates.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive actions for this zone */}
          <div className="mt-6 pt-4 border-t border-[#E6DEC8]/60 space-y-2">
            {user?.zoneId === activeZone.id ? (
              <div className="rounded-xl bg-[#E7F3EC] p-2.5 text-center text-xs font-bold text-[#1E4D38]">
                ✓ This is your assigned vending zone
              </div>
            ) : (
              <button
                onClick={() => handleAssignToZone(activeZone)}
                className="w-full rounded-xl border border-[#1E4D38] bg-white py-2 text-xs font-semibold text-[#1E4D38] hover:bg-[#E7F3EC] transition-colors"
              >
                Set as My Primary Market Zone
              </button>
            )}

            <button
              onClick={() => simulateDistressSurge(activeZone.id, 'rain')}
              className="w-full rounded-xl bg-[#C85A32] py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#B34B24] transition-colors"
            >
              Test Rain Trigger in {activeZone.name.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
