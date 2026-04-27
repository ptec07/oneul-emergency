from fastapi.testclient import TestClient

from app.main import app


def test_geocode_route_returns_matching_place_coordinates():
    client = TestClient(app)

    response = client.get("/api/geocode", params={"query": "강남역"})

    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 1
    assert body["items"][0] == {
        "label": "강남역",
        "address": "서울특별시 강남구 강남대로 지하396",
        "lat": 37.4979,
        "lng": 127.0276,
        "source": "fixture",
    }


def test_geocode_route_returns_empty_results_for_blank_query():
    client = TestClient(app)

    response = client.get("/api/geocode", params={"query": "   "})

    assert response.status_code == 200
    assert response.json() == {"items": [], "count": 0}
