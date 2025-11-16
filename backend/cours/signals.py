from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Session, Inscription, StatutInscriptionChoices, StatutSessionChoices


@receiver(post_save, sender=Inscription)
def gerer_inscription_et_session(sender, instance, **kwargs):
    """
    Met à jour automatiquement le statut d'une inscription et celui de la session :
    - Si l'élève sort (date_sortie + motif_sortie) → inscription inactive
    - Si la session est terminée → tout devient inactif, session fermée
    - Si une place est libre → session rouverte
    - Si session pleine → session fermée
    """
    session = instance.session
    aujourd_hui = timezone.now().date()

    # 🟠 1. Si l’élève est sorti : on désactive seulement
    if instance.date_sortie:
        if instance.statut != StatutInscriptionChoices.INACTIF:
            instance.statut = StatutInscriptionChoices.INACTIF
            instance.save(update_fields=["statut"])

    # 🟢 2. Si la session est finie : on ferme tout
    if session.date_fin < aujourd_hui:
        session.inscriptions.filter(statut=StatutInscriptionChoices.ACTIF).update(
            statut=StatutInscriptionChoices.INACTIF
        )
        if session.statut != StatutSessionChoices.FERMÉE:
            session.statut = StatutSessionChoices.FERMÉE
            session.save(update_fields=["statut"])
        return

    # 🔵 3. Recompter les inscriptions actives et ajuster le statut de la session
    nb_actifs = session.inscriptions.filter(statut=StatutInscriptionChoices.ACTIF).count()

    if nb_actifs < session.capacite_max:
        if session.statut != StatutSessionChoices.OUVERTE:
            session.statut = StatutSessionChoices.OUVERTE
            session.save(update_fields=["statut"])
    else:
        if session.statut != StatutSessionChoices.FERMÉE:
            session.statut = StatutSessionChoices.FERMÉE
            session.save(update_fields=["statut"])


@receiver(post_delete, sender=Inscription)
def gerer_suppression_inscription(sender, instance, **kwargs):
    """Rouvre la session si une inscription est supprimée (place libérée)."""
    session = instance.session
    nb_actifs = session.inscriptions.filter(statut=StatutInscriptionChoices.ACTIF).count()
    if nb_actifs < session.capacite_max:
        if session.statut != StatutSessionChoices.OUVERTE:
            session.statut = StatutSessionChoices.OUVERTE
            session.save(update_fields=["statut"])
