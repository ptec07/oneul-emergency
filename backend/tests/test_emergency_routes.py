from fastapi.testclient import TestClient

from app.main import app
from app.routes import emergency_rooms


def test_emergency_rooms_route_returns_sorted_envelope():
    client = TestClient(app)

    response = client.get("/api/emergency-rooms", params={"lat": 37.5665, "lng": 126.9780, "radiusM": 5000})

    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 1
    assert body["items"][0]["name"] == "서울OO병원"
    assert body["items"][0]["distanceM"] == 0
    assert body["notice"] == "응급실 상황은 실시간으로 변동될 수 있습니다. 방문 전 반드시 전화로 확인하세요."


def test_emergency_rooms_route_uses_public_data_when_service_key_is_configured(monkeypatch):
    class FakeSettings:
        public_data_service_key = "test-key"

    def fake_fetch(_client, *, service_key, lat, lng, num_rows=50):
        assert service_key == "test-key"
        assert lat == 37.5665
        assert lng == 126.978
        return emergency_rooms._fixture_path().read_text(encoding="utf-8")

    monkeypatch.setattr(emergency_rooms, "Settings", FakeSettings)
    monkeypatch.setattr(emergency_rooms, "fetch_emergency_rooms_xml", fake_fetch)

    client = TestClient(app)
    response = client.get("/api/emergency-rooms", params={"lat": 37.5665, "lng": 126.978, "radiusM": 5000})

    assert response.status_code == 200
    assert response.json()["count"] == 1
