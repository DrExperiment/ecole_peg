from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.db import models
from ninja import Router
from .models import Cours, Enseignant, Session,CoursPrive, Eleve, Inscription
from django.db.models import Q
from .schemas import (
    CoursIn, CoursOut, EnseignantIn, EnseignantOut,
    SessionIn, SessionOut,CoursPriveIn, CoursPriveOut, InscriptionIn, InscriptionOut, InscriptionUpdateIn
)

router = Router()

# ------------------- COURS -------------------

@router.get("/cours/")
def get_cours(request):
    cours = Cours.objects.all()
    return [CoursOut.from_orm(c) for c in cours]


@router.get("/cours/{cours_id}/")
def get_cours_specifique(request, cours_id: int):
    cours = get_object_or_404(Cours, id=cours_id)
    return CoursOut.from_orm(cours)


@router.post("/cour/")
def create_cours(request, cours: CoursIn):
    try:
        cours_obj = Cours(**cours.dict())
        cours_obj.full_clean()
        cours_obj.save()
        return {"id": cours_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.put("/cours/{cours_id}/")
def update_cours(request, cours_id: int, cours: CoursIn):
    try:
        cours_obj = get_object_or_404(Cours, id=cours_id)
        for attr, value in cours.dict().items():
            setattr(cours_obj, attr, value)
        cours_obj.full_clean()
        cours_obj.save()
        return {"id": cours_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.delete("/cours/{cours_id}/")
def delete_cours(request, cours_id: int):
    cours = get_object_or_404(Cours, id=cours_id)
    cours.delete()

# ------------------- ENSEIGNANT -------------------

@router.get("/enseignants/")
def list_enseignants(request, search: str | None = None):
    enseignants = Enseignant.objects.all()
    if search:
        enseignants = enseignants.filter(
            Q(nom__icontains=search) | Q(prenom__icontains=search)
        )
    return [EnseignantOut.from_orm(e) for e in enseignants]


@router.post("/enseignant/")
def create_enseignant(request, enseignant: EnseignantIn):
    try:
        enseignant_obj = Enseignant(**enseignant.dict())
        enseignant_obj.full_clean()
        enseignant_obj.save()
        return {"id": enseignant_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.put("/enseignants/{enseignant_id}/")
def update_enseignant(request, enseignant_id: int, enseignant: EnseignantIn):
    try:
        enseignant_obj = get_object_or_404(Enseignant, id=enseignant_id)
        for attr, value in enseignant.dict().items():
            setattr(enseignant_obj, attr, value)
        enseignant_obj.full_clean()
        enseignant_obj.save()
        return {"id": enseignant_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.delete("/enseignants/{enseignant_id}/")
def delete_enseignant(request, enseignant_id: int):
    enseignant = get_object_or_404(Enseignant, id=enseignant_id)
    enseignant.delete()

# ------------------- SESSION -------------------

@router.get("/sessions/")
def sessions(request):
    sessions = (
        Session.objects.select_related("cours", "enseignant")
        .annotate(
            cours__nom=models.F("cours__nom"),
            cours__type=models.F("cours__type"),
            cours__niveau=models.F("cours__niveau"),
        )
    )
    return [SessionOut.from_orm(s) for s in sessions]


@router.get("/sessions/{id_session}/")
def rechercher_session(request, id_session: int):
    session = get_object_or_404(
        Session.objects.select_related("cours", "enseignant").annotate(
            cours__nom=models.F("cours__nom"),
            cours__type=models.F("cours__type"),
            cours__niveau=models.F("cours__niveau"),
        ),
        id=id_session
    )
    return SessionOut.from_orm(session)

@router.post("/session/")
def create_session(request, session: SessionIn):
    try:
        cours = get_object_or_404(Cours, id=session.id_cours)
        enseignant = get_object_or_404(Enseignant, id=session.id_enseignant) if session.id_enseignant else None

        session_obj = Session.objects.create(
            cours=cours,
            date_debut=session.date_debut,
            date_fin=session.date_fin,
            periode_journee=session.periode_journee,
            capacite_max=session.capacite_max,
            enseignant=enseignant,
        )
        session_obj.full_clean()
        return {"id": session_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.put("/sessions/{id_session}/")
def update_session(request, id_session: int, session: SessionIn):
    try:
        session_obj = get_object_or_404(Session.objects.select_related("cours", "enseignant"), id=id_session)
        session_obj.cours = get_object_or_404(Cours, id=session.id_cours)
        if session.id_enseignant:
            session_obj.enseignant = get_object_or_404(Enseignant, id=session.id_enseignant)
        for attr, value in session.dict(exclude={"id_cours", "id_enseignant"}).items():
            setattr(session_obj, attr, value)
        session_obj.full_clean()
        session_obj.save()
        return {"id": session_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.delete("/sessions/{id_session}/")
def delete_session(request, id_session: int):
    session = get_object_or_404(Session, id=id_session)
    session.delete()

# ------------------- COURS PRIVE -------------------

@router.get("/cours_prive/", response=list[CoursPriveOut])
def list_cours_prive(request):
    cours_prives = (
        CoursPrive.objects.select_related("enseignant")
        .prefetch_related("eleves")
        .annotate(
            enseignant__nom=models.F("enseignant__nom"),
            enseignant__prenom=models.F("enseignant__prenom"),
        )
    )
    return [
        CoursPriveOut(
            id=cours_prive.id,
            date_cours_prive=cours_prive.date_cours_prive,
            heure_debut=cours_prive.heure_debut,
            heure_fin=cours_prive.heure_fin,
            tarif=cours_prive.tarif,
            lieu=cours_prive.lieu,
            enseignant__nom=cours_prive.enseignant.nom,
            enseignant__prenom=cours_prive.enseignant.prenom,
            eleves=[f"{eleve.nom} {eleve.prenom}" for eleve in cours_prive.eleves.all()],
        )
        for cours_prive in cours_prives
    ]


@router.get("/cours_prive/{cours_prive_id}/", response=CoursPriveOut)
def get_cours_prive(request, cours_prive_id: int):
    cours_prive = get_object_or_404(
        CoursPrive.objects.select_related("enseignant").prefetch_related("eleves"),
        id=cours_prive_id
    )

    # Utiliser le schéma CoursPriveOut pour structurer la réponse
    return CoursPriveOut(
        id=cours_prive.id,
        date_cours_prive=cours_prive.date_cours_prive,
        heure_debut=cours_prive.heure_debut,
        heure_fin=cours_prive.heure_fin,
        tarif=cours_prive.tarif,
        lieu=cours_prive.lieu,
        enseignant__nom=cours_prive.enseignant.nom,
        enseignant__prenom=cours_prive.enseignant.prenom,
        eleves=[f"{eleve.nom} {eleve.prenom}" for eleve in cours_prive.eleves.all()],
    )

@router.get("/eleves/{eleve_id}/cours_prives/", response=list[CoursPriveOut])
def get_cours_prives_by_eleve(request, eleve_id: int):
    eleve = get_object_or_404(Eleve, id=eleve_id)
    cours_prives = eleve.cours_prives.select_related("enseignant").all()
    return [
        CoursPriveOut(
            id=cours_prive.id,
            date_cours_prive=cours_prive.date_cours_prive,
            heure_debut=cours_prive.heure_debut,
            heure_fin=cours_prive.heure_fin,
            tarif=cours_prive.tarif,
            lieu=cours_prive.lieu,
            enseignant__nom=cours_prive.enseignant.nom,
            enseignant__prenom=cours_prive.enseignant.prenom,
            eleves=[f"{eleve.nom} {eleve.prenom}" for eleve in cours_prive.eleves.all()],
        )
        for cours_prive in cours_prives
    ]

@router.post("/cours_prive/")
def create_cours_prive(request, cours_prive: CoursPriveIn):
    try:
        eleves = Eleve.objects.filter(id__in=cours_prive.eleves_ids)
        if len(eleves) != len(cours_prive.eleves_ids):
            return {"detail": "IDs d'élèves invalides"}
        enseignant = get_object_or_404(Enseignant, id=cours_prive.enseignant)
        
        cours_prive_obj = CoursPrive.objects.create(
            date_cours_prive=cours_prive.date_cours_prive,
            heure_debut=cours_prive.heure_debut,
            heure_fin=cours_prive.heure_fin,
            tarif=cours_prive.tarif,
            lieu=cours_prive.lieu,
            enseignant=enseignant,
        )
        cours_prive_obj.eleves.set(eleves)
        cours_prive_obj.full_clean()
        return {"id": cours_prive_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.put("/cours_prive/{cours_prive_id}/")
def update_cours_prive(request, cours_prive_id: int, cours_prive: CoursPriveIn):
    try:
        cours_prive_obj = get_object_or_404(CoursPrive, id=cours_prive_id)
        eleves = Eleve.objects.filter(id__in=cours_prive.eleves_ids)
        if len(eleves) != len(cours_prive.eleves_ids):
            return {"detail": "IDs d'élèves invalides"}
        cours_prive_obj.eleves.set(eleves)
        enseignant = get_object_or_404(Enseignant, id=cours_prive.enseignant)
        cours_prive_obj.enseignant = enseignant
        for attr, value in cours_prive.dict(exclude={"eleves_ids", "enseignant"}).items():
            setattr(cours_prive_obj, attr, value)
        cours_prive_obj.full_clean()
        cours_prive_obj.save()
        return {"id": cours_prive_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.delete("/cours_prive/{cours_prive_id}/")
def delete_cours_prive(request, cours_prive_id: int):
    cours_prive = get_object_or_404(CoursPrive, id=cours_prive_id)
    cours_prive.delete()

# ------------------- INSCRIPTIONS -------------------

@router.get("/{eleve_id}/inscriptions/")
def get_inscriptions_by_eleve(request, eleve_id: int):
    inscriptions = Inscription.objects.select_related("session", "eleve").filter(eleve_id=eleve_id)
    return [InscriptionOut.from_orm(i) for i in inscriptions]


@router.post("/{eleve_id}/inscription/")
def create_inscription(request, eleve_id: int, inscription: InscriptionIn):
    try:
        eleve = get_object_or_404(Eleve, id=eleve_id)
        session = get_object_or_404(Session, id=inscription.id_session)

        if session.inscriptions.count() >= session.capacite_max:
            return {"detail": "Session complète"}

        inscription_obj, created = Inscription.objects.get_or_create(
            eleve=eleve,
            session=session,
            defaults=inscription.dict(exclude={"id_session"})
        )

        if not created:
            return {"detail": "Inscription déjà existante"}

        return {"id": inscription_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.put("/{eleve_id}/inscriptions/{inscription_id}/")
def update_inscription(request, eleve_id: int, inscription_id: int, inscription: InscriptionUpdateIn):
    try:
        inscription_obj = get_object_or_404(Inscription.objects.select_related("session", "eleve"), id=inscription_id, eleve_id=eleve_id)

        new_session = get_object_or_404(Session, id=inscription.id_session)
        old_session = inscription_obj.session

        if old_session != new_session:
            if new_session.inscriptions.count() >= new_session.capacite_max:
                return {"detail": "Capacité maximale atteinte pour la nouvelle session"}

            if Inscription.objects.filter(eleve_id=eleve_id, session=new_session).exists():
                return {"detail": "L'élève est déjà inscrit à cette session"}

        for field, value in inscription.dict(exclude={"id_session"}).items():
            setattr(inscription_obj, field, value)
        inscription_obj.session = new_session
        inscription_obj.full_clean()
        inscription_obj.save()
        return {"id": inscription_obj.id}
    except ValidationError as e:
        return {"message": "Erreurs de validation.", "erreurs": e.message_dict}


@router.delete("/{eleve_id}/inscriptions/{inscription_id}/")
def delete_inscription(request, eleve_id: int, inscription_id: int):
    inscription = get_object_or_404(Inscription, id=inscription_id, eleve_id=eleve_id)
    inscription.delete()

@router.get("/eleves/preinscrits")
def get_eleves_preinscrits(request):
    eleves_preinscrits = Eleve.objects.filter(inscriptions__preinscription=True).distinct()
    return [{"id": eleve.id, "nom": eleve.nom, "prenom": eleve.prenom} for eleve in eleves_preinscrits]
