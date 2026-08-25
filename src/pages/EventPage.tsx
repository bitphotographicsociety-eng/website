/* ==========================================================================
   Event page — handles both direct photos and sub-albums
   ========================================================================== */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEvents, getEventContent } from "../services/driveApi";
import Gallery from "../components/Gallery";
import AlbumCard from "../components/AlbumCard";
import type { PsocEvent, PsocEventContent } from "../types";

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<PsocEvent | null>(null);
  const [content, setContent] = useState<PsocEventContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    // Fetch the event metadata AND the content
    Promise.all([
      getEvents().then(events => events.find(e => e.id === id)),
      getEventContent(id)
    ])
      .then(([foundEvent, foundContent]) => {
        if (!foundEvent) throw new Error("Event not found in the archive.");
        setEvent(foundEvent);
        setContent(foundContent);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <>
        <section className="event-hero">
          <div className="skeleton" style={{ position: "absolute", inset: 0 }} />
          <div className="event-hero-content">
            <div className="event-hero-inner">
              <div className="skeleton" style={{ width: "200px", height: "14px", marginBottom: "20px" }} />
              <div className="skeleton" style={{ width: "60%", height: "48px", marginBottom: "16px" }} />
              <div className="skeleton" style={{ width: "80%", height: "20px" }} />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !event || !content) {
    return (
      <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
        <h1 style={{ fontSize: "32px" }}>Unable to load event</h1>
        <p style={{ color: "var(--silver)", marginTop: "12px" }}>
          {error || "An unknown error occurred."}
        </p>
        <Link to="/archive" className="btn btn-ghost" style={{ marginTop: "24px" }}>
          ← Back to the archive
        </Link>
      </div>
    );
  }

  const hasSubAlbums = content.subAlbums.length > 0;
  const hasDirectPhotos = content.directPhotos.length > 0;
  const isEmpty = !hasSubAlbums && !hasDirectPhotos;

  return (
    <>
      {/* ================= EVENT HERO ================= */}
      <section className="event-hero">
        {event.coverUrl ? (
          <img src={event.coverUrl} alt={event.name} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "var(--ink-soft)" }} />
        )}
        <div className="event-hero-content">
          <div className="event-hero-inner">
            <Link
              to="/archive"
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "12px",
                color: "var(--silver)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              ← Back to archive
            </Link>
            <div className="event-meta-row">
              {event.year && <span>{event.year}</span>}
              <span className="dim">{event.photoCount} photograph{event.photoCount === 1 ? "" : "s"}</span>
            </div>
            <h1>{event.name}</h1>
            <p className="desc" style={{ fontFamily: "var(--f-mono)", fontSize: "12px", color: "var(--silver-dim)", marginTop: "12px" }}>
              {event.driveFolderName}
            </p>
            <a
              href={event.driveUrl}
              target="_blank"
              rel="noopener"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: "20px" }}
            >
              Open this album in Google Drive →
            </a>
          </div>
        </div>
      </section>

      {/* ================= MIXED CONTENT ================= */}
      
      {isEmpty && (
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
          <p style={{ color: "var(--silver-dim)" }}>No photos have been added to this event yet.</p>
        </div>
      )}

      {hasSubAlbums && (
        <section style={{ paddingTop: "60px", paddingBottom: hasDirectPhotos ? "0" : "80px" }}>
          <div className="container">
            <h2 style={{ fontSize: "24px", marginBottom: "32px", borderBottom: "1px solid var(--ink-soft)", paddingBottom: "16px" }}>
              Albums
            </h2>
            <div className="album-grid">
              {content.subAlbums.map((album) => (
                <AlbumCard key={album.id} item={album} parentEventId={event.id} />
              ))}
            </div>
          </div>
        </section>
      )}

      {hasDirectPhotos && (
        <section style={{ paddingTop: hasSubAlbums ? "80px" : "40px" }}>
          <div className="container">
            {hasSubAlbums && (
              <h2 style={{ fontSize: "24px", marginBottom: "32px", borderBottom: "1px solid var(--ink-soft)", paddingBottom: "16px" }}>
                Event Photos
              </h2>
            )}
          </div>
          <Gallery files={content.directPhotos} title={event.name} driveUrl={event.driveUrl} />
        </section>
      )}
    </>
  );
}
