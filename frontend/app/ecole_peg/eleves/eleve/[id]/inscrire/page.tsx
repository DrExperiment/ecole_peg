"use client";

import { useCallback, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  const [eleve, setEleve] = useState<Eleve | undefined>(undefined);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [id_session, setIdSession] = useState<number>();
  const [preinscription, setPreinscription] = useState<boolean>(false);

  const onSoumission = useCallback(
    async (donnees: object) => {
      const donneesCompletes = {
        ...donnees,
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
    [id_session, preinscription, resolvedParams.id, router],
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
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Retourner à la page précédente"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Inscription aux cours pour {eleve?.prenom} {eleve?.nom}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)} className="space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              Détails de l&apos;inscription
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <Select
                name="session"
                required
                onValueChange={(valeur) => {
                  setIdSession(Number(valeur));
                }}
              >
                <SelectTrigger className="w-full" id="session">
                  <SelectValue placeholder="Sélectionner la session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      <span className="font-medium">{session.cours__nom}</span>{" "}
                      -{" "}
                      {session.cours__type === "I"
                        ? "Intensif"
                        : "Semi-intensif"}{" "}
                      <span className="font-medium">
                        {session.cours__niveau}
                      </span>
                      <br />
                      <span className="text-sm text-muted-foreground">
                        Du {format(session.date_debut, "dd.MM.yyyy")} au{" "}
                        {format(session.date_fin, "dd.MM.yyyy")}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="but">But de l&apos;inscription</Label>
              <Input
                id="but"
                placeholder="Ex: Perfectionnement du français, Préparation aux études..."
                {...register("but")}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frais_inscription">
                Frais d&apos;inscription (CHF)
              </Label>
              <Input
                id="frais_inscription"
                type="number"
                min="0"
                step="0.01"
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0.00"
                className="font-mono w-full"
                required
                {...register("frais_inscription", {
                  required: "Les frais d&apos;inscription sont obligatoires",
                  min: {
                    value: 0,
                    message: "Les frais ne peuvent pas être négatifs",
                  },
                })}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preinscription"
                  checked={preinscription}
                  onCheckedChange={(checked) =>
                    setPreinscription(checked as boolean)
                  }
                />
                <Label
                  htmlFor="preinscription"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Préinscription uniquement
                </Label>
              </div>
              {preinscription && (
                <p className="mt-2 text-sm text-muted-foreground">
                  La préinscription permet de réserver une place dans la session
                  sans confirmation définitive.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              className="min-w-[150px]"
              disabled={isSubmitting || !id_session}
            >
              {isSubmitting ? (
                <>Sauvegarde en cours...</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
