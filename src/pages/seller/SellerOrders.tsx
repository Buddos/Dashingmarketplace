import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    fetch("/api/orders", { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast({ title: "Error updating status", variant: "destructive" }); return; }
    toast({ title: `Order marked ${status}` });
    fetchOrders();
  };

  const viewDetails = async (order: any) => {
    setSelected(order);
    fetch(`/api/orders/${order.id}/items`, { headers: authHeaders() })
      .then(r => r.json()).then(setItems);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders</p>
      </div>

      {loading ? <p className="text-muted-foreground">Loading…</p>
        : orders.length === 0 ? <p className="text-center text-muted-foreground py-12">No orders yet</p>
        : (
          <div className="space-y-3">
            {orders.map(order => (
              <Card key={order.id} className="border-border/50 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => viewDetails(order)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">#{order.id?.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{order.shipping_name || "Customer"} · {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">KES {Number(order.total).toLocaleString()}</p>
                  <Select value={order.status} onValueChange={v => { updateStatus(order.id, v); }}>
                    <SelectTrigger className="w-32" onClick={e => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selected?.id?.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selected.shipping_name || "—"}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge variant="outline" className={statusColor[selected.status]}>{selected.status}</Badge></div>
                <div><p className="text-muted-foreground">Address</p><p className="text-xs">{[selected.shipping_address, selected.shipping_city, selected.shipping_state].filter(Boolean).join(", ") || "—"}</p></div>
                <div><p className="text-muted-foreground">Date</p><p>{new Date(selected.created_at).toLocaleString()}</p></div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium mb-2">Items</p>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1.5">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="text-muted-foreground">KES {(Number(item.price) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>KES {Number(selected.subtotal).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>KES {Number(selected.shipping).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>KES {Number(selected.tax).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>KES {Number(selected.total).toLocaleString()}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
