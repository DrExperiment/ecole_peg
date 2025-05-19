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
    <div className="flex flex-col gap-4 max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mt-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Détail de la facture
        </h1>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleDownloadPdf}>
          <Download className="mr-2 h-4 w-4" />
          Télécharger PDF
        </Button>
        {/* <Button>
          <Send className="mr-2 h-4 w-4" />
          Envoyer par email
        </Button> */}
      </div>

      {/* Partie PDF */}
      <div
        ref={factureRef}
        className="bg-white rounded-2xl shadow-lg p-0 print:p-0 border"
      >
        <Card className="border-none shadow-none">
          <CardContent className="p-8">
            {/* En-tête établissement */}
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <div>
                <div className="text-2xl font-extrabold text-primary mb-1">
                  Le Français de A à Z
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>École PEG</p>
                  <p>Rue du Nant 34</p>
                  <p>1207 Genève</p>
                  <p>Téléphone : 022 700 45 35</p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    info@ecole-peg.ch
                  </p>
                  <p>www.ecole-peg.ch</p>
                </div>
              </div>
              <div className="text-right flex flex-col justify-between">
                <h2 className="text-3xl font-bold mb-2 text-blue-800">
                  Facture n° {facture?.id}
                </h2>
                <div className="text-sm">
                  <p>
                    Date&nbsp;:&nbsp;
                    <span className="font-semibold">
                      {facture?.date_emission
                        ? format(facture.date_emission, "dd-MM-yyyy")
                        : "-"}
                    </span>
                  </p>
                  <p>
                    Paiement&nbsp;:&nbsp;
                    <span className="font-semibold">à réception</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Élève concerné */}
            <div className="mt-8 mb-2 text-lg font-medium">
              <span className="text-muted-foreground">Émise pour&nbsp;: </span>
              <span className="font-bold">
                {facture?.eleve_nom} {facture?.eleve_prenom}
              </span>
            </div>

            {/* Tableau des détails */}
            <div className="mt-2 rounded-lg border overflow-x-auto bg-gray-50">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-2 text-left font-semibold text-sm">
                      Description
                    </th>
                    <th className="py-3 px-2 text-left font-semibold text-sm">
                      Période
                    </th>
                    <th className="py-3 px-2 text-right font-semibold text-sm">
                      Prix
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details_facture.map((detail) => (
                    <tr key={detail.id} className="border-b last:border-b-0">
                      <td className="py-3 px-2">{detail.description}</td>
                      <td className="py-3 px-2">
                        {detail.date_debut_periode
                          ? "Du " +
                            format(detail.date_debut_periode, "dd-MM-yyyy")
                          : ""}
                        {detail.date_fin_periode
                          ? " au " +
                            format(detail.date_fin_periode, "dd-MM-yyyy")
                          : ""}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">
                        {detail.montant} CHF
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      className="py-4 px-2 text-right font-bold text-base"
                      colSpan={2}
                    >
                      Total à payer
                    </td>
                    <td className="py-4 px-2 text-right font-bold text-base text-blue-900">
                      {facture?.montant_total} CHF
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bloc bancaire */}
            <div className="mt-8 rounded-lg border bg-blue-50 p-4">
              <h3 className="font-semibold mb-2 text-blue-800">
                Coordonnées bancaires :
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                <div className="font-medium">Ecole P.E.G SARL</div>
                <div></div>
                <div>Compte courant</div>
                <div>UBS</div>
                <div>No de compte</div>
                <div>240-288885.00ZP</div>
                <div>No de client</div>
                <div>240-28885</div>
                <div>IBAN</div>
                <div>CH55 0024 0240 2888 8500 Z</div>
                <div>Code BIC / SWIFT</div>
                <div>UBS W CH ZH 80A</div>
                <Image
                  src="/QR.png"
                  alt="QR Code"
                  width={150}
                  height={150}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t px-8 py-4">
            <p className="text-xs text-muted-foreground italic">
              Merci de votre confiance.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Bouton "Payer" en dehors de la facture exportée */}
      <div className="flex justify-end mt-6">
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 rounded-xl shadow"
          onClick={() =>
            router.push(`/ecole_peg/factures/facture/${factureId}/payer`)
          }
        >
          Payer
        </Button>
      </div>
    </div>
  );
}
