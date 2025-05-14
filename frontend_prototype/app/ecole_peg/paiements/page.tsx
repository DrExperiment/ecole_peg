"use client";
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "lucide-react"
import { useEffect, useState, useMemo, useRef, ChangeEvent } from "react";
import debounce from "lodash/debounce";
import Link from "next/link";

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

import { Plus, Search, CalendarIcon, Axis3DIcon } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";

interface Paiement {
    id: number;
      etudiant: string;
      date: string;
      description: string;
      montant: number;
      mode: string;
  }
  
export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [paiementsFiltres, setPaiementsFiltres] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [dateDebut, setDateDebut] = useState<Date>()
  const [dateFin, setDateFin] = useState<Date>()

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const response = await (await axios.get("http://localhost:8000/api/factures/paiements")).data
        setPaiements(response.data)
        setPaiementsFiltres(response.data)
      } catch (error) {
        console.error("Erreur lors du chargement des paiements :", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaiements()
  }, [])

  const handleSearch = () => {
    const resultats = paiements.filter((paiement) => {
      const paiementDate = new Date(paiement.date)
      return (!dateDebut || paiementDate >= dateDebut) && (!dateFin || paiementDate <= dateFin)
    })
    setPaiementsFiltres(resultats)
  }

  if (loading) return <p>Chargement des paiements...</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
          <p className="text-muted-foreground">Gérez les paiements des étudiants</p>
        </div>
        <Button asChild>
          <Link href="/ecole_peg/paiements/paiement">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau paiement
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des paiements</CardTitle>
          <CardDescription>Tous les paiements reçus par l'école</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Date de début</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateDebut && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateDebut ? format(dateDebut, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateDebut} onSelect={setDateDebut} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Date de fin</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !dateFin && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFin ? format(dateFin, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFin} onSelect={setDateFin} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleSearch} className="mt-auto">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paiementsFiltres.map((paiement) => (
                    <TableRow key={paiement.id}>
                      <TableCell>{format(new Date(paiement.date), "dd/MM/yyyy", { locale: fr })}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/etudiants/${paiement.id}`} className="hover:underline">
                          {paiement.etudiant}
                        </Link>
                      </TableCell>
                      <TableCell>{paiement.description}</TableCell>
                      <TableCell>CHF {paiement.montant}</TableCell>
                      <TableCell>{paiement.mode}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/paiements/${paiement.id}`}
                            aria-label={`Voir les détails du paiement de ${paiement.etudiant}`}
                            title="Voir les détails complets de ce paiement"
                          >
                            Détails
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
