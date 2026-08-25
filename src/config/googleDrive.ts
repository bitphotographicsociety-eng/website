/* ==========================================================================
   Google Drive configuration — loaded from environment variables
   ========================================================================== */

const apiKey = import.meta.env.VITE_DRIVE_API_KEY;
const rootFolderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

// Strict validation — fail loudly if config is missing
if (!apiKey) {
  throw new Error(
    "Missing VITE_DRIVE_API_KEY in environment configuration. " +
    "Add it to your .env file and restart the dev server."
  );
}

if (!rootFolderId) {
  throw new Error(
    "Missing VITE_GOOGLE_DRIVE_FOLDER_ID in environment configuration. " +
    "Add it to your .env file and restart the dev server."
  );
}

// Development-only diagnostic (never logs the actual API key)
if (import.meta.env.DEV) {
  console.log("Google Drive configuration:", {
    hasApiKey: Boolean(apiKey),
    rootFolderId: rootFolderId,
  });
}

export const DRIVE_API_KEY: string = apiKey;
export const DRIVE_FOLDER_ID: string = rootFolderId;
export const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
