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
import { CalendarIcon, ArrowLeft, Save } from "lucide-react";
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";

import { cn, fetchApi } from "@/lib/utils";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/textarea";

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

  const [sexe, setSexe] = useState<"M" | "F">("M");
  const [date_naissance, setDateNaissance] = useState<Date | undefined>(
    undefined
  );

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
        a_garant,
        sexe,
        date_naissance: date_naissance
        ? format(date_naissance, "yyyy-MM-dd")
        : undefined,
        niveau,
        type_permis,
        date_permis: date_permis
        ? format(date_permis, "yyyy-MM-dd")
        : undefined,
        id_pays,
      };

      try {
        console.log("Payload envoyée :", donneesCompletes);
        await axios.post("http://localhost:8000/api/eleves/eleve/", donneesCompletes);

       
        router.push("/ecole_peg/eleves/");
      } catch (erreur) {
        console.error("Erreur: ", erreur);
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
        <h1 className="text-3xl font-bold tracking-tight">Nouveau Elève</h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <div className="grid gap-4 md:grid-cols-2">
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
                    placeholder="Nom de famille"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe</Label>
                <RadioGroup
                  defaultValue={sexe}
                  className="flex gap-4"
                  onValueChange={(valeur) => setSexe(valeur as "M" | "F")}
                  required
                  id="sexe"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" />
                    <Label htmlFor="sexe-m">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="F" />
                    <Label htmlFor="sexe-f">Femelle</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_naissance">Date de naissance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date_naissance && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date_naissance ? (
                        format(date_naissance, "dd-MM-yyyy", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date_naissance}
                      onSelect={setDateNaissance}
                      required
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
                <Input
                  id="lieu_naissance"
                  placeholder="Lieu de naissance"
                  {...register("lieu_naissance")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pays">Pays</Label>
                <Select
                  name="id_pays"
                  required
                  onValueChange={(valeur) => setIdPays(Number(valeur))}
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
                <Label htmlFor="langue_maternelle">Langue maternelle</Label>
                <Input
                  id="langue_maternelle"
                  placeholder="Langue maternelle"
                  {...register("langue_maternelle")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autres_langues">Autres langues</Label>
                <Input
                  id="autres_langues"
                  placeholder="Autres langues"
                  {...register("autres_langues")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="niveau">Niveau</Label>
                <Select
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
                <Label htmlFor="type_permis">Type de permis</Label>
                <Select
                  onValueChange={(valeur) =>
                    setTypePermis(valeur as "E" | "S" | "B" | "P")
                  }
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
                <Label htmlFor="date_permis">
                  Date d&apos;expiration de permis
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date_permis && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date_permis ? (
                        format(date_permis, "dd-MM-yyyy", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date_permis}
                      onSelect={setDatePermis}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="src_decouverte">Source de découverte</Label>
                <Textarea
                  id="src_decouverte"
                  placeholder="Source de découverte"
                  {...register("src_decouverte")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse_facturation">Commentaires</Label>
                <Textarea
                  id="commentaires"
                  placeholder="Commentaires"
                  {...register("commentaires")}
                />
              </div>
            </CardContent>
          </Card>

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
                  placeholder="Numéro de téléphone"
                  required
                  {...register("telephone", {
                    required: "Numéro de téléphone est obligatoire",
                    pattern: {
                      value: /^(?:(?:\+|00)33\s?|0)[1-9](?:[\s.-]*\d{2}){4}$/,
                      message:
                        "Le numéro de téléphone doit être au format suisse.",
                    },
                    setValueAs: (v) => v.trim(),
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Adresse email"
                  required
                  {...register("email", {
                    required: "Adresse email est obligatoire",
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
                  <Input
                    id="numero"
                    placeholder="Numéro"
                    {...register("numero")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="npa">NPA</Label>
                  <Input id="npa" placeholder="NPA" {...register("npa")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localite">Localité</Label>
                  <Input
                    id="localite"
                    placeholder="Localité"
                    {...register("localite")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse_facturation">
                  Adresse du facturation
                </Label>
                <Textarea
                  id="adresse_facturation"
                  placeholder="Adresse du facturation"
                  {...register("adresse_facturation")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 pb-4">
                <Button type="submit" disabled={isSubmitting} ><Link href={"/ecole_peg/eleves/eleve/garant/"}>Ajouter Garant</Link></Button>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "En cours..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
