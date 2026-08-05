import client from "./client";

export const ratingsApi = {
  list: (busId) =>
    client
      .get("/ratings/", { params: busId ? { bus: busId } : {} })
      .then((r) => r.data),
  summary: (busId) => client.get("/ratings/summary/", { params: { bus: busId } }).then((r) => r.data),
  create: (payload) => client.post("/ratings/", payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/ratings/${id}/`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/ratings/${id}/`),
};

export const busReportsApi = {
  list: (busId) =>
    client
      .get("/bus-reports/", { params: busId ? { bus: busId } : {} })
      .then((r) => r.data),
  create: (payload) => client.post("/bus-reports/", payload).then((r) => r.data),
  remove: (id) => client.delete(`/bus-reports/${id}/`),
  // Buses the signed-in rider has tapped into recently — the ones they may report.
  boardable: () => client.get("/bus-reports/boardable/").then((r) => r.data),
};

export const trafficReportsApi = {
  list: (severity) =>
    client
      .get("/traffic-reports/", { params: severity ? { severity } : {} })
      .then((r) => r.data),
  create: (payload) => client.post("/traffic-reports/", payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/traffic-reports/${id}/`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/traffic-reports/${id}/`),
};
