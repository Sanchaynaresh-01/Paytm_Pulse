# PayTM Pulse — Merchant Intelligence Dashboard

PayTM Pulse is a production-level fintech SaaS platform designed to help small and medium merchants make smarter, AI-driven inventory decisions. It bridges the gap between historical sales patterns and actionable insights using a dynamic FastAPI backend powered by XGBoost, coupled with a highly responsive React frontend.

![PayTM Pulse Dashboard](https://img.shields.io/badge/Demo-Ready-success?style=for-the-badge) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)

## 🌟 Key Features

### Frontend (React + Vite)
- **PayTM-Inspired Design System:** Responsive glassmorphic layout featuring blue gradients, clean component abstractions, and fluid animations.
- **Dark/Light Mode:** Seamless theme toggling persisted via `localStorage`.
- **JWT-based Authentication Flow:** Secure session management leveraging Context API and centralized Axios interceptors.
- **AI Prediction Tab:** An intuitive interface requesting expected daily sales, paired with targeted, NLP-based business recommendations in native-style Hinglish.
- **Sales Trends Visualization:** Fluid Line & Area charts (via `recharts`) combined with granular tabular data dynamically fetching daily, weekly, or monthly historical aggregates.

### Backend (FastAPI + XGBoost + Pandas)
- **Predictive Engine:** Leverages a pre-trained XGBoost `.pkl` model tracking dynamic features (e.g., rolling means, lag values) to output discrete daily sales estimations.
- **AI Action Engine:** Triggers the OpenRouter API (`gpt-4o-mini`) dynamically to ingest predicted demand, past demand, and category specifics, returning natural-language (Hinglish) action insights.
- **Robust Authentication API:** Secure endpoints (`/login`, `/signup`) managing token generation spanning distinct user profiles and store IDs.
- **Customized DataFrame Slicing:** Context-aware endpoint logic slicing granular pandas structures according to requesting JWT privileges (`/trends`), returning highly optimized representations spanning targeted interval ranges.

---

## 🛠️ Software Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router DOM, Recharts, Axios.
- **Backend:** FastAPI, Uvicorn, Pandas, XGBoost, Scikit-Learn, dotenv.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v16.0 or higher)
- Python (v3.9 or higher)

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
```

Install the required Python dependencies:
```bash
pip install -r ../requirements.txt
```
*(Make sure features like `fastapi`, `uvicorn`, `pandas`, `xgboost`, `python-dotenv`, and `scikit-learn` are installed).*

Run the FastAPI Uvicorn server:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```
> The API will be available at `http://127.0.0.1:8001`.

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install the Node modules:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
> The application will run internally, usually on `http://localhost:5173`. 

---

## 🔐 Demo Credentials

You can log in and test the application out of the box using any pre-registered user. For example:

**Account 1 (Food Merchant):**
- **Username:** `merchant_food`
- **Password:** `123`

**Account 2 (Clothing Merchant):**
- **Username:** `merchant_clothing`
- **Password:** `123`

---

## 📂 Project Structure Overview

```text
PayTM Pulse/
├── backend/
│   ├── main.py                # FastAPI app & routing
│   ├── users.json             # Mock localized DB for user accounts
│   ├── xgboost_model.pkl      # Pre-trained ML Engine
│   └── data/                  # Historical datasets (CSV)
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable view components
│   │   ├── context/           # AuthContext implementation
│   │   ├── pages/             # Login, Signup, Dashboard JSX
│   │   ├── services/          # Abstracted api.js for Axios requests
│   │   └── index.css          # Design tokens & Tailwind utility overrides
│   ├── package.json
│   └── vite.config.js
```

---
*Created for robust and compliant Merchant analytics.*
