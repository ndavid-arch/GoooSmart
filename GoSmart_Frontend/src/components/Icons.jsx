/**
 * Line-art icon set matching the GoSmart wireframe. Every icon inherits
 * `currentColor` unless a colour is passed, so they re-theme automatically.
 */

const base = (size) => ({ width: size, height: size, fill: "none", xmlns: "http://www.w3.org/2000/svg" });

export const IconSearch = ({ size = 16, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 16 16">
    <circle cx="7" cy="7" r="4.5" stroke={c} strokeWidth="1.5" />
    <path d="M11 11l2.5 2.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconUser = ({ size = 22, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 22 22">
    <circle cx="11" cy="8" r="4" fill={c} />
    <path d="M3 21c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconBack = ({ size = 20, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 20 20">
    <path d="M13 4l-6 6 6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconChevron = ({ size = 14, c = "currentColor", up = false }) => (
  <svg {...base(size)} viewBox="0 0 14 14" style={{ transform: up ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <path d="M4 5l3 3 3-3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconChevronRight = ({ size = 14, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 14 14">
    <path d="M5 3l4 4-4 4" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconX = ({ size = 16, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 16 16">
    <path d="M4 4l8 8M12 4l-8 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconBus = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <rect x="2" y="4" width="14" height="10" rx="3" stroke={c} strokeWidth="1.4" />
    <rect x="4" y="7" width="4" height="3" rx="1" fill={c} />
    <rect x="10" y="7" width="4" height="3" rx="1" fill={c} />
    <circle cx="5.5" cy="15.5" r="1.5" fill={c} />
    <circle cx="12.5" cy="15.5" r="1.5" fill={c} />
  </svg>
);

export const IconRoute = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <circle cx="4" cy="14" r="2.5" stroke={c} strokeWidth="1.4" />
    <circle cx="14" cy="4" r="2.5" stroke={c} strokeWidth="1.4" />
    <path d="M6 12Q9 9 12 6" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconBell = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <path d="M9 2a5 5 0 0 1 5 5c0 3.5 1.5 4.5 2 5H2c.5-.5 2-1.5 2-5a5 5 0 0 1 5-5z" stroke={c} strokeWidth="1.4" />
    <path d="M7 14c0 1.1.9 2 2 2s2-.9 2-2" stroke={c} strokeWidth="1.4" />
  </svg>
);

export const IconMoon = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <path d="M15 11A7 7 0 1 1 7 3a5 5 0 0 0 8 8z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

export const IconLocation = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <circle cx="9" cy="8" r="3" stroke={c} strokeWidth="1.4" />
    <path d="M9 2a6 6 0 0 1 6 6c0 4-6 10-6 10S3 12 3 8a6 6 0 0 1 6-6z" stroke={c} strokeWidth="1.4" />
  </svg>
);

export const IconTarget = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <circle cx="9" cy="9" r="6.5" stroke={c} strokeWidth="1.4" />
    <circle cx="9" cy="9" r="2.4" fill={c} />
    <path d="M9 1v2M9 15v2M1 9h2M15 9h2" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconFlag = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <path d="M4 3v12M4 3h10l-2.5 4.5L14 12H4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconShield = ({ size = 20, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 20 20">
    <path d="M10 2L4 5v5c0 3.87 2.56 7.29 6 8 3.44-.71 6-4.13 6-8V5l-6-3z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const IconClipboard = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <rect x="4" y="3" width="10" height="13" rx="2" stroke={c} strokeWidth="1.4" />
    <path d="M7 3V2h4v1M6 8h6M6 11h4" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconLogout = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <path d="M7 16H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <path d="M12 13l4-4-4-4M16 9H7" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconCog = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <circle cx="9" cy="9" r="2.6" stroke={c} strokeWidth="1.4" />
    <path
      d="M9 1.8v1.6M9 14.6v1.6M2.9 5.5l1.4.8M13.7 11.7l1.4.8M2.9 12.5l1.4-.8M13.7 6.3l1.4-.8"
      stroke={c}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

export const IconClock = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <circle cx="9" cy="9" r="6.5" stroke={c} strokeWidth="1.4" />
    <path d="M9 5.5V9l2.5 2" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconStar = ({ size = 18, c = "currentColor", filled = false }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <path
      d="M9 2l2 4.4 4.8.6-3.5 3.3.9 4.7L9 12.7 4.8 15l.9-4.7L2.2 7l4.8-.6L9 2z"
      stroke={c}
      strokeWidth="1.4"
      strokeLinejoin="round"
      fill={filled ? c : "none"}
    />
  </svg>
);

export const IconCone = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <path d="M9 2l5 12H4L9 2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6.4 8h5.2M2 15.5h14" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconCheck = ({ size = 16, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 16 16">
    <path d="M3 8.5l3.2 3.2L13 5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconStop = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <path d="M9 16V8" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <rect x="3.5" y="2" width="11" height="7" rx="2" stroke={c} strokeWidth="1.4" />
  </svg>
);

export const IconBroadcast = ({ size = 18, c = "currentColor" }) => (
  <svg {...base(size)} viewBox="0 0 18 18">
    <circle cx="9" cy="9" r="2" fill={c} />
    <path d="M5.5 5.5a5 5 0 0 0 0 7M12.5 5.5a5 5 0 0 1 0 7M3 3a8.5 8.5 0 0 0 0 12M15 3a8.5 8.5 0 0 1 0 12" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** The GoSmart mark — a rounded bus glyph. */
export const LogoMark = ({ size = 38, bg = "var(--brand)", fg = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="14" width="38" height="24" rx="7" fill={fg} />
    <rect x="11" y="18" width="12" height="8" rx="2" fill={bg} />
    <rect x="29" y="18" width="12" height="8" rx="2" fill={bg} />
    <rect x="11" y="30" width="30" height="3" rx="1.5" fill={bg} opacity="0.35" />
    <circle cx="15" cy="41" r="4.5" fill={fg} />
    <circle cx="37" cy="41" r="4.5" fill={fg} />
    <circle cx="15" cy="41" r="2" fill={bg} />
    <circle cx="37" cy="41" r="2" fill={bg} />
  </svg>
);

/* Bottom-nav icons take an `active` flag so the fill can change. */
export const TabMap = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="9" width="14" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.6" fill={active ? "var(--brand-tint-strong)" : "none"} />
    <path d="M10 2l-7 7h14l-7-7z" fill="currentColor" />
  </svg>
);

export const TabRoutes = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="16" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" fill={active ? "var(--brand-tint-strong)" : "none"} />
    <rect x="4.5" y="7.5" width="4" height="3" rx="1" fill="currentColor" />
    <rect x="11.5" y="7.5" width="4" height="3" rx="1" fill="currentColor" />
  </svg>
);

export const TabAlerts = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 3a5 5 0 0 1 5 5c0 4 1.5 5 2 5.5H3c.5-.5 2-1.5 2-5.5a5 5 0 0 1 5-5z"
      stroke="currentColor"
      strokeWidth="1.6"
      fill={active ? "var(--brand-tint-strong)" : "none"}
    />
    <path d="M8 16c0 1.1.9 2 2 2s2-.9 2-2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const TabReports = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2.5" width="12" height="15" rx="3" stroke="currentColor" strokeWidth="1.6" fill={active ? "var(--brand-tint-strong)" : "none"} />
    <path d="M7.5 7h5M7.5 10.5h5M7.5 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const TabAdmin = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="3" width="15" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" fill={active ? "var(--brand-tint-strong)" : "none"} />
    <path d="M2.5 8h15M8 8v9" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);