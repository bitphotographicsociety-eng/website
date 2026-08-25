/* ==========================================================================
   Google Drive integration layer
   --------------------------------------------------------------------------
   This is the ONLY file that needs to change to go from "demo" to "live".

   ARCHITECTURE
   Google Drive Folder (public, "Anyone with the link → Viewer")
        ↓  Drive API v3  files.list()
   This module (browser-side)
        ↓  thumbnailLink / webContentLink
   Website gallery (grid, lightbox, multi-select, download)

   Drive never gets duplicated onto the website's own storage. This module
   only ever reads metadata + streams the existing Drive URLs.

   --------------------------------------------------------------------------
   SETUP FOR PRODUCTION (LIVE MODE)
   --------------------------------------------------------------------------
   1. Google Cloud Console → enable the "Google Drive API" on a project.
   2. Create an API key, restrict it to the Drive API and to your website's
      domain (HTTP referrer restriction) — this key is public-readable by
      design (Option B ships it to the browser), so referrer-restriction is
      what keeps it from being abused elsewhere. Do not give it write scope.
   3. Set every event's Drive folder sharing to "Anyone with the link → Viewer".
      Folders that are not public cannot be listed by an API key (API keys
      only authenticate as "anonymous public reader", they cannot access
      private/organisation-restricted folders — that needs OAuth, which is
      a much bigger integration and is not required for a public archive).
   4. Set DRIVE_CONFIG.mode = "live" and DRIVE_CONFIG.apiKey below.

   --------------------------------------------------------------------------
   KNOWN LIMITATIONS OF DRIVE-BACKED GALLERIES (read before promising features)
   --------------------------------------------------------------------------
   • No native ZIP export via the API. Drive's UI can zip a folder, but the
     REST API cannot. "Download All" here fetches each file's bytes in the
     browser and zips them client-side with JSZip. This is reliable up to a
     few hundred images; for very large albums (500+ full-resolution photos)
     a browser tab can run out of memory. The recommended production upgrade
     is a small serverless function (Cloud Run / Vercel) that does the same
     zip job server-side and streams the result — the UI below is written so
     that swap only touches `driveDownloadZip()`.
   • `files.list` thumbnailLink images are capped (Drive serves a downscaled
     JPEG, typically up to ~1600–2000px on the long edge). This is what the
     grid and lightbox use, and it's what "download individual photograph"
     also uses by default. For full original-resolution downloads, request
     `webContentLink`, which streams the original file Drive has stored.
   • Public API keys can only ever grant read access. Nothing about this
     integration can delete, rename or move a Drive file — matching the
     product requirement that the public gallery is view/select/download only.
   • Very large folders (1000+ files) need pagination (`pageToken`); the
     `driveListFiles()` function below already loops through pages.
   • A folder that has been unshared or deleted will make its event's
     "View Album" / gallery calls fail gracefully — see `driveListFiles()`'s
     error handling — rather than showing a broken grid.
   ========================================================================== */

const DRIVE_CONFIG = {
  mode: "demo",          // "demo" | "live" — flip once an API key is set
  apiKey: "AIzaSyDapgVHkeEPGZ56Pa1aA3CfUc1gR9abVAY",            // Drive API key, restricted to your domain
  pageSize: 100
};

/**
 * List every image file inside a public Drive folder.
 * Returns: [{ id, name, thumbnailUrl, viewUrl, downloadUrl, createdTime, width, height }]
 */
async function driveListFiles(folderId){
  if(DRIVE_CONFIG.mode === "demo"){
    return demoListFiles(folderId);
  }

  if(!DRIVE_CONFIG.apiKey){
    throw new Error("DRIVE_CONFIG.apiKey is not set. Add a restricted Drive API key in js/drive-api.js.");
  }

  const files = [];
  let pageToken = "";
  const base = "https://www.googleapis.com/drive/v3/files";
  const fields = "nextPageToken,files(id,name,thumbnailLink,webContentLink,webViewLink,createdTime,imageMediaMetadata)";

  do {
    const q = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
    const url = `${base}?q=${q}&fields=${encodeURIComponent(fields)}&pageSize=${DRIVE_CONFIG.pageSize}&key=${DRIVE_CONFIG.apiKey}${pageToken ? "&pageToken="+pageToken : ""}`;
    const res = await fetch(url);
    if(!res.ok){
      throw new Error(`Drive API error (${res.status}). Check that the folder is public and the API key is valid for this domain.`);
    }
    const data = await res.json();
    (data.files || []).forEach(f => {
      files.push({
        id: f.id,
        name: f.name,
        thumbnailUrl: (f.thumbnailLink || "").replace(/=s\d+$/, "=s1000"),
        viewUrl: f.webViewLink,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${f.id}`,
        createdTime: f.createdTime,
        width: f.imageMediaMetadata?.width,
        height: f.imageMediaMetadata?.height
      });
    });
    pageToken = data.nextPageToken || "";
  } while(pageToken);

  files.sort((a,b) => new Date(a.createdTime) - new Date(b.createdTime));
  return files;
}

/**
 * Batch-download a set of Drive files as a single ZIP, built client-side.
 * Requires JSZip (loaded from cdnjs in event.html) — swap this function's
 * body for a call to a server-side zip endpoint if albums grow very large.
 */
async function driveDownloadZip(files, zipName, onProgress){
  if(typeof JSZip === "undefined"){
    throw new Error("JSZip is not loaded.");
  }
  const zip = new JSZip();
  let done = 0;
  for(const f of files){
    try{
      const res = await fetch(f.downloadUrl, { mode: "cors" });
      const blob = await res.blob();
      zip.file(f.name || `${f.id}.jpg`, blob);
    } catch(err){
      // In demo mode / cross-origin-restricted real folders, individual
      // fetches can be blocked by CORS. We still add a placeholder note so
      // the ZIP always completes rather than throwing away the whole batch.
      zip.file(`${(f.name || f.id)}-source-link.txt`, `${f.downloadUrl}\n`);
    }
    done++;
    if(onProgress) onProgress(done, files.length);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Trigger a single-file download without leaving the current page. */
function driveDownloadSingle(file){
  const a = document.createElement("a");
  a.href = file.downloadUrl;
  a.download = file.name || "photograph.jpg";
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* --------------------------------------------------------------------------
   DEMO MODE
   Generates a believable, fully-interactive file list so the gallery,
   multi-select and viewer are usable right now, with zero credentials.
   Swap DRIVE_CONFIG.mode to "live" to replace this with real Drive data —
   no other file needs to change.
   -------------------------------------------------------------------------- */
const DEMO_PHOTO_IDS = [
  "1493246507139-91e8fad9978e","1517841905240-472988babdf9","1500530855697-b586d89ba3ee",
  "1506157786151-b8491531f063","1531058020387-3be344556be6","1522202176988-66273c2fd55f",
  "1524504388940-b1c1722653e1","1515169067868-5387ec356754","1531123897727-8f129e1688ce",
  "1533105079780-92b9be482077","1517457373958-b7bdd4587205","1508214751196-bcfd4ca60f91",
  "1523580494863-6f3031224c94","1543269865-cbf427effbad","1529156069898-49953e39b3ac",
  "1504006833117-8886a355efbf","1470229722913-7c0e2dbbafd3","1492684223066-81342ee5ff30",
  "1524368535928-5b5e00ddc76b","1501281668745-f7f57925c3b4","1509721434272-b79147e0e708",
  "1517457210348-703079e97659","1465146344425-f00d5f5c8f07","1519741497674-611481863552"
];
function demoListFiles(folderId){
  const seed = [...folderId].reduce((a,c) => a + c.charCodeAt(0), 0);
  const count = 18 + (seed % 10); // demo subset; real folders can hold hundreds
  const files = [];
  for(let i = 0; i < count; i++){
    const photoId = DEMO_PHOTO_IDS[(seed + i) % DEMO_PHOTO_IDS.length];
    files.push({
      id: `${folderId}-demo-${i}`,
      name: `PSOC_${folderId.slice(0,6).toUpperCase()}_${String(i+1).padStart(3,"0")}.jpg`,
      thumbnailUrl: `https://images.unsplash.com/photo-${photoId}?q=80&w=900&auto=format&fit=crop`,
      viewUrl: `https://images.unsplash.com/photo-${photoId}?q=90&w=2200&auto=format&fit=crop`,
      downloadUrl: `https://images.unsplash.com/photo-${photoId}?q=95&w=3000&auto=format&fit=crop`,
      createdTime: new Date(Date.now() - i * 3600e3).toISOString(),
      width: 3000, height: 2000
    });
  }
  return Promise.resolve(files);
}
