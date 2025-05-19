"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/card";
import { Input } from "@/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import axios from "axios";

interface CoursIn {
  nom: string;
  type: string;
  niveau: string;
  heures_par_semaine: number;
  duree_semaines: number;
  tarif: number;
}

export default function ModifierCoursPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [cours, setCours] = useState<CoursIn | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le cours à modifier
    async function fetchCours() {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/cours/cours/${id}/`,
        );
        setCours(res.data);
      } catch {
        setMessage("Erreur lors du chargement du cours.");
      }
    }
    if (id) fetchCours();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (!cours) return;
    const { name, value } = e.target;
    setCours({
      ...cours,
      [name]:
        name === "heures_par_semaine" ||
        name === "duree_semaines" ||
        name === "tarif"
          ? Number(value)
          : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!cours) return;
    setCours({ ...cours, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await axios.put(`http://localhost:8000/api/cours/cours/${id}/`, cours);
      setMessage("Cours modifié avec succès !");
      setTimeout(() => router.push("/ecole_peg/cours"), 1200);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.erreurs) {
        setMessage("Erreurs : " + JSON.stringify(err.response.data.erreurs));
      } else {
        setMessage("Erreur lors de la modification.");
      }
    }
  };

  if (!cours) {
    return (
      <div className="flex justify-center mt-20">
        <Card>
          <CardHeader>
            <CardTitle>Chargement…</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Modifier un cours</CardTitle>
          <CardDescription>
            Modifiez les informations du cours puis enregistrez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-medium">Nom</label>
              <Input
                name="nom"
                value={cours.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="font-medium">Type</label>
              <Select
                value={cours.type}
                onValueChange={(val) => handleSelectChange("type", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Intensif</SelectItem>
                  <SelectItem value="S">Semi-intensif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium">Niveau</label>
              <Select
                value={cours.niveau}
                onValueChange={(val) => handleSelectChange("niveau", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Niveau" />
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
            <div>
              <label className="font-medium">Heures par semaine</label>
              <Input
                type="number"
                name="heures_par_semaine"
                value={cours.heures_par_semaine}
                min={1}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="font-medium">Durée (semaines)</label>
              <Input
                type="number"
                name="duree_semaines"
                value={cours.duree_semaines}
                min={1}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="font-medium">Tarif (CHF)</label>
              <Input
                type="number"
                name="tarif"
                value={cours.tarif}
                min={0}
                onChange={handleChange}
                required
              />
            </div>
            {message && (
              <div className="text-center text-sm text-red-600 mt-2">
                {message}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-2">
              <Button type="submit">Enregistrer</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
