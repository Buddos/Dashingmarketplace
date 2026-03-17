import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

const emptyForm = { name: "", slug: "", description: "", price: "", sale_price: "", stock_quantity: "0", image_url: "", badge: "" };

export default function SellerProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = () => {
    fetch("/api/products", { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); });
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setSelectedFile(null); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, slug: p.slug, description: p.description, price: String(p.price), sale_price: String(p.sale_price ?? ""), stock_quantity: String(p.stock_quantity), image_url: p.image_url ?? "", badge: p.badge ?? "" });
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setUploading(true);
    let finalImageUrl = form.image_url;

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('products') // Assuming 'products' bucket exists
        .upload(filePath, selectedFile);

      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);
      
      finalImageUrl = publicUrl;
    }

    const url = editing ? `/api/products/${editing.id}` : "/api/products";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ ...form, image_url: finalImageUrl, price: Number(form.price), sale_price: form.sale_price ? Number(form.sale_price) : null, stock_quantity: Number(form.stock_quantity) }) });
    setUploading(false);
    if (!res.ok) { toast({ title: "Save failed", variant: "destructive" }); return; }
    toast({ title: editing ? "Product updated" : "Product created" });
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE", headers: authHeaders() });
    toast({ title: "Product deleted" });
    fetchProducts();
  };

  const field = (key: keyof typeof emptyForm, label: string, type = "text") => (
    <div key={key}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} listings</p>
        </div>
        <Button onClick={openNew} className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
          <PlusCircle size={16} className="mr-2" /> Add Product
        </Button>
      </div>

      {loading ? <p className="text-muted-foreground">Loading…</p>
        : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm mt-1">Click "Add Product" to list your first item.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(p => (
              <Card key={p.id} className="border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Stock: {p.stock_quantity} · KES {Number(p.price).toLocaleString()}</p>
                  </div>
                  {p.badge && <Badge variant="outline" className="text-xs">{p.badge}</Badge>}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil size={16} /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {field("name", "Name")}
            {field("slug", "Slug (URL-safe name)")}
            {field("description", "Description")}
            <div className="grid grid-cols-2 gap-3">
              {field("price", "Price (KES)", "number")}
              {field("sale_price", "Sale Price (KES)", "number")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("stock_quantity", "Stock", "number")}
              {field("badge", "Badge (optional)")}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Product Image</label>
              <div className="mt-1 flex items-center gap-3">
                {(selectedFile || form.image_url) && (
                  <img src={selectedFile ? URL.createObjectURL(selectedFile) : form.image_url} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-border" />
                )}
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-2 pb-2">
                      <Upload size={16} className="text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Click to upload image</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={uploading} className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
                {uploading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
