import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // 1️⃣ Sign in via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !authData.user) {
        toast.error(authError?.message || "Login failed");
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch user role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching role:", roleError);
      }

      // 3️⃣ Redirect based on role
      const userRole = roleData?.role;
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
        toast.success("Welcome back Admin!");
      } else {
        navigate(from, { replace: true });
        toast.success("Welcome back!");
      }

    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="font-body text-muted-foreground">Sign in to your DASHING account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="font-body text-sm font-medium text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5"
            />
            {errors.email && <p className="font-body text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-body text-sm font-medium text-foreground">Password</Label>
              <Link to="/forgot-password" className="font-body text-xs text-accent hover:underline">Forgot password?</Link>
            </div>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="font-body text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold uppercase tracking-wide"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <p className="text-center font-body text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/register" state={{ from }} className="text-accent hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;