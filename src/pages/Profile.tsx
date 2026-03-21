import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Mail, Lock, MapPin, LogOut, Camera, Loader2 } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "KE",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
          country: data.country || "KE",
        });
      }
    } catch (err: any) {
      toast.error("Error loading profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          address_line1: profile.address_line1,
          address_line2: profile.address_line2,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
          country: profile.country,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Address updated successfully");
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });
      if (error) throw error;
      toast.success("Password updated successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error("Password update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Profile picture updated");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar info */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-accent/20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-muted text-2xl font-bold">
                    {profile.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1.5 bg-accent text-accent-foreground rounded-full cursor-pointer shadow-lg hover:bg-accent/90 transition-colors">
                  <Camera size={14} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
                </label>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                {profile.full_name || "New User"}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              
              <div className="w-full border-t border-border my-6"></div>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs content */}
        <div className="flex-1 w-full">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="general"><User size={16} className="mr-2 hidden sm:inline" />General</TabsTrigger>
              <TabsTrigger value="address"><MapPin size={16} className="mr-2 hidden sm:inline" />Address</TabsTrigger>
              <TabsTrigger value="security"><Lock size={16} className="mr-2 hidden sm:inline" />Security</TabsTrigger>
              <TabsTrigger value="account"><Mail size={16} className="mr-2 hidden sm:inline" />Account</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your basic account details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input 
                        id="full_name" 
                        value={profile.full_name} 
                        onChange={e => setProfile({...profile, full_name: e.target.value})}
                        disabled={saving}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profile.phone} 
                        onChange={e => setProfile({...profile, phone: e.target.value})}
                        placeholder="+254 700 000 000"
                        disabled={saving}
                      />
                    </div>
                    <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground">
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Manage your default delivery location.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateAddress} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="address1">Address Line 1</Label>
                      <Input 
                        id="address1" 
                        value={profile.address_line1} 
                        onChange={e => setProfile({...profile, address_line1: e.target.value})}
                        disabled={saving}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                      <Input 
                        id="address2" 
                        value={profile.address_line2} 
                        onChange={e => setProfile({...profile, address_line2: e.target.value})}
                        disabled={saving}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          value={profile.city} 
                          onChange={e => setProfile({...profile, city: e.target.value})}
                          disabled={saving}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="state">State / Province</Label>
                        <Input 
                          id="state" 
                          value={profile.state} 
                          onChange={e => setProfile({...profile, state: e.target.value})}
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="zip">ZIP / Postal Code</Label>
                        <Input 
                          id="zip" 
                          value={profile.zip_code} 
                          onChange={e => setProfile({...profile, zip_code: e.target.value})}
                          disabled={saving}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input 
                          id="country" 
                          value={profile.country} 
                          onChange={e => setProfile({...profile, country: e.target.value})}
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground">
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Address
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Password Management</CardTitle>
                  <CardDescription>Change your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input 
                        id="new_password" 
                        type="password"
                        value={passwords.new}
                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                        disabled={saving}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input 
                        id="confirm_password" 
                        type="password"
                        value={passwords.confirm}
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                        disabled={saving}
                      />
                    </div>
                    <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground">
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Change Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                  <CardDescription>Manage your primary account identifier.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2 opacity-70">
                    <Label>Email Address</Label>
                    <Input value={user?.email} disabled />
                    <p className="text-xs text-muted-foreground">Contact support to change your primary account email.</p>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
                    <p className="text-xs text-muted-foreground mb-4">Sign out of your account on this device.</p>
                    <Button 
                      variant="destructive" 
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
