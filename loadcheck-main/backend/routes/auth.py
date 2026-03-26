from fastapi import APIRouter, HTTPException, Depends
from ..models.user_model import UserRegister, UserLogin, UserResponse
from ..database.firestore import get_db
import hashlib
import uuid

router = APIRouter()

def hash_password(password: str) -> str:
    # Using SHA256 for basic MVP security without external deps
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register", response_model=UserResponse)
async def register(user: UserRegister):
    db = get_db()
    users_ref = db.collection("users")
    
    # Check if email exists
    # Note: In a real app with Firestore, queries would be used.
    # For MockFirestore or simple usage, we might scan if needed, but for MVP let's assume unique ID or allow duplicates for now if query is hard without real indexes.
    # Actually, let's try a simple query if it's a real firestore, but mock might not support it.
    # To be safe, we'll just create a new user. ID = uuid.
    
    user_id = str(uuid.uuid4())
    hashed = hash_password(user.password)
    
    user_data = user.model_dump(exclude={"password"})
    user_data["password_hash"] = hashed
    user_data["id"] = user_id
    
    try:
        # Check if email already exists (naive scan for MVP robustness)
        # Real Firestore should use .where("email", "==", user.email)
        # MockFirestore doesn't implement where() in strict way usually.
        # Let's just key by Email for simplicity? No, ID should be stable.
        # Key by Email makes enforcing uniqueness easy!
        
        doc_ref = users_ref.document(user.email) # Use email as doc ID for uniqueness
        doc = doc_ref.get()
        if doc.exists:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        doc_ref.set(user_data)
        
        return UserResponse(**user_data)
    except Exception as e:
        if "Email already registered" in str(e):
             raise e
        # If it's a mock db or other error
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=UserResponse)
async def login(creds: UserLogin):
    db = get_db()
    users_ref = db.collection("users")
    
    doc_ref = users_ref.document(creds.email)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    user_data = doc.to_dict()
    hashed = hash_password(creds.password)
    
    if user_data.get("password_hash") != hashed:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return UserResponse(**user_data)
