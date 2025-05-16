"use client";

import Link from "next/link";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { ArrowLeft } from "lucide-react";
import React, { use, useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import { useRouter } from "next/navigation";
import axios from "axios";
interface Session {
  id: number;
  cours__nom: string;
  type: string;
  cours__niveau: string;
  nom_enseignant: string;
  prenom_enseignant: string;
  date_debut: string;
  date_fin: string;
  capacite_max: number;
  statut: string;
}


export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const resolvedParams = use(params);

  const [session, setSession] = useState<Session>();



  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/cours/sessions/${resolvedParams.id}`
        );
        setSession(response.data); 
        console.log("Session reçue:", response.data);
// ✅ ici on prend juste les données utiles
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    


    fetchSession();

  }, [resolvedParams.id]);

  async function supprimerSession(id_session: number | undefined) {
    if (!id_session) return;

    try {
      await axios.delete(`http://localhost:8000/api/cours/sessions/${id_session}/`);

      router.push("/ecole_peg/sessions");
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  }

  async function changerStatut() {
    if (!session) return;

    try {
      await axios.patch(`/cours/sessions/${session.id}/`);

      router.push("/ecole_peg/sessions/");
    } catch (erreur) {
      console.error("Erreur:", erreur);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ecole_peg/sessions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {session?.cours__nom} {session?.type === "I" ? "Intensif" : "Semi-intensif"}{" "}
          {session?.cours__niveau} (Du {session?.date_debut} à {session?.date_fin})
        </h1>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
              <CardDescription>Détails de la session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p>{session?.cours__nom}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p>{session?.type === "I" ? "Intensif" : "Semi-intensif"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Niveau
                </p>
                <p>{session?.cours__niveau}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Période
                </p>
                <p>
                  Du {session?.date_debut} à {session?.date_fin}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Statut
                </p>
                <p>{session?.statut === "O" ? "Ouverte" : "Fermée"}</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4">
              <Button variant="outline" onClick={changerStatut}>
                Changer statut
              </Button>
              <Button
                variant="destructive"
                onClick={() => supprimerSession(Number(resolvedParams.id))}
              >
                Supprimer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
