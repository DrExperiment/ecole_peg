"use client"

import Link from "next/link";
import { Button } from "@/components/button";
import { Card, CardContent, CardFooter } from "@/components/card";
import { ArrowLeft, Download, Printer, Send } from "lucide-react";
import { use, useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import axios from "axios";
interface Facture {
  id: number;
  date_emission: Date;
  montant_total: number;
  inscription__eleve__nom: string;
  inscription__eleve__prenom: string;
}

interface DetailFacture {
  id: number;
  description: string;
  date_debut_periode: Date;
  date_fin_periode: Date;
  montant: number;
}

export default function FacturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [facture, setFacture] = useState<Facture>();
  const [details_facture, setDetailsFacture] = useState<DetailFacture[]>([]);

  useEffect(() => {
    async function fetchFacture() {
      try {
        const reponse = await axios.get(
          `http://localhost:8000/api/factures/facture/${resolvedParams.id}/`
        );

        setFacture(reponse.data);
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    async function fetchDetailsFacture() {
      try {
        const reponse = await axios.get(
          `http://localhost:8000/api/factures/facture/${resolvedParams.id}/details/`
        );

        setDetailsFacture(reponse.data); // c'est ici que sont vraiment les détails de la facture
      } catch (erreur) {
        console.error("Erreur: ", erreur);
      }
    }

    fetchFacture();
    fetchDetailsFacture();
  }, [resolvedParams.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ecole_peg/factures/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Facture</h1>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Télécharger PDF
        </Button>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Envoyer par email
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-8">
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">
                  Le Français de A à Z
                </div>
                <div className="mt-2">
                  <p>École PEG</p>
                  <p>Rue du Nant 34</p>
                  <p>1207 Genève</p>
                  <p>Téléphone : 022 700 45 35</p>
                  <p>info@ecole-peg.ch</p>
                  <p>http://www.ecole-peg.ch</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold">Facture  N° {facture?.id}</h2>
                <div className="mt-2">
                  <p>
                    Date :{" "}
                    {facture?.date_emission ? format(facture.date_emission, "dd-MM-yyyy") : "-"}
                  </p>
                  <p>Paiement : à réception</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-left">Période</th>
                      <th className="py-2 text-right">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details_facture.map((detail_facture) => (
                      <tr key={detail_facture.id} className="border-b">
                        <td className="py-4">{detail_facture.description}</td>
                        <td className="py-4">
                          {detail_facture.date_debut_periode
                            ? "Du " +
                              format(
                                detail_facture.date_debut_periode,
                                "dd-MM-yyyy"
                              )
                            : ""}{" "}
                          {detail_facture.date_fin_periode
                            ? "au " +
                              format(
                                detail_facture.date_fin_periode,
                                "dd-MM-yyyy"
                              )
                            : ""}
                        </td>
                        <td className="py-4 text-right">{`${detail_facture.montant} CHF`}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-4 text-right font-bold" colSpan={2}>
                        Total à payer
                      </td>
                      <td className="py-4 text-right font-bold">{`${facture?.montant_total} CHF`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 rounded-lg border p-4">
              <h3 className="font-semibold">Coordonnées bancaires:</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>Ecole P.E.G SARL</div>
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
                <div>
                <img
                    src="/QR.png"
                    alt="QR Code"
                    width={150}
                    height={150}
                   className="object-contain"
                   />
              </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Facture émise pour: {facture?.inscription__eleve__nom}{" "}
              {facture?.inscription__eleve__prenom}
            </p>
          </div>
          <Button onClick={()=> {
            router.push(`/ecole_peg/factures/facture/${resolvedParams.id}/payer`)}}>Payer</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
