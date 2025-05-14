"use client";

import Link from "next/link";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { ArrowLeft } from "lucide-react";
import React, { use, useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Session {
  id: number;
  nom: string;
  type: string;
  niveau: string;
  nom_enseignant: string;
  prenom_enseignant: string;
  date_debut: string;
  date_fin: string;
  capacite_max: number;
  statut: string;
}

interface Seance {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
}

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const resolvedParams = use(params);

  const [session, setSession] = useState<Session>();

  const [seances, setSeances] = useState<Seance[]>([]);

  useEffect(() => {
    async function fetchSession() {
      try {
        const donnees: Session = await fetchApi(
          `/cours/session/${resolvedParams.id}`
        );

        setSession(donnees);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    async function fetchSeances() {
      try {
        const donnees: Seance[] = await fetchApi(
          `/cours/session/${resolvedParams.id}/seances`
        );

        setSeances(donnees);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchSession();
    fetchSeances();
  }, [resolvedParams.id]);

  async function supprimerSession(id_session: number | undefined) {
    if (!id_session) return;

    try {
      await fetchApi(`/cours/session/${id_session}/`, {
        method: "DELETE",
      });

      router.push("/ecole_peg/sessions");
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }

  async function supprimerSeance(id_seance: number) {
    try {
      await fetchApi(`/cours/seance/${id_seance}/`, {
        method: "DELETE",
      });

      setSeances((seancesPrec) =>
        seancesPrec.filter((seance) => seance.id !== id_seance)
      );
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }

  async function changerStatut() {
    if (!session) return;

    try {
      await fetchApi(`/cours/session/${session.id}/`, {
        method: "PATCH",
      });

      router.push("/ecole_peg/sessions/");
    } catch (erreur) {
      console.error("Erreur:", erreur);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ecole_peg/sessions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {session?.nom} {session?.type === "I" ? "Intensif" : "Semi-intensif"}{" "}
          {session?.niveau} (Du {session?.date_debut} à {session?.date_fin})
        </h1>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="seances">Séances</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
              <CardDescription>Détails de la session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p>{session?.nom}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p>{session?.type === "I" ? "Intensif" : "Semi-intensif"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Niveau
                </p>
                <p>{session?.niveau}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Période
                </p>
                <p>
                  Du {session?.date_debut} à {session?.date_fin}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Statut
                </p>
                <p>{session?.statut === "O" ? "Ouverte" : "Fermée"}</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4">
              <Button variant="outline" onClick={changerStatut}>
                Changer statut
              </Button>
              <Button
                variant="destructive"
                onClick={() => supprimerSession(session?.id)}
              >
                Supprimer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="seances">
          <Card>
            <CardHeader>
              <CardTitle>Séances</CardTitle>
              <CardDescription>Tous les séances de la session</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Heure de début</TableHead>
                    <TableHead>Heure de fin</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seances.length > 0 ? (
                    seances.map((seance) => (
                      <TableRow key={seance.id}>
                        <TableCell>{seance.date}</TableCell>
                        <TableCell>{seance.heure_debut}</TableCell>
                        <TableCell>{seance.heure_fin}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => supprimerSeance(seance.id)}
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Aucune séance trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
