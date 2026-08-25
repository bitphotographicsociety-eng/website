/* ==========================================================================
   PSOC — static data (motto, social links, announcement)
   --------------------------------------------------------------------------
   Event/album data is now dynamically discovered from Google Drive.
   Only site-wide constants remain here.
   ========================================================================== */

import type { PsocSocial, PsocAnnouncement } from "../types";

/** Society motto — used across hero, header, footer, about */
export const PSOC_MOTTO = "Capturing Moments, Creating Memories";

export const PSOC_SOCIAL: PsocSocial = {
  instagram: "https://www.instagram.com/bitd.psoc?igsi=MWkweW5uZDJkYWZpcg==",
  linkedin: "https://www.linkedin.com/company/bitd-psoc/",
};

export const PSOC_ANNOUNCEMENT: PsocAnnouncement = {
  active: true,
  text: "Sports Day 2025 album is live — every frame from the day, in one folder.",
  linkText: "Open the Drive folder",
  url: "https://drive.google.com/drive/folders/1z3s5XoOeFmSAww7TRcYx7Feny88Yst_u",
};
