"use client";
import { useEffect, useMemo, useState, use } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { useToast as importedUseToast } from "@/components/use-toast";

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
}

interface Facture {
  id: string;
  numero: string;
  date_emission: string;
  description: string;
  montant_total: number;
  montant_restant: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amount);
}

export default function NouveauPaiementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = importedUseToast();

  // Declare etudiants state
  const [etudiantId, setEtudiantId] = useState<string>("");
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [factureId, setFactureId] = useState<string>("");
  const [montant, setMontant] = useState<string>("");
  const [modePaiement, setModePaiement] = useState<string>("Personnel");
  const [methodePaiement, setMethodePaiement] = useState<string>("Espèces");

  const factureSelectionnee = useMemo(
    () => factures.find((f) => f.id === factureId) || null,
    [factureId, factures],
  );

  const montantMax = factureSelectionnee
    ? factureSelectionnee.montant_restant
    : 0;

  // Fetch étudiants au montage
  useEffect(() => {
    const fetchEleve = async () => {
      try {
        const response = await axios.get<Eleve>(
          `http://localhost:8000/api/eleves/eleve/${resolvedParams.id}/`,
        );
        console.log("Élève récupéré :", eleve);
        setEleve(response.data);
        setEtudiantId(response.data.id);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'élève :", error);
      }
    };
    fetchEleve();
  }, [eleve, resolvedParams.id]);

  // Fetch factures pour l’étudiant sélectionné
  useEffect(() => {
    if (!etudiantId) return;
    const fetchFactures = async () => {
      try {
        const response = await axios.get<Facture[]>(
          `http://localhost:8000/api/factures/factures/eleve/${resolvedParams.id}/`,
        );
        setFactures(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des factures :", error);
      }
    };
    fetchFactures();
  }, [etudiantId, resolvedParams.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const montantPaiement = parseFloat(montant);

    if (
      !factureSelectionnee ||
      isNaN(montantPaiement) ||
      montantPaiement <= 0
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez vérifier la facture et le montant.",
        variant: "destructive",
      });
      return;
    }

    if (montantPaiement > montantMax) {
      toast({
        title: "Erreur",
        description: "Le montant dépasse le reste dû.",
        variant: "destructive",
      });
      return;
    }
    try {
      axios.post("http://localhost:8000/api/factures/paiements/", {
        etudiant: etudiantId,
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du paiement :", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement.",
        variant: "destructive",
      });
    }
    toast({
      title: "Paiement enregistré",
      description: `Paiement de ${formatCurrency(montantPaiement)} pour ${
        factureSelectionnee.numero
      }`,
    });

    router.push("/dashboard/paiements");
  };

  const handledeselectionner = () => {
    setFactureId("");
    setMontant("");
  };

  // Submit paiement (à adapter avec ton backend)

  return (
    <div className="container mx-auto py-6 max-w-4xl">
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
          Nouveau paiement pour {eleve?.prenom} {eleve?.nom}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sélection de la facture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {resolvedParams && factures.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucune facture impayée pour cet élève.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Facture</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Restant</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {factures.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">
                            {f.numero}
                          </TableCell>
                          <TableCell>{f.date_emission}</TableCell>
                          <TableCell>{f.description}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(f.montant_total)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(f.montant_restant)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant={
                                  factureId === f.id ? "secondary" : "outline"
                                }
                                size="sm"
                                onClick={() => setFactureId(f.id)}
                              >
                                {factureId === f.id
                                  ? "Sélectionnée"
                                  : "Sélectionner"}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link href={`/dashboard/factures/${f.numero}`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Voir
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {factureSelectionnee && (
                  <div className="rounded-lg border bg-card p-4 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          Facture n° {factureSelectionnee.numero}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {factureSelectionnee.description}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handledeselectionner}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Annuler la sélection
                      </Button>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">
                        Montant restant à payer
                      </span>
                      <span className="text-xl font-bold font-mono">
                        {formatCurrency(factureSelectionnee.montant_restant)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {factureSelectionnee && (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Détails du paiement</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="montant">Montant du paiement (CHF)</Label>
                <Input
                  id="montant"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={montantMax}
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0.00"
                  className="font-mono"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mode de paiement</Label>
                  <Select value={modePaiement} onValueChange={setModePaiement}>
                    <SelectTrigger className="w-full">
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
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner une méthode" />
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
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                className="min-w-[200px]"
                disabled={
                  !montant ||
                  parseFloat(montant) <= 0 ||
                  parseFloat(montant) > montantMax
                }
              >
                Enregistrer le paiement
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
}
