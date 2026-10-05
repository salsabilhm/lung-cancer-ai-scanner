from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager: email is the login identifier (USERNAME_FIELD)."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The email field must be set.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model — email-based authentication."""

    class Role(models.TextChoices):
        PATIENT = "PATIENT", "Patient"
        STAFF = "STAFF", "Staff"
        ADMIN = "ADMIN", "Admin"

    # Identity / auth
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    is_staff = models.BooleanField(default=False)

    # Profile
    phone = models.CharField(max_length=30, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    about_me = models.TextField(null=True, blank=True)
    avatar = models.FileField(upload_to="avatars/", null=True, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PATIENT)

    # Settings (Security / Notifications / Privacy)
    two_factor_enabled = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    public_profile = models.BooleanField(default=True)
    data_sharing = models.BooleanField(default=False)
    personalization = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    def __str__(self):
        return self.email
