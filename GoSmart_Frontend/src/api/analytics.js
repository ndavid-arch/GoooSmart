import client from "./client";

export const ridershipApi = {
    board: (busId) => client.post("/ridership/board/", { bus: busId }).then((r) => r.data),
    summary: (params) => client.get("/analytics/ridership-summary/", { params }).then((r) => r.data),
};

export const delayApi = {
    summary: (params) => client.get("/analytics/delay-summary/", { params }).then((r) => r.data),
};

export const etaAlertsApi = {
    list: () => client.get("/eta-alerts/").then((r) => r.data),
    create: (payload) => client.post("/eta-alerts/", payload).then((r) => r.data),
    remove: (id) => client.delete(`/eta-alerts/${id}/`),
};

export const pushApi = {
    vapidPublicKey: () => client.get("/push/vapid-public-key/").then((r) => r.data.publicKey),
    subscribe: (subscription) => client.post("/push/subscribe/", subscription).then((r) => r.data),
    unsubscribe: (endpoint) => client.post("/push/unsubscribe/", { endpoint }).then((r) => r.data),
};