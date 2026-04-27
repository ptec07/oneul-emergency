from fastapi import APIRouter

router = APIRouter(prefix="/api")

GEOCODE_FIXTURES = [
    {
        "label": "강남역",
        "address": "서울특별시 강남구 강남대로 지하396",
        "lat": 37.4979,
        "lng": 127.0276,
        "source": "fixture",
    },
    {
        "label": "서울시청",
        "address": "서울특별시 중구 세종대로 110",
        "lat": 37.5665,
        "lng": 126.978,
        "source": "fixture",
    },
]


@router.get("/geocode")
def geocode(query: str) -> dict:
    normalized_query = query.strip().lower()
    if not normalized_query:
        return {"items": [], "count": 0}

    items = [
        item
        for item in GEOCODE_FIXTURES
        if normalized_query in item["label"].lower() or normalized_query in item["address"].lower()
    ]
    return {"items": items, "count": len(items)}
