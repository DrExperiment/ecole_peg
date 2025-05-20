"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
import { RadioGroupItem } from "@/components/radio-group";
import { ArrowLeft, Save } from "lucide-react";
import { Textarea } from "@/components/textarea";
import { RadioGroup } from "@/components/radio-group";

import { format } from "date-fns";

interface Pays {
  id: number;
  nom: string;
}

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  sexe: "H" | "F";
  rue?: string;
  numero?: string;
  npa?: string;
  localite?: string;
  telephone: string;
  email: string;
  adresse_facturation?: string;
  type_permis?: "E" | "S" | "B" | "P";
  date_permis?: string;
  niveau: "A1" | "A2" | "B1" | "B2" | "C1";
  langue_maternelle?: string;
  autres_langues?: string;
  src_decouverte?: string;
  commentaires?: string;
  pays_id: number;
}

export default function EditElevePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [sexe, setSexe] = useState<"H" | "F">("H");
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>(
    undefined,
  );
  const [niveau, setNiveau] = useState<"A1" | "A2" | "B1" | "B2" | "C1">("A1");
  const [typePermis, setTypePermis] = useState<"E" | "S" | "B" | "P">("P");
  const [datePermis, setDatePermis] = useState<Date | undefined>(undefined);
  const [paysList, setPaysList] = useState<Pays[]>([]);
  const [idPays, setIdPays] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [{ data: e }, { data: pays }] = await Promise.all([
        axios.get<Eleve>(`http://localhost:8000/api/eleves/eleve/${id}/`),
        axios.get<Pays[]>(`http://localhost:8000/api/eleves/pays/`),
      ]);

      setPaysList(pays); // ⬅️ mettre en premier
      setEleve(e);
      setSexe(e.sexe);
      setDateNaissance(new Date(e.date_naissance));
      setNiveau(e.niveau);
      setTypePermis(e.type_permis ?? "P");
      setDatePermis(e.date_permis ? new Date(e.date_permis) : undefined);
      setIdPays(e.pays_id); // ⬅️ mettre après que paysList est défini
    }

    fetchData().catch(console.error);
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEleve((prev) => (prev ? ({ ...prev, [name]: value } as Eleve) : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eleve) return;
    setIsSubmitting(true);

    const payload = {
      ...eleve,
      sexe,
      date_naissance: dateNaissance
        ? format(dateNaissance, "yyyy-MM-dd")
        : undefined,
      niveau,
      type_permis: typePermis,
      date_permis: datePermis ? format(datePermis, "yyyy-MM-dd") : undefined,
      pays_id: idPays,
    };

    try {
      await axios.put(
        `http://localhost:8000/api/eleves/eleves/${id}/`,
        payload,
      );
      router.push(`/ecole_peg/eleves/eleve/${id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!eleve) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
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
            Modifier l&apos;élève
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {eleve.prenom} {eleve.nom}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Détails personnels */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Détails personnels</CardTitle>
              <CardDescription>
                Informations personnelles de l&apos;élève
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-base">
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={eleve.nom}
                    onChange={handleChange}
                    className="font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-base">
                    Prénom
                  </Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    value={eleve.prenom}
                    onChange={handleChange}
                    className="font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base">Sexe</Label>
                <RadioGroup
                  value={sexe}
                  onValueChange={(value) => setSexe(value as "H" | "F")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div
                    className={`relative flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-colors ${
                      sexe === "H" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <RadioGroupItem value="H" id="sexe-h" />
                    <Label
                      htmlFor="sexe-h"
                      className="font-medium cursor-pointer"
                    >
                      Homme
                    </Label>
                  </div>
                  <div
                    className={`relative flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-colors ${
                      sexe === "F" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <RadioGroupItem value="F" id="sexe-f" />
                    <Label
                      htmlFor="sexe-f"
                      className="font-medium cursor-pointer"
                    >
                      Femme
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Date de naissance</Label>
                <Input
                  type="date"
                  id="date_naissance"
                  name="date_naissance"
                  required
                  className="font-mono"
                  value={
                    dateNaissance ? format(dateNaissance, "yyyy-MM-dd") : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setDateNaissance(value ? new Date(value) : undefined);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lieu_naissance" className="text-base">
                  Lieu de naissance
                </Label>
                <Input
                  id="lieu_naissance"
                  name="lieu_naissance"
                  value={eleve.lieu_naissance}
                  onChange={handleChange}
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pays" className="text-base">
                  Pays d&apos;origine
                </Label>
                <Select
                  value={idPays ? String(idPays) : ""}
                  onValueChange={(v) => setIdPays(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {paysList.find((p) => p.id === idPays)?.nom ||
                        "Sélectionner un pays"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paysList.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="langue_maternelle" className="text-base">
                  Langue maternelle
                </Label>
                <Input
                  id="langue_maternelle"
                  name="langue_maternelle"
                  value={eleve.langue_maternelle ?? ""}
                  onChange={handleChange}
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autres_langues" className="text-base">
                  Autres langues
                </Label>
                <Input
                  id="autres_langues"
                  name="autres_langues"
                  value={eleve.autres_langues ?? ""}
                  onChange={handleChange}
                  className="font-medium"
                  placeholder="Séparées par des virgules"
                />
              </div>
            </CardContent>
          </Card>

          {/* Coordonnées */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Coordonnées</CardTitle>
              <CardDescription>
                Informations de contact et adresse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-base">
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={eleve.telephone}
                  onChange={handleChange}
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={eleve.email}
                  onChange={handleChange}
                  className="font-medium"
                  required
                />
              </div>

              <div className="relative rounded-lg border bg-card p-4 space-y-4">
                <h3 className="font-medium">Adresse</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rue" className="text-sm">
                      Rue
                    </Label>
                    <Input
                      id="rue"
                      name="rue"
                      value={eleve.rue ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero" className="text-sm">
                      Numéro
                    </Label>
                    <Input
                      id="numero"
                      name="numero"
                      value={eleve.numero ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="npa" className="text-sm">
                      NPA
                    </Label>
                    <Input
                      id="npa"
                      name="npa"
                      value={eleve.npa ?? ""}
                      onChange={handleChange}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="localite" className="text-sm">
                      Localité
                    </Label>
                    <Input
                      id="localite"
                      name="localite"
                      value={eleve.localite ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse_facturation" className="text-base">
                  Adresse de facturation
                  <span className="text-sm text-muted-foreground ml-2">
                    (si différente)
                  </span>
                </Label>
                <Textarea
                  id="adresse_facturation"
                  name="adresse_facturation"
                  value={eleve.adresse_facturation ?? ""}
                  onChange={handleChange}
                  placeholder="Laisser vide si identique à l'adresse principale"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Niveau et Permis */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Niveau & Permis de séjour</CardTitle>
            <CardDescription>
              Niveau de langue et informations administratives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base">Niveau de langue</Label>
                <RadioGroup
                  value={niveau}
                  onValueChange={(value) =>
                    setNiveau(value as "A1" | "A2" | "B1" | "B2" | "C1")
                  }
                  className="grid grid-cols-5 gap-2"
                >
                  {["A1", "A2", "B1", "B2", "C1"].map((n) => (
                    <div
                      key={n}
                      className={`relative flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        niveau === n ? "border-primary bg-primary/5" : ""
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

              <div className="space-y-4">
                <Label className="text-base">Type de permis</Label>
                <RadioGroup
                  value={typePermis}
                  onValueChange={(value) =>
                    setTypePermis(value as "E" | "S" | "B" | "P")
                  }
                  className="grid grid-cols-2 gap-4"
                >
                  {[
                    {
                      value: "E",
                      label: "Permis étudiant",
                      desc: "Pour les étudiants",
                    },
                    {
                      value: "S",
                      label: "Permis S",
                      desc: "Protection temporaire",
                    },
                    { value: "B", label: "Permis B", desc: "Séjour annuel" },
                    {
                      value: "P",
                      label: "Pas de permis",
                      desc: "Aucun permis requis",
                    },
                  ].map(({ value, label, desc }) => (
                    <div
                      key={value}
                      className={`flex flex-col space-y-1 rounded-lg border p-4 cursor-pointer transition-colors ${
                        typePermis === value
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={value}
                          id={`permis-${value}`}
                          className="sr-only"
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${
                            typePermis === value ? "bg-primary" : "bg-muted"
                          }`}
                        />
                        <Label
                          htmlFor={`permis-${value}`}
                          className="font-medium cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground pl-4">
                        {desc}
                      </p>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {typePermis !== "P" && (
                <div className="space-y-2">
                  <Label className="text-base">Date du permis</Label>
                  <Input
                    type="date"
                    id="date_permis"
                    name="date_permis"
                    className="font-mono"
                    value={datePermis ? format(datePermis, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDatePermis(value ? new Date(value) : undefined);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="src_decouverte" className="text-base">
                  Comment avez-vous connu l&apos;école ?
                </Label>
                <Textarea
                  id="src_decouverte"
                  name="src_decouverte"
                  value={eleve.src_decouverte ?? ""}
                  onChange={handleChange}
                  placeholder="Internet, recommandation, publicité..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentaires" className="text-base">
                  Commentaires
                  <span className="text-sm text-muted-foreground ml-2">
                    (optionnel)
                  </span>
                </Label>
                <Textarea
                  id="commentaires"
                  name="commentaires"
                  value={eleve.commentaires ?? ""}
                  onChange={handleChange}
                  placeholder="Informations supplémentaires..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}
