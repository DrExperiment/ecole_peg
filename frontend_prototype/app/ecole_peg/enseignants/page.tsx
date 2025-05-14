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
import { fetchApi } from "@/lib/utils";
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
        const reponse = await axios.get("http://localhost:8000/api/cours/enseignants/");

        setEnseignants(reponse.data); // c'est ici que sont vraiment les enseignants
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchEnseignants();
  }, []);

  async function supprimerEnseignant(id_enseignant: number) {
    try {
      await axios.delete(`http://localhost:8000/api/cours/enseignant/${id_enseignant}/`);

      setEnseignants((enseignantsPrec) =>
        enseignantsPrec.filter((enseignant) => enseignant.id !== id_enseignant)
      );
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enseignants</h1>
          <p className="text-muted-foreground">
            Gérez les enseignants de l&apos;école
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/ecole_peg/enseignants/enseignant">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau enseignant
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enseignants</CardTitle>
          <CardDescription>Tous les enseignants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
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
                      <TableCell colSpan={7} className="text-center">
                        Aucun enseignant trouvé.
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
