from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from ..models.trip_model import TripCreate, TripResponse, TripPublic
from ..models.enums import TripStatus
from ..services.risk_engine import RiskEngine
from ..services.qr_service import QRService
from ..database.firestore import get_db
from ..utils.common import generate_trip_id, get_utc_now

router = APIRouter()

@router.post("/create", response_model=TripResponse)
async def create_trip(trip: TripCreate, request: Request):
    db = get_db()
    
    # 1. Calculate Risk
    risk_color, utilization = RiskEngine.calculate_risk(
        trip.cargo.weight_tons, 
        trip.cargo.max_capacity_tons
    )
    
    # 2. Mask Identity
    trip.driver.masked_license = f"XXXX-{trip.driver.license_number[-4:]}"
    
    # 3. Generate ID & QR
    trip_id = generate_trip_id()
    
    # Use Dynamic URL from Request to support localhost, Render, and Custom Domains
    base_url = str(request.base_url).rstrip("/")
    # If running on Render, ensure HTTPS (sometimes headers are tricky behind proxy, but this is safer than hardcoding)
    if "onrender.com" in base_url and not base_url.startswith("https"):
        base_url = base_url.replace("http://", "https://")
        
    qr_data = f"{base_url}/?id={trip_id}" 
    qr_base64 = QRService.generate_qr_base64(qr_data)
    
    # 4. Prepare Record
    trip_data = trip.model_dump()
    trip_data.update({
        "id": trip_id,
        "created_at": get_utc_now().isoformat(),
        "risk_color": risk_color,
        "risk_score": utilization,
        "status": TripStatus.CREATED,
        "authorized_state": None,
        "state_history": [],
        "share_link": f"/trip-public.html?id={trip_id}",
        "qr_code_base64": qr_base64
    })
    
    # 5. Save to DB
    db.collection("trips").document(trip_id).set(trip_data)
    
    return trip_data

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str):
    db = get_db()
    doc = db.collection("trips").document(trip_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    return doc.to_dict()

@router.get("/{trip_id}/public", response_model=TripPublic)
async def get_public_trip(trip_id: str):
    db = get_db()
    doc = db.collection("trips").document(trip_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    data = doc.to_dict()
    return TripPublic(
        id=data["id"],
        cargo_type=data["cargo"]["cargo_type"],
        source=data["cargo"]["source"],
        destination=data["cargo"]["destination"],
        risk_color=data["risk_color"],
        status=data["status"],
        eta=data["cargo"].get("eta")
    )


@router.get("/my-trips/{user_id}", response_model=List[TripResponse])
async def get_my_trips(user_id: str):
    db = get_db()
    trips_ref = db.collection("trips")
    
    # Try using where query (works for Real Firestore, and our improved Mock)
    try:
        # Check if it's our Mock class or Real
        if hasattr(trips_ref, 'where'):
            query = trips_ref.where("user_id", "==", user_id)
            if isinstance(query, list): # Our Mock returns list
                docs = query
            else:
                docs = query.stream() # Real Firestore returns generator/stream
        else:
            # Fallback
            docs = trips_ref.stream()
            
        results = []
        for doc in docs:
            # For real firestore doc is a snapshot, for mock it's a MockDocument
            # MockDocument needs to_dict(). Real Snapshot also has to_dict().
            if hasattr(doc, 'to_dict'):
                data = doc.to_dict()
            else: 
                # Fallback if specific object type differs
                data = doc._data if hasattr(doc, '_data') else {}

            # Ensure data mapping (e.g. if we want to filter manually if where not working)
            if data.get("user_id") == user_id:
                results.append(data)
                
        return results
    except Exception as e:
        print(f"Error fetching trips: {e}")
        return []
