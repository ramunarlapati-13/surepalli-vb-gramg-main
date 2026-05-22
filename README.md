# VB G-RAM-G SUREPALLI

Village-level web portal for Surepalli (Eluru district) to publish and manage NREGA-related quick links and muster records.

🔗 Live: [https://surepalli.vercel.app](https://surepalli.vercel.app)

## Project description

This repository contains a static Progressive Web App (PWA) built with plain HTML/CSS/JavaScript and backed by Firebase.

It has three main pages:

- **`index.html` (public homepage)**  
  Displays quick-access cards for official NREGA portals, supports app installation, and includes a modal-gated “Musters database” floating button.

- **`muster.html` (public muster viewer)**  
  Shows muster entries in a spreadsheet-like table with:
  - date range/work ID/search filters
  - grouped rows (rowspan layout)
  - copy buttons for single IDs and date-range batches
  - live refresh via Firestore snapshot listeners

- **`admin.html` + `admin.js` (admin dashboard)**  
  Google Sign-In based admin area (allowlisted emails) used to manage:
  - button link URLs
  - work ID options
  - date range options
  - muster entries (including comma-separated bulk insert)
  
  Data is cached in `localStorage` and synced to Firestore (`gramg` collection).

## Tech stack

- Vanilla HTML, CSS, JavaScript
- Firebase Authentication (Google provider)
- Firebase Firestore
- Service Worker + Web App Manifest (PWA)
- Hosted on Vercel

## Data model (Firestore)

Collection: `gramg`

- `musters` → `{ entries: [...] }`
- `workids` → `{ list: [...] }`
- `links` → `{ data: [...] }`
- `dateranges` → `{ list: [...] }`

Security rules allow:
- public read access to `gramg/*`
- write access only for allowlisted authenticated admin emails

## Run / deploy notes

- No build step is required (static site).
- Open `index.html` directly for local static preview.
- Firestore rules are defined in `firestore.rules` and referenced by `firebase.json`.

### Deploy Firestore rules (CLI)

```bash
firebase login
firebase use nrega-media
firebase deploy --only firestore
```

## Repository files

- `index.html` – public landing page
- `muster.html` – public muster viewer
- `admin.html` / `admin.js` – admin UI and logic
- `script.js` – homepage behaviors
- `style.css` – shared styling
- `sw.js` – service worker cache strategy
- `manifest.json` – PWA manifest
- `firestore.rules` – Firestore access rules
- `firebase.json` – Firebase CLI config
