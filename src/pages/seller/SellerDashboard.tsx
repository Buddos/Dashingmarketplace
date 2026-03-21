import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Package, ShoppingCart, TrendingUp, Star, ArrowRight, PlusCircle } from "lucide-react";
 
export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, reviews: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    Promise.all([
      api.fetch("/api/products").catch(() => []),
      api.fetch("/api/orders").catch(() => []),
    ]).then(([products, orders]) => {
      const sellerProducts = Array.isArray(products) ? products : [];
      const allOrders = Array.isArray(orders) ? orders : [];
      const revenue = allOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
      setStats({ products: sellerProducts.length, orders: allOrders.length, revenue, reviews: 0 });
      setRecentOrders(allOrders.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.email?.split("@")[0]}</p>
        </div>
        <Link
          to="/seller/products"
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <PlusCircle size={16} />
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats.products, icon: Package, color: "text-accent", bg: "bg-accent/10" },
          { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "text-accent", bg: "bg-accent/10" },
          { label: "Total Revenue", value: `KES ${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
          { label: "Reviews", value: stats.reviews, icon: Star, color: "text-accent", bg: "bg-accent/10" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{loading ? "—" : s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Link to="/seller/orders" className="text-sm text-accent hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm py-4 text-center">Loading…</p>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No orders yet. Share your store to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">#{order.id?.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{order.shipping_name || "Customer"} · {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">KES {Number(order.total).toLocaleString()}</span>
                    <Badge variant="outline" className={`text-xs ${statusColor[order.status] ?? ""}`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Manage Products", desc: "Add, edit or remove your listings", to: "/seller/products", icon: Package },
          { title: "Track Orders", desc: "Update order status and ship items", to: "/seller/orders", icon: ShoppingCart },
          { title: "View Analytics", desc: "See your sales performance", to: "/seller/analytics", icon: TrendingUp },
        ].map((card) => (
          <Link key={card.to} to={card.to} className="group">
            <Card className="border-border/50 hover:border-accent/50 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <card.icon className="h-5 w-5 text-accent" />
                </div>
                <p className="font-semibold text-foreground">{card.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
