# LoadCheck - Transport Compliance System

## Overview
LoadCheck is a full-stack web application designed to assist transport compliance officers and transporters. It features automated risk scoring, QR code verification, and a state-level authorization skip logic.

## Project Structure
- `backend/`: FastAPI application handling logic, DB, and API.
- `frontend/`: Vanilla JS/HTML/CSS frontend.
- `docs/`: Documentation.
- `deployment/`: Deployment configurations.

## Setup & Run

### Prerequisites
- Python 3.9+
- `pip`

### Steps
1. **Navigate to the project root:**
   ```bash
   cd LoadCheck
   ```

2. **Install Backend Dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Run the Application:**
   ```bash
   uvicorn backend.main:app --reload
   ```

4. **Access the App:**
   Open your browser and navigate to `http://localhost:8000`.

## Features
- **Create Trip:** Transporters can bundle vehicle, driver, and cargo details.
- **Risk Engine:** Automatically flags overloaded trucks (Red).
- **Public Tracking:** Shareable link (e.g., `/trip-public.html?id=...`) with privacy masking.
- **Officer View:** PIN-protected access to verify trips and mark them authorized.

## Configuration
- **Firestore:** By default, it runs in **Mock Mode** (in-memory). To use real Firestore, place your `serviceAccountKey.json` in the root and set `GOOGLE_APPLICATION_CREDENTIALS`.

## Deployment
See `deployment/dockerfile` or `deployment/render.yaml` for cloud deployment instructions...
