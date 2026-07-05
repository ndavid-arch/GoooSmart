# GoSmart

Real-time bus tracking web app for Kigali public transport — live GPS, ETA prediction, route planning, and rider-driven quality feedback, built for the **Kimironko corridor**.

Commuters have no reliable way to know when the next bus will arrive, which pushes people toward taxi-motos — faster, but more expensive and linked to the majority of road accidents. GoSmart closes that gap with a single web app for passengers, drivers, and admins.

## Project structure

```
GoooSmart/
├── GoSmart_Backend/    # Django + DRF API (JWT auth, routes/stops, live tracking, ratings, traffic reports)
├── GoSmart_Frontend/   # React (Vite) web app consuming the API
└── database/           # MySQL reference schema, seed data, queries, and design docs
```

Each half has its own README with setup details:
- [`database/README.md`](database/README.md) — ER diagram, FK policy, indexes, Django mapping
- [`GoSmart_Backend/gosmart/api_readme.md`](GoSmart_Backend/gosmart/api_readme.md) — endpoints, roles, test users, Postman testing guide
- [`GoSmart_Frontend/README.md`](GoSmart_Frontend/README.md) — frontend architecture and app flow

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Backend | Django + Django REST Framework | Team's strongest language, fast delivery |
| Auth | JWT (`djangorestframework-simplejwt`) | Stateless, works cleanly with a separate frontend |
| Database | SQLite (dev) / MySQL (production target) | Structured relational data — buses, routes, stops, ratings |
| Frontend | React (Vite) | Built as a web app first — no App Store/Play Store review delay; same APIs can power a mobile app later |
| Mapping / GPS | OpenStreetMap + Leaflet | Free and reliable, keeps the project cost-free |
| API testing | Postman | Fast manual verification before frontend integration |

## Features implemented

- JWT authentication with three roles: passenger, driver, admin
- Routes, Stops, and ordered Route↔Stop links
- Live GPS bus tracking with staleness detection (a bus flips to "offline" if no GPS update in 2 minutes)
- ETA calculation (haversine distance ÷ average speed) from a bus's last known position to a chosen stop
- Cleanliness & safety ratings per bus, with running averages
- Traffic reports (light/moderate/heavy) with admin moderation
- Admin panel for managing routes, stops, route-stop ordering, and buses (including driver assignment)

**Not implemented (by design, per project scope):** real-time push via WebSockets (the frontend polls instead — a documented trade-off), a native mobile app (deliberately web-first; all endpoints are ready for a future mobile client), and fare payment/ticketing (out of scope).

## Running it locally

Two servers, in two terminals:

```bash
# Terminal 1 — backend
cd GoSmart_Backend/gosmart
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient
python manage.py migrate
python manage.py runserver
```

```bash
# Terminal 2 — frontend
cd GoSmart_Frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The frontend expects the API at `http://127.0.0.1:8000/api` (see `GoSmart_Frontend/.env.example`).

### Test accounts

| Username | Password | Role |
|---|---|---|
| `admin1` | `Admin@1234` | admin |
| `eric` | `Driver@1234` | driver |
| `aline` | `Passenger@1234` | passenger |

Admin accounts can't be created through the register endpoint — promote a user via the Django admin panel (`/admin/`) or `createsuperuser`. Full endpoint-by-endpoint testing steps are in [`api_readme.md`](GoSmart_Backend/gosmart/api_readme.md).

## Team

| Member | Role |
|---|---|
| Ntwali Beni David | Project Lead / Integration |
| Nyirihirwe Yves | Mobile Developer |
| Ojudun Ayomide Oluwatimilehin | Backend Developer |
| Mizero Eloi | Database Designer |
| Joseph Marube | UI/UX & Testing |
