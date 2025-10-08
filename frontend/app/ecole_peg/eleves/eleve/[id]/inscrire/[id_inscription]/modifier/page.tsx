"use client";

import { use, useEffect, useState } from "react";
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
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/checkbox";
import { formatDate } from "@/lib/utils";

interface Session {
  id: number;
  cours__nom: string;
  cours__type: "I" | "S";
  cours__niveau: "A1" | "A2" | "B1" | "B2" | "C1";
  date_debut: Date;
  date_fin: Date;
}

interface Inscription {
  id: number;
  id_session: number;
  date_inscription: Date;
  but: string;
  frais_inscription: number;
  preinscription: boolean;
  date_sortie: Date | undefined;
  motif_sortie: string | undefined;
}

export default function ModifierInscriptionPage({
  params,
}: {
  params: Promise<{ id: string; id_inscription: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const {
    register,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [id_session, setIdSession] = useState<number>();
  const [preinscription, setPreinscription] = useState<boolean>(false);
  const [date_sortie, setDateSortie] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function fetchDonnees() {
      try {
        const [reponse_inscription, reponse_sessions] = await Promise.all([
          api.get<Inscription>(
            `/cours/${resolvedParams.id}/inscriptions/${resolvedParams.id_inscription}/`,
          ),
          api.get(`/cours/sessions/`),
        ]);

        const inscription = reponse_inscription.data;

        setSessions(reponse_sessions.data.sessions);

        setIdSession(inscription.id_session);

        setPreinscription(inscription.preinscription ?? false);

        setDateSortie(
          inscription.date_sortie
            ? new Date(inscription.date_sortie)
            : undefined,
        );

        reset({
          but: inscription.but,
          frais_inscription: inscription.frais_inscription,
          motif_sortie: inscription.motif_sortie || "",
        });
      } catch (err) {
        console.error(err);
      }
    }

    fetchDonnees();
  }, [reset, resolvedParams.id, resolvedParams.id_inscription]);

  const onSoumission = async (donnees: object) => {
    const donnees_completes = {
      ...donnees,
      id_session,
      preinscription,
      date_sortie,
    };

    try {
      await api.put(
        `/cours/${resolvedParams.id}/inscriptions/${resolvedParams.id_inscription}/`,
        donnees_completes,
      );

      router.push(`/ecole_peg/eleves/eleve/${resolvedParams.id}/`);
    } catch (err) {
      console.error("Erreur: ", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(`/ecole_peg/eleves/eleve/${resolvedParams.id}/`)
          }
          aria-label="Retourner à la page précédente"
        >
          <ArrowLeft className="h-4 w-4" />
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
                  value={id_session?.toString()}
                  onValueChange={(valeur) => setIdSession(Number(valeur))}
                >
                  <SelectTrigger id="session">
                    <SelectValue placeholder="Sélectionner la session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem
                        key={session.id}
                        value={session.id.toString()}
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
                            Du {formatDate(session.date_debut)} au{" "}
                            {formatDate(session.date_fin)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date_sortie" className="text-base">
                    Date de sortie
                  </Label>
                  <div className="relative">
                    <Input
                      id="date_sortie"
                      type="date"
                      className="w-full"
                      value={
                        date_sortie instanceof Date &&
                        !isNaN(date_sortie.getTime())
                          ? format(date_sortie, "yyyy-MM-dd")
                          : ""
                      }
                      onChange={(e) => setDateSortie(new Date(e.target.value))}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Optionnel - Laissez vide si l&apos;élève est toujours
                    inscrit
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motif_sortie" className="text-base">
                    Motif de sortie
                  </Label>
                  <Input
                    id="motif_sortie"
                    placeholder="Ex: Déménagement, niveau atteint..."
                    className="w-full"
                    {...register("motif_sortie")}
                  />
                  <p className="text-sm text-muted-foreground">
                    Optionnel - Raison de la fin de l&apos;inscription
                  </p>
                </div>
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
