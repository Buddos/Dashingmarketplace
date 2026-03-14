import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "KE",
  });

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Lock size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <p className="font-body text-muted-foreground mb-6">
            Please sign in or create an account to complete your purchase
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" state={{ from: "/checkout" }} className="btn-gold inline-block">Sign In</Link>
            <Link to="/register" state={{ from: "/checkout" }} className="btn-outline-dark inline-block">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Nothing to Checkout</h1>
          <Link to="/shop" className="btn-gold inline-block mt-4">Start Shopping</Link>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= 1000 ? 0 : 250;
  const tax = subtotal * 0.16;
  const total = subtotal + shipping + tax;

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.state || !form.zip) {
      toast.error("Please fill in all shipping fields");
      return;
    }

    setLoading(true);
    try {
      // Create order with items in one go using our custom API
      await api.fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          subtotal,
          shipping,
          tax,
          total,
          shipping_name: form.name,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_state: form.state,
          shipping_zip: form.zip,
          shipping_country: form.country,
          items: items.map(item => ({
            product_id: item.productId,
            product_name: item.name,
            price: item.salePrice ?? item.price,
            quantity: item.quantity,
          })),
        }),
      });

      toast.success("Order placed successfully!");
      await clearCart();
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Shipping form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="font-body text-sm font-medium">Full Name</Label>
                <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="John Doe" className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <Label className="font-body text-sm font-medium">Address</Label>
                <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="123 Main St" className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body text-sm font-medium">City</Label>
                <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Nairobi" className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body text-sm font-medium">State/County</Label>
                <Input value={form.state} onChange={(e) => updateField("state", e.target.value)} placeholder="Nairobi" className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body text-sm font-medium">ZIP Code</Label>
                <Input value={form.zip} onChange={(e) => updateField("zip", e.target.value)} placeholder="00100" className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body text-sm font-medium">Country</Label>
                <Input value={form.country} onChange={(e) => updateField("country", e.target.value)} className="mt-1.5" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold uppercase tracking-wide h-12 mt-4">
              {loading ? <Loader2 size={18} className="animate-spin" /> : `Place Order — KES ${total.toFixed(2)}`}
            </Button>
          </form>

          {/* Order summary */}
          <div>
            <div className="border border-border rounded-sm p-6 bg-card sticky top-28">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <img src={item.imageUrl} alt={item.name} className="w-14 h-16 object-cover rounded-sm" />
                    <div className="flex-1">
                      <p className="font-body text-xs font-medium text-foreground line-clamp-1">{item.name}</p>
                      <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-body text-xs font-semibold text-foreground">KES {((item.salePrice ?? item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 font-body text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>KES {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `KES ${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>KES {tax.toFixed(2)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>KES {total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
