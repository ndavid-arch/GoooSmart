import { useEffect, useState } from "react";
import { LogoMark } from "./Icons";
import { greeting } from "../utils/route";

/**
 * Launch screen: logo, a time-of-day welcome, and a loading animation that runs
 * while the session is restored. Shown once per browser tab.
 */
export default function Splash({ onDone, duration = 2400 }) {
  const [dot, setDot] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setDot((d) => (d + 1) % 3), 460);
    const end = setTimeout(onDone, duration);
    return () => {
      clearInterval(tick);
      clearTimeout(end);
    };
  }, [onDone, duration]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "linear-gradient(155deg,#14532d 0%,#15803d 55%,#16a34a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 26,
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(8px)",
            border: "1.5px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
          }}
        >
          <LogoMark size={52} bg="#16a34a" fg="#ffffff" />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1 }}>
            GoSmart
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 600,
              marginTop: 5,
              letterSpacing: "0.14em",
            }}
          >
            KIGALI TRANSIT
          </div>
        </div>
      </div>

      <div style={{ fontSize: 17, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{greeting()}</div>

      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === dot ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === dot ? "#fff" : "rgba(255,255,255,0.28)",
              transition: "all 0.35s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
