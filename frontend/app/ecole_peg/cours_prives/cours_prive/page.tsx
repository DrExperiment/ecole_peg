"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
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

interface CreateCoursPrivePayload {
  date_cours_prive: string; // "YYYY-MM-DD"
  heure_debut: string; // "HH:MM"
  heure_fin: string; // "HH:MM"
  tarif: number;
  lieu: "E" | "D";
  eleves_ids: number[];
  enseignant: number; // correspond à ton schema `enseignant: int`
}

export default function NouveauCoursPrivePage() {
  const router = useRouter();
  const { toast } = useToast();

  // === ÉTATS ÉLÈVES ========================
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Eleve[]>([]);
  const [selectedEleves, setSelectedEleves] = useState<Eleve[]>([]);

  // === ÉTATS ENSEIGNANTS ===================
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [selectedEnseignant, setSelectedEnseignant] =
    useState<Enseignant | null>(null);

  // === ÉTATS COURS PRIVÉ ===================
  const [dateCoursPrive, setDateCoursPrive] = useState<string>("");
  const [heureDebut, setHeureDebut] = useState<string>("");
  const [heureFin, setHeureFin] = useState<string>("");
  const [tarif, setTarif] = useState<string>("");
  const [lieu, setLieu] = useState<"ecole" | "domicile">("ecole");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/cours/enseignants/")
      .then(({ data }) => {
        // Ajoute ce log et regarde la console de ton navigateur
        console.log("API enseignants:", data);
        // Adapter ici selon la structure de la réponse
        if (Array.isArray(data)) setEnseignants(data);
        else if (Array.isArray(data.enseignants))
          setEnseignants(data.enseignants);
        else setEnseignants([]);
      })
      .catch((err) => console.error("Erreur chargement enseignants:", err));
  }, []);

  // --- Recherche d'élèves débouncée ---
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
        setSearchResults(data.eleves);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    debouncedFetch(term);
  }, []);
  useEffect(() => {
    fetchEleves(searchTerm);
  }, [searchTerm, fetchEleves]);

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

  // === SOUMISSION DU FORMULAIRE ============
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation front
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

    // Construction payload
    const payload: CreateCoursPrivePayload = {
      date_cours_prive: dateCoursPrive,
      heure_debut: heureDebut,
      heure_fin: heureFin,
      tarif: Number(tarif),
      lieu: lieu === "ecole" ? "E" : "D",
      eleves_ids: selectedEleves.map((x) => x.id),
      enseignant: selectedEnseignant.id,
    };

    try {
      await axios.post("http://localhost:8000/api/cours/cours_prive/", payload);
      toast({ title: "Succès", description: "Cours privé créé." });
      router.back();
    } catch (err: unknown) {
      console.error("Payload envoyé :", payload);
      if (axios.isAxiosError(err)) {
        console.error("Status :", err.response?.status);
        console.error(
          "Données retour API :",
          JSON.stringify(err.response?.data, null, 2),
        );
      } else {
        console.error("Erreur non HTTP :", err);
      }
      toast({
        title: "Erreur",
        description: "Impossible de créer le cours privé.",
      });
    }
  };

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
          Nouveau Cours Privé
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Détails du cours privé</CardTitle>
            <CardDescription>
              Sélectionnez les élèves, l&apos;enseignant et définissez les
              détails du cours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* === Sélection des élèves === */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchEleve" className="text-base">
                  Élèves
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Recherchez et ajoutez un ou plusieurs élèves pour ce cours
                  privé
                </p>
              </div>

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
              <div>
                <Label htmlFor="enseignantSelect" className="text-base">
                  Enseignant
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Sélectionnez l&apos;enseignant qui donnera ce cours privé
                </p>
              </div>

              <Select
                value={selectedEnseignant?.id.toString() ?? ""}
                onValueChange={(val) => {
                  const e =
                    enseignants.find((x) => x.id === Number(val)) || null;
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

            {/* === Infos cours privé === */}
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
                    className="w-full font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tarif" className="text-base">
                    Tarif (€)
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
                    className="w-full font-mono"
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
                    className="w-full font-mono"
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
                    className="w-full font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base">Lieu du cours</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Indiquez où le cours privé aura lieu
                  </p>
                </div>

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
              {selectedEleves.length > 0
                ? `Créer le cours privé pour ${selectedEleves.length} élève${selectedEleves.length > 1 ? "s" : ""}`
                : "Créer le cours privé"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
