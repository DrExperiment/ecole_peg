from django.db.models.signals import post_save
from django.utils import timezone
from django.dispatch import receiver
from .models import Session, StatutInscriptionChoices , StatutSessionChoices

@receiver(post_save, sender=Session)
def gerer_statut_session_apres_modification(sender, instance, **kwargs):
    """Ferme ou rouvre la session selon la date de fin."""
    aujourd_hui = timezone.now().date()
    if instance.date_fin < aujourd_hui and instance.statut != StatutSessionChoices.FERMÉE:
        instance.statut = StatutSessionChoices.FERMÉE
        instance.save(update_fields=["statut"])
    elif instance.date_fin >= aujourd_hui and instance.statut == StatutSessionChoices.FERMÉE:
        instance.statut = StatutSessionChoices.OUVERTE
        instance.save(update_fields=["statut"])
        
@receiver(post_save, sender=Session)
def fermer_inscriptions_expirees(sender, instance, **kwargs):
    """Désactive automatiquement les inscriptions aux sessions terminées"""
    if instance.date_fin < timezone.now().date():
        instance.inscriptions.filter(statut=StatutInscriptionChoices.ACTIF).update(
            statut=StatutInscriptionChoices.INACTIF
        )
