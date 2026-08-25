/* ==========================================================================
   Album metadata utilities — year/name extraction and sorting
   ========================================================================== */

import type { PsocEvent, AlbumYearGroup } from "../types";

/**
 * Extract a 4-digit year (1900–2099) from a folder name.
 * Supports "2026 - Freshers", "Freshers 2026", etc.
 * Returns null if no year is found.
 */
export function extractYear(folderName: string): number | null {
  const match = folderName.match(/\b(19|20)\d{2}\b/);
  if (!match) return null;
  return parseInt(match[0], 10);
}

/**
 * Extract the event name from a folder name by removing the year and separators.
 *
 * "2026 - Freshers"          → "Freshers"
 * "2026 - Photography Workshop" → "Photography Workshop"
 * "Freshers 2026"            → "Freshers"
 * "Photography Workshop"     → "Photography Workshop"
 */
export function extractEventName(folderName: string): string {
  const year = extractYear(folderName);
  if (year === null) return folderName.trim();

  // Remove the year and any surrounding separators (-, –, —, |, :)
  return folderName
    .replace(String(year), "")
    .replace(/^\s*[-–—|:]\s*/, "")  // leading separator
    .replace(/\s*[-–—|:]\s*$/, "")  // trailing separator
    .trim() || folderName.trim();
}

/**
 * Sort events: year DESC → createdTime DESC → name ASC.
 * Events without a year go after events with years.
 */
export function sortAlbums(events: PsocEvent[]): PsocEvent[] {
  return [...events].sort((a, b) => {
    // Year: DESC, null goes last
    if (a.year !== null && b.year !== null) {
      if (a.year !== b.year) return b.year - a.year;
    } else if (a.year !== null) {
      return -1; // a has year, b doesn't → a first
    } else if (b.year !== null) {
      return 1; // b has year, a doesn't → b first
    }

    // Within same year (or both null): createdTime DESC
    const aTime = a.createdTime ? new Date(a.createdTime).getTime() : 0;
    const bTime = b.createdTime ? new Date(b.createdTime).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;

    // Fallback: name ASC
    return a.name.localeCompare(b.name);
  });
}

/**
 * Group sorted events by year for the archive page.
 * Events without a year are grouped under "Other".
 */
export function groupAlbumsByYear(events: PsocEvent[]): AlbumYearGroup[] {
  const sorted = sortAlbums(events);
  const groups = new Map<number | null, PsocEvent[]>();

  for (const event of sorted) {
    const key = event.year;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }

  const result: AlbumYearGroup[] = [];
  for (const [year, yearEvents] of groups) {
    result.push({
      year,
      label: year !== null ? String(year) : "Other",
      events: yearEvents,
    });
  }

  return result;
}
