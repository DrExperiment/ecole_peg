"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { useToast } from "@/components/use-toast";

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
interface SessionOut {
  id: number;
  cours__nom: string;
  cours__type: string;
  cours__niveau: string;
  date_debut: string; // YYYY-MM-DD
  date_fin: string;   // YYYY-MM-DD
  periode_journee: string | null;
  statut: string;
  seances_mois: number;
  capacite_max: number;
  cours: number;
  enseignant: number;
}

export default function ModifierSessionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string | undefined;

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm();

  const [date_debut, setDateDebut] = useState<Date | undefined>();
  const [date_fin, setDateFin] = useState<Date | undefined>();
  const [cours, setCours] = useState<Cours[]>([]);
  const [id_cours, setIdCours] = useState<number>();
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [id_enseignant, setIdEnseignant] = useState<number>();
  const [periode_journee, setPeriodeJournee] = useState<"M" | "S">("M");
  const [seances_mois, setSeancesMois] = useState<number>();
  const [capacite_max, setCapaciteMax] = useState<number>();

  // Préchargement des listes & données de session existante
  useEffect(() => {
    async function fetchAll() {
      try {
        const [coursRes, ensRes, sessionRes] = await Promise.all([
          axios.get("http://localhost:8000/api/cours/cours/"),
          axios.get("http://localhost:8000/api/cours/enseignants/"),
          axios.get(`http://localhost:8000/api/cours/sessions/${sessionId}/`),
        ]);
        setCours(coursRes.data);
        setEnseignants(Array.isArray(ensRes.data) ? ensRes.data : ensRes.data.enseignants);

        // Préremplir les champs
        const session: SessionOut = sessionRes.data;
        setIdCours(session.cours ?? coursRes.data.find((c: Cours) => c.nom === session.cours__nom)?.id);
        setIdEnseignant(session.enseignant ?? undefined);
        setDateDebut(new Date(session.date_debut));
        setDateFin(new Date(session.date_fin));
        setPeriodeJournee((session.periode_journee ?? "M") as "M" | "S");
        setSeancesMois(session.seances_mois);
        setCapaciteMax(session.capacite_max ?? 1);
        // RHF pour valeur initiale sur Input/Select non contrôlés :
        setValue("seances_mois", session.seances_mois);
        setValue("capacite_max", session.capacite_max);
      } catch {
        toast({ title: "Erreur", description: "Impossible de charger la session." });
        router.back();
      }
    }
    if (sessionId) fetchAll();
    // eslint-disable-next-line
  }, [sessionId, setValue]);

  // Conversion Input date → Date
  function parseDateInput(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (d: Date | undefined) => void,
  ) {
    setter(e.target.value ? new Date(e.target.value) : undefined);
  }

  // Soumission
  const onSoumission = useCallback(
    async (donnees: object) => {
      const donneesCompletes = {
        ...donnees,
        date_debut: date_debut ? format(date_debut, "yyyy-MM-dd") : undefined,
        date_fin: date_fin ? format(date_fin, "yyyy-MM-dd") : undefined,
        seances_mois,
        capacite_max,
        id_cours,
        id_enseignant,
        periode_journee,
      };

      try {
        await axios.put(
          `http://localhost:8000/api/cours/sessions/${sessionId}/`,
          donneesCompletes,
        );
        toast({ title: "Succès", description: "Session modifiée." });
        setTimeout(() => router.push("/ecole_peg/sessions/"), 1000);
      } catch (erreur) {
        if (axios.isAxiosError(erreur)) {
          toast({ title: "Erreur", description: JSON.stringify(erreur.response?.data) });
          console.error("Erreur détaillée :", erreur.response?.data);
        } else {
          toast({ title: "Erreur", description: "Erreur inconnue." });
        }
      }
    },
    [date_debut, date_fin, id_cours, id_enseignant, seances_mois, capacite_max, periode_journee, router, sessionId, toast],
  );

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
        <h1 className="text-3xl font-bold tracking-tight">Modifier la Session</h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Détails de la session</CardTitle>
            <p className="text-sm text-muted-foreground">
              Modifiez les informations de la session ci-dessous
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
                  value={id_cours ? String(id_cours) : ""}
                  name="id_cours"
                  required
                  onValueChange={(valeur) => setIdCours(Number(valeur))}
                >
                  <SelectTrigger id="cours">
                    <SelectValue placeholder="Sélectionner un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    {cours.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nom}{" "}
                        <span className="text-muted-foreground">
                          ({c.type === "I" ? "intensif" : "semi-intensif"} - {c.niveau})
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
                  value={id_enseignant ? String(id_enseignant) : ""}
                  name="enseignant"
                  required
                  onValueChange={(valeur) => setIdEnseignant(Number(valeur))}
                >
                  <SelectTrigger id="enseignant">
                    <SelectValue placeholder="Sélectionner un enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {enseignants.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.nom} {e.prenom}
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
                  value={date_debut ? format(date_debut, "yyyy-MM-dd") : ""}
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
                  min={date_debut ? format(date_debut, "yyyy-MM-dd") : undefined}
                  required
                  className="font-mono"
                  value={date_fin ? format(date_fin, "yyyy-MM-dd") : ""}
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
                  value={seances_mois ?? ""}
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
                  value={capacite_max ?? ""}
                  {...register("capacite_max", {
                    required: "Capacité maximale est obligatoire",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "La capacité doit être d'au moins 1",
                    },
                  })}
                  onChange={(e) => setCapaciteMax(Number(e.target.value))}
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
                "Enregistrer les modifications"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
