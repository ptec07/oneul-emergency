from pathlib import Path

import httpx
from fastapi import APIRouter

from app.core.settings import Settings
from app.providers.pharmacy import parse_pharmacies_xml
from app.providers.public_data_client import fetch_pharmacies_xml
from app.services.geo import sort_by_distance

router = APIRouter(prefix="/api")

PHARMACY_NOTICE = "약국 운영시간은 변동될 수 있습니다. 방문 전 전화로 확인하세요."


def _fixture_path() -> Path:
    return Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "pharmacies_sample.xml"


def _load_pharmacies_xml(lat: float, lng: float) -> str:
    settings = Settings()
    if settings.public_data_service_key:
        try:
            with httpx.Client(timeout=10) as client:
                return fetch_pharmacies_xml(
                    client,
                    service_key=settings.public_data_service_key,
                    lat=lat,
                    lng=lng,
                    num_rows=50,
                )
        except httpx.HTTPError:
            pass

    return _fixture_path().read_text(encoding="utf-8")


@router.get("/pharmacies/open-now")
def list_open_now_pharmacies(lat: float, lng: float, radiusM: int = 3000) -> dict:
    xml_text = _load_pharmacies_xml(lat, lng)
    pharmacies = parse_pharmacies_xml(xml_text)
    items = [item for item in sort_by_distance(pharmacies, lat, lng) if item["distanceM"] <= radiusM]
    return {"items": items, "count": len(items), "notice": PHARMACY_NOTICE}
