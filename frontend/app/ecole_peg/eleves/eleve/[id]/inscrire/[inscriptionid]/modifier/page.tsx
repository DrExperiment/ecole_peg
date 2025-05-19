"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { ArrowLeft, Save } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/checkbox";

interface Session {
  id: number;
  cours__nom: string;
  cours__type: string;
  cours__niveau: string;
  date_debut: string;
  date_fin: string;
}

interface Inscription {
  id: number;
  session: number;
  date_inscription: string;
  but: string;
  frais_inscription: number;
  preinscription: boolean;
}

export default function EditInscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const inscriptionid = params.inscriptionid as string;

  const { register, setValue, handleSubmit, formState: { isSubmitting } } = useForm();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const [idSession, setIdSession] = useState<number>();
  const [preinscription, setPreinscription] = useState(false);

  useEffect(() => {
    if (!id || !inscriptionid) return;
    async function fetchData() {
      try {
        const [inscRes, sessionsRes] = await Promise.all([
          axios.get<Inscription>(`http://localhost:8000/api/cours/${id}/inscriptions/${inscriptionid}/`),
          axios.get<{ sessions: Session[] }>(`http://localhost:8000/api/cours/sessions/`),
        ]);
        const insc = inscRes.data;
        setSessions(sessionsRes.data.sessions);

        setIdSession(insc.session);
        setValue("but", insc.but);
        setValue("frais_inscription", insc.frais_inscription);
        setDate(insc.date_inscription ? parseISO(insc.date_inscription) : undefined);
        setPreinscription(insc.preinscription ?? false);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [id, inscriptionid, setValue]);

  const onSoumission = async (donnees: any) => {
    const donneesCompletes = {
      ...donnees,
      date: date ? format(date, "yyyy-MM-dd") : undefined,
      id_session: idSession,
      preinscription,
    };
    try {
      await axios.put(
        `http://localhost:8000/api/cours/${id}/inscriptions/${inscriptionid}/`,
        donneesCompletes
      );
      router.push(`/ecole_peg/eleves/eleve/${id}/`);
    } catch (erreur) {
      console.error("Erreur: ", erreur);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ecole_peg/eleves/eleve/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Modifier l’inscription
        </h1>
      </div>
      <form onSubmit={handleSubmit(onSoumission)}>
        <Card>
          <CardHeader>
            <CardTitle>Modifier l’inscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <Select
                name="session"
                value={idSession !== undefined ? String(idSession) : undefined}
                onValueChange={(valeur) => setIdSession(Number(valeur))}
              >
                <SelectTrigger id="session">
                  <SelectValue placeholder="Sélectionner la session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={String(session.id)}>
                      {session.cours__nom}{" "}
                      {session.cours__type === "I" ? "Intensif" : "Semi-intensif"}{" "}
                      {session.cours__niveau} (Du{" "}
                      {format(new Date(session.date_debut), "yyyy-MM-dd")} à{" "}
                      {format(new Date(session.date_fin), "yyyy-MM-dd")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Champ de date remplacé ici */}
            <div className="space-y-2">
              <Label htmlFor="date_inscription">Date de l&#39;inscription</Label>
              <Input
                id="date_inscription"
                type="date"
                value={date ? format(date, "yyyy-MM-dd") : ""}
                onChange={e => setDate(e.target.value ? parseISO(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="but">But</Label>
              <Input
                id="but"
                placeholder="Le but de l'inscription"
                {...register("but")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frais_inscription">Frais de l&#39;inscription</Label>
              <Input
                id="frais_inscription"
                type="number"
                placeholder="Les frais de l'inscription"
                {...register("frais_inscription", {
                  required: "Les frais de l'inscription sont obligatoires",
                })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preinscription"
                  checked={preinscription}
                  onCheckedChange={(checked) => setPreinscription(checked as boolean)}
                />
                <Label htmlFor="preinscription">Préinscription</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "En cours..." : "Enregistrer"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
