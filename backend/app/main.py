from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import Settings
from app.routes.emergency_rooms import router as emergency_rooms_router
from app.routes.geocode import router as geocode_router
from app.routes.pharmacies import router as pharmacies_router

settings = Settings()
app = FastAPI(title="오늘응급 API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin] if settings.frontend_origin else [],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):(4\d{3}|5\d{3})",
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(emergency_rooms_router)
app.include_router(geocode_router)
app.include_router(pharmacies_router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "oneul-emergency-api"}
