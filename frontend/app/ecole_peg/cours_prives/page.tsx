"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/card";
import { Plus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/table";

// votre interface
interface CoursPrive {
  id: number;
  date_cours_prive: string;
  heure_debut: string;
  heure_fin: string;
  tarif: number | string;
  lieu: string;

  // plus d'objet enseignant ici
  enseignant__nom: string;
  enseignant__prenom: string;

  // simple tableau de string
  eleves: string[];
}

export default function CoursPrivesPage() {
  const [filteredCours, setFilteredCours] = useState<CoursPrive[]>([]);

  useEffect(() => {
    axios
      .get<{ cours_prives: CoursPrive[] }>(
        "http://localhost:8000/api/cours/cours_prive/",
      )
      .then((res) => {
        const cours = res.data.cours_prives;
        setFilteredCours(cours);
      })

      .catch(console.error);
  }, []);

  // formateur de date sécurisé
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return "";
    return format(parsed, "dd/MM/yyyy", { locale: fr });
  };

  // formateur d'heure sécurisé
  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    // on crée une date ISO arbitraire pour l'heure
    const parsed = parseISO(`1970-01-01T${timeString}`);
    if (!isValid(parsed)) return "";
    return format(parsed, "HH:mm");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cours Privés</h1>
          <p className="text-muted-foreground">Gérez les cours privés</p>
        </div>
        <Button asChild>
          <Link href="/ecole_peg/cours_prives/cours_prive">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau cours privé
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des cours privés</CardTitle>
          <CardDescription>Tous les cours planifiés et passés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Professeur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCours.map((cours) => (
                  <TableRow key={cours.id}>
                    <TableCell>{formatDate(cours.date_cours_prive)}</TableCell>
                    <TableCell>
                      {formatTime(cours.heure_debut)} –{" "}
                      {formatTime(cours.heure_fin)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {cours.eleves.join(", ")}
                    </TableCell>
                    <TableCell>
                      {cours.enseignant__nom} {cours.enseignant__prenom}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/ecole_peg/cours_prives/cours_prive/${cours.id}`}
                        >
                          Détails
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
