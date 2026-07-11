/* ══════════════════════════════════════════
   admin.js  –  VB G-RAM-G SUREPALLI Admin
   Auth: Firebase Email/Password (production)
   ══════════════════════════════════════════ */

/* ── Allowed admin accounts ── */
const ALLOWED_EMAILS = [
  'ramunarlapati27@gmail.com',
  'bandilasuresh440@gmail.com'
];

/* ══════════════════════════════════════
   FIREBASE SETUP
   Firestore for data storage.
   Firebase Auth for admin login.
   localStorage is used as a local cache.
══════════════════════════════════════ */
let db       = null;
let auth     = null;
let _fbReady = false;

const FB_COL = "gramg";

function _isFirebaseConfigured() {
  const cfg = window.FIREBASE_CONFIG;
  return cfg && cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY";
}

function initFirebase() {
  if (!_isFirebaseConfigured()) {
    console.warn("Firebase not configured — no credentials found.");
    setSyncStatus("offline");
    showLogin();
    return;
  }

  /* ── Step 1: Initialise the Firebase app ── */
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }
  } catch (e) {
    console.error("Firebase app init failed:", e);
    setSyncStatus("error");
    showLogin();
    return;
  }

  /* ── Step 2: Initialise Firestore ── */
  try {
    db = firebase.firestore();
    _fbReady = true;
    setSyncStatus("connected");
  } catch (e) {
    console.error("Firestore init failed:", e);
    setSyncStatus("error");
  }

  /* ── Step 3: Initialise Auth ── */
  if (typeof firebase.auth !== "function") {
    /* Auth SDK script didn't load — most likely a network issue */
    console.error("Firebase Auth SDK not loaded. Check network/CDN.");
    setSyncStatus("error");
    showLogin();
    return;
  }

  try {
    auth = firebase.auth();
  } catch (e) {
    console.error("Firebase Auth init failed:", e);
    setSyncStatus("error");
    showLogin();
    return;
  }

  /* ── Step 4: Listen for auth state changes ── */
  auth.onAuthStateChanged(async (user) => {
    if (user && ALLOWED_EMAILS.includes(user.email)) {
      loginError.classList.remove("show");
      await showDashboard();
    } else {
      if (user) {
        await auth.signOut();
        showLogin("Access denied. Your account is not authorised.");
      } else {
        showLogin();
      }
    }
  });
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
    console.error("Firestore write failed:", e.code, e.message);
    setSyncStatus("error");
    if (e.code === "permission-denied") {
      showToast("🔒 Firestore permission denied — deploy rules first");
    } else if (e.code === "not-found") {
      showToast("⚠️ Firestore database not found — create it in Firebase Console");
    } else {
      showToast("⚠️ Sync error: " + (e.code || e.message));
    }
  }
}

/* ── Load all data from Firestore into localStorage ── */
async function loadFromCloud() {
  if (!_fbReady || !db) return;
  setSyncStatus("saving");
  try {
    const [mDoc, wDoc, lDoc, dDoc] = await Promise.all([
      db.collection(FB_COL).doc("musters").get(),
      db.collection(FB_COL).doc("workids").get(),
      db.collection(FB_COL).doc("links").get(),
      db.collection(FB_COL).doc("dateranges").get(),
    ]);
    if (mDoc.exists && mDoc.data().entries)
      localStorage.setItem("admin_musters",     JSON.stringify(mDoc.data().entries));
    if (wDoc.exists && wDoc.data().list)
      localStorage.setItem("admin_workids",     JSON.stringify(wDoc.data().list));
    if (lDoc.exists && lDoc.data().data)
      localStorage.setItem("admin_links",       JSON.stringify(lDoc.data().data));
    if (dDoc.exists && dDoc.data().list)
      localStorage.setItem("admin_dateranges",  JSON.stringify(dDoc.data().list));
    setSyncStatus("connected");
  } catch (e) {
    console.error("Firestore read failed:", e.code, e.message);
    setSyncStatus("error");
    if (e.code === "permission-denied") {
      showToast("🔒 Firestore read denied — deploy rules to allow public reads");
    } else if (e.code === "not-found") {
      showToast("⚠️ Firestore database not found — create it in Firebase Console");
    } else {
      showToast("⚠️ Cloud load error: " + (e.code || e.message));
    }
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
  { id:"mis-reports",      icon:"📋", label:"MIS Reports",          sublabel:"View Reports",       url:"https://vbgramgrep.dord.gov.in/VBGRAMG/MISreport.aspx" },
];

/* ══════════════════════════════════════
   LOCAL CACHE HELPERS
   (always sync to Firestore after writing)
══════════════════════════════════════ */
function getLinks() {
  const raw = localStorage.getItem("admin_links");
  if (!raw) return JSON.parse(JSON.stringify(DEFAULT_LINKS));
  try {
    const parsed = JSON.parse(raw);
    const merged = JSON.parse(JSON.stringify(DEFAULT_LINKS));
    merged.forEach(m => {
      const existing = parsed.find(p => p.id === m.id);
      if (existing) {
        if (existing.url !== undefined) m.url = existing.url;
        if (existing.label !== undefined) m.label = existing.label;
        if (existing.sublabel !== undefined) m.sublabel = existing.sublabel;
        if (existing.icon !== undefined) m.icon = existing.icon;
      }
    });
    return merged;
  } catch (e) {
    console.error("Failed to parse cached links:", e);
    return JSON.parse(JSON.stringify(DEFAULT_LINKS));
  }
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

function getDateRanges() {
  const raw = localStorage.getItem("admin_dateranges");
  return raw ? JSON.parse(raw) : [];
}
function saveDateRanges(arr) {
  localStorage.setItem("admin_dateranges", JSON.stringify(arr));
  cloudSave("dateranges", { list: arr });
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
   UI: LOGIN / DASHBOARD
══════════════════════════════════════ */
const loginScreen    = document.getElementById("login-screen");
const adminDashboard = document.getElementById("admin-dashboard");
const loginBtn       = document.getElementById("login-btn");
const loginError     = document.getElementById("login-error");
const logoutBtn      = document.getElementById("logout-btn");

/* ── Google Sign-In button ── */
const GOOGLE_BTN_LABEL = `<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width:20px;height:20px;"> Sign in with Google`;

function showLogin(errorMsg = "") {
  loginScreen.style.display    = "flex";
  adminDashboard.style.display = "none";
  loginBtn.disabled    = false;
  loginBtn.innerHTML   = GOOGLE_BTN_LABEL;
  if (errorMsg) {
    loginError.textContent = "❌ " + errorMsg;
    loginError.classList.add("show");
  } else {
    loginError.classList.remove("show");
  }
}

async function showDashboard() {
  loginScreen.style.display    = "none";
  adminDashboard.style.display = "block";
  await loadFromCloud();
  renderLinkEditor();
  renderWorkIdChips();
  renderDateRangeChips();
  renderMusterTable();
}

/* ── Initialise Firebase ── */
initFirebase();

/* ── Login button: Google Sign-In popup ── */
loginBtn.addEventListener("click", async () => {
  if (!auth) {
    loginError.textContent = "❌ Firebase Auth not ready. Reload the page.";
    loginError.classList.add("show");
    return;
  }

  loginBtn.disabled  = true;
  loginBtn.innerHTML = "<span style='opacity:0.6'>Signing in…</span>";
  loginError.classList.remove("show");

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    /* onAuthStateChanged handles dashboard/deny from here */
  } catch (e) {
    let msg;
    switch (e.code) {
      case "auth/popup-closed-by-user":    msg = "Sign-in cancelled."; break;
      case "auth/popup-blocked":           msg = "Pop-up blocked. Allow pop-ups for this page and try again."; break;
      case "auth/network-request-failed":  msg = "Network error. Check your connection."; break;
      default:                             msg = "Sign-in failed (" + (e.code || e.message) + ")."; break;
    }
    loginError.textContent = "❌ " + msg;
    loginError.classList.add("show");
    loginBtn.disabled  = false;
    loginBtn.innerHTML = GOOGLE_BTN_LABEL;
  }
});

logoutBtn.addEventListener("click", async () => {
  if (auth) await auth.signOut();
  /* onAuthStateChanged handles showLogin() */
});

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

  list.querySelectorAll(".save-link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx    = parseInt(btn.dataset.idx);
      const links2 = getLinks();
      const inputs = list.querySelectorAll(`[data-idx="${idx}"]`);
      inputs.forEach(inp => { links2[idx][inp.dataset.field] = inp.value.trim(); });
      saveLinks(links2);
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
  saveLinks(links);
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
      saveWorkIds(arr);
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
  saveWorkIds(arr);
  inp.value = "";
  renderWorkIdChips();
  showToast("✅ Work ID added!");
});
document.getElementById("new-workid-label").addEventListener("keypress", e => {
  if (e.key === "Enter") document.getElementById("add-workid-btn").click();
});

/* ══════════════════════════════════════
   DATE RANGE CHIPS
══════════════════════════════════════ */
function renderDateRangeChips() {
  const ranges = getDateRanges();
  const chips  = document.getElementById("daterange-chips");
  const sel    = document.getElementById("m-daterange");

  chips.innerHTML = "";
  sel.innerHTML   = `<option value="">-- Select Date Range --</option>`;

  ranges.forEach((r, i) => {
    const chip = document.createElement("div");
    chip.className = "workid-chip";
    chip.innerHTML = `<span>${escapeHtml(r)}</span><button data-i="${i}" title="Remove">✕</button>`;
    chip.querySelector("button").addEventListener("click", () => {
      const arr = getDateRanges();
      arr.splice(i, 1);
      saveDateRanges(arr);
      renderDateRangeChips();
      showToast("🗑️ Date range removed");
    });
    chips.appendChild(chip);

    const opt = document.createElement("option");
    opt.value = r; opt.textContent = r;
    sel.appendChild(opt);
  });

  if (ranges.length === 0) {
    chips.innerHTML = `<span style="color:rgba(255,255,255,0.25);font-size:0.8rem;">No date ranges added yet.</span>`;
  }
}

document.getElementById("add-daterange-btn").addEventListener("click", () => {
  const inp = document.getElementById("new-daterange-label");
  const val = inp.value.trim();
  if (!val) { inp.focus(); return; }
  const arr = getDateRanges();
  if (arr.includes(val)) { showToast("⚠️ Date range already exists"); return; }
  arr.push(val);
  saveDateRanges(arr);
  inp.value = "";
  renderDateRangeChips();
  showToast("✅ Date range added!");
});
document.getElementById("new-daterange-label").addEventListener("keypress", e => {
  if (e.key === "Enter") document.getElementById("add-daterange-btn").click();
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
      <td><span style="font-size:0.78rem;color:rgba(0,210,211,0.8);">${escapeHtml(e.dateRange || '—')}</span></td>
      <td>${escapeHtml(e.group)}</td>
      <td><span class="badge-workid">${escapeHtml(e.workId)}</span></td>
      <td>${escapeHtml(e.musterId)}</td>
      <td><button class="delete-row" data-i="${i}" title="Delete">🗑️</button></td>
    `;
    tr.querySelector(".delete-row").addEventListener("click", () => {
      if (!confirm("Delete this entry?")) return;
      const arr = getMusterEntries();
      arr.splice(i, 1);
      saveMusterEntries(arr);
      renderMusterTable();
      showToast("🗑️ Entry deleted");
    });
    tbody.appendChild(tr);
  });
}

document.getElementById("add-muster-btn").addEventListener("click", () => {
  const dateRange = document.getElementById("m-daterange").value;
  const groupRaw  = document.getElementById("m-group").value.trim();
  const workId    = document.getElementById("m-workid").value;
  const musterRaw = document.getElementById("m-musterid").value.trim();

  if (!dateRange || !groupRaw || !workId || !musterRaw) {
    showToast("⚠️ Fill all four fields");
    return;
  }

  /* ── Split comma-separated values ── */
  const groups  = groupRaw.split(",").map(s => s.trim()).filter(Boolean);
  const musters = musterRaw.split(",").map(s => s.trim()).filter(Boolean);

  if (groups.length !== musters.length) {
    showToast(`⚠️ Mismatch: ${groups.length} group(s) vs ${musters.length} muster ID(s)`);
    return;
  }

  const arr = getMusterEntries();
  groups.forEach((group, i) => {
    arr.push({ dateRange, group, workId, musterId: musters[i] });
  });
  saveMusterEntries(arr);

  document.getElementById("m-daterange").value = "";
  document.getElementById("m-group").value     = "";
  document.getElementById("m-musterid").value  = "";
  document.getElementById("m-workid").value    = "";
  renderMusterTable();

  const count = groups.length;
  showToast(`✅ ${count} ${count === 1 ? "entry" : "entries"} added!`);
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
