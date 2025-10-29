"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Paiement {
  id: number;
  montant: number;
  date_paiement: string;
  mode_paiement: string;
  methode_paiement: string;
  eleve_nom?: string;
  eleve_prenom?: string;
}

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [numPage, setNumPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [chargement, setChargement] = useState<boolean>(false);
  const [mois, setMois] = useState<number | "">("");
  const [annee, setAnnee] = useState<number | "">(2025);

  const fetchPaiements = useCallback(async () => {
    try {
      setChargement(true);
      const params: { page: number; mois?: number; annee?: number } = { page: numPage };
      if (mois) params.mois = mois;
      if (annee) params.annee = annee;

      const response = await api.get("/paiements/", { params });
      setPaiements(response.data.paiements);
      setTotalPages(response.data.total_pages ?? 1);
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements :", error);
    } finally {
      setChargement(false);
    }
  }, [numPage, mois, annee]);

  useEffect(() => {
    fetchPaiements();
  }, [fetchPaiements]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
    } catch {
      return "-";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Paiements</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <select
              className="border rounded-md px-2 py-1"
              value={mois}
              onChange={(e) =>
                setMois(e.target.value ? parseInt(e.target.value) : "")
              }
            >
              <option value="">Tous les mois</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {format(new Date(2025, i, 1), "MMMM", { locale: fr })}
                </option>
              ))}
            </select>

            <Input
              type="number"
              className="w-[120px]"
              value={annee || ""}
              onChange={(e) =>
                setAnnee(e.target.value ? parseInt(e.target.value) : "")
              }
              placeholder="Année"
            />

            <Button variant="outline" onClick={() => fetchPaiements()}>
              Filtrer
            </Button>
          </div>

          {chargement ? (
            <div className="flex justify-center p-4">
              <div className="text-sm text-muted-foreground">
                Chargement...
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date paiement</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Méthode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paiements.length > 0 ? (
                    paiements.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.eleve_nom ?? "-"}</TableCell>
                        <TableCell>{p.eleve_prenom ?? "-"}</TableCell>
                        <TableCell>{p.montant.toFixed(2)} €</TableCell>
                        <TableCell>{formatDate(p.date_paiement)}</TableCell>
                        <TableCell>{p.mode_paiement ?? "-"}</TableCell>
                        <TableCell>{p.methode_paiement ?? "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Aucun paiement trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNumPage((p) => Math.max(p - 1, 1))}
              disabled={numPage === 1}
            >
              Précédent
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {numPage} sur {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setNumPage((p) => Math.min(p + 1, totalPages))}
              disabled={numPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
