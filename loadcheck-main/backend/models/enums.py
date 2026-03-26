from enum import Enum

class RiskColor(str, Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"

class UserRole(str, Enum):
    PUBLIC = "public"
    TRANSPORTER = "transporter"
    OFFICER = "officer"

class CargoType(str, Enum):
    GENERAL = "general"
    PERISHABLE = "perishable"
    HAZARDOUS = "hazardous"
    FRAGILE = "fragile"

class TripStatus(str, Enum):
    CREATED = "created"
    IN_TRANSIT = "in_transit"
    COMPLETED = "completed"
    FLAGGED = "flagged"
