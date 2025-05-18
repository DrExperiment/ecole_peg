"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { Users, BookOpen, UserPlus, Cake, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import Link from "next/link";

interface Anniversaire {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: Date;
  age: number;
}

interface StatsTableauBord {
  factures: { nombre_factures_impayees: number };
  cours: {
    total_cours: number;
    sessions_actives: number;
    cours_prives_programmes: number;
    sessions_ouvertes: string[];
  };
  eleves: {
    total_eleves: number;
    eleves_actifs: number;
    repartition_niveaux: string[];
  };
  anniversaires: Anniversaire[];
}

export default function TableauBordPage() {
  const [stats, setStats] = useState<StatsTableauBord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const [anniversaires, setAnniversaires] = useState<Anniversaire[]>([]);
  const [loadingAnniv, setLoadingAnniv] = useState<boolean>(true);
  const [erreurAnniv, setErreurAnniv] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErreur(null);

    Promise.all([
      axios.get<StatsTableauBord>(
        "http://localhost:8000/api/eleves/statistiques/dashboard/"
      ),
      axios.get<Anniversaire[]>(
        "http://localhost:8000/api/eleves/anniversaires/"
      ),
    ])
      .then(([resStats, resAnniv]) => {
        setStats(resStats.data);

        const parsed = resAnniv.data.map((anniv) => ({
          ...anniv,
          date_naissance: new Date(anniv.date_naissance),
        }));

        setAnniversaires(parsed);
      })
      .catch((erreur) => {
        console.error(erreur);

        setErreur(erreur instanceof Error ? erreur.message : "Erreur réseau");

        setErreurAnniv(
          erreur instanceof Error ? erreur.message : "Erreur réseau"
        );
      })
      .finally(() => {
        setLoading(false);
        setLoadingAnniv(false);
      });
  }, []);

  if (loading) return <p>Chargement des statistiques...</p>;
  if (erreur) return <p className="text-destructive">Erreur: {erreur}</p>;
  if (!stats) return <p>Aucune donnée disponible.</p>;

  const {
    factures,
    cours: {
      total_cours,
      sessions_actives,
      cours_prives_programmes,
      sessions_ouvertes,
    },
    eleves: { total_eleves, eleves_actifs },
  } = stats;

  const moisCourant = format(new Date(), "MMMM yyyy", { locale: fr });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue dans le système de gestion de l&apos;École PEG
        </p>
      </div>

      <Tabs defaultValue="apercu" className="space-y-4">
        <TabsList>
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="alertes">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="apercu" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Élèves actifs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eleves_actifs}</div>
                <p className="text-xs text-muted-foreground">
                  / {total_eleves} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Cours privés planifiés
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cours_prives_programmes}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Nombre total de cours
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total_cours}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Sessions actives
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions_actives}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Factures impayées
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {factures.nombre_factures_impayees}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Sessions ouvertes</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions_ouvertes.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {sessions_ouvertes.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucune session ouverte.</p>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cake className="mr-2 h-5 w-5 text-primary" />
                  Anniversaires du mois
                </CardTitle>
                <CardDescription className="capitalize">
                  {moisCourant}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnniv ? (
                  <p>Chargement des anniversaires…</p>
                ) : erreurAnniv ? (
                  <p className="text-destructive">Erreur: {erreurAnniv}</p>
                ) : anniversaires.length === 0 ? (
                  <p>Aucun anniversaire ce mois-ci.</p>
                ) : (
                  <div className="space-y-4">
                    {anniversaires.map((anniv) => (
                      <div key={anniv.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            <Link
                              href={`/ecole_peg/eleves/eleve/${anniv.id}/`}
                              className="hover:underline"
                            >
                              {anniv.nom} {anniv.prenom}
                            </Link>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(anniv.date_naissance, "dd-MM-yyyy")} (
                            {anniv.age} ans)
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          {format(anniv.date_naissance, "dd")}{" "}
                          {format(anniv.date_naissance, "MMMM", {
                            locale: fr,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alertes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes système</CardTitle>
              <CardDescription>
                Notifications importantes nécessitant votre attention
              </CardDescription>
            </CardHeader>
            <CardContent>{/* ... copy your alert alerts ... */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
