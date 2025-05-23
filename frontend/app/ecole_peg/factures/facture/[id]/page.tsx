"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/button";
import { Card, CardContent, CardFooter } from "@/components/card";
import { ArrowLeft, Download } from "lucide-react";

interface Facture {
  id: number;
  date_emission: Date;
  montant_total: number;
  eleve_nom: string;
  eleve_prenom: string;
}

interface DetailFacture {
  id: number;
  description: string;
  date_debut_periode: Date;
  date_fin_periode: Date;
  montant: number;
}

export default function FacturePage() {
  const router = useRouter();
  const params = useParams();
  const factureId = params.id as string;

  const [facture, setFacture] = useState<Facture>();
  const [details_facture, setDetailsFacture] = useState<DetailFacture[]>([]);
  const factureRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (factureRef.current) {
      const canvas = await html2canvas(factureRef.current, {
        width: window.innerWidth * 2,
        height: window.innerHeight * 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pdfWidth = pageWidth;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`facture_${facture?.id || "ecole"}.pdf`);
    }
  };

  useEffect(() => {
    async function fetchFacture() {
      try {
        const reponse = await axios.get(
          `http://localhost:8000/api/factures/facture/${factureId}/`,
        );
        setFacture(reponse.data);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    async function fetchDetailsFacture() {
      try {
        const reponse = await axios.get(
          `http://localhost:8000/api/factures/facture/${factureId}/details/`,
        );
        setDetailsFacture(reponse.data);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }
    if (factureId) {
      fetchFacture();
      fetchDetailsFacture();
    }
  }, [factureId]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Retourner à la page précédente"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Facture #{facture?.id}
            </h1>
            <p className="text-muted-foreground">
              {facture?.date_emission
                ? format(new Date(facture.date_emission), "dd MMMM yyyy")
                : "-"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDownloadPdf}
          className="shadow-sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Télécharger PDF
        </Button>
      </div>

      {/* Invoice Content */}
      <div
        ref={factureRef}
        className="bg-white rounded-xl shadow-md print:shadow-none"
      >
        <Card className="border-none">
          <CardContent className="p-8 space-y-8">
            {/* School Header */}
            <div className="flex flex-col md:flex-row md:justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <Image
                               src="/logo/ecole_peg.png"
                               alt="École PEG"
                               width={200}
                               height={100}
                               className="object-contain"
                             />
                  
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Rue du Nant 34</p>
                  <p>1207 Genève</p>
                  <p>Téléphone : 022 700 45 35</p>
                  <p>Email : info@ecole-peg.ch</p>
                  <p>www.ecole-peg.ch</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-primary mb-2">
                    Facture
                  </h2>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">
                        N° de facture :
                      </span>{" "}
                      <span className="font-medium">{facture?.id}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Date d&apos;émission :
                      </span>{" "}
                      <span className="font-medium">
                        {facture?.date_emission
                          ? format(
                              new Date(facture.date_emission),
                              "dd MMMM yyyy",
                            )
                          : "-"}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Échéance :</span>{" "}
                      <span className="font-medium">À réception</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="rounded-lg bg-muted/30 p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Facturé à
              </h3>
              <p className="text-lg font-semibold">
                {facture?.eleve_prenom} {facture?.eleve_nom}
              </p>
            </div>

            {/* Invoice Details Table */}
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Période
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {details_facture.map((detail) => (
                    <tr key={detail.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">{detail.description}</td>
                      <td className="px-4 py-3">
                        {detail.date_debut_periode && (
                          <>
                            Du{" "}
                            {format(
                              new Date(detail.date_debut_periode),
                              "dd MMMM yyyy",
                            )}
                            {detail.date_fin_periode && (
                              <>
                                {" "}
                                au{" "}
                                {format(
                                  new Date(detail.date_fin_periode),
                                  "dd MMMM yyyy",
                                )}
                              </>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {detail.montant.toFixed(2)} CHF
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/50">
                    <td colSpan={2} className="px-4 py-4 text-right font-bold">
                      Total
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-primary">
                      {facture?.montant_total.toFixed(2)} CHF
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bank Details */}
            <div className="rounded-lg border bg-muted/30 p-6 space-y-4">
              <h3 className="font-semibold text-primary">
                Coordonnées bancaires
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-x-4 text-sm">
                    <div className="text-muted-foreground">Titulaire</div>
                    <div className="font-medium">Ecole P.E.G SARL</div>
                    <div className="text-muted-foreground">Compte</div>
                    <div className="font-medium">240-288885.00ZP</div>
                    <div className="text-muted-foreground">IBAN</div>
                    <div className="font-medium">
                      CH55 0024 0240 2888 8500 Z
                    </div>
                    <div className="text-muted-foreground">BIC / SWIFT</div>
                    <div className="font-medium">UBS W CH ZH 80A</div>
                  </div>
                </div>
                <div className="flex justify-center md:justify-end">
                  <Image
                    src="/QR.png"
                    alt="QR Code pour paiement"
                    width={120}
                    height={80}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t px-8 py-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Merci de votre confiance.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Payment Button */}
      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-sm transition-all duration-200 hover:shadow-md"
          onClick={() =>
            router.push(`/ecole_peg/factures/facture/${factureId}/payer`)
          }
        >
          Procéder au paiement
        </Button>
      </div>
    </div>
  );
}
