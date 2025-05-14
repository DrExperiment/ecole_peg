from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import DetailFacture, Paiement

@receiver([post_save, post_delete], sender=DetailFacture)
def reset_facture_cache_on_detail_change(sender, instance, **kwargs):
    instance.facture.reset_cache()

@receiver([post_save, post_delete], sender=Paiement)
def reset_facture_cache_on_paiement_change(sender, instance, **kwargs):
    instance.facture.reset_cache()