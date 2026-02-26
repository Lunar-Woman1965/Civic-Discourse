
// app/dashboard/page.tsx

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const res = await fetch("http://localhost:3000/api/dashboard", {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to load dashboard data");
  return res.json();
}

export default async function Page() {
  const data = await getDashboardData();

  return (
    <main style={{ padding: 16 }}>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}

