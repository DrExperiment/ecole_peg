"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card";
import { Button } from "@/components/button";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
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
    return format(parsed, "dd/MM/yyyy", { locale: fr });
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
      .catch((err) => {
        setCoursPrive(null);
        // Tu peux ajouter une gestion d'erreur ici si besoin
      });
  }, [id]);

  if (!coursPrive) {
    return (
      <div className="flex flex-col items-center mt-8">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Détail du cours privé</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cours privé n°{coursPrive.id}</CardTitle>
          <CardDescription>
            {coursPrive.lieu && <>Lieu&nbsp;: <span className="font-semibold">{coursPrive.lieu}</span></>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">Date&nbsp;:</span>{" "}
            {formatDate(coursPrive.date_cours_prive)}
          </div>
          <div>
            <span className="font-medium">Heure&nbsp;:</span>{" "}
            {formatTime(coursPrive.heure_debut)} – {formatTime(coursPrive.heure_fin)}
          </div>
          <div>
            <span className="font-medium">Tarif&nbsp;:</span>{" "}
            {coursPrive.tarif} CHF
          </div>
          <div>
            <span className="font-medium">Professeur&nbsp;:</span>{" "}
            {coursPrive.enseignant__nom} {coursPrive.enseignant__prenom}
          </div>
          <div>
            <span className="font-medium">Élève(s)&nbsp;:</span>{" "}
            {coursPrive.eleves.length > 0
              ? coursPrive.eleves.join(", ")
              : "Aucun élève"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
