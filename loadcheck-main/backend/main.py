from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import trip, officer, auth

app = FastAPI(title="LoadCheck API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(trip.router, prefix="/api/trip", tags=["Trip"])
app.include_router(officer.router, prefix="/api/officer", tags=["Officer"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

# Serve Frontend Static Files
# Mounts the 'frontend/public' directory to root '/'
import os
from fastapi.responses import FileResponse

static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "public")

# Explicit Routes for critical pages to avoid StaticFiles 404 issues
@app.get("/")
async def serve_root():
    return FileResponse(os.path.join(static_dir, "index.html"))

@app.get("/index.html")
async def serve_index():
    return FileResponse(os.path.join(static_dir, "index.html"))

@app.get("/verify.html")
async def serve_verify():
    file_path = os.path.join(static_dir, "verify.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Verify file not found on server"}

@app.get("/officer-view.html")
async def serve_officer():
    return FileResponse(os.path.join(static_dir, "officer-view.html"))

if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
