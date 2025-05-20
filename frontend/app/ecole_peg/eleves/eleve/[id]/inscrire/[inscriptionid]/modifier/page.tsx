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

  const {
    register,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const [idSession, setIdSession] = useState<number>();
  const [preinscription, setPreinscription] = useState(false);

  useEffect(() => {
    if (!id || !inscriptionid) return;
    async function fetchData() {
      try {
        const [inscRes, sessionsRes] = await Promise.all([
          axios.get<Inscription>(
            `http://localhost:8000/api/cours/${id}/inscriptions/${inscriptionid}/`
          ),
          axios.get<{ sessions: Session[] }>(
            `http://localhost:8000/api/cours/sessions/`
          ),
        ]);
        const insc = inscRes.data;
        setSessions(sessionsRes.data.sessions);

        setIdSession(insc.session);
        setValue("but", insc.but);
        setValue("frais_inscription", insc.frais_inscription);
        setDate(
          insc.date_inscription ? parseISO(insc.date_inscription) : undefined
        );
        setPreinscription(insc.preinscription ?? false);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [id, inscriptionid, setValue]);

  const onSoumission = async (donnees: object) => {
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
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ecole_peg/eleves/eleve/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier l&apos;inscription
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Modification des détails d&apos;inscription
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Détails de l&apos;inscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="session" className="text-base">
                  Session du cours
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Sélectionnez la session à laquelle l&apos;élève est inscrit
                </p>
                <Select
                  name="session"
                  value={
                    idSession !== undefined ? String(idSession) : undefined
                  }
                  onValueChange={(valeur) => setIdSession(Number(valeur))}
                >
                  <SelectTrigger id="session">
                    <SelectValue placeholder="Sélectionner la session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem
                        key={session.id}
                        value={String(session.id)}
                        className="py-3"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">
                            {session.cours__nom}{" "}
                            <span className="text-muted-foreground">
                              (
                              {session.cours__type === "I"
                                ? "Intensif"
                                : "Semi-intensif"}{" "}
                              - {session.cours__niveau})
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Du{" "}
                            {format(new Date(session.date_debut), "dd/MM/yyyy")}{" "}
                            au{" "}
                            {format(new Date(session.date_fin), "dd/MM/yyyy")}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="frais_inscription" className="text-base">
                    Frais d&apos;inscription (CHF)
                  </Label>
                  <div className="relative">
                    <Input
                      id="frais_inscription"
                      type="number"
                      min="0"
                      step="0.01"
                      onWheel={(e) => e.currentTarget.blur()}
                      className="pl-8 font-mono"
                      placeholder="0.00"
                      required
                      {...register("frais_inscription", {
                        required: "Les frais d'inscription sont obligatoires",
                        min: {
                          value: 0,
                          message: "Les frais ne peuvent pas être négatifs",
                        },
                      })}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      CHF
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="but" className="text-base">
                  But de l&apos;inscription
                </Label>
                <Input
                  id="but"
                  placeholder="Ex: Amélioration du français pour études universitaires"
                  className="w-full"
                  {...register("but")}
                />
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preinscription"
                    checked={preinscription}
                    onCheckedChange={(checked) =>
                      setPreinscription(checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="preinscription"
                      className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Préinscription
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Cochez cette case s&apos;il s&apos;agit d&apos;une
                      préinscription
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
