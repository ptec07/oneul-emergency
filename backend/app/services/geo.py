from __future__ import annotations

from math import asin, cos, radians, sin, sqrt
from typing import Iterable

EARTH_RADIUS_M = 6_371_000


def distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    rlat1 = radians(lat1)
    rlat2 = radians(lat2)
    a = sin(dlat / 2) ** 2 + cos(rlat1) * cos(rlat2) * sin(dlon / 2) ** 2
    return round(2 * EARTH_RADIUS_M * asin(sqrt(a)))


def sort_by_distance(facilities: Iterable[dict], user_lat: float, user_lng: float) -> list[dict]:
    with_distance = []
    for facility in facilities:
        item = dict(facility)
        try:
            facility_lat = float(item["latitude"])
            facility_lng = float(item["longitude"])
        except (KeyError, TypeError, ValueError):
            continue
        item["distanceM"] = distance_meters(
            user_lat,
            user_lng,
            facility_lat,
            facility_lng,
        )
        with_distance.append(item)
    return sorted(with_distance, key=lambda item: item["distanceM"])
