/* ==========================================================================
   Archive page — albums grouped by year, search, async from Drive
   ========================================================================== */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getEvents } from "../services/driveApi";
import { groupAlbumsByYear } from "../utils/albumMetadata";
import AlbumCard from "../components/AlbumCard";
import type { PsocEvent, AlbumYearGroup } from "../types";

function AlbumSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <article key={i} className="album-card">
          <div className="thumb">
            <div className="skeleton" style={{ width: "100%", height: "100%" }} />
          </div>
        </article>
      ))}
    </>
  );
}

export default function ArchivePage() {
  const [events, setEvents] = useState<PsocEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const location = useLocation();

  const loadArchive = () => {
    setLoading(true);
    setError(null);
    getEvents()
      .then((list) => {
        setEvents(list);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadArchive();
  }, []);

  // Deep-link to year anchor
  useEffect(() => {
    if (!loading && location.hash) {
      setTimeout(() => {
        document
          .querySelector(location.hash)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [loading, location.hash]);

  // Filter by search query
  const filtered = query
    ? events.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.driveFolderName.toLowerCase().includes(query)
      )
    : events;

  const groups: AlbumYearGroup[] = groupAlbumsByYear(filtered);
  const isEmptyArchive = !loading && !error && events.length === 0 && !query;

  return (
    <>
      <section style={{ paddingBottom: 0 }}>
        <div className="container">
          <span className="eyebrow">The full archive</span>
          <h1
            style={{
              marginTop: "16px",
              fontSize: "clamp(36px,5vw,58px)",
              maxWidth: "16ch",
            }}
          >
            Every album, every year.
          </h1>
          <p
            style={{
              marginTop: "16px",
              color: "var(--silver)",
              maxWidth: "56ch",
              fontSize: "16px",
            }}
          >
            Photographs stay in Google Drive; this index just points you to the
            right folder. Nothing here expires when the semester does.
          </p>
        </div>

        <div className="container">
          <div className="archive-toolbar">
            <input
              type="search"
              className="search-input"
              placeholder="Search albums…"
              value={query}
              onChange={(e) => setQuery(e.target.value.trim().toLowerCase())}
              style={{ marginLeft: 0 }}
            />
          </div>
        </div>
      </section>

      <div className="container">
        {loading && (
          <div className="year-block">
            <div className="year-heading">
              <span className="num skeleton" style={{ width: "80px", height: "50px", display: "inline-block" }}>&nbsp;</span>
            </div>
            <div className="album-grid compact">
              <AlbumSkeletons count={4} />
            </div>
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: "60px 0 120px" }}>
            <div className="empty-note" style={{ textAlign: "center" }}>
              <p>Unable to load the PSOC archive. Please try again.</p>
              <button className="btn btn-primary" style={{ marginTop: "16px" }} onClick={loadArchive}>
                Retry
              </button>
            </div>
          </div>
        )}

        {isEmptyArchive && (
          <div style={{ padding: "60px 0 120px" }}>
            <div className="empty-note">
              No albums have been added to the Drive archive yet.
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          groups.map((g) => (
            <div
              key={g.label}
              className="year-block"
              id={g.year !== null ? `year-${g.year}` : "year-other"}
            >
              <div className="year-heading">
                <span className="num">{g.label}</span>
                <span className="meta">
                  {g.events.length} event{g.events.length === 1 ? "" : "s"}{" "}
                  archived
                </span>
              </div>
              <div className="album-grid compact">
                {g.events.map((e: PsocEvent) => (
                  <AlbumCard key={e.id} item={e} />
                ))}
              </div>
            </div>
          ))}

        {!loading && !error && groups.length === 0 && query && (
          <div style={{ padding: "60px 0 120px" }}>
            <div className="empty-note">
              No albums match that search yet.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
