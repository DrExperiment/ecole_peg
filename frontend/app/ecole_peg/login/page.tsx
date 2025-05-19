"use client";

import { useState, useEffect, useContext, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { login, est_authentifie } from "@/lib/auth";
import { AuthContext } from "@/contexts/AuthContext";

export default function Login() {
  const [mot_de_passe, setMotDePasse] = useState<string>("");
  const [erreur, setErreur] = useState<string>("");

  const router = useRouter();
  const { setAuthentifie } = useContext(AuthContext);

  useEffect(() => {
    est_authentifie().then((ok) => ok && router.replace("/ecole_peg/tableau_bord/"));
  }, [router]);

  async function handleSoumission(e: FormEvent) {
    e.preventDefault();

    try {
      await login(mot_de_passe);

      setAuthentifie(true);

      router.push("/ecole_peg/tableau_bord/");
    } catch {
      setErreur("Mot de passe incorrect");
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Connectez-vous au système
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSoumission}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              type="password"
              value={mot_de_passe}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Entrez le mot de passe"
              className="appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:z-10 sm:text-sm"
            />
          </div>
          {erreur && <p className="text-red-500 text-sm text-center">{erreur}</p>}
          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Se connecter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
