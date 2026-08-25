/* ==========================================================================
   Event gallery — grid, selection, download, lightbox viewer.
   Backed entirely by js/drive-api.js. This file never talks to Drive
   directly so it works identically in demo and live mode.
   ========================================================================== */

const PsocGallery = (() => {
  let files = [];
  let selected = new Set();
  let viewerIndex = -1;
  let event = null;

  function init(evt){
    event = evt;
    const grid = document.getElementById("photo-grid");
    grid.innerHTML = `<div class="empty-note" style="grid-column:1/-1;">Loading photographs from Google Drive…</div>`;

    driveListFiles(evt.drive_folder_id)
      .then(list => {
        files = list;
        if(!files.length){
          grid.innerHTML = `<div class="empty-note" style="grid-column:1/-1;">No photographs found in this album's Drive folder yet.</div>`;
          updateToolbar();
          return;
        }
        renderGrid();
        updateToolbar();
      })
      .catch(err => {
        grid.innerHTML = `<div class="empty-note" style="grid-column:1/-1;">
          Couldn't load this album right now.<br>${err.message}<br><br>
          <a class="btn btn-ghost btn-sm" href="${event.google_drive_url}" target="_blank" rel="noopener">Open the Drive folder directly →</a>
        </div>`;
      });

    bindToolbar();
    bindViewer();
  }

  function renderGrid(){
    const grid = document.getElementById("photo-grid");
    grid.innerHTML = files.map((f, i) => `
      <div class="photo-cell ${selected.has(f.id)?'selected':''}" data-id="${f.id}" data-index="${i}">
        <img src="${f.thumbnailUrl}" alt="${event.title} — photograph ${i+1}" loading="lazy">
        <span class="num-tag">${String(i+1).padStart(3,'0')}</span>
        <span class="select-box" data-role="select">${ICONS.check}</span>
      </div>
    `).join("");

    grid.querySelectorAll(".photo-cell").forEach(cell => {
      const id = cell.dataset.id;
      cell.querySelector('[data-role="select"]').addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSelect(id, cell);
      });
      cell.addEventListener("click", () => openViewer(Number(cell.dataset.index)));
    });
  }

  function toggleSelect(id, cell){
    if(selected.has(id)){ selected.delete(id); cell.classList.remove("selected"); }
    else { selected.add(id); cell.classList.add("selected"); }
    updateToolbar();
  }

  function selectAll(){
    files.forEach(f => selected.add(f.id));
    document.querySelectorAll(".photo-cell").forEach(c => c.classList.add("selected"));
    updateToolbar();
  }
  function deselectAll(){
    selected.clear();
    document.querySelectorAll(".photo-cell").forEach(c => c.classList.remove("selected"));
    updateToolbar();
  }

  function updateToolbar(){
    const status = document.getElementById("select-status");
    const dlSelected = document.getElementById("btn-download-selected");
    const selectAllBtn = document.getElementById("btn-select-all");
    const n = selected.size;
    if(n === 0){
      status.innerHTML = files.length ? `<b>${files.length}</b> photos in this album` : "";
    } else if(n === files.length){
      status.innerHTML = `<b>All ${n}</b> photos selected`;
    } else {
      status.innerHTML = `<b>${n}</b> photo${n===1?'':'s'} selected`;
    }
    dlSelected.disabled = n === 0;
    selectAllBtn.textContent = (n === files.length && n > 0) ? "Deselect all" : "Select all";
  }

  function bindToolbar(){
    document.getElementById("btn-select-all").addEventListener("click", () => {
      if(selected.size === files.length && files.length > 0) deselectAll();
      else selectAll();
    });

    document.getElementById("btn-download-selected").addEventListener("click", async () => {
      const chosen = files.filter(f => selected.has(f.id));
      if(!chosen.length) return;
      await runZipDownload(chosen, `${event.title.replace(/\s+/g,'_')}_selected`);
    });

    document.getElementById("btn-download-all").addEventListener("click", async () => {
      if(!files.length) return;
      await runZipDownload(files, `${event.title.replace(/\s+/g,'_')}_full_album`);
    });
  }

  async function runZipDownload(list, name){
    psocToast(`Preparing ${list.length} photo${list.length===1?'':'s'}…`);
    try{
      await driveDownloadZip(list, name, (done, total) => {
        if(done === total) psocToast(`Ready — downloading ${total} photos`);
      });
    } catch(err){
      psocToast("Download failed — try again or use the Drive folder link");
    }
  }

  /* ---------------- lightbox viewer ---------------- */
  function openViewer(index){
    viewerIndex = index;
    renderViewer();
    document.getElementById("viewer").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeViewer(){
    document.getElementById("viewer").classList.remove("open");
    document.body.style.overflow = "";
  }
  function stepViewer(delta){
    viewerIndex = (viewerIndex + delta + files.length) % files.length;
    renderViewer();
  }
  function renderViewer(){
    const f = files[viewerIndex];
    const img = document.getElementById("viewer-img");
    img.src = f.viewUrl;
    img.classList.remove("zoomed");
    document.getElementById("viewer-counter").textContent = `${String(viewerIndex+1).padStart(3,'0')} / ${String(files.length).padStart(3,'0')}`;
    document.getElementById("viewer-name").textContent = f.name;
    document.getElementById("viewer-meta").textContent =
      [event.title, f.width && f.height ? `${f.width}×${f.height}` : null, event.photographer].filter(Boolean).join("  ·  ");
  }
  function bindViewer(){
    document.getElementById("viewer-close").addEventListener("click", closeViewer);
    document.getElementById("viewer-prev").addEventListener("click", () => stepViewer(-1));
    document.getElementById("viewer-next").addEventListener("click", () => stepViewer(1));
    document.getElementById("viewer-img").addEventListener("click", (e) => e.target.classList.toggle("zoomed"));
    document.getElementById("viewer-download").addEventListener("click", () => {
      driveDownloadSingle(files[viewerIndex]);
      psocToast("Downloading photograph…");
    });
    document.addEventListener("keydown", (e) => {
      if(!document.getElementById("viewer").classList.contains("open")) return;
      if(e.key === "Escape") closeViewer();
      if(e.key === "ArrowLeft") stepViewer(-1);
      if(e.key === "ArrowRight") stepViewer(1);
    });
    document.getElementById("viewer").addEventListener("click", (e) => {
      if(e.target.id === "viewer") closeViewer();
    });
  }

  return { init };
})();
