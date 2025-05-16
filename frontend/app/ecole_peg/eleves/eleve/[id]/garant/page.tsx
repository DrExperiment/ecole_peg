"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
}

export default function NouveauGarantPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const router = useRouter();
  const params = useParams();
console.log("params :", params);

  const eleveId = Array.isArray(params?.id) ? params.id[0] : params?.id;


  

  const [eleve, setEleve] = useState<Eleve | null>(null);

  const onSoumission = useCallback(async (donnees: object) => {
    try {
      await axios.post(`http://localhost:8000/api/eleves/eleves/${eleveId}/garant/`, donnees);
      router.push(`/ecole_peg/eleves/eleve/${eleveId}/`);
    } catch (erreur) {
      console.error("Erreur lors de l'ajout du garant :", erreur);
    }
  }, [eleve?.id, router]);

  useEffect(() => {
    async function fetchEleve() {
      try {
        console.log("eleveId récupéré:", eleveId);

        const response = await axios.get(`http://localhost:8000/api/eleves/eleve/${eleveId}/`);
        setEleve(response.data);
        console.log("Réponse reçue:", response.data);

        
      } catch (erreur) {
        console.error("Erreur lors du chargement de l'élève :", erreur);
      }
    }

    if (eleveId) {
      fetchEleve();
    }
  }, [eleveId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ecole_peg/eleves/eleve/${eleve?.id}/`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Ajouter le garant de {eleve?.nom} {eleve?.prenom}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card>
          <CardHeader>
            <CardTitle>Garant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du garant</Label>
                <Input
                  id="nom"
                  placeholder="Nom du garant"
                  {...register("nom", {
                    pattern: {
                      value: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
                      message: "Le nom ne doit contenir que des lettres, espaces, apostrophes ou tirets.",
                    },
                    setValueAs: (v) => v.trim(),
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom du garant</Label>
                <Input
                  id="prenom"
                  placeholder="Prénom du garant"
                  {...register("prenom", {
                    pattern: {
                      value: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
                      message: "Le prénom ne doit contenir que des lettres, espaces, apostrophes ou tirets.",
                    },
                    setValueAs: (v) => v.trim(),
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone du garant</Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="Numéro de téléphone"
                  {...register("telephone", {
                    pattern: {
                      value: /^(?:(?:\+|00)33\s?|0)[1-9](?:[\s.-]*\d{2}){4}$/,
                      message: "Le numéro de téléphone doit être au format français.",
                    },
                    setValueAs: (v) => v.trim(),
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email du garant</Label>
              <Input
                id="email"
                type="email"
                placeholder="Adresse email"
                {...register("email", {
                  setValueAs: (v) => v.trim(),
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rue">Rue</Label>
                <Input id="rue" placeholder="Rue" {...register("rue")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Numéro</Label>
                <Input id="numero" placeholder="Numéro" {...register("numero")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="npa">NPA</Label>
                <Input id="npa" placeholder="NPA" {...register("npa")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localite">Localité</Label>
                <Input id="localite" placeholder="Localité" {...register("localite")} />
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
