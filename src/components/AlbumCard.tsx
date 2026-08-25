/* ==========================================================================
   Album card — displays a Drive-discovered album
   ========================================================================== */

import { Link } from "react-router-dom";
import type { Album, PsocEvent } from "../types";
import { ICONS } from "./Header";
import { useState } from "react";

interface AlbumCardProps {
  item: Album | PsocEvent;
  parentEventId?: string; // provided if item is a sub-album
}

export default function AlbumCard({ item, parentEventId }: AlbumCardProps) {
  const [imgError, setImgError] = useState(false);
  
  // Determine if it's a top-level event or a sub-album
  const isEvent = !parentEventId;
  const linkTo = isEvent ? `/event/${item.id}` : `/event/${parentEventId}/album/${item.id}`;
  const year = "year" in item ? item.year : null;

  return (
    <article className="album-card">
      <Link
        className="card-link"
        to={linkTo}
        aria-label={`View ${item.name} album`}
      />
      <div className="thumb">
        {item.coverUrl && !imgError ? (
          <img 
            src={item.coverUrl} 
            alt={item.name} 
            loading="lazy" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="album-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="48" height="48">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        <span className="count-badge">
          {item.photoCount > 0
            ? `${item.photoCount} photo${item.photoCount === 1 ? "" : "s"}`
            : "Coming soon"}
        </span>
        <div className="info">
          <div className="year-cat">
            {year && <span>{year}</span>}
          </div>
          <h3>{item.name}</h3>
          <span className="view-link">
            View Album {ICONS.arrow}
          </span>
        </div>
      </div>
    </article>
  );
}
