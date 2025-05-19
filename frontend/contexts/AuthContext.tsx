import { createContext, useState, useEffect, ReactNode } from "react";
import { est_authentifie } from "@/lib/auth";

interface TypeAuthContext {
  authentifie: boolean;
  setAuthentifie: (value: boolean) => void;
}

export const AuthContext = createContext<TypeAuthContext>({
  authentifie: false,
  setAuthentifie: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authentifie, setAuthentifie] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    est_authentifie()
      .then((ok) => setAuthentifie(ok))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ authentifie, setAuthentifie }}>
      {children}
    </AuthContext.Provider>
  );
}
