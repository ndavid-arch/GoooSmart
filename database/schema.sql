-- ============================================================
-- GoSmart — Database Schema (MySQL, aligned to Django models)
-- ============================================================

DROP TABLE IF EXISTS traffic_report;
DROP TABLE IF EXISTS rating;
DROP TABLE IF EXISTS route_stop;
DROP TABLE IF EXISTS bus;
DROP TABLE IF EXISTS stop;
DROP TABLE IF EXISTS route;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------
-- USERS — merges passenger + driver + admin (matches accounts.User,
-- which extends Django's AbstractUser with role/phone/license_no)
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- Django's hashed password, never plaintext
    role        ENUM('passenger', 'driver', 'admin') NOT NULL DEFAULT 'passenger',
    phone       VARCHAR(20),
    license_no  VARCHAR(50),                     -- only meaningful when role='driver'
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- ROUTE (matches routes.Route)
-- ------------------------------------------------------------
CREATE TABLE route (
    route_id    INT AUTO_INCREMENT PRIMARY KEY,
    route_name  VARCHAR(100) NOT NULL,
    start_point VARCHAR(100) NOT NULL,
    end_point   VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- STOP (matches routes.Stop)
-- ------------------------------------------------------------
CREATE TABLE stop (
    stop_id     INT AUTO_INCREMENT PRIMARY KEY,
    stop_name   VARCHAR(100) NOT NULL,
    latitude    DECIMAL(9,6) NOT NULL,
    longitude   DECIMAL(9,6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- ROUTE_STOP (matches routes.RouteStop — junction table)
-- ------------------------------------------------------------
CREATE TABLE route_stop (
    route_stop_id INT AUTO_INCREMENT PRIMARY KEY,
    route_id      INT NOT NULL,
    stop_id       INT NOT NULL,
    stop_order    INT NOT NULL,
    FOREIGN KEY (route_id) REFERENCES route(route_id) ON DELETE CASCADE,
    FOREIGN KEY (stop_id)  REFERENCES stop(stop_id)   ON DELETE CASCADE,
    UNIQUE KEY uq_route_stop_order (route_id, stop_order),
    INDEX idx_route_stop_route_id (route_id),
    INDEX idx_route_stop_stop_id (stop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- BUS (matches tracking.Bus — driver FK points to users, not
-- a separate driver table, and is limited to role='driver')
-- ------------------------------------------------------------
CREATE TABLE bus (
    bus_id        INT AUTO_INCREMENT PRIMARY KEY,
    plate_no      VARCHAR(20) NOT NULL UNIQUE,
    capacity      INT NOT NULL CHECK (capacity > 0),
    route_id      INT,
    driver_id     INT,
    current_lat   DECIMAL(9,6),
    current_lng   DECIMAL(9,6),
    last_updated  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id)  REFERENCES route(route_id) ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES users(user_id)  ON DELETE SET NULL,
    INDEX idx_bus_route_id (route_id),
    INDEX idx_bus_driver_id (driver_id),
    INDEX idx_bus_plate_no (plate_no),
    INDEX idx_bus_last_updated (last_updated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- RATING (matches community.Rating)
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
    FOREIGN KEY (bus_id)  REFERENCES bus(bus_id)   ON DELETE CASCADE,
    INDEX idx_rating_user_id (user_id),
    INDEX idx_rating_bus_id (bus_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TRAFFIC_REPORT (matches community.TrafficReport — includes
-- `reviewed` flag used by admin moderation, per the real model)
-- ------------------------------------------------------------
CREATE TABLE traffic_report (
    report_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    location    VARCHAR(100) NOT NULL,
    severity    ENUM('light', 'moderate', 'heavy') NOT NULL,
    reviewed    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_traffic_report_user_id (user_id),
    INDEX idx_traffic_report_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed data — matches team's agreed Test Users table
-- ============================================================
INSERT INTO users (name, email, password, role, phone, license_no) VALUES
('Admin One', 'admin1@gosmart.rw', '$2b$10$hashedAdminPass',      'admin',     NULL,          NULL),
('Eric N.',   'eric@gosmart.rw',   '$2b$10$hashedDriverPass1',    'driver',    '0788123456', 'RAD-2291'),
('Claude H.', 'claudeh@gosmart.rw','$2b$10$hashedDriverPass2',    'driver',    '0722987654', 'RAD-7740'),
('Aline U.',  'aline@gosmart.rw',  '$2b$10$hashedPassengerPass1', 'passenger', '0788111111', NULL),
('John M.',   'john@gosmart.rw',   '$2b$10$hashedPassengerPass2', 'passenger', '0788222222', NULL);

INSERT INTO route (route_name, start_point, end_point) VALUES
('Nyabugogo–Kimironko', 'Nyabugogo', 'Kimironko'),
('Downtown–Remera',     'Downtown',  'Remera');

INSERT INTO stop (stop_name, latitude, longitude) VALUES
('Kimironko Market', -1.945600, 30.125300),
('Remera Bus Park',  -1.957800, 30.118900);

INSERT INTO route_stop (route_id, stop_id, stop_order) VALUES
(1, 1, 1),
(1, 2, 2);

-- Bus #1 -> eric (user_id 2), Bus #2 -> claude_h (user_id 3)
INSERT INTO bus (plate_no, capacity, route_id, driver_id, current_lat, current_lng) VALUES
('RAC-100A', 30, 1, 2, -1.945600, 30.125300),
('RAC-205B', 30, 2, 3, -1.957800, 30.118900);

INSERT INTO rating (user_id, bus_id, cleanliness, safety, comment) VALUES
(4, 1, 4, 5, 'Smooth ride.'),
(5, 2, 3, 4, 'A bit crowded.');

INSERT INTO traffic_report (user_id, location, severity) VALUES
(4, 'Kimironko junction', 'heavy'),
(5, 'Remera roundabout',  'moderate');

-- ============================================================
-- Example query: live buses with route + latest known position
-- ============================================================
SELECT b.bus_id, b.plate_no, r.route_name,
       b.current_lat, b.current_lng, b.last_updated
FROM bus b
JOIN route r ON r.route_id = b.route_id
ORDER BY b.last_updated DESC;

-- Example query: all test users with their roles
SELECT user_id, name, email, role FROM users;