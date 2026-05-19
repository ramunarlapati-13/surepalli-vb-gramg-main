# 🏛️ VB G-RAM-G SUREPALLI

**Village-level NREGA Administrative Portal — Surepalli, Eluru District, Andhra Pradesh**

A progressive web application (PWA) for managing and publicly displaying MGNREGA muster data, work IDs, and administrative links for the Surepalli Gram Panchayat.

🔗 **Live:** [surepalli.vercel.app](https://surepalli.vercel.app)

---

## ✨ Features

### 🏠 Public Homepage (`index.html`)
- **Quick-access cards** to official NREGA portals (PO Login, NMMS, Jobcards, Work Details, etc.)
- **Dynamic button links** — admin-editable labels and URLs synced from Firestore in real-time
- **Muster IDs FAB** — floating action button with PIN-protected access to the muster database
- **SEO Optimised** — includes `sitemap.xml`, Google Search Console verification, and semantic meta tags
- **PWA installable** — works offline, installable on Android/iOS home screens
- **Ambient UI** — dark mode with glassmorphism, gradient borders, neon glow, and floating orbs

### 🗂️ Muster IDs Page (`muster.html`)
- **Excel-style spreadsheet layout** with column headers (A, B, C, D) and row numbers
- **4-level hierarchy** — Date Range → Work ID → Group Name → Muster ID with `rowspan` merged cells
- **Automatic categorisation** — entries auto-sorted and grouped by date range, work ID, and group
- **📋 Copy All** button per date range — copies full row data (Work ID | Group | Muster ID) to clipboard
- **Individual copy** buttons on each muster ID
- **Live filters** — dropdown for Date Range, Work ID, and a text search across all fields
- **Stats bar** — total muster IDs, group count, filtered count
- **Search highlighting** — matching text highlighted with `<mark>` tags
- **Real-time sync** — Firestore `onSnapshot` listeners update the table instantly when admin saves
- **Fully responsive** — mobile-optimised with hidden row numbers, compact cells, stacked filters

### ⚙️ Admin Panel (`admin.html`)
- **Google Sign-In authentication** — only two authorised Gmail accounts can access
- **Email allowlist** enforced both client-side and server-side (Firestore Rules)
- **Three management tabs:**
  - **🔗 Link Editor** — edit labels and URLs for all homepage buttons, save individually or all at once, reset to defaults
  - **🗂️ Muster IDs** — full CRUD for muster entries with:
    - **Work ID chip manager** — add/remove Work IDs as dropdown options
    - **📅 Date Range chip manager** — add/remove date ranges (e.g., `18/05/2026 - 24/05/2026`)
    - **Comma-separated bulk entry** — enter `raju, suresh, kumar` and `1234, 5678, 9012` to create 3 entries at once (1:1 pairing)
    - **Muster table** with inline delete
- **Cloud sync status pill** — real-time indicator (☁️ Connected / ⏳ Saving / ✅ Saved / ⚠️ Error)
- **Descriptive error messages** — specific toasts for permission denied, database not found, network errors
- **Responsive layout** — stacked forms, wrapped tabs, scrollable tables on mobile

---

## 🔐 Security Architecture

| Layer | Implementation |
|---|---|
| **Authentication** | Firebase Auth — Google Sign-In only |
| **Authorisation** | Firestore Rules — email allowlist (`ramunarlapati27@gmail.com`, `bandilasuresh440@gmail.com`) |
| **Public read** | Anyone can read `gramg/*` collection (muster data is public) |
| **Write restriction** | Only authenticated admins with allowed emails can write to `musters`, `workids`, `links`, `dateranges` docs |
| **Secrets** | `firebase-config.js` git-ignored; config inlined in HTML for Vercel deployment (Firebase web keys are public by design) |

---

## 🏗️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Database | Firebase Cloud Firestore (real-time) |
| Auth | Firebase Authentication (Google provider) |
| Hosting | Vercel (auto-deploy from GitHub) |
| PWA | Service Worker with network-first HTML, cache-first assets |
| Fonts | Google Fonts — Outfit, JetBrains Mono |

---

## 📁 Project Structure

```
├── index.html            # Public homepage with NREGA quick links
├── muster.html           # Public Excel-style muster ID viewer
├── admin.html            # Protected admin dashboard (Google Sign-In)
├── admin.js              # Admin logic — Firebase Auth, CRUD, cloud sync
├── script.js             # Homepage logic — PWA, auth modal, dynamic links
├── style.css             # Shared design system — dark mode, cards, animations
├── sw.js                 # Service Worker — offline support, cache management
├── manifest.json         # PWA manifest — icons, theme, display
├── icon.png              # App icon
├── sitemap.xml           # SEO sitemap for search engine indexing
├── google30d270e82670290b.html # Google Search Console verification
├── firebase-config.js    # Firebase credentials (git-ignored)
├── firebase.json         # Firebase CLI config for rule deployment
├── firestore.rules       # Firestore security rules
├── .env                  # Sensitive values reference (git-ignored)
└── .gitignore            # Excludes .env, config.js, firebase-config.js
```

---

## 🚀 Deployment

### Vercel (Production)
Pushes to `main` auto-deploy to [surepalli.vercel.app](https://surepalli.vercel.app).
Firebase config is inlined in HTML — no build step required.

### Firebase Rules
Deploy Firestore security rules via Firebase Console or CLI:
```bash
firebase login
firebase use nrega-media
firebase deploy --only firestore
```

### Firebase Console Setup
1. **Firestore** → Create database → Production mode
2. **Authentication** → Sign-in method → Enable **Google**
3. **Authentication** → Authorized domains → Add `surepalli.vercel.app`

---

## 📱 PWA Details

- **Cache version:** v11
- **Strategy:** Network-first for HTML (always fresh), cache-first for static assets
- **Offline:** Homepage and muster page available offline via cached assets
- **Install prompt:** Automatic on supported browsers

---

&copy; 2026 Rexplore Technologies.  
Visit us at [www.rexplore.tech](http://www.rexplore.tech)
