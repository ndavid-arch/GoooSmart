import { useCallback, useEffect, useState } from "react";
import { pushApi } from "../api/analytics";

const SUPPORTED = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!SUPPORTED) {
            setLoading(false);
            return;
        }
        navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => reg.pushManager.getSubscription())
            .then((sub) => setEnabled(!!sub))
            .catch(() => setEnabled(false))
            .finally(() => setLoading(false));
    }, []);

    const enable = useCallback(async () => {
        if (!SUPPORTED) {
            setError("Push notifications aren't supported in this browser.");
            return;
        }
        setError("");
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                setError("Notification permission was not granted.");
                return;
            }
            const registration = await navigator.serviceWorker.register("/sw.js");
            const publicKey = await pushApi.vapidPublicKey();
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
            const json = subscription.toJSON();
            await pushApi.subscribe({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth });
            setEnabled(true);
        } catch (err) {
            setError(err?.message || "Could not enable push notifications.");
        }
    }, []);

    const disable = useCallback(async () => {
        if (!SUPPORTED) return;
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await pushApi.unsubscribe(subscription.endpoint);
                await subscription.unsubscribe();
            }
        } finally {
            setEnabled(false);
        }
    }, []);

    return { supported: SUPPORTED, enabled, loading, error, enable, disable };
}