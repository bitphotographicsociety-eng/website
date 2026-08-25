/* ==========================================================================
   PSOC — Shared type definitions
   ========================================================================== */

/** A single photograph or file inside Drive */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string | null;
  modifiedTime: string | null;
  thumbnailLink?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
  size?: string | null;
}

/** A sub-album (folder inside an event folder or another sub-album) */
export interface Album {
  id: string;
  name: string;
  coverUrl: string | null;
  photoCount: number;
  createdTime: string | null;
  driveUrl: string;
  hasDirectPhotos: boolean;
  subAlbums: Album[];
  parentFolderId?: string;
}

/** A top-level event folder (e.g. "2026 - FCL") */
export interface PsocEvent {
  id: string;
  driveFolderName: string;
  name: string;
  eventName: string;
  year: number | null;
  coverUrl: string | null;
  subAlbums: Album[];
  hasDirectPhotos: boolean;
  photoCount: number;
  createdTime: string | null;
  modifiedTime: string | null;
  driveUrl: string;
}

/** The fetched content of an event */
export interface PsocEventContent {
  directPhotos: DriveFile[];
  subAlbums: Album[];
}

export interface PsocSocial {
  instagram: string;
  linkedin: string;
}

export interface PsocAnnouncement {
  active: boolean;
  text: string;
  linkText: string;
  url: string;
}

/** Year group for archive page display */
export interface AlbumYearGroup {
  year: number | null;
  label: string;
  events: PsocEvent[];
}
