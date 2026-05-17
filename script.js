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
  "musters-database": 11,
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
  { id:"musters-database", url:"https://drive.google.com/drive/folders/15o6EspLO4MdsZfGHxMTFxO1Zlgkavf7f?usp=sharing" },
];

/* ── Apply admin-saved links to every <a> card on the page ── */
function applyAdminLinks() {
  const raw   = localStorage.getItem("admin_links");
  const links = raw ? JSON.parse(raw) : DEFAULT_LINKS;

  // The nav cards are plain <a> tags — select them by their href pattern
  // We match cards using querySelectorAll on the nav and patch by index order
  const navCards = document.querySelectorAll('nav.grid-layout a.card, nav.grid-layout .button-group a.card');

  // Build a quick id→url map
  const urlMap = {};
  links.forEach(l => { urlMap[l.id] = l.url; });

  // Patch each card: match via partial href or data attribute
  navCards.forEach(card => {
    const href = card.getAttribute("href") || "";
    // Find which default link this card corresponds to by partial URL match
    const match = DEFAULT_LINKS.find(dl => href.includes(dl.url.slice(8, 40)));
    if (match && urlMap[match.id]) {
      card.setAttribute("href", urlMap[match.id]);
    }
  });

  // Patch FAB musters link (used in click handler below)
  if (urlMap["musters-database"]) {
    window._MUSTERS_LINK = urlMap["musters-database"];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("VB G-RAM-G Initialized");
  applyAdminLinks();
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

/* ── Auth Modal (Musters FAB button) ── */
const mustersBtn    = document.getElementById('musters-btn');
const authModal     = document.getElementById('auth-modal');
const closeAuthModal = document.getElementById('close-auth-modal');
const pinInput      = document.getElementById('pin-input');
const verifyPinBtn  = document.getElementById('verify-pin-btn');
const googleLoginBtn = document.getElementById('google-login-btn');

const CORRECT_PIN = "1157";

function getMustersFabLink() {
  // Use admin-saved URL if available, else fallback default
  if (window._MUSTERS_LINK) return window._MUSTERS_LINK;
  const raw   = localStorage.getItem("admin_links");
  const links = raw ? JSON.parse(raw) : null;
  if (links) {
    const entry = links.find(l => l.id === "musters-database");
    if (entry) return entry.url;
  }
  return "https://drive.google.com/drive/folders/15o6EspLO4MdsZfGHxMTFxO1Zlgkavf7f?usp=sharing";
}

function isAuthorized() {
  return localStorage.getItem('musters_authorized') === 'true';
}

if (mustersBtn) {
  mustersBtn.addEventListener('click', () => {
    if (isAuthorized()) {
      window.open(getMustersFabLink(), '_blank');
    } else {
      authModal.classList.add('active');
      pinInput.focus();
    }
  });
}

if (closeAuthModal) {
  closeAuthModal.addEventListener('click', () => {
    authModal.classList.remove('active');
    pinInput.value = '';
  });
}

if (verifyPinBtn) {
  verifyPinBtn.addEventListener('click', () => {
    if (pinInput.value === CORRECT_PIN) {
      localStorage.setItem('musters_authorized', 'true');
      authModal.classList.remove('active');
      window.open(getMustersFabLink(), '_blank');
    } else {
      alert('Incorrect PIN. Please try again.');
      pinInput.value = '';
      pinInput.focus();
    }
  });
}

if (pinInput) {
  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyPinBtn.click();
  });
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', () => {
    alert('Google Login will be available soon. Please use the PIN for now.');
  });
}
