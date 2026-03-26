from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class VehicleBundle(BaseModel):
    rc_number: str = Field(..., description="Vehicle Registration Certificate Number")
    insurance_expiry: date
    puc_expiry: date
    vehicle_type: Optional[str] = "TRUCK"

class DriverBundle(BaseModel):
    name: str
    license_number: str = Field(..., description="Driver License Number")
    codriver_license: Optional[str] = None
    masked_license: Optional[str] = None # Computed field

class CargoBundle(BaseModel):
    cargo_type: str
    weight_tons: float
    max_capacity_tons: float
    source: str
    destination: str
    origin_state: str = Field(..., min_length=2, max_length=2)
    eta: Optional[str] = None

class TaxBundle(BaseModel):
    eway_bill: str
    invoice_number: str
    supplier_gst: str
    receiver_gst: str
