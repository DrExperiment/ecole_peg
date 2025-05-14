"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Plus, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import axios from "axios";
interface Session {
  id: number;
  nom: string;
  type: string;
  niveau: string;
  date_debut: string;
  date_fin: string;
  statut: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const reponse = await axios.get("http://localhost:8000/api/cours/sessions/");

        setSessions(reponse.data); // c'est ici que sont vraiment les sessions
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchSessions();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sessions 
          </h1>
          <p className="text-muted-foreground">
            Gérez les sessions de l&apos;école
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/ecole_peg/sessions/session">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle session
            </Link>
          </Button>
        
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Toutes les sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="tous">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les niveaux</SelectItem>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="tous">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les types</SelectItem>
                  <SelectItem value="I">Intensif</SelectItem>
                  <SelectItem value="S">Semi-intensif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {session.nom}
                        </TableCell>
                        <TableCell>
                          {session.type === "I" ? "Intensif" : "Semi-intensif"}
                        </TableCell>
                        <TableCell>{session.niveau}</TableCell>
                        <TableCell>
                          Du {session.date_debut} à {session.date_fin}
                        </TableCell>
                        <TableCell>
                          {session.statut === "O" ? "Ouverte" : "Fermée"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/ecole_peg/sessions/session/${session.id}`}
                            >
                              Détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Aucune session trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
