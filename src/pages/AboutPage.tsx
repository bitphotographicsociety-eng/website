/* ==========================================================================
   About page — story, values, timeline, follow
   ========================================================================== */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PSOC_SOCIAL, PSOC_MOTTO } from "../data/events";
import { getEvents } from "../services/driveApi";
import { ICONS } from "../components/Header";
import type { PsocEvent } from "../types";

export default function AboutPage() {
  const [events, setEvents] = useState<PsocEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then((list) => {
        setEvents(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const years = new Set(events.map((e) => e.year).filter((y) => y !== null));

  return (
    <>
      {/* ================= PAGE HERO ================= */}
      <section className="hero-sub">
        <div className="container">
          <span className="eyebrow">Est. 2009</span>
          <h1
            style={{
              marginTop: "16px",
              fontSize: "clamp(38px,5.5vw,64px)",
              maxWidth: "18ch",
            }}
          >
            The society behind the archive.
          </h1>
          <p
            style={{
              marginTop: "18px",
              color: "var(--silver)",
              maxWidth: "58ch",
              fontSize: "16px",
            }}
          >
            PSOC is the institute's student-run photography society —{" "}
            <em style={{ color: "var(--brass)" }}>{PSOC_MOTTO}</em>. This page is the short
            version of who we are — the full record of what we've shot lives in{" "}
            <Link to="/archive" style={{ textDecoration: "underline" }}>
              the archive
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section id="about" className="on-paper">
        <div className="container about-grid">
          <div className="about-photo">
            <img
              src="https://images.unsplash.com/photo-1520390138845-fd2d229dd553?q=80&w=1200&auto=format&fit=crop"
              alt="PSOC members shooting on campus"
            />
          </div>
          <div className="about-copy">
            <span className="eyebrow">Our story</span>
            <h2 style={{ marginTop: "14px", fontSize: "clamp(28px,4vw,42px)" }}>
              We document the institute, on purpose.
            </h2>
            <p>
              Every fest, match, workshop and ordinary Tuesday on campus gets
              covered by our members, and every album we shoot becomes a
              permanent part of this archive — not a highlight reel that
              disappears after the semester ends.
            </p>
            <p>
              Members handle their own equipment and editing; the society's job
              is to make sure the results stay findable for as long as the
              institute exists. No album is ever taken down once it's published
              — that's the whole point of the archive.
            </p>
            <div className="stat-row">
              <div className="stat">
                <b>{loading ? "—" : events.length}</b>
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
          </div>
        </div>
      </section>

      {/* ================= WHAT WE DO ================= */}
      <section>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">How the society runs</span>
              <h2>Three jobs, one archive.</h2>
              <p>Everything PSOC does folds back into the same permanent index.</p>
            </div>
          </div>
          <div className="value-grid">
            <div className="value-card">
              <span className="num">01</span>
              <h3>Cover</h3>
              <p>
                Members shoot every fest, match, workshop and ceremony on
                campus, on their own gear, in their own editing style.
              </p>
            </div>
            <div className="value-card">
              <span className="num">02</span>
              <h3>Catalogue</h3>
              <p>
                Each shoot becomes a folder in Google Drive using the{" "}
                <code style={{ color: "var(--brass)", fontSize: "12px" }}>YYYY - Event Name</code>{" "}
                convention, with an optional cover.jpg for the thumbnail.
              </p>
            </div>
            <div className="value-card">
              <span className="num">03</span>
              <h3>Keep</h3>
              <p>
                Published albums stay online indefinitely. Nothing gets deleted
                at the end of a semester or when a batch graduates.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* ================= FLAGSHIP EVENTS ================= */}
      <section className="on-paper">
        <div className="container">
          <div className="section-head" style={{ marginBottom: "48px" }}>
            <div>
              <span className="eyebrow">Our legacy</span>
              <h2>Flagship Events</h2>
              <p>Beyond daily coverage, PSOC hosts and preserves the institute's most anticipated photography traditions.</p>
            </div>
          </div>

          {(() => {
            const flagships = [
              {
                key: "paradolia",
                match: /paradoli/i,
                logo: "/Paradoliya%20Logo%20Without%20Name.png",
                name: "Paradolia",
                desc: "Our annual flagship photography exhibition and competition. Paradolia brings together the best visual storytellers, showcasing the most striking frames captured throughout the year and setting the standard for creative excellence on campus.",
              },
              {
                key: "annuvia",
                match: /annuvi/i,
                logo: "/Annuvia%20Logo%20without%20Name.png",
                name: "Annuvia",
                desc: "The traditional group photograph of the passing batch and all institute societies. Annuvia is our most coordinated and historic annual project, ensuring that every graduating batch is permanently immortalized in the PSOC archives before they leave campus.",
              },
            ];

            return flagships.map((fs, idx) => {
              // Find the latest Drive event matching this flagship name
              const matched = events
                .filter((e) => fs.match.test(e.driveFolderName))
                .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
              const latest = matched[0] || null;

              return (
                <div
                  key={fs.key}
                  className="flagship-card"
                  style={{ marginBottom: idx < flagships.length - 1 ? "48px" : "0" }}
                >
                  <div className="flagship-logo">
                    <img src={fs.logo} alt={`${fs.name} Logo`} />
                  </div>
                  <div className="flagship-info">
                    <h3 style={{ fontSize: "24px", marginBottom: "6px", color: "var(--brass)" }}>
                      {fs.name}
                      {latest?.year && (
                        <span style={{ fontSize: "14px", color: "var(--silver-dim)", marginLeft: "12px", fontWeight: 400 }}>
                          Latest: {latest.year}
                        </span>
                      )}
                    </h3>
                    <p>{fs.desc}</p>
                    {latest ? (
                      <Link
                        to={`/event/${latest.id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: "18px" }}
                      >
                        View {fs.name} {latest.year} →
                      </Link>
                    ) : (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "18px",
                          fontFamily: "var(--f-mono)",
                          fontSize: "12px",
                          color: "var(--silver-dim)",
                        }}
                      >
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              );
            });
          })()}
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
