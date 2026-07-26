/**
 * Route presentation helpers. The backend identifies routes by name, not by a
 * line number, so the Transit-style badge is derived here and kept stable by id.
 */

const PALETTE = ["#16a34a", "#2563eb", "#ea580c", "#7c3aed", "#0891b2", "#db2777"];

/** Stable colour for a route id — the same route always gets the same colour. */
export function routeColor(routeId) {
  if (routeId == null) return "#71717a";
  const n = Number(routeId);
  if (Number.isNaN(n)) return PALETTE[0];
  return PALETTE[Math.abs(n) % PALETTE.length];
}

/**
 * Short badge label for a route. Riders and drivers know lines by their number
 * (305, 101), so that wins; older records without one fall back to a number in
 * the name, then to the initials of the endpoints ("Nyabugogo–Kimironko" → "NK").
 */
export function routeLabel(route) {
  if (!route) return "??";
  if (route.route_number) return route.route_number;

  const name = route.route_name || "";
  const digits = name.match(/\d{1,3}/);
  if (digits) return digits[0];

  const ends = [route.start_point, route.end_point].filter(Boolean);
  if (ends.length === 2) {
    return ends.map((p) => p.trim()[0] ?? "").join("").toUpperCase();
  }

  const words = name.split(/[\s–—-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "??";
}

/**
 * How a bus is labelled to riders. They recognise the line long before the
 * plate, so the route leads and the plate is the supporting detail; a bus with
 * no route falls back to its plate so the row is never headed by a placeholder.
 */
export function busLines(bus) {
  if (!bus) return { title: "", sub: "" };
  return bus.route_name
    ? { title: bus.route_name, sub: bus.plate_no }
    : { title: bus.plate_no, sub: "No route assigned" };
}

/** The route fields a bus carries, shaped like a route for badge rendering. */
export function busRoute(bus) {
  if (!bus) return null;
  return { id: bus.route, route_number: bus.route_number, route_name: bus.route_name };
}

const norm = (value) => (value ?? "").toString().toLowerCase().trim();

/**
 * Does a route match what the rider typed? Riders search one of three ways:
 * the line number ("305"), the line name, or simply where they want to go — so
 * every stop along the route is matched too, not just its endpoints.
 */
export function routeMatches(route, query) {
  const q = norm(query);
  if (!q) return false;

  const onRoute = [route?.route_number, route?.route_name, route?.start_point, route?.end_point];
  if (onRoute.some((field) => norm(field).includes(q))) return true;

  return (route?.route_stops || []).some((rs) => norm(rs.stop_name).includes(q));
}

/** Ranks number matches above name matches so "305" surfaces line 305 first. */
export function routeMatchRank(route, query) {
  const q = norm(query);
  const number = norm(route?.route_number);
  if (number && number === q) return 0;
  if (number && number.startsWith(q)) return 1;
  if (number && number.includes(q)) return 2;
  return 3;
}

/** Sort a route's stops by their declared order. */
export function orderedStops(route) {
  return [...(route?.route_stops || [])].sort((a, b) => a.stop_order - b.stop_order);
}

/** Greeting that follows the time of day, as specified in the design doc. */
export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

/** "3 min ago" style relative time for GPS freshness. */
export function relativeTime(iso) {
  if (!iso) return "never";
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
}