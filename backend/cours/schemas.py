from ninja import Schema
from datetime import date, time

# ------------------- COURS -------------------
class CoursOut(Schema):
    id: int
    nom: str
    type: str
    niveau: str
    heures_par_semaine: int
    duree_semaines: int
    tarif: float

class CoursIn(Schema):
    nom: str
    type: str
    niveau: str
    heures_par_semaine: int | None = None
    duree_semaines: int | None = None
    tarif: float

# ------------------- ENSEIGNANT -------------------
class EnseignantOut(Schema):
    id: int
    nom: str
    prenom: str

class EnseignantIn(Schema):
    nom: str
    prenom: str

# ------------------- SESSION -------------------
class SessionIn(Schema):
    id_cours: int
    id_enseignant: int
    date_debut: date
    date_fin: date
    periode_journee: str
    capacite_max: int

class SessionOut(Schema):
    id: int
    cours__nom: str
    cours__type: str
    cours__niveau: str
    date_debut: date
    date_fin: date
    periode_journee: str | None = None
    statut: str

# ------------------- COURS PRIVES -------------------
class CoursPriveIn(Schema):
    date_cours_prive: date
    heure_debut: time
    heure_fin: time
    tarif: float
    lieu: str
    eleves_ids: list[int]
    enseignant: int

class CoursPriveOut(Schema):
    id: int
    date_cours_prive: date
    heure_debut: time
    heure_fin: time
    tarif: float
    lieu: str
    enseignant__nom: str
    enseignant__prenom: str
    eleves: list[str] = []

# ------------------- INSCRIPTION -------------------
class InscriptionIn(Schema):
    frais_inscription: float
    but: str | None = None
    preinscription: bool | None = None
    id_session: int
    date_inscription: date | None = None

class InscriptionOut(Schema):
    id: int
    date_inscription: date
    frais_inscription: float
    but: str
    statut: str
    date_sortie: date | None = None
    motif_sortie: str | None = None
    preinscription: bool

class InscriptionUpdateIn(Schema):
    date_inscription: date | None = None
    frais_inscription: float | None = None
    but: str | None = None
    statut: str | None = None
    date_sortie: str | None = None
    motif_sortie: str | None = None
    preinscription: bool | None = None
    id_session: int | None = None
