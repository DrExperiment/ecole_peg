from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Session, Inscription, StatutInscriptionChoices, StatutSessionChoices

@receiver(post_save, sender=Inscription)
def gerer_inscription_et_session(sender, instance, created, **kwargs):

    session = instance.session
    aujourd_hui = timezone.now().date()

    # 🔹 Si élève sorti → inscription devient INACTIF
    if instance.date_sortie:
        Inscription.objects.filter(id=instance.id).update(
            statut=StatutInscriptionChoices.INACTIF
        )

    # 🔹 Session terminée
    if session.date_fin < aujourd_hui:
        session.inscriptions.filter(statut=StatutInscriptionChoices.ACTIF).update(
            statut=StatutInscriptionChoices.INACTIF
        )
        session.statut = StatutSessionChoices.FERMÉE
        session.save(update_fields=["statut"])
        return

    # 🔹 recalcul
    nb_actifs = session.inscriptions.filter(
        statut=StatutInscriptionChoices.ACTIF
    ).count()

    if nb_actifs < session.capacite_max:
        if session.statut != StatutSessionChoices.OUVERTE:
            session.statut = StatutSessionChoices.OUVERTE
            session.save(update_fields=["statut"])
    else:
        if session.statut != StatutSessionChoices.FERMÉE:
            session.statut = StatutSessionChoices.FERMÉE
            session.save(update_fields=["statut"])