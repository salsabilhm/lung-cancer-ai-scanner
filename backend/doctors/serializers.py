from rest_framework import serializers
from doctors.models import Doctor, Specialty

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ('id', 'full_name', 'email', 'phone', 'bio', 'specialty', 'is_active', 'created_at')

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ('id', 'name', 'description')
