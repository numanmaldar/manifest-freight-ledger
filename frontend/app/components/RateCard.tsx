"use client";

import { FreightRate } from "@/lib/api";
import { CARRIER_STYLES } from "@/lib/constants";
import { PencilIcon, TrashIcon } from "./icons";
import { Sparkline } from "./Sparkline";

type Props = {
  rate: FreightRate;
  history?: number[];
  index?: number;
  onDelete: (id: number) => void;
};

export function RateCard({ rate, history = [], index = 0, onDelete }: Props) {
  const style = CARRIER_STYLES[rate.carrier] || { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", color: "#8b9aab" };
  const isExpired = new Date(rate.valid_date) < new Date();

  return (
    <div className="freight-card p-6 group relative" style={{ animationDelay: `${index * 0.06}s` }}>
      {/* Top Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-1.5" style={{ color: "var(--ink-faint)" }}>
            Shipping Route
          </p>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
            <span>{rate.origin_port}</span>
            <span style={{ color: "var(--teal)", fontWeight: 800 }}>→</span>
            <span>{rate.destination_port}</span>
          </h3>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-1.5" style={{ color: "var(--ink-faint)" }}>
            Freight Rate
          </p>
          <div className="flex items-end gap-4">
            {history.length > 1 && (
              <div className="opacity-60"><Sparkline data={history} /></div>
            )}
            <div className="text-2xl md:text-3xl font-bold font-mono-data tracking-tight" style={{ color: "var(--brass)" }}>
              {rate.currency} {rate.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Appear on Hover */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button onClick={() => onDelete(rate.id)} className="p-2 rounded-md transition-colors bg-black/10 hover:bg-black/30 backdrop-blur-sm" title="Delete Rate">
          <TrashIcon className="w-4 h-4 text-[var(--coral)]" />
        </button>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-2" style={{ color: "var(--ink-faint)" }}>
            Carrier
          </p>
          <span className="badge" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
            {rate.carrier}
          </span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-2" style={{ color: "var(--ink-faint)" }}>
            Container
          </p>
          <span className="badge font-mono-data" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--hairline)", color: "var(--ink)" }}>
            {rate.container_type}
          </span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] font-medium mb-2" style={{ color: "var(--ink-faint)" }}>
            Valid Until
          </p>
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-sm font-semibold" style={{ color: isExpired ? "var(--coral)" : "var(--ink)" }}>
              {rate.valid_date}
            </span>
            {isExpired && (
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(201,107,90,0.1)", color: "var(--coral)", border: "1px solid rgba(201,107,90,0.2)" }}>
                Expired
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}