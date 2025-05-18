'use client';

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";

const months = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
];

export default function NouvelleFichePresence({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 🚩 on "débloque" le promise params
  const { id: id_session } = use(params);

  const router = useRouter();
  const [mois, setMois] = useState<string>();
  const [annee, setAnnee] = useState<number>(new Date().getFullYear());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mois || !annee) return;

    try {
    const response = await axios.post(
      `http://localhost:8000/api/cours/session/${id_session}/fiche_presences/`,
      {mois, annee},
    );
    console.log("Réponse de l'API :", response.data);
      router.push(`/ecole_peg/sessions/session/${id_session}`);
    } catch (error: any) {
      console.error("Erreur détaillée :", error.response?.data);
      alert("Erreur : " + JSON.stringify(error.response?.data));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardContent className="space-y-4">
          <h1 className="text-xl font-semibold">Créer une fiche de présence</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="mois">Mois</Label>
              <Select value={mois} onValueChange={setMois}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un mois" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="annee">Année</Label>
              <Input
                id="annee"
                type="number"
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-between items-center">
              <Button type="submit" disabled={!mois || !annee}>
                Créer la fiche
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
