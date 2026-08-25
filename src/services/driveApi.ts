/* ==========================================================================
   Google Drive API service — production Drive CMS
   ========================================================================== */

import { DRIVE_API_KEY, DRIVE_API_BASE, DRIVE_FOLDER_ID } from "../config/googleDrive";
import { runWithConcurrencyLimit } from "../utils/driveConcurrency";
import { extractYear, extractEventName } from "../utils/albumMetadata";
import { getCached, setCached } from "../utils/cache";
import type { Album, DriveFile, PsocEvent, PsocEventContent } from "../types";

/**
 * Standard fields we want from Drive for files.
 */
const FILE_FIELDS = "id,name,mimeType,parents,thumbnailLink,webContentLink,webViewLink,size,createdTime,modifiedTime";

/* --------------------------------------------------------------------------
   Low-level API Abstraction
   -------------------------------------------------------------------------- */

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJitteredDelay(baseMs: number): number {
  const jitter = Math.random() * 200 - 100; // ±100ms
  return Math.max(0, baseMs + jitter);
}

/**
 * Executes a single fetch request with exponential backoff and jitter.
 */
async function fetchWithRetry(url: string, attempts = 3): Promise<any> {
  const delays = [500, 1000, 2000];

  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url);

    if (res.ok) {
      return res.json();
    }

    const isLastAttempt = i === attempts - 1;
    let shouldRetry = false;

    if ([429, 500, 502, 503, 504].includes(res.status)) {
      shouldRetry = true;
    } else if (res.status === 403) {
      try {
        const errorData = await res.clone().json();
        const reason = errorData?.error?.errors?.[0]?.reason;
        if (reason === "rateLimitExceeded" || reason === "userRateLimitExceeded") {
          shouldRetry = true;
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    if (!shouldRetry || isLastAttempt) {
      if (res.status === 404) {
        throw new Error("Folder not found. Check folder ID and permissions.");
      }
      if (res.status === 403) {
        throw new Error("Unable to access Google Drive. Check permissions.");
      }
      throw new Error(`Google Drive API error (${res.status}).`);
    }

    // Wait before retrying
    await delay(getJitteredDelay(delays[i] || 2000));
  }
}

/**
 * Low-level Drive API request wrapper.
 * Handles API key, pagination, concurrency, and retries.
 */
async function requestDriveApi(query: string, fields: string): Promise<any[]> {
  if (!DRIVE_API_KEY || !DRIVE_FOLDER_ID) {
    throw new Error("Google Drive API configuration is missing in .env");
  }

  return runWithConcurrencyLimit(async () => {
    const allFiles: any[] = [];
    let pageToken = "";

    do {
      const q = encodeURIComponent(query);
      const f = encodeURIComponent(`nextPageToken,files(${fields})`);
      const url = `${DRIVE_API_BASE}/files?q=${q}&fields=${f}&pageSize=1000&key=${DRIVE_API_KEY}${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const data = await fetchWithRetry(url);
      if (data.files) {
        allFiles.push(...data.files);
      }
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    return allFiles;
  });
}

/**
 * Fetch metadata for a single file (e.g. to get its parent).
 */
async function getDriveFile(fileId: string, fields: string): Promise<any> {
  return runWithConcurrencyLimit(async () => {
    const url = `${DRIVE_API_BASE}/files/${fileId}?fields=${fields}&key=${DRIVE_API_KEY}`;
    return fetchWithRetry(url);
  });
}

/* --------------------------------------------------------------------------
   Caching & Resilience Layer
   -------------------------------------------------------------------------- */

const inFlight = new Map<string, Promise<any>>();

/**
 * Wraps a fetcher with stale-while-revalidate, in-flight deduplication, and fallback logic.
 * Deduplicates per-tab to prevent duplicate network calls.
 */
async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key);

  if (cached.status === "fresh" && cached.data) {
    return cached.data;
  }

  let fetchPromise = inFlight.get(key);
  if (!fetchPromise) {
    fetchPromise = fetcher()
      .then((data) => {
        setCached(key, data);
        return data;
      })
      .finally(() => {
        inFlight.delete(key);
      });
    inFlight.set(key, fetchPromise);
  }

  if (cached.status === "stale" && cached.data) {
    // Suppress unhandled promise rejection for the background fetch
    fetchPromise.catch(() => {});
    return cached.data;
  }

  try {
    return await fetchPromise;
  } catch (err) {
    if (cached.lastGoodData) {
      console.warn(`Drive API failed for ${key}, falling back to last known good data.`, err);
      return cached.lastGoodData;
    }
    throw err;
  }
}

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

function isCoverFile(name: string): boolean {
  return /^_?cover\.(jpe?g|png|webp)$/i.test(name);
}

function mapToDriveFile(f: any): DriveFile {
  return {
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    createdTime: f.createdTime || null,
    modifiedTime: f.modifiedTime || null,
    thumbnailLink: f.thumbnailLink || null,
    webViewLink: f.webViewLink || null,
    webContentLink: f.webContentLink || null,
    size: f.size || null,
  };
}

/* --------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------- */

async function getFolderTreeMetadata(folderId: string, folderName: string, createdTime: string | null): Promise<Album> {
  const children = await requestDriveApi(`'${folderId}' in parents and trashed = false`, FILE_FIELDS);

  const directPhotos: any[] = [];
  const subFolders: any[] = [];
  let explicitCover: string | null = null;

  for (const child of children) {
    if (child.mimeType === "application/vnd.google-apps.folder") {
      subFolders.push(child);
    } else if (child.mimeType.startsWith("image/")) {
      if (isCoverFile(child.name)) {
        if (!explicitCover) explicitCover = child.thumbnailLink || child.webContentLink;
      } else {
        directPhotos.push(child);
      }
    }
  }

  const subAlbumsPromises = subFolders.map(async (subFolder): Promise<Album> => {
    return getFolderTreeMetadata(subFolder.id, subFolder.name, subFolder.createdTime || null);
  });

  const subAlbums = await Promise.all(subAlbumsPromises);

  const directPhotoCount = directPhotos.length;
  const subAlbumsPhotoCount = subAlbums.reduce((acc, alb) => acc + alb.photoCount, 0);
  const totalPhotoCount = directPhotoCount + subAlbumsPhotoCount;

  let coverUrl = explicitCover;
  if (!coverUrl && directPhotos.length > 0) {
    coverUrl = directPhotos[0].thumbnailLink || directPhotos[0].webContentLink;
  }
  if (!coverUrl && subAlbums.length > 0) {
    coverUrl = subAlbums[0].coverUrl;
  }

  return {
    id: folderId,
    name: folderName,
    coverUrl: coverUrl || null,
    photoCount: totalPhotoCount,
    createdTime,
    driveUrl: `https://drive.google.com/drive/folders/${folderId}`,
    hasDirectPhotos: directPhotoCount > 0,
    subAlbums,
  };
}

export async function getEvents(): Promise<PsocEvent[]> {
  return withCache("events", async () => {
    const eventFolders = await requestDriveApi(
      `'${DRIVE_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      "id,name,createdTime,modifiedTime"
    );

    const eventPromises = eventFolders.map(async (folder): Promise<PsocEvent> => {
      const tree = await getFolderTreeMetadata(folder.id, folder.name, folder.createdTime);
      return {
        id: folder.id,
        driveFolderName: folder.name,
        name: extractEventName(folder.name),
        eventName: extractEventName(folder.name),
        year: extractYear(folder.name),
        coverUrl: tree.coverUrl,
        subAlbums: tree.subAlbums,
        hasDirectPhotos: tree.hasDirectPhotos,
        photoCount: tree.photoCount,
        createdTime: folder.createdTime || null,
        modifiedTime: folder.modifiedTime || null,
        driveUrl: tree.driveUrl,
      };
    });

    const events = await Promise.all(eventPromises);
    
    events.sort((a, b) => {
      const ta = a.createdTime ? new Date(a.createdTime).getTime() : 0;
      const tb = b.createdTime ? new Date(b.createdTime).getTime() : 0;
      return tb - ta;
    });

    return events;
  });
}

export async function getFolderContent(folderId: string): Promise<{ content: PsocEventContent; parentFolderId: string | null }> {
  return withCache(`folder:${folderId}:content`, async () => {
    const children = await requestDriveApi(`'${folderId}' in parents and trashed = false`, FILE_FIELDS);

    const directPhotos: DriveFile[] = [];
    const subFolders: any[] = [];

    for (const child of children) {
      if (child.mimeType === "application/vnd.google-apps.folder") {
        subFolders.push(child);
      } else if (child.mimeType.startsWith("image/") && !isCoverFile(child.name)) {
        directPhotos.push(mapToDriveFile(child));
      }
    }

    const subAlbumsPromises = subFolders.map(async (subFolder): Promise<Album> => {
      return getFolderTreeMetadata(subFolder.id, subFolder.name, subFolder.createdTime || null);
    });

    const subAlbums = await Promise.all(subAlbumsPromises);

    const folderSelf = await getDriveFile(folderId, "parents");
    const parentFolderId = folderSelf.parents?.[0] || null;

    return {
      content: {
        directPhotos,
        subAlbums,
      },
      parentFolderId
    };
  });
}

export async function getEventContent(eventId: string): Promise<PsocEventContent> {
  const res = await getFolderContent(eventId);
  return res.content;
}

export async function driveDownloadZip(
  files: DriveFile[],
  zipName: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  let done = 0;

  for (const f of files) {
    try {
      const downloadUrl = f.webContentLink || (DRIVE_API_KEY && f.id ? `${DRIVE_API_BASE}/files/${f.id}?alt=media&key=${DRIVE_API_KEY}` : null);
      if (!downloadUrl) throw new Error("No download URL");
      
      const res = await fetch(downloadUrl, { mode: "cors" });
      const blob = await res.blob();
      zip.file(f.name || `${f.id}.jpg`, blob);
    } catch {
      zip.file(`${f.name || f.id}-source-link.txt`, `${f.webContentLink || ""}\n`);
    }
    done++;
    if (onProgress) onProgress(done, files.length);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function driveDownloadSingle(file: DriveFile): void {
  const downloadUrl = file.webContentLink || (DRIVE_API_KEY && file.id ? `${DRIVE_API_BASE}/files/${file.id}?alt=media&key=${DRIVE_API_KEY}` : "");
  if (!downloadUrl) return;
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = file.name || "photograph.jpg";
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
