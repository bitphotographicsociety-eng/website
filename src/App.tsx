/* ==========================================================================
   App shell — React Router + layout (header / footer / toast)
   ========================================================================== */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastProvider } from "./hooks/useToast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import SplashScreen from "./components/SplashScreen";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ArchivePage from "./pages/ArchivePage";
import EventPage from "./pages/EventPage";
import SubAlbumPage from "./pages/SubAlbumPage";
import AdminPage from "./pages/AdminPage";

/** Scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Layout that wraps pages with header + footer (except admin) */
function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isAdmin = pathname === "/admin";

  return (
    <>
      {!isAdmin && <Header />}
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <BrowserRouter>
        <ToastProvider>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/event/:id" element={<EventPage />} />
              <Route path="/event/:eventId/album/:albumId" element={<SubAlbumPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Layout>
          <Toast />
        </ToastProvider>
      </BrowserRouter>
    </>
  );
}
