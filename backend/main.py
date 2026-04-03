from fastapi import FastAPI, Header, Form
from pydantic import BaseModel
import pandas as pd
import joblib
import json
import requests
import uuid
import os
from dotenv import load_dotenv
from typing import Literal

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ENV ----------------
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ---------------- SESSION STORE ----------------
sessions = {}

# ---------------- LOAD MODEL ----------------
model = joblib.load("xgboost_model.pkl")

# ---------------- LOAD DATA ----------------
df = pd.read_csv("../data/processed/final_dataset.csv")
df['date'] = pd.to_datetime(df['date'])

# ---------------- USER DB ----------------
def load_users():
    with open("users.json") as f:
        return json.load(f)

def save_users(users):
    with open("users.json", "w") as f:
        json.dump(users, f, indent=2)

# ---------------- REQUEST MODELS ----------------
class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    username: str
    password: str
    category: str
    location: str

class PredictRequest(BaseModel):
    username: str

# ---------------- AUTH ----------------
def get_current_user(token: str):
    username = sessions.get(token)
    if not username:
        return None
    
    users = load_users()
    for user in users:
        if user["username"] == username:
            return user
    return None

# ---------------- LOGIN ----------------
@app.post("/login")
def login(
    username: str = Form(...),
    password: str = Form(...)
):
    users = load_users()

    for user in users:
        if user["username"] == username and user["password"] == password:
            token = str(uuid.uuid4())
            sessions[token] = user["username"]

            return {
                "status": "success",
                "token": token,
                "user": user
            }

    return {"status": "failed"}

# ---------------- SIGNUP ----------------
@app.post("/signup")
def signup(
    username: str = Form(...),
    password: str = Form(...),
    category: str = Form(...),
    location: str = Form(...)
):

    users = load_users()

    new_user = {
        "username": username,
        "password": password,
        "category": category,
        "store_id": int(df['store_id'].sample(1).values[0]),
        "location": location,
        "subscribed": False
    }

    users.append(new_user)
    save_users(users)

    return {"status": "created", "user": new_user}

# ---------------- GET USER DATA ----------------
def get_user_data(user):
    store_id = user["store_id"]
    category = user["category"]

    user_df = df[df["store_id"] == store_id]
    latest = user_df.sort_values("date").tail(1)

    return latest, category

# ---------------- ACTION ENGINE ----------------
def generate_action(pred, last_sales, category):
    diff = pred - last_sales

    if category == "food":
        return f"Fresh items ka stock badhao (+{int(diff)})"
    elif category == "clothing":
        return f"Trending kapdon ka stock badhao (+{int(diff)})"
    elif category == "electronics":
        return f"Mehange items ko dhyan se stock karo (+{int(diff)})"
    else:
        return f"Stock adjust karo (+{int(diff)})"

# ---------------- AI INSIGHT ----------------
def generate_ai_insight(sample, pred, category):

    url = "https://openrouter.ai/api/v1/chat/completions"

    last_sales = sample['lag_1'].values[0]
    trend = sample['rolling_mean_7'].values[0]
    price = sample['price'].values[0]

    prompt = f"""
    You are helping a small shopkeeper.

    Business type: {category}

    DATA:
    - Kal approx {pred:.1f} items bik sakte hain
    - Kal {last_sales} items bike the
    - Weekly average {trend:.1f} hai
    - Price ₹{price}

    Simple language me explain karo:
    - Demand badh rahi hai ya nahi
    - Kya action lena chahiye
    """

    try:
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}]
            }
        )

        result = response.json()
        return result['choices'][0]['message']['content']

    except:
        return "Demand stable hai, stock accordingly manage karo"

# ---------------- PREDICT ----------------
@app.post("/predict")
def predict(
    username: Literal[
        "merchant_food",
        "merchant_clothing",
        "merchant_grocery",
        "merchant_electronics"
    ] = Form(...),
    token: str = Header(...)
):
    
    user = get_current_user(token)

    if not user or user["username"] != username:
        return {"error": "Unauthorized"}

    if not user["subscribed"]:
        return {"error": "Subscription required"}

    sample, category = get_user_data(user)

    # ❗ remove date
    sample_input = sample.drop(columns=["date", "sales"])

    pred = model.predict(sample_input)[0]

    last_sales = sample['lag_1'].values[0]

    action = generate_action(pred, last_sales, category)
    insight = generate_ai_insight(sample, pred, category)

    return {
        "prediction": float(pred),
        "action": action,
        "insight": insight
    }
# ---------------- TRENDS ----------------
from typing import Literal
from fastapi import Form, Header

@app.post("/trends")
def trends(
    username: Literal[
        "merchant_food",
        "merchant_clothing",
        "merchant_grocery",
        "merchant_electronics"
    ] = Form(...),

    range: Literal["daily", "weekly", "monthly"] = Form("weekly"),

    token: str = Header(...)
):

    # 🔐 AUTH CHECK
    user = get_current_user(token)

    if not user or user["username"] != username:
        return {"error": "Unauthorized"}

    if not user["subscribed"]:
        return {"error": "Subscription required"}

    # 📊 GET USER DATA
    store_id = user["store_id"]

    user_df = df[df["store_id"] == store_id].sort_values("date")

    # 📈 RANGE LOGIC
    if range == "daily":
        data = user_df.tail(7)

    elif range == "weekly":
        data = user_df.tail(30)

    else:  # monthly
        data = user_df.tail(90)

    # 🔥 CLEAN OUTPUT (only useful fields)
    result = data[[
        "date",
        "sales",
        "price",
        "lag_1",
        "rolling_mean_7"
    ]]

    return result.to_dict(orient="records")