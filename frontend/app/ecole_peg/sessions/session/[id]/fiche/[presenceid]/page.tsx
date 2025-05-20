"use client";

import { use, useState, useEffect } from "react";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

// Typages back-end
interface Eleve {
  id: number;
  nom: string;
  prenom: string;
}

interface PresenceOut {
  id: number;
  id_eleve: number;
  date_presence: string; // ISO date
  statut: "P" | "A";
}

interface FichePresencesOut {
  id: number;
  mois: string; // "01" à "12"
  annee: number;
  presences: PresenceOut[]; // ici 31 × #élèves instances
}

// Map 2D : eleveId → ( jour → PresenceOut )
type PresenceMap = Record<number, Record<number, PresenceOut>>;

export default function PresenceDetailPage({
  params,
}: {
  params: Promise<{ id: string; presenceid: string }>;
}) {
  const { id: sessionId, presenceid: ficheId } = use(params);

  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [fiche, setFiche] = useState<FichePresencesOut>();
  const [presenceMap, setPresenceMap] = useState<PresenceMap>({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        // 1️⃣ Charger les élèves
        const elevesRes = await axios.get<Eleve[]>(
          `http://localhost:8000/api/cours/session/${sessionId}/eleves/`,
        );
        setEleves(elevesRes.data);

        // 2️⃣ Charger la fiche + toutes les présences (31×#élèves)
        const ficheRes = await axios.get<FichePresencesOut>(
          `http://localhost:8000/api/cours/fiche_presences/${ficheId}/`,
        );
        setFiche(ficheRes.data);

        // 3️⃣ Construire la map jour→presence pour chaque élève
        const map2d: PresenceMap = {};
        ficheRes.data.presences.forEach((p) => {
          const jour = new Date(p.date_presence).getUTCDate();
          if (!map2d[p.id_eleve]) map2d[p.id_eleve] = {};
          map2d[p.id_eleve][jour] = p;
        });
        setPresenceMap(map2d);
      } catch (err) {
        console.error("Erreur chargement :", err);
        alert("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [sessionId, ficheId]);

  if (loading || !fiche) {
    return <div>Chargement…</div>;
  }

  // Génération des jours du mois (taille = 28–31)
  const monthIndex = parseInt(fiche.mois, 10) - 1;
  const lastDay = new Date(fiche.annee, monthIndex + 1, 0).getDate();
  const joursDuMois = Array.from({ length: lastDay }, (_, i) => i + 1);

  // Compte des présents pour un élève
  function totalPresences(eleveId: number) {
    return Object.values(presenceMap[eleveId] || {}).filter(
      (p) => p.statut === "P",
    ).length;
  }

  // Inverse uniquement le statut d'une instance existante
  function togglePresence(eleveId: number, jour: number) {
    setPresenceMap((prev) => {
      const next = { ...prev };
      const studentMap = { ...(next[eleveId] || {}) };
      const existing = studentMap[jour];

      if (!existing) {
        // ne devrait pas arriver si tu as bien 31 instances en base
        return prev;
      }

      // On inverse
      studentMap[jour] = {
        ...existing,
        statut: existing.statut === "P" ? "A" : "P",
      };
      next[eleveId] = studentMap;
      return next;
    });
  }

  // Enregistrement de TOUTES les présences (un bulk PUT)
  async function handleSave() {
    // 1) Aplatir toutes les instances
    const allPresences = Object.values(presenceMap).flatMap((byJour) =>
      Object.values(byJour),
    );

    // 2) Préparer le payload : uniquement {id, statut}
    const toUpdate = allPresences.map((p) => ({
      id: p.id,
      statut: p.statut === "P" ? "P" : "A",
    }));

    try {
      // 3) Bulk PUT
      await axios.put(
        `http://localhost:8000/api/cours/fiche_presences/${ficheId}/`,
        toUpdate,
      );
      alert("Mise à jour réussie ✅");

      // 4) Re-fetch pour resynchroniser la grille
      const { data } = await axios.get<FichePresencesOut>(
        `http://localhost:8000/api/cours/fiche_presences/${ficheId}/`,
      );
      const map2d: PresenceMap = {};
      data.presences.forEach((p) => {
        const jour = new Date(p.date_presence).getUTCDate();
        if (!map2d[p.id_eleve]) map2d[p.id_eleve] = {};
        map2d[p.id_eleve][jour] = p;
      });
      setPresenceMap(map2d);
    } catch (err) {
      console.error("Erreur save :", err);
      alert("Échec de l’enregistrement.");
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Retourner à la page précédente"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Fiche de présence
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(fiche.annee, monthIndex), "MMMM yyyy", {
                locale: fr,
              })}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} className="shadow-sm">
          <Save className="mr-2 h-4 w-4" /> Enregistrer
        </Button>
      </div>

      {loading ? (
        <Card className="w-full max-w-md mx-auto shadow-sm">
          <CardHeader>
            <CardTitle className="text-center">Chargement...</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Suivi des présences</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="w-[200px] bg-muted/50 left-0 sticky z-10">
                      Étudiant
                    </TableHead>
                    {joursDuMois.map((j) => (
                      <TableHead
                        key={j}
                        className="text-center p-2 min-w-[40px]"
                      >
                        {j}
                      </TableHead>
                    ))}
                    <TableHead className="text-right bg-muted/50 right-0 sticky z-10 min-w-[80px]">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eleves.map((etu) => (
                    <TableRow key={etu.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium bg-white/80 left-0 sticky z-10">
                        {etu.prenom} {etu.nom}
                      </TableCell>
                      {joursDuMois.map((j) => {
                        const p = presenceMap[etu.id]?.[j];
                        return (
                          <TableCell key={j} className="text-center p-0">
                            <button
                              className={`w-full h-10 transition duration-150 ${
                                p?.statut === "P"
                                  ? "bg-primary/10 hover:bg-primary/20 text-primary font-medium"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => togglePresence(etu.id, j)}
                            >
                              {p?.statut === "P" ? "✓" : "–"}
                            </button>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-medium bg-white/80 right-0 sticky z-10">
                        {totalPresences(etu.id)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
