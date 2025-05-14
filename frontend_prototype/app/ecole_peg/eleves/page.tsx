"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Input } from "@/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Plus, Search, CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  telephone: string;
  email: string;
  nom__pays: string;
}

interface ReponseEleves {
  eleves: Eleve[];
  nombreTotal: number;
}

export default function ElevesPage() {
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>(undefined);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [nombreTotal, setNombreTotal] = useState<number>(0);
  const [valeurRecherche, setValeurRecherche] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [numPage, setNumPage] = useState<number>(1);
  const taillePage = 10;

  useEffect(() => {
    const fetchEleves = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page: numPage,
          taille: taillePage,
        };

        if (valeurRecherche) {
          params.recherche = valeurRecherche;
        }
        if (dateNaissance) {
          params.date_naissance = format(dateNaissance, "yyyy-MM-dd");
        }

        const reponse = await axios.get<ReponseEleves>(
          "http://localhost:8000/api/eleves/eleves/",
          { params : {
            page: numPage,
            taille: taillePage,
            recherche: valeurRecherche || undefined,
            date_naissance: dateNaissance
              ? format(dateNaissance, "yyyy-MM-dd")
              : undefined,
          },}
        );
        console.log("Élèves reçus :", reponse.data.eleves);

        setEleves(reponse.data.eleves ?? []);
        setNombreTotal(reponse.data.nombreTotal ?? 0);
      } catch (erreur) {
        console.error("Erreur:", erreur);
      } finally {
        setLoading(false);
      }
    };

    fetchEleves();
  }, [numPage, valeurRecherche, dateNaissance]);

  // Mise à jour de la valeur de recherche
const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  setValeurRecherche(e.target.value);
};

// Mise à jour de la date de naissance
const handleDateChange = (date: Date | undefined) => {
  setDateNaissance(date);
};


  useEffect(() => {
    setNumPage(1); // reset page quand date change
  }, [dateNaissance]);

  const pagesTotales = Math.ceil(nombreTotal / taillePage);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eleves</h1>
          <p className="text-muted-foreground">Gérez les élèves de l&apos;école</p>
        </div>
        <Button asChild>
          <Link href="/ecole_peg/eleves/eleve">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un élève
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des élèves</CardTitle>
          <CardDescription>Tous les élèves inscrits à l&apos;école</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un élève..."
                  className="pl-8"
                  value={valeurRecherche}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Rechercher par date de naissance</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dateNaissance && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateNaissance ? (
                        format(dateNaissance, "dd-MM-yyyy", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateNaissance}
                      onSelect={setDateNaissance}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Les filtres Statut / Niveau peuvent être ajoutés ici plus tard */}
            </div>

            {loading && (
              <div className="text-center text-sm font-medium text-muted-foreground">
                Chargement...
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Date de naissance</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pays</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eleves.length > 0 ? (
                    eleves.map((eleve) => (
                      <TableRow key={eleve.id}>
                        <TableCell>{eleve.nom ?? "-"}</TableCell>
                        <TableCell>{eleve.prenom ?? "-"}</TableCell>
                        <TableCell>{eleve.date_naissance ?? "-"}</TableCell>
                        <TableCell>{eleve.telephone ?? "-"}</TableCell>
                        <TableCell>{eleve.email ?? "-"}</TableCell>
                        <TableCell>{eleve.nom__pays ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/ecole_peg/eleves/eleve/${eleve.id}`}>
                              Détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Aucun élève trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-4 my-4">
              <button
                onClick={() => setNumPage((prec) => Math.max(prec - 1, 1))}
                disabled={numPage === 1}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Précédent
              </button>

              <span>Page {numPage} sur {pagesTotales}</span>

              <button
                onClick={() => setNumPage((prec) => prec + 1)}
                disabled={numPage === pagesTotales}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Suivant
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
