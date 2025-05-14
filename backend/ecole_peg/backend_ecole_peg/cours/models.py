from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MinLengthValidator
from django.db.models import Q
from django.utils import timezone
from eleves.models import Eleve, NiveauChoices

# ------------------- Choices -------------------

class PeriodeJourneeChoices(models.TextChoices):
    MATIN = 'M', 'Matin'
    SOIR = 'S', 'Soir'

class TypeCoursChoices(models.TextChoices):
    INTENSIF = "I", "Intensif"
    SEMI_INTENSIF = "S", "Semi-Intensif"

class StatutSessionChoices(models.TextChoices):
    OUVERTE = "O", "Ouverte"
    FERMÉE = "F", "Fermée"

class StatutPresenceChoices(models.TextChoices):
    PRESENT = "P", "Présent"
    ABSENT = "A", "Absent"

class StatutInscriptionChoices(models.TextChoices):
    ACTIF = "A", "Actif"
    INACTIF = "I", "Inactif"

class LieuCoursPriveChoices(models.TextChoices):
    ECOLE = "E", "École"
    DOMICILE = "D", "À domicile"

# ------------------- Modèles -------------------

class Cours(models.Model):
    nom = models.CharField(max_length=100, validators=[MinLengthValidator(2)])
    type = models.CharField(max_length=1, choices=TypeCoursChoices.choices)
    niveau = models.CharField(max_length=2, choices=NiveauChoices.choices)
    heures_par_semaine = models.PositiveIntegerField(blank=True, null=True, validators=[MinValueValidator(1)])
    duree_semaines = models.PositiveIntegerField(blank=True, null=True, validators=[MinValueValidator(1)])
    tarif = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])

    def clean(self):
        super().clean()
        if self.heures_par_semaine and self.duree_semaines:
            max_hours = self.duree_semaines * 40  # Exemple : 40 heures par semaine max
            if self.heures_par_semaine > max_hours:
                raise ValidationError("Les heures par semaine dépassent la limite raisonnable pour la durée du cours.")

    class Meta:
        ordering = ["type", "niveau"]
        indexes = [
            models.Index(fields=['niveau']),
            models.Index(fields=['type']),
        ]

class Enseignant(models.Model):
    nom = models.CharField(max_length=20, validators=[MinLengthValidator(2)])
    prenom = models.CharField(max_length=20, validators=[MinLengthValidator(2)])

    class Meta:
        ordering = ["nom", "prenom"]
        indexes = [
            models.Index(fields=["nom"]),
            models.Index(fields=["prenom"]),
        ]

class Session(models.Model):
    date_debut = models.DateField()
    date_fin = models.DateField()
    periode_journee = models.CharField(max_length=1, choices=PeriodeJourneeChoices.choices)
    capacite_max = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    statut = models.CharField(max_length=1, choices=StatutSessionChoices.choices, default=StatutSessionChoices.OUVERTE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name="sessions")
    enseignant = models.ForeignKey(Enseignant, on_delete=models.SET_NULL, null=True, blank=True, related_name="sessions")

    def clean(self):
        super().clean()
        if self.date_fin <= self.date_debut:
            raise ValidationError("La date de fin doit être postérieure à la date de début.")
        if self.date_debut < timezone.now().date():
            raise ValidationError("La date de début ne peut pas être dans le passé.")

    class Meta:
        ordering = ["date_debut"]
        indexes = [
            models.Index(fields=["statut"]),
        ]

class Inscription(models.Model):
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name="inscriptions")
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="inscriptions")
    date_inscription = models.DateField(auto_now_add=True)
    statut = models.CharField(max_length=1, choices=StatutInscriptionChoices.choices, default=StatutInscriptionChoices.ACTIF)
    preinscription = models.BooleanField(default=False)
    but = models.TextField(blank=True, null=True)
    frais_inscription = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    date_sortie = models.DateField(null=True, blank=True)
    motif_sortie = models.CharField(max_length=100, blank=True, null=True)

    def clean(self):
        super().clean()
        if self.session.statut == StatutSessionChoices.FERMÉE:
            raise ValidationError("Inscription impossible : session fermée.")
        if self.date_sortie and self.date_sortie < self.date_inscription:
            raise ValidationError("La date de sortie doit être postérieure à la date d'inscription.")

    class Meta:
        unique_together = (('eleve', 'session'),)
        ordering = ["date_inscription"]
        indexes = [models.Index(fields=["statut"])]

class Presence(models.Model):
    inscription = models.ForeignKey(Inscription, on_delete=models.CASCADE, related_name="presences")
    date = models.DateField()
    statut = models.CharField(max_length=1, choices=StatutPresenceChoices.choices)

    def clean(self):
        super().clean()
        if not (self.inscription.session.date_debut <= self.date <= self.inscription.session.date_fin):
            raise ValidationError("La date de présence doit être dans la plage de dates de la session.")
        if self.date > timezone.now().date():
            raise ValidationError("Impossible d'enregistrer une présence pour une date future.")

    class Meta:
        unique_together = (('inscription', 'date'),)

class CoursPrive(models.Model):
    date_cours_prive = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    tarif = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    lieu = models.CharField(max_length=1, choices=LieuCoursPriveChoices.choices)
    eleves = models.ManyToManyField(Eleve, related_name="cours_prives")
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE, related_name="cours_prives")

    def clean(self):
        super().clean()
        if self.heure_fin <= self.heure_debut:
            raise ValidationError("L'heure de fin doit être postérieure au début.")

        overlapping = CoursPrive.objects.filter(
            Q(enseignant=self.enseignant),
            Q(date_cours_prive=self.date_cours_prive),
            Q(heure_debut__lt=self.heure_fin, heure_fin__gt=self.heure_debut)
        ).exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError("Conflit horaire avec un autre cours de l'enseignant.")

    class Meta:
        ordering = ["date_cours_prive", "heure_debut"]
        indexes = [
            models.Index(fields=['enseignant', 'date_cours_prive']),
            models.Index(fields=['date_cours_prive']),
            models.Index(fields=['heure_debut', 'heure_fin']),
        ]
