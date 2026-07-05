from math import radians, sin, cos, sqrt, atan2

AVERAGE_BUS_SPEED_KMH = 20  # adjust based on real Kigali traffic data later


def haversine_km(lat1, lon1, lat2, lon2):
    """Straight-line distance between two GPS points, in kilometres."""
    R = 6371  # Earth's radius in km
    lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def estimate_eta_minutes(bus_lat, bus_lng, stop_lat, stop_lng):
    distance_km = haversine_km(bus_lat, bus_lng, stop_lat, stop_lng)
    hours = distance_km / AVERAGE_BUS_SPEED_KMH
    return round(hours * 60, 1), round(distance_km, 2)