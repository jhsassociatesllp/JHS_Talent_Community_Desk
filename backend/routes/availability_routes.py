from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
from database.db import *
from models.model import *
from database.auth import *

availability_router = APIRouter()

# ---------- ROUTES ----------

@availability_router.post("/availability/set")
def save_availability(data: dict, current_user: dict = Depends(get_current_user)):
    hr_email = data.get("hr_email")
    role = data.get("role")
    company = data.get("company")
    available_dates = data.get("available_dates", [])
    candidates = data.get("candidates", [])

    if not hr_email or not role or not candidates:
        raise HTTPException(status_code=400, detail="Missing fields")

    for c in candidates:
        record = {
            "hr_email": hr_email,
            "reference_name": c.get("reference"),
            "candidate_name": c.get("name"),
            "candidate_number": c.get("phone"),
            "role": role,
            "company": company,
            "available_dates": available_dates,
            "created_at": datetime.utcnow()
        }
        availability_collection.insert_one(record)

    return {"ok": True, "message": "Availability stored for all candidates."}

# @availability_router.get("/get/{hr_email}/{role}")
# def get_availability(hr_email: str, role: str, current_user: dict = Depends(get_current_user)):
#     """Fetch availability for a specific HR and role"""
#     record = availability_collection.find_one(
#         {"hr_email": hr_email, "role": role},
#         {"_id": 0}
#     )

#     if not record:
#         raise HTTPException(status_code=404, detail="No availability found")

#     return record
