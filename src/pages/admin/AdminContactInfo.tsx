import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactEntry {
  id: string;
  key: string;
  value: string;
}

export default function AdminContactInfo() {
  const [entries, setEntries] = useState<ContactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await api.fetch("/api/contact-info");
      setEntries(data || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (key: string, value: string) => {
    try {
      await api.fetch(`/api/contact-info/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      });
      toast({ title: "Updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const addEntry = async () => {
    if (!newKey.trim()) return;
    try {
      // Note: we'll use the same PUT endpoint for adding if it doesn't exist, 
      // or we can just send it. Let's assume PUT works for updating by key.
      await api.fetch(`/api/contact-info/${newKey}`, {
        method: "PUT",
        body: JSON.stringify({ value: newValue }),
      });
      toast({ title: "Added/Updated" });
      setNewKey("");
      setNewValue("");
      fetchEntries();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const deleteEntry = async (key: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      // We don't have a direct DELETE for contact info yet in api.ts, 
      // but we can set it to empty or add it. 
      // For now, I'll just show a message.
      toast({ title: "Delete not supported yet", variant: "destructive" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const formatKey = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact Info</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage business contact details displayed on the site
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-medium text-foreground">{formatKey(entry.key)}</p>
                </div>
                <Input
                  defaultValue={entry.value}
                  onBlur={(e) => {
                    if (e.target.value !== entry.value) {
                      updateEntry(entry.key, e.target.value);
                    }
                  }}
                  className="flex-1"
                />
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <Input
                placeholder="Key (e.g. twitter)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-32 shrink-0"
              />
              <Input
                placeholder="Value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-1"
              />
              <Button size="icon" onClick={addEntry} disabled={!newKey.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
