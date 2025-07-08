from django.db import models
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator,
    RegexValidator,
    MinLengthValidator,
)
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils import timezone
from .validators import file_size_validator


class SexeChoices(models.TextChoices):
    FEMME = "F", "Femme"
    HOMME = "H", "Homme"


class TypePermisChoices(models.TextChoices):
    PERMIS_ETUDIANT = "E", "Permis Étudiant"
    PERMIS_B = "B", "Permis B"
    PERMIS_S = "S", "Permis S"
    PAS_DE_PERMIS = "P", "Pas de Permis"


class NiveauChoices(models.TextChoices):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"


class Pays(models.Model):
    indicatif = models.CharField(max_length=5)
    nom = models.CharField(max_length=100, unique=True)


class Personne(models.Model):
    nom = models.CharField(max_length=100, validators=[MinLengthValidator(2)])
    prenom = models.CharField(max_length=100, validators=[MinLengthValidator(2)])
    rue = models.CharField(max_length=200, blank=True, null=True)
    numero = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                r"^\d+$", message="Le numéro doit contenir uniquement des chiffres."
            )
        ],
    )
    npa = models.CharField(
        max_length=4,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                r"^\d{4}$", message="Le NPA doit contenir exactement 4 chiffres."
            )
        ],
    )
    localite = models.CharField(max_length=100, blank=True, null=True)
    telephone = models.CharField(
        max_length=255,  
        validators=[
            RegexValidator(
    r"^[\d\s\-\+\(\)\.]{7,}$",
    message="Numéro de téléphone invalide."
)

        ],
    )
    email = models.EmailField(unique=True)

    class Meta:
        abstract = True  # Indique que cette classe est abstraite et ne sera pas créée en tant que table dans la base de données.

    def clean(self):
        super().clean()
        # Validation pour les champs d'adresse
        if any([self.rue, self.numero, self.npa, self.localite]) and not all(
            [self.rue, self.numero, self.npa, self.localite]
        ):
            raise ValidationError(
                "Tous les champs d'adresse doivent être remplis ou laissés vides."
            )


class Garant(Personne):
    class Meta:
        ordering = ["nom", "prenom"]
        constraints = [
            models.UniqueConstraint(
                fields=["nom", "prenom", "telephone", "email"], name="unique_garant"
            )
        ]


class Eleve(Personne):
    date_naissance = models.DateField()
    lieu_naissance = models.CharField(max_length=100)
    sexe = models.CharField(max_length=1, choices=SexeChoices.choices)
    adresse_facturation = models.CharField(max_length=200, blank=True, null=True)
    type_permis = models.CharField(max_length=1, choices=TypePermisChoices.choices)
    date_permis = models.DateField(blank=True, null=True)
    niveau = models.CharField(
        blank=True, null=True, max_length=2, choices=NiveauChoices.choices
    )
    langue_maternelle = models.CharField(max_length=100, blank=True, null=True)
    autres_langues = models.CharField(max_length=200, blank=True, null=True)
    src_decouverte = models.CharField(max_length=200, blank=True, null=True)
    commentaires = models.TextField(blank=True, null=True)
    pays = models.ForeignKey(Pays, on_delete=models.CASCADE, related_name="eleves")
    garant = models.ForeignKey(
        Garant, on_delete=models.SET_NULL, null=True, blank=True, related_name="eleves"
    )

    def clean(self):
        super().clean()
        if self.date_naissance > timezone.now().date():
            raise ValidationError(
                "La date de naissance ne peut pas être dans le futur."
            )

        if self.date_permis and self.date_permis < timezone.now().date():
            raise ValidationError("La date du permis ne peut pas être dans le passé.")

        if self.type_permis != TypePermisChoices.PAS_DE_PERMIS and not self.date_permis:
            raise ValidationError("Date de permis requise pour ce type de permis.")

    class Meta:
        indexes = [
            models.Index(fields=["nom"]),
            models.Index(fields=["prenom"]),
            models.Index(fields=["date_naissance"]),
        ]


class Test(models.Model):
    date_test = models.DateField()
    niveau = models.CharField(max_length=2, choices=NiveauChoices.choices)
    note = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(20)],
    )
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name="tests")

    def clean(self):
        super().clean()
        if self.date_test > timezone.now().date():
            raise ValidationError("La date du test ne peut pas être dans le futur")

    class Meta:
        ordering = ["-date_test"]


class Document(models.Model):
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    nom = models.CharField(max_length=100)
    fichier = models.FileField(
        upload_to="eleves/documents/",
        validators=[
            FileExtensionValidator(allowed_extensions=["pdf", "jpg", "jpeg", "png"]),
            file_size_validator,
        ],
    )
    date_ajout = models.DateField(auto_now_add=True)
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name="documents")

    class Meta:
        ordering = ["-date_ajout"]
