from ninja import Schema
from datetime import date, time


# ------------------- COURS -------------------
class CoursOut(Schema):
    id: int
    nom: str
    type_cours: str
    niveau: str
    heures_par_semaine: int | None = None
    duree_semaines: int | None = None
    tarif: float


class CoursIn(Schema):
    nom: str
    type_cours: str
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
    seances_mois: int


class SessionOut(Schema):
    id: int
    id_cours: int
    id_enseignant: int | None = None
    enseignant__nom: str | None = None
    enseignant__prenom: str | None = None
    cours__nom: str
    cours__type_cours: str
    cours__niveau: str
    date_debut: date
    date_fin: date
    periode_journee: str | None = None
    statut: str
    capacite_max: int
    seances_mois: int


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
    enseignant: int
    enseignant__nom: str
    enseignant__prenom: str
    eleves: list[str] = []
    eleves_ids: list[int] = []


# ------------------- INSCRIPTION -------------------
class InscriptionIn(Schema):
    frais_inscription: float
    but: str | None = None
    preinscription: bool | None = None
    id_session: int


class InscriptionOut(Schema):
    id: int
    date_inscription: date
    frais_inscription: float
    but: str
    statut: str
    date_sortie: date | None = None
    motif_sortie: str | None = None
    preinscription: bool
    id_session: int


class InscriptionUpdateIn(Schema):
    frais_inscription: float | None = None
    but: str | None = None
    statut: str | None = None
    date_sortie: date | None = None
    motif_sortie: str | None = None
    preinscription: bool | None = None
    id_session: int | None = None


class FichePresencesIn(Schema):
    mois: str
    annee: int


class FichesPresencesOut(Schema):
    id: int
    mois: str
    annee: int


class PresenceIn(Schema):
    id: int
    statut: str


class PresenceOut(Schema):
    id: int
    id_eleve: int
    date_presence: date
    statut: str


class FichePresencesOut(Schema):
    id: int
    mois: str
    annee: int
    presences: list[PresenceOut]
