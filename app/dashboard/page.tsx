// app/dashboard/page.tsx

import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getBaseUrl() {
  // 1) Prefer your canonical URL
  const envUrl = process.env.NEXTAUTH_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  // 2) Fall back to incoming request headers (works on Railway/proxies)
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${proto}://${host}`.replace(/\/+$/, "");

  // 3) Absolute last resort: dev only
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";

  return null;
}

async function getDashboardData() {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "Unable to determine base URL. Set NEXTAUTH_URL in Railway or ensure proxy headers are forwarded."
    );
  }

  const url = `${baseUrl}/api/dashboard`;

  // Helps you verify what prod is actually trying to reach.
  console.log(`[dashboard] fetch -> ${url}`);

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Failed to load dashboard data: ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ""}`
    );
  }

  return res.json();
}

export default async function Page() {
  try {
    const data = await getDashboardData();

    return (
      <main style={{ padding: 16 }}>
        <h1>Dashboard</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </main>
    );
  } catch (err: any) {
    const msg = err?.message ? String(err.message) : String(err);

    return (
      <main style={{ padding: 16 }}>
        <h1>Dashboard</h1>
        <p style={{ marginTop: 12 }}>
          Server-side error loading dashboard data.
        </p>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {msg}
        </pre>
        <p style={{ marginTop: 12 }}>
          Check Railway logs for <code>[dashboard] fetch -&gt;</code> to see the target URL.
        </p>
      </main>
    );
  }
}