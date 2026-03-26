import os
import json

db = None

def get_db():
    global db
    if db is None:
        try:
            # Check for generic credentials file or env var
            cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccountKey.json")
            
            if os.path.exists(cred_path):
                import firebase_admin
                from firebase_admin import credentials, firestore
                crit = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(crit)
                db = firestore.client()
                print(f"Firestore connected using {cred_path}")
            else:
                print("WARNING: No Firestore credentials found. Using Mock Database.")
                db = MockFirestore()
        except ImportError:
            print("WARNING: firebase_admin not installed. Using Mock Database.")
            db = MockFirestore()
        except Exception as e:
            print(f"Error connecting to Firestore: {e}")
            db = MockFirestore()
    return db

class MockFirestore:
    """In-memory mock for development/demo without credentials"""
    def __init__(self):
        self._data = {}

    def collection(self, name):
        return MockCollection(self._data, name)

class MockCollection:
    def __init__(self, db_data, name):
        self.db_data = db_data
        self.name = name
        if name not in self.db_data:
            self.db_data[name] = {}

    def document(self, doc_id):
        return MockDocument(self.db_data[self.name], doc_id)
    
    def add(self, data):
        # Generate random ID
        import uuid
        doc_id = str(uuid.uuid4())
        self.db_data[self.name][doc_id] = data
        return None, MockDocument(self.db_data[self.name], doc_id)

    def stream(self):
        for doc_id, data in self.db_data.get(self.name, {}).items():
            yield MockDocument(self.db_data[self.name], doc_id)

    def where(self, field, op, value):
        # Simple mock implementation returning self (filtering done by caller or ignored for mock)
        # OR better: implement filtering here
        filtered = []
        for doc_id, data in self.db_data.get(self.name, {}).items():
            if op == "==" and data.get(field) == value:
                filtered.append(MockDocument(self.db_data[self.name], doc_id))
        return filtered

class MockDocument:
    def __init__(self, col_data, doc_id):
        self.col_data = col_data
        self.doc_id = doc_id

    def set(self, data, merge=False):
        if merge and self.doc_id in self.col_data:
            self.col_data[self.doc_id].update(data)
        else:
            self.col_data[self.doc_id] = data

    def get(self):
        data = self.col_data.get(self.doc_id)
        return MockSnapshot(data, self.doc_id) if data else MockSnapshot(None, self.doc_id)
        
    def update(self, data):
        if self.doc_id in self.col_data:
            self.col_data[self.doc_id].update(data)

    def to_dict(self):
        # Convenience for iteration where we expect snapshots
        return self.col_data.get(self.doc_id, {})

class MockSnapshot:
    def __init__(self, data, doc_id):
        self._data = data
        self.id = doc_id
        self.exists = data is not None

    def to_dict(self):
        return self._data
