/* ==========================================================================
   Shared chrome: header, footer, mobile nav, toast.
   Rendered via JS so every page (including future ones) stays in sync
   from a single source instead of copy-pasted markup.
   ========================================================================== */

const ICONS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7v.01M11 17v-4.5a2.5 2.5 0 0 1 5 0V17M11 10v7"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  drive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3h8l6 10-4 8H6l-4-8L8 3z"/><path d="M2 13h20"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>`
};

function psocHeader(active){
  const items = [
    { href:"index.html", label:"Home" },
    { href:"albums.html", label:"Archive" },
    { href:"about.html", label:"About" },
  ];
  return `
  <header class="site-header">
    <div class="container bar">
      <a href="index.html" class="brand">
        <span class="mark"></span>
        <span>PSOC<small>THE PHOTOGRAPHIC SOCIETY</small></span>
      </a>
      <nav class="main-nav">
        ${items.map(i => `<a href="${i.href}" class="${active===i.label?'active':''}">${i.label}</a>`).join("")}
        <a href="admin.html" style="color:var(--silver-dim); font-family:var(--f-mono); font-size:12px;">Admin →</a>
      </nav>
      <div class="header-social">
        <a class="icon-link" href="${PSOC_SOCIAL.instagram}" target="_blank" rel="noopener" aria-label="PSOC on Instagram">${ICONS.instagram}</a>
        <a class="icon-link" href="${PSOC_SOCIAL.linkedin}" target="_blank" rel="noopener" aria-label="PSOC on LinkedIn">${ICONS.linkedin}</a>
      </div>
    </div>
  </header>`;
}

function psocFooter(){
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>PSOC</h4>
          <p>The Photographic Society is the institute's official photography body, documenting campus life since 2009 — one frame, one archive at a time.</p>
        </div>
        <div>
          <h4>Archive</h4>
          <ul>
            <li><a href="albums.html">Browse by year</a></li>
            <li><a href="albums.html">Browse by category</a></li>
            <li><a href="index.html#featured">Featured albums</a></li>
          </ul>
        </div>
        <div>
          <h4>Society</h4>
          <ul>
            <li><a href="about.html">About PSOC</a></li>
            <li><a href="admin.html">Admin login</a></li>
            <li><a href="mailto:psoc@institute.edu">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Follow</h4>
          <ul>
            <li><a href="${PSOC_SOCIAL.instagram}" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="${PSOC_SOCIAL.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} The Photographic Society. Photographs remain the property of their respective photographers.</span>
        <span>Archive built to last. <a href="admin.html">Admin</a></span>
      </div>
    </div>
  </footer>`;
}

function psocSprocketRail(count){
  return `<span></span>`.repeat(count);
}

function psocMountChrome(active){
  document.getElementById("psoc-header").innerHTML = psocHeader(active);
  document.getElementById("psoc-footer").innerHTML = psocFooter();
}

/* ---------- announcement bar (opt-in per page) ---------- */
const ANNOUNCEMENT_ICONS = {
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>`
};

function psocMountAnnouncement(){
  const mount = document.getElementById("psoc-announcement");
  if(!mount) return;
  if(!PSOC_ANNOUNCEMENT || !PSOC_ANNOUNCEMENT.active) return;

  // Dismissed for this browser tab only — reappears next session.
  let dismissed = "";
  try{ dismissed = sessionStorage.getItem("psoc_announcement_dismissed"); } catch(e){}
  if(dismissed === PSOC_ANNOUNCEMENT.text) return;

  mount.innerHTML = `
    <div class="announcement-bar">
      <div class="container">
        <span class="dot"></span>
        <p>${PSOC_ANNOUNCEMENT.text}</p>
        <a class="announcement-link" href="${PSOC_ANNOUNCEMENT.url}" target="_blank" rel="noopener">${PSOC_ANNOUNCEMENT.linkText} ${ICONS.arrow}</a>
        <button class="announcement-close" id="announcement-close" aria-label="Dismiss announcement">${ANNOUNCEMENT_ICONS.close}</button>
      </div>
    </div>`;

  document.getElementById("announcement-close").addEventListener("click", () => {
    mount.innerHTML = "";
    try{ sessionStorage.setItem("psoc_announcement_dismissed", PSOC_ANNOUNCEMENT.text); } catch(e){}
  });
}

function psocToast(msg){
  let el = document.querySelector(".toast");
  if(!el){
    el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `${ICONS.check}<span></span>`;
    document.body.appendChild(el);
  }
  el.querySelector("span").textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
}
