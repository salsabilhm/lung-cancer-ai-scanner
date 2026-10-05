# Lung Cancer AI Scanner

An AI-powered web application for analyzing chest X-ray images and providing an automated classification using a deep learning model.

The system allows users to upload a chest X-ray image and receive an AI-based prediction with confidence scores and class probabilities.

> **Disclaimer:** This project is developed for educational and research purposes only. It is not a medical diagnostic tool and should not replace professional medical advice.

## Features

* User registration and login
* JWT-based authentication
* Chest X-ray image upload
* AI-based image classification
* Prediction confidence score
* Class probability distribution
* Scan history
* Free and Premium scan limits
* Doctor management
* Appointment management
* User profile management
* PostgreSQL database
* Django REST API
* AI model integration

## AI Model

The application uses a trained deep learning model to classify chest X-ray images into three classes:

* **Lung Opacity**
* **Normal**
* **Pneumonia**

### Image Processing

The uploaded image goes through the following preprocessing pipeline:

```text
Chest X-ray Image
        ↓
Grayscale Conversion
        ↓
Resize to 224 × 224
        ↓
Pixel Normalization
        ↓
Deep Learning Model
        ↓
Prediction
```

The trained model is stored at:

```text
backend/scans/ml_models/FinalModel.h5
```

The model is managed using **Git LFS** because of its large file size.

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Python
* Django
* Django REST Framework
* JWT Authentication

### Database

* PostgreSQL
* Supabase

### Artificial Intelligence

* TensorFlow
* Keras
* NumPy
* OpenCV

### Version Control

* Git
* GitHub
* Git LFS

### Authors 
Hamdane Salsabil & Benaissa Roumeissa
