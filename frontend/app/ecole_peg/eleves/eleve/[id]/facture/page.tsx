"use client";

import { useCallback, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/textarea";
import axios from "axios";

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
}

interface Inscription {
  id: number;
  date_inscription: Date;
  statut: string;
  preinscription: boolean;
  frais_inscription: number;
}

interface CoursPrive {
  id: number;
  date_cours_prive: Date;
  heure_debut: string;
  heure_fin: string;
  tarif: number;
  lieu: string;
  enseignant__nom: string;
  enseignant__prenom: string;
}

interface DetailFacture {
  description: string;
  date_debut_periode: Date | undefined;
  date_fin_periode: Date | undefined;
  montant: string;
}

export default function NouvelleFacturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const router = useRouter();
  const resolvedParams = use(params);

  const [total, setTotal] = useState<string>("0");
  const [details_facture, setDetailsFacture] = useState<DetailFacture[]>([]);
  const [eleve, setEleve] = useState<Eleve | undefined>(undefined);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [coursPrives, setCoursPrives] = useState<CoursPrive[]>([]);
  const [typeFacturation, setTypeFacturation] = useState<
    "inscription" | "cours_prive"
  >("inscription");
  const [idReference, setIdReference] = useState<number>();

  const ajouterDetail = () => {
    setDetailsFacture([
      ...details_facture,
      {
        description: "",
        date_debut_periode: undefined,
        date_fin_periode: undefined,
        montant: "0",
      },
    ]);
  };

  const supprimerDetail = (index: number) => {
    const nouveauxDetails = [...details_facture];
    nouveauxDetails.splice(index, 1);
    setDetailsFacture(nouveauxDetails);
    calculerTotal(nouveauxDetails);
  };

  const modifierDetail = (
    index: number,
    champ: keyof DetailFacture,
    valeur: unknown,
  ) => {
    const nouveauxDetails = [...details_facture];
    nouveauxDetails[index] = {
      ...nouveauxDetails[index],
      [champ]: valeur,
    };
    setDetailsFacture(nouveauxDetails);
    if (champ === "montant") calculerTotal(nouveauxDetails);
  };

  const calculerTotal = (details: DetailFacture[]) => {
    const total = details.reduce((sum, detail) => {
      return sum + (Number.parseFloat(detail.montant) || 0);
    }, 0);
    setTotal(total.toFixed(2));
  };

  const onSoumission = useCallback(async () => {
    const donneesCompletes: {
      details_facture: {
        description: string;
        date_debut_periode: string | undefined;
        date_fin_periode: string | undefined;
        montant: number;
      }[];
      id_inscription?: number;
      id_cours_prive?: number;
    } = {
      details_facture: details_facture.map((detail) => ({
        description: detail.description,
        date_debut_periode: detail.date_debut_periode
          ? format(detail.date_debut_periode, "yyyy-MM-dd")
          : undefined,
        date_fin_periode: detail.date_fin_periode
          ? format(detail.date_fin_periode, "yyyy-MM-dd")
          : undefined,
        montant: Number.parseFloat(detail.montant),
      })),
    };

    // Ajoute la bonne clé selon le type de référence
    if (typeFacturation === "inscription") {
      donneesCompletes.id_inscription = idReference;
    } else if (typeFacturation === "cours_prive") {
      donneesCompletes.id_cours_prive = idReference;
    }
    try {
      await axios.post(
        `http://localhost:8000/api/factures/facture/`,
        donneesCompletes,
      );
      router.push(`/ecole_peg/eleves/eleve/${resolvedParams.id}/`);
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }, [
    details_facture,
    typeFacturation,
    idReference,
    router,
    resolvedParams.id,
  ]);

  useEffect(() => {
    async function fetchEleve() {
      try {
        const { data } = await axios.get<Eleve>(
          `http://localhost:8000/api/eleves/eleve/${resolvedParams.id}/`,
        );
        setEleve(data);
      } catch (e) {
        console.error("Erreur fetchEleve:", e);
      }
    }

    async function fetchInscriptions() {
      try {
        const { data } = await axios.get(
          `http://localhost:8000/api/cours/${resolvedParams.id}/inscriptions/`,
        );
        setInscriptions(data);
      } catch (e) {
        console.error("Erreur fetchInscriptions:", e);
      }
    }

    async function fetchCoursPrives() {
      try {
        const { data } = await axios.get(
          `http://localhost:8000/api/cours/eleves/${resolvedParams.id}/cours_prives/`,
        );
        setCoursPrives(data);
      } catch (e) {
        console.error("Erreur fetchCoursPrives:", e);
      }
    }

    fetchEleve();
    fetchInscriptions();
    fetchCoursPrives();
  }, [resolvedParams.id]);

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Retourner à la page précédente"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Nouvelle facture pour {eleve?.prenom} {eleve?.nom}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)} className="space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Détails de la facture</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type de facturation</Label>
                <Select
                  defaultValue={typeFacturation}
                  onValueChange={(val) => {
                    setTypeFacturation(val as "inscription" | "cours_prive");
                    setIdReference(undefined);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inscription">
                      Inscription au cours
                    </SelectItem>
                    <SelectItem value="cours_prive">Cours privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {typeFacturation === "inscription" ? (
                  <>
                    <Label>Inscription</Label>
                    <Select
                      required
                      onValueChange={(val) => setIdReference(Number(val))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner l'inscription" />
                      </SelectTrigger>
                      <SelectContent>
                        {inscriptions
                          .filter((i) => !i.preinscription)
                          .map((i) => (
                            <SelectItem key={i.id} value={i.id.toString()}>
                              {format(i.date_inscription, "dd-MM-yyyy")} (
                              {i.statut === "A" ? "Active" : "Inactive"}) (
                              {i.frais_inscription} CHF)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Label>Cours Privé</Label>
                    <Select
                      required
                      onValueChange={(val) => setIdReference(Number(val))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un cours privé" />
                      </SelectTrigger>
                      <SelectContent>
                        {coursPrives.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {format(c.date_cours_prive, "dd-MM-yyyy")} (
                            {c.enseignant__prenom} {c.enseignant__nom} -{" "}
                            {c.tarif} CHF)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl">Lignes de facturation</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={ajouterDetail}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter une ligne
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {details_facture.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aucune ligne de facturation. Cliquez sur &quot;Ajouter une
                    ligne&quot; pour commencer.
                  </p>
                </div>
              ) : (
                details_facture.map((detail, index) => (
                  <div
                    key={index}
                    className="relative space-y-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/5"
                  >
                    {details_facture.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 opacity-70 hover:opacity-100"
                        onClick={() => supprimerDetail(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={detail.description}
                        onChange={(e) =>
                          modifierDetail(index, "description", e.target.value)
                        }
                        placeholder="Description de la ligne de facturation"
                        className="min-h-[80px]"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Période du</Label>
                        <Input
                          type="date"
                          className="w-full"
                          value={
                            detail.date_debut_periode
                              ? format(detail.date_debut_periode, "yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            modifierDetail(
                              index,
                              "date_debut_periode",
                              value ? new Date(value) : undefined,
                            );
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>au</Label>
                        <Input
                          type="date"
                          className="w-full"
                          value={
                            detail.date_fin_periode
                              ? format(detail.date_fin_periode, "yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            modifierDetail(
                              index,
                              "date_fin_periode",
                              value ? new Date(value) : undefined,
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Montant (CHF)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={detail.montant}
                        onChange={(e) =>
                          modifierDetail(index, "montant", e.target.value)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        placeholder="0.00"
                        className="font-mono"
                        required
                      />
                    </div>
                  </div>
                ))
              )}

              {details_facture.length > 0 && (
                <div className="mt-6 flex justify-end rounded-lg border bg-card p-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold tabular-nums">
                      {total} CHF
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              className="min-w-[150px]"
              disabled={isSubmitting || details_facture.length === 0}
            >
              {isSubmitting ? (
                <>Sauvegarde en cours...</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
