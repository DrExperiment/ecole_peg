"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
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
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { CalendarIcon, ArrowLeft, Save } from "lucide-react";
import { Textarea } from "@/components/textarea";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

export default function EditElevePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [sexe, setSexe] = useState<"H" | "F">("H");
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>(undefined);
  const [niveau, setNiveau] = useState<"A1" | "A2" | "B1" | "B2" | "C1">("A1");
  const [typePermis, setTypePermis] = useState<"E" | "S" | "B" | "P">("P");
  const [datePermis, setDatePermis] = useState<Date | undefined>(undefined);
  const [paysList, setPaysList] = useState<Pays[]>([]);
  const [idPays, setIdPays] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("ID résolu depuis params:", id);
    async function fetchData() {
      const [{ data: e }, { data: pays }] = await Promise.all([
        axios.get<Eleve>(`http://localhost:8000/api/eleves/eleve/${id}/`),
        axios.get<Pays[]>(`http://localhost:8000/api/eleves/pays/`),
      ]);
      setEleve(e);
      setSexe(e.sexe);
      setDateNaissance(new Date(e.date_naissance));
      setNiveau(e.niveau);
      setTypePermis(e.type_permis ?? "P");
      setDatePermis(e.date_permis ? new Date(e.date_permis) : undefined);
      setIdPays(e.pays_id);
      setPaysList(pays);
    }
    fetchData().catch(console.error);
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      await axios.put(`http://localhost:8000/api/eleves/eleves/${id}/`, payload);
      router.push(`/ecole_peg/eleves/eleve/${id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!eleve) return <p>Chargement…</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ecole_peg/eleves/eleve/${eleve.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Modifier l’élève</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Détails personnels</CardTitle>
            <CardDescription>
              Modifie les infos de base de l’élève
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" name="nom" value={eleve.nom} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" name="prenom" value={eleve.prenom} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <Label>Sexe</Label>
              <RadioGroup value={sexe} onValueChange={(v) => setSexe(v as "H" | "F")} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="H" id="sexe-h" />
                  <Label htmlFor="sexe-h">Homme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="F" id="sexe-f" />
                  <Label htmlFor="sexe-f">Femme</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Date de naissance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left", !dateNaissance && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateNaissance ? format(dateNaissance, "dd-MM-yyyy", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar mode="single" selected={dateNaissance} onSelect={setDateNaissance} />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
              <Input id="lieu_naissance" name="lieu_naissance" value={eleve.lieu_naissance} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="pays">Pays</Label>
              <Select value={String(idPays)} onValueChange={(v) => setIdPays(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un pays" />
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

            <div>
              <Label htmlFor="langue_maternelle">Langue maternelle</Label>
              <Input id="langue_maternelle" name="langue_maternelle" value={eleve.langue_maternelle ?? ""} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="autres_langues">Autres langues</Label>
              <Input id="autres_langues" name="autres_langues" value={eleve.autres_langues ?? ""} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coordonnées & adresse</CardTitle>
            <CardDescription>
              Modifie téléphone, email et adresse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" name="telephone" value={eleve.telephone} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={eleve.email} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rue">Rue</Label>
                <Input id="rue" name="rue" value={eleve.rue ?? ""} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="numero">Numéro</Label>
                <Input id="numero" name="numero" value={eleve.numero ?? ""} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="npa">NPA</Label>
                <Input id="npa" name="npa" value={eleve.npa ?? ""} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="localite">Localité</Label>
                <Input id="localite" name="localite" value={eleve.localite ?? ""} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="adresse_facturation">Adresse de facturation</Label>
              <Textarea id="adresse_facturation" name="adresse_facturation" value={eleve.adresse_facturation ?? ""} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Niveau & permis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Langue niveau</Label>
              <Select value={niveau} onValueChange={(v) => setNiveau(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {["A1", "A2", "B1", "B2", "C1"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type de permis</Label>
              <Select value={typePermis} onValueChange={(v) => setTypePermis(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E">Permis étudiant</SelectItem>
                  <SelectItem value="S">Permis S</SelectItem>
                  <SelectItem value="B">Permis B</SelectItem>
                  <SelectItem value="P">Pas de permis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date de permis</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left", !datePermis && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {datePermis ? format(datePermis, "dd-MM-yyyy", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar mode="single" selected={datePermis} onSelect={setDatePermis} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="col-span-2">
              <Label htmlFor="src_decouverte">Source de découverte</Label>
              <Textarea id="src_decouverte" name="src_decouverte" value={eleve.src_decouverte ?? ""} onChange={handleChange} />
            </div>

            <div className="col-span-2">
              <Label htmlFor="commentaires">Commentaires</Label>
              <Textarea id="commentaires" name="commentaires" value={eleve.commentaires ?? ""} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
