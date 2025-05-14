from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.db import models
from ninja import Router
from .models import Eleve, Pays, Garant, Test, Document
from cours.models import Cours, CoursPrive, Session
from factures.models import Facture
from django.db.models import F, Count, ExpressionWrapper, IntegerField
from .schemas import (
    GarantIn, GarantOut, PaysOut, TestIn, TestOut,
    DocumentIn, DocumentOut, EleveIn, EleveOut , ElevesOut
)
from django.db.models.functions import Lower
from django.db.models import Q, Sum
from django.core.paginator import Paginator

router = Router()

# ------------------- ÉLÈVES -------------------

@router.get("/eleves/")
def eleves(request, page: int = 1, taille: int = 10, recherche: str | None = None, date_naissance: str | None = None):
    qs = (
        Eleve.objects.select_related("pays")
        .annotate(
            lower_nom=Lower("nom"),
            lower_prenom=Lower("prenom"),
            pays__nom=models.F("pays__nom")
        )
    )
    if recherche:
        qs = qs.filter(
            Q(nom__icontains=recherche) | Q(prenom__icontains=recherche)
        )
    if date_naissance:
        qs = qs.filter(date_naissance=date_naissance)

    qs = qs.order_by("lower_nom", "lower_prenom")
    paginator = Paginator(qs, taille)
    return {
        "eleves": [ElevesOut.from_orm(eleve) for eleve in paginator.get_page(page).object_list],
        "nombre_total": paginator.count,
    }


@router.get("/eleves/actifs/")
def eleves_actifs(request, page: int = 1, taille: int = 10, recherche: str | None = None, date_naissance: str | None = None):
    qs = (
        Eleve.objects.select_related("pays")
        .filter(inscriptions__statut="A")
        .annotate(
            lower_nom=Lower("nom"),
            lower_prenom=Lower("prenom"),
            pays__nom=models.F("pays__nom")
        )
    )
    if recherche:
        qs = qs.filter(
            Q(nom__icontains=recherche) | Q(prenom__icontains=recherche)
        )
    if date_naissance:
        qs = qs.filter(date_naissance=date_naissance)
    qs.order_by("lower_nom", "lower_prenom")
    paginator = Paginator(qs, taille)
    return {
        "eleves": [ElevesOut.from_orm(eleve) for eleve in paginator.get_page(page).object_list],
        "nombre_total": paginator.count,
    }


@router.get("/eleves/inactifs/")
def eleves_inactifs(request, page: int = 1, taille: int = 10, recherche: str | None = None, date_naissance: str | None = None):
    qs = (
        Eleve.objects.select_related("pays")
        .exclude(inscriptions__statut="A")
        .annotate(
            lower_nom=Lower("nom"),
            lower_prenom=Lower("prenom"),
            pays__nom=models.F("pays__nom")
        )
        .filter(inscriptions__isnull=False)
    )
    if recherche:
        qs = qs.filter(
            Q(nom__icontains=recherche) | Q(prenom__icontains=recherche)
        )
    if date_naissance:
        qs = qs.filter(date_naissance=date_naissance)
    qs.order_by("lower_nom", "lower_prenom")
    paginator = Paginator(qs, taille)
    return {
        "eleves": [ElevesOut.from_orm(eleve) for eleve in paginator.get_page(page).object_list],
        "nombre_total": paginator.count,
    }


@router.get("/eleve/{id_eleve}/")
def rechercher_eleve(request, id_eleve: int):
    try:
        eleve = Eleve.objects.select_related("pays").annotate(pays__nom=models.F("pays__nom")).get(id=id_eleve)
    except Eleve.DoesNotExist:
        return {"Erreur": "Cet élève n'existe pas"}

    return EleveOut.from_orm(eleve)


@router.post("/eleve/")
def creer_eleve(request, eleve: EleveIn):
    try:
        pays = get_object_or_404(Pays, id=eleve.pays_id)
        eleve_obj = Eleve(pays=pays, **eleve.dict(exclude={"pays_id"}))
        eleve_obj.full_clean()
        eleve_obj.save()
        return {"id": eleve_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.put("/eleves/{eleve_id}/")
def modifier_eleve(request, eleve_id: int, eleve: EleveIn):
    try:
        eleve_obj = get_object_or_404(Eleve.objects.select_related("pays"), id=eleve_id)
        pays = get_object_or_404(Pays, id=eleve.pays_id)
        for field, value in eleve.dict(exclude={"pays_id"}).items():
            setattr(eleve_obj, field, value)
        eleve_obj.pays = pays
        eleve_obj.full_clean()
        eleve_obj.save()
        return {"id": eleve_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.delete("/eleves/{eleve_id}/")
def supprimer_eleve(request, eleve_id: int):
    eleve = get_object_or_404(Eleve, id=eleve_id)
    eleve.delete()


# ------------------- GARANTS -------------------

@router.get("/eleves/{eleve_id}/garant/")
def get_garant_eleve(request, eleve_id: int):
    eleve = get_object_or_404(Eleve.objects.select_related("garant"), id=eleve_id)
    if not eleve.garant:
        return {"message": "Aucun garant trouvé pour cet élève."}
    return GarantOut.from_orm(eleve.garant)


@router.post("/eleves/{eleve_id}/garant/")
def creer_garant_eleve(request, eleve_id: int, garant: GarantIn):
    try:
        eleve = get_object_or_404(Eleve.objects.select_related("garant"), id=eleve_id)
        garant_data = garant.dict()
        garant_obj, _ = Garant.objects.get_or_create(
            nom=garant_data["nom"],
            prenom=garant_data["prenom"],
            telephone=garant_data["telephone"],
            email=garant_data["email"],
            defaults=garant_data,
        )
        eleve.garant = garant_obj
        eleve.save()
        return {"id": garant_obj.id}
    except ValidationError as e:
        return {"message": "Données invalides.", "erreurs": e.message_dict}


@router.delete("/eleves/{eleve_id}/garant/")
def supprimer_garant_eleve(request, eleve_id: int):
    eleve = get_object_or_404(Eleve.objects.select_related("garant"), id=eleve_id)
    if not eleve.garant:
        return {"message": "Aucun garant trouvé pour cet élève."}
    eleve.garant = None
    eleve.save()


# ------------------- TESTS -------------------

@router.get("/eleves/{eleve_id}/tests/")
def get_tests_eleve(request, eleve_id: int):
    eleve = get_object_or_404(Eleve.objects.prefetch_related("tests"), id=eleve_id)
    tests = eleve.tests.all().order_by("-date_test")
    return [TestOut.from_orm(t) for t in tests]


@router.post("/eleves/{eleve_id}/tests/")
def creer_test_eleve(request, eleve_id: int, test: TestIn):
    try:
        eleve = get_object_or_404(Eleve, id=eleve_id)
        test_obj = Test(eleve=eleve, **test.dict())
        test_obj.full_clean()
        test_obj.save()
        return {"id": test_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.delete("/eleves/{eleve_id}/tests/{test_id}/")
def supprimer_test_eleve(request, eleve_id: int, test_id: int):
    test = get_object_or_404(Test.objects.select_related("eleve"), id=test_id, eleve_id=eleve_id)
    test.delete()

# ------------------- DOCUMENTS -------------------

@router.get("/eleves/{eleve_id}/documents/")
def get_documents_eleve(request, eleve_id: int):
    eleve = get_object_or_404(Eleve.objects.prefetch_related("documents"), id=eleve_id)
    documents = eleve.documents.all().order_by("-date_ajout")
    return [DocumentOut.from_orm(d) for d in documents]


@router.post("/eleves/{eleve_id}/documents/")
def creer_document_eleve(request, eleve_id: int, document: DocumentIn):
    try:
        eleve = get_object_or_404(Eleve, id=eleve_id)
        document_obj = Document(eleve=eleve, nom=document.nom)
        document_obj.fichier.save(document.fichier.name, document.fichier)
        document_obj.full_clean()
        document_obj.save()
        return {"id": document_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.delete("/eleves/{eleve_id}/documents/{document_id}/")
def supprimer_document_eleve(request, eleve_id: int, document_id: int):
    document = get_object_or_404(Document.objects.select_related("eleve"), id=document_id, eleve_id=eleve_id)
    document.delete()


# ------------------- PAYS -------------------

@router.get("/pays/")
def pays(request):
    pays_list = Pays.objects.all()
    return [PaysOut.from_orm(p) for p in pays_list]



# ------------------- STATISTIQUES -------------------

@router.get("/statistiques/dashboard/")
def statistiques_dashboard(request):
    # Statistiques des factures
    factures_impayees = (
        Facture.objects.annotate(
            montant_total=Sum("details__montant"),
            total_paye=Sum("paiements__montant"),
        )
        .filter(total_paye__lt=F("montant_total"))
        .count()
    )

    # Statistiques des cours
    total_cours = Cours.objects.count()
    sessions_actives = Session.objects.filter(statut="O").count()
    cours_prives_programmes = CoursPrive.objects.count()
    sessions_ouvertes = (
        Session.objects.filter(statut="O")
        .annotate(
            eleves_restants=ExpressionWrapper(
                F("capacite_max") - Count("inscriptions", filter=Q(inscriptions__statut="A")),
                output_field=IntegerField()
            )
        )
        .values("date_debut", "eleves_restants")
        .order_by("date_debut")
    )

    # Statistiques des élèves
    total_eleves = Eleve.objects.count()
    eleves_actifs = Eleve.objects.filter(inscriptions__statut="A").distinct().count()
    repartition_niveaux = (
        Eleve.objects.filter(inscriptions__statut="A")
        .distinct()
        .values("niveau")
        .annotate(total=Count("id"))
        .order_by("niveau")
    )

    # Retourner toutes les statistiques dans une seule réponse
    return {
        "factures": {
            "nombre_factures_impayees": factures_impayees,
        },
        "cours": {
            "total_cours": total_cours,
            "sessions_actives": sessions_actives,
            "cours_prives_programmes": cours_prives_programmes,
            "sessions_ouvertes": list(sessions_ouvertes),
        },
        "eleves": {
            "total_eleves": total_eleves,
            "eleves_actifs": eleves_actifs,
            "repartition_niveaux": list(repartition_niveaux),
        },
    }
