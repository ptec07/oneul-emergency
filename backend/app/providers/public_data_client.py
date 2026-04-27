from __future__ import annotations

import httpx

PUBLIC_DATA_BASE_URL = "https://apis.data.go.kr"
EMERGENCY_ROOMS_PATH = "/B552657/ErmctInfoInqireService/getEgytListInfoInqire"
PHARMACIES_PATH = "/B552657/ErmctInsttInfoInqireService/getParmacyLcinfoInqire"


def _fetch_xml(
    client: httpx.Client,
    *,
    path: str,
    service_key: str,
    lat: float,
    lng: float,
    num_rows: int,
) -> str:
    response = client.get(
        f"{PUBLIC_DATA_BASE_URL}{path}",
        params={
            "serviceKey": service_key,
            "WGS84_LAT": str(lat),
            "WGS84_LON": str(lng),
            "pageNo": "1",
            "numOfRows": str(num_rows),
        },
    )
    response.raise_for_status()
    return response.text


def fetch_emergency_rooms_xml(
    client: httpx.Client,
    *,
    service_key: str,
    lat: float,
    lng: float,
    num_rows: int = 50,
) -> str:
    return _fetch_xml(
        client,
        path=EMERGENCY_ROOMS_PATH,
        service_key=service_key,
        lat=lat,
        lng=lng,
        num_rows=num_rows,
    )


def fetch_pharmacies_xml(
    client: httpx.Client,
    *,
    service_key: str,
    lat: float,
    lng: float,
    num_rows: int = 50,
) -> str:
    return _fetch_xml(
        client,
        path=PHARMACIES_PATH,
        service_key=service_key,
        lat=lat,
        lng=lng,
        num_rows=num_rows,
    )
