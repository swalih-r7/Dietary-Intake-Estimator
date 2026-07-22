# 🍽️ Dietary Intake Estimator

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11.9-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.2.7-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13.0-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

**AI-powered food recognition — identify meals from photos and get instant calorie & macronutrient estimates.**  
TensorFlow MobileNetV2 · Django REST API · React Frontend · 85.63% Model Accuracy

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Model Details](#-model-training-details)

</div>

---

## 📌 Overview

Dietary Intake Estimator is a full-stack AI web application that identifies food items from uploaded photos and estimates their caloric and macronutrient values in real time. The system uses a **MobileNetV2 transfer learning model** trained on 4,500 images across 9 food categories, achieving **85.63% test accuracy**.

Built with role-based access control (Patient, Nutritionist, Admin), full meal history tracking, and an analytics dashboard — all secured with JWT authentication.

---

## ✨ Features

### 🔐 Authentication & Access
- JWT-based user registration and login
- Role-based access control — Patient, Nutritionist, and Admin roles
- Profile management with username updates and session handling

### 🤖 AI Food Recognition
- Upload or capture food photos for instant analysis
- TensorFlow MobileNetV2 model with 85.63% accuracy
- Recognises 9 food categories: Caesar Salad, Cheesecake, Donuts, Dumplings, French Toast, Macarons, Prime Rib, Ramen, Spaghetti Bolognese

### 📊 Nutrition Tracking
- Per 100g nutrition database — calories, protein, carbs, fats
- AI Plate Scanner with real-time nutrition estimation
- Food Directory to browse and search food categories

### 📅 Meal History
- Auto-saves all analysed meals with timestamps
- Filter by Today, Yesterday, or Older
- Search meals by name and delete individual records

### 📈 Analytics Dashboard
- Track daily calorie intake trends
- Compliance tracking over time
- Visual charts powered by Chart.js

---

## 🛠 Tech Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| Language | Python | 3.11.9 |
| Web Framework | Django | 4.2.7 |
| API Layer | Django REST Framework | 3.14.0 |
| Authentication | JWT | 5.3.0 |
| Database | SQLite | — |
| ML Framework | TensorFlow | 2.13.0 |

### Frontend

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 18.x |
| Build Tool | Vite | 8.0.13 |
| Styling | Tailwind CSS | 4.x |
| Charts | Chart.js | 4.x |
| Icons | Lucide React | Latest |

### Machine Learning

| Component | Details |
|---|---|
| Architecture | MobileNetV2 (pretrained on ImageNet) |
| Input Size | 224 × 224 × 3 |
| Training Images | 4,500 (500 per class × 9 classes) |
| Test Accuracy | 85.63% |
| Training Epochs | 30 (Phase 1) + 20 (Phase 2 fine-tuning) |

---

## 📁 Project Structure

```
Dietary Intake Estimator/
├── Backend/
│   ├── api/
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── dietary_estimator/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── ml_models/
│   │   ├── model_loader.py
│   │   ├── food_model.h5
│   │   ├── label_encoder.pkl
│   │   └── nutrition_dict.pkl
│   ├── media/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── training/
│   └── train_model.py
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/dietary-intake-estimator.git
cd dietary-intake-estimator
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

Backend API is live at: `http://localhost:8000/api/`  
Admin panel at: `http://localhost:8000/admin`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend is live at: `http://localhost:5173`

### 4. Configure Environment Variables

Create a `.env` file inside the `Backend/` folder:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
```

---

## 📡 API Reference

### 🔑 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register/` | Register a new user | ❌ |
| `POST` | `/api/auth/login/` | User login | ❌ |
| `POST` | `/api/auth/logout/` | User logout | ✅ |

### 🤖 Food Recognition

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/predict/` | Analyse a food image | ✅ |
| `GET` | `/api/foods/` | Get all food categories | ✅ |

### 👤 User Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/history/` | Get meal history | ✅ |
| `GET` | `/api/profile/` | Get user profile | ✅ |
| `PUT` | `/api/profile/` | Update user profile | ✅ |
| `DELETE` | `/api/analysis/<id>/delete/` | Delete meal record | ✅ |

---

## 📦 Request & Response Examples

<details>
<summary><strong>POST /api/auth/register/</strong></summary>

**Request:**
```json
{
  "username": "swalih",
  "email": "swalih@example.com",
  "password": "Test123!",
  "password2": "Test123!"
}
```

**Response `201 Created`:**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 1,
    "username": "swalih",
    "email": "swalih@example.com",
    "role": "patient"
  }
}
```
</details>

<details>
<summary><strong>POST /api/predict/</strong></summary>

**Request:** `multipart/form-data` with an image file field named `image`

**Response `200 OK`:**
```json
{
  "food_item": "Ramen",
  "confidence": 0.96,
  "nutrition_per_100g": {
    "calories": 436,
    "protein": 14.0,
    "carbs": 60.0,
    "fats": 15.0
  },
  "message": "Food identified successfully."
}
```
</details>

<details>
<summary><strong>GET /api/history/</strong></summary>

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "food_item": "Ramen",
    "calories": 436,
    "protein": 14.0,
    "carbs": 60.0,
    "fats": 15.0,
    "timestamp": "2026-05-26T13:00:00Z"
  }
]
```
</details>

---

## 🔬 Model Training Details

### Data Preprocessing

- Images resized to **224 × 224 × 3**
- Data augmentation applied (rotation, flipping, zoom)
- Train-test split → 80 / 20 ratio

### Training Strategy

| Phase | Details |
|---|---|
| Phase 1 | Feature extraction — MobileNetV2 base frozen, 30 epochs |
| Phase 2 | Fine-tuning — top layers unfrozen, 20 epochs |

### Per-Category Accuracy

| Food Category | Accuracy |
|---|---|
| Ramen | 96.0% |
| Macarons | 92.0% |
| Prime Rib | 89.3% |
| Donuts | 85.3% |
| Spaghetti Bolognese | 85.3% |
| Dumplings | 84.0% |
| Caesar Salad | 82.7% |
| French Toast | 80.0% |
| Cheesecake | 76.0% |
| **Overall** | **85.63%** |

### Retrain the Model

```bash
cd training
python train_model.py
```

The script loads images from `Data_MA/`, trains the MobileNetV2 model, and saves `food_model.h5`, `label_encoder.pkl`, and `nutrition_dict.pkl` to `Backend/ml_models/`.

---

## 🔒 Authentication Flow

```
1. POST /api/auth/register/    →  Create account with role
2. POST /api/auth/login/       →  Receive access + refresh tokens
3. Store tokens securely       →  localStorage
4. Send with each request      →  Authorization: Bearer <access_token>
5. Logout                      →  POST /api/auth/logout/ + clear tokens
```

All protected endpoints return `401 Unauthorized` if the token is missing or invalid.

---

## 🧪 Testing

### Run Backend Test Suite

```bash
cd Backend
python manage.py test
```

### Manual Testing Flow

1. Register a new account via `POST /api/auth/register/`
2. Login via `POST /api/auth/login/` — copy the `access` token
3. Set header: `Authorization: Bearer <access_token>`
4. Upload a food image to `POST /api/predict/`
5. View results in `GET /api/history/`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| API calls failing | Ensure the backend is running on port `8000` |
| CORS errors | Verify `CORS_ALLOWED_ORIGINS` in Django settings |
| Blank page on load | Check browser console for runtime errors |
| Login not working | Clear `localStorage` and try again |
| Model not loading | Confirm `.h5` and `.pkl` files exist in `Backend/ml_models/` |
| Frontend not starting | Delete `node_modules` and run `npm install` |

---

## 🚢 Deployment

### Backend — Gunicorn

```bash
pip install gunicorn
gunicorn dietary_estimator.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

### Frontend — Vercel

```bash
npm run build
npm install -g vercel
vercel --prod
```

### Frontend — Netlify

```bash
npm run build
# Drag and drop the /dist folder into Netlify dashboard
# Or connect your GitHub repo for auto-deployments
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👥 Contributors

| Name | Role |
|------|------|
| Muhammed Swalih | Backend · AI/ML · Database · API Integration |
| Mohamed Sahil Vellathur | Frontend · UI/UX |

---

## 🙏 Acknowledgements

- [UCI Machine Learning Repository](https://archive.ics.uci.edu/) — Food-101 dataset for training images
- TensorFlow for the ML framework
- Django REST Framework for API development
- React and Tailwind CSS for the frontend

---

<div align="center">

⭐ **Star this repository if you found it helpful!**

Built with ❤️ for better nutrition tracking

</div>
