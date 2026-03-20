import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null; role: string | null }>;
  signUp: (email: string, password: string, full_name?: string, shop_description?: string) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signIn: async () => ({ error: null, role: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function mapUser(u: User): AuthUser {
  return {
    id: u.id,
    email: u.email ?? "",
    full_name: u.user_metadata?.full_name ?? "",
    avatar_url: u.user_metadata?.avatar_url ?? "",
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | null>(localStorage.getItem("user_role"));
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      const r = data?.role ?? "authenticated";
      setRole(r);
      localStorage.setItem("user_role", r);
      return r;
    } catch (e) {
      console.error("Error fetching role:", e);
      return role ?? "authenticated";
    }
  }, [role]);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const newUser = mapUser(session.user);
          setUser(newUser);
          // Fetch role in background if we don't have a session user or if user changed
          fetchRole(session.user.id);
        } else {
          setUser(null);
          setRole(null);
          localStorage.removeItem("user_role");
        }
        setLoading(false);
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapUser(session.user));
        fetchRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: { message: error.message }, role: null };
    
    // Explicitly fetch role for immediate redirection in components
    const role = await fetchRole(data.user.id);
    return { error: null, role };
  };

  const signUp = async (email: string, password: string, full_name?: string, _shop_description?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: full_name ?? "" } },
    });
    if (error) return { error: { message: error.message } };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    localStorage.removeItem("user_role");
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
