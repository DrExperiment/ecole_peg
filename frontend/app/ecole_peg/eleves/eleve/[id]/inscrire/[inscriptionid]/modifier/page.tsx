"use client";

import { use ,useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Textarea } from "@/components/textarea";
import { Save, ArrowLeft } from "lucide-react";

interface Session {
  id: number;
  nom: string;
  date_debut: string;
  date_fin: string;
  capacite_max: number;
}

interface Inscription {
  id: number;
  date_inscription: string;
  statut: "ACTIF" | "INACTIF";
  remarques?: string;
  session: number;
}

export default function EditInscriptionPage({ params }: { params: Promise<{ id: string; inscriptionId: string }> }) {
  const router = useRouter();
  const { id, inscriptionId } = use(params);

  const [inscription, setInscription] = useState<Inscription | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<number>(0);
  const [statut, setStatut] = useState<"ACTIF" | "INACTIF">("ACTIF");
  const [remarques, setRemarques] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [inscRes, sessionsRes] = await Promise.all([
          axios.get<Inscription>(`http://localhost:8000/api/eleves/${id}/inscriptions/${inscriptionId}/`),
          axios.get<Session[]>(`http://localhost:8000/api/sessions/`),
        ]);

        setInscription(inscRes.data);
        setSessions(sessionsRes.data);
        setSessionId(inscRes.data.session);
        setStatut(inscRes.data.statut);
        setRemarques(inscRes.data.remarques ?? "");
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [id, inscriptionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inscription) return;

    setIsSubmitting(true);
    try {
      const payload = {
        statut,
        remarques,
        id_session: sessionId,
      };

      await axios.put(
        `http://localhost:8000/api/eleves/${id}/inscriptions/${inscriptionId}/`,
        payload
      );

      router.push(`/ecole_peg/eleves/eleve/${id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!inscription) return <p>Chargement...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ecole_peg/eleves/eleve/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Modifier l’inscription</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Détails de l’inscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Session</Label>
              <Select value={String(sessionId)} onValueChange={(v) => setSessionId(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nom} ({s.date_debut} → {s.date_fin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Statut</Label>
              <Select value={statut} onValueChange={(v) => setStatut(v as "ACTIF" | "INACTIF")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIF">Actif</SelectItem>
                  <SelectItem value="INACTIF">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="remarques">Remarques</Label>
              <Textarea
                id="remarques"
                name="remarques"
                value={remarques}
                onChange={(e) => setRemarques(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
