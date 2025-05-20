"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/card";
import { Button } from "@/components/button";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Clock, Users, User, CreditCard } from "lucide-react";
import axios from "axios";

interface CoursPrive {
  id: number;
  date_cours_prive: string;
  heure_debut: string;
  heure_fin: string;
  tarif: number | string;
  lieu: string;
  enseignant__nom: string;
  enseignant__prenom: string;
  eleves: string[];
}

export default function CoursPriveDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [coursPrive, setCoursPrive] = useState<CoursPrive | null>(null);

  // Fonctions pour formater date/heure
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return "";
    return format(parsed, "EEEE d MMMM yyyy", { locale: fr });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    const parsed = parseISO(`1970-01-01T${timeString}`);
    if (!isValid(parsed)) return "";
    return format(parsed, "HH:mm");
  };

  useEffect(() => {
    if (!id) return;
    axios
      .get<CoursPrive>(`http://localhost:8000/api/cours/cours_prive/${id}/`)
      .then((res) => setCoursPrive(res.data))
      .catch(() => {
        setCoursPrive(null);
      });
  }, [id]);

  if (!coursPrive) {
    return (
      <div className="container mx-auto py-6">
        <Card className="w-full max-w-md mx-auto shadow-sm">
          <CardHeader>
            <CardTitle className="text-center">Chargement...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Retourner à la page précédente"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Détails du cours privé
        </h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cours privé #{coursPrive.id}</CardTitle>
              <CardDescription className="mt-1.5">
                {formatDate(coursPrive.date_cours_prive)}
              </CardDescription>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                coursPrive.lieu === "E"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {coursPrive.lieu === "E" ? "À l'école" : "À domicile"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Horaire
                  </p>
                  <p className="text-sm">
                    {formatTime(coursPrive.heure_debut)} –{" "}
                    {formatTime(coursPrive.heure_fin)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tarif
                  </p>
                  <p className="text-sm">{coursPrive.tarif} CHF</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Enseignant
                  </p>
                  <p className="text-sm">
                    {coursPrive.enseignant__prenom} {coursPrive.enseignant__nom}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Élèves
                  </p>
                  <p className="text-sm">
                    {coursPrive.eleves.length > 0
                      ? coursPrive.eleves.join(", ")
                      : "Aucun élève inscrit"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end border-t px-6 py-4 bg-muted/50 space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/ecole_peg/cours_prives/cours_prive/${id}/modifier`)
            }
          >
            Modifier
          </Button>
          <Button
            variant="default"
            onClick={() =>
              router.push(`/ecole_peg/cours_prives/cours_prive/${id}/presence`)
            }
          >
            Gérer les présences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
