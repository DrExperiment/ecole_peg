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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface Cours {
  id: number;
  nom: string;
  type: string;
  niveau: string;
  heures_par_semaine: number;
  duree_semaines: number;
  tarif: number;
}

export default function CoursPage() {
  const [cours, setCours] = useState<Cours[]>([]);
  const [filtreType, setFiltreType] = useState("tous");
  const [filtreNiveau, setFiltreNiveau] = useState("tous");

  useEffect(() => {
    async function fetchCours() {
      try {
        const reponse = await axios.get(
          "http://localhost:8000/api/cours/cours/"
        );
        setCours(reponse.data);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    fetchCours();
  }, []);

  async function supprimerCours(id_cours: number) {
    try {
      await axios.delete(`http://localhost:8000/api/cours/cours/${id_cours}/`);
      setCours((coursPrec) =>
        coursPrec.filter((cours) => cours.id !== id_cours)
      );
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }

  // Filtrage côté front
  const coursFiltres = cours.filter((c) => {
    const typeOk = filtreType === "tous" || c.type === filtreType;
    const niveauOk = filtreNiveau === "tous" || c.niveau === filtreNiveau;
    return typeOk && niveauOk;
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Cours</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les cours de l&apos;école
          </p>
        </div>
        <Button asChild>
          <Link href="/ecole_peg/cours/cours">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau cours
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des cours</CardTitle>
          <CardDescription>Vue d&apos;ensemble des cours disponibles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={filtreNiveau} onValueChange={setFiltreNiveau}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les niveaux</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtreType} onValueChange={setFiltreType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="I">Intensif</SelectItem>
                <SelectItem value="S">Semi-intensif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Nom</TableHead>
                  <TableHead className="font-medium">Type</TableHead>
                  <TableHead className="font-medium">Niveau</TableHead>
                  <TableHead className="font-medium">Durée</TableHead>
                  <TableHead className="font-medium">Tarif</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coursFiltres.length > 0 ? (
                  coursFiltres.map((cours) => (
                    <TableRow key={cours.id}>
                      <TableCell className="font-medium">
                        {cours.nom}
                      </TableCell>
                      <TableCell>
                        {cours.type === "I" ? "Intensif" : "Semi-intensif"}
                      </TableCell>
                      <TableCell>{cours.niveau}</TableCell>
                      <TableCell>
                        {cours.heures_par_semaine}h/semaine · {cours.duree_semaines} semaines
                      </TableCell>
                      <TableCell>{cours.tarif} CHF</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/ecole_peg/cours/cours/${cours.id}`}>
                            Détails
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => supprimerCours(cours.id)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Aucun cours trouvé.
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
