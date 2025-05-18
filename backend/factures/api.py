from django.shortcuts import get_object_or_404
from django.db import transaction, models
from django.db.models import F, Value, DecimalField
from django.db.models.functions import Coalesce
from django.db.models import Sum
from django.core.exceptions import ValidationError
from ninja import Router
from .models import Facture, DetailFacture, Paiement
from cours.models import Inscription, CoursPrive
from eleves.models import Eleve
from .schemas import FactureIn, FacturesOut, FactureOut, DetailFactureOut, PaiementIn, PaiementOut

router = Router()

# ------------------- FACTURES -------------------
@router.get("/factures/")
def factures(request):
    qs = Facture.objects.select_related("eleve")  # Précharger la relation eleve
    return [
        FactureOut(
            id=facture.id,
            date_emission=facture.date_emission,
            montant_total=facture.montant_total,
            montant_restant=facture.montant_restant,
            eleve_nom=facture.eleve.nom,
            eleve_prenom=facture.eleve.prenom,
        )
        for facture in qs
    ]


@router.get("/factures/eleve/{id_eleve}/")
def factures_eleve(request, id_eleve: int):
    eleve = get_object_or_404(Eleve, id=id_eleve)
    factures = Facture.objects.filter(
        models.Q(inscription__eleve=eleve) | models.Q(cours_prive__eleves=eleve)
    ).distinct()
    return [FacturesOut.from_orm(f) for f in factures]


@router.get("/facture/{facture_id}/")
def rechercher_facture(request, facture_id: int):
    facture = get_object_or_404(
        Facture.objects.select_related("eleve"),  # Précharger la relation eleve
        id=facture_id
    )
    return FactureOut(
        id=facture.id,
        date_emission=facture.date_emission,
        montant_total=facture.montant_total,
        montant_restant=facture.montant_restant,
        eleve_nom=facture.eleve.nom,
        eleve_prenom=facture.eleve.prenom
    )

@router.get("/facture/{id_facture}/details/")
def rechercher_details_facture(request, id_facture: int):
    facture = get_object_or_404(Facture.objects.prefetch_related("details"), id=id_facture)
    details = facture.details.all()
    return [DetailFactureOut.from_orm(detail) for detail in details]

@router.post("/facture/")
@transaction.atomic
def creer_facture(request, payload: FactureIn):
    donnees = payload.dict()
    donnees_details = donnees.pop("details_facture")

    inscription = None
    cours_prive = None
    eleve = None

    # Charger l'inscription avec l'élève lié
    if donnees.get("id_inscription"):
        inscription = get_object_or_404(
            Inscription.objects.select_related("eleve"),  # Précharger la relation eleve
            id=donnees.pop("id_inscription")
        )
        eleve = inscription.eleve

    # Charger le cours privé avec les élèves liés
    elif donnees.get("id_cours_prive"):
        cours_prive = get_object_or_404(
            CoursPrive.objects.prefetch_related("eleves"),  # Précharger la relation eleves
            id=donnees.pop("id_cours_prive")
        )
        # Associer le premier élève du cours privé
        if not cours_prive.eleves.exists():
            raise ValidationError("Le cours privé doit avoir au moins un élève associé.")
        eleve = cours_prive.eleves.first()

    else:
        return {"message": "La facture doit être liée soit à une inscription, soit à un cours privé."}

    # Créer la facture
    facture = Facture.objects.create(
        inscription=inscription,
        cours_prive=cours_prive,
        eleve=eleve,
        date_emission=donnees["date_emission"]
    )

    # Créer les détails de la facture
    details_facture = [
        DetailFacture(facture=facture, **detail) for detail in donnees_details
    ]
    DetailFacture.objects.bulk_create(details_facture)

    return {"id": facture.id}

    
@router.delete("/facture/{facture_id}/")
@transaction.atomic
def supprimer_facture(request, facture_id: int):
    facture = get_object_or_404(Facture, id=facture_id)
    facture.delete()

# ------------------- PAIEMENTS -------------------

@router.post("/paiements/")
@transaction.atomic
def create_paiement(request, data: PaiementIn):
    try:
        facture = get_object_or_404(Facture, id=data.id_facture)
        paiement = Paiement.objects.create(
            montant=data.montant,
            mode_paiement=data.mode_paiement,
            methode_paiement=data.methode_paiement,
            facture=facture
        )
        return {"id": paiement.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.get("/paiements/{paiement_id}/")
def get_paiement(request, paiement_id: int):
    paiement = get_object_or_404(Paiement.objects.select_related("facture"), id=paiement_id)
    return PaiementOut.from_orm(paiement)

@router.delete("/paiements/{paiement_id}/")
@transaction.atomic
def delete_paiement(request, paiement_id: int):
    paiement = get_object_or_404(Paiement, id=paiement_id)
    facture = paiement.facture
    paiement.delete()



@router.put("/paiements/{paiement_id}/")
@transaction.atomic
def update_paiement(request, paiement_id: int, data: PaiementIn):
    try:
        paiement = get_object_or_404(Paiement, id=paiement_id)
        for attr, value in data.dict().items():
            setattr(paiement, attr, value)
        paiement.full_clean()
        paiement.save()
        return {"id": paiement.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.get("/factures/{facture_id}/paiements/")
def get_paiements_facture(request, facture_id: int):
    paiements = Paiement.objects.filter(facture_id=facture_id)
    if not paiements.exists():
        return {"message": "Aucun paiement trouvé pour cette facture"}
    return [PaiementOut.from_orm(p) for p in paiements]


@router.get("/factures/{facture_id}/paiements/total/")
def get_total_paiements_facture(request, facture_id: int):
    paiements = Paiement.objects.filter(facture_id=facture_id)
    if not paiements.exists():
        return {"message": "Aucun paiement trouvé pour cette facture"}
    total = paiements.aggregate(total_amount=models.Sum('montant'))['total_amount'] or 0
    return total

@router.get("/paiements/eleve/{eleve_id}/")
def get_paiements_eleve(request, eleve_id: int):
    paiements = Paiement.objects.filter(
        models.Q(facture__inscription__eleve_id=eleve_id) |
        models.Q(facture__eleve_id=eleve_id)
    ).distinct()
    return [PaiementOut.from_orm(p) for p in paiements]


@router.get("/eleves/{id_eleve}/factures/impayees/")
def get_factures_impayees_eleve(request, id_eleve: int):
    factures = (
        Facture.objects.filter(eleve_id=id_eleve)
        .annotate(
            montant_total_annote=Coalesce(Sum("details__montant"), Value(0), output_field=DecimalField()),  # Calculer le montant total
            total_paye=Coalesce(Sum("paiements__montant"), Value(0), output_field=DecimalField()),  # Calculer le total payé
        )
        .filter(total_paye__lt=F("montant_total_annote"))  # Comparer total payé et montant total
    )
    return [
        FacturesOut(
            id=facture.id,
            date_emission=facture.date_emission,
            montant_total=facture.montant_total_annote,
            montant_restant=facture.montant_total_annote - facture.total_paye,
        )
        for facture in factures
    ]