"use client";

import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FreightRate } from "@/lib/api";

const CONTAINER_TYPES = ["20GP", "40GP", "40HC", "45HC"];

function formatSerial(d: Date) {
  const y = d.getFullYear();
  const seq = String(d.getHours() * 60 + d.getMinutes()).padStart(4, "0");
  return `MF-${y}-${seq}`;
}

export default function EditRatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const serial = useMemo(() => formatSerial(new Date()), []);
  const today = useMemo(() => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), []);

  const [form, setForm] = useState({
    origin_port: "",
    destination_port: "",
    carrier: "",
    container_type: CONTAINER_TYPES[1],
    rate: "",
    currency: "USD",
    valid_date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/rates/${params.id}`);
        if (!res.ok) throw new Error("Rate not found");
        const rate: FreightRate = await res.json();
        setForm({
          ...rate,
          rate: String(rate.rate),
          valid_date: new Date(rate.valid_date).toISOString().slice(0, 10),
        });
      } catch (error) {
        toast.error("Could not load rate data.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
  }, [params.id, router]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/rates/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rate: parseFloat(form.rate) }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Rate updated successfully!");
      router.push("/");
      router.refresh(); // Refresh server components on the home page
    } catch {
      toast.error("Could not save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const field = "ruled-field w-full text-sm";
  const label = "text-[11px] uppercase tracking-widest font-medium";

  if (loading) {
    return <div className="text-center py-20">Loading rate data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-up">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brass)" }} />
            <p className="text-[11px] uppercase tracking-[0.3em] font-medium" style={{ color: "var(--brass)" }}>
              Edit Entry
            </p>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Update rate</h1>
          <p className="text-sm mt-2" style={{ color: "var(--ink-dim)" }}>
            Modify the details for this freight rate entry.
          </p>
        </div>
        <div className="text-right font-mono-data text-xs space-y-1" style={{ color: "var(--ink-faint)" }}>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] uppercase tracking-wider">No.</span>
            <span style={{ color: "var(--ink-dim)" }}>{serial}</span>
          </div>
          <div style={{ color: "var(--ink-faint)" }}>{today}</div>
        </div>
      </div>

      {/* Form Card */}
      <div className="manifest-card" style={{ borderColor: "var(--hairline)" }}>
        <span className="corner-tl" />
        <span className="corner-tr" />
        <span className="corner-bl" />
        <span className="corner-br" />

        <div className="px-8 py-8">
          <form onSubmit={handleSubmit}>
            {/* Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
              <div>
                <label className={`${label} mb-2 block`} style={{ color: "var(--ink-dim)" }}>Origin port</label>
                <input required value={form.origin_port} onChange={(e) => update("origin_port", e.target.value)} placeholder="Jebel Ali" className={field} />
              </div>
              <div>
                <label className={`${label} mb-2 block`} style={{ color: "var(--ink-dim)" }}>Destination port</label>
                <input required value={form.destination_port} onChange={(e) => update("destination_port", e.target.value)} placeholder="Rotterdam" className={field} />
              </div>
            </div>

            {/* Carrier & Cargo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
              <div>
                <label className={`${label} mb-2 block`} style={{ color: "var(--ink-dim)" }}>Carrier</label>
                <input required value={form.carrier} onChange={(e) => update("carrier", e.target.value)} placeholder="Maersk" className={field} />
              </div>
              <div>
                <label className={`${label} mb-2 block`} style={{ color: "var(--ink-dim)" }}>Container type</label>
                <select value={form.container_type} onChange={(e) => update("container_type", e.target.value)} className={`${field} cursor-pointer`}>
                  {CONTAINER_TYPES.map((c) => (
                    <option key={c} value={c} style={{ backgroundColor: "var(--hull-raised)", color: "var(--ink)" }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rate & Validity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5 mb-8">
              <div>
                <label className={`${label} mb-2 block`} style={{ color: "var(--ink-dim)" }}>Valid date</label>
                <input type="date" required value={form.valid_date} onChange={(e) => update("valid_date", e.target.value)} className={`${field} font-mono-data`} />
              </div>
              <div>
                <label className={`${label} mb-2 block`} style={{ color: "var(--ink-dim)" }}>Rate</label>
                <input type="number" step="0.01" required value={form.rate} onChange={(e) => update("rate", e.target.value)} placeholder="1850.00" className={`${field} font-mono-data`} />
              </div>
              <div>
                <label className={`${label} mb-2 block`} style={{ color: "var(--ink-dim)" }}>Currency</label>
                <input required value={form.currency} onChange={(e) => update("currency", e.target.value.toUpperCase())} maxLength={3} className={`${field} font-mono-data`} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={submitting} className="seal-button px-7 py-2.5 text-sm font-semibold rounded-sm disabled:opacity-50">
                {submitting ? "Updating…" : "Update Entry"}
              </button>
              <Link href="/" className="text-sm font-medium text-[var(--ink-dim)] transition-colors hover:text-white">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}