/* ==========================================================================
   Site footer
   ========================================================================== */

import { Link } from "react-router-dom";
import { PSOC_SOCIAL, PSOC_MOTTO } from "../data/events";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <img src="/logo.png" alt="PSOC Logo" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid var(--white)", objectFit: "cover" }} />
              <h4 style={{ margin: 0 }}>PSOC</h4>
            </div>
            <p>
              <em>{PSOC_MOTTO}</em> — The Photographic Society is the
              institute's official photography body, documenting campus life
              since 2009 — one frame, one archive at a time.
            </p>
          </div>
          <div>
            <h4>Archive</h4>
            <ul>
              <li>
                <Link to="/archive">Browse albums</Link>
              </li>
              <li>
                <Link to="/#featured">Featured albums</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Society</h4>
            <ul>
              <li>
                <Link to="/about">About PSOC</Link>
              </li>
              <li>
                <a href="mailto:bit.photographicsociety@gmail.com" style={{ textTransform: "none" }}>bit.photographicsociety@gmail.com</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Follow</h4>
            <ul>
              <li>
                <a
                  href={PSOC_SOCIAL.instagram}
                  target="_blank"
                  rel="noopener"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a href={PSOC_SOCIAL.linkedin} target="_blank" rel="noopener">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} The Photographic Society. Photographs
            remain the property of their respective photographers.
          </span>
          <span>
            Archive built to last.
          </span>
        </div>
      </div>
    </footer>
  );
}
