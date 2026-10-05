import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework import status

from .models import Scan
from subscriptions.models import Subscription
from .services.predict_service import predict, CLASS_NAMES


def check_scan_limit(user):
    """Check if user can still upload a scan."""
    subscriptions = user.subscriptions.all()
    if not subscriptions.exists():
        # No subscription → treat as Free (limit 3)
        current_count = Scan.objects.filter(user=user).count()
        return current_count < 3

    subscription = subscriptions.first()
    if subscription.plan == Subscription.Plan.PREMIUM:
        return True  # Unlimited for Premium

    # Free users: max 3 scans
    current_count = Scan.objects.filter(user=user).count()
    return current_count < 3


class ScanPredictView(APIView):
    """POST /api/scans/predict/ - Upload X-ray for AI prediction."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        user = request.user

        if not check_scan_limit(user):
            return Response(
                {"error": "Scan limit reached. Free users can upload up to 3 scans."},
                status=status.HTTP_403_FORBIDDEN,
            )

        file = request.FILES.get("image")
        if not file:
            return Response(
                {"error": "Image field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ext = os.path.splitext(file.name)[1].lower()
        if ext not in [".png", ".jpg", ".jpeg", ".bmp"]:
            return Response(
                {"error": "Unsupported image format. Use PNG, JPG or BMP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            image_bytes = file.read()
        except Exception:
            return Response(
                {"error": "Could not read image file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = predict(image_bytes)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response(
                {"error": "Prediction error. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        scan = Scan.objects.create(
            user=user,
            image=file,
            original_filename=file.name,
            file_type=ext.lstrip(".").upper(),
            file_size=file.size,
            status="COMPLETED",
            prediction=result["prediction"],
            confidence=result["confidence"],
            result=result["probabilities"],
        )

        return Response(
            {
                "pk": scan.pk,
                "prediction": scan.prediction,
                "confidence": scan.confidence,
                "probabilities": scan.result,
                "result": scan.result,
                "created_at": scan.created_at,
                "status": scan.status,
            },
            status=status.HTTP_201_CREATED,
        )


class ScanHistoryView(APIView):
    """GET /api/scans/ - User's scan history (own scans only)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        scans = Scan.objects.filter(user=user).order_by("-created_at")
        from .serializers import ScanSerializer
        serializer = ScanSerializer(scans, many=True)
        return Response(serializer.data)