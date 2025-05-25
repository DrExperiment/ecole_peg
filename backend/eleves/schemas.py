from datetime import date
from ninja import Schema, UploadedFile, File


# ------------------- GARANT -------------------
class GarantIn(Schema):
    nom: str
    prenom: str
    rue: str | None = None
    numero: str | None = None
    npa: str | None = None
    localite: str | None = None
    telephone: str
    email: str


class GarantOut(Schema):
    id: int
    nom: str
    prenom: str
    rue: str | None = None
    numero: str | None = None
    npa: str | None = None
    localite: str | None = None
    telephone: str
    email: str


# ------------------- PAYS -------------------
class PaysOut(Schema):
    id: int
    nom: str
    indicatif: str


# ------------------- TEST -------------------
class TestIn(Schema):
    date_test: date
    niveau: str
    note: float


class TestOut(Schema):
    id: int
    date_test: date
    niveau: str
    note: float


# ------------------- DOCUMENT -------------------
class DocumentOut(Schema):
    id: int
    nom: str
    fichier_url: str
    date_ajout: date

    @classmethod
    def from_model(cls, document, request) -> "DocumentOut":
        return cls(
            id=document.id,
            nom=document.nom,
            fichier_url=request.build_absolute_uri(document.fichier.url),
            date_ajout=document.date_ajout,
        )


class DocumentUpdateIn(Schema):
    nom: str | None = None
    fichier: UploadedFile | None = File(None)


# ------------------- ELEVE -------------------
class EleveIn(Schema):
    nom: str
    prenom: str
    date_naissance: date
    lieu_naissance: str
    sexe: str
    rue: str | None = None
    numero: str | None = None
    npa: str | None = None
    localite: str | None = None
    telephone: str
    email: str
    adresse_facturation: str | None = None
    type_permis: str | None = None
    date_permis: date | None = None
    niveau: str | None = None
    langue_maternelle: str | None = None
    autres_langues: str | None = None
    src_decouverte: str | None = None
    commentaires: str | None = None
    pays_id: int


class ElevesOut(Schema):
    id: int
    nom: str
    prenom: str
    date_naissance: date
    telephone: str
    email: str
    pays__nom: str


class EleveOut(Schema, from_attributes=True):
    id: int
    nom: str
    prenom: str
    date_naissance: date
    lieu_naissance: str
    sexe: str
    rue: str | None = None
    numero: str | None = None
    npa: str | None = None
    localite: str | None = None
    telephone: str
    email: str
    adresse_facturation: str | None = None
    type_permis: str | None = None
    date_permis: date | None = None
    niveau: str | None = None
    langue_maternelle: str | None = None
    autres_langues: str | None = None
    src_decouverte: str | None = None
    commentaires: str | None = None
    pays_id: int
    pays__nom: str


class Anniversaire(Schema):
    id: int
    nom: str
    prenom: str
    date_naissance: date
    age: int
