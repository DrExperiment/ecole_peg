"use client";

import Link from "next/link";
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
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
}

export default function EnseignantsPage() {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);

  useEffect(() => {
    async function fetchEnseignants() {
      try {
        const reponse = await axios.get(
          "http://localhost:8000/api/cours/enseignants/",
        );

        setEnseignants(reponse.data.enseignants); // c'est ici que sont vraiment les enseignants
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchEnseignants();
  }, []);

  async function supprimerEnseignant(id_enseignant: number) {
    try {
      await axios.delete(
        `http://localhost:8000/api/cours/enseignants/${id_enseignant}/`,
      );

      setEnseignants((enseignantsPrec) =>
        enseignantsPrec.filter((enseignant) => enseignant.id !== id_enseignant),
      );
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Enseignants</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les enseignants de l&apos;école
          </p>
        </div>
        <Button asChild>
          <Link href="/ecole_peg/enseignants/enseignant">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau enseignant
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des enseignants</CardTitle>
          <CardDescription>Vue d&apos;ensemble du corps enseignant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Nom</TableHead>
                  <TableHead className="font-medium">Prénom</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enseignants.length > 0 ? (
                  enseignants.map((enseignant) => (
                    <TableRow key={enseignant.id}>
                      <TableCell className="font-medium">
                        {enseignant.nom}
                      </TableCell>
                      <TableCell>{enseignant.prenom}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/ecole_peg/enseignants/enseignant/${enseignant.id}`}>
                            Détails
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => supprimerEnseignant(enseignant.id)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Aucun enseignant trouvé.
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
