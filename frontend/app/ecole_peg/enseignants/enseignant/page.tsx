"use client";

import type React from "react";

import { useCallback } from "react";
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
import { ArrowLeft } from "lucide-react";
import { fetchApi } from "@/lib/utils";
import { useForm } from "react-hook-form";
import axios from "axios";
export default function NouveauEnseignantPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const router = useRouter();

  const onSoumission = useCallback(
    async (donnees: object) => {
      try {
        await axios.post("http://localhost:8000/api/cours/enseignant/", donnees);

        router.push("/ecole_peg/enseignants/");
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    },
    [router]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ecole_peg/enseignants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Nouveau Enseignant
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card>
          <CardHeader>
            <CardTitle>Détails personnels de l&apos;enseignant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                placeholder="Nom"
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
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                placeholder="Prénom"
                required
                {...register("prenom", {
                  required: "Prénom est obligatoire",
                  pattern: {
                    value: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
                    message:
                      "Le prénom ne doit contenir que des lettres, espaces, apostrophes ou tirets.",
                  },
                  setValueAs: (v) => v.trim(),
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
