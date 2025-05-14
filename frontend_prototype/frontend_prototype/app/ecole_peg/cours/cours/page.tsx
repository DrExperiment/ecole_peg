"use client";

import type React from "react";

import { useCallback, useState } from "react";
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
import { fetchApi } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";

export default function NouveauCoursPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const router = useRouter();

  const [type, setType] = useState<"I" | "S">("I");
  const [niveau, setNiveau] = useState<"A1" | "A2" | "B1" | "B2" | "C1">("A1");

  const onSoumission = useCallback(
    async (donnees: object) => {
      const donneesCompletes = {
        ...donnees,
        type,
        niveau,
      };

      try {
        await fetchApi("/cours/cours/", {
          method: "POST",
          body: donneesCompletes,
        });

        router.push("/ecole_peg/cours/");
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    },
    [niveau, router, type]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ecole_peg/cours">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau Cours</h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card>
          <CardHeader>
            <CardTitle>Détails du cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                placeholder="Nom de cours"
                required
                {...register("nom", {
                  required: "Nom est obligatoire",
                  pattern: {
                    value: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
                    message:
                      "Le nom ne doit contenir que des lettres, espaces, apostrophes ou tirets.",
                  },
                  setValueAs: (v) => v.trim(),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <RadioGroup
                defaultValue={type}
                className="flex gap-4"
                onValueChange={(valeur) => setType(valeur as "I" | "S")}
                required
                id="type"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="I" />
                  <Label htmlFor="type-i">Intensif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="S" />
                  <Label htmlFor="type-s">Semi-intensif</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niveau">Niveau</Label>
              <Select
                name="niveau"
                required
                onValueChange={(valeur) =>
                  setNiveau(valeur as "A1" | "A2" | "B1" | "B2" | "C1")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duree_semaines">Nombre de semaines</Label>
              <Input
                id="duree_semaines"
                type="number"
                required
                {...register("duree_semaines", {
                  required: "Le nombre de semaines est obligatoire",
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heures_par_semaine">
                Nombre d&apos;heures par semaine
              </Label>
              <Input
                id="heures_par_semaine"
                type="number"
                required
                {...register("heures_par_semaine", {
                  required: "Le nombre d'heures par semaine est obligatoire",
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarif">Tarif</Label>
              <Input
                id="tarif"
                type="number"
                required
                {...register("tarif", {
                  required: "Tarif est obligatoire",
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
