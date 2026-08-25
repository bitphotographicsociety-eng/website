/* ==========================================================================
   Sub-Album Page — view nested folders and photos
   ========================================================================== */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEvents, getFolderContent } from "../services/driveApi";
import type { PsocEvent, PsocEventContent, Album } from "../types";
import Gallery from "../components/Gallery";
import AlbumCard from "../components/AlbumCard";

export default function SubAlbumPage() {
  const { eventId, albumId } = useParams();
  const [event, setEvent] = useState<PsocEvent | null>(null);
  
  // The current folder's metadata, found by traversing the event tree
  const [currentFolder, setCurrentFolder] = useState<Album | null>(null);
  
  // The current folder's contents (images + its own sub-folders)
  const [content, setContent] = useState<PsocEventContent | null>(null);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to recursively find a folder in the tree
  const findFolder = (albums: Album[], targetId: string): Album | null => {
    for (const a of albums) {
      if (a.id === targetId) return a;
      const found = findFolder(a.subAlbums, targetId);
      if (found) return found;
    }
    return null;
  };

  useEffect(() => {
    if (!eventId || !albumId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      getEvents().then(events => events.find(e => e.id === eventId)),
      getFolderContent(albumId)
    ])
      .then(([foundEvent, foundData]) => {
        if (!foundEvent) throw new Error("Parent event not found");
        
        const folderMeta = findFolder(foundEvent.subAlbums, albumId);
        if (!folderMeta) throw new Error("Folder not found in this event");

        setEvent(foundEvent);
        setCurrentFolder(folderMeta);
        setContent(foundData.content);
        setParentFolderId(foundData.parentFolderId);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventId, albumId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
        Loading album…
      </div>
    );
  }

  if (error || !event || !currentFolder || !content) {
    return (
      <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
        <h2>Unable to load album</h2>
        <p style={{ color: "var(--silver-dim)", marginTop: "16px" }}>{error}</p>
        <Link to="/archive" className="btn btn-ghost" style={{ marginTop: "24px" }}>
          ← Back to Archive
        </Link>
      </div>
    );
  }

  // Determine back link:
  // If the parent folder ID equals the event ID, we go back to the EventPage.
  // Otherwise, we go back to the parent SubAlbumPage.
  const backLink = parentFolderId === event.id 
    ? `/event/${event.id}` 
    : `/event/${event.id}/album/${parentFolderId}`;
    
  // Label for the back button
  // We'd have to find the parent folder's name to be perfectly accurate, but "Back" is safe.
  const backLabel = parentFolderId === event.id ? `Back to ${event.name}` : "Back";

  const hasSubAlbums = content.subAlbums.length > 0;
  const hasDirectPhotos = content.directPhotos.length > 0;
  const isEmpty = !hasSubAlbums && !hasDirectPhotos;

  return (
    <>
      <section className="hero-sub on-paper">
        <div className="container">
          <Link to={backLink} className="eyebrow" style={{ color: "var(--brass)", textDecoration: "none" }}>
            ← {backLabel}
          </Link>
          <h1 style={{ marginTop: "16px", fontSize: "clamp(38px,5.5vw,64px)" }}>
            {currentFolder.name}
          </h1>
          <p style={{ marginTop: "18px", color: "var(--silver)", fontSize: "16px" }}>
            {currentFolder.photoCount} photograph{currentFolder.photoCount === 1 ? "" : "s"}
          </p>
          <a
            href={currentFolder.driveUrl}
            target="_blank"
            rel="noopener"
            className="btn btn-ghost btn-sm"
            style={{ marginTop: "20px" }}
          >
            Open this album in Google Drive →
          </a>
        </div>
      </section>

      {/* ================= MIXED CONTENT ================= */}
      
      {isEmpty && (
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
          <p style={{ color: "var(--silver-dim)" }}>No photos or folders here yet.</p>
        </div>
      )}

      {hasSubAlbums && (
        <section style={{ paddingTop: "60px", paddingBottom: hasDirectPhotos ? "0" : "80px" }}>
          <div className="container">
            <h2 style={{ fontSize: "24px", marginBottom: "32px", borderBottom: "1px solid var(--ink-soft)", paddingBottom: "16px" }}>
              Folders
            </h2>
            <div className="album-grid">
              {content.subAlbums.map((nestedAlbum) => (
                <AlbumCard key={nestedAlbum.id} item={nestedAlbum} parentEventId={event.id} />
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
                Photographs
              </h2>
            )}
          </div>
          <Gallery files={content.directPhotos} title={currentFolder.name} driveUrl={currentFolder.driveUrl} />
        </section>
      )}
    </>
  );
}
