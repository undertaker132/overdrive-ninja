# OVERDRIVE: CYBER SLASH (v92.0) — Publishing & Online Guide

## 1. Publish Free on GitHub Pages (2 Minutes)
1. Create a new public repository on GitHub (e.g. `overdrive-cyber-slash`).
2. Upload the contents of the `overdrive-ninja/` folder (`index.html`, `sw.js`, `manifest.webmanifest`, `lang/`, `icons/`, `models/`).
3. Go to **Settings → Pages → Build and deployment → Source: Deploy from a branch (`main` / `root`)**.
4. Your live HTTPS game URL will be ready in ~60 seconds (with offline PWA install support!).

## 2. Publish on itch.io
1. Zip the contents inside `overdrive-ninja/` (so `index.html` is at the root of the ZIP).
2. Create a new HTML5 project on itch.io, upload the ZIP, and check **"This file will be played in the browser"**.
3. Recommended viewport: **1280 × 720** + enable **Fullscreen button** and **Mobile friendly**.

## 3. Enable Live Global Cloud Leaderboard (Optional — Free Firebase)
1. Create a free project at [Firebase Console](https://console.firebase.google.com/) and enable **Realtime Database**.
2. Copy your database URL (e.g. `https://my-game-default-rtdb.firebaseio.com`).
3. Either paste it inside the game (**🏆 LEADERBOARD → SAVE CLOUD URL**) or set `window.OVERDRIVE_FIREBASE_URL = "https://...";` in `index.html` before uploading.

## 4. Enable Real Google, Facebook, GitHub & X Login (Firebase Auth — Free)
1. In your [Firebase Console](https://console.firebase.google.com/) project, go to **Build → Authentication → Sign-in method**.
2. Enable **Google**, **Facebook**, **GitHub**, **Twitter (X)**, and/or **Email/Password**.
3. Go to **Project Settings → Your apps → Web App** and copy the `firebaseConfig` JSON (`apiKey`, `authDomain`, `projectId`, etc.).
4. Inside the game, click **👤 LOGIN → Firebase Auth Setup** and paste the JSON (or set `window.OVERDRIVE_FIREBASE_CONFIG = {...};` in `index.html`).
5. Add your live domain (e.g. `username.github.io`) under **Authentication → Settings → Authorized domains**.
