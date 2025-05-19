"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
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
  const [seances_mois, setSeancesMois] = useState<number | undefined>(undefined);

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
        await axios.post("http://localhost:8000/api/cours/session/", donneesCompletes);
        router.push("/ecole_peg/sessions/");
      } catch (erreur) {
        if (axios.isAxiosError(erreur)) {
          console.error("Erreur détaillée :", erreur.response?.data);
        } else {
          console.error("Erreur inconnue :", erreur);
        }
      }
    },
    [date_debut, date_fin, id_cours, id_enseignant, seances_mois, periode_journee, router]
  );

  useEffect(() => {
    async function fetchCours() {
      try {
        const reponse = await axios.get("http://localhost:8000/api/cours/cours/");
        setCours(reponse.data);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    async function fetchEnseignants() {
      try {
        const reponse = await axios.get("http://localhost:8000/api/cours/enseignants/");
        setEnseignants(reponse.data.enseignants);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchCours();
    fetchEnseignants();
  }, []);

  // Pour convertir l'input type="date" en Date JS
  function parseDateInput(e: React.ChangeEvent<HTMLInputElement>, setter: (d: Date | undefined) => void) {
    setter(e.target.value ? new Date(e.target.value) : undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ecole_peg/sessions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle Session</h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card>
          <CardHeader>
            <CardTitle>Détails de la session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cours">Cours</Label>
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
                      {cours.nom} {cours.type === "I" ? "intensif" : "semi-intensif"} {cours.niveau}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seances_mois">Séances par mois</Label>
              <Input
                id="seances_mois"
                type="number"
                required
                {...register("seances_mois", {
                  required: "Séances par mois est obligatoire",
                  valueAsNumber: true,
                })}
                onChange={(e) => setSeancesMois(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_debut">Date de début</Label>
              <Input
                id="date_debut"
                type="date"
                required
                onChange={e => parseDateInput(e, setDateDebut)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_fin">Date de fin</Label>
              <Input
                id="date_fin"
                type="date"
                required
                onChange={e => parseDateInput(e, setDateFin)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enseignant">Enseignant</Label>
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
            <div className="space-y-2">
              <Label htmlFor="periode_journee">Période de la journée</Label>
              <Select
                name="periode_journee"
                required
                onValueChange={(val) => setPeriodeJournee(val as "M" | "S")}
              >
                <SelectTrigger id="periode_journee">
                  <SelectValue placeholder="Choisir une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Matin</SelectItem>
                  <SelectItem value="S">Soir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacite_max">Capacité maximale</Label>
              <Input
                id="capacite_max"
                type="number"
                required
                {...register("capacite_max", {
                  required: "Capacité maximale est obligatoire",
                  valueAsNumber: true,
                })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "En cours..." : "Enregistrer"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
