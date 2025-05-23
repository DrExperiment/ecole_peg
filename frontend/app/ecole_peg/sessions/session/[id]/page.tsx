"use client";

import Link from "next/link";
import { Button } from "@/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import {
  ArrowLeft,
  Calendar,
  Users,
  Bookmark,
} from "lucide-react";
import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";

interface Session {
  id: number;
  cours__nom: string;
  type: string;
  cours__niveau: string;
  nom_enseignant: string;
  prenom_enseignant: string;
  date_debut: string;
  date_fin: string;
  capacite_max: number;
  statut: string;
  periode_journee?: string;
  seances_mois?: number;
}

interface FichePresence {
  id: number;
  mois: string;
  annee: number;
}

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [session, setSession] = useState<Session>();
  const [fiches, setFiches] = useState<FichePresence[]>([]);

  useEffect(() => {
    async function fetchFiches() {
      try {
        const response = await axios.get<FichePresence[]>(
          `http://localhost:8000/api/cours/session/${resolvedParams.id}/fiches_presences/`,
        );
        setFiches(response.data);
      } catch (erreur) {
        console.error("Erreur lors du chargement des fiches :", erreur);
      }
    }
    fetchFiches();
  }, [resolvedParams.id]);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/cours/sessions/${resolvedParams.id}`,
        );
        setSession(response.data);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    fetchSession();
  }, [resolvedParams.id]);

  async function supprimerSession(id_session: number | undefined) {
    if (!id_session) return;
    try {
      await axios.delete(
        `http://localhost:8000/api/cours/sessions/${id_session}/`,
      );
      router.push("/ecole_peg/sessions");
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }

  async function supprimerFiche(id_fiche: number) {
    try {
      await axios.delete(
        `http://localhost:8000/api/cours/fiche_presences/${id_fiche}/`,
      );
      setFiches((prev) => prev.filter((f) => f.id !== id_fiche));
    } catch (erreur) {
      console.error("Erreur suppression fiche :", erreur);
      alert("Impossible de supprimer la fiche, réessayez.");
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return format(date, "d MMMM yyyy", { locale: fr });
    } catch {
      return "-";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Retourner à la page précédente"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {session?.cours__nom}
          </h1>
          <p className="text-muted-foreground">
            {session?.type === "I" ? "Intensif" : "Semi-intensif"} - Niveau{" "}
            {session?.cours__niveau}
          </p>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-card">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="fiche">Fiche de présences</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Détails de la session</CardTitle>
                  <CardDescription>
                    Informations sur la session en cours
                  </CardDescription>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    session?.statut === "O"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {session?.statut === "O"
                    ? "Session ouverte"
                    : "Session fermée"}
                </span>
              </div>
            </CardHeader>

           <CardContent className="p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Période</p>
          <p className="text-sm">
            {session?.date_debut && session?.date_fin ? (
              <>
                Du {formatDate(session.date_debut)} au {formatDate(session.date_fin)}
              </>
            ) : (
              "Dates non définies"
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Bookmark className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Type</p>
          <p className="text-sm">
            {session?.type === "I" ? "Intensif" : "Semi-intensif"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Capacité max</p>
          <p className="text-sm">{session?.capacite_max ?? "-"}</p>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Bookmark className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Niveau</p>
          <p className="text-sm">{session?.cours__niveau}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Période journée</p>
          <p className="text-sm">
            {session?.periode_journee === "M"
              ? "Matin"
              : session?.periode_journee === "S"
              ? "Soir"
              : "-"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Bookmark className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Séances par mois</p>
          <p className="text-sm">{session?.seances_mois ?? "-"}</p>
        </div>
      </div>
    </div>
  </div>
</CardContent>


            <CardFooter className="justify-end border-t px-6 py-4 bg-muted/50 space-x-2">
              <Button variant="outline" asChild>
                <Link
                  href={`/ecole_peg/sessions/session/${resolvedParams.id}/modifier`}
                >
                  Modifier
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => supprimerSession(Number(resolvedParams.id))}
              >
                Supprimer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="fiche">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Fiche de présences</CardTitle>
              <CardDescription>
                Gestion des fiches de présences pour cette session
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Mois</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fiches.length > 0 ? (
                    fiches.map((fiche) => (
                      <TableRow key={fiche.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          #{fiche.id}
                        </TableCell>
                        <TableCell>{fiche.mois}</TableCell>
                        <TableCell>{fiche.annee}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`${resolvedParams.id}/fiche/${fiche.id}`}
                            >
                              Consulter
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => supprimerFiche(fiche.id)}
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Aucune fiche de présence trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4 bg-muted/50">
              <Button variant="default" asChild>
                <Link
                  href={`/ecole_peg/sessions/session/${resolvedParams.id}/fiche`}
                >
                  Nouvelle fiche de présence
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
