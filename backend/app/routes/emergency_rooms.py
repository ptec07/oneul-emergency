from pathlib import Path

import httpx
from fastapi import APIRouter

from app.core.settings import Settings
from app.providers.emergency import parse_emergency_rooms_xml
from app.providers.public_data_client import fetch_emergency_rooms_xml
from app.services.geo import sort_by_distance

router = APIRouter(prefix="/api")

EMERGENCY_NOTICE = "응급실 상황은 실시간으로 변동될 수 있습니다. 방문 전 반드시 전화로 확인하세요."


def _fixture_path() -> Path:
    return Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "emergency_rooms_sample.xml"


def _load_emergency_rooms_xml(lat: float, lng: float) -> str:
    settings = Settings()
    if settings.public_data_service_key:
        try:
            with httpx.Client(timeout=10) as client:
                return fetch_emergency_rooms_xml(
                    client,
                    service_key=settings.public_data_service_key,
                    lat=lat,
                    lng=lng,
                    num_rows=50,
                )
        except httpx.HTTPError:
            pass

    return _fixture_path().read_text(encoding="utf-8")


@router.get("/emergency-rooms")
def list_emergency_rooms(lat: float, lng: float, radiusM: int = 5000) -> dict:
    xml_text = _load_emergency_rooms_xml(lat, lng)
    rooms = parse_emergency_rooms_xml(xml_text)
    items = [item for item in sort_by_distance(rooms, lat, lng) if item["distanceM"] <= radiusM]
    return {"items": items, "count": len(items), "notice": EMERGENCY_NOTICE}
