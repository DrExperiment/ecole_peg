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

interface Session {
  id: number;
  cours__nom: string;
  cours__niveau: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  cours__type: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [taille] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filtres
  const [filtreType, setFiltreType] = useState("tous");
  const [filtreNiveau, setFiltreNiveau] = useState("tous");

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      try {
        const params: any = { page, taille };
        if (filtreType && filtreType !== "tous") params.type = filtreType;
        if (filtreNiveau && filtreNiveau !== "tous") params.niveau = filtreNiveau;
        const reponse = await axios.get("http://localhost:8000/api/cours/sessions/", { params });
        setSessions(reponse.data.sessions);
        setTotal(reponse.data.nombre_total);
      } catch (erreur) {
        setSessions([]);
        setTotal(0);
        console.error("Erreur: ", erreur);
      }
      setLoading(false);
    }
    fetchSessions();
    // Remise à la première page à chaque changement de filtre
  }, [page, taille, filtreType, filtreNiveau]);

  // Si on change les filtres, on repart de la page 1
  useEffect(() => {
    setPage(1);
  }, [filtreType, filtreNiveau]);

  const totalPages = Math.ceil(total / taille);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sessions
          </h1>
          <p className="text-muted-foreground">
            Gérez les sessions de l&apos;école
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/ecole_peg/sessions/session">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle session
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Toutes les sessions</CardDescription>
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
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Chargement…
                      </TableCell>
                    </TableRow>
                  ) : sessions.length > 0 ? (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {session.cours__nom}
                        </TableCell>
                        <TableCell>
                          {session.cours__type === "I" ? "Intensif" : "Semi-intensif"}
                        </TableCell>
                        <TableCell>{session.cours__niveau}</TableCell>
                        <TableCell>
                          Du {session.date_debut} à {session.date_fin}
                        </TableCell>
                        <TableCell>
                          {session.statut === "O" ? "Ouverte" : "Fermée"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/ecole_peg/sessions/session/${session.id}`}
                            >
                              Détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Aucune session trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-2">
              <span>
                Page {page} / {totalPages || 1} ({total} sessions)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
