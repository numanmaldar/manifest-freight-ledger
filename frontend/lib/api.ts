export type FreightRate = {
  id: number;
  origin_port: string;
  destination_port: string;
  carrier: string;
  container_type: string;
  rate: number;
  currency: string;
  valid_date: string;
};

export type FreightRateInput = Omit<FreightRate, "id">;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function getRates(): Promise<FreightRate[]> {
  const res = await fetch(`${API_BASE}/rates`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load rates");
  return res.json();
}

export async function createRate(input: FreightRateInput): Promise<FreightRate> {
  const res = await fetch(`${API_BASE}/rates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create rate");
  return res.json();
}
