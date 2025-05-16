from datetime import date
from ninja import Schema

# ------------------- FACTURE -------------------

class DetailFactureIn(Schema):
    description: str
    date_debut_periode: date | None = None
    date_fin_periode: date | None = None
    montant: float


class FactureIn(Schema):
    id_inscription: int | None = None
    id_cours_prive: int | None = None
    id_eleve: int | None = None
    date_emission: date
    details_facture: list[DetailFactureIn]


class FacturesOut(Schema):
    id: int
    date_emission: date
    montant_total: float
    montant_restant: float


class FactureOut(Schema):
    id: int
    date_emission: date
    montant_total: float
    montant_restant: float
    eleve_nom: str
    eleve_prenom: str


class DetailFactureOut(Schema):
    id: int
    description: str
    date_debut_periode: date | None = None
    date_fin_periode: date | None = None
    montant: float


class PaiementIn(Schema):
    montant:float
    mode_paiement: str
    methode_paiement: str
    id_facture: int

class PaiementOut(Schema):
    id: int
    date_paiement: date
    montant: float
    mode_paiement: str
    methode_paiement: str

