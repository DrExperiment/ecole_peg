from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from .models import DetailFacture, Paiement, Facture

@receiver([post_save, post_delete], sender=DetailFacture)
def reset_facture_cache_on_detail_change(sender, instance, **kwargs):
    if instance.facture:
        transaction.on_commit(lambda: instance.facture.reset_cache())

@receiver([post_save, post_delete], sender=Paiement)
def reset_facture_cache_on_paiement_change(sender, instance, **kwargs):
    if instance.facture:
        transaction.on_commit(lambda: instance.facture.reset_cache())

@receiver(post_delete, sender=Facture)
def renumeroter_factures_apres_suppression(sender, instance, **kwargs):
    def renumeroter():
        eleve_cible = (
            instance.inscription.eleve if instance.inscription else instance.eleve
        )
        if not eleve_cible:
            return

        qs = Facture.objects.filter(
            models.Q(inscription__eleve=eleve_cible) | 
            models.Q(eleve=eleve_cible)
        ).order_by("date_emission", "pk")

        for idx, facture in enumerate(qs, start=1):
            if facture.numero_facture != idx:
                Facture.objects.filter(pk=facture.pk).update(numero_facture=idx)

    transaction.on_commit(renumeroter)

