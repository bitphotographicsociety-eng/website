/* ==========================================================================
   PSOC Archive — data layer
   --------------------------------------------------------------------------
   In production this file is replaced by calls to a real database (Postgres,
   Airtable, Google Sheets-as-DB, Firebase, etc). The shape below is the
   Event schema described in the brief and is exactly what the admin panel
   writes to. Nothing here stores photographs — only metadata + a Drive URL.
   ========================================================================== */

const PSOC_SOCIAL = {
  instagram: "https://www.instagram.com/bitd.psoc?igsi=MWkweW5uZDJkYWZpcg==",
  linkedin:  "https://www.linkedin.com/company/bitd-psoc/"
};

/**
 * Homepage announcement bar. Set `active` to false to hide it without
 * deleting the content. Only one announcement shows at a time.
 */
const PSOC_ANNOUNCEMENT = {
  active: true,
  text: "Sports Day 2025 album is live — every frame from the day, in one folder.",
  linkText: "Open the Drive folder",
  url: "https://drive.google.com/drive/folders/1z3s5XoOeFmSAww7TRcYx7Feny88Yst_u"
};

/**
 * Event object shape (per spec):
 * id, title, date, year, category, description, cover_image,
 * google_drive_url, drive_folder_id (derived, used for gallery preview),
 * photo_count, photographer, published
 */
const PSOC_EVENTS = [
  {
    id: "evt-2026-orientation",
    title: "Orientation Week",
    date: "2026-08-03",
    year: 2026,
    category: "Campus Events",
    description: "First frames of a new batch — registration lines, campus tours and the earliest candid portraits of the incoming class.",
    cover_image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/1a2b3c4d5e6f-orientation-2026",
    drive_folder_id: "1a2b3c4d5e6f-orientation-2026",
    photo_count: 86,
    photographer: "PSOC Editorial Team",
    published: true
  },
  {
    id: "evt-2026-freshers",
    title: "Freshers' Night",
    date: "2026-08-22",
    year: 2026,
    category: "Freshers",
    description: "Stage lights, first-year performances and the traditional welcome address, shot across the main auditorium.",
    cover_image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/2b3c4d5e6f7g-freshers-2026",
    drive_folder_id: "2b3c4d5e6f7g-freshers-2026",
    photo_count: 214,
    photographer: "A. Kapoor, R. Sen",
    published: true
  },
  {
    id: "evt-2026-independence-day",
    title: "Independence Day",
    date: "2026-08-15",
    year: 2026,
    category: "Society Events",
    description: "Flag hoisting, the morning parade and campus celebrations documented from sunrise through the closing ceremony.",
    cover_image: "https://images.unsplash.com/photo-1601987077677-5346c0c57d3f?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/3c4d5e6f7g8h-independence-2026",
    drive_folder_id: "3c4d5e6f7g8h-independence-2026",
    photo_count: 147,
    photographer: "PSOC Editorial Team",
    published: true
  },
  {
    id: "evt-2026-cultural-fest",
    title: "Aperture — Cultural Fest",
    date: "2026-10-11",
    year: 2026,
    category: "Fests",
    description: "Three days of music, dance and street theatre across the main lawns, backstage and the open-air amphitheatre.",
    cover_image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/4d5e6f7g8h9i-culturalfest-2026",
    drive_folder_id: "4d5e6f7g8h9i-culturalfest-2026",
    photo_count: 512,
    photographer: "PSOC Full Crew",
    published: true
  },
  {
    id: "evt-2026-sports-meet",
    title: "Annual Sports Meet",
    date: "2026-11-02",
    year: 2026,
    category: "Sports Events",
    description: "Track finals, the tug-of-war final and the closing medal ceremony at the athletics ground.",
    cover_image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/5e6f7g8h9i0j-sportsmeet-2026",
    drive_folder_id: "5e6f7g8h9i0j-sportsmeet-2026",
    photo_count: 168,
    photographer: "N. Verma",
    published: true
  },
  {
    id: "evt-2026-portrait-workshop",
    title: "Available-Light Portraiture Workshop",
    date: "2026-09-14",
    year: 2026,
    category: "Workshops",
    description: "A hands-on Sunday session on shooting portraits with only window light, led by the society's senior batch.",
    cover_image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/6f7g8h9i0j1k-workshop-2026",
    drive_folder_id: "6f7g8h9i0j1k-workshop-2026",
    photo_count: 41,
    photographer: "PSOC Editorial Team",
    published: true
  },
  {
    id: "evt-2026-street-comp",
    title: "Frame/Work — Street Photography Contest",
    date: "2026-12-06",
    year: 2026,
    category: "Competitions",
    description: "Entries and the judging evening for the society's open street-photography competition.",
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/7g8h9i0j1k2l-streetcomp-2026",
    drive_folder_id: "7g8h9i0j1k2l-streetcomp-2026",
    photo_count: 0,
    photographer: "",
    published: false
  },
  {
    id: "evt-2025-sports-day",
    title: "Sports Day 2025",
    date: "2025-11-15",
    year: 2025,
    category: "Sports Events",
    description: "Track events, the tug-of-war final and the closing medal ceremony — the full day, shot end to end.",
    cover_image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/1z3s5XoOeFmSAww7TRcYx7Feny88Yst_u",
    drive_folder_id: "1z3s5XoOeFmSAww7TRcYx7Feny88Yst_u",
    photo_count: 0,
    photographer: "PSOC Editorial Team",
    published: true
  },
  {
    id: "evt-2025-farewell",
    title: "Farewell — Batch of 2025",
    date: "2025-05-18",
    year: 2025,
    category: "Farewell",
    description: "The send-off for the graduating batch — candid portraits, the felicitation ceremony and the last group photograph on the front steps.",
    cover_image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/8h9i0j1k2l3m-farewell-2025",
    drive_folder_id: "8h9i0j1k2l3m-farewell-2025",
    photo_count: 233,
    photographer: "PSOC Editorial Team",
    published: true
  },
  {
    id: "evt-2025-cultural-fest",
    title: "Aperture — Cultural Fest",
    date: "2025-10-09",
    year: 2025,
    category: "Fests",
    description: "The previous edition of the society's flagship fest coverage, from the inaugural lamp-lighting to the closing DJ night.",
    cover_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/9i0j1k2l3m4n-culturalfest-2025",
    drive_folder_id: "9i0j1k2l3m4n-culturalfest-2025",
    photo_count: 478,
    photographer: "PSOC Full Crew",
    published: true
  },
  {
    id: "evt-2025-orientation",
    title: "Orientation Week",
    date: "2025-08-04",
    year: 2025,
    category: "Campus Events",
    description: "The batch of 2029 arrives on campus — registration day and the first campus walkthroughs.",
    cover_image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/0j1k2l3m4n5o-orientation-2025",
    drive_folder_id: "0j1k2l3m4n5o-orientation-2025",
    photo_count: 94,
    photographer: "PSOC Editorial Team",
    published: true
  },
  {
    id: "evt-2025-tech-fest",
    title: "Ingenuity — Tech Fest",
    date: "2025-02-21",
    year: 2025,
    category: "Fests",
    description: "Robotics demos, the hackathon floor and the closing keynote, covered across two days.",
    cover_image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/1k2l3m4n5o6p-techfest-2025",
    drive_folder_id: "1k2l3m4n5o6p-techfest-2025",
    photo_count: 302,
    photographer: "K. Iyer, PSOC Crew",
    published: true
  },
  {
    id: "evt-2024-freshers",
    title: "Freshers' Night",
    date: "2024-08-19",
    year: 2024,
    category: "Freshers",
    description: "The earliest archive entry — scanned from the society's first fully-digital coverage.",
    cover_image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop",
    google_drive_url: "https://drive.google.com/drive/folders/2l3m4n5o6p7q-freshers-2024",
    drive_folder_id: "2l3m4n5o6p7q-freshers-2024",
    photo_count: 176,
    photographer: "PSOC Editorial Team",
    published: true
  }
];

/* ---- helpers used across pages ---- */
function psocGetPublishedEvents(){
  return PSOC_EVENTS.filter(e => e.published);
}
function psocGetEventsByYear(){
  const years = {};
  psocGetPublishedEvents().forEach(e => {
    years[e.year] = years[e.year] || [];
    years[e.year].push(e);
  });
  return Object.keys(years)
    .sort((a,b) => b - a)
    .map(y => ({ year: Number(y), events: years[y].sort((a,b) => new Date(b.date) - new Date(a.date)) }));
}
function psocGetEventById(id){
  return PSOC_EVENTS.find(e => e.id === id);
}
function psocFormatDate(iso){
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { day:"2-digit", month:"short", year:"numeric" });
}
function psocCategories(){
  return [...new Set(PSOC_EVENTS.map(e => e.category))].sort();
}
