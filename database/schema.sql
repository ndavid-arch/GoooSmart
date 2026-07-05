-- ============================================================
-- GoSmart — Database Schema (MySQL 8.x)
-- ============================================================
-- Author  : Mizero Eloi (Database Designer)
-- Purpose : Reference relational model for GoSmart bus tracking
-- Engine  : InnoDB (FK support, row-level locking, crash recovery)
-- Charset : utf8mb4 (full Unicode, including Kinyarwanda diacritics)
--
-- Usage   : mysql -u root -p gosmart < database/schema.sql
-- Seed    : included below; see also seed.sql for standalone loading
-- Queries : see queries.sql for views and reporting examples
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Teardown (reverse dependency order)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS traffic_report;
DROP TABLE IF EXISTS rating;
DROP TABLE IF EXISTS route_stop;
DROP TABLE IF EXISTS bus;
DROP TABLE IF EXISTS stop;
DROP TABLE IF EXISTS route;
DROP TABLE IF EXISTS driver;
DROP TABLE IF EXISTS users;

DROP VIEW IF EXISTS v_live_buses;
DROP VIEW IF EXISTS v_route_stops_ordered;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. CORE ENTITIES
-- ============================================================

-- ------------------------------------------------------------
-- 1.1 USER — registered commuters, newcomers, and visitors
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- store bcrypt hash, never plaintext
    user_type   ENUM('commuter', 'newcomer', 'visitor') NOT NULL DEFAULT 'commuter',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='App end-users who submit ratings and traffic reports';

-- ------------------------------------------------------------
-- 1.2 DRIVER — operates a bus and shares GPS position
-- ------------------------------------------------------------
CREATE TABLE driver (
    driver_id   INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    license_no  VARCHAR(50)  NOT NULL UNIQUE,
    phone       VARCHAR(20)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Licensed operators assigned to buses';

-- ------------------------------------------------------------
-- 1.3 ROUTE — a path buses take (e.g. Nyabugogo–Kimironko)
-- ------------------------------------------------------------
CREATE TABLE route (
    route_id    INT AUTO_INCREMENT PRIMARY KEY,
    route_name  VARCHAR(100) NOT NULL,
    start_point VARCHAR(100) NOT NULL,
    end_point   VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Named corridor between two terminal points';

-- ------------------------------------------------------------
-- 1.4 STOP — a pick-up/drop-off point along a corridor
-- ------------------------------------------------------------
CREATE TABLE stop (
    stop_id     INT AUTO_INCREMENT PRIMARY KEY,
    stop_name   VARCHAR(100) NOT NULL,
    latitude    DECIMAL(9,6) NOT NULL,
    longitude   DECIMAL(9,6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Geocoded stop used for ETA and route planning';

-- ============================================================
-- 2. RELATIONSHIPS
-- ============================================================

-- ------------------------------------------------------------
-- 2.1 ROUTE_STOP — junction: ordered stops belonging to a route
-- ------------------------------------------------------------
CREATE TABLE route_stop (
    route_stop_id INT AUTO_INCREMENT PRIMARY KEY,
    route_id      INT NOT NULL,
    stop_id       INT NOT NULL,
    stop_order    INT NOT NULL,
    FOREIGN KEY (route_id) REFERENCES route(route_id) ON DELETE CASCADE,
    FOREIGN KEY (stop_id)  REFERENCES stop(stop_id)   ON DELETE CASCADE,
    UNIQUE KEY uq_route_stop_order (route_id, stop_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Many-to-many link with explicit ordering per route';

-- ------------------------------------------------------------
-- 2.2 BUS — vehicle with live GPS snapshot
-- ------------------------------------------------------------
CREATE TABLE bus (
    bus_id        INT AUTO_INCREMENT PRIMARY KEY,
    plate_no      VARCHAR(20) NOT NULL UNIQUE,
    capacity      INT NOT NULL,
    route_id      INT,
    driver_id     INT,
    current_lat   DECIMAL(9,6),
    current_lng   DECIMAL(9,6),
    last_updated  DATETIME,
    FOREIGN KEY (route_id)  REFERENCES route(route_id)   ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES driver(driver_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Fleet unit; nullable route/driver when unassigned';

-- ============================================================
-- 3. COMMUNITY / FEEDBACK
-- ============================================================

-- ------------------------------------------------------------
-- 3.1 RATING — per-bus cleanliness and safety scores
-- ------------------------------------------------------------
CREATE TABLE rating (
    rating_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    bus_id      INT NOT NULL,
    cleanliness INT NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
    safety      INT NOT NULL CHECK (safety BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id)  REFERENCES bus(bus_id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Rider feedback; comment is optional free text';

-- ------------------------------------------------------------
-- 3.2 TRAFFIC REPORT — crowd-sourced congestion alerts
-- ------------------------------------------------------------
CREATE TABLE traffic_report (
    report_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    location    VARCHAR(100) NOT NULL,
    severity    ENUM('light', 'moderate', 'heavy') NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='User-submitted traffic conditions at a location';

-- ============================================================
-- 4. INDEXES (query paths used by the API)
-- ============================================================

CREATE INDEX idx_bus_route_id      ON bus (route_id);
CREATE INDEX idx_bus_driver_id     ON bus (driver_id);
CREATE INDEX idx_bus_last_updated  ON bus (last_updated DESC);

CREATE INDEX idx_route_stop_route  ON route_stop (route_id);
CREATE INDEX idx_route_stop_stop   ON route_stop (stop_id);

CREATE INDEX idx_rating_user_id    ON rating (user_id);
CREATE INDEX idx_rating_bus_id     ON rating (bus_id);
CREATE INDEX idx_rating_created_at ON rating (created_at DESC);

CREATE INDEX idx_traffic_user_id   ON traffic_report (user_id);
CREATE INDEX idx_traffic_created   ON traffic_report (created_at DESC);

-- ============================================================
-- 5. VIEWS (stable read models for common API queries)
-- ============================================================

CREATE VIEW v_live_buses AS
SELECT b.bus_id,
       b.plate_no,
       r.route_name,
       b.current_lat,
       b.current_lng,
       b.last_updated
FROM bus b
JOIN route r ON r.route_id = b.route_id
ORDER BY b.last_updated DESC;

CREATE VIEW v_route_stops_ordered AS
SELECT rs.route_id,
       rs.stop_order,
       s.stop_id,
       s.stop_name,
       s.latitude,
       s.longitude
FROM route_stop rs
JOIN stop s ON s.stop_id = rs.stop_id
ORDER BY rs.route_id, rs.stop_order;

-- ============================================================
-- 6. Seed data (development / demo)
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
