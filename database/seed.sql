-- ============================================================
-- GoSmart — Seed Data (MySQL)
-- ============================================================
-- Loads demo rows into an already-created schema.
-- Run after schema.sql DDL, or use schema.sql which includes this data.
--
--   mysql -u root -p gosmart < database/seed.sql
-- ============================================================

INSERT INTO users (name, email, password, user_type) VALUES
('Aline U.', 'aline@email.com', '$2b$10$examplehashvalue1', 'commuter'),
('John M.',  'john@email.com',  '$2b$10$examplehashvalue2', 'visitor');

INSERT INTO driver (name, license_no, phone) VALUES
('Eric N.',   'RAD-2291', '0788123456'),
('Claude H.', 'RAD-7740', '0722987654');

INSERT INTO route (route_name, start_point, end_point) VALUES
('Nyabugogo–Kimironko', 'Nyabugogo', 'Kimironko'),
('Downtown–Remera',     'Downtown',  'Remera');

INSERT INTO stop (stop_name, latitude, longitude) VALUES
('Kimironko Market', -1.945600, 30.125300),
('Remera Bus Park',  -1.957800, 30.118900);

INSERT INTO route_stop (route_id, stop_id, stop_order) VALUES
(1, 1, 1),
(1, 2, 2);

INSERT INTO bus (plate_no, capacity, route_id, driver_id, current_lat, current_lng, last_updated) VALUES
('RAC-100A', 30, 1, 1, -1.945600, 30.125300, NOW()),
('RAC-205B', 30, 2, 2, -1.957800, 30.118900, NOW());

INSERT INTO rating (user_id, bus_id, cleanliness, safety) VALUES
(1, 1, 4, 5),
(2, 2, 3, 4);

INSERT INTO traffic_report (user_id, location, severity) VALUES
(1, 'Kimironko junction', 'heavy'),
(2, 'Remera roundabout',  'moderate');
