// lib/shipping-api.ts

// ===== Frankfurter Currency API (Free, No Key) =====
export async function getExchangeRate(base: string = "USD", target: string = "EUR") {
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${target}`);
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return {
      rate: data.rates[target],
      date: data.date,
      base,
      target,
    };
  } catch {
    return null;
  }
}

// ===== MarineTraffic Vessel API (Free Tier: 100 calls/day) =====
// Sign up at https://www.marinetraffic.com/en/ais-api-services/ to get a free API key
const MARINETRAFFIC_KEY = process.env.NEXT_PUBLIC_MARINETRAFFIC_KEY || "";

export interface VesselPosition {
  mmsi: number;
  imo: number;
  ship_name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  status: string;
  destination: string;
  eta: string;
}

export async function getVesselPositions(portLat: number, portLon: number, radius: number = 50) {
  if (!MARINETRAFFIC_KEY) {
    // Return demo data if no API key
    return DEMO_VESSELS;
  }
  try {
    const res = await fetch(
      `https://services.marinetraffic.com/api/exportvessels/v:8/${MARINETRAFFIC_KEY}/protocol:jsono/timespan:10/minlat:${portLat - 1}/maxlat:${portLat + 1}/minlon:${portLon - 1}/maxlon:${portLon + 1}`
    );
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return DEMO_VESSELS;
  }
}

// Demo vessel data for when no API key is set
export const DEMO_VESSELS: VesselPosition[] = [
  { mmsi: 352001234, imo: 9876543, ship_name: "MSC GULSUN", latitude: 51.95, longitude: 4.05, speed: 12.5, course: 89, status: "Underway", destination: "Rotterdam", eta: "2026-07-15 08:00" },
  { mmsi: 219001567, imo: 9765432, ship_name: "MAERSK EINDHOVEN", latitude: 51.88, longitude: 3.95, speed: 8.2, course: 45, status: "Anchored", destination: "Rotterdam", eta: "2026-07-15 14:30" },
  { mmsi: 477001890, imo: 9654321, ship_name: "COSCO SHIPPING GALAXY", latitude: 51.92, longitude: 4.12, speed: 15.0, course: 270, status: "Underway", destination: "Hamburg", eta: "2026-07-16 06:00" },
  { mmsi: 563001234, imo: 9543210, ship_name: "EVER FORWARD", latitude: 51.85, longitude: 4.20, speed: 0.0, course: 0, status: "Moored", destination: "Rotterdam", eta: "2026-07-14 22:00" },
  { mmsi: 373001567, imo: 9432109, ship_name: "CMA CGM MARCO POLO", latitude: 51.98, longitude: 3.88, speed: 18.5, course: 135, status: "Underway", destination: "Antwerp", eta: "2026-07-15 10:00" },
];

// ===== Port Congestion / Schedule (Demo with real structure) =====
export interface PortCongestion {
  port: string;
  vesselsAtAnchor: number;
  vesselsAtBerth: number;
  avgWaitDays: number;
  status: "Low" | "Moderate" | "High" | "Critical";
}

export async function getPortCongestion(port: string): Promise<PortCongestion> {
  // In production, this would call a real API
  // For now, return contextual demo data
  const congestionData: Record<string, PortCongestion> = {
    "Rotterdam": { port: "Rotterdam", vesselsAtAnchor: 12, vesselsAtBerth: 8, avgWaitDays: 1.2, status: "Low" },
    "Los Angeles": { port: "Los Angeles", vesselsAtAnchor: 28, vesselsAtBerth: 15, avgWaitDays: 3.5, status: "High" },
    "Shanghai": { port: "Shanghai", vesselsAtAnchor: 45, vesselsAtBerth: 22, avgWaitDays: 2.1, status: "Moderate" },
    "Singapore": { port: "Singapore", vesselsAtAnchor: 18, vesselsAtBerth: 12, avgWaitDays: 1.8, status: "Low" },
    "Jebel Ali": { port: "Jebel Ali", vesselsAtAnchor: 8, vesselsAtBerth: 6, avgWaitDays: 0.8, status: "Low" },
    "Hamburg": { port: "Hamburg", vesselsAtAnchor: 6, vesselsAtBerth: 4, avgWaitDays: 1.5, status: "Low" },
    "Felixstowe": { port: "Felixstowe", vesselsAtAnchor: 15, vesselsAtBerth: 9, avgWaitDays: 2.8, status: "Moderate" },
    "Oakland": { port: "Oakland", vesselsAtAnchor: 9, vesselsAtBerth: 5, avgWaitDays: 1.9, status: "Low" },
    "Genoa": { port: "Genoa", vesselsAtAnchor: 5, vesselsAtBerth: 3, avgWaitDays: 1.1, status: "Low" },
    "Busan": { port: "Busan", vesselsAtAnchor: 22, vesselsAtBerth: 14, avgWaitDays: 2.4, status: "Moderate" },
  };
  return congestionData[port] || { port, vesselsAtAnchor: 0, vesselsAtBerth: 0, avgWaitDays: 0, status: "Low" };
}

// ===== Market Rate Index (Demo with real-world structure) =====
export interface MarketRate {
  route: string;
  rate: number;
  currency: string;
  change: number; // percentage change
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export async function getMarketRates(): Promise<MarketRate[]> {
  // In production, this would call Drewry/FBX API
  // Demo data based on real market ranges
  return [
    { route: "Shanghai → Los Angeles", rate: 3200, currency: "USD", change: 2.5, trend: "up", lastUpdated: "2026-07-14" },
    { route: "Shanghai → Rotterdam", rate: 2450, currency: "USD", change: -1.2, trend: "down", lastUpdated: "2026-07-14" },
    { route: "Jebel Ali → Hamburg", rate: 1850, currency: "USD", change: 0.5, trend: "stable", lastUpdated: "2026-07-14" },
    { route: "Ningbo → Felixstowe", rate: 2750, currency: "USD", change: 3.1, trend: "up", lastUpdated: "2026-07-14" },
    { route: "Busan → Oakland", rate: 4100, currency: "USD", change: -0.8, trend: "down", lastUpdated: "2026-07-14" },
    { route: "Mumbai → Genoa", rate: 2100, currency: "USD", change: 1.5, trend: "up", lastUpdated: "2026-07-14" },
  ];
}