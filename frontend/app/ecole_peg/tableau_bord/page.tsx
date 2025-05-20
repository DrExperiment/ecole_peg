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
import {
  Users,
  BookOpen,
  UserPlus,
  Cake,
  FileText,
  Bell,
  Home,
  Clock,
  UserMinus,
  PieChart,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import Link from "next/link";
import { AlertBox } from "@/components/alert";
import { Button } from "@/components/button";

interface Anniversaire {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  age: number;
}

interface SessionOuverte {
  date_debut: string;
  eleves_restants: number;
}

interface ElevePresenceInferieur {
  nom: string;
  prenom: string;
  date_naissance: string;
  taux_presence: number;
}

interface ElevePreinscription {
  nom: string;
  prenom: string;
  date_naissance: string;
}

type Niveau = "A1" | "A2" | "B1" | "B2" | "C1";

interface RepartitionNiveau {
  niveau: Niveau;
  total: number;
}

interface Stats {
  factures: {
    nombre_factures_impayees: number;
    montant_total_paiements_mois: number;
    montant_total_factures_impayees_mois: number;
  };
  cours: {
    total_cours: number;
    sessions_actives: number;
    cours_prives_programmes_mois: number;
    sessions_ouvertes: SessionOuverte[];
    nombre_enseignants: number;
  };
  eleves: {
    total_eleves: number;
    eleves_actifs: number;
    repartition_niveaux: RepartitionNiveau[];
    pays_plus_eleves: string | null;
    eleves_presence_inferieur_80: ElevePresenceInferieur[];
    eleves_preinscription_plus_3j: ElevePreinscription[];
  };
}

export default function TableauBordPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [anniversaires, setAnniversaires] = useState<Anniversaire[]>([]);
  const [tab, setTab] = useState<"apercu" | "alertes">("apercu");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get<Stats>(
        "http://localhost:8000/api/eleves/statistiques/dashboard/"
      ),
      axios.get<Anniversaire[]>(
        "http://localhost:8000/api/eleves/anniversaires/"
      ),
    ])
      .then(([s, a]) => {
        setStats(s.data);
        setAnniversaires(
          a.data.map((x) => ({
            ...x,
            date_naissance: new Date(x.date_naissance).toISOString(),
          }))
        );
      })
      .catch((e) => setError(e.message || "Erreur réseau"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    );

  if (error)
    return (
      <AlertBox
        variant="error"
        title="Impossible de charger les données"
        dismissible
        onDismiss={() => window.location.reload()}
      >
        <p className="mt-2 text-sm">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </AlertBox>
    );

  if (!stats) return <p>Aucune donnée disponible.</p>;

  const dateFmt = (s: string, fmt = "dd MMMM yyyy") =>
    format(new Date(s), fmt, { locale: fr });

  const aujourdHui = format(new Date(), "MMMM yyyy", { locale: fr });

  const factures_impayees = stats.factures.nombre_factures_impayees;
  const eleves_absence = stats.eleves.eleves_presence_inferieur_80.length;
  const eleves_preinscription =
    stats.eleves.eleves_preinscription_plus_3j.length;
  const nombreAlertes =
    (factures_impayees ? 1 : 0) +
    (eleves_absence ? 1 : 0) +
    (eleves_preinscription ? 1 : 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          Bienvenue dans le système de gestion de l&apos;École PEG
        </p>
      </div>

      <Tabs
        defaultValue={tab}
        value={tab}
        onValueChange={(v) => setTab(v as "apercu" | "alertes")}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="apercu" className="flex items-center">
            <Home className="mr-2 h-4 w-4" /> Aperçu
          </TabsTrigger>
          <TabsTrigger value="alertes" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" /> Alertes
            {nombreAlertes > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-700">
                {nombreAlertes}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apercu" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:bg-accent/5 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Élèves actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.eleves.eleves_actifs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  sur {stats.eleves.total_eleves} élèves au total
                </p>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/5 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cours.nombre_enseignants}</div>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/5 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total des cours</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cours.total_cours}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  dont {stats.cours.sessions_actives} sessions actives
                </p>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/5 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cours privés ce mois</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cours.cours_prives_programmes_mois}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Répartition des niveaux</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.eleves.repartition_niveaux.map((niveau) => {
                    const pourcentage = stats.eleves.eleves_actifs > 0
                      ? (niveau.total / stats.eleves.eleves_actifs) * 100
                      : 0;
                    return (
                      <div key={niveau.niveau} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Niveau {niveau.niveau}</span>
                          <span className="text-muted-foreground">
                            {niveau.total} ({pourcentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${pourcentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Finances du mois</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700">Montant reçu</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-green-700">
                        {stats.factures.montant_total_paiements_mois.toLocaleString('fr-CH')} CHF
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-700">Montant impayé</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-red-700">
                        {stats.factures.montant_total_factures_impayees_mois.toLocaleString('fr-CH')} CHF
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-muted-foreground">Pays principal</span>
                  <span className="font-medium">{stats.eleves.pays_plus_eleves || "Non défini"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Sessions ouvertes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stats.cours.sessions_ouvertes.length > 0 ? (
                  <div className="space-y-4">
                    {stats.cours.sessions_ouvertes.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">
                          {dateFmt(s.date_debut)}
                        </span>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                          {s.eleves_restants} places
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune session ouverte.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <Cake className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-medium">Anniversaires du mois</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground capitalize">{aujourdHui}</span>
              </CardHeader>
              <CardContent>
                {anniversaires.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun anniversaire ce mois-ci.</p>
                ) : (
                  <div className="space-y-4">
                    {anniversaires.map((anniv) => (
                      <div key={anniv.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Link
                            href={`/ecole_peg/eleves/eleve/${anniv.id}/`}
                            className="text-sm font-medium hover:underline"
                          >
                            {anniv.nom} {anniv.prenom}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(anniv.date_naissance), "dd-MM-yyyy")} ({anniv.age} ans)
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {format(new Date(anniv.date_naissance), "dd MMMM", { locale: fr })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alertes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertes système</CardTitle>
              <CardDescription>
                Notifications importantes nécessitant votre attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {factures_impayees > 0 && (
                <AlertBox
                  variant="error"
                  title="Factures impayées"
                  icon={<FileText className="h-5 w-5" />}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      {factures_impayees} facture{factures_impayees > 1 ? "s" : ""} en attente 
                      pour un montant de {stats.factures.montant_total_factures_impayees_mois.toLocaleString('fr-CH')} CHF
                    </p>
                    <span className="text-2xl font-bold">{factures_impayees}</span>
                  </div>
                </AlertBox>
              )}

              {eleves_absence > 0 && (
                <div className="space-y-4">
                  <AlertBox
                    variant="warning"
                    title="Faible taux de présence"
                    icon={<UserMinus className="h-5 w-5" />}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        {eleves_absence} élève{eleves_absence > 1 ? "s" : ""} avec présence &lt; 80%
                      </p>
                      <span className="text-2xl font-bold">{eleves_absence}</span>
                    </div>
                  </AlertBox>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Détails des présences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border">
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="px-4 py-2 text-left text-sm font-medium">Nom</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Prénom</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Naissance</th>
                              <th className="px-4 py-2 text-right text-sm font-medium">Présence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {stats.eleves.eleves_presence_inferieur_80.map((eleve, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2 text-sm">{eleve.nom}</td>
                                <td className="px-4 py-2 text-sm">{eleve.prenom}</td>
                                <td className="px-4 py-2 text-sm whitespace-nowrap">
                                  {dateFmt(eleve.date_naissance, "dd/MM/yyyy")}
                                </td>
                                <td className="px-4 py-2 text-sm text-right font-medium text-red-600">
                                  {eleve.taux_presence}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {eleves_preinscription > 0 && (
                <div className="space-y-4">
                  <AlertBox
                    variant="info"
                    title="Préinscriptions en attente"
                    icon={<Clock className="h-5 w-5" />}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        {eleves_preinscription} préinscription{eleves_preinscription > 1 ? "s" : ""} de plus de 3 jours
                      </p>
                      <span className="text-2xl font-bold">{eleves_preinscription}</span>
                    </div>
                  </AlertBox>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Liste des préinscriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border">
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="px-4 py-2 text-left text-sm font-medium">Nom</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Prénom</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Naissance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {stats.eleves.eleves_preinscription_plus_3j.map((eleve, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2 text-sm">{eleve.nom}</td>
                                <td className="px-4 py-2 text-sm">{eleve.prenom}</td>
                                <td className="px-4 py-2 text-sm whitespace-nowrap">
                                  {dateFmt(eleve.date_naissance, "dd/MM/yyyy")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {nombreAlertes === 0 && (
                <AlertBox variant="success" title="Système à jour">
                  <p className="text-sm">
                    Aucune alerte à signaler pour le moment.
                  </p>
                </AlertBox>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
