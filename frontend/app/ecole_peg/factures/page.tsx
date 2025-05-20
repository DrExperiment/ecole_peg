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
        const donnees: Facture[] = (
          await axios.get("http://localhost:8000/api/factures/factures/")
        ).data;
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les factures de l&apos;école
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
          <CardDescription>Vue d&apos;ensemble des factures émises</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par ID de facture..."
                className="pl-8"
                value={rechercheId}
                onChange={(e) => setRechercheId(e.target.value)}
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
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Étudiant</TableHead>
                  <TableHead className="font-medium">Montant</TableHead>
                  <TableHead className="font-medium">Statut</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facturesFiltrees.length > 0 ? (
                  facturesFiltrees.map((facture) => (
                    <TableRow key={facture.id}>
                      <TableCell className="whitespace-nowrap">
                        {facture.date_emission
                          ? format(new Date(facture.date_emission), "dd MMM yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {`${facture.eleve_nom} ${facture.eleve_prenom}`}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{facture.montant_total.toLocaleString('fr-CH')} CHF</span>
                        {facture.montant_restant > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Restant: {facture.montant_restant.toLocaleString('fr-CH')} CHF
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {facture.montant_restant === 0 ? (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700">
                            Payé
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-50 text-red-700">
                            Non payé
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/ecole_peg/factures/facture/${facture.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Détails
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Aucune facture trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
