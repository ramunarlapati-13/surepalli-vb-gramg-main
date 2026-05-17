/* ══════════════════════════════════════════
   admin.js  –  VB G-RAM-G SUREPALLI Admin
   ══════════════════════════════════════════ */

/* ── Credentials — loaded from config.js (git-ignored) ── */
const _cfg         = window.ADMIN_CONFIG || {};
const ADMIN_EMAIL    = _cfg.email    || "";
const ADMIN_PASSWORD = _cfg.password || "";

/* ══════════════════════════════════════
   FIREBASE SETUP
   Data is stored in Firestore so every
   device sees updates in real-time.
   localStorage is used as a local cache.
══════════════════════════════════════ */
let db = null;          // Firestore instance
let _fbReady = false;   // true once Firebase is initialized

const FB_COL = "gramg"; // Firestore collection name

function _isFirebaseConfigured() {
  const cfg = window.FIREBASE_CONFIG;
  return cfg && cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY";
}

function initFirebase() {
  if (!_isFirebaseConfigured()) {
    console.warn("Firebase not configured — running in local-only mode.");
    setSyncStatus("offline");
    return;
  }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }
    db = firebase.firestore();
    _fbReady = true;
    setSyncStatus("connected");
    console.log("Firebase Firestore connected ✓");
  } catch (e) {
    console.error("Firebase init failed:", e);
    setSyncStatus("error");
  }
}

/* ── Sync status pill in the topbar ── */
function setSyncStatus(state) {
  const el = document.getElementById("sync-status");
  if (!el) return;
  const map = {
    connected: { text: "☁️ Cloud connected",  cls: "status-ok"      },
    saving:    { text: "⏳ Saving…",           cls: "status-saving"  },
    saved:     { text: "✅ Cloud saved",        cls: "status-ok"      },
    offline:   { text: "💾 Local only",        cls: "status-offline" },
    error:     { text: "⚠️ Sync error",        cls: "status-error"   },
  };
  const s = map[state] || map.offline;
  el.textContent = s.text;
  el.className   = "sync-pill " + s.cls;
}

/* ── Push one document to Firestore ── */
async function cloudSave(docName, payload) {
  if (!_fbReady || !db) return;
  setSyncStatus("saving");
  try {
    await db.collection(FB_COL).doc(docName).set(payload);
    setSyncStatus("saved");
    setTimeout(() => setSyncStatus("connected"), 3000);
  } catch (e) {
    console.error("Firestore write failed:", e);
    setSyncStatus("error");
  }
}

/* ── Load all data from Firestore into localStorage ── */
async function loadFromCloud() {
  if (!_fbReady || !db) return;
  setSyncStatus("saving"); // reuse "in-progress" look while loading
  try {
    const [mDoc, wDoc, lDoc] = await Promise.all([
      db.collection(FB_COL).doc("musters").get(),
      db.collection(FB_COL).doc("workids").get(),
      db.collection(FB_COL).doc("links").get(),
    ]);
    if (mDoc.exists && mDoc.data().entries)
      localStorage.setItem("admin_musters", JSON.stringify(mDoc.data().entries));
    if (wDoc.exists && wDoc.data().list)
      localStorage.setItem("admin_workids", JSON.stringify(wDoc.data().list));
    if (lDoc.exists && lDoc.data().data)
      localStorage.setItem("admin_links",   JSON.stringify(lDoc.data().data));
    setSyncStatus("connected");
  } catch (e) {
    console.error("Firestore read failed:", e);
    setSyncStatus("error");
  }
}

/* ══════════════════════════════════════
   DEFAULT BUTTON LINKS
══════════════════════════════════════ */
const DEFAULT_LINKS = [
  { id:"po-login",         icon:"🔐", label:"PO Login",            sublabel:"Official Access",    url:"https://nregade1.dord.gov.in/netnrega/Login.aspx?&level=HomePO&state_code=02" },
  { id:"nmms-attendance",  icon:"📅", label:"NMMS Attendance",      sublabel:"View Reports",       url:"https://mnregaweb4.nic.in/nregaarch/View_NMMS_atten_date_new.aspx?fin_year=2024-2025&Digest=HNrisV4bhHnb7Gve3mAKYQ" },
  { id:"jobcards",         icon:"🆔", label:"JOBCARDS",             sublabel:"View Details",       url:"https://nregastrep.nic.in/netnrega/loginframegp.aspx?salogin=Y&state_code=02" },
  { id:"work-details",     icon:"🏗️", label:"Work Details",         sublabel:"Project Info",       url:"https://nreganarep.nic.in/netnrega/dynamic_work_details.aspx?page=S&lflag=eng&state_name=ANDHRA%20PRADESH&state_code=02&fin_year=2025-2026&source=national&Digest=UuTq5reEYK2ZLiaTDfDuQA" },
  { id:"employment-days",  icon:"👷", label:"Employment Days",      sublabel:"Days Report",        url:"https://mnregaweb2.dord.gov.in/netnrega/state_html/empspecifydays.aspx?page=P&lflag=eng&state_name=ANDHRA+PRADESH&state_code=02&district_name=ELURU&district_code=0217" },
  { id:"100-days",         icon:"💯", label:"100 Days Completed",   sublabel:"Completion Report",  url:"https://mnregaweb2.dord.gov.in/netnrega/state_html/more100day.aspx?page=B&lflag=eng&state_name=ANDHRA+PRADESH&state_code=02&district_name=ELURU&district_code=0217" },
  { id:"at-a-glance",      icon:"📊", label:"At a Glance",          sublabel:"Stats",              url:"https://nreganarep.nic.in/netnrega/nrega_ataglance/At_a_glance.aspx" },
  { id:"state-reports",    icon:"🏛️", label:"State Reports",        sublabel:"AP Reports",         url:"https://mnregaweb2.dord.gov.in/netnrega/Homedist.aspx?flag_debited=&is_statefund=&lflag=eng&district_code=0217&district_name=ELURU&state_name=ANDHRA%20PRADESH&state_Code=02" },
  { id:"bhuvan-mgnrega",   icon:"🌍", label:"Bhuvan Mgnrega",       sublabel:"Geo-Reports",        url:"https://bhuvan-app2.nrsc.gov.in/mgnrega/mgnrega_phase2.php#" },
  { id:"emms-reports",     icon:"📑", label:"EMMS Reports",         sublabel:"AP Gov",             url:"https://emms.ap.gov.in/nregs_ap/Reports/#" },
  { id:"nregs-apps",       icon:"📱", label:"NREGS Apps",           sublabel:"Download",           url:"https://emms.ap.gov.in/apps/NregsApps.htm##" },
  { id:"musters-database", icon:"🗂️", label:"Musters Database",     sublabel:"FAB Button Link",    url:"https://drive.google.com/drive/folders/15o6EspLO4MdsZfGHxMTFxO1Zlgkavf7f?usp=sharing" },
];

/* ══════════════════════════════════════
   LOCAL CACHE HELPERS
   (always sync to Firestore after writing)
══════════════════════════════════════ */
function getLinks() {
  const raw = localStorage.getItem("admin_links");
  return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_LINKS));
}
function saveLinks(arr) {
  localStorage.setItem("admin_links", JSON.stringify(arr));
  cloudSave("links", { data: arr });
}

function getWorkIds() {
  const raw = localStorage.getItem("admin_workids");
  return raw ? JSON.parse(raw) : [];
}
function saveWorkIds(arr) {
  localStorage.setItem("admin_workids", JSON.stringify(arr));
  cloudSave("workids", { list: arr });
}

function getMusterEntries() {
  const raw = localStorage.getItem("admin_musters");
  return raw ? JSON.parse(raw) : [];
}
function saveMusterEntries(arr) {
  localStorage.setItem("admin_musters", JSON.stringify(arr));
  cloudSave("musters", { entries: arr });
}

/* ── Toast ── */
function showToast(msg = "✅ Saved!") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

/* ══════════════════════════════════════
   AUTH
══════════════════════════════════════ */
function isAdminLoggedIn() {
  return sessionStorage.getItem("admin_auth") === "true";
}
function loginAdmin()  { sessionStorage.setItem("admin_auth", "true"); }
function logoutAdmin() { sessionStorage.removeItem("admin_auth"); }

const loginScreen    = document.getElementById("login-screen");
const adminDashboard = document.getElementById("admin-dashboard");
const loginBtn       = document.getElementById("login-btn");
const loginError     = document.getElementById("login-error");
const logoutBtn      = document.getElementById("logout-btn");

/* showDashboard: loads cloud data first, then renders UI */
async function showDashboard() {
  loginScreen.style.display    = "none";
  adminDashboard.style.display = "block";
  await loadFromCloud();    // pull latest from Firestore into localStorage
  renderLinkEditor();
  renderWorkIdChips();
  renderMusterTable();
}
function showLogin() {
  loginScreen.style.display    = "flex";
  adminDashboard.style.display = "none";
}

/* ── Init ── */
initFirebase();   // must run before any UI so status pill is set

if (isAdminLoggedIn()) {
  showDashboard();
} else {
  showLogin();
}

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("admin-email").value.trim();
  const pass  = document.getElementById("admin-password").value;
  if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
    loginAdmin();
    loginError.classList.remove("show");
    showDashboard();
  } else {
    loginError.classList.add("show");
    document.getElementById("admin-password").value = "";
  }
});

document.getElementById("admin-email").addEventListener("keypress",    e => { if (e.key === "Enter") loginBtn.click(); });
document.getElementById("admin-password").addEventListener("keypress", e => { if (e.key === "Enter") loginBtn.click(); });

logoutBtn.addEventListener("click", () => { logoutAdmin(); showLogin(); });

/* ══════════════════════════════════════
   TABS
══════════════════════════════════════ */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

/* ══════════════════════════════════════
   LINK EDITOR
══════════════════════════════════════ */
function renderLinkEditor() {
  const links = getLinks();
  const list  = document.getElementById("link-editor-list");
  list.innerHTML = "";
  links.forEach((link, i) => {
    const item = document.createElement("div");
    item.className = "link-editor-item";
    item.innerHTML = `
      <div class="item-icon">${link.icon}</div>
      <div class="item-fields">
        <label>Button Label</label>
        <input type="text" value="${escapeHtml(link.label)}" data-idx="${i}" data-field="label" placeholder="Label">
        <label style="margin-top:0.4rem;">URL</label>
        <input type="url" value="${escapeHtml(link.url)}" data-idx="${i}" data-field="url" placeholder="https://...">
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem;">
        <button class="save-link-btn" data-idx="${i}">Save</button>
        <span class="saved-badge" id="saved-${i}">✓ Saved</span>
      </div>
    `;
    list.appendChild(item);
  });

  /* Per-row save */
  list.querySelectorAll(".save-link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx    = parseInt(btn.dataset.idx);
      const links2 = getLinks();
      const inputs = list.querySelectorAll(`[data-idx="${idx}"]`);
      inputs.forEach(inp => { links2[idx][inp.dataset.field] = inp.value.trim(); });
      saveLinks(links2);   // saves to localStorage + Firestore
      const badge = document.getElementById(`saved-${idx}`);
      badge.style.display = "block";
      setTimeout(() => badge.style.display = "none", 2000);
      showToast("✅ Link saved!");
    });
  });
}

document.getElementById("save-all-btn").addEventListener("click", () => {
  const links = getLinks();
  document.querySelectorAll("[data-idx]").forEach(inp => {
    const idx = parseInt(inp.dataset.idx);
    links[idx][inp.dataset.field] = inp.value.trim();
  });
  saveLinks(links);   // saves to localStorage + Firestore
  showToast("✅ All links saved!");
});

document.getElementById("reset-all-btn").addEventListener("click", () => {
  if (!confirm("Reset all links to defaults? This cannot be undone.")) return;
  localStorage.removeItem("admin_links");
  cloudSave("links", { data: JSON.parse(JSON.stringify(DEFAULT_LINKS)) });
  renderLinkEditor();
  showToast("↺ Links reset to defaults");
});

/* ══════════════════════════════════════
   WORK ID CHIPS
══════════════════════════════════════ */
function renderWorkIdChips() {
  const workIds = getWorkIds();
  const chips   = document.getElementById("workid-chips");
  const sel     = document.getElementById("m-workid");

  chips.innerHTML = "";
  sel.innerHTML   = `<option value="">-- Select Work ID --</option>`;

  workIds.forEach((w, i) => {
    const chip = document.createElement("div");
    chip.className = "workid-chip";
    chip.innerHTML = `<span>${escapeHtml(w)}</span><button data-i="${i}" title="Remove">✕</button>`;
    chip.querySelector("button").addEventListener("click", () => {
      const arr = getWorkIds();
      arr.splice(i, 1);
      saveWorkIds(arr);   // saves to localStorage + Firestore
      renderWorkIdChips();
      showToast("🗑️ Work ID removed");
    });
    chips.appendChild(chip);

    const opt = document.createElement("option");
    opt.value = w; opt.textContent = w;
    sel.appendChild(opt);
  });

  if (workIds.length === 0) {
    chips.innerHTML = `<span style="color:rgba(255,255,255,0.25);font-size:0.8rem;">No Work IDs added yet.</span>`;
  }
}

document.getElementById("add-workid-btn").addEventListener("click", () => {
  const inp = document.getElementById("new-workid-label");
  const val = inp.value.trim();
  if (!val) { inp.focus(); return; }
  const arr = getWorkIds();
  if (arr.includes(val)) { showToast("⚠️ Work ID already exists"); return; }
  arr.push(val);
  saveWorkIds(arr);   // saves to localStorage + Firestore
  inp.value = "";
  renderWorkIdChips();
  showToast("✅ Work ID added!");
});
document.getElementById("new-workid-label").addEventListener("keypress", e => {
  if (e.key === "Enter") document.getElementById("add-workid-btn").click();
});

/* ══════════════════════════════════════
   MUSTER TABLE
══════════════════════════════════════ */
function renderMusterTable() {
  const entries = getMusterEntries();
  const tbody   = document.getElementById("muster-tbody");
  const empty   = document.getElementById("muster-empty");
  tbody.innerHTML = "";
  if (entries.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  entries.forEach((e, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${escapeHtml(e.group)}</td>
      <td><span class="badge-workid">${escapeHtml(e.workId)}</span></td>
      <td>${escapeHtml(e.musterId)}</td>
      <td><button class="delete-row" data-i="${i}" title="Delete">🗑️</button></td>
    `;
    tr.querySelector(".delete-row").addEventListener("click", () => {
      if (!confirm("Delete this entry?")) return;
      const arr = getMusterEntries();
      arr.splice(i, 1);
      saveMusterEntries(arr);   // saves to localStorage + Firestore
      renderMusterTable();
      showToast("🗑️ Entry deleted");
    });
    tbody.appendChild(tr);
  });
}

document.getElementById("add-muster-btn").addEventListener("click", () => {
  const group    = document.getElementById("m-group").value.trim();
  const workId   = document.getElementById("m-workid").value;
  const musterId = document.getElementById("m-musterid").value.trim();
  if (!group || !workId || !musterId) {
    showToast("⚠️ Fill all three fields");
    return;
  }
  const arr = getMusterEntries();
  arr.push({ group, workId, musterId });
  saveMusterEntries(arr);   // saves to localStorage + Firestore
  document.getElementById("m-group").value    = "";
  document.getElementById("m-musterid").value = "";
  document.getElementById("m-workid").value   = "";
  renderMusterTable();
  showToast("✅ Entry added!");
});

/* ══════════════════════════════════════
   UTILITY
══════════════════════════════════════ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
