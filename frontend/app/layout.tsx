import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Manifest — Freight Rate Intelligence",
  description: "Real-time ocean freight rate intelligence platform. Track, analyze, and manage shipping rates across global routes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--hull-raised)",
              color: "var(--ink)",
              border: "1px solid var(--hairline)",
            },
          }}
        />
        <div className="min-h-screen flex flex-col relative">
          {/* Header */}
          <header
            className="sticky top-0 z-50 border-b"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              background: "rgba(5,10,18,0.85)",
              backdropFilter: "blur(24px) saturate(1.4)",
              WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            }}
          >
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-3 group">
                {/* Ship Logo */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, rgba(212,168,75,0.15) 0%, rgba(212,168,75,0.05) 100%)",
                    border: "1px solid rgba(212,168,75,0.2)",
                    boxShadow: "0 0 12px rgba(212,168,75,0.1)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4a84b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                    <path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>
                  </svg>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                    Manifest
                  </span>
                  <span className="text-xl font-bold" style={{ color: "var(--brass)", textShadow: "0 0 16px rgba(212,168,75,0.35)" }}>
                    .
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-6">
                <span className="hidden sm:block text-[11px] uppercase tracking-[0.3em] font-medium" style={{ color: "var(--ink-faint)" }}>
                  Freight Intelligence
                </span>
                <div className="w-px h-4 hidden sm:block" style={{ background: "var(--hairline)" }} />
                <div className="flex items-center gap-2">
                  <div className="glow-dot" />
                  <span className="text-[11px] font-medium" style={{ color: "var(--brass)" }}>Live</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 relative z-10">
            <div className="max-w-6xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>

          {/* Footer with anchor icon */}
          <footer className="border-t relative z-10" style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brass-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <circle cx="12" cy="5" r="3"/>
                  <line x1="12" y1="22" x2="12" y2="8"/>
                  <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
                </svg>
                <span className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
                  Built with Next.js & FastAPI
                </span>
              </div>
              <span className="text-[11px] font-medium" style={{ color: "var(--brass-dim)" }}>
                Ocean Freight Management
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}