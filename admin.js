/* ══════════════════════════════════════════
   admin.js  –  VB G-RAM-G SUREPALLI Admin
   ══════════════════════════════════════════ */

/* ── Credentials — loaded from config.js (git-ignored) ── */
const _cfg         = window.ADMIN_CONFIG || {};
const ADMIN_EMAIL    = _cfg.email    || "";
const ADMIN_PASSWORD = _cfg.password || "";

/* ── Default button links ── */
const DEFAULT_LINKS = [
  {
    id: "po-login",
    icon: "🔐",
    label: "PO Login",
    sublabel: "Official Access",
    url: "https://nregade1.dord.gov.in/netnrega/Login.aspx?&level=HomePO&state_code=02"
  },
  {
    id: "nmms-attendance",
    icon: "📅",
    label: "NMMS Attendance",
    sublabel: "View Reports",
    url: "https://mnregaweb4.nic.in/nregaarch/View_NMMS_atten_date_new.aspx?fin_year=2024-2025&Digest=HNrisV4bhHnb7Gve3mAKYQ"
  },
  {
    id: "jobcards",
    icon: "🆔",
    label: "JOBCARDS",
    sublabel: "View Details",
    url: "https://nregastrep.nic.in/netnrega/loginframegp.aspx?salogin=Y&state_code=02"
  },
  {
    id: "work-details",
    icon: "🏗️",
    label: "Work Details",
    sublabel: "Project Info",
    url: "https://nreganarep.nic.in/netnrega/dynamic_work_details.aspx?page=S&lflag=eng&state_name=ANDHRA%20PRADESH&state_code=02&fin_year=2025-2026&source=national&Digest=UuTq5reEYK2ZLiaTDfDuQA"
  },
  {
    id: "employment-days",
    icon: "👷",
    label: "Employment Days",
    sublabel: "Days Report",
    url: "https://mnregaweb2.dord.gov.in/netnrega/state_html/empspecifydays.aspx?page=P&lflag=eng&state_name=ANDHRA+PRADESH&state_code=02&district_name=ELURU&district_code=0217"
  },
  {
    id: "100-days",
    icon: "💯",
    label: "100 Days Completed",
    sublabel: "Completion Report",
    url: "https://mnregaweb2.dord.gov.in/netnrega/state_html/more100day.aspx?page=B&lflag=eng&state_name=ANDHRA+PRADESH&state_code=02&district_name=ELURU&district_code=0217"
  },
  {
    id: "at-a-glance",
    icon: "📊",
    label: "At a Glance",
    sublabel: "Stats",
    url: "https://nreganarep.nic.in/netnrega/nrega_ataglance/At_a_glance.aspx"
  },
  {
    id: "state-reports",
    icon: "🏛️",
    label: "State Reports",
    sublabel: "AP Reports",
    url: "https://mnregaweb2.dord.gov.in/netnrega/Homedist.aspx?flag_debited=&is_statefund=&lflag=eng&district_code=0217&district_name=ELURU&state_name=ANDHRA%20PRADESH&state_Code=02"
  },
  {
    id: "bhuvan-mgnrega",
    icon: "🌍",
    label: "Bhuvan Mgnrega",
    sublabel: "Geo-Reports",
    url: "https://bhuvan-app2.nrsc.gov.in/mgnrega/mgnrega_phase2.php#"
  },
  {
    id: "emms-reports",
    icon: "📑",
    label: "EMMS Reports",
    sublabel: "AP Gov",
    url: "https://emms.ap.gov.in/nregs_ap/Reports/#"
  },
  {
    id: "nregs-apps",
    icon: "📱",
    label: "NREGS Apps",
    sublabel: "Download",
    url: "https://emms.ap.gov.in/apps/NregsApps.htm##"
  },
  {
    id: "musters-database",
    icon: "🗂️",
    label: "Musters Database",
    sublabel: "FAB Button Link",
    url: "https://drive.google.com/drive/folders/15o6EspLO4MdsZfGHxMTFxO1Zlgkavf7f?usp=sharing"
  }
];

/* ── Helpers ── */
function getLinks() {
  const raw = localStorage.getItem("admin_links");
  return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_LINKS));
}
function saveLinks(arr) { localStorage.setItem("admin_links", JSON.stringify(arr)); }
function getWorkIds() {
  const raw = localStorage.getItem("admin_workids");
  return raw ? JSON.parse(raw) : [];
}
function saveWorkIds(arr) { localStorage.setItem("admin_workids", JSON.stringify(arr)); }
function getMusterEntries() {
  const raw = localStorage.getItem("admin_musters");
  return raw ? JSON.parse(raw) : [];
}
function saveMusterEntries(arr) { localStorage.setItem("admin_musters", JSON.stringify(arr)); }

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
function loginAdmin() {
  sessionStorage.setItem("admin_auth", "true");
}
function logoutAdmin() {
  sessionStorage.removeItem("admin_auth");
}

const loginScreen    = document.getElementById("login-screen");
const adminDashboard = document.getElementById("admin-dashboard");
const loginBtn       = document.getElementById("login-btn");
const loginError     = document.getElementById("login-error");
const logoutBtn      = document.getElementById("logout-btn");

function showDashboard() {
  loginScreen.style.display    = "none";
  adminDashboard.style.display = "block";
  renderLinkEditor();
  renderWorkIdChips();
  renderMusterTable();
}
function showLogin() {
  loginScreen.style.display    = "flex";
  adminDashboard.style.display = "none";
}

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

document.getElementById("admin-email").addEventListener("keypress", e => { if (e.key === "Enter") loginBtn.click(); });
document.getElementById("admin-password").addEventListener("keypress", e => { if (e.key === "Enter") loginBtn.click(); });

logoutBtn.addEventListener("click", () => {
  logoutAdmin();
  showLogin();
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

  /* Per-row save */
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
  // rebuild select
  sel.innerHTML = `<option value="">-- Select Work ID --</option>`;
  workIds.forEach((w, i) => {
    // chip
    const chip = document.createElement("div");
    chip.className = "workid-chip";
    chip.innerHTML = `<span>${escapeHtml(w)}</span><button data-i="${i}" title="Remove">✕</button>`;
    chip.querySelector("button").addEventListener("click", () => {
      const arr = getWorkIds();
      arr.splice(i, 1);
      saveWorkIds(arr);
      renderWorkIdChips();
    });
    chips.appendChild(chip);
    // option
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
      saveMusterEntries(arr);
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
  saveMusterEntries(arr);
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
