# GoSmart Backend API

Real-time bus tracking backend for Kigali's Kimironko corridor. Built with **Django** + **Django REST Framework**, using **JWT authentication**.

This document explains what has been built, how the pieces fit together, which test users to use, and how to test every endpoint in Postman.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Django + Django REST Framework |
| Auth | JWT (`djangorestframework-simplejwt`) |
| Database (dev) | SQLite (default) — swap to MySQL for production |
| CORS | `django-cors-headers` |
| API testing | Postman |

---

## 2. Project Structure

```
gosmart/
├── accounts/      # Custom User model + JWT auth (register/login/me)
├── routes/        # Route, Stop, RouteStop (linking table)
├── tracking/      # Bus model, GPS updates, live location, ETA calculation
├── community/     # Rating, TrafficReport
├── common/        # Shared permission classes used across apps
└── gosmart/       # Project settings + root urls.py
```

Each Django app maps directly to a section of the project's ERD and system architecture diagram from the proposal document.

---

## 3. Setup

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser   # creates your first admin login
python manage.py runserver
```

Server runs at: `http://127.0.0.1:8000/`

---

## 4. User Roles

Every user has a `role` field: `passenger`, `driver`, or `admin`. This single field controls what each account is allowed to do across the whole API.

| Role | Can do |
|---|---|
| **passenger** | View routes/stops/buses, submit ratings, submit traffic reports, edit/delete their **own** ratings & reports |
| **driver** | Everything a passenger can, **plus**: push GPS location updates — only for the bus they are assigned to |
| **admin** | Everything, plus: create/edit/delete Routes, Stops, Route-Stops, Buses; delete or review any Traffic Report |

Admin accounts **cannot** be created through `/api/auth/register/` (that endpoint always defaults new accounts to safe roles). Promote a user to admin via the Django admin panel (`/admin/`) or `createsuperuser`.

---

## 5. Test Users

Use these accounts to test the API as different roles. Create any that don't exist yet in your database (admin roles must be set via `/admin/`, not the register endpoint).

| Username | Password | Role | Purpose |
|---|---|---|---|
| `admin1` | `Admin@1234` | admin | Managing routes/stops/buses, moderating reports |
| `eric` | `Driver@1234` | driver | Assigned to Bus #1 — pushes GPS updates |
| `claude_h` | `Driver@1234` | driver | Assigned to Bus #2 (optional second driver) |
| `aline` | `Passenger@1234` | passenger | General passenger testing |
| `john` | `Passenger@1234` | passenger | Second passenger — test "own data only" rules |

**Every protected endpoint needs a header:**
```
Authorization: Bearer <access_token>
```
Get this token by logging in (Section 6, Step 2) as the relevant user above.

---

## 6. Auth Endpoints (`accounts` app)

### 6.1 Register
```
POST /api/auth/register/
```
```json
{
  "username": "john",
  "email": "john@email.com",
  "password": "Passenger@1234",
  "role": "passenger"
}
```
Returns the created user + an access/refresh token pair (auto-logged-in on register).

### 6.2 Login
```
POST /api/auth/login/
```
```json
{ "username": "john", "password": "Passenger@1234" }
```
Returns:
```json
{ "access": "<token>", "refresh": "<token>" }
```
Copy the `access` token into Postman's Authorization header (`Bearer <token>`) for every request below that needs login.

### 6.3 Refresh token
```
POST /api/auth/login/refresh/
```
```json
{ "refresh": "<refresh_token>" }
```

### 6.4 Current user
```
GET /api/auth/me/
```
Header: `Authorization: Bearer <access_token>`
Returns the logged-in user's own profile.

---

## 7. Routes, Stops & Route-Stops (`routes` app)

**Rule:** anyone can view (GET); only `admin` can create/edit/delete.

### 7.1 Create a Stop — test as: `admin1`
```
POST /api/stops/
```
```json
{ "stop_name": "Kimironko Market", "latitude": -1.945600, "longitude": 30.125300 }
```
```json
{ "stop_name": "Remera Bus Park", "latitude": -1.957800, "longitude": 30.118900 }
```

### 7.2 List all Stops — test as: any user, or no login
```
GET /api/stops/
```

### 7.3 Create a Route — test as: `admin1`
```
POST /api/routes/
```
```json
{ "route_name": "Nyabugogo–Kimironko", "start_point": "Nyabugogo", "end_point": "Kimironko" }
```

### 7.4 Link Stops to a Route in order — test as: `admin1`
```
POST /api/route-stops/
```
```json
{ "route": 1, "stop": 1, "stop_order": 1 }
```
```json
{ "route": 1, "stop": 2, "stop_order": 2 }
```

### 7.5 View a Route with its ordered Stops — test as: any user
```
GET /api/routes/1/
```
Response includes a nested, ordered `route_stops` list.

### 7.6 Confirm permission rules — test as: `aline` (passenger)
Try `POST /api/routes/` as `aline` → should return **403 Forbidden**.

---

## 8. Buses & Live Tracking (`tracking` app)

### 8.1 Create a Bus — test as: `admin1`
```
POST /api/buses/
```
```json
{ "plate_no": "RAC-100A", "capacity": 30, "route": 1, "driver": 2 }
```
*(`driver` = the numeric user ID of `eric` — check `/admin/` or the shell to confirm his ID)*

### 8.2 List Buses — test as: any user
```
GET /api/buses/
```
Filter by route:
```
GET /api/buses/?route=1
```

### 8.3 Push GPS location — test as: `eric` (must be the assigned driver on that bus)
```
PATCH /api/buses/1/update-location/
```
```json
{ "latitude": -1.945600, "longitude": 30.125300 }
```
Try this as `claude_h` (a driver **not** assigned to bus #1) → should return **403 Forbidden**.

### 8.4 Confirm live status — test as: any user
```
GET /api/buses/1/
```
Check `is_live: true` right after the GPS push above. Wait 2+ minutes and check again — `is_live` should flip to `false` (matches the "stale data" handling described in the risk assessment).

### 8.5 Get ETA to a stop — test as: any user, or no login
```
GET /api/buses/1/eta/?stop_id=2
```
Returns distance in km and estimated minutes, based on the bus's last known GPS position.

---

## 9. Ratings & Traffic Reports (`community` app)

### 9.1 Submit a Rating — test as: `aline`
```
POST /api/ratings/
```
```json
{ "bus": 1, "cleanliness": 4, "safety": 5, "comment": "Clean and safe ride" }
```

### 9.2 View average rating for a bus — test as: any user
```
GET /api/ratings/summary/?bus=1
```
Returns `avg_cleanliness`, `avg_safety`, `total_ratings`.

### 9.3 Try editing someone else's rating — test as: `john`
Attempt `PATCH /api/ratings/1/` (a rating created by `aline`) as `john` → should return **403 Forbidden**. `aline` or `admin1` editing the same rating should succeed.

### 9.4 Submit a Traffic Report — test as: `aline` or `john`
```
POST /api/traffic-reports/
```
```json
{ "location": "Kimironko junction", "severity": "heavy" }
```

### 9.5 Filter reports by severity — test as: any user
```
GET /api/traffic-reports/?severity=heavy
```

### 9.6 Delete an inappropriate report — test as: `admin1`
```
DELETE /api/traffic-reports/1/
```
Try the same request as `aline` → should return **403 Forbidden**.

---

## 10. Suggested Testing Order (for a full run-through)

1. Register/confirm all 5 test users exist (Section 5)
2. Log in as `admin1` → create Stops → create Route → link Route-Stops → create Bus
3. Log in as `eric` → push GPS update to Bus #1
4. Log in as `aline` → view buses, check ETA, submit a rating, submit a traffic report
5. Log in as `john` → try editing `aline`'s rating (should fail), submit his own report
6. Log in as `admin1` → delete a traffic report, confirm passengers can't

If every step behaves as described, all implemented features are working end-to-end.

---

## 11. What's Implemented vs Not Yet

**Implemented:**
- JWT authentication with role-based permissions
- Routes, Stops, ordered Route-Stops
- Buses with live GPS tracking and staleness detection (`is_live`)
- ETA calculation (haversine distance ÷ average speed)
- Ratings (cleanliness/safety) with averages
- Traffic reports with admin moderation

**Not implemented (by design, per project scope):**
- Real-time push via WebSockets — frontend should poll `GET /api/buses/?route=<id>` every few seconds instead; documented trade-off, not a bug
- Native mobile app — deliberately built as a web app first (see Technical Challenges in presentation); all endpoints are ready for a future mobile client
- Fare payment / ticketing — explicitly out of scope per project proposal

---

## 12. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `403 Forbidden` on POST | Logged in as the wrong role | Check Section 4 — confirm you're using a token from a user with the right role |
| `401 Unauthorized` | Missing or expired token | Re-login, or use `/api/auth/login/refresh/` |
| `404` on a nested URL | Trailing space or typo in the URL | Double-check the exact path, no trailing characters |
| `ModuleNotFoundError` on server start | A file was misnamed or missing (e.g. `seralizers.py` instead of `serializers.py`) | Verify exact filename and folder location |