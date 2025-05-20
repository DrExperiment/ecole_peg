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
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Retourner à la page précédente"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Paiement Facture</h1>
      </div>

      {!facture ? (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="text-muted-foreground">Chargement de la facture...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Facture #{facture.id}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Émise le{" "}
                {new Date(facture.date_emission).toLocaleDateString("fr-FR")}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Information de la facture */}
              <div className="rounded-lg border bg-card p-4 text-card-foreground">
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Élève :
                    </span>
                    <span className="font-medium">
                      {facture.inscription__eleve__prenom}{" "}
                      {facture.inscription__eleve__nom}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Montant total
                      </span>
                      <p className="font-medium">
                        {formatCurrency(facture.montant_total)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Montant restant
                      </span>
                      <p className="font-medium text-blue-600">
                        {formatCurrency(facture.montant_restant)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire de paiement */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="montant" className="text-base">
                    Montant du paiement
                  </Label>
                  <div className="relative">
                    <Input
                      id="montant"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={facture.montant_restant}
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="pl-8 font-mono"
                      placeholder="0.00"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      CHF
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Maximum: {formatCurrency(facture.montant_restant)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Mode de paiement</Label>
                  <Select value={modePaiement} onValueChange={setModePaiement}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un mode de paiement" />
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
                    <Label className="text-base">Méthode de paiement</Label>
                    <Select
                      value={methodePaiement}
                      onValueChange={setMethodePaiement}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir une méthode de paiement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Espèces">Espèces</SelectItem>
                        <SelectItem value="Virement">
                          Virement bancaire
                        </SelectItem>
                        <SelectItem value="Carte">Carte bancaire</SelectItem>
                        <SelectItem value="Téléphone">
                          Paiement mobile
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={handleAnnuler}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {parseFloat(montant) > 0
                  ? `Enregistrer le paiement de ${formatCurrency(parseFloat(montant))}`
                  : "Enregistrer le paiement"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
