from app.services.geo import distance_meters, sort_by_distance


def test_distance_meters_returns_approximate_haversine_distance():
    distance = distance_meters(37.5665, 126.9780, 37.5651, 126.9895)

    assert 1000 <= distance <= 1040


def test_sort_by_distance_adds_distance_and_orders_nearest_first():
    facilities = [
        {"name": "far", "latitude": 37.5, "longitude": 127.0},
        {"name": "near", "latitude": 37.5666, "longitude": 126.9781},
    ]

    sorted_items = sort_by_distance(facilities, 37.5665, 126.9780)

    assert [item["name"] for item in sorted_items] == ["near", "far"]
    assert sorted_items[0]["distanceM"] < sorted_items[1]["distanceM"]


def test_sort_by_distance_skips_items_without_valid_coordinates():
    facilities = [
        {"name": "missing", "latitude": None, "longitude": 126.978},
        {"name": "invalid", "latitude": "not-a-number", "longitude": 126.978},
        {"name": "near", "latitude": 37.5666, "longitude": 126.9781},
    ]

    sorted_items = sort_by_distance(facilities, 37.5665, 126.9780)

    assert [item["name"] for item in sorted_items] == ["near"]
