from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from routes.upload_resume import upload_router
from routes.match_resumes import match_router
from routes.whatsapp_routes import whatsapp_router
from routes.auth_routes import auth_router 
from routes.all_candidates import candidate_router
from routes.availability_routes import availability_router
from fastapi.staticfiles import StaticFiles
from database.auth import *

app = FastAPI()

app.include_router(upload_router)
app.include_router(match_router)
app.include_router(candidate_router)
app.include_router(whatsapp_router)
app.include_router(auth_router)
app.include_router(availability_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to your frontend domain instead of "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === PATHS ===
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # project-root
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# === SERVE ENTIRE FRONTEND FOLDER AS ROOT (/) ===
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

# Root route: Check auth → serve index.html or redirect to login
@app.get("/", response_class=HTMLResponse)
async def root(current_user: dict = Depends(get_current_user)):
    if current_user:
        # User logged in → serve dashboard
        with open("frontend/index.html", "r") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    else:
        # Not logged in → redirect to login
        return RedirectResponse(url="/login")

# @app.get("/")
# def home():
#     return {"message": "Welcome to the Automated Recruitment System API"}