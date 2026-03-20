<<<<<<< HEAD
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Store } from "lucide-react";
import { toast } from "sonner";
=======
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Store } from "lucide-react";
>>>>>>> f71440a929a942c16f6e3ce4c66fa2867c1b5194

export default function SellerLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error: err, role } = await signIn(email, password);
    
    if (err) { 
      setError(err.message ?? "Login failed"); 
      setLoading(false); 
      return; 
    }

    if (role !== "seller") {
      setError("This account does not have seller privileges. Please log in through the main portal.");
      setLoading(false);
      // Optional: signOut() here if we want to enforce strict role-based login entry points
      return;
    }

    toast.success("Welcome back to your Seller Dashboard!");
    setLoading(false);
=======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err.message ?? "Login failed"); return; }
>>>>>>> f71440a929a942c16f6e3ce4c66fa2867c1b5194
    navigate("/seller");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-emerald-600 items-center justify-center mb-4">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Seller Login</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your seller account</p>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full mt-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full mt-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have a seller account?{" "}
          <Link to="/seller/register" className="text-emerald-600 hover:underline font-medium">Register</Link>
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          <Link to="/" className="hover:underline">← Back to Store</Link>
        </p>
      </div>
    </div>
  );
}
