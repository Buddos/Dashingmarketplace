import { useAuth } from "@/contexts/AuthContext";

export const useSellerCheck = () => {
  const { user, role, loading: authLoading } = useAuth();

  // For now, any admin can also be a seller, or we check for explicit 'seller' role if we add it.
  const isSeller = user !== null && (role === "admin" || role === "seller");

  return { isSeller, loading: authLoading };
};
