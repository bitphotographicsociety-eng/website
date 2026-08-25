/* ==========================================================================
   Site header — sticky nav with brand, navigation, social links
   ========================================================================== */

import { NavLink, Link } from "react-router-dom";
import { PSOC_SOCIAL, PSOC_MOTTO } from "../data/events";

/** SVG icon strings reused across components */
export const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10v7M7 7v.01M11 17v-4.5a2.5 2.5 0 0 1 5 0V17M11 10v7" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  drive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 3h8l6 10-4 8H6l-4-8L8 3z" />
      <path d="M2 13h20" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
};

interface HeaderProps {
  active?: string;
}

export default function Header({ active }: HeaderProps) {
  const items = [
    { to: "/", label: "Home" },
    { to: "/archive", label: "Archive" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="site-header">
      <div className="container bar">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="PSOC Logo" className="brand-logo" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--white)" }} />
          <span>
            PSOC
            <small>{PSOC_MOTTO.toUpperCase()}</small>
          </span>
        </Link>

        <nav className="main-nav">
          {items.map((i) => (
            <NavLink
              key={i.label}
              to={i.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {i.label}
            </NavLink>
          ))}

        </nav>

        <div className="header-social">
          <a
            className="icon-link"
            href={PSOC_SOCIAL.instagram}
            target="_blank"
            rel="noopener"
            aria-label="PSOC on Instagram"
          >
            {ICONS.instagram}
          </a>
          <a
            className="icon-link"
            href={PSOC_SOCIAL.linkedin}
            target="_blank"
            rel="noopener"
            aria-label="PSOC on LinkedIn"
          >
            {ICONS.linkedin}
          </a>
        </div>
      </div>
    </header>
  );
}
