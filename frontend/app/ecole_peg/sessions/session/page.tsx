"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
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
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import axios from "axios";

interface Cours {
  id: number;
  nom: string;
  type: string;
  niveau: string;
}

interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
}

export default function NouvelleSessionPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const router = useRouter();

  const [date_debut, setDateDebut] = useState<Date | undefined>(undefined);
  const [date_fin, setDateFin] = useState<Date | undefined>(undefined);

  const [cours, setCours] = useState<Cours[]>([]);
  const [id_cours, setIdCours] = useState<number>();

  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [id_enseignant, setIdEnseignant] = useState<number>();
  const [periode_journee, setPeriodeJournee] = useState<"M" | "S">("M");
  const [seances_mois, setSeancesMois] = useState<number | undefined>(
    undefined,
  );

  const onSoumission = useCallback(
    async (donnees: object) => {
      const donneesCompletes = {
        ...donnees,
        date_debut: date_debut ? format(date_debut, "yyyy-MM-dd") : undefined,
        seances_mois,
        date_fin: date_fin ? format(date_fin, "yyyy-MM-dd") : undefined,
        id_cours,
        id_enseignant,
        periode_journee,
      };

      try {
        await axios.post(
          "http://localhost:8000/api/cours/session/",
          donneesCompletes,
        );
        router.push("/ecole_peg/sessions/");
      } catch (erreur) {
        if (axios.isAxiosError(erreur)) {
          console.error("Erreur détaillée :", erreur.response?.data);
        } else {
          console.error("Erreur inconnue :", erreur);
        }
      }
    },
    [
      date_debut,
      date_fin,
      id_cours,
      id_enseignant,
      seances_mois,
      periode_journee,
      router,
    ],
  );

  useEffect(() => {
    async function fetchCours() {
      try {
        const reponse = await axios.get(
          "http://localhost:8000/api/cours/cours/",
        );
        setCours(reponse.data);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    async function fetchEnseignants() {
      try {
        const reponse = await axios.get(
          "http://localhost:8000/api/cours/enseignants/",
        );
        setEnseignants(reponse.data.enseignants);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchCours();
    fetchEnseignants();
  }, []);

  // Pour convertir l'input type="date" en Date JS
  function parseDateInput(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (d: Date | undefined) => void,
  ) {
    setter(e.target.value ? new Date(e.target.value) : undefined);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Retourner à la page précédente"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle Session</h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Détails de la session</CardTitle>
            <p className="text-sm text-muted-foreground">
              Créez une nouvelle session en remplissant les informations
              ci-dessous
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cours et Enseignant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cours" className="text-base">
                  Cours
                </Label>
                <Select
                  name="id_cours"
                  required
                  onValueChange={(valeur) => setIdCours(Number(valeur))}
                >
                  <SelectTrigger id="cours">
                    <SelectValue placeholder="Sélectionner un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    {cours.map((cours) => (
                      <SelectItem key={cours.id} value={cours.id.toString()}>
                        {cours.nom}{" "}
                        <span className="text-muted-foreground">
                          ({cours.type === "I" ? "intensif" : "semi-intensif"} -{" "}
                          {cours.niveau})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enseignant" className="text-base">
                  Enseignant
                </Label>
                <Select
                  name="enseignant"
                  required
                  onValueChange={(valeur) => setIdEnseignant(Number(valeur))}
                >
                  <SelectTrigger id="enseignant">
                    <SelectValue placeholder="Sélectionner un enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {enseignants.map((enseignant) => (
                      <SelectItem
                        key={enseignant.id}
                        value={enseignant.id.toString()}
                      >
                        {enseignant.nom} {enseignant.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates et Période */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date_debut" className="text-base">
                  Date de début
                </Label>
                <Input
                  id="date_debut"
                  type="date"
                  min={format(new Date(), "yyyy-MM-dd")}
                  required
                  className="font-mono"
                  onChange={(e) => parseDateInput(e, setDateDebut)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_fin" className="text-base">
                  Date de fin
                </Label>
                <Input
                  id="date_fin"
                  type="date"
                  min={
                    date_debut ? format(date_debut, "yyyy-MM-dd") : undefined
                  }
                  required
                  className="font-mono"
                  onChange={(e) => parseDateInput(e, setDateFin)}
                />
              </div>
            </div>

            {/* Configuration de la session */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="seances_mois" className="text-base">
                  Séances par mois
                </Label>
                <Input
                  id="seances_mois"
                  type="number"
                  min={1}
                  max={31}
                  className="font-mono"
                  required
                  {...register("seances_mois", {
                    required: "Séances par mois est obligatoire",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Minimum 1 séance par mois",
                    },
                    max: {
                      value: 31,
                      message: "Maximum 31 séances par mois",
                    },
                  })}
                  onChange={(e) => setSeancesMois(Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacite_max" className="text-base">
                  Capacité maximale
                </Label>
                <Input
                  id="capacite_max"
                  type="number"
                  min={1}
                  className="font-mono"
                  placeholder="Nombre d'élèves max."
                  required
                  {...register("capacite_max", {
                    required: "Capacité maximale est obligatoire",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "La capacité doit être d'au moins 1",
                    },
                  })}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base">Période de la journée</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex flex-col space-y-1 rounded-lg border p-4 cursor-pointer transition-colors ${
                    periode_journee === "M" ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setPeriodeJournee("M")}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="periode_journee"
                      value="M"
                      checked={periode_journee === "M"}
                      onChange={() => setPeriodeJournee("M")}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        periode_journee === "M"
                          ? "border-primary bg-primary"
                          : "border-muted"
                      }`}
                    />
                    <span className="font-medium">Matin</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Session programmée le matin
                  </p>
                </div>

                <div
                  className={`flex flex-col space-y-1 rounded-lg border p-4 cursor-pointer transition-colors ${
                    periode_journee === "S" ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setPeriodeJournee("S")}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="periode_journee"
                      value="S"
                      checked={periode_journee === "S"}
                      onChange={() => setPeriodeJournee("S")}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        periode_journee === "S"
                          ? "border-primary bg-primary"
                          : "border-muted"
                      }`}
                    />
                    <span className="font-medium">Soir</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Session programmée le soir
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Enregistrement...
                </>
              ) : (
                "Créer la session"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
