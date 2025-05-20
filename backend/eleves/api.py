from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.db import models
from ninja import Router
from .models import Eleve, Pays, Garant, Test, Document
from cours.models import Cours, CoursPrive, Session
from factures.models import Facture
from django.db.models import F, Count, ExpressionWrapper, IntegerField
from .schemas import (
    Anniversaire,
    GarantIn,
    GarantOut,
    PaysOut,
    TestIn,
    TestOut,
    DocumentOut,
    EleveIn,
    EleveOut,
    ElevesOut,
)
from django.db.models.functions import Lower
from django.db.models import Q, Sum
from django.core.paginator import Paginator
from ninja import File, Form
from ninja.files import UploadedFile  # ⬅️ celui-ci est bon
from django.utils import timezone
from datetime import timedelta

router = Router()

# ------------------- ÉLÈVES -------------------


@router.get("/eleves/")
def eleves(
    request,
    page: int = 1,
    taille: int = 10,
    recherche: str | None = None,
    date_naissance: str | None = None,
):
    qs = Eleve.objects.select_related("pays").annotate(
        lower_nom=Lower("nom"),
        lower_prenom=Lower("prenom"),
        pays__nom=models.F("pays__nom"),
    )
    if recherche:
        qs = qs.filter(Q(nom__icontains=recherche) | Q(prenom__icontains=recherche))
    if date_naissance:
        qs = qs.filter(date_naissance=date_naissance)

    qs = qs.order_by("lower_nom", "lower_prenom")
    paginator = Paginator(qs, taille)
    return {
        "eleves": [
            ElevesOut.from_orm(eleve) for eleve in paginator.get_page(page).object_list
        ],
        "nombre_total": paginator.count,
    }


@router.get("/eleves/actifs/")
def eleves_actifs(
    request,
    page: int = 1,
    taille: int = 10,
    recherche: str | None = None,
    date_naissance: str | None = None,
):
    qs = (
        Eleve.objects.select_related("pays")
        .filter(inscriptions__statut="A")
        .annotate(
            lower_nom=Lower("nom"),
            lower_prenom=Lower("prenom"),
            pays__nom=models.F("pays__nom"),
        )
    )
    if recherche:
        qs = qs.filter(Q(nom__icontains=recherche) | Q(prenom__icontains=recherche))
    if date_naissance:
        qs = qs.filter(date_naissance=date_naissance)
    qs.order_by("lower_nom", "lower_prenom")
    paginator = Paginator(qs, taille)
    return {
        "eleves": [
            ElevesOut.from_orm(eleve) for eleve in paginator.get_page(page).object_list
        ],
        "nombre_total": paginator.count,
    }


@router.get("/eleves/inactifs/")
def eleves_inactifs(
    request,
    page: int = 1,
    taille: int = 10,
    recherche: str | None = None,
    date_naissance: str | None = None,
):
    qs = (
        Eleve.objects.select_related("pays")
        .exclude(inscriptions__statut="A")
        .annotate(
            lower_nom=Lower("nom"),
            lower_prenom=Lower("prenom"),
            pays__nom=models.F("pays__nom"),
        )
        .filter(inscriptions__isnull=False)
    )
    if recherche:
        qs = qs.filter(Q(nom__icontains=recherche) | Q(prenom__icontains=recherche))
    if date_naissance:
        qs = qs.filter(date_naissance=date_naissance)
    qs.order_by("lower_nom", "lower_prenom")
    paginator = Paginator(qs, taille)
    return {
        "eleves": [
            ElevesOut.from_orm(eleve) for eleve in paginator.get_page(page).object_list
        ],
        "nombre_total": paginator.count,
    }


@router.get("/eleve/{id_eleve}/")
def rechercher_eleve(request, id_eleve: int):
    try:
        eleve = (
            Eleve.objects.select_related("pays")
            .annotate(pays__nom=models.F("pays__nom"))
            .get(id=id_eleve)
        )
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
    test = get_object_or_404(
        Test.objects.select_related("eleve"), id=test_id, eleve_id=eleve_id
    )
    test.delete()


# ------------------- DOCUMENTS -------------------
@router.get("/eleves/{eleve_id}/documents/", response=list[DocumentOut])
def get_documents_eleve(request, eleve_id: int):
    eleve = get_object_or_404(Eleve.objects.prefetch_related("documents"), id=eleve_id)
    documents = eleve.documents.all()
    return [DocumentOut.from_model(doc, request) for doc in documents]


@router.post("/eleves/{eleve_id}/documents/")
def creer_document_eleve(
    request, eleve_id: int, nom: str = Form(...), fichier: UploadedFile = File(...)
):
    eleve = get_object_or_404(Eleve, id=eleve_id)
    document = Document(eleve=eleve, nom=nom)
    document.fichier.save(fichier.name, fichier)
    document.full_clean()
    document.save()
    return DocumentOut.from_model(document, request)


@router.delete("/eleves/{eleve_id}/documents/{document_id}/")
def supprimer_document_eleve(request, eleve_id: int, document_id: int):
    document = get_object_or_404(
        Document.objects.select_related("eleve"), id=document_id, eleve_id=eleve_id
    )

    if document.fichier and document.fichier.storage.exists(document.fichier.name):
        document.fichier.delete(save=False)

    document.delete()
    return {"success": True}


# ------------------- PAYS -------------------
@router.get("/pays/")
def pays(request):
    pays_list = Pays.objects.all().order_by("nom")
    return [PaysOut.from_orm(p) for p in pays_list]


# ------------------- STATISTIQUES -------------------


@router.get("/statistiques/dashboard/")
def statistiques_dashboard(request):
    today = timezone.now().date()
    first_day_month = today.replace(day=1)

    # Statistiques des factures
    factures_impayees = (
        Facture.objects.annotate(
            montant_total=Sum("details__montant"),
            total_paye=Sum("paiements__montant"),
        )
        .filter(total_paye__lt=F("montant_total"))
        .count()
    )

    # Montant total des paiements effectués ce mois
    montant_total_paiements_mois = (
        Facture.objects.filter(paiements__date_paiement__gte=first_day_month).aggregate(
            total=Sum("paiements__montant")
        )["total"]
        or 0
    )

    # Montant total des factures impayées de ce mois
    factures_impayees_mois = (
        Facture.objects.annotate(
            montant_total=Sum("details__montant"),
            total_paye=Sum("paiements__montant"),
        )
        .filter(total_paye__lt=F("montant_total"), date_emission__gte=first_day_month)
        .aggregate(
            total=Sum(
                ExpressionWrapper(
                    F("montant_total") - F("total_paye"), output_field=IntegerField()
                )
            )
        )["total"]
        or 0
    )

    # Statistiques des cours
    total_cours = Cours.objects.count()
    sessions_actives = Session.objects.filter(statut="O").count()
    # Cours privés programmés ce mois
    cours_prives_programmes = CoursPrive.objects.filter(
        date_cours_prive__gte=first_day_month
    ).count()
    sessions_ouvertes = (
        Session.objects.filter(statut="O")
        .annotate(
            eleves_restants=ExpressionWrapper(
                F("capacite_max")
                - Count("inscriptions", filter=Q(inscriptions__statut="A")),
                output_field=IntegerField(),
            )
        )
        .values("date_debut", "eleves_restants")
        .order_by("date_debut")
    )

    # Nombre d'enseignants
    from cours.models import Enseignant

    nombre_enseignants = Enseignant.objects.count()

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

    # Pays avec le plus d'élèves
    pays_max = (
        Eleve.objects.values("pays__nom")
        .annotate(total=Count("id"))
        .order_by("-total")
        .first()
    )
    pays_plus_eleves = pays_max["pays__nom"] if pays_max else None

    # Élèves actifs avec taux de présence < 80%
    # Pour chaque élève actif, calculer le taux de présence sur toutes ses présences
    eleves_actifs_qs = Eleve.objects.filter(inscriptions__statut="A").distinct()
    eleves_presence_inferieur_80 = []
    for eleve in eleves_actifs_qs:
        total_presences = eleve.presences.count()
        total_present = eleve.presences.filter(statut="P").count()
        taux = (total_present / total_presences) * 100 if total_presences > 0 else 0
        if taux < 80:
            eleves_presence_inferieur_80.append(
                {
                    "nom": eleve.nom,
                    "prenom": eleve.prenom,
                    "date_naissance": eleve.date_naissance,
                    "taux_presence": round(taux, 2),
                }
            )

    # Élèves en préinscription depuis plus de 3 jours
    trois_jours_avant = today - timedelta(days=3)
    eleves_preinscription = (
        Eleve.objects.filter(
            inscriptions__preinscription=True,
            inscriptions__date_inscription__lte=trois_jours_avant,
        )
        .distinct()
        .values("nom", "prenom", "date_naissance")
    )

    return {
        "factures": {
            "nombre_factures_impayees": factures_impayees,
            "montant_total_paiements_mois": float(montant_total_paiements_mois),
            "montant_total_factures_impayees_mois": float(factures_impayees_mois),
        },
        "cours": {
            "total_cours": total_cours,
            "sessions_actives": sessions_actives,
            "cours_prives_programmes_mois": cours_prives_programmes,
            "sessions_ouvertes": list(sessions_ouvertes),
            "nombre_enseignants": nombre_enseignants,
        },
        "eleves": {
            "total_eleves": total_eleves,
            "eleves_actifs": eleves_actifs,
            "repartition_niveaux": list(repartition_niveaux),
            "pays_plus_eleves": pays_plus_eleves,
            "eleves_presence_inferieur_80": eleves_presence_inferieur_80,
            "eleves_preinscription_plus_3j": list(eleves_preinscription),
        },
    }


@router.get("/anniversaires/", response=list[Anniversaire])
def anniversaires_mois(request):
    aujourdhui = timezone.now().date()
    mois_actuel = aujourdhui.month

    qs = Eleve.objects.filter(date_naissance__month=mois_actuel).order_by(
        "date_naissance__day"
    )

    resultat = []

    for eleve in qs:
        date_naissance = eleve.date_naissance

        age = (
            aujourdhui.year
            - date_naissance.year
            - (
                (aujourdhui.month, aujourdhui.day)
                < (date_naissance.month, date_naissance.day)
            )
        )

        resultat.append(
            Anniversaire(
                id=eleve.id,
                nom=eleve.nom,
                prenom=eleve.prenom,
                date_naissance=date_naissance,
                age=age,
            )
        )

    return resultat
