import { FreightRate } from "@/lib/api";
import { CARRIER_STYLES } from "@/lib/constants";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "./icons";

type RateRowProps = {
  rate: FreightRate;
  isEven: boolean;
  onDelete: (id: number) => void;
};

export function RateRow({ rate, isEven, onDelete }: RateRowProps) {
  const style = CARRIER_STYLES[rate.carrier] || { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", color: "#8b9aab" };
  const isExpired = new Date(rate.valid_date) < new Date();

  return (
    <div
      className="ledger-row grid grid-cols-12 items-center px-6 py-5 border-t"
      style={{
        borderColor: "var(--hairline)",
        background: isEven ? "rgba(255,255,255,0.02)" : "transparent",
      }}
    >
      {/* Route */}
      <div className="col-span-12 sm:col-span-3 mb-2 sm:mb-0">
        <div className="font-semibold text-[15px] flex items-center gap-1.5 flex-wrap">
          <span>{rate.origin_port}</span>
          <span style={{ color: "var(--teal)", fontWeight: 800 }}>→</span>
          <span>{rate.destination_port}</span>
        </div>
        <div className="text-[10px] mt-1 uppercase tracking-widest font-medium" style={{ color: "var(--ink-faint)" }}>
          Shipping Route
        </div>
      </div>

      {/* Carrier */}
      <div className="col-span-6 sm:col-span-2 mb-2 sm:mb-0">
        <span className="badge text-[11px]" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
          {rate.carrier}
        </span>
      </div>

      {/* Container */}
      <div className="col-span-6 sm:col-span-2 mb-2 sm:mb-0">
        <span className="badge font-mono-data text-[11px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--hairline)", color: "var(--ink)" }}>
          {rate.container_type}
        </span>
      </div>

      {/* Valid Date */}
      <div className="col-span-6 sm:col-span-2 mb-2 sm:mb-0">
        <div className="flex items-center gap-2">
          <span className="font-mono-data text-sm font-medium" style={{ color: isExpired ? "var(--coral)" : "var(--ink-dim)" }}>
            {rate.valid_date}
          </span>
          {isExpired && (
            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(201,107,90,0.1)", color: "var(--coral)", border: "1px solid rgba(201,107,90,0.2)" }}>
              Exp
            </span>
          )}
        </div>
        <div className="text-[10px] uppercase tracking-widest mt-1 font-medium" style={{ color: "var(--ink-faint)" }}>
          Valid Until
        </div>
      </div>

      {/* Rate */}
      <div className="col-span-6 sm:col-span-1 text-right">
        <div className="font-mono-data text-lg font-bold tracking-tight" style={{ color: "var(--brass)" }}>
          {rate.currency} {rate.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-2 mt-3 sm:mt-0">
        <Link href={`/rates/${rate.id}/edit`} className="p-2 rounded-md transition-colors hover:bg-white/5" title="Edit Rate">
          <PencilIcon className="w-4 h-4 text-[var(--ink-dim)]" />
        </Link>
        <button onClick={() => onDelete(rate.id)} className="p-2 rounded-md transition-colors hover:bg-white/5" title="Delete Rate">
          <TrashIcon className="w-4 h-4 text-[var(--coral)]" />
        </button>
      </div>
    </div>
  );
}

export default RateRow;