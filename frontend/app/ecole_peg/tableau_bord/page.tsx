"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bell,
  BookOpen,
  Cake,
  Clock,
  DollarSign,
  FileText,
  Home,
  PieChart,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { AlertBox } from "@/components/alert";

interface Anniversaire {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: Date;
  age: number;
}

interface SessionOuverte {
  date_debut: Date;
  eleves_restants: number;
}

interface ElevePresenceInferieur {
  nom: string;
  prenom: string;
  date_naissance: Date;
  taux_presence: number;
}

interface ElevePreinscription {
  nom: string;
  prenom: string;
  date_naissance: Date;
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
    montant_total_factures_impayees: number;
  };
  cours: {
    total_cours: number;
    sessions_actives: number;
    cours_prives_programmes_mois: number;
    sessions_ouvertes: SessionOuverte[];
    nombre_enseignants: number;
    repartition_eleves_actifs: RepartitionNiveau[];
  };
  eleves: {
    total_eleves: number;
    eleves_actifs: number;
    pays_plus_eleves: string | null;
    eleves_presence_inferieur_80: ElevePresenceInferieur[];
    eleves_preinscription_plus_3j: ElevePreinscription[];
  };
}

export default function TableauBordPage() {
  const [stats, setStats] = useState<Stats>();

  const [anniversaires, setAnniversaires] = useState<Anniversaire[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);

    async function fetchDonnees() {
      try {
        const [reponse_stats, reponse_anniv] = await Promise.all([
          api.get<Stats>("/eleves/statistiques/dashboard/"),
          api.get<Anniversaire[]>("/eleves/anniversaires/"),
        ]);

        setStats(reponse_stats.data);

        setAnniversaires(reponse_anniv.data);
      } catch (err) {
        console.error("Erreur: ", err);
      }
    }

    fetchDonnees();

    setChargement(false);
  }, []);

  if (chargement)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    );

  if (!stats) return <p>Aucune donnée disponible.</p>;

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

      <Tabs defaultValue="apercu" className="space-y-4">
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
                <CardTitle className="text-sm font-medium">
                  Élèves actifs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.eleves.eleves_actifs}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  sur {stats.eleves.total_eleves} élèves au total
                </p>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/5 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Enseignants
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.cours.nombre_enseignants}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/5 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total des cours
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.cours.total_cours}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  dont {stats.cours.sessions_actives} sessions actives
                </p>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/5 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cours privés ce mois
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.cours.cours_prives_programmes_mois}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">
                  Répartition des niveaux
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.cours.repartition_eleves_actifs.map(
                    (niveau, index) => {
                      const pourcentage =
                        stats.eleves.eleves_actifs > 0
                          ? (niveau.total / stats.eleves.eleves_actifs) * 100
                          : 0;
                      return (
                        <div
                          key={`${niveau.niveau}-${index}`}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Niveau {niveau.niveau}
                            </p>
                            <div className="flex items-center">
                              <div className="h-2 w-full rounded-full bg-secondary">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{ width: `${pourcentage}%` }}
                                />
                              </div>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {niveau.total}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">
                  Finances du mois
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700">
                      Montant reçu
                    </p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold">
                        {stats.factures.montant_total_paiements_mois.toLocaleString(
                          "fr-FR",
                          {
                            style: "currency",
                            currency: "CHF",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-700">
                      Montant impayé
                    </p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold">
                        {stats.factures.montant_total_factures_impayees.toLocaleString(
                          "fr-FR",
                          {
                            style: "currency",
                            currency: "CHF",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-muted-foreground">
                    Pays principal
                  </span>
                  <span className="font-medium">
                    {stats.eleves.pays_plus_eleves || "Non défini"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">
                  Sessions ouvertes
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stats.cours.sessions_ouvertes.length > 0 ? (
                  <div className="space-y-4">
                    {stats.cours.sessions_ouvertes.map((s) => (
                      <div
                        key={new Date(s.date_debut).toISOString()}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {format(new Date(s.date_debut), "dd MMMM yyyy", {
                              locale: fr,
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {s.eleves_restants} places disponibles
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucune session ouverte.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <Cake className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-medium">
                    Anniversaires du mois
                  </CardTitle>
                </div>
                <span className="text-sm text-muted-foreground capitalize">
                  {aujourdHui}
                </span>
              </CardHeader>
              <CardContent>
                {anniversaires.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun anniversaire ce mois-ci.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {anniversaires.map((anniv) => (
                      <div
                        key={anniv.id}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {anniv.prenom} {anniv.nom}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(anniv.date_naissance), "dd MMMM")}{" "}
                            - {anniv.age} ans
                          </p>
                        </div>
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
                      {factures_impayees}{" "}
                      {factures_impayees > 1
                        ? "factures impayées"
                        : "facture impayée"}{" "}
                      pour un montant total de{" "}
                      {stats.factures.montant_total_factures_impayees.toLocaleString(
                        "fr-FR",
                        { style: "currency", currency: "CHF" },
                      )}
                    </p>
                    <span className="text-2xl font-bold">
                      {factures_impayees}
                    </span>
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
                    <p className="text-sm">
                      {eleves_absence}{" "}
                      {eleves_absence > 1 ? "élèves ont" : "élève a"} un taux de
                      présence inférieur à 80%
                    </p>
                  </AlertBox>

                  <Card className="p-4">
                    <div className="space-y-4">
                      {stats.eleves.eleves_presence_inferieur_80.map(
                        (eleve, index) => (
                          <div
                            key={`presence-${eleve.nom}-${eleve.prenom}-${index}`}
                            className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                          >
                            <div>
                              <p className="font-medium">
                                {eleve.prenom} {eleve.nom}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Taux : {(eleve.taux_presence * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
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
                    <p className="text-sm">
                      {eleves_preinscription}{" "}
                      {eleves_preinscription > 1 ? "élèves sont" : "élève est"}{" "}
                      en attente de confirmation depuis plus de 3 jours
                    </p>
                  </AlertBox>

                  <Card className="p-4">
                    <div className="space-y-4">
                      {stats.eleves.eleves_preinscription_plus_3j.map(
                        (eleve, index) => (
                          <div
                            key={`preinscription-${eleve.nom}-${eleve.prenom}-${index}`}
                            className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                          >
                            <div>
                              <p className="font-medium">
                                {eleve.prenom} {eleve.nom}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Né(e) le{" "}
                                {format(
                                  new Date(eleve.date_naissance),
                                  "dd/MM/yyyy",
                                )}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
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
