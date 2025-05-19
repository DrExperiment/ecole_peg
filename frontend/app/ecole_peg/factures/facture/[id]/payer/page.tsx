"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

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
import { useToast } from "@/components/use-toast";

interface Facture {
  id: number;
  date_emission: string;
  montant_total: number;
  montant_restant: number;
  inscription__eleve__nom: string;
  inscription__eleve__prenom: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amount);
}

// File: app/ecole_peg/factures/factures/[id]/payer/page.tsx
export default function PaiementFacturePage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { toast } = useToast();

  const [facture, setFacture] = useState<Facture | null>(null);
  const [montant, setMontant] = useState("");
  const [modePaiement, setModePaiement] = useState("Personnel");
  const [methodePaiement, setMethodePaiement] = useState("Espèces");

  useEffect(() => {
    console.log("Param id reçu:", id);
    if (!id) return;
    const fetchFacture = async () => {
      try {
        // Correct endpoint for fetching single facture
        const url = `http://localhost:8000/api/factures/facture/${id}/`;
        console.log("Fetching facture via URL:", url);
        const res = await axios.get<Facture>(url);
        console.log("Facture reçue:", res.data);
        setFacture(res.data);
      } catch (error) {
        console.error("Erreur récupération facture :", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la facture",
          variant: "destructive",
        });
      }
    };
    fetchFacture();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facture) return;
    const montantPaiement = parseFloat(montant);
    if (isNaN(montantPaiement) || montantPaiement <= 0) {
      toast({
        title: "Erreur",
        description: "Montant invalide",
        variant: "destructive",
      });
      return;
    }
    if (montantPaiement > facture.montant_restant) {
      toast({
        title: "Erreur",
        description: "Le montant dépasse le montant restant",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/factures/paiements/", {
        id_facture: facture.id,
        montant: montantPaiement,
        mode_paiement: modePaiement,
        methode_paiement: methodePaiement,
      });
      toast({
        title: "Paiement enregistré",
        description: `Paiement de ${formatCurrency(montantPaiement)}`,
      });
      router.push("/ecole_peg/factures/");
    } catch (error: unknown) {
      console.error("Erreur enregistrement paiement :", error);
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        console.error(
          "Détails de la validation :",
          JSON.stringify(error.response.data.detail, null, 2),
        );
      }
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive",
      });
    }
  };

  const handleAnnuler = () => {
    router.back();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleAnnuler}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Paiement Facture</h1>
      </div>

      {!facture ? (
        <p>Chargement de la facture...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Facture {facture.id} - {facture.date_emission}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Élève :</strong> {facture.inscription__eleve__prenom}{" "}
                {facture.inscription__eleve__nom}
              </p>
              <p>
                <strong>Montant total :</strong>{" "}
                {formatCurrency(facture.montant_total)}
              </p>
              <p>
                <strong>Montant restant :</strong>{" "}
                {formatCurrency(facture.montant_restant)}
              </p>

              <div className="space-y-2">
                <Label htmlFor="montant">Montant du paiement (CHF)</Label>
                <Input
                  id="montant"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={facture.montant_restant}
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select value={modePaiement} onValueChange={setModePaiement}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personnel">Personnel</SelectItem>
                    <SelectItem value="BPA">BPA</SelectItem>
                    <SelectItem value="CAF">CAF</SelectItem>
                    <SelectItem value="Hospice">Hospice</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {modePaiement === "Personnel" && (
                <div className="space-y-2">
                  <Label>Méthode de paiement</Label>
                  <Select
                    value={methodePaiement}
                    onValueChange={setMethodePaiement}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Espèces">Espèces</SelectItem>
                      <SelectItem value="Virement">Virement</SelectItem>
                      <SelectItem value="Carte">Carte</SelectItem>
                      <SelectItem value="Téléphone">Téléphone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="submit">Enregistrer le paiement</Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
