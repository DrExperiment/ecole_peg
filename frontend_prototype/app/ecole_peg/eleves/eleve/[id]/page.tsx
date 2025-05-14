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
import { format } from "date-fns";
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
interface inscription {
  id: number;
  date_inscription: Date;
  but: string;
  frais_inscription: number;
  statut: string;
  nom_cours: string;
  
}


interface Paiement {
  id: number;
  date_paiement: Date;
  montant: number;
  mode_paiement: string;
  methode_paiement: string;
}
interface Facture {
  id: number;
  date_emission: Date;
  montant_total: number;
  montant_restant: number;
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
  const [factures, setFactures] = useState<Facture[]>([]);

  useEffect(() => {
    async function fetchEleve() {
      try {
        const donnees: Eleve = await axios.get(
          `http://localhost:8000/api/eleves/eleve/${resolvedParams.id}/`
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
          `http://localhost:8000/api/factures/paiements/eleve/${resolvedParams.id}/`
        ).then((response) => response.data);

        setPaiements(donnees);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    
    async function fetchFactures() {
      try {
        const reponse = await axios.get(
          `http://localhost:8000/api/factures/factures/eleve/${resolvedParams.id}/`
        );

        setFactures(reponse.data);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchPaiements();
    fetchFactures();

    console.log(factures);
  }, [id]);

  async function supprimerEleve(id_eleve: number | undefined) {
    if (!id_eleve) return;

    try {
      await axios.delete(`http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/`)

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
          <TabsTrigger value="inscriptions">Inscriptions</TabsTrigger>
          <TabsTrigger value="factures">Factures</TabsTrigger>
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
                    {eleve?.sexe === "H"
                      ? "homme"
                      : eleve?.sexe === "F"
                      ? "femme"
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
                <div>
                  <Button variant="outline" className="w-full">
                    <Link href={`/ecole_peg/eleves/eleve/${resolvedParams.id}/inscrire`}>
                      Inscrire 
                      </Link>
                  </Button>

                </div>
              </CardContent>
              <CardFooter className="justify-between border-t px-6 py-4">
              <Button variant="outline" asChild>
    <Link href={`/ecole_peg/eleves/eleve/${id}/modifier`}>
      Modifier
    </Link>
  </Button>
                <Button
  variant="destructive"
  onClick={() => supprimerEleve(Number(resolvedParams.id))}
  disabled={!resolvedParams?.id}
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
                  <p>{eleve?.niveau || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Langue maternelle
                  </p>
                  <p>{eleve?.langue_maternelle || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Autres langues
                  </p>
                  <p>{eleve?.autres_langues || "-"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="inscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Inscriptions</CardTitle>
              <CardDescription>
                Historique des inscriptions de l&apos;élève
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Aucune inscription trouvée.</p>
            </CardContent>
          </Card>
        </TabsContent>

        
        <TabsContent value="factures">
          <Card>
            <CardHeader>
              <CardTitle>Historique des factures</CardTitle>
              <CardDescription>
                Tous les factures de l&apos;élève
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factures.length > 0 ? (
                    factures.map((facture) => (
                      <TableRow key={facture.id}>
                        <TableCell>{facture.id}</TableCell> 
                        <TableCell>
                        {format((facture.date_emission), "yyyy-MM-dd")}
                        </TableCell>
                        <TableCell>{facture.montant_total} CHF</TableCell>
                        <TableCell>
                          {facture.montant_restant === 0 ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              Payé
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                              Non payé
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/ecole_peg/factures/facture/${facture.id}`}
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
                        Aucune facture trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4">
              <Button
                onClick={() => {
                  router.push(`/ecole_peg/eleves/eleve/${resolvedParams.id}/facture/`);
                }}
              >
                Nouvelle facture
              </Button>
            </CardFooter>
          </Card>
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
                        <TableCell>
  {paiement.date_paiement
    ? new Date(paiement.date_paiement).toLocaleDateString()
    : "-"}
</TableCell>

                        <TableCell>{eleve?.nom ?? "-"}</TableCell>
                        <TableCell>
                          {paiement.methode_paiement ?? "-"}
                        </TableCell>
                        <TableCell>{paiement.montant ?? "-"}</TableCell>
                        <TableCell>{paiement.mode_paiement }</TableCell>
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
