"use client";

import { useCallback, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { CalendarIcon, ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn, fetchApi } from "@/lib/utils";
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
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const router = useRouter();

  const resolvedParams = use(params);

  const [date, setDate] = useState<Date | undefined>(undefined);

  const [total, setTotal] = useState<string>("0");

  const [details_facture, setDetailsFacture] = useState<DetailFacture[]>([]);

  const [eleve, setEleve] = useState<Eleve | undefined>(undefined);

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [id_inscription, setIdInscription] = useState<number>();

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
    const nouveauxDetails = [...details_facture].splice(index, 1);

    setDetailsFacture(nouveauxDetails);
    calculerTotal(nouveauxDetails);
  };

  const modifierDetail = (
    index: number,
    champ: keyof DetailFacture,
    valeur: unknown
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

    const totalFormatted = total.toFixed(2);

    setTotal(totalFormatted);
  };

  const onSoumission = useCallback(async () => {
    const donneesCompletes = {
      id_inscription,
      date_emission: date ? format(date, "yyyy-MM-dd") : undefined,
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

    console.log(donneesCompletes);
    

    try {
      await axios.post(`http://localhost:8000/api/factures/facture/`, donneesCompletes);

      router.push(`/ecole_peg/eleves/eleve/${resolvedParams.id}/`);
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }, [date, details_facture, eleve?.id, id_inscription, router]);

  
  useEffect(() => {
    async function fetchEleve() {
  const url = `http://localhost:8000/api/eleves/eleve/${resolvedParams.id}/`;
  console.log("fetchEleve →", url);
  try {
    const { data } = await axios.get<Eleve>(url);
    setEleve(data);
  } catch (e) {
    console.error("Erreur fetchEleve:", e);
  }
}
    async function fetchInscriptions() {
      try {
        const donnees = await axios.get(
          `http://localhost:8000/api/cours/${resolvedParams.id}/inscriptions/`
        );

        setInscriptions(donnees.data); // c'est ici que sont vraiment les inscriptions
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchEleve();
    fetchInscriptions();
  }, [resolvedParams.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ecole_peg/eleves/eleve/${resolvedParams.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Créer une nouvelle facture pour {eleve?.nom} {eleve?.prenom}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle facture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inscription">Inscription</Label>
              <Select
                name="inscription"
                required
                onValueChange={(valeur) => {
                  setIdInscription(Number(valeur));
                }}
              >
                <SelectTrigger id="inscription">
                  <SelectValue placeholder="Sélectionner l'inscription" />
                </SelectTrigger>
                <SelectContent>
                  {inscriptions
                    .filter(
                      (inscription) => inscription.preinscription === false
                    )
                    .map((inscription) => (
                      <SelectItem
                        key={inscription.id}
                        value={inscription.id.toString()}
                      >
                        {format((inscription.date_inscription), "dd-MM-yyyy")}
                        (
                        {inscription.statut === "A" ? "Active" : "Inactive"}) (
                        {inscription.frais_inscription} CHF)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date de la facture</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "dd-MM-yyyy", { locale: fr })
                    ) : (
                      <span>Séléctionner la date de la facture</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Détails de la facture</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={ajouterDetail}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un détail
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {details_facture.map((detail, index) => (
              <div
                key={index}
                className="space-y-4 p-4 border rounded-md relative"
              >
                {details_facture.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => supprimerDetail(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={detail.description}
                    onChange={(e) =>
                      modifierDetail(index, "description", e.target.value)
                    }
                    placeholder="Description"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Période du</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !detail.date_debut_periode &&
                              "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {detail.date_debut_periode ? (
                            format(detail.date_debut_periode, "dd-MM-yyyy", {
                              locale: fr,
                            })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={detail.date_debut_periode}
                          onSelect={(date) =>
                            modifierDetail(index, "date_debut_periode", date)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>au</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !detail.date_fin_periode && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {detail.date_fin_periode ? (
                            format(detail.date_fin_periode, "dd-MM-yyyy", {
                              locale: fr,
                            })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={detail.date_fin_periode}
                          onSelect={(date) =>
                            modifierDetail(index, "date_fin_periode", date)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`montant-${index}`}>Montant (CHF)</Label>
                  <Input
                    id={`montant-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={detail.montant}
                    onChange={(e) =>
                      modifierDetail(index, "montant", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Montant total:
                </p>
                <p className="text-xl font-bold">{total} CHF</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "En cours..." : "Enregistrer"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
