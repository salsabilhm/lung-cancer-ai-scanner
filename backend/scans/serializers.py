from rest_framework import serializers
from .models import Scan


class ScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scan
        fields = [
            "pk",
            "user",
            "image",
            "original_filename",
            "file_type",
            "file_size",
            "status",
            "prediction",
            "confidence",
            "result",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
            "original_filename",
            "file_type",
            "file_size",
            "status",
            "prediction",
            "confidence",
            "result",
            "created_at",
            "updated_at",
        ]