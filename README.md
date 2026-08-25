# PSOC — The Photographic Society | Digital Archive

A permanent, year-indexed photography archive: the website stores **event metadata only**;
every photograph physically lives in **Google Drive**.

```
Website  =  Discovery + Presentation + Archive Index
Drive    =  Actual photograph storage
```

## What's in this build

| File | Purpose |
|---|---|
| `index.html` | Homepage — hero, featured albums, year index, about, follow |
| `albums.html` | Full archive, browsable by year and filterable by category/search |
| `event.html` | Single album: Drive-backed gallery grid + lightbox viewer, multi-select, download |
| `admin.html` | Metadata-only admin panel (event CRUD, publish toggle) |
| `js/data.js` | The `Event` schema + mock dataset (swap for a real database in production) |
| `js/drive-api.js` | **The Google Drive integration layer** — read this file first |
| `js/gallery.js` | Grid rendering, selection state, batch download, lightbox |
| `js/main.js` | Shared header/footer, icons, toast |
| `js/admin.js` | Login gate + event form + table (client-side demo state) |

Open `index.html` in a browser — everything works immediately, no build step,
no server, no credentials. It runs in **demo mode**: `js/drive-api.js` generates
a realistic, fully-interactive file list per album so you can test the grid,
multi-select, "download selected," "download all," and the lightbox exactly
as they'll behave in production.

## The `Event` object

```
Event
├── id
├── title
├── date
├── year
├── category
├── description
├── cover_image        — single representative photo for cards
├── google_drive_url    — the album's public Drive folder
├── drive_folder_id     — derived from the URL, used for gallery preview
├── photo_count         — optional, shown on the card badge
├── photographer        — optional credit line
└── published           — boolean; unpublished events are invisible to the public
```

Adding hundreds of future events means adding rows of this shape — no schema
or redesign changes required.

## Turning on Option B (live Drive gallery)

Everything needed to go from demo to live is inside `js/drive-api.js`. No other
file changes.

1. **Google Cloud Console** → enable the **Google Drive API** on a project.
2. Create an **API key**, restrict it to the Drive API and to your site's
   domain (HTTP referrer restriction). This key is shipped to the browser by
   design — the referrer restriction is what keeps it safe to expose.
3. Set every event's Drive folder sharing to **"Anyone with the link → Viewer."**
   API keys can only authenticate as an anonymous public reader; they cannot
   open a private or organisation-restricted folder. (Opening private folders
   would need full OAuth — a much larger integration, and unnecessary for a
   public archive.)
4. In `js/drive-api.js`:
   ```js
   const DRIVE_CONFIG = {
     mode: "live",
     apiKey: "YOUR_RESTRICTED_KEY",
     pageSize: 100
   };
   ```
5. In the admin panel, paste each event's Drive folder URL — the app extracts
   the folder ID automatically.

That's it. `event.html` calls `driveListFiles(folderId)`, which lists every
image in the folder via `files.list`, and the grid/viewer/download flows work
identically to demo mode.

## Option A (direct link) is always available as a fallback

Every event also carries `google_drive_url`. If a live Drive call fails (folder
unshared, deleted, API quota, etc.), the gallery shows a clear message with a
button straight to the Drive folder — so the archive is never a dead end even
if the live preview breaks.

## Documented limitations of a Drive-backed gallery

These are inherent to Drive's public API, not shortcuts taken in this build:

- **No native ZIP export via the API.** Drive's own UI can zip a folder; the
  REST API cannot. "Download selected" / "Download all" fetch each file's
  bytes in the browser and zip them client-side with JSZip. This is reliable
  for a few hundred images. For very large albums (500+ full-resolution
  photos), a browser tab can run low on memory — the recommended upgrade is a
  small serverless function that does the same zip job server-side and
  streams the result. Only `driveDownloadZip()` needs to change for that.
- **Thumbnail resolution is capped.** `thumbnailLink` serves a downscaled
  JPEG (roughly up to ~1600–2000px). The grid and lightbox use this for
  speed; `webContentLink` streams the original file for full-resolution
  downloads.
- **Read-only, by construction.** A public API key can only ever grant read
  access — nothing in this integration can delete, rename, or move a Drive
  file. That's what keeps the public gallery to view → select → download,
  with no delete/manage controls anywhere in the UI.
- **Large folders paginate.** `driveListFiles()` already loops through
  `nextPageToken` for folders with 1,000+ files.
- **CORS on `uc?export=download` links** can occasionally block a client-side
  `fetch()` for zipping (Drive doesn't send permissive CORS headers on every
  response). When a fetch fails, this build still completes the ZIP and
  drops in a text file with a direct link to that one photo, rather than
  failing the whole batch — the same serverless-proxy upgrade above removes
  this edge case entirely.

## Admin panel

The admin only manages metadata and the Drive link — never photographs:

- Create / edit: title, date, year (derived), category, description, cover
  image URL, Drive folder URL, photographer credit, photo count, published
  status.
- Publish / unpublish an album instantly.
- Delete an event **from the website listing only** — this never touches the
  Drive folder or its contents.

This build keeps admin state in memory (cloned from `js/data.js`) so the
panel is fully interactive without a backend. To persist changes, point
`saveEvent()` / `deleteEvent()` in `js/admin.js` at real endpoints
(e.g. `POST /api/events`, `DELETE /api/events/:id`) — the form and table
logic don't need to change.

Sign-in is a demo stand-in (any email/password works) — swap for real
authentication (SSO or a verified users table) before going live, and make
sure `admin.html`'s dashboard is only reachable after a server-verified
session, not just a client-side flag.

## Social links

Instagram and LinkedIn URLs live in one place — `PSOC_SOCIAL` at the top of
`js/data.js` — and are used by both the header icons and the homepage
"Follow" section. Update them there.
