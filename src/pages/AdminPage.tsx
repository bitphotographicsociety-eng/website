/* ==========================================================================
   Admin page — Drive-as-CMS info page
   --------------------------------------------------------------------------
   Google Drive is the CMS. No admin CRUD needed.
   This page explains how to manage albums via Drive.
   ========================================================================== */

import { Link } from "react-router-dom";
import { PSOC_MOTTO } from "../data/events";
import { DRIVE_FOLDER_ID } from "../config/googleDrive";

export default function AdminPage() {
  const rootUrl = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <Link to="/" className="brand" style={{ fontSize: "16px" }}>
          <span className="mark" style={{ width: "26px", height: "26px" }}></span>{" "}
          PSOC Admin
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            to="/archive"
            style={{ fontFamily: "var(--f-mono)", fontSize: "12px", color: "var(--silver)" }}
          >
            View public archive →
          </Link>
        </div>
      </div>

      <div className="admin-body container">
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <span className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>
            {PSOC_MOTTO}
          </span>
          <h1 style={{ marginTop: "24px", fontSize: "clamp(28px, 4vw, 42px)", textAlign: "center" }}>
            Managing the Archive
          </h1>
          <p style={{ color: "var(--silver)", marginTop: "16px", textAlign: "center", fontSize: "16px" }}>
            The PSOC archive is powered entirely by Google Drive. No code changes are needed to add, update, or remove albums.
          </p>

          <div className="value-grid" style={{ marginTop: "56px" }}>
            <div className="value-card">
              <span className="num">01</span>
              <h3>Add an album</h3>
              <p>
                Create a folder in the PSOC root Drive folder using the naming convention:
                <br /><br />
                <code style={{ color: "var(--brass)", fontFamily: "var(--f-mono)", fontSize: "13px" }}>
                  YYYY - Event Name
                </code>
                <br /><br />
                Example: <strong>2026 - Freshers</strong>
              </p>
            </div>
            <div className="value-card">
              <span className="num">02</span>
              <h3>Upload photos</h3>
              <p>
                Upload your photographs into the event folder. Add a file called
                <code style={{ color: "var(--brass)", fontFamily: "var(--f-mono)", fontSize: "13px" }}> cover.jpg</code>
                {" "}to choose the album thumbnail. If none is provided, the first image is used.
              </p>
            </div>
            <div className="value-card">
              <span className="num">03</span>
              <h3>Sub-albums</h3>
              <p>
                To group photos (e.g. by day), create folders <em>inside</em> the event folder. Each folder becomes a sub-album.
              </p>
            </div>
            <div className="value-card">
              <span className="num">04</span>
              <h3>Done</h3>
              <p>
                The website automatically discovers new albums within 5 minutes. No deploy needed — Google Drive is the CMS.
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <a
              href={rootUrl}
              target="_blank"
              rel="noopener"
              className="btn btn-primary"
            >
              Open PSOC Drive Folder →
            </a>
          </div>

          <div className="panel" style={{ marginTop: "48px" }}>
            <h3 style={{ fontSize: "16px" }}>Naming Convention</h3>
            <p className="hint" style={{ marginBottom: 0 }}>
              Use <code style={{ color: "var(--brass)" }}>YYYY - Event Name</code> for automatic year detection and sorting.
            </p>
            <div style={{ marginTop: "18px", fontFamily: "var(--f-mono)", fontSize: "13px", color: "var(--silver)", lineHeight: 2 }}>
              <div>✓ <span style={{ color: "var(--white)" }}>2026 - Freshers</span></div>
              <div>✓ <span style={{ color: "var(--white)" }}>2026 - Photography Workshop</span></div>
              <div>✓ <span style={{ color: "var(--white)" }}>2025 - Farewell</span></div>
              <div>✓ <span style={{ color: "var(--white)" }}>2025 - Photowalk</span></div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: "24px" }}>
            <h3 style={{ fontSize: "16px" }}>Album Cover</h3>
            <p className="hint" style={{ marginBottom: 0 }}>
              Upload a file named <code style={{ color: "var(--brass)" }}>cover.jpg</code> (or .png, .webp) inside any event folder to set the album thumbnail.
              This file won't appear in the photo gallery.
            </p>
          </div>

          <div className="panel" style={{ marginTop: "24px" }}>
            <h3 style={{ fontSize: "16px" }}>Remove an Album</h3>
            <p className="hint" style={{ marginBottom: 0 }}>
              Delete or move the folder out of the PSOC root folder in Google Drive. The website will stop showing it after the cache expires (~5 minutes).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
