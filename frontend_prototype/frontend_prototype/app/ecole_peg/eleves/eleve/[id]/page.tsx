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
import axios from "axios";

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string | undefined;
  sexe: string;
  rue: string | undefined;
  numero: string | undefined;
  npa: string | undefined;
  localite: string | undefined;
  adresse_facturation: string | undefined;
  telephone: string;
  email: string;
  type_permis: string | undefined;
  date_permis: string | undefined;
  niveau: string | undefined;
  langue_maternelle: string | undefined;
  autres_langues: string | undefined;
  src_decouverte: string | undefined;
  commentaires: string | undefined;
}

interface Paiement {
  id: number;
  date: Date;
  description: string;
  montant: number;
  mode: string;
}

export default function ElevePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
const dta = use(params);

  const resolvedParams = use(params);
  const id=resolvedParams.id;
  const [eleve, setEleve] = useState<Eleve | undefined>(undefined);
  const [paiements, setPaiements] = useState<Paiement[]>([]);

  useEffect(() => {
    async function fetchEleve() {
      try {
        const donnees: Eleve = await axios.get(
          `http://localhost:8000/api/eleves/eleve/${id}/`
        ).then((response) => response.data);

        setEleve(donnees);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    fetchEleve();

    async function fetchPaiements() {
      try {
        const donnees = await axios.get(
          `http://localhost:8000/api/eleves/eleve/${id}/paiements/`
        ).then((response) => response.data);

        setPaiements(donnees);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchPaiements();
  }, [id]);

  async function supprimerEleve(id_eleve: number | undefined) {
    if (!id_eleve) return;

    try {
      await axios.delete(`http://localhost:8000/api/eleves/eleve/${id_eleve}/`)

      router.push("/ecole_peg/eleves");
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ecole_peg/eleves">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {eleve?.nom} {eleve?.prenom}
        </h1>
      </div>

      <Tabs defaultValue="fiche" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fiche">Fiche élève</TabsTrigger>
          <TabsTrigger value="paiements">Paiements</TabsTrigger>
          <TabsTrigger value="presences">Présences</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="fiche">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Coordonnées et informations de l&apos;élève
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nom
                    </p>
                    <p>{eleve?.nom ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Prénom
                    </p>
                    <p>{eleve?.prenom ?? "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date de naissance
                  </p>
                  <p>{eleve?.date_naissance ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Lieu de naissance
                  </p>
                  <p>{eleve?.lieu_naissance ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sexe
                  </p>
                  <p>
                    {eleve?.sexe === "M"
                      ? "Male"
                      : eleve?.sexe === "F"
                      ? "Femelle"
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Adresse
                  </p>
                  <p>
                    {[eleve?.rue, eleve?.numero, eleve?.npa, eleve?.localite]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Téléphone
                  </p>
                  <p>{eleve?.telephone ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{eleve?.email ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Type de permis
                  </p>
                  <p>
                    {eleve?.type_permis === "E"
                      ? "Etudiant"
                      : eleve?.type_permis === "P"
                      ? "Pas de permis"
                      : eleve?.type_permis === "S"
                      ? "Permis S"
                      : eleve?.type_permis === "B"
                      ? "Permis B"
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date d&apos;expiration de permis
                  </p>
                  <p>{eleve?.date_permis ?? "-"}</p>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t px-6 py-4">
                <Button variant="outline">Modifier</Button>
                <Button
                  variant="destructive"
                  onClick={() => supprimerEleve(eleve?.id)}
                >
                  Supprimer
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations académiques</CardTitle>
                <CardDescription>
                  Parcours et suivi de l&apos;étudiant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Niveau actuel
                  </p>
                  <p>{eleve?.niveau ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Langue maternelle
                  </p>
                  <p>{eleve?.langue_maternelle ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Autres langues
                  </p>
                  <p>{eleve?.autres_langues ?? "-"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="paiements">
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>
                Tous les paiements et factures de l&apos;étudiant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>

                {paiements?.length > 0 ? (
                    paiements.map((paiement) => (
                      <TableRow key={paiement.id}>
                        <TableCell>{paiement.date ? paiement.date.toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{eleve?.nom ?? "-"}</TableCell>
                        <TableCell>
                          {paiement.description ?? "-"}
                        </TableCell>
                        <TableCell>{paiement.montant ?? "-"}</TableCell>
                        <TableCell>{paiement.mode ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/ecole_peg/eleves/eleve/${paiement.id}`}>
                              Détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Aucun paiement trouvé
                    </TableCell>
                  </TableRow>
                )}
                 
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4">
              <div>
                <p className="text-sm font-medium">Total dû: </p>
              </div>
              <Button>
                  <Link href={`/ecole_peg/eleves/eleve/${id}/paiement`}>ajouter paiement</Link>
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="presences">
          <Card>
            <CardHeader>
              <CardTitle>Suivi des présences</CardTitle>
              <CardDescription>
                Historique des présences et absences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Horaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Justification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>10-025-2025</TableCell>
                    <TableCell>9h - 12h</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Présent
                      </span>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>11-02-2025</TableCell>
                    <TableCell>9h - 12h</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Présent
                      </span>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>12-02-2025</TableCell>
                    <TableCell>9h - 12h</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        Absent
                      </span>
                    </TableCell>
                    <TableCell>Maladie (certificat médical)</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>13-02-2025</TableCell>
                    <TableCell>9h - 12h</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Présent
                      </span>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4">
              <div>
                <p className="text-sm font-medium">Taux de présence: 85%</p>
              </div>
              <Button>Enregistrer présence</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Documents administratifs de l&apos;étudiant
              </CardDescription>
            </CardHeader>
            <CardContent>
             
            </CardContent>
            <CardFooter className="justify-end border-t px-6 py-4">
              <Button>Ajouter un document</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
