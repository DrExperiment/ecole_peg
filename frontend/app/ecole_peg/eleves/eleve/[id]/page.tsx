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
  pays__nom: string | undefined;
}
interface inscription {
  id: number;
  date_inscription: Date;
  but: string;
  frais_inscription: number;
  statut: string;
  date_sortie: Date ;
  motif_sortie: string;

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
  const dta = use(params);

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
        const donnees: Eleve = await axios.get(
          `http://localhost:8000/api/eleves/eleve/${resolvedParams.id}/`
        ).then((response) => response.data);

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
        const res = await axios.get(`http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/garant/`);
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
          <TabsTrigger value="garants">Garant</TabsTrigger>
          <TabsTrigger value="paiements">Paiements</TabsTrigger>
          <TabsTrigger value="presences">Présences</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="inscriptions">Inscriptions</TabsTrigger>
          <TabsTrigger value="factures">Factures</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="fiche">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>

            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
              {[
                { label: "Nom", value: eleve?.nom },
                { label: "Prénom", value: eleve?.prenom },
                { label: "Date de naissance", value: eleve?.date_naissance },
                { label: "Lieu de naissance", value: eleve?.lieu_naissance },
                {
                  label: "Sexe",
                  value: eleve?.sexe === "H" ? "Homme" : eleve?.sexe === "F" ? "Femme" : "-",
                },
                { label: "Pays", value: eleve?.pays__nom },
                {
                  label: "Adresse",
                  value:
                    [eleve?.rue, eleve?.numero, eleve?.npa, eleve?.localite]
                      .filter(Boolean)
                      .join(" ") || "-",
                },
                { label: "Téléphone", value: eleve?.telephone },
                { label: "Email", value: eleve?.email },
                {
                  label: "Type de permis",
                  value:
                    eleve?.type_permis === "E"
                      ? "Etudiant"
                      : eleve?.type_permis === "P"
                        ? "Pas de permis"
                        : eleve?.type_permis === "S"
                          ? "Permis S"
                          : eleve?.type_permis === "B"
                            ? "Permis B"
                            : "-",
                },
                { label: "Date d'expiration de permis", value: eleve?.date_permis ?? "-" },
                { label: "Niveau", value: eleve?.niveau },
                { label: "Langue maternelle", value: eleve?.langue_maternelle },
                { label: "Autres langues", value: eleve?.autres_langues },
              ].map((item, index) => (
                <div key={index} className="flex flex-col min-w-0 break-words">
                  <p className="text-muted-foreground font-medium">{item.label}</p>
                  <p>{item.value || "-"}</p>
                </div>
              ))}
              <div className="col-span-2">
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
        </TabsContent>

        <TabsContent value="inscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Inscriptions</CardTitle>
              <CardDescription>Historique des inscriptions de l'élève</CardDescription>
            </CardHeader>
            <CardContent>
              {inscriptions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>But</TableHead>
                      <TableHead>Frais</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date sortie</TableHead>
                      <TableHead>Motif sortie</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inscriptions.map((inscription) => (
                      <TableRow key={inscription.id}>
                        <TableCell>{format(new Date(inscription.date_inscription), "yyyy-MM-dd")}</TableCell>
                        <TableCell>{inscription.but}</TableCell>
                        <TableCell>{inscription.frais_inscription} CHF</TableCell>
                        <TableCell>{inscription.statut}</TableCell>
                        <TableCell>{format(new Date(inscription.date_sortie), "yyyy-MM-dd") }</TableCell>
                        <TableCell>{inscription.motif_sortie}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" asChild><Link href={`/ecole_peg/eleves/eleve/${resolvedParams.id}/inscrire/${inscription.id}/modifier`}>
                        Modifier</Link></Button></TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Aucune inscription trouvée.</p>
              )}
            </CardContent>
            <CardFooter className="justify-end border-t px-6 py-4">
            </CardFooter>
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
                              on payé
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
                        <TableCell>{paiement.mode_paiement}</TableCell>
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
        <TabsContent value="garants">

          <Card>
            <CardHeader>
              <CardTitle>Informations garant</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
              {garant ? (
                [
                  { label: "Nom", value: garant.nom },
                  { label: "Prénom", value: garant.prenom },
                  { label: "Téléphone", value: garant.telephone },
                  { label: "Email", value: garant.email },
                  {
                    label: "Adresse",
                    value: [garant.rue, garant.numero, garant.npa, garant.localite].filter(Boolean).join(" ") || "-",
                  },

                ].map((item, index) => (
                  <div key={index} className="flex flex-col min-w-0 break-words">
                    <p className="text-muted-foreground font-medium">{item.label}</p>
                    <p>{item.value || "-"}</p>
                  </div>
                ))
              ) : (
                <p className="col-span-2 text-sm text-muted-foreground italic">
                  Aucun garant trouvé pour cet élève.
                </p>
              )}
            </CardContent>
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
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <li key={doc.id} className="flex justify-between items-center">
                      <a
                        href={doc.fichier_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {doc.nom}
                      </a>

                      <span className="text-sm text-muted-foreground">{doc.date_ajout}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => supprimerDocument(doc.id)}
                      >
                        Supprimer
                      </Button>
                    </li>
                  ))
                ) : (
                  <p>Aucun document trouvé.</p>
                )}
              </ul>

              <form onSubmit={handleUpload}>
                <input type="text" name="nom" placeholder="Nom du document" required className="border p-2 w-full my-2" />
                <input type="file" name="fichier" required className="my-2" />
                <Button type="submit">Ajouter un document</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Historique des tests</CardTitle>
              <CardDescription>Tous les tests de l&apos;élève</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.length > 0 ? (
                    tests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          {format(test.date_test, "dd-MM-yyyy")}
                        </TableCell>
                        <TableCell>{test.niveau}</TableCell>
                        <TableCell>{test.note}</TableCell>
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
                      <TableCell colSpan={7} className="text-center">
                        Aucun test trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4">
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
