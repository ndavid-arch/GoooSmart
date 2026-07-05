import client from "./client";

export const stopsApi = {
  list: () => client.get("/stops/").then((r) => r.data),
  create: (payload) => client.post("/stops/", payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/stops/${id}/`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/stops/${id}/`),
};

export const routesApi = {
  list: () => client.get("/routes/").then((r) => r.data),
  get: (id) => client.get(`/routes/${id}/`).then((r) => r.data),
  create: (payload) => client.post("/routes/", payload).then((r) => r.data),
  update: (id, payload) => client.patch(`/routes/${id}/`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/routes/${id}/`),
};

export const routeStopsApi = {
  list: () => client.get("/route-stops/").then((r) => r.data),
  create: (payload) => client.post("/route-stops/", payload).then((r) => r.data),
  remove: (id) => client.delete(`/route-stops/${id}/`),
};
