from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from core.database import init_db
from routers import auth, products, orders, users, upload, ai, categories
from dotenv import load_dotenv
import os

load_dotenv() # Load .env file

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Beanie on startup
    await init_db()
    print("MongoDB Connected successfully with Motor & Beanie!")
    yield

app = FastAPI(title="Badminton Shop Python API", lifespan=lifespan)

# Allow CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/")
async def root():
    return {"message": "Welcome to Badminton Shop API (Python Version)"}
