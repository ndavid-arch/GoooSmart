import { IconSearch, IconUser, IconX } from "./Icons";

/**
 * Floating search + avatar that sits on top of the map, as in the wireframe.
 * Search is controlled by the screen so it can filter live data.
 */
export default function TopBar({ query = "", onQuery, onProfile, placeholder = "Where to?" }) {
  return (
    <div className="topbar">
      <div className="search-box">
        <IconSearch c="var(--dim)" />
        <input
          value={query}
          onChange={(e) => onQuery?.(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {query.length > 0 && (
          <button className="icon-btn" onClick={() => onQuery?.("")} aria-label="Clear search" style={{ color: "var(--dim)" }}>
            <IconX size={14} />
          </button>
        )}
      </div>
      <button className="avatar-btn" onClick={onProfile} aria-label="Open profile">
        <IconUser c="#ffffff" size={22} />
      </button>
    </div>
  );
}
