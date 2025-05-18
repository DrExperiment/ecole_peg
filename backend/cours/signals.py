from django.db.models.signals import post_save, pre_save, post_delete
from django.utils import timezone
from django.dispatch import receiver
from .models import CoursPrive, Inscription, Session, StatutInscriptionChoices, StatutSessionChoices

@receiver([post_save, post_delete], sender=Inscription)
@receiver(post_save, sender=Session)
def gerer_statut_session(sender, instance, **kwargs):
    session = instance.session if isinstance(instance, Inscription) else instance

    today = timezone.now().date()
    capacite_pleine = session.inscriptions.count() >= session.capacite_max
    session_commencee = session.date_debut <= today

    if capacite_pleine or session_commencee:
        nouveau_statut = StatutSessionChoices.FERMÉE
    else:
        nouveau_statut = StatutSessionChoices.OUVERTE

    if session.statut != nouveau_statut:
        session.statut = nouveau_statut
        session.save(update_fields=['statut'])



@receiver(post_save, sender=Session)
def fermer_inscriptions_expirees(sender, instance, **kwargs):
    """Désactive automatiquement les inscriptions aux sessions terminées"""
    if instance.date_fin < timezone.now().date():
        instance.inscriptions.filter(statut=StatutInscriptionChoices.ACTIF).update(
            statut=StatutInscriptionChoices.INACTIF
        )