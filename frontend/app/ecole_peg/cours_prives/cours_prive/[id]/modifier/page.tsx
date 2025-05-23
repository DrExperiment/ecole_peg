"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { debounce } from "lodash";

import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/use-toast";

// Types
interface Eleve {
  id: number;
  nom: string;
  prenom: string;
}
interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
}
interface CoursPriveOut {
  id: number;
  date_cours_prive: string;
  heure_debut: string;
  heure_fin: string;
  tarif: number;
  lieu: "E" | "D";
  enseignant: number;
  enseignant__nom: string;
  enseignant__prenom: string;
  eleves_ids: number[] | string[];
  eleves: string[];
}

export default function ModifierCoursPrivePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const id = params?.id as string | undefined;

  // ==== États
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Eleve[]>([]);
  const [selectedEleves, setSelectedEleves] = useState<Eleve[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [selectedEnseignant, setSelectedEnseignant] = useState<Enseignant | null>(null);

  const [dateCoursPrive, setDateCoursPrive] = useState<string>("");
  const [heureDebut, setHeureDebut] = useState<string>("");
  const [heureFin, setHeureFin] = useState<string>("");
  const [tarif, setTarif] = useState<string>("");
  const [lieu, setLieu] = useState<"ecole" | "domicile">("ecole");

  const [loading, setLoading] = useState(true);

  // ==== Charger cours privé et listes ====
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [coursRes, enseignantsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/cours/cours_prive/${id}/`),
          axios.get("http://localhost:8000/api/cours/enseignants/"),
        ]);
        const cours: CoursPriveOut = coursRes.data;
        // Adapter selon structure API
        const enseignantsList: Enseignant[] = Array.isArray(enseignantsRes.data)
          ? enseignantsRes.data
          : enseignantsRes.data.enseignants;

        setDateCoursPrive(cours.date_cours_prive);
        setHeureDebut(cours.heure_debut.slice(0, 5));
        setHeureFin(cours.heure_fin.slice(0, 5));
        setTarif(String(cours.tarif));
        setLieu(cours.lieu === "D" ? "domicile" : "ecole");

        setEnseignants(enseignantsList);
        const enseignant = enseignantsList.find((x) =>
          x.id === (typeof cours.enseignant === "string" ? Number(cours.enseignant) : cours.enseignant)
        ) || enseignantsList.find((x) =>
          `${x.nom} ${x.prenom}` === `${cours.enseignant__nom} ${cours.enseignant__prenom}`
        ) || null;
        setSelectedEnseignant(enseignant);

        // Récupérer les élèves du cours (avec recherche si besoin)
        if (cours.eleves_ids && cours.eleves_ids.length) {
          // Charger tous les élèves correspondants par leur ID
          const eleveIds = cours.eleves_ids.map(Number);
          const { data } = await axios.get<{ eleves: Eleve[] }>(
            "http://localhost:8000/api/eleves/eleves/",
            { params: { ids: eleveIds.join(",") } }
          );
          setSelectedEleves(data.eleves || []);
        }
      } catch {
        toast({ title: "Erreur", description: "Impossible de charger le cours privé." });
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
    // eslint-disable-next-line
  }, [id]);

  // ==== Recherche d'élèves débouncée ====
  const fetchEleves = useCallback((term: string) => {
    const debouncedFetch = debounce(async (searchTerm: string) => {
      if (!searchTerm) {
        setSearchResults([]);
        return;
      }
      try {
        const { data } = await axios.get<{ eleves: Eleve[] }>(
          "http://localhost:8000/api/eleves/eleves/",
          { params: { recherche: searchTerm } },
        );
        setSearchResults(data.eleves || []);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    debouncedFetch(term);
  }, []);
  useEffect(() => {
    fetchEleves(searchTerm);
  }, [searchTerm, fetchEleves]);

  // ==== Gestion des élèves sélectionnés ====
  const addEleve = (e: Eleve) => {
    if (!selectedEleves.find((x) => x.id === e.id)) {
      setSelectedEleves((prev) => [...prev, e]);
    }
    setSearchTerm("");
    setSearchResults([]);
  };
  const removeEleve = (id: number) => {
    setSelectedEleves((prev) => prev.filter((x) => x.id !== id));
  };

  // ==== Modification du cours privé ====
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!dateCoursPrive || !heureDebut || !heureFin || !tarif) {
      toast({
        title: "Erreur",
        description: "Remplissez date, heures et tarif.",
      });
      return;
    }
    if (!selectedEnseignant) {
      toast({ title: "Erreur", description: "Sélectionnez un enseignant." });
      return;
    }
    if (selectedEleves.length === 0) {
      toast({ title: "Erreur", description: "Ajoutez au moins un élève." });
      return;
    }

    const payload = {
      date_cours_prive: dateCoursPrive,
      heure_debut: heureDebut,
      heure_fin: heureFin,
      tarif: Number(tarif),
      lieu: lieu === "ecole" ? "E" : "D",
      eleves_ids: selectedEleves.map((x) => x.id),
      enseignant: selectedEnseignant.id,
    };

    try {
      await axios.put(
        `http://localhost:8000/api/cours/cours_prive/${id}/`,
        payload
      );
      toast({ title: "Succès", description: "Cours privé modifié." });
      setTimeout(() => router.back(), 800);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le cours privé.",
      });
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Retourner à la page précédente"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Modifier un cours privé
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Éditer le cours privé</CardTitle>
            <CardDescription>
              Modifiez les détails du cours, les élèves et l&apos;enseignant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* === Élèves recherchables === */}
            <div className="space-y-4">
              <Label htmlFor="searchEleve" className="text-base">Élèves</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Recherchez et ajoutez un ou plusieurs élèves à ce cours privé
              </p>
              <div className="relative">
                <Input
                  id="searchEleve"
                  placeholder="Rechercher par nom ou prénom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                {searchResults.length > 0 && (
                  <ul className="absolute z-10 w-full border rounded-md mt-1 max-h-48 overflow-y-auto bg-white shadow-lg">
                    {searchResults.map((x) => (
                      <li
                        key={x.id}
                        className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
                        onClick={() => addEleve(x)}
                      >
                        {x.nom} {x.prenom}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                {selectedEleves.map((x) => (
                  <span
                    key={x.id}
                    className="px-3 py-1.5 bg-blue-100 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm border border-blue-200 transition-colors hover:bg-blue-200"
                  >
                    {x.nom} {x.prenom}
                    <button
                      type="button"
                      onClick={() => removeEleve(x.id)}
                      className="text-blue-600 hover:text-blue-800 focus:outline-none"
                      aria-label={`Retirer ${x.nom} ${x.prenom}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedEleves.length === 0 && (
                  <p className="text-sm text-muted-foreground p-2">
                    Aucun élève sélectionné
                  </p>
                )}
              </div>
            </div>

            {/* === Sélection enseignant === */}
            <div className="space-y-4">
              <Label htmlFor="enseignantSelect" className="text-base">
                Enseignant
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Sélectionnez l&apos;enseignant pour ce cours privé
              </p>
              <Select
                value={selectedEnseignant?.id.toString() ?? ""}
                onValueChange={(val) => {
                  const e = enseignants.find((x) => x.id === Number(val)) || null;
                  setSelectedEnseignant(e);
                }}
                required
              >
                <SelectTrigger id="enseignantSelect" className="w-full">
                  <SelectValue placeholder="Choisir un enseignant" />
                </SelectTrigger>
                <SelectContent>
                  {enseignants.map((x) => (
                    <SelectItem key={x.id} value={x.id.toString()}>
                      {x.nom} {x.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* === Détails du cours === */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateCoursPrive" className="text-base">
                    Date du cours
                  </Label>
                  <Input
                    id="dateCoursPrive"
                    type="date"
                    value={dateCoursPrive}
                    onChange={(e) => setDateCoursPrive(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tarif" className="text-base">
                    Tarif (CHF)
                  </Label>
                  <Input
                    id="tarif"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={tarif}
                    onChange={(e) => setTarif(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heureDebut" className="text-base">
                    Heure de début
                  </Label>
                  <Input
                    id="heureDebut"
                    type="time"
                    value={heureDebut}
                    onChange={(e) => setHeureDebut(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heureFin" className="text-base">
                    Heure de fin
                  </Label>
                  <Input
                    id="heureFin"
                    type="time"
                    value={heureFin}
                    onChange={(e) => setHeureFin(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* === Lieu radio select === */}
              <div className="space-y-4">
                <Label className="text-base">Lieu du cours</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Indiquez où le cours privé aura lieu
                </p>
                <RadioGroup
                  value={lieu}
                  onValueChange={(val) => setLieu(val as "ecole" | "domicile")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex flex-col space-y-1 rounded-lg border p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ecole" id="lieu-ecole" />
                      <Label htmlFor="lieu-ecole" className="font-medium">
                        À l&apos;école
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      Le cours aura lieu dans les locaux de l&apos;école
                    </p>
                  </div>

                  <div className="flex flex-col space-y-1 rounded-lg border p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="domicile" id="lieu-domicile" />
                      <Label htmlFor="lieu-domicile" className="font-medium">
                        À domicile
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      Le cours aura lieu au domicile de l&apos;élève
                    </p>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Modifier le cours privé
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
