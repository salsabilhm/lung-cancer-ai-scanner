from rest_framework import serializers
from appointments.models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = (
            'id',
            'user',
            'doctor',
            'appointment_date',
            'time_slot',
            'status',
            'admin_response',
            'notes',
            'created_at',
        )
        read_only_fields = ('user', 'created_at', 'updated_at')