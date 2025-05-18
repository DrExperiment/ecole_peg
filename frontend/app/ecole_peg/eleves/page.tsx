"use client";

import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";

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
import { Plus, Search } from "lucide-react";

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  telephone: string;
  email: string;
  pays__nom: string;
}

interface ReponseEleves {
  eleves: Eleve[];
  nombre_total: number;
}

export default function ElevesPage() {
  const [dateNaissance, setDateNaissance] = useState<Date | undefined>(
    undefined
  );
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [nombreTotal, setNombreTotal] = useState<number>(0);
  const [valeurRecherche, setValeurRecherche] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [numPage, setNumPage] = useState<number>(1);
  const [statut, setStatut] = useState<string>("actifs");
  const taillePage = 10;

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

      let url = "http://localhost:8000/api/eleves/eleves/";
      if (statut === "actifs") {
        url += "actifs/";
      } else if (statut === "inactifs") {
        url += "inactifs/";
      }

      const reponse = await axios.get<ReponseEleves>(url, { params });
      setEleves(reponse.data.eleves ?? []);
      setNombreTotal(reponse.data.nombre_total ?? 0);
    } catch (erreur) {
      console.error("Erreur:", erreur);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEleves();
  }, [numPage, valeurRecherche, dateNaissance, statut]);

  useEffect(() => {
    setNumPage(1);
  }, [dateNaissance, statut]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValeurRecherche(e.target.value);
  };

  const handleDateChange = (date: Date | undefined) => {
    setDateNaissance(date);
  };

  const pagesTotales = Math.ceil(nombreTotal / taillePage);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Élèves</h1>
          <p className="text-muted-foreground">
            Gérez les élèves de l&apos;école
          </p>
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
          <CardDescription>
            Tous les élèves inscrits à l&apos;école
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un élève..."
                  className="pl-8"
                  value={valeurRecherche}
                  onChange={handleInputChange}
                />
              </div>
              <Input
                type="date"
                className="w-[200px]"
                value={dateNaissance ? format(dateNaissance, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setDateNaissance(value ? new Date(value) : undefined);
                }}
              />
              <Select value={statut} onValueChange={setStatut}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut des élèves" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actifs">Élèves actifs</SelectItem>
                  <SelectItem value="inactifs">Élèves inactifs</SelectItem>
                  <SelectItem value="tous">Tous les élèves</SelectItem>
                </SelectContent>
              </Select>
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
                        <TableCell>{eleve.pays__nom ?? "-"}</TableCell>
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

              <span>
                Page {numPage} sur {pagesTotales}
              </span>

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
