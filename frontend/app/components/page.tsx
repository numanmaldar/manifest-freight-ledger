"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FreightRate } from "@/lib/api";

const CONTAINER_TYPES = ["20GP", "40GP", "40HC", "45HC"];

function formatSerial(d: Date) {
  const y = d.getFullYear();
  const seq = String(d.getHours() * 60 + d.getMinutes()).padStart(4, "0");
  return `MF-${y}-${seq}`;
}

export default function EditRatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

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
    if (!id) return;

    const fetchRate = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/rates/${id}`);
        if (!res.ok) throw new Error("Rate not found");
        const data: FreightRate = await res.json();
        setForm({
          origin_port: data.origin_port,
          destination_port: data.destination_port,
          carrier: data.carrier,
          container_type: data.container_type,
          rate: String(data.rate),
          currency: data.currency,
          valid_date: data.valid_date,
        });
      } catch (error) {
        toast.error("Could not load rate data. It may have been deleted.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [id, router]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/rates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rate: parseFloat(form.rate) }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Rate updated successfully!");
      router.push("/");
      router.refresh(); // To show updated data on the main page
    } catch {
      toast.error("Could not save changes. Check the API and try again.");
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
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--sky)]" />
            <p className="text-[11px] uppercase tracking-[0.3em] font-medium text-[var(--sky)]">
              Edit Entry
            </p>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Update Rate</h1>
          <p className="mt-2 text-sm text-[var(--ink-dim)]">
            Modify the details for this freight rate.
          </p>
        </div>
        <div className="space-y-1 text-right font-mono-data text-xs text-[var(--ink-faint)]">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] uppercase tracking-wider">ID</span>
            <span className="text-[var(--ink-dim)]">{id}</span>
          </div>
          <div>{today}</div>
        </div>
      </div>

      <div className="manifest-card">
        <span className="corner-tl" />
        <span className="corner-tr" />
        <span className="corner-bl" />
        <span className="corner-br" />

        <div className="px-8 py-8">
          <form onSubmit={handleSubmit}>
            {/* This form structure is identical to new/page.tsx, just pre-filled */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
              <div><label className={`${label} mb-2 block text-[var(--ink-dim)]`}>Origin port</label><input required value={form.origin_port} onChange={(e) => update("origin_port", e.target.value)} className={field} /></div>
              <div><label className={`${label} mb-2 block text-[var(--ink-dim)]`}>Destination port</label><input required value={form.destination_port} onChange={(e) => update("destination_port", e.target.value)} className={field} /></div>
              <div><label className={`${label} mb-2 block text-[var(--ink-dim)]`}>Carrier</label><input required value={form.carrier} onChange={(e) => update("carrier", e.target.value)} className={field} /></div>
              <div><label className={`${label} mb-2 block text-[var(--ink-dim)]`}>Container type</label><select value={form.container_type} onChange={(e) => update("container_type", e.target.value)} className={`${field} cursor-pointer`}>{CONTAINER_TYPES.map((c) => (<option key={c} value={c} className="bg-[var(--hull-raised)] text-[var(--ink)]">{c}</option>))}</select></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5 mb-8">
              <div><label className={`${label} mb-2 block text-[var(--ink-dim)]`}>Valid date</label><input type="date" required value={form.valid_date} onChange={(e) => update("valid_date", e.target.value)} className={`${field} font-mono-data`} /></div>
              <div><label className={`${label} mb-2 block text-[var(--ink-dim)]`}>Rate</label><input type="number" step="0.01" required value={form.rate} onChange={(e) => update("rate", e.target.value)} className={`${field} font-mono-data`} /></div>
              <div><label className={`${label} mb-2 block text-[var(--ink-dim)]`}>Currency</label><input required value={form.currency} onChange={(e) => update("currency", e.target.value.toUpperCase())} maxLength={3} className={`${field} font-mono-data`} /></div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={submitting} className="seal-button px-7 py-2.5 text-sm font-semibold rounded-sm disabled:opacity-50">
                {submitting ? "Saving…" : "Update Entry"}
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