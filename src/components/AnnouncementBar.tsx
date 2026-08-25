/* ==========================================================================
   Dismissible announcement bar
   ========================================================================== */

import { useState, useEffect } from "react";
import { PSOC_ANNOUNCEMENT } from "../data/events";
import { ICONS } from "./Header";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (
        sessionStorage.getItem("psoc_announcement_dismissed") ===
        PSOC_ANNOUNCEMENT.text
      ) {
        setDismissed(true);
      }
    } catch {
      /* sandboxed — ignore */
    }
  }, []);

  if (!PSOC_ANNOUNCEMENT.active || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(
        "psoc_announcement_dismissed",
        PSOC_ANNOUNCEMENT.text
      );
    } catch {
      /* sandboxed — ignore */
    }
  };

  return (
    <div className="announcement-bar">
      <div className="container">
        <span className="dot"></span>
        <p>{PSOC_ANNOUNCEMENT.text}</p>
        <a
          className="announcement-link"
          href={PSOC_ANNOUNCEMENT.url}
          target="_blank"
          rel="noopener"
        >
          {PSOC_ANNOUNCEMENT.linkText} {ICONS.arrow}
        </a>
        <button
          className="announcement-close"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
