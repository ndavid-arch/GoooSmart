# GoSmart Frontend

React + Vite web app for the GoSmart bus tracking system (Kimironko corridor, Kigali). Talks to the `GoSmart_Backend` Django API.

## Stack

- React (Vite)
- react-router-dom for routing
- axios for API calls, with automatic JWT access-token refresh
- react-leaflet + OpenStreetMap tiles for maps (matches the tools decided in the project proposal — free, no API key)
- Plain CSS with a shared design system (`src/styles/theme.css`) — blue / green / yellow accents on a white background
- Polling (every 5s on live views) instead of WebSockets, matching the backend's documented trade-off

## Setup

```bash
npm install
npm run dev
```

The app expects the backend at `http://127.0.0.1:8000/api` (see `.env` → `VITE_API_BASE_URL`). Start the Django backend separately:

```bash
cd ../GoSmart_Backend/gosmart
python manage.py runserver
```

## App flow

- **Landing (`/`)** — public marketing page, links to login/register.
- **Login / Register** — JWT auth; register lets a user sign up as passenger or driver (admin accounts are promoted via Django admin, matching backend rules).
- **Passenger (`/app`)** — live map of all buses (polling), route filter, route list. Drill into a route (`/app/routes/:id`) to see ordered stops, or a bus (`/app/buses/:id`) to see live position, pick a stop for an ETA, view/submit ratings.
- **Traffic Reports (`/app/reports`)** — view/filter reports by severity, submit a new one; admins can delete.
- **Driver (`/driver`)** — shows the driver's assigned bus, lets them share live GPS (via `watchPosition`) or push a location manually.
- **Admin (`/admin`)** — tabs for managing Routes, Stops, Route↔Stop ordering, and Buses (including driver assignment by user ID).

Role-based route guards live in `src/components/ProtectedRoute.jsx`; the nav bar adapts per role in `src/components/Navbar.jsx`.
