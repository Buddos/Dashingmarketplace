import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Copy, Search, RefreshCw, Loader2, Image as ImageIcon, ExternalLink } from "lucide-react";

interface Asset {
  name: string;
  url: string;
  created_at: string;
  size: number;
}

export default function AdminAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("products")
        .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

      if (error) throw error;

      const assetsWithUrls = data.map((file) => ({
        name: file.name,
        created_at: file.created_at,
        size: file.metadata.size,
        url: supabase.storage.from("products").getPublicUrl(file.name).data.publicUrl,
      }));

      setAssets(assetsWithUrls);
    } catch (err: any) {
      toast.error("Error fetching assets: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    setDeleting(name);
    try {
      const { error } = await supabase.storage.from("products").remove([name]);
      if (error) throw error;
      toast.success("Asset deleted successfully");
      setAssets(prev => prev.filter(a => a.name !== name));
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Asset Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all uploaded product images</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search assets..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchAssets} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading && assets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No assets found</p>
            <p className="text-sm">Try a different search or upload some products.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <Card key={asset.name} className="overflow-hidden group border-border/50 hover:border-accent/40 transition-colors">
              <div className="aspect-square relative bg-muted flex items-center justify-center">
                <img 
                  src={asset.url} 
                  alt={asset.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyUrl(asset.url)} title="Copy URL">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(asset.name)} disabled={deleting === asset.name} title="Delete">
                    {deleting === asset.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                  <a href={asset.url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="secondary" className="h-8 w-8" title="Open in new tab">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium truncate text-foreground mb-1" title={asset.name}>
                  {asset.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{(asset.size / 1024).toFixed(1)} KB</span>
                  <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
