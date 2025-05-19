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
        const reponse = await axios.get("http://localhost:8000/api/cours/cours/");
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cours</h1>
          <p className="text-muted-foreground">
            Gérez les cours de l&apos;école
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/ecole_peg/cours/cours">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau cours
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cours</CardTitle>
          <CardDescription>Tous les cours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
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
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Tarif</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                          {cours.heures_par_semaine} heures par semaine -{" "}
                          {cours.duree_semaines} semaines
                        </TableCell>
                        <TableCell>{cours.tarif} CHF</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="ml-2">
                            <Link href={`/ecole_peg/cours/cours/${cours.id}`}>
                              Modifier
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
                      <TableCell colSpan={7} className="text-center">
                        Aucun cours trouvé.
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
