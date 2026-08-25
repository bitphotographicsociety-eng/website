/* ==========================================================================
   Home page — hero, featured albums (from Drive), about teaser, follow
   ========================================================================== */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PSOC_SOCIAL, PSOC_MOTTO } from "../data/events";
import { getEvents } from "../services/driveApi";
import { ICONS } from "../components/Header";
import AlbumCard from "../components/AlbumCard";
import type { PsocEvent } from "../types";

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

export default function HomePage() {
  const [events, setEvents] = useState<PsocEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents()
      .then((list) => {
        setEvents(list);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const featured = events.slice(0, 6);
  const totalAlbums = events.length;
  const years = new Set(events.map((e) => e.year).filter((y) => y !== null));

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-media"></div>
        <div className="hero-content">
          <div className="hero-inner">

            <h1>
              Every frame we've shot is <em>still</em> here.
            </h1>
            <p
              style={{
                fontStyle: "italic",
                color: "var(--brass)",
                fontSize: "19px",
                marginTop: "14px",
                fontFamily: "var(--f-display)",
              }}
            >
              {PSOC_MOTTO}
            </p>
            <p>
              PSOC is the institute's photographic society — and this is our
              permanent archive. Browse every event we've documented, organised
              by year, and open the album to find yourself in it.
            </p>
            <div className="hero-actions">
              <Link to="/archive" className="btn btn-primary">
                Explore the Archive
              </Link>
              <a href="#featured" className="btn btn-ghost">
                See recent albums
              </a>
            </div>
          </div>
        </div>
        <div className="hero-strip">
          <div className="sprocket-rail top">
            {Array.from({ length: 80 }, (_, i) => (
              <span key={i}></span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED ALBUMS ================= */}
      <section id="featured">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recently developed</span>
              <h2>Featured albums</h2>
              <p>
                The latest additions to the archive — freshly catalogued and
                ready to view.
              </p>
            </div>
            <Link to="/archive" className="btn btn-ghost">
              Browse full archive
            </Link>
          </div>

          {error && (
            <div className="empty-note">
              Unable to load albums right now. Please try again later.
            </div>
          )}

          <div className="album-grid">
            {loading && <AlbumSkeletons count={6} />}
            {!loading &&
              !error &&
              featured.map((e) => <AlbumCard key={e.id} item={e} />)}
          </div>
        </div>
      </section>

      {/* ================= ABOUT TEASER ================= */}
      <section id="about" className="on-paper">
        <div className="container about-grid">
          <div className="about-photo">
            <img
              src="https://images.unsplash.com/photo-1520390138845-fd2d229dd553?q=80&w=1200&auto=format&fit=crop"
              alt="PSOC members shooting on campus"
            />
          </div>
          <div className="about-copy">
            <span className="eyebrow">About the society</span>
            <h2 style={{ marginTop: "14px", fontSize: "clamp(28px,4vw,42px)" }}>
              We document the institute, on purpose.
            </h2>
            <p>
              PSOC is a student-run photography society. Every fest, match,
              workshop and ordinary Tuesday on campus gets covered by our
              members, and every album we shoot becomes a permanent part of this
              archive — not a highlight reel that disappears after the semester
              ends.
            </p>
            <div className="stat-row">
              <div className="stat">
                <b>{loading ? "—" : totalAlbums}</b>
                <span>Albums archived</span>
              </div>
              <div className="stat">
                <b>{loading ? "—" : years.size}</b>
                <span>Years covered</span>
              </div>
              <div className="stat">
                <b>{loading ? "—" : "Free"}</b>
                <span>Access for all alumni</span>
              </div>
            </div>
            <Link
              to="/about"
              className="btn btn-outline-dark"
              style={{ marginTop: "32px" }}
            >
              Read the full story →
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOLLOW ================= */}
      <section className="follow-band">
        <div className="container">
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            Between albums
          </span>
          <h2 style={{ marginTop: "14px" }}>Follow the society</h2>
          <p>
            Behind-the-scenes shots, open-call announcements and event coverage
            as it happens.
          </p>
          <div className="follow-icons">
            <a href={PSOC_SOCIAL.instagram} target="_blank" rel="noopener">
              {ICONS.instagram}
              Instagram
            </a>
            <a href={PSOC_SOCIAL.linkedin} target="_blank" rel="noopener">
              {ICONS.linkedin}
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
