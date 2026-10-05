"""
predict_service.py
Prédiction sur radiographie pulmonaire avec le modèle FinalModel.h5
(issu du notebook lung-xray-classifier).

Dépendances :
    pip install tensorflow opencv-python-headless numpy
"""

import os

import cv2
import numpy as np

# ---------------------------------------------------------------
# Constantes figées par l'entraînement (ne pas modifier)
# ---------------------------------------------------------------
# Anchored to this file's directory so the model is found no matter
# what the server's working directory is (…/scans/ml_models/FinalModel.h5)
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "ml_models", "FinalModel.h5"
)
IMG_SIZE = 224

# Ordre = os.listdir() trié alphabétiquement dans le notebook
# => indice 0, 1, 2 de la sortie softmax
CLASS_NAMES = ["Lung_Opacity", "Normal", "Pneumonia"]

# A.Normalize() par défaut d'Albumentations, appliqué sur une image 1 canal :
# (pixel/255 - 0.485) / 0.229
MEAN = 0.485
STD = 0.229

_model = None


def get_model():
    """Charge le modèle une seule fois (au premier appel)."""
    global _model
    if _model is None:
        import tensorflow as tf

        _model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    return _model


def preprocess(image_bytes: bytes) -> np.ndarray:
    """Octets d'une image (jpg/png) -> tableau (1, 224, 224, 1) float32."""
    buffer = np.frombuffer(image_bytes, dtype=np.uint8)

    # Même lecture que l'entraînement : niveaux de gris
    image = cv2.imdecode(buffer, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise ValueError("Image invalide ou format non supporté.")

    # Même redimensionnement qu'Albumentations (interpolation bilinéaire)
    image = cv2.resize(image, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_LINEAR)

    image = image.astype(np.float32) / 255.0
    image = (image - MEAN) / STD

    return image[np.newaxis, :, :, np.newaxis].astype(np.float32)


def predict(image_bytes: bytes) -> dict:
    """Retourne la classe prédite et les probabilités de chaque classe."""
    batch = preprocess(image_bytes)
    probs = get_model().predict(batch, verbose=0)[0]

    best = int(np.argmax(probs))

    return {
        "prediction": CLASS_NAMES[best],
        "confidence": round(float(probs[best]), 4),
        "probabilities": {
            name: round(float(p), 4) for name, p in zip(CLASS_NAMES, probs)
        },
    }


# ---------------------------------------------------------------
# Exemple d'utilisation dans une vue Django REST Framework
# (adaptez-le si votre backend est FastAPI ou Flask)
# ---------------------------------------------------------------
#
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.parsers import MultiPartParser
# from .predict_service import predict
#
# class XrayPredictView(APIView):
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser]
#
#     def post(self, request):
#         file = request.FILES.get("image")
#         if not file:
#             return Response({"error": "Champ 'image' manquant."}, status=400)
#         try:
#             return Response(predict(file.read()))
#         except ValueError as e:
#             return Response({"error": str(e)}, status=400)