"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Checkbox } from "@/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { CalendarIcon, ArrowLeft, Save } from "lucide-react";
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";

import { cn, fetchApi } from "@/lib/utils";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/textarea";
import { toast } from "@/components/use-toast";
export default function NouveauElevePage(){

    const { register } = useForm();
    const [a_garant, setAGarant] = useState(false);

return (
<Card className="md:col-span-2">
  <CardHeader>
    <CardTitle>Informations du garant</CardTitle>
    <CardDescription>
      Veuillez préciser les informations du garant, le cas échéant.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center space-x-2 pb-4">
      <Checkbox
        id="a_garant"
        checked={a_garant === true}
        onCheckedChange={(checked) => {
          setAGarant(checked ? true : false);

          register("a_garant").onChange({
            target: {
              name: "a_garant",
              value: checked ? true : false,
            },
          });
        }}
      />
      <Label htmlFor="a_garant">L&apos;élève a un garant</Label>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="nom_garant">Nom du garant</Label>
        <Input
          id="nom_garant"
          placeholder="Nom du garant"
          disabled={!a_garant}
          {...register(
            "nom_garant",
            a_garant
              ? {
                  pattern: {
                    value: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
                    message:
                      "Le nom ne doit contenir que des lettres, espaces, apostrophes ou tirets.",
                  },
                  setValueAs: (v) => v.trim(),
                }
              : {}
          )}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prenom_garant">Prénom du garant</Label>
        <Input
          id="prenom_garant"
          placeholder="Prénom du garant"
          disabled={!a_garant}
          {...register(
            "prenom_garant",
            a_garant
              ? {
                  pattern: {
                    value: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
                    message:
                      "Le prénom ne doit contenir que des lettres, espaces, apostrophes ou tirets.",
                  },
                  setValueAs: (v) => v.trim(),
                }
              : {}
          )}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telephone_garant">Téléphone du garant</Label>
        <Input
          id="telephone_garant"
          type="tel"
          placeholder="Numéro de téléphone"
          disabled={!a_garant}
          {...register(
            "telephone_garant",
            a_garant
              ? {
                  pattern: {
                    value:
                      /^(?:(?:\+|00)33\s?|0)[1-9](?:[\s.-]*\d{2}){4}$/,
                    message:
                      "Le numéro de téléphone doit être au format français.",
                  },
                  setValueAs: (v) => v.trim(),
                }
              : {}
          )}
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="email_garant">Email du garant</Label>
      <Input
        id="email_garant"
        type="email"
        placeholder="Adresse email"
        disabled={!a_garant}
        {...register(
          "email_garant",
          a_garant
            ? {
                setValueAs: (v) => v.trim(),
              }
            : {}
        )}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="rue_garant">Rue</Label>
        <Input
          id="rue_garant"
          placeholder="Rue"
          disabled={!a_garant}
          {...register("rue_garant")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="numero-garant">Numéro</Label>
        <Input
          id="numero_garant"
          placeholder="Numéro"
          disabled={!a_garant}
          {...register("numero_garant")}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="npa_garant">NPA</Label>
        <Input
          id="npa_garant"
          placeholder="NPA"
          disabled={!a_garant}
          {...register("npa_garant")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="localite_garant">Localité</Label>
        <Input
          id="localite_garant"
          placeholder="Localité"
          disabled={!a_garant}
          {...register("localite_garant")}
        />
      </div>
    </div>
    <Button> Ajouter </Button>
  </CardContent>
</Card>
);

}