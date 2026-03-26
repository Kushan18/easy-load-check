import random
import string
import datetime

def generate_trip_id(prefix="TRP"):
    """Generates a random short ID like TRP-8X29"""
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{suffix}"

def get_utc_now():
    return datetime.datetime.utcnow()
