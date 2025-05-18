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
import { useForm } from "react-hook-form";
import axios from "axios";

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
}

export default function NouveauTestPage({
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

  const [date, setDate] = useState<Date>();
  const [niveau, setNiveau] = useState<"A1" | "A2" | "B1" | "B2" | "C1">("A1");
  const [eleve, setEleve] = useState<Eleve | undefined>(undefined);

  const onSoumission = useCallback(
    async (donnees: object) => {
      const donneesCompletes = {
        ...donnees,
        date_test: date ? format(date, "yyyy-MM-dd") : undefined,
        niveau,
      };

      console.log("Données soumises:", donneesCompletes);

      try {
        await axios.post(
          `http://localhost:8000/api/eleves/eleves/${resolvedParams.id}/tests/`,
          donneesCompletes
        );

        router.push(`/ecole_peg/eleves/eleve/${resolvedParams.id}/`);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    },
    [date, niveau, resolvedParams, router]
  );

  useEffect(() => {
    async function fetchEleve() {
      try {
        const { data } = await axios.get<Eleve>(
          `http://localhost:8000/api/eleves/eleve/${resolvedParams.id}/`
        );

        setEleve(data);
      } catch (e) {
        console.error("Erreur fetchEleve:", e);
      }
    }

    fetchEleve();
  }, [resolvedParams.id]);

  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(new Date(e.target.value));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ecole_peg/eleves/eleve/${resolvedParams.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Créer un nouveau test pour {eleve?.nom} {eleve?.prenom}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSoumission)}>
        <Card>
          <CardHeader>
            <CardTitle>Nouveau test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date du test</Label>
              <div className="flex gap-2">
                <Input
                  id="date"
                  type="date"
                  onChange={handleDate}
                  placeholder="JJ-MM-AAAA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niveau">Niveau du test</Label>
              <Select
                value={niveau}
                onValueChange={(value) =>
                  setNiveau(value as "A1" | "A2" | "B1" | "B2" | "C1")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note du test</Label>
              <Input
                id="note"
                type="number"
                placeholder="La note du test"
                {...register("note", {
                  required: "La note du test est obligatoire",
                  valueAsNumber: true,
                })}
              />
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
