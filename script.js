/* ════════════════════════════════════════════
   script.js  –  VB G-RAM-G SUREPALLI
   ════════════════════════════════════════════ */

/* ── Map of button IDs → link IDs (from admin DEFAULT_LINKS) ── */
const LINK_ID_MAP = {
  "po-login":         0,
  "nmms-attendance":  1,
  "jobcards":         2,
  "work-details":     3,
  "employment-days":  4,
  "100-days":         5,
  "at-a-glance":      6,
  "state-reports":    7,
  "bhuvan-mgnrega":   8,
  "emms-reports":     9,
  "nregs-apps":       10,
  "mis-reports":      11,
};

/* ── Default links (mirrors admin.js DEFAULT_LINKS) ── */
const DEFAULT_LINKS = [
  { id:"po-login",         url:"https://nregade1.dord.gov.in/netnrega/Login.aspx?&level=HomePO&state_code=02" },
  { id:"nmms-attendance",  url:"https://mnregaweb4.nic.in/nregaarch/View_NMMS_atten_date_new.aspx?fin_year=2024-2025&Digest=HNrisV4bhHnb7Gve3mAKYQ" },
  { id:"jobcards",         url:"https://nregastrep.nic.in/netnrega/loginframegp.aspx?salogin=Y&state_code=02" },
  { id:"work-details",     url:"https://nreganarep.nic.in/netnrega/dynamic_work_details.aspx?page=S&lflag=eng&state_name=ANDHRA%20PRADESH&state_code=02&fin_year=2025-2026&source=national&Digest=UuTq5reEYK2ZLiaTDfDuQA" },
  { id:"employment-days",  url:"https://mnregaweb2.dord.gov.in/netnrega/state_html/empspecifydays.aspx?page=P&lflag=eng&state_name=ANDHRA+PRADESH&state_code=02&district_name=ELURU&district_code=0217" },
  { id:"100-days",         url:"https://mnregaweb2.dord.gov.in/netnrega/state_html/more100day.aspx?page=B&lflag=eng&state_name=ANDHRA+PRADESH&state_code=02&district_name=ELURU&district_code=0217" },
  { id:"at-a-glance",      url:"https://nreganarep.nic.in/netnrega/nrega_ataglance/At_a_glance.aspx" },
  { id:"state-reports",    url:"https://mnregaweb2.dord.gov.in/netnrega/Homedist.aspx?flag_debited=&is_statefund=&lflag=eng&district_code=0217&district_name=ELURU&state_name=ANDHRA%20PRADESH&state_Code=02" },
  { id:"bhuvan-mgnrega",   url:"https://bhuvan-app2.nrsc.gov.in/mgnrega/mgnrega_phase2.php#" },
  { id:"emms-reports",     url:"https://emms.ap.gov.in/nregs_ap/Reports/#" },
  { id:"nregs-apps",       url:"https://emms.ap.gov.in/apps/NregsApps.htm##" },
  { id:"mis-reports",      url:"https://vbgramgrep.dord.gov.in/VBGRAMG/MISreport.aspx" },
];

/* ── Apply admin-saved links to every <a> card on the page ── */
function applyAdminLinks() {
  const raw   = localStorage.getItem("admin_links");
  const links = raw ? JSON.parse(raw) : DEFAULT_LINKS;

  // The nav cards are plain <a> tags — select them by their href pattern
  // We match cards using querySelectorAll on the nav and patch by index order
  const navCards = document.querySelectorAll('nav.grid-layout a.card, nav.grid-layout .button-group a.card');

  // Build a quick id→url map (populate defaults first, then overwrite with loaded config)
  const urlMap = {};
  DEFAULT_LINKS.forEach(l => { urlMap[l.id] = l.url; });
  if (Array.isArray(links)) {
    links.forEach(l => { urlMap[l.id] = l.url; });
  }

  // Patch each card: match via dataset, partial href, or index
  navCards.forEach((card, idx) => {
    let linkId = card.dataset.linkId;
    if (!linkId) {
      const href = card.getAttribute("href") || "";
      const match = DEFAULT_LINKS.find(dl => href.includes(dl.url.slice(8, 40)));
      if (match) {
        linkId = match.id;
      } else if (idx < 12 && DEFAULT_LINKS[idx]) {
        linkId = DEFAULT_LINKS[idx].id;
      }
      if (linkId) card.dataset.linkId = linkId;
    }
    if (linkId && urlMap[linkId]) {
      card.setAttribute("href", urlMap[linkId]);
    }
  });


}

/* ── Firebase real-time listener for live link updates from Admin ── */
function initFirebaseLinksListener() {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || cfg.apiKey === "YOUR_API_KEY") return;
  try {
    if (typeof firebase === "undefined") return;
    if (!firebase.apps.length) {
      firebase.initializeApp(cfg);
    }
    const db = firebase.firestore();
    db.collection("gramg").doc("links").onSnapshot(doc => {
      if (doc.exists && doc.data().data) {
        localStorage.setItem("admin_links", JSON.stringify(doc.data().data));
        applyAdminLinks();
      }
    }, err => {
      console.warn("Firestore links sync error:", err.message);
    });
  } catch (e) {
    console.warn("Firebase listener init failed:", e.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("VB G-RAM-G Initialized");
  applyAdminLinks();
  initFirebaseLinksListener();
});

/* ── Service Worker (PWA) ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(r  => console.log('SW registered, scope:', r.scope))
      .catch(e => console.log('SW registration failed:', e));
  });
}

/* ── PWA Install Prompt ── */
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.style.display = 'flex';

  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome === 'accepted' ? 'Install accepted' : 'Install dismissed');
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  });
});

window.addEventListener('appinstalled', () => {
  console.log('App installed');
  if (installBtn) installBtn.style.display = 'none';
});
