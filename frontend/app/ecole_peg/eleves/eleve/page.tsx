"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Checkbox } from "@/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { ArrowLeft, Save } from "lucide-react";
import { Textarea } from "@/components/textarea";

import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Pays {
  id: number;
  nom: string;
}

export default function NouveauElevePage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm();

  const router = useRouter();

  const [sexe, setSexe] = useState<"H" | "F">("H");
  const [date_naissance, setDateNaissance] = useState<Date | undefined>(undefined);
  const [niveau, setNiveau] = useState<"A1" | "A2" | "B1" | "B2" | "C1">("A1");
  const [type_permis, setTypePermis] = useState<"E" | "S" | "B" | "P">("P");
  const [date_permis, setDatePermis] = useState<Date | undefined>(undefined);
  const [pays, setPays] = useState<Pays[]>([]);
  const [id_pays, setIdPays] = useState<number>();
  const [a_garant, setAGarant] = useState<boolean>(false);

  const onSoumission = useCallback(
    async (donnees: object) => {
      const now = new Date();
      if (date_naissance && date_naissance > now) {
        setError("date_naissance", {
          message: "La date de naissance ne peut être dans le futur.",
        });
        return;
      }

      const donneesCompletes = {
        ...donnees,
        sexe,
        date_naissance: date_naissance
          ? format(date_naissance, "yyyy-MM-dd")
          : undefined,
        niveau,
        type_permis,
        date_permis: date_permis
          ? format(date_permis, "yyyy-MM-dd")
          : undefined,
        pays_id: id_pays,
      };

      try {
        const reponse = await axios.post(
          "http://localhost:8000/api/eleves/eleve/",
          donneesCompletes
        );
        if (a_garant)
          router.push(`/ecole_peg/eleves/eleve/${reponse.data.id}/garant/`);
        else router.push(`/ecole_peg/eleves/eleve/${reponse.data.id}/`);
      } catch (error: any) {
        alert("Erreur lors de la soumission. Vérifie tous les champs obligatoires.");
      }
    },
    [
      a_garant,
      date_naissance,
      date_permis,
      id_pays,
      niveau,
      router,
      setError,
      sexe,
      type_permis,
    ]
  );

  useEffect(() => {
    async function fetchPays() {
      try {
        const donnees: Pays[] = (await axios.get("http://localhost:8000/api/eleves/pays/")).data;
        setPays(donnees);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    fetchPays();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ecole_peg/eleves">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nouvel Élève</h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)} noValidate>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Détails personnels */}
          <Card>
            <CardHeader>
              <CardTitle>Détails personnels</CardTitle>
              <CardDescription>
                Veuillez saisir les informations personnelles de l&apos;élève.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    placeholder="ex: Dupont"
                    autoFocus
                    required
                    {...register("nom", {
                      required: true,
                      pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
                      setValueAs: (v) => v.trim(),
                    })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    placeholder="ex: Jean"
                    required
                    {...register("prenom", {
                      required: true,
                      pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
                      setValueAs: (v) => v.trim(),
                    })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sexe</Label>
                <RadioGroup
                  value={sexe}
                  onValueChange={(valeur) => setSexe(valeur as "H" | "F")}
                  className="flex gap-6"
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="sexe-h" value="H" />
                    <Label htmlFor="sexe-h">Homme</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="sexe-f" value="F" />
                    <Label htmlFor="sexe-f">Femme</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_naissance">Date de naissance</Label>
                <Input
                  type="date"
                  id="date_naissance"
                  required
                  className="w-full"
                  value={date_naissance ? format(date_naissance, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDateNaissance(value ? new Date(value) : undefined);
                  }}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
                <Input
                  id="lieu_naissance"
                  placeholder="ex: Paris"
                  {...register("lieu_naissance")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Pays</Label>
                <Select
                  value={id_pays ? id_pays.toString() : ""}
                  onValueChange={(valeur) => setIdPays(Number(valeur))}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {pays.map((pays) => (
                      <SelectItem key={pays.id} value={pays.id.toString()}>
                        {pays.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="langue_maternelle">Langue maternelle (optionnel)</Label>
                <Input
                  id="langue_maternelle"
                  placeholder="ex: Français"
                  {...register("langue_maternelle")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autres_langues">Autres langues (optionnel)</Label>
                <Input
                  id="autres_langues"
                  placeholder="ex: Anglais, Espagnol"
                  {...register("autres_langues")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select
                  value={niveau}
                  onValueChange={(valeur) => setNiveau(valeur as "A1" | "A2" | "B1" | "B2" | "C1")}
                  required
                  disabled={isSubmitting}
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
                <Label>Type de permis</Label>
                <Select
                  value={type_permis}
                  onValueChange={(valeur) => setTypePermis(valeur as "E" | "S" | "B" | "P")}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de permis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="E">Permis étudiant</SelectItem>
                    <SelectItem value="S">Permis S</SelectItem>
                    <SelectItem value="B">Permis B</SelectItem>
                    <SelectItem value="P">Pas de permis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_permis">Date d&apos;expiration du permis (optionnel)</Label>
                <Input
                  type="date"
                  id="date_permis"
                  className="w-full"
                  value={date_permis ? format(date_permis, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDatePermis(value ? new Date(value) : undefined);
                  }}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="src_decouverte">Source de découverte (optionnel)</Label>
                <Textarea
                  id="src_decouverte"
                  placeholder="Comment l'élève a-t-il connu l'école ?"
                  {...register("src_decouverte")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentaire">Commentaires (optionnel)</Label>
                <Textarea
                  id="commentaires"
                  placeholder="Commentaires supplémentaires"
                  {...register("commentaires")}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Coordonnées */}
          <Card>
            <CardHeader>
              <CardTitle>Coordonnées de contact</CardTitle>
              <CardDescription>
                Veuillez saisir les coordonnées de l&apos;élève.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="ex: 079 123 45 67"
                  required
                  {...register("telephone", {
                    required: true,
                    pattern: /^(?:(?:\+|00)41\s?|0)(?:\d{2}\s?){4}\d{2}$/,
                    setValueAs: (v) => v.trim(),
                  })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ex: jean.dupont@email.com"
                  required
                  {...register("email", {
                    required: true,
                    setValueAs: (v) => v.trim(),
                  })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rue">Rue (optionnel)</Label>
                  <Input id="rue" placeholder="ex: Rue du Lac" {...register("rue")} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Numéro (optionnel)</Label>
                  <Input id="numero" placeholder="ex: 12B" {...register("numero")} disabled={isSubmitting} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="npa">NPA (optionnel)</Label>
                  <Input id="npa" placeholder="ex: 1000" {...register("npa")} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localite">Localité (optionnel)</Label>
                  <Input id="localite" placeholder="ex: Lausanne" {...register("localite")} disabled={isSubmitting} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse_facturation">Adresse de facturation (optionnel)</Label>
                <Textarea
                  id="adresse_facturation"
                  placeholder="Adresse de facturation"
                  {...register("adresse_facturation")}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Garant */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Présence d&apos;un garant</CardTitle>
              <CardDescription>
                Veuillez confirmer si l&apos;élève dispose d&apos;un garant.
                Les informations complémentaires vous seront demandées après la validation de ce formulaire.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 pb-4">
                <Checkbox
                  id="a_garant"
                  checked={a_garant}
                  onCheckedChange={() => setAGarant(!a_garant)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="a_garant">
                  L&apos;élève dispose d&apos;un garant
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "En cours..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
