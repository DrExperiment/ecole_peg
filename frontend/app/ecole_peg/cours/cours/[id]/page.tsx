"use client";

import { useEffect, useState } from "react";
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
import {} from "@/components/select";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import axios from "axios";

interface CoursIn {
  nom: string;
  type: "I" | "S";
  niveau: "A1" | "A2" | "B1" | "B2" | "C1";
  heures_par_semaine: number;
  duree_semaines: number;
  tarif: number;
}

export default function ModifierCoursPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [cours, setCours] = useState<CoursIn | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCours() {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/cours/cours/${id}/`,
        );
        setCours(res.data);
      } catch {
        setMessage("Erreur lors du chargement du cours.");
      }
    }
    if (id) fetchCours();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cours) return;
    const { name, value } = e.target;
    setCours({
      ...cours,
      [name]:
        name === "heures_par_semaine" ||
        name === "duree_semaines" ||
        name === "tarif"
          ? Number(value)
          : value,
    });
  };

  const handleTypeChange = (val: string) => {
    if (!cours) return;
    setCours({ ...cours, type: val as "I" | "S" });
  };

  const handleNiveauChange = (val: string) => {
    if (!cours) return;
    setCours({ ...cours, niveau: val as "A1" | "A2" | "B1" | "B2" | "C1" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await axios.put(`http://localhost:8000/api/cours/cours/${id}/`, cours);
      setMessage("Cours modifié avec succès !");
      setTimeout(() => router.push("/ecole_peg/cours"), 1200);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.erreurs) {
        setMessage("Erreurs : " + JSON.stringify(err.response.data.erreurs));
      } else {
        setMessage("Erreur lors de la modification.");
      }
    }
  };

  if (!cours) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-muted-foreground">Chargement du cours...</p>
        </div>
      </div>
    );
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier le cours
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{cours.nom}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Détails du cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-base">
                Nom du cours
              </Label>
              <Input
                id="nom"
                name="nom"
                value={cours.nom}
                onChange={handleChange}
                placeholder="ex: Français débutant"
                className="font-medium"
                required
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base">Type de cours</Label>
              <RadioGroup
                value={cours.type}
                onValueChange={handleTypeChange}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  {
                    value: "I",
                    label: "Intensif",
                    desc: "Progression rapide, rythme soutenu",
                  },
                  {
                    value: "S",
                    label: "Semi-intensif",
                    desc: "Progression modérée, plus flexible",
                  },
                ].map(({ value, label, desc }) => (
                  <div
                    key={value}
                    className={`flex flex-col space-y-1 rounded-lg border p-4 cursor-pointer transition-colors ${
                      cours.type === value ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleTypeChange(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={value}
                        id={`type-${value.toLowerCase()}`}
                      />
                      <Label
                        htmlFor={`type-${value.toLowerCase()}`}
                        className="font-medium"
                      >
                        {label}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{desc}</p>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label className="text-base">Niveau</Label>
              <RadioGroup
                value={cours.niveau}
                onValueChange={handleNiveauChange}
                className="grid grid-cols-5 gap-2"
              >
                {["A1", "A2", "B1", "B2", "C1"].map((n) => (
                  <div
                    key={n}
                    className={`relative flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      cours.niveau === n ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <RadioGroupItem
                      value={n}
                      id={`niveau-${n}`}
                      className="absolute inset-0 opacity-0"
                    />
                    <Label
                      htmlFor={`niveau-${n}`}
                      className="font-medium cursor-pointer"
                    >
                      {n}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duree_semaines" className="text-base">
                  Durée (semaines)
                </Label>
                <Input
                  id="duree_semaines"
                  type="number"
                  name="duree_semaines"
                  value={cours.duree_semaines}
                  min={1}
                  max={52}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="font-mono"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Entre 1 et 52 semaines
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="heures_par_semaine" className="text-base">
                  Heures par semaine
                </Label>
                <Input
                  id="heures_par_semaine"
                  type="number"
                  name="heures_par_semaine"
                  value={cours.heures_par_semaine}
                  min={1}
                  max={40}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="font-mono"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Entre 1 et 40 heures
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarif" className="text-base">
                Tarif (CHF)
              </Label>
              <div className="relative">
                <Input
                  id="tarif"
                  type="number"
                  name="tarif"
                  value={cours.tarif}
                  min={0}
                  step="0.01"
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="pl-8 font-mono"
                  placeholder="0.00"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  CHF
                </span>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  message.includes("succès")
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {message}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {message?.includes("succès") ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Redirection...
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
