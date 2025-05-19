"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { FileText, Search } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

interface Facture {
  id: number;
  date_emission: Date;
  montant_total: number;
  montant_restant: number;
  eleve_nom: string;
  eleve_prenom: string;
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [rechercheId, setRechercheId] = useState("");

  useEffect(() => {
    async function fetchFactures() {
      try {
        const donnees: Facture[] = (await axios.get("http://localhost:8000/api/factures/factures/")).data;
        setFactures(donnees);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    fetchFactures();
  }, []);

  // Filtrage combiné statut + recherche id
  const facturesFiltrees = factures.filter((facture) => {
    const statutOK =
      filtreStatut === "tous"
        ? true
        : filtreStatut === "paye"
        ? facture.montant_restant === 0
        : facture.montant_restant !== 0;

    const rechercheOK =
      rechercheId.trim() === ""
        ? true
        : facture.id.toString().includes(rechercheId.trim());

    return statutOK && rechercheOK;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">Gérez les factures</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
          <CardDescription>
            Toutes les factures émises par l&apos;école
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher par ID de facture..."
                  className="pl-8"
                  value={rechercheId}
                  onChange={e => setRechercheId(e.target.value)}
                />
              </div>
              <Select value={filtreStatut} onValueChange={setFiltreStatut}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                  <SelectItem value="non-paye">Non payé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturesFiltrees.length > 0 ? (
                    facturesFiltrees.map((facture) => (
                      <TableRow key={facture.id}>
                        <TableCell>
                          {facture.date_emission
                            ? format(new Date(facture.date_emission), "dd-MM-yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {`${facture.eleve_nom} ${facture.eleve_prenom}`}
                        </TableCell>
                        <TableCell>{facture.montant_total} CHF</TableCell>
                        <TableCell>
                          {facture.montant_restant === 0 ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              Payé
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                              Non payé
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/ecole_peg/factures/facture/${facture.id}`}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Voir détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Aucune facture trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
