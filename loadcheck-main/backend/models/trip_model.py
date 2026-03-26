from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .enums import RiskColor, TripStatus, UserRole
from .bundles import VehicleBundle, DriverBundle, CargoBundle, TaxBundle

class TripBase(BaseModel):
    vehicle: VehicleBundle
    driver: DriverBundle
    cargo: CargoBundle
    tax: TaxBundle

class TripCreate(TripBase):
    user_id: str
    self_declaration: bool = False

class TripResponse(TripBase):
    id: str
    user_id: str
    created_at: datetime
    risk_color: RiskColor
    risk_score: float # 0.0 to 1.0+ (utilization)
    status: TripStatus
    authorized_state: Optional[str] = None
    state_history: List[str] = []
    share_link: Optional[str] = None
    qr_code_base64: Optional[str] = None

class TripPublic(BaseModel):
    """Limited view for public sharing"""
    id: str
    cargo_type: str
    source: str
    destination: str
    risk_color: RiskColor
    status: TripStatus
    eta: Optional[str] = None
