-- ============================================================
-- GoSmart — Reference Queries (MySQL)
-- ============================================================
-- Common read patterns backing the REST API and admin reports.
-- Views v_live_buses and v_route_stops_ordered are defined in schema.sql.
-- ============================================================

-- Live buses with route + latest known position
-- (backs GET /buses/live)
SELECT b.bus_id, b.plate_no, r.route_name,
       b.current_lat, b.current_lng, b.last_updated
FROM bus b
JOIN route r ON r.route_id = b.route_id
ORDER BY b.last_updated DESC;

-- Stops in order for a given route
-- (backs GET /routes/{id}/stops)
SELECT rs.stop_order, s.stop_name, s.latitude, s.longitude
FROM route_stop rs
JOIN stop s ON s.stop_id = rs.stop_id
WHERE rs.route_id = 1
ORDER BY rs.stop_order;

-- Average cleanliness and safety per bus
SELECT b.plate_no,
       ROUND(AVG(r.cleanliness), 2) AS avg_cleanliness,
       ROUND(AVG(r.safety), 2)       AS avg_safety,
       COUNT(*)                      AS rating_count
FROM bus b
JOIN rating r ON r.bus_id = b.bus_id
GROUP BY b.bus_id, b.plate_no
ORDER BY avg_cleanliness DESC;

-- Recent traffic reports (newest first)
SELECT tr.report_id,
       u.name AS reporter,
       tr.location,
       tr.severity,
       tr.created_at
FROM traffic_report tr
JOIN users u ON u.user_id = tr.user_id
ORDER BY tr.created_at DESC
LIMIT 20;

-- Buses currently assigned to a route but missing GPS updates
SELECT b.plate_no, r.route_name, b.last_updated
FROM bus b
JOIN route r ON r.route_id = b.route_id
WHERE b.last_updated IS NULL
   OR b.last_updated < (NOW() - INTERVAL 2 MINUTE);
