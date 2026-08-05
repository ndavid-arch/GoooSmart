import { useCallback, useEffect, useState } from "react";

/*
 * Location tracking preference for passengers.
 *
 * The consent screen promises the rider three things, and this module is what
 * keeps those promises:
 *
 *   "Your location is used to verify you are on the bus when submitting reports"
 *       -> verifyNearBus() compares the browser fix to the bus's own GPS.
 *   "Your location is never stored or shared with third parties"
 *       -> the fix is compared on-device and thrown away. Nothing is uploaded,
 *          nothing is persisted; only the yes/no verdict leaves this module.
 *   "You can change this preference at any time in Settings"
 *       -> the flag lives in localStorage and the profile sheet toggles it.
 */

const KEY = "gosmart_location_consent";

/** How close the rider must be to the bus's last known position to count as aboard. */
export const BOARDING_RADIUS_METRES = 750;

export function isTrackingOn() {
  return localStorage.getItem(KEY) === "granted";
}

export function setTrackingPreference(on) {
  localStorage.setItem(KEY, on ? "granted" : "declined");
  window.dispatchEvent(new Event("gosmart:tracking"));
}

/** Great-circle distance in metres. */
export function distanceMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

function currentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This device can't provide a location."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? "Location permission is blocked. Allow it in your browser's site settings to report."
              : "Could not read your location. Try again in a moment."
          )
        ),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  });
}

export function useTracking() {
  const [on, setOn] = useState(isTrackingOn);

  // Keeps every mounted consumer in step when the preference changes.
  useEffect(() => {
    const sync = () => setOn(isTrackingOn());
    window.addEventListener("gosmart:tracking", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gosmart:tracking", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  /** Turning it on asks the browser for permission there and then. */
  const enable = useCallback(async () => {
    await currentPosition();
    setTrackingPreference(true);
    setOn(true);
  }, []);

  const disable = useCallback(() => {
    setTrackingPreference(false);
    setOn(false);
  }, []);

  /**
   * Confirms the rider is at the bus. Resolves to a short reason string when it
   * can't be confirmed, or null when they check out. The coordinates never
   * leave this function.
   */
  const verifyNearBus = useCallback(async (bus) => {
    if (!isTrackingOn()) {
      return "Turn on location tracking to verify you're on this bus.";
    }
    const pos = await currentPosition();

    if (bus?.current_lat == null || bus?.current_lng == null) {
      // Nothing to compare against — the driver isn't broadcasting yet.
      return null;
    }

    const away = distanceMetres(
      pos.coords.latitude,
      pos.coords.longitude,
      Number(bus.current_lat),
      Number(bus.current_lng)
    );

    if (away > BOARDING_RADIUS_METRES) {
      return `You look about ${away >= 1000 ? `${(away / 1000).toFixed(1)} km` : `${away} m`} from this bus. Board it first, then tap in.`;
    }
    return null;
  }, []);

  return { on, enable, disable, verifyNearBus };
}
