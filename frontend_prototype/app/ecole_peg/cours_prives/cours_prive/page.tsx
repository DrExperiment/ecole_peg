"use client"

import Link from "next/link"
import { useState, useEffect, useCallback, FormEvent } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { debounce } from "lodash"

import { Button } from "@/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { RadioGroup, RadioGroupItem } from "@/components/radio-group"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/select"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/components/use-toast"

// Types
interface Eleve {
  id: number
  nom: string
  prenom: string
}
interface Enseignant {
  id: number
  nom: string
  prenom: string
}

interface CreateCoursPrivePayload {
  date_cours_prive: string       // "YYYY-MM-DD"
  heure_debut: string            // "HH:MM"
  heure_fin: string              // "HH:MM"
  tarif: number
  lieu: "E" | "D"
  eleves_ids: number[]
  enseignant: number             // correspond à ton schema `enseignant: int`
}

export default function NouveauCoursPrivePage() {
  const router = useRouter()
  const { toast } = useToast()

  // === ÉTATS ÉLÈVES ========================
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [searchResults, setSearchResults] = useState<Eleve[]>([])
  const [selectedEleves, setSelectedEleves] = useState<Eleve[]>([])

  // === ÉTATS ENSEIGNANTS ===================
  const [enseignants, setEnseignants] = useState<Enseignant[]>([])
  const [selectedEnseignant, setSelectedEnseignant] = useState<Enseignant | null>(null)

  // === ÉTATS COURS PRIVÉ ===================
  const [dateCoursPrive, setDateCoursPrive] = useState<string>("")
  const [heureDebut, setHeureDebut] = useState<string>("")
  const [heureFin, setHeureFin] = useState<string>("")
  const [tarif, setTarif] = useState<string>("")
  const [lieu, setLieu] = useState<"ecole" | "domicile">("ecole")

  // --- Chargement des enseignants au mount ---
  useEffect(() => {
    axios
      .get<Enseignant[]>("http://localhost:8000/api/cours/enseignants/")
      .then(({ data }) => setEnseignants(data))
      .catch(err => console.error("Erreur chargement enseignants:", err))
  }, [])

  // --- Recherche d'élèves débouncée ---
  const fetchEleves = useCallback(
    debounce(async (term: string) => {
      if (!term) {
        setSearchResults([])
        return
      }
      try {
        const { data } = await axios.get<{ eleves: Eleve[] }>(
          "http://localhost:8000/api/eleves/eleves/",
          { params: { recherche: term } }
        )
        setSearchResults(data.eleves)
      } catch (err) {
        console.error(err)
      }
    }, 300),
    []
  )
  useEffect(() => {
    fetchEleves(searchTerm)
  }, [searchTerm, fetchEleves])

  const addEleve = (e: Eleve) => {
    if (!selectedEleves.find(x => x.id === e.id)) {
      setSelectedEleves(prev => [...prev, e])
    }
    setSearchTerm("")
    setSearchResults([])
  }
  const removeEleve = (id: number) => {
    setSelectedEleves(prev => prev.filter(x => x.id !== id))
  }

  // === SOUMISSION DU FORMULAIRE ============
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation front
    if (!dateCoursPrive || !heureDebut || !heureFin || !tarif) {
      toast({ title: "Erreur", description: "Remplissez date, heures et tarif." })
      return
    }
    if (!selectedEnseignant) {
      toast({ title: "Erreur", description: "Sélectionnez un enseignant." })
      return
    }
    if (selectedEleves.length === 0) {
      toast({ title: "Erreur", description: "Ajoutez au moins un élève." })
      return
    }

    // Construction payload
    const payload: CreateCoursPrivePayload = {
      date_cours_prive: dateCoursPrive,
      heure_debut: heureDebut,
      heure_fin: heureFin,
      tarif: Number(tarif),
      lieu: lieu === "ecole" ? "E" : "D",
      eleves_ids: selectedEleves.map(x => x.id),
      enseignant: selectedEnseignant.id,
    }

    try {
      await axios.post("http://localhost:8000/api/cours/cours_prive/", payload)
      toast({ title: "Succès", description: "Cours privé créé." })
      router.back()
    } catch (err: any) {
        console.error("Payload envoyé :", payload)
        if (err.response) {
          console.error("Status :", err.response.status)
          console.error("Données retour API :", JSON.stringify(err.response.data, null, 2))
        } else {
          console.error("Erreur non HTTP :", err)
        }
        toast({ title: "Erreur", description: "Impossible de créer le cours privé." })
      }
      
  }

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/cours-prives">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nouveau Cours Privé</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* === Sélection des élèves === */}
        <Card>
          <CardHeader><CardTitle>Étudiants</CardTitle></CardHeader>
          <CardContent>
            <Label htmlFor="searchEleve">Rechercher un élève</Label>
            <Input
              id="searchEleve"
              placeholder="Nom..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchResults.length > 0 && (
              <ul className="border rounded max-h-40 overflow-y-auto">
                {searchResults.map(x => (
                  <li
                    key={x.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addEleve(x)}
                  >
                    {x.nom} {x.prenom}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedEleves.map(x => (
                <span key={x.id} className="px-2 py-1 bg-blue-100 rounded-full flex items-center gap-1">
                  {x.nom} {x.prenom}
                  <button type="button" onClick={() => removeEleve(x.id)} className="text-red-500">×</button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* === Sélection enseignant === */}
        <Card>
          <CardHeader><CardTitle>Enseignant</CardTitle></CardHeader>
          <CardContent>
            <Label htmlFor="enseignantSelect">Choisir un enseignant</Label>
            <Select
              value={selectedEnseignant?.id.toString() ?? ""}
              onValueChange={val => {
                const e = enseignants.find(x => x.id === Number(val)) || null
                setSelectedEnseignant(e)
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez…" />
              </SelectTrigger>
              <SelectContent>
                {enseignants.map(x => (
                  <SelectItem key={x.id} value={x.id.toString()}>
                    {x.nom} {x.prenom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* === Infos cours privé === */}
        <Card>
          <CardHeader>
            <CardTitle>Détails du cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateCoursPrive">Date du cours</Label>
                <Input
                  id="dateCoursPrive"
                  type="date"
                  value={dateCoursPrive}
                  onChange={e => setDateCoursPrive(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tarif">Tarif</Label>
                <Input
                  id="tarif"
                  type="number"
                  min={0}
                  step="0.01"
                  value={tarif}
                  onChange={e => setTarif(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heureDebut">Heure de début</Label>
                <Input
                  id="heureDebut"
                  type="time"
                  value={heureDebut}
                  onChange={e => setHeureDebut(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heureFin">Heure de fin</Label>
                <Input
                  id="heureFin"
                  type="time"
                  value={heureFin}
                  onChange={e => setHeureFin(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lieu</Label>
              <RadioGroup
                value={lieu}
                onValueChange={val => setLieu(val as "ecole" | "domicile")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ecole" id="lieu-ecole" />
                  <Label htmlFor="lieu-ecole">À l'école</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="domicile" id="lieu-domicile" />
                  <Label htmlFor="lieu-domicile">À domicile</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Enregistrer
          </Button>
        </div>
      </form>
    </div>
  )
}
