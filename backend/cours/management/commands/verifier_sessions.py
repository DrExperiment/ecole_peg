from django.core.management.base import BaseCommand
from django.utils import timezone
from cours.models import Session, StatutSessionChoices, StatutInscriptionChoices


class Command(BaseCommand):
    help = "Vérifie et met à jour le statut des sessions"

    def handle(self, *args, **kwargs):

        aujourd_hui = timezone.now().date()

        sessions = Session.objects.all()

        for session in sessions:

            if session.date_fin < aujourd_hui:
                session.inscriptions.filter(
                    statut=StatutInscriptionChoices.ACTIF
                ).update(statut=StatutInscriptionChoices.INACTIF)

                session.statut = StatutSessionChoices.FERMÉE
                session.save(update_fields=["statut"])
                continue

            nb_actifs = session.inscriptions.filter(
                statut=StatutInscriptionChoices.ACTIF
            ).count()

            if nb_actifs < session.capacite_max:
                session.statut = StatutSessionChoices.OUVERTE
            else:
                session.statut = StatutSessionChoices.FERMÉE

            session.save(update_fields=["statut"])

        self.stdout.write(self.style.SUCCESS("Vérification terminée"))