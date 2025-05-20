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
        "http://localhost:8000/api/cours/cours_prive/"
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Cours Privés</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les cours privés de l&apos;école
          </p>
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
          <CardDescription>
            Vue d&apos;ensemble des cours particuliers planifiés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Horaire</TableHead>
                  <TableHead className="font-medium">Étudiant(s)</TableHead>
                  <TableHead className="font-medium">Professeur</TableHead>
                  <TableHead className="font-medium">Tarif</TableHead>
                  <TableHead className="font-medium">Lieu</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCours.length > 0 ? (
                  filteredCours.map((cours) => (
                    <TableRow key={cours.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(cours.date_cours_prive)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatTime(cours.heure_debut)} –{" "}
                        {formatTime(cours.heure_fin)}
                      </TableCell>
                      <TableCell>
                        {cours.eleves.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {cours.eleves.map((eleve, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700"
                              >
                                {eleve}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Aucun étudiant
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {cours.enseignant__nom} {cours.enseignant__prenom}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium">
                        {typeof cours.tarif === "number"
                          ? cours.tarif.toLocaleString("fr-CH")
                          : cours.tarif}{" "}
                        CHF
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-700">
                          {cours.lieu === "E"
                            ? "École"
                            : cours.lieu === "D"
                            ? "Domicile"
                            : cours.lieu}
                        </span>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Aucun cours privé trouvé.
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
