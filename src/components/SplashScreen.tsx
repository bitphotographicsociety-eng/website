import { useState, useEffect } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isFading, setIsFading] = useState(false);

  // Fallback in case the video fails to load or autoplay is blocked
  useEffect(() => {
    const timer = setTimeout(() => {
      finish();
    }, 8000); // Max wait time 8 seconds

    return () => clearTimeout(timer);
  }, []);

  const finish = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 500); // 500ms fade out duration
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000000",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: isFading ? 0 : 1,
        transition: "opacity 0.5s ease-in-out",
        pointerEvents: isFading ? "none" : "all",
      }}
    >
      <video
        src="/loading%20screen.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        onError={finish}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none", // Prevent right click / interaction
          outline: "none",
        }}
      />
    </div>
  );
}
