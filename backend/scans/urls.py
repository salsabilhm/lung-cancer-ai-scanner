from django.urls import path
from . import views

urlpatterns = [
    path("predict/", views.ScanPredictView.as_view(), name="scan-predict"),
    path("", views.ScanHistoryView.as_view(), name="scan-history"),
]