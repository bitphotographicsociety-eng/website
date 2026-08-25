/* ==========================================================================
   Admin panel — metadata + Drive-link management only.
   No photo upload, no photo deletion, no cloud storage here by design:
   the admin's only job is to point the website at the right Drive folder.

   NOTE ON PERSISTENCE: this demo keeps events in memory (cloned from
   js/data.js) so the panel is fully interactive without a backend. Wire
   `saveEvent()` / `deleteEvent()` to real API calls (e.g. POST /api/events)
   to persist changes in production — everything else stays the same.
   ========================================================================== */

let adminEvents = JSON.parse(JSON.stringify(PSOC_EVENTS));
let editingId = null;

function psocAdminBoot(){
  const loggedIn = sessionStorageSafe("psoc_admin") === "1";
  if(loggedIn) showDashboard(); else showLogin();

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    // Demo-only auth. Production: real authentication (SSO / email+password
    // against a users table) with server-verified sessions.
    sessionStorageSafe("psoc_admin", "1");
    showDashboard();
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorageSafe("psoc_admin", "");
    showLogin();
  });

  document.getElementById("event-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveEvent();
  });
  document.getElementById("reset-form-btn").addEventListener("click", resetForm);
}

// sessionStorage is unavailable in some sandboxed embeds; fall back to an
// in-memory variable so the demo never throws.
let _memAuth = "";
function sessionStorageSafe(key, value){
  try{
    if(value === undefined) return sessionStorage.getItem(key);
    sessionStorage.setItem(key, value);
  } catch(e){
    if(value === undefined) return _memAuth;
    _memAuth = value;
  }
}

function showLogin(){
  document.getElementById("admin-login").style.display = "block";
  document.getElementById("admin-dashboard").style.display = "none";
}
function showDashboard(){
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin-dashboard").style.display = "block";
  populateCategoryOptions();
  renderTable();
}

function populateCategoryOptions(){
  const preset = ["Freshers","Farewell","Cultural Events","Sports Events","Fests","Workshops","Competitions","Campus Events","Society Events","Other"];
  const sel = document.getElementById("f-category");
  sel.innerHTML = preset.map(c => `<option value="${c}">${c}</option>`).join("");
}

function renderTable(){
  const tbody = document.getElementById("admin-table-body");
  const sorted = [...adminEvents].sort((a,b) => new Date(b.date) - new Date(a.date));
  tbody.innerHTML = sorted.map(ev => `
    <tr>
      <td>${ev.title}</td>
      <td>${ev.category}</td>
      <td>${psocFormatDate(ev.date)}</td>
      <td>${ev.year}</td>
      <td>${ev.photo_count ?? '—'}</td>
      <td class="${ev.published ? 'pub' : 'unpub'}">${ev.published ? 'Published' : 'Unpublished'}</td>
      <td>
        <div class="row-actions">
          <button data-act="edit" data-id="${ev.id}">Edit</button>
          <button data-act="toggle" data-id="${ev.id}">${ev.published ? 'Unpublish' : 'Publish'}</button>
          <button data-act="delete" data-id="${ev.id}" class="danger">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if(btn.dataset.act === "edit") editEvent(id);
      if(btn.dataset.act === "toggle") togglePublish(id);
      if(btn.dataset.act === "delete") deleteEvent(id);
    });
  });
}

function editEvent(id){
  const ev = adminEvents.find(e => e.id === id);
  if(!ev) return;
  editingId = id;
  document.getElementById("panel-title").textContent = "Edit event";
  document.getElementById("f-title").value = ev.title;
  document.getElementById("f-date").value = ev.date;
  document.getElementById("f-category").value = ev.category;
  document.getElementById("f-description").value = ev.description;
  document.getElementById("f-cover").value = ev.cover_image;
  document.getElementById("f-drive").value = ev.google_drive_url;
  document.getElementById("f-photographer").value = ev.photographer || "";
  document.getElementById("f-count").value = ev.photo_count || "";
  document.getElementById("f-published").checked = !!ev.published;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm(){
  editingId = null;
  document.getElementById("panel-title").textContent = "New event";
  document.getElementById("event-form").reset();
  document.getElementById("f-published").checked = true;
}

function extractFolderId(url){
  const m = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : url.trim();
}

function saveEvent(){
  const title = document.getElementById("f-title").value.trim();
  const date = document.getElementById("f-date").value;
  const driveUrl = document.getElementById("f-drive").value.trim();

  if(!title || !date || !driveUrl){
    psocToast("Title, date and Drive link are required");
    return;
  }

  const payload = {
    title,
    date,
    year: new Date(date + "T00:00:00").getFullYear(),
    category: document.getElementById("f-category").value,
    description: document.getElementById("f-description").value.trim(),
    cover_image: document.getElementById("f-cover").value.trim() || "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: driveUrl,
    drive_folder_id: extractFolderId(driveUrl),
    photographer: document.getElementById("f-photographer").value.trim(),
    photo_count: Number(document.getElementById("f-count").value) || 0,
    published: document.getElementById("f-published").checked
  };

  if(editingId){
    const idx = adminEvents.findIndex(e => e.id === editingId);
    adminEvents[idx] = { ...adminEvents[idx], ...payload };
    psocToast("Event updated");
  } else {
    payload.id = "evt-" + Date.now();
    adminEvents.unshift(payload);
    psocToast("Event created");
  }
  resetForm();
  renderTable();
}

function togglePublish(id){
  const ev = adminEvents.find(e => e.id === id);
  ev.published = !ev.published;
  renderTable();
  psocToast(ev.published ? "Album published" : "Album unpublished");
}

function deleteEvent(id){
  const ev = adminEvents.find(e => e.id === id);
  if(!confirm(`Remove "${ev.title}" from the website? This only removes the listing — nothing in Google Drive is affected.`)) return;
  adminEvents = adminEvents.filter(e => e.id !== id);
  renderTable();
  psocToast("Removed from website (Drive photos untouched)");
}
