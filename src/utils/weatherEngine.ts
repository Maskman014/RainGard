import { Zone } from '../types';

/**
 * Parametric Risk Formula:
 * - Temperature weight: 60%
 * - Precipitation/Rain weight: 40%
 * Both are normalized to a 0 - 100 severity index based on threshold distress for street vendors.
 *
 * Temperature distress for street workers:
 * - Baseline comfortable: <= 32°C (Score 0)
 * - Noticeable heat distress: 35°C (Score ~25)
 * - Extreme heat advisory: 42°C (Score ~75)
 * - Dangerous heatwave: >= 46°C (Score 100)
 *
 * Rainfall distress for street carts:
 * - Drizzle: <= 2 mm/hr (Score 0)
 * - Moderate rain (spoils produce / clears street): 12 mm/hr (Score ~35)
 * - Heavy rain (inundation/waterlogging): 35 mm/hr (Score ~75)
 * - Monsoon cloudburst: >= 60 mm/hr (Score 100)
 */

export function calculateParametricRisk(temp: number, rain: number): {
  tempScore: number;
  rainScore: number;
  totalScore: number;
  tier: 'None' | 'Tier 1' | 'Tier 2' | 'Tier 3';
  payoutPercentage: number;
  primaryRiskFactor: string;
} {
  // Normalize temperature distress (30°C to 46°C)
  const tempClamped = Math.max(30, Math.min(temp, 46));
  const tempScore = Math.round(((tempClamped - 30) / (46 - 30)) * 100);

  // Normalize rain distress (2 mm/hr to 60 mm/hr)
  const rainClamped = Math.max(2, Math.min(rain, 60));
  const rainScore = Math.round(((rainClamped - 2) / (60 - 2)) * 100);

  // 60% temp + 40% rain weighted formula
  const totalScore = Math.min(100, Math.round(0.60 * tempScore + 0.40 * rainScore));

  let tier: 'None' | 'Tier 1' | 'Tier 2' | 'Tier 3' = 'None';
  let payoutPercentage = 0;

  if (totalScore > 90) {
    tier = 'Tier 3';
    payoutPercentage = 80;
  } else if (totalScore > 70) {
    tier = 'Tier 2';
    payoutPercentage = 60;
  } else if (totalScore > 40) {
    tier = 'Tier 1';
    payoutPercentage = 30;
  }

  let primaryRiskFactor = 'Normal Weather';
  if (rainScore > tempScore && rainScore > 40) {
    primaryRiskFactor = rainScore > 75 ? 'Severe Monsoon Waterlogging' : 'Heavy Rain Inundation';
  } else if (tempScore >= rainScore && tempScore > 40) {
    primaryRiskFactor = tempScore > 75 ? 'Dangerous Heatwave Advisory' : 'High Heat Stress';
  }

  return {
    tempScore,
    rainScore,
    totalScore,
    tier,
    payoutPercentage,
    primaryRiskFactor,
  };
}

/**
 * Initial demo zones used by the local application
 */
export const INITIAL_ZONES: Zone[] = [
  {
    id: 'hyd-charminar',
    name: 'Charminar Heritage Bazaar',
    city: 'Hyderabad',
    coordinates: { lat: 17.3616, lng: 78.4747 },
    currentTemp: 38.4,
    currentRain: 22.5,
    currentRiskScore: 46,
    status: 'moderate',
    activeWorkersCount: 428,
    lastWeatherUpdate: new Date().toISOString(),
    highRiskReason: 'Intermittent squalls causing customer dropoff',
  },
  {
    id: 'hyd-koti',
    name: 'Koti Sultan Bazaar',
    city: 'Hyderabad',
    coordinates: { lat: 17.3850, lng: 78.4867 },
    currentTemp: 43.8,
    currentRain: 0.0,
    currentRiskScore: 53,
    status: 'moderate',
    activeWorkersCount: 312,
    lastWeatherUpdate: new Date().toISOString(),
    highRiskReason: 'Extreme noon solar radiation in open alleyways',
  },
  {
    id: 'hyd-ameerpet',
    name: 'Ameerpet Commercial Cross',
    city: 'Hyderabad',
    coordinates: { lat: 17.4375, lng: 78.4482 },
    currentTemp: 33.2,
    currentRain: 48.0,
    currentRiskScore: 78,
    status: 'critical',
    activeWorkersCount: 265,
    lastWeatherUpdate: new Date().toISOString(),
    highRiskReason: 'Flash flood waterlogging around metro pillars',
  },
  {
    id: 'hyd-madhapur',
    name: 'Madhapur Vendor Enclave',
    city: 'Hyderabad',
    coordinates: { lat: 17.4483, lng: 78.3915 },
    currentTemp: 31.5,
    currentRain: 4.2,
    currentRiskScore: 18,
    status: 'safe',
    activeWorkersCount: 184,
    lastWeatherUpdate: new Date().toISOString(),
  },
  {
    id: 'hyd-dilsukhnagar',
    name: 'Dilsukhnagar Wholesale Mandi',
    city: 'Hyderabad',
    coordinates: { lat: 17.3688, lng: 78.5247 },
    currentTemp: 44.5,
    currentRain: 38.0,
    currentRiskScore: 92,
    status: 'critical',
    activeWorkersCount: 520,
    lastWeatherUpdate: new Date().toISOString(),
    highRiskReason: 'Combined severe heatwave and sudden thunderstorm',
  },
  {
    id: 'mum-dadar',
    name: 'Dadar Market Square',
    city: 'Mumbai',
    coordinates: { lat: 19.0178, lng: 72.8478 },
    currentTemp: 34.0,
    currentRain: 55.0,
    currentRiskScore: 84,
    status: 'critical',
    activeWorkersCount: 680,
    lastWeatherUpdate: new Date().toISOString(),
    highRiskReason: 'Monsoon high-tide drainage overflow',
  },
];

/**
 * Swappable Weather Service Interface
 * Currently operates via realistic simulation; structured so Open-Meteo or IMD API
 * can be plugged in directly by implementing `fetchZoneWeather`.
 */
export interface WeatherProvider {
  fetchZoneWeather(lat: number, lng: number): Promise<{ temp: number; rain: number; condition: string }>;
}

export class SimulatedWeatherProvider implements WeatherProvider {
  async fetchZoneWeather(lat: number, lng: number): Promise<{ temp: number; rain: number; condition: string }> {
    // Generate realistic fluctuating weather based on coordinates and time
    const seed = Math.sin(lat * 10 + lng * 5 + Date.now() / 60000);
    const temp = Number((32 + (seed * 8) + (Math.random() * 4)).toFixed(1));
    const rain = Number((Math.max(0, (seed * 35) + (Math.random() * 25))).toFixed(1));
    
    let condition = 'Partly Cloudy';
    if (rain > 30) condition = 'Heavy Downpour';
    else if (rain > 10) condition = 'Moderate Rain';
    else if (temp > 40) condition = 'Extreme Heatwave';
    else if (temp > 36) condition = 'Humid Heat';

    return { temp, rain, condition };
  }
}

export const weatherService = new SimulatedWeatherProvider();
