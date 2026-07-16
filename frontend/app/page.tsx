"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { RateRow } from "./components/RateRow";
import { RateCard } from "./components/RateCard";
import { FreightRate } from "@/lib/api";
import {
  getExchangeRate,
  getVesselPositions,
  getPortCongestion,
  getMarketRates,
  type VesselPosition,
  type PortCongestion,
  type MarketRate,
} from "@/lib/shipping-api";
import {
  getPortWeather,
  getWeatherIcon,
  getWindDirection,
  type PortWeather,
} from "@/lib/weather-api";
import { exportToPdf } from "@/lib/pdf-export";
import {
  ChartIcon, ShipIcon, GlobeIcon, DollarIcon, AnchorIcon,
  TrendUpIcon, TrendDownIcon, SearchIcon, CloseIcon, PlusIcon,
  MapIcon, SunIcon, WindIcon, DropletIcon, WarningIcon, ContainerIcon,
  DownloadIcon,
} from "./components/icons";

const DEMO_RATES: FreightRate[] = [
  { id: 1, origin_port: "Jebel Ali", destination_port: "Rotterdam", carrier: "Maersk", container_type: "40HC", rate: 2450, currency: "USD", valid_date: "2026-08-15" },
  { id: 2, origin_port: "Shanghai", destination_port: "Los Angeles", carrier: "MSC", container_type: "40GP", rate: 3200, currency: "USD", valid_date: "2026-08-20" },
  { id: 3, origin_port: "Hamburg", destination_port: "Singapore", carrier: "CMA CGM", container_type: "20GP", rate: 1850, currency: "USD", valid_date: "2026-08-12" },
  { id: 4, origin_port: "Ningbo", destination_port: "Felixstowe", carrier: "COSCO", container_type: "40HC", rate: 2750, currency: "USD", valid_date: "2026-08-18" },
  { id: 5, origin_port: "Busan", destination_port: "Oakland", carrier: "Hapag-Lloyd", container_type: "45HC", rate: 4100, currency: "USD", valid_date: "2026-08-25" },
  { id: 6, origin_port: "Mumbai", destination_port: "Genoa", carrier: "Evergreen", container_type: "40GP", rate: 2100, currency: "USD", valid_date: "2026-08-14" },
];

const ALL_CARRIERS = ["All", "Maersk", "MSC", "CMA CGM", "COSCO", "Hapag-Lloyd", "Evergreen", "ONE"];

const PORT_COORDS: Record<string, { lat: number; lon: number }> = {
  Rotterdam: { lat: 51.9244, lon: 4.4777 },
  "Los Angeles": { lat: 33.7362, lon: -118.2922 },
  Shanghai: { lat: 31.2304, lon: 121.4737 },
  Singapore: { lat: 1.3521, lon: 103.8198 },
  Hamburg: { lat: 53.5511, lon: 9.9937 },
  Felixstowe: { lat: 51.9637, lon: 1.3513 },
  Oakland: { lat: 37.8044, lon: -122.2712 },
  Genoa: { lat: 44.4056, lon: 8.9463 },
  Busan: { lat: 35.1028, lon: 129.0403 },
  Mumbai: { lat: 19.0760, lon: 72.8777 },
  Ningbo: { lat: 29.8683, lon: 121.5440 },
  "Jebel Ali": { lat: 24.9857, lon: 55.0270 },
};

function AnimatedCounter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(value * eased);
      setDisplay(current.toLocaleString());
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{prefix}{display}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    "Low": { bg: "rgba(90,184,158,0.1)", color: "var(--mint)", border: "rgba(90,184,158,0.25)" },
    "Moderate": { bg: "rgba(212,168,75,0.1)", color: "var(--brass)", border: "rgba(212,168,75,0.25)" },
    "High": { bg: "rgba(201,107,90,0.1)", color: "var(--coral)", border: "rgba(201,107,90,0.25)" },
    "Critical": { bg: "rgba(201,107,90,0.15)", color: "#e85d5d", border: "rgba(232,93,93,0.3)" },
    "Underway": { bg: "rgba(63,158,160,0.1)", color: "var(--teal)", border: "rgba(63,158,160,0.25)" },
    "Anchored": { bg: "rgba(212,168,75,0.1)", color: "var(--brass)", border: "rgba(212,168,75,0.25)" },
    "Moored": { bg: "rgba(107,158,201,0.1)", color: "var(--sky)", border: "rgba(107,158,201,0.25)" },
  };
  const style = colors[status] || colors["Low"];
  return (
    <span className="badge text-[10px]" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
      {status}
    </span>
  );
}

// Simple SVG Map Component
function VesselMap({ vessels, selectedPort }: { vessels: VesselPosition[]; selectedPort: string }) {
  const port = PORT_COORDS[selectedPort] || PORT_COORDS["Rotterdam"];
  const mapWidth = 800;
  const mapHeight = 400;
  const scale = 15;
  const offsetX = mapWidth / 2 - port.lon * scale;
  const offsetY = mapHeight / 2 + port.lat * scale;
  const toX = (lon: number) => lon * scale + offsetX;
  const toY = (lat: number) => -lat * scale + offsetY;

  return (
    <div className="map-container" style={{ height: 400 }}>
      <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-full">
        <rect width={mapWidth} height={mapHeight} fill="rgba(8,15,28,0.6)" />
        {Array.from({ length: 20 }).map((_, i) => (
          <g key={i}>
            <line x1={i * 40} y1={0} x2={i * 40} y2={mapHeight} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
            <line x1={0} y1={i * 20} x2={mapWidth} y2={i * 20} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
          </g>
        ))}
        <circle cx={toX(port.lon)} cy={toY(port.lat)} r={8} fill="rgba(212,168,75,0.3)" stroke="var(--brass)" strokeWidth={2} />
        <circle cx={toX(port.lon)} cy={toY(port.lat)} r={4} fill="var(--brass)" />
        <text x={toX(port.lon) + 12} y={toY(port.lat) + 4} fill="var(--brass)" fontSize={12} fontWeight={600}>{selectedPort}</text>
        {vessels.map((vessel) => (
          <g key={vessel.mmsi}>
            <circle cx={toX(vessel.longitude)} cy={toY(vessel.latitude)} r={5} fill="rgba(63,158,160,0.3)" stroke="var(--teal)" strokeWidth={1.5} />
            <circle cx={toX(vessel.longitude)} cy={toY(vessel.latitude)} r={2} fill="var(--teal)" />
            <line x1={toX(vessel.longitude)} y1={toY(vessel.latitude)} x2={toX(vessel.longitude - Math.sin(vessel.course * Math.PI / 180) * 2)} y2={toY(vessel.latitude - Math.cos(vessel.course * Math.PI / 180) * 2)} stroke="rgba(63,158,160,0.3)" strokeWidth={1} strokeDasharray="2,2" />
          </g>
        ))}
        <g transform={`translate(${mapWidth - 60}, 60)`}>
          <circle r={25} fill="none" stroke="rgba(212,168,75,0.2)" strokeWidth={1} />
          <line x1={0} y1={-25} x2={0} y2={25} stroke="rgba(212,168,75,0.15)" strokeWidth={0.5} />
          <line x1={-25} y1={0} x2={25} y2={0} stroke="rgba(212,168,75,0.15)" strokeWidth={0.5} />
          <polygon points="0,-20 -4,-12 4,-12" fill="var(--brass)" opacity={0.6} />
          <text x={0} y={-28} fill="var(--brass)" fontSize={10} textAnchor="middle" opacity={0.6}>N</text>
        </g>
        <g transform={`translate(20, ${mapHeight - 30})`}>
          <rect width={60} height={3} fill="rgba(255,255,255,0.2)" rx={1} />
          <text x={0} y={-8} fill="rgba(255,255,255,0.4)" fontSize={10}>50 km</text>
        </g>
      </svg>
    </div>
  );
}

export default function LedgerPage() {
  const [rates, setRates] = useState<FreightRate[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCarrier, setActiveCarrier] = useState("All");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [exchangeRate, setExchangeRate] = useState<{ rate: number; date: string } | null>(null);
  const [vessels, setVessels] = useState<VesselPosition[]>([]);
  const [congestion, setCongestion] = useState<PortCongestion[]>([]);
  const [marketRates, setMarketRates] = useState<MarketRate[]>([]);
  const [weather, setWeather] = useState<PortWeather[]>([]);
  const [selectedPort, setSelectedPort] = useState("Rotterdam");
  const [showMap, setShowMap] = useState(false);
useEffect(() => {
  const fetchRates = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/rates`
      );

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setRates(data);
      setLoadError(false);
    } catch {
      setRates(DEMO_RATES);
      setLoadError(true);
      toast.error("Could not connect to API. Displaying demo data.");
    }
  };

  fetchRates();
}, []);
  useEffect(() => {
    const fetchLiveData = async () => {
      const [rate, ships, market] = await Promise.all([
        getExchangeRate("USD", "EUR"),
        getVesselPositions(PORT_COORDS[selectedPort]?.lat || 51.95, PORT_COORDS[selectedPort]?.lon || 4.05),
        getMarketRates(),
      ]);
      
      const uniquePorts = [...new Set(DEMO_RATES.map((r) => r.destination_port))];
      const [congestionData, weatherData] = await Promise.all([
        Promise.all(uniquePorts.map((p) => getPortCongestion(p))),
        Promise.all(uniquePorts.slice(0, 4).map((p) => getPortWeather(p))),
      ]);

      setExchangeRate(rate);
      setVessels(ships);
      setMarketRates(market);
      setCongestion(congestionData);
      setWeather(weatherData);
    };

    fetchLiveData();

    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [selectedPort]);

  const filteredRates = useMemo(() => {
    return rates.filter((rate) => {
      const matchesSearch =
        searchQuery === "" ||
        rate.origin_port.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rate.destination_port.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rate.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rate.container_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCarrier = activeCarrier === "All" || rate.carrier === activeCarrier;
      return matchesSearch && matchesCarrier;
    });
  }, [rates, searchQuery, activeCarrier]);

  const handleExport = () => {
    toast("Generating PDF report...");
    exportToPdf(filteredRates);
  };

  const handleDelete = async (rateId: number) => {
    if (!window.confirm("Are you sure you want to delete this rate? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/rates/${rateId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Rate deleted successfully.");
      setRates((prevRates) => prevRates.filter((r) => r.id !== rateId));
    } catch (error) {
      toast.error("Could not delete rate. Please try again.");
    }
  };

  const kpis = useMemo(() => {
    const total = rates.length;
    const carriers = new Set(rates.map((r) => r.carrier)).size;
    const routes = new Set(rates.map((r) => `${r.origin_port}-${r.destination_port}`)).size;
    const avgRate = total > 0 ? Math.round(rates.reduce((sum, r) => sum + r.rate, 0) / total) : 0;
    return { total, carriers, routes, avgRate };
  }, [rates]);

  const kpiData = [
    { label: "Total Rates", value: kpis.total, change: "+12.5%", changeUp: true, sub: "vs last month", accent: "var(--brass)", accentBg: "rgba(212,168,75,0.08)", accentBorder: "rgba(212,168,75,0.15)", icon: <ChartIcon className="w-5 h-5" /> },
    { label: "Carriers", value: kpis.carriers, change: "+3", changeUp: true, sub: "new this week", accent: "var(--teal)", accentBg: "rgba(63,158,160,0.08)", accentBorder: "rgba(63,158,160,0.15)", icon: <ShipIcon className="w-5 h-5" /> },
    { label: "Active Routes", value: kpis.routes, change: "Global", changeUp: true, sub: "coverage", accent: "var(--sky)", accentBg: "rgba(107,158,201,0.08)", accentBorder: "rgba(107,158,201,0.15)", icon: <GlobeIcon className="w-5 h-5" /> },
    { label: "Avg Rate", value: kpis.avgRate, prefix: "$", change: "-2.1%", changeUp: false, sub: "vs last month", accent: "var(--coral)", accentBg: "rgba(201,107,90,0.08)", accentBorder: "rgba(201,107,90,0.15)", icon: <DollarIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="flex flex-col animate-fade-up md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AnchorIcon className="w-4 h-4 text-[var(--brass)]" />
            <p className="uppercase tracking-[0.3em] text-[11px] font-medium text-[var(--brass)]">
              Freight Intelligence
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            Rate <span className="gradient-text">Ledger</span>
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--ink-dim)]">
            Real-time ocean freight rate tracking with live vessel positions, port weather, and market data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {exchangeRate && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--hairline)" }}>
              <span className="text-[10px] uppercase tracking-wider text-[var(--ink-faint)]">USD/EUR</span>
              <span className="font-mono-data text-sm font-bold text-[var(--brass)]">{exchangeRate.rate.toFixed(4)}</span>
            </div>
          )}
          <Link href="/new" className="seal-button px-6 py-3 text-sm text-center inline-flex items-center gap-2 shrink-0">
            <PlusIcon className="w-4 h-4" /> Log New Rate
          </Link>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <div key={kpi.label} className={`kpi-card p-5 animate-fade-up stagger-${i + 1}`} style={{ "--accent": kpi.accent } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium text-[var(--ink-dim)]">{kpi.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.accentBg, border: `1px solid ${kpi.accentBorder}`, color: kpi.accent }}>
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono-data tracking-tight text-[var(--ink)]">
              <AnimatedCounter value={kpi.value} prefix={kpi.prefix || ""} />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-xs font-medium ${kpi.changeUp ? "text-[var(--mint)]" : "text-[var(--coral)]"}`}>{kpi.change}</span>
              <span className="text-[11px] text-[var(--ink-faint)]">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Live Market Ticker */}
      {marketRates.length > 0 && (
        <section className="manifest-card p-5 overflow-hidden animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--mint)", boxShadow: "0 0 8px var(--mint-glow)" }} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[var(--mint)]">Live Market Rates</span>
            </div>
            <span className="text-[10px] text-[var(--ink-faint)]">Updated: {marketRates[0]?.lastUpdated}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {marketRates.map((mr) => (
              <div key={mr.route} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--hairline)" }}>
                <div className="text-[10px] uppercase tracking-wider mb-1 truncate text-[var(--ink-faint)]">{mr.route}</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-data text-lg font-bold text-[var(--ink)]">${mr.rate.toLocaleString()}</span>
                  <span className={`text-[10px] font-medium flex items-center gap-0.5 ${mr.trend === "up" ? "text-[var(--coral)]" : mr.trend === "down" ? "text-[var(--mint)]" : "text-[var(--ink-dim)]"}`}>
                    {mr.trend === "up" ? <TrendUpIcon className="w-3 h-3" /> : mr.trend === "down" ? <TrendDownIcon className="w-3 h-3" /> : <span>—</span>}
                    {Math.abs(mr.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Port Weather */}
      {weather.length > 0 && (
        <section className="animate-fade-up stagger-3">
          <div className="flex items-center gap-3 mb-4">
            <SunIcon className="w-4 h-4 text-[var(--brass)]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[var(--ink-dim)]">Port Weather Conditions</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, var(--hairline), transparent)" }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weather.map((w) => (
              <div key={w.port} className="weather-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">{w.port}</span>
                  <span className="text-2xl">{getWeatherIcon(w.condition)}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold font-mono-data">{w.temp}°</span>
                  <span className="text-[11px] text-[var(--ink-faint)]">feels {w.feelsLike}°</span>
                </div>
                <div className="text-[11px] mb-3 text-[var(--ink-dim)]">{w.description}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <WindIcon className="w-3 h-3 text-[var(--ink-faint)]" />
                    <span className="text-[var(--ink-faint)]">{w.windSpeed} km/h {getWindDirection(w.windDeg)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DropletIcon className="w-3 h-3 text-[var(--ink-faint)]" />
                    <span className="text-[var(--ink-faint)]">{w.humidity}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Port Congestion */}
      {congestion.length > 0 && (
        <section className="animate-fade-up stagger-4">
          <div className="flex items-center gap-3 mb-4">
            <ContainerIcon className="w-4 h-4 text-[var(--brass)]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[var(--ink-dim)]">Port Congestion</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, var(--hairline), transparent)" }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {congestion.map((c) => (
              <div key={c.port} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--hairline)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{c.port}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[var(--ink-faint)]">At Anchor</span>
                    <div className="font-mono-data font-bold">{c.vesselsAtAnchor}</div>
                  </div>
                  <div>
                    <span className="text-[var(--ink-faint)]">At Berth</span>
                    <div className="font-mono-data font-bold">{c.vesselsAtBerth}</div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-[var(--ink-faint)]">
                  Avg wait: <span className="font-mono-data font-semibold text-[var(--ink)]">{c.avgWaitDays}d</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <section className="space-y-4 animate-fade-up stagger-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">
              <SearchIcon className="w-[18px] h-[18px] text-[var(--ink-dim)]" />
            </div>
            <input type="text" placeholder="Search routes, carriers, ports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-field" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity">
                <CloseIcon className="w-4 h-4 text-[var(--ink-dim)]" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--hairline)" }}>
              <button onClick={() => setViewMode("cards")} className="px-3 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: viewMode === "cards" ? "rgba(212,168,75,0.1)" : "transparent", color: viewMode === "cards" ? "var(--brass)" : "var(--ink-dim)", border: viewMode === "cards" ? "1px solid rgba(212,168,75,0.2)" : "1px solid transparent" }}>Cards</button>
              <button onClick={() => setViewMode("table")} className="px-3 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: viewMode === "table" ? "rgba(212,168,75,0.1)" : "transparent", color: viewMode === "table" ? "var(--brass)" : "var(--ink-dim)", border: viewMode === "table" ? "1px solid rgba(212,168,75,0.2)" : "1px solid transparent" }}>Table</button>
            </div>
            <button onClick={() => setShowMap(!showMap)} className="px-3 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-1.5" style={{ background: showMap ? "rgba(63,158,160,0.1)" : "rgba(255,255,255,0.03)", color: showMap ? "var(--teal)" : "var(--ink-dim)", border: showMap ? "1px solid rgba(63,158,160,0.2)" : "1px solid var(--hairline)" }}>
              <MapIcon className="w-4 h-4" /> Map
            </button>
            <button onClick={handleExport} disabled={filteredRates.length === 0} className="px-3 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "rgba(255,255,255,0.03)", color: "var(--ink-dim)", border: "1px solid var(--hairline)" }}>
              <DownloadIcon className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_CARRIERS.map((carrier) => (
            <button key={carrier} onClick={() => setActiveCarrier(carrier)} className={`filter-chip ${activeCarrier === carrier ? "active" : ""}`}>
              {activeCarrier === carrier && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brass)" }} />}
              {carrier}
            </button>
          ))}
        </div>
      </section>

      {/* Vessel Map */}
      {showMap && vessels.length > 0 && (
        <section className="manifest-card p-6 overflow-hidden animate-fade-up stagger-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--teal)", boxShadow: "0 0 8px var(--teal-glow)" }} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: "var(--teal)" }}>Live Vessel Tracker</span>
            </div>
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg cursor-pointer"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--hairline)", color: "var(--ink)" }}
            >
              {Object.keys(PORT_COORDS).map((port) => (
                <option key={port} value={port} style={{ background: "var(--hull-raised)", color: "var(--ink)" }}>{port}</option>
              ))}
            </select>
          </div>
          <VesselMap vessels={vessels} selectedPort={selectedPort} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: "var(--ink-faint)" }}>
                  <th className="pb-3 text-left">Vessel</th>
                  <th className="pb-3 text-left">IMO</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-left">Destination</th>
                  <th className="pb-3 text-left">ETA</th>
                  <th className="pb-3 text-right">Speed</th>
                </tr>
              </thead>
              <tbody>
                {vessels.map((vessel) => (
                  <tr key={vessel.mmsi} className="border-t" style={{ borderColor: "var(--hairline)" }}>
                    <td className="py-3 pr-4 ">
                      <div className="flex items-center gap-2">
                        <ShipIcon className="w-5 h-5 text-[var(--teal)]" />
                        <span className="font-semibold text-sm">{vessel.ship_name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono-data text-sm text-[var(--ink-dim)]">{vessel.imo}</td>
                    <td className="py-3 pr-4"><StatusBadge status={vessel.status} /></td>
                    <td className="py-3 pr-4 text-sm ">{vessel.destination}</td>
                    <td className="py-3 pr-4 font-mono-data text-sm text-[var(--ink-dim)]">{vessel.eta}</td>
                    <td className="py-3 font-mono-data text-sm font-bold text-right text-[var(--brass)]">{vessel.speed} kn</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[10px] text-center" style={{ color: "var(--ink-faint)" }}>
            Auto-refreshes every 30s • Data provided by MarineTraffic API
          </div>
        </section>
      )}

      {/* Error */}
      {loadError && rates.length === 0 && (
        <div className="rounded-2xl border px-6 py-5 animate-fade-up" style={{ borderColor: "rgba(201,107,90,0.3)", background: "rgba(201,107,90,0.08)", color: "#e0a898" }}>
          <div className="flex items-start gap-3">
            <WarningIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-semibold">Unable to connect to the API.</strong>
              <div className="mt-1.5 text-sm opacity-80">
                Make sure your FastAPI backend is running and <code className="font-mono-data px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>NEXT_PUBLIC_API_BASE</code> is configured correctly.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loadError && filteredRates.length === 0 && (
        <div className="manifest-card text-center py-20 px-10 animate-fade-up">
          <div className="flex justify-center mb-5">
            <ShipIcon className="w-16 h-16 animate-float text-[var(--brass)] opacity-50" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">{searchQuery || activeCarrier !== "All" ? "No matches found" : "No Rates Logged"}</h2>
          <p className="max-w-md mx-auto mb-8 text-sm" style={{ color: "var(--ink-dim)" }}>
            {searchQuery || activeCarrier !== "All" ? "Try adjusting your search or filter criteria." : "Your freight ledger is empty. Start tracking shipping prices by logging your first rate."}
          </p>
          <Link href="/new" className="seal-button inline-flex items-center gap-2 px-6 py-3">
            <PlusIcon className="w-4 h-4" /> {searchQuery || activeCarrier !== "All" ? "Log a Rate" : "Log First Rate"}
          </Link>
        </div>
      )}

      {/* Results Header */}
      {filteredRates.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="section-divider" style={{ marginBottom: 0, flex: 1 }}>
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: "var(--ink-dim)" }}>{viewMode === "cards" ? "Rate Cards" : "Rate Table"}</span>
          </div>
          <span className="text-xs font-mono-data ml-4 shrink-0" style={{ color: "var(--ink-faint)" }}>{filteredRates.length} {filteredRates.length === 1 ? "entry" : "entries"}</span>
        </div>
      )}

      {/* Cards View */}
      {viewMode === "cards" && filteredRates.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRates.map((rate, i) => (
            <RateCard
              key={rate.id}
              rate={rate}
              index={i}
              history={rates
                .filter((r) => r.origin_port === rate.origin_port && r.destination_port === rate.destination_port && r.container_type === rate.container_type)
                .sort((a, b) => new Date(a.valid_date).getTime() - new Date(b.valid_date).getTime())
                .map((r) => r.rate)}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}

      {/* Table View */}
      {viewMode === "table" && filteredRates.length > 0 && (
        <section className="manifest-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 px-6 py-4 border-b text-[11px] uppercase tracking-[0.2em] font-medium" style={{ borderColor: "var(--hairline)", background: "linear-gradient(to right, rgba(255,255,255,0.03), rgba(255,255,255,0.015))", color: "var(--ink-dim)" }}>
            <div className="col-span-3">Route</div>
            <div className="col-span-2">Carrier</div>
            <div className="col-span-2">Container</div>
            <div className="col-span-2">Valid Until</div>
            <div className="col-span-1 text-right">Rate</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filteredRates.map((rate, index) => (
            <RateRow key={rate.id} rate={rate} isEven={index % 2 !== 0} onDelete={handleDelete} />
          ))}
        </section>
      )}
    </div>
  );
}