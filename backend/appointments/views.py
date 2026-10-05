from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from doctors.models import Doctor


class IsAdminUser(permissions.BasePermission):
    """Allow access only to staff/superusers."""

    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    queryset = Appointment.objects.all()

    def get_permissions(self):
        if self.action in ('create', 'list'):
            return [permissions.IsAuthenticated()]
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Appointment.objects.all()
        return Appointment.objects.filter(user=user)