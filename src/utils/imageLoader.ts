import type { DriveFile } from "../types";
import { DRIVE_API_KEY, DRIVE_API_BASE } from "../config/googleDrive";

export type ImageUsage = "cover" | "card" | "thumbnail" | "lightbox" | "download";

/**
 * Returns the best available URL for an image based on the intended usage,
 * using the empirical testing strategy.
 */
export function getDriveImageUrl(file: DriveFile | null | undefined, usage: ImageUsage): string | null {
  if (!file) return null;

  // For Lightbox and Download, use alt=media (or webContentLink as fallback)
  if (usage === "lightbox" || usage === "download") {
    if (DRIVE_API_KEY && file.id) {
      return `${DRIVE_API_BASE}/files/${file.id}?alt=media&key=${DRIVE_API_KEY}`;
    }
    return file.webContentLink || null;
  }

  // For UI thumbnails/cards, prefer thumbnailLink
  if (file.thumbnailLink) {
    // Attempt to resize if the Google proxy URL format supports it
    if (usage === "cover" || usage === "card") {
      return file.thumbnailLink.replace(/=s\d+$/, "=s800");
    } else if (usage === "thumbnail") {
      return file.thumbnailLink.replace(/=s\d+$/, "=s1200");
    }
    return file.thumbnailLink;
  }

  // Fallback if no thumbnailLink is present
  if (DRIVE_API_KEY && file.id) {
    return `${DRIVE_API_BASE}/files/${file.id}?alt=media&key=${DRIVE_API_KEY}`;
  }
  
  return file.webContentLink || null;
}
