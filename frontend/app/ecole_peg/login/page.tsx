"use client";

import { useState, useEffect, useContext, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { login, est_authentifie } from "@/lib/auth";
import { AuthContext } from "@/contexts/AuthContext";
import { Label } from "@/components/label";

export default function Login() {
  const [mot_de_passe, setMotDePasse] = useState<string>("");
  const [erreur, setErreur] = useState<string>("");

  const router = useRouter();
  const { setAuthentifie } = useContext(AuthContext);

  useEffect(() => {
    est_authentifie().then(
      (ok) => ok && router.replace("/ecole_peg/tableau_bord/"),
    );
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-6 text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-primary/10 rounded-xl rotate-6"></div>
            <div className="absolute inset-0 bg-primary/20 rounded-xl rotate-3"></div>
            <div className="relative bg-white rounded-xl shadow-2xl p-6">
              {/* You can add your logo here */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Bienvenue</h1>
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour accéder au système
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSoumission}
          className="space-y-4 bg-card rounded-lg border p-6 shadow-lg"
        >
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={mot_de_passe}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="w-full pr-10"
                  required
                  autoFocus
                  autoComplete="current-password"
                />
              </div>
            </div>
            {erreur && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 animate-shake">
                {erreur}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={!mot_de_passe}>
            {mot_de_passe ? "Se connecter" : "Entrez votre mot de passe"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>École PEG — Système de Gestion</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
