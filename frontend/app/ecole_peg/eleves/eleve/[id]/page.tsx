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
import React, { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import axios from "axios";
import { Input } from "@/components/input";
import { Label } from "@/components/label";

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
  pays__nom: string | undefined;
}
interface inscription {
  id: number;
  date_inscription: Date;
  but: string;
  frais_inscription: number;
  statut: string;
  date_sortie: Date;
  motif_sortie: string;
  preinscription: boolean; // <-- Ajout ici
}

interface Document {
  id: number;
  nom: string;
  fichier_url: string;
  date_ajout: string;
}
interface Garant {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  localite: string;
  rue: string;
  numero: string;
  npa: string;
}
interface Test {
  id: number;
  date_test: Date;
  niveau: string;
  note: number;
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

  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [eleve, setEleve] = useState<Eleve | undefined>(undefined);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [inscriptions, setInscriptions] = useState<inscription[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [garant, setGarant] = useState<Garant | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const reponse = await axios.get(
        `http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/documents/`
      );

      setDocuments(reponse.data);
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }, [resolvedParams.id]);

  const fetchTests = useCallback(async () => {
    try {
      const reponse = await axios.get(
        `http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/tests/`
      );

      setTests(reponse.data);
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    async function fetchEleve() {
      try {
        const donnees: Eleve = await axios
          .get(`http://localhost:8000/api/eleves/eleve/${resolvedParams.id}/`)
          .then((response) => response.data);

        setEleve(donnees);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    async function fetchInscriptions() {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/cours/${resolvedParams.id}/inscriptions/`
        );
        setInscriptions(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des inscriptions", error);
      }
    }
    fetchInscriptions();
    fetchEleve();
    fetchDocuments();
    fetchTests();
    async function fetchGarant() {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/garant/`
        );
        if (res.data?.id) {
          setGarant(res.data);
        } else {
          setGarant(null); // pas de garant
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du garant", error);
        setGarant(null);
      }
    }

    fetchGarant();

    async function fetchPaiements() {
      try {
        const donnees = await axios
          .get(
            `http://localhost:8000/api/factures/paiements/eleve/${resolvedParams.id}/`
          )
          .then((response) => response.data);

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
  }, [fetchDocuments, fetchTests, resolvedParams.id]);

  async function supprimerEleve(id_eleve: number | undefined) {
    if (!id_eleve) return;

    try {
      await axios.delete(
        `http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/`
      );

      router.push("/ecole_peg/eleves");
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }

  async function supprimerTest(id_test: number) {
    try {
      await axios.delete(
        `http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/tests/${id_test}/`
      );

      fetchTests();
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }
  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await axios.post(
        `http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/documents/`,
        formData // ✅ PAS DE headers ici
      );
      form.reset();
      fetchDocuments(); // Recharge la liste
    } catch (error) {
      console.error("Erreur d'upload", error);
    }
  }

  async function supprimerDocument(documentId: number) {
    try {
      await axios.delete(
        `http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/documents/${documentId}/`
      );
      fetchDocuments();
    } catch (error) {
      console.error("Erreur de suppression", error);
    }
  }
  async function supprimerInscription(inscriptionId: number) {
    try {
      await axios.delete(
        `http://localhost:8000/api/cours/${id}/inscriptions/${inscriptionId}/`
      );
      setInscriptions((old) => old.filter((i) => i.id !== inscriptionId));
    } catch (erreur) {
      console.error("Erreur suppression inscription:", erreur);
    }
  }

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
        <h1 className="text-3xl font-bold tracking-tight">
          {eleve?.nom} {eleve?.prenom}
        </h1>
      </div>

      <Tabs defaultValue="fiche" className="space-y-6">
        <TabsList className="bg-card">
          <TabsTrigger value="fiche">Fiche élève</TabsTrigger>
          <TabsTrigger value="garants">Garant</TabsTrigger>
          <TabsTrigger value="paiements">Paiements</TabsTrigger>
          <TabsTrigger value="presences">Présences</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="inscriptions">Inscriptions</TabsTrigger>
          <TabsTrigger value="factures">Factures</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="fiche">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Détails et coordonnées de l&apos;élève
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {[
                { label: "Nom", value: eleve?.nom },
                { label: "Prénom", value: eleve?.prenom },
                {
                  label: "Date de naissance",
                  value: eleve?.date_naissance
                    ? format(new Date(eleve.date_naissance), "dd/MM/yyyy")
                    : "-",
                },
                { label: "Lieu de naissance", value: eleve?.lieu_naissance },
                {
                  label: "Sexe",
                  value:
                    eleve?.sexe === "H"
                      ? "Homme"
                      : eleve?.sexe === "F"
                      ? "Femme"
                      : "-",
                },
                { label: "Rue", value: eleve?.rue },
                { label: "Numéro", value: eleve?.numero },
                { label: "NPA", value: eleve?.npa },
                { label: "Localité", value: eleve?.localite },
                { label: "Pays", value: eleve?.pays__nom },
                {
                  label: "Adresse de facturation",
                  value: eleve?.adresse_facturation,
                },
                { label: "Téléphone", value: eleve?.telephone },
                { label: "Email", value: eleve?.email },
                {
                  label: "Type de permis",
                  value:
                    eleve?.type_permis === "E"
                      ? "Étudiant"
                      : eleve?.type_permis === "P"
                      ? "Pas de permis"
                      : eleve?.type_permis === "S"
                      ? "Permis S"
                      : eleve?.type_permis === "B"
                      ? "Permis B"
                      : "-",
                },
                {
                  label: "Date d'expiration permis",
                  value: eleve?.date_permis
                    ? format(new Date(eleve.date_permis), "dd/MM/yyyy")
                    : "-",
                },
                { label: "Niveau", value: eleve?.niveau },
                { label: "Langue maternelle", value: eleve?.langue_maternelle },
                { label: "Autres langues", value: eleve?.autres_langues },
                { label: "Source de découverte", value: eleve?.src_decouverte },
                { label: "Commentaires", value: eleve?.commentaires },
              ].map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-sm">{item.value || "-"}</p>
                </div>
              ))}
              <div className="col-span-full mt-4">
                <Button variant="default" className="w-full">
                  <Link
                    href={`/ecole_peg/eleves/eleve/${resolvedParams.id}/inscrire`}
                  >
                    Inscrire
                  </Link>
                </Button>
              </div>
            </CardContent>

            <CardFooter className="justify-between border-t px-6 py-4 bg-muted/50">
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
        </TabsContent>

        <TabsContent value="inscriptions">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Inscriptions</CardTitle>
              <CardDescription>
                Historique des inscriptions de l&apos;élève
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {inscriptions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>But</TableHead>
                      <TableHead>Frais</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date sortie</TableHead>
                      <TableHead>Motif sortie</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inscriptions.map((inscription) => (
                      <TableRow
                        key={inscription.id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell>
                          {format(
                            new Date(inscription.date_inscription),
                            "dd/MM/yyyy"
                          )}
                        </TableCell>
                        <TableCell>{inscription.but}</TableCell>
                        <TableCell>
                          {inscription.frais_inscription} CHF
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              inscription.statut === "A"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {inscription.statut === "A" ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {inscription.date_sortie
                            ? format(
                                new Date(inscription.date_sortie),
                                "dd/MM/yyyy"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>{inscription.motif_sortie || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              inscription.preinscription
                                ? "bg-blue-100 text-blue-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {inscription.preinscription
                              ? "Préinscription"
                              : "Inscription"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/ecole_peg/eleves/eleve/${resolvedParams.id}/inscrire/${inscription?.id}/modifier`}
                            >
                              Modifier
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              supprimerInscription(inscription.id);
                            }}
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  Aucune inscription trouvée.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factures">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Historique des factures</CardTitle>
              <CardDescription>
                Gestion des factures de l&apos;élève
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factures.length > 0 ? (
                    factures.map((facture) => (
                      <TableRow key={facture.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          #{facture.id}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(facture.date_emission),
                            "dd/MM/yyyy"
                          )}
                        </TableCell>
                        <TableCell>
                          {facture.montant_total.toFixed(2)} CHF
                        </TableCell>
                        <TableCell>
                          {facture.montant_restant === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Payée
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              En attente
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
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
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground h-24"
                      >
                        Aucune facture trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-end border-t px-6 py-4 bg-muted/50">
              <Button
                onClick={() => {
                  router.push(
                    `/ecole_peg/eleves/eleve/${resolvedParams.id}/facture/`
                  );
                }}
              >
                Nouvelle facture
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="paiements">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>
                Suivi des paiements effectués par l&apos;élève
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paiements?.length > 0 ? (
                    paiements.map((paiement) => (
                      <TableRow key={paiement.id} className="hover:bg-muted/50">
                        <TableCell>
                          {paiement.date_paiement
                            ? format(
                                new Date(paiement.date_paiement),
                                "dd/MM/yyyy"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>{eleve?.nom ?? "-"}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {paiement.methode_paiement}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {paiement.montant.toFixed(2)} CHF
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {paiement.mode_paiement}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/ecole_peg/eleves/eleve/${paiement.id}`}
                            >
                              Détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground h-24"
                      >
                        Aucun paiement trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
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
        <TabsContent value="garants">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Informations garant</CardTitle>
              <CardDescription>
                Coordonnées de la personne garante
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {garant ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Nom", value: garant.nom },
                    { label: "Prénom", value: garant.prenom },
                    { label: "Téléphone", value: garant.telephone },
                    { label: "Email", value: garant.email },
                    {
                      label: "Adresse complète",
                      value:
                        [garant.rue, garant.numero, garant.npa, garant.localite]
                          .filter(Boolean)
                          .join(" ") || "-",
                    },
                  ].map((item, index) => (
                    <div key={index} className="space-y-1.5">
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm">{item.value || "-"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Aucun garant n&apos;est associé à cet élève.
                  </p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link
                      href={`/ecole_peg/eleves/eleve/${resolvedParams.id}/garant/ajouter`}
                    >
                      Ajouter un garant
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
            {garant && (
              <CardFooter className="justify-end border-t px-6 py-4 bg-muted/50">
                <Button variant="outline" asChild>
                  <Link
                    href={`/ecole_peg/eleves/eleve/${resolvedParams.id}/garant/modifier`}
                  >
                    Modifier le garant
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Documents administratifs de l&apos;élève
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="rounded-lg border divide-y">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <a
                          href={doc.fichier_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {doc.nom}
                        </a>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(doc.date_ajout), "dd/MM/yyyy")}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => supprimerDocument(doc.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Aucun document trouvé.
                  </div>
                )}
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom du document</Label>
                    <Input
                      type="text"
                      name="nom"
                      id="nom"
                      placeholder="Nom du document"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fichier">Fichier</Label>
                    <Input
                      type="file"
                      name="fichier"
                      id="fichier"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Ajouter un document
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tests">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Historique des tests</CardTitle>
              <CardDescription>
                Résultats des tests de l&apos;élève
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.length > 0 ? (
                    tests.map((test) => (
                      <TableRow key={test.id} className="hover:bg-muted/50">
                        <TableCell>
                          {format(new Date(test.date_test), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {test.niveau}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              test.note >= 4
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {test.note}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => supprimerTest(test.id)}
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
                        className="text-center text-muted-foreground h-24"
                      >
                        Aucun test trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-end border-t px-6 py-4 bg-muted/50">
              <Button
                onClick={() => {
                  router.push(
                    `/ecole_peg/eleves/eleve/${resolvedParams.id}/test/`
                  );
                }}
              >
                Nouveau test
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
