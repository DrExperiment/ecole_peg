"use client";

import type React from "react";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { CalendarIcon, ArrowLeft, Save, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn, fetchApi } from "@/lib/utils";
import { useForm } from "react-hook-form";

interface Session {
  id: number;
  nom: string;
  type: string;
  niveau: string;
  date_debut: string;
  date_fin: string;
}

export default function NouvelleSeancePage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>(undefined);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [id_session, setIdSession] = useState<number>();

  const onSoumission = useCallback(
    async (donnees: object) => {
      const donneesCompletes = {
        ...donnees,
        date: date ? format(date, "dd-MM-yyyy") : undefined,
        id_session,
      };

      try {
        await fetchApi("/cours/seance/", {
          method: "POST",
          body: donneesCompletes,
        });

        router.push("/ecole_peg/sessions/");
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    },
    [date, id_session, router]
  );

  useEffect(() => {
    async function fetchSessions() {
      try {
        const donnees: Session[] = await fetchApi("/cours/sessions/");

        setSessions(donnees);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchSessions();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ecole_peg/sessions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle Séance</h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card>
          <CardHeader>
            <CardTitle>Détails de la séance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <Select
                name="session"
                required
                onValueChange={(valeur) => {
                  setIdSession(Number(valeur));
                }}
              >
                <SelectTrigger id="session">
                  <SelectValue placeholder="Sélectionner une session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.nom} {session.type === "I" ? "Intensif" : "Semi-intensif"} {session.niveau}{" "}
                      (Du {session.date_debut} à {session.date_fin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "dd-MM-yyyy", { locale: fr })
                    ) : (
                      <span>Séléctionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heure-debut">Heure de début</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="heure-debut"
                  type="time"
                  required
                  {...register("heure_debut", {
                    required: "L'heure de début est obligatoire",
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heure-fin">Heure de fin</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="heure-fin"
                  type="time"
                  required
                  {...register("heure_fin", {
                    required: "L'heure de fin est obligatoire",
                  })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting
                ? "En cours..."
                : "Enregistrer"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
