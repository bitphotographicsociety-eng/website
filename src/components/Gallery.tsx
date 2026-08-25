/* ==========================================================================
   Gallery — photo grid with selection, download toolbar, lightbox, skeletons
   ========================================================================== */

import { useState, useCallback } from "react";
import type { DriveFile } from "../types";
import { driveDownloadZip } from "../services/driveApi";
import { ICONS } from "./Header";
import Lightbox from "./Lightbox";
import { useToast } from "../hooks/useToast";
import { getDriveImageUrl } from "../utils/imageLoader";

interface GalleryProps {
  files: DriveFile[];
  title: string;
  driveUrl: string;
}

export default function Gallery({ files, title, driveUrl }: GalleryProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selected.size === files.length && files.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(files.map((f) => f.id)));
    }
  }, [files, selected.size]);

  const runZipDownload = useCallback(
    async (list: DriveFile[], name: string) => {
      toast(`Preparing ${list.length} photo${list.length === 1 ? "" : "s"}…`);
      try {
        await driveDownloadZip(list, name, (done, total) => {
          if (done === total) toast(`Ready — downloading ${total} photos`);
        });
      } catch {
        toast("Download failed — try again or use the Drive folder link");
      }
    },
    [toast]
  );

  const n = selected.size;
  const statusText =
    n === 0
      ? files.length
        ? `<b>${files.length}</b> photo${files.length === 1 ? "" : "s"} in this album`
        : ""
      : n === files.length
        ? `<b>All ${n}</b> photos selected`
        : `<b>${n}</b> photo${n === 1 ? "" : "s"} selected`;

  return (
    <>
      {/* Toolbar */}
      <div className="gallery-toolbar">
        <div className="container row">
          <span
            className="select-status"
            dangerouslySetInnerHTML={{ __html: statusText }}
          />
          <div className="toolbar-spacer" />
          <span className="source-note">
            {ICONS.drive}
            <span>Backed by Google Drive</span>
          </span>
          <button className="checkbox-btn" onClick={selectAll}>
            {n === files.length && n > 0 ? "Deselect all" : "Select all"}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            disabled={n === 0}
            onClick={() => {
              const chosen = files.filter((f) => selected.has(f.id));
              if (chosen.length)
                runZipDownload(
                  chosen,
                  `${title.replace(/\s+/g, "_")}_selected`
                );
            }}
          >
            Download selected
          </button>
          <button
            className="btn btn-brass btn-sm"
            onClick={() => {
              if (files.length)
                runZipDownload(
                  files,
                  `${title.replace(/\s+/g, "_")}_full_album`
                );
            }}
          >
            Download all photos
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="container">
        <div className="photo-grid">
          {files.length === 0 && (
            <div className="empty-note" style={{ gridColumn: "1 / -1" }}>
              No photographs found in this album yet.
            </div>
          )}

          {files.map((f, i) => {
            const isFailed = failedImages.has(f.id);
            const thumbnailUrl = isFailed 
              ? getDriveImageUrl(f, "download") // Fallback to full-res authenticated API if thumbnail 429s
              : getDriveImageUrl(f, "thumbnail");

            return (
              <div
                key={f.id}
                className={`photo-cell${selected.has(f.id) ? " selected" : ""}`}
                onClick={() => setViewerIndex(i)}
              >
                {!isFailed ? (
                  <img
                    src={thumbnailUrl || ""}
                    alt={`${title} — photograph ${i + 1}`}
                    loading="lazy"
                    onError={() => {
                      setFailedImages((prev) => new Set(prev).add(f.id));
                      console.warn(`Failed to load Drive image: ${f.id}`);
                    }}
                  />
                ) : (
                  <div className="album-placeholder" style={{ width: "100%", height: "100%" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="48" height="48">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                
                <span className="num-tag">
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span
                  className="select-box"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(f.id);
                  }}
                >
                  {ICONS.check}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drive link */}
      <div className="container">
        <div style={{ padding: "56px 0 100px", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: "12px",
              color: "var(--silver-dim)",
            }}
          >
            Photographs are streamed directly from Google Drive. Prefer Drive's
            own interface?
          </p>
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener"
            className="btn btn-ghost btn-sm"
            style={{ marginTop: "14px" }}
          >
            Open this album in Google Drive →
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {viewerIndex !== null && (
        <Lightbox
          files={files}
          initialIndex={viewerIndex}
          title={title}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
