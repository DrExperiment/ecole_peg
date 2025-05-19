"use client";

import { useCallback, use, useEffect, useState } from "react";
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
import { ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/checkbox";

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
}

interface Session {
  id: number;
  cours__nom: string;
  cours__type: string;
  cours__niveau: string;
  date_debut: Date;
  date_fin: Date;
}

export default function InscrirePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const router = useRouter();

  const resolvedParams = use(params);

  const [date, setDate] = useState<Date | undefined>(undefined);

  const [eleve, setEleve] = useState<Eleve | undefined>(undefined);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [id_session, setIdSession] = useState<number>();
  const [preinscription, setPreinscription] = useState<boolean>(false);

  const onSoumission = useCallback(
    async (donnees: object) => {
      const donneesCompletes = {
        ...donnees,
        date: date ? format(date, "yyyy-MM-dd") : undefined,
        id_session,
        preinscription,
      };

      try {
        await axios.post(
          `http://localhost:8000/api/cours/${resolvedParams.id}/inscription/`,
          donneesCompletes,
        );

        router.push(`/ecole_peg/eleves/eleve/${resolvedParams?.id}/`);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    },
    [date, id_session, preinscription, resolvedParams.id, router],
  );

  useEffect(() => {
    async function fetchEleve() {
      const url = `http://localhost:8000/api/eleves/eleve/${resolvedParams.id}/`;
      console.log("fetchEleve →", url);
      try {
        const { data } = await axios.get<Eleve>(url);
        setEleve(data);
      } catch (e) {
        console.error("Erreur fetchEleve:", e);
      }
    }

    async function fetchSessions() {
      try {
        const reponse = await axios.get(
          "http://localhost:8000/api/cours/sessions/",
        );

        setSessions(reponse.data.sessions);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchEleve();
    fetchSessions();
  }, [resolvedParams.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ecole_peg/eleves/eleve/${eleve?.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Inscrire {eleve?.nom} {eleve?.prenom} à une session
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card>
          <CardHeader>
            <CardTitle>Inscrire</CardTitle>
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
                  <SelectValue placeholder="Sélectionner la session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.cours__nom}{" "}
                      {session.cours__type === "I"
                        ? "Intensif"
                        : "Semi-intensif"}{" "}
                      {session.cours__niveau} (Du{" "}
                      {format(session.date_debut, "yyyy-MM-dd")} à{" "}
                      {format(session.date_fin, "yyyy-MM-dd")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_inscription">
                Date de l&apos;inscription
              </Label>
              <Input
                id="date_inscription"
                type="date"
                value={date ? format(date, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setDate(
                    e.target.value
                      ? new Date(e.target.value + "T00:00:00")
                      : undefined,
                  )
                }
                required
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
              <Label htmlFor="heure-fin">Frais de l&apos;inscription</Label>
              <Input
                id="frais_inscription"
                type="number"
                placeholder="Les frais de l'inscription"
                required
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
                  onCheckedChange={(checked) =>
                    setPreinscription(checked as boolean)
                  }
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
