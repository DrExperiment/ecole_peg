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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/paiements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau Paiement</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Sélection de la facture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="etudiant">
              Étudiant {eleve ? eleve.nom : "Chargement..."}
            </Label>
            <div className="space-y-2"></div>

            {resolvedParams && factures.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucune facture impayée pour cet étudiant.
              </p>
            )}

            {factures.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Factures non payées</h3>
                <div className="rounded-md border">
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
                          <TableCell>{f.numero}</TableCell>
                          <TableCell>{f.date_emission}</TableCell>
                          <TableCell>{f.description}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(f.montant_total)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(f.montant_restant)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setFactureId(f.id)}
                              >
                                Sélectionner
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
              </div>
            )}

            {factureSelectionnee && (
              <div className="mt-6 p-4 border rounded-md bg-muted/50">
                <h3 className="text-sm font-medium mb-2">
                  Facture sélectionnée: {factureSelectionnee.numero}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{factureSelectionnee.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Montant restant
                    </p>
                    <p className="font-bold">
                      {formatCurrency(factureSelectionnee.montant_restant)}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handledeselectionner}
                      className="mt-2"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {factureSelectionnee && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Détails du paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            <CardFooter>
              <Button type="submit">Enregistrer le paiement</Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
}
