# Deployment Guide for LoadCheck

This project is configured for deployment on [Render](https://render.com) using Infrastructure as Code (Blueprints).

## Prerequisites
- A GitHub account.
- A Render account.

## Quick Start
1. **Push to GitHub**
   - Create a new repository on GitHub.
   - Run these commands locally:
     ```bash
     git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
     git branch -M main
     git push -u origin main
     ```

2. **Deploy on Render**
   - Log in to [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** -> **Blueprint**.
   - Connect your GitHub repo.
   - Render will automatically detect `render.yaml` and propose the configuration.
   - Click **Apply**.
   - Your app will be live in a few minutes!

## Database (Optional)
By default, the app uses a **Mock Database** (data resets on restart).
To use a real Firebase database:
1. Obtain `serviceAccountKey.json` from Firebase.
2. In the Render Dashboard, go to your Service -> **Environment** -> **Secret Files**.
3. Add a file named `serviceAccountKey.json` with the content of your key.
4. The app is configured to find it at `/etc/secrets/serviceAccountKey.json` (which Render handles automatically for Secret Files).
