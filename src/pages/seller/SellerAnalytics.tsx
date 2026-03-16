import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SellerAnalytics() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  // Group revenue by month
  const revenueByMonth = orders.reduce((acc: Record<string, number>, o) => {
    const month = new Date(o.created_at).toLocaleString("default", { month: "short", year: "numeric" });
    acc[month] = (acc[month] || 0) + Number(o.total ?? 0);
    return acc;
  }, {});

  const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })).slice(-6);

  const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const completedOrders = orders.filter(o => o.status === "delivered").length;
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Your store performance overview</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}` },
          { label: "Total Orders", value: orders.length },
          { label: "Avg. Order Value", value: `KES ${avgOrderValue.toFixed(0)}` },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{loading ? "—" : s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Over Time */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base font-semibold">Revenue Over Time</CardTitle></CardHeader>
        <CardContent>
          {revenueData.length === 0 ? <p className="text-muted-foreground text-sm py-4 text-center">No data yet</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `KES ${Number(v).toLocaleString()}`} />
                <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Orders by Status */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base font-semibold">Orders by Status</CardTitle></CardHeader>
        <CardContent>
          {statusData.length === 0 ? <p className="text-muted-foreground text-sm py-4 text-center">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
