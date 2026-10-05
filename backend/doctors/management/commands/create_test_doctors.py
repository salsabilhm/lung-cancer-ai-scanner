from django.core.management.base import BaseCommand
from django.db import models
from doctors.models import Doctor, Specialty

class Command(BaseCommand):
    help = 'Create 6 test doctors with specified specialties'

    def handle(self, *args, **options):
        # Create specialties if they don't exist
        pulmonologist, _ = Specialty.objects.get_or_create(name='Pulmonologist')
        medical_oncologist, _ = Specialty.objects.get_or_create(name='Medical Oncologist')
        radiation_oncologist, _ = Specialty.objects.get_or_create(name='Radiation Oncologist')
        thoracic_surgeon, _ = Specialty.objects.get_or_create(name='Thoracic Surgeon')

        # Doctor data with specialty references
        doctors_data = [
            ('Dr. Ahmed Kaci', pulmonologist),
            ('Dr. Sarah Benali', medical_oncologist),
            ('Dr. Nabil Meziane', radiation_oncologist),
            ('Dr. Lina Haddad', thoracic_surgeon),
            ('Dr. Yacine Toumi', pulmonologist),
            ('Dr. Rym Belkacem', medical_oncologist)
        ]

        # Create doctors if they don't exist
        for name, specialty in doctors_data:
            Doctor.objects.get_or_create(full_name=name, defaults={
                'specialty': specialty,
                'email': name.lower().replace(' ', '.') + '@test.com',
                'phone': '+213 550 00 00 00',
                'bio': name + ' specialist',
                'is_active': True
            })

        print('Created 6 doctors with IDs:')
        for d in Doctor.objects.filter(full_name__startswith='Dr.')[:6]:
            print(f'  ID={d.id}, Name={d.full_name}, Specialty={d.specialty.name}')
