import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminCheck = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setIsAdmin(role === "admin");
      setLoading(false);
    }
  }, [user, role, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};
