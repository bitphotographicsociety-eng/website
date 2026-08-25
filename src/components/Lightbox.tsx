/* ==========================================================================
   Lightbox viewer — fullscreen photo viewer with navigation
   ========================================================================== */

import { useEffect, useCallback, useState } from "react";
import type { DriveFile } from "../types";
import { driveDownloadSingle } from "../services/driveApi";
import { useToast } from "../hooks/useToast";
import { getDriveImageUrl } from "../utils/imageLoader";

interface LightboxProps {
  files: DriveFile[];
  initialIndex: number;
  title: string;
  onClose: () => void;
}

export default function Lightbox({
  files,
  initialIndex,
  title,
  onClose,
}: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const { toast } = useToast();

  const file = files[index];

  const step = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + files.length) % files.length);
      setZoomed(false);
    },
    [files.length]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, step]);

  const handleDownload = () => {
    driveDownloadSingle(file);
    toast("Downloading photograph…");
  };

  const meta = [
    title,
    // (We removed width/height from DriveFile because it required extra metadata fetching)
  ].filter(Boolean).join("  ·  ");
  
  const imgUrl = getDriveImageUrl(file, "lightbox");

  return (
    <div
      className="viewer open"
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("viewer")) onClose();
      }}
    >
      <div className="viewer-top">
        <span className="viewer-counter">
          {String(index + 1).padStart(3, "0")} /{" "}
          {String(files.length).padStart(3, "0")}
        </span>
        <button
          className="viewer-close"
          onClick={onClose}
          aria-label="Close viewer"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="viewer-stage">
        <button
          className="viewer-nav prev"
          onClick={() => step(-1)}
          aria-label="Previous photo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>

        <img
          src={imgUrl || ""}
          alt="Photograph"
          className={zoomed ? "zoomed" : ""}
          onClick={() => setZoomed((z) => !z)}
        />

        <button
          className="viewer-nav next"
          onClick={() => step(1)}
          aria-label="Next photo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="viewer-bottom">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => step(-1)}>← Previous</button>
            <button className="btn btn-primary btn-sm" onClick={handleDownload}>Download</button>
            <button className="btn btn-ghost btn-sm" onClick={() => step(1)}>Next →</button>
          </div>
          <div className="meta">{file.name}</div>
          <div className="meta">{meta}</div>
        </div>
      </div>
    </div>
  );
}
