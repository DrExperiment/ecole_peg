from django.db import transaction
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Inscription, Session, StatutInscriptionChoices, StatutSessionChoices

# 1) À chaque création ou suppression d'inscription → re-évalue le statut de la session
@receiver([post_save, post_delete], sender=Inscription)
def maj_statut_session_apres_inscription(sender, instance, **kwargs):
    def _update_session_status():
        session = Session.objects.select_for_update().get(pk=instance.session_id)
        today = timezone.now().date()

        pleine = session.inscriptions.count() >= session.capacite_max
        commencee = session.date_debut <= today

        if not pleine and not commencee:
            nouveau = StatutSessionChoices.OUVERTE
        else:
            nouveau = StatutSessionChoices.FERMÉE

        if session.statut != nouveau:
            session.statut = nouveau
            session.save(update_fields=['statut'])

    transaction.on_commit(_update_session_status)


# 2) À chaque création ou modification de Session → idem, pour prendre en compte
#    un changement de date_debut ou capacite_max
@receiver(post_save, sender=Session)
def maj_statut_session_apres_modif(sender, instance, **kwargs):
    def _update_session_status():
        session = Session.objects.select_for_update().get(pk=instance.pk)
        today = timezone.now().date()

        pleine = session.inscriptions.count() >= session.capacite_max
        commencee = session.date_debut <= today
        nouveau = (
            StatutSessionChoices.FERMÉE
            if pleine or commencee
            else StatutSessionChoices.OUVERTE
        )

        if session.statut != nouveau:
            session.statut = nouveau
            session.save(update_fields=['statut'])

    transaction.on_commit(_update_session_status)


# 3) À chaque sauvegarde de Session → on ferme automatiquement
#    les inscriptions dont la date_fin est passée
@receiver(post_save, sender=Session)
def fermer_inscriptions_expirees(sender, instance, **kwargs):
    def _close_inscriptions():
        if instance.date_fin < timezone.now().date():
            instance.inscriptions.filter(
                statut=StatutInscriptionChoices.ACTIF
            ).update(statut=StatutInscriptionChoices.INACTIF)

    transaction.on_commit(_close_inscriptions)
