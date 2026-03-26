from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from ..database.firestore import get_db

router = APIRouter()

class OfficerAuth(BaseModel):
    pin: str

class AuthorizeAction(BaseModel):
    trip_id: str
    state: str
    pin: str

OFFICER_PIN_Mock = "1234" # In real app, hash and check DB

@router.post("/verify-access")
async def verify_officer(auth: OfficerAuth):
    if auth.pin == OFFICER_PIN_Mock:
        return {"authenticated": True, "token": "mock_officer_token"}
    raise HTTPException(status_code=401, detail="Invalid PIN")

@router.post("/authorize-trip")
async def authorize_trip(action: AuthorizeAction):
    if action.pin != OFFICER_PIN_Mock:
        raise HTTPException(status_code=401, detail="Invalid PIN")
        
    db = get_db()
    doc_ref = db.collection("trips").document(action.trip_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    current_data = doc.to_dict()
    
    # Update logic
    updates = {
        "authorized_state": action.state,
        "state_history": current_data.get("state_history", []) + [action.state]
    }
    
    doc_ref.update(updates)
    
    return {"success": True, "authorized_state": action.state}
