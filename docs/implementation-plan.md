# 오늘응급 Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a PWA MVP that helps users find nearby emergency rooms and currently open pharmacies using public data APIs.

**Architecture:** The product uses a Vite/React/TypeScript PWA frontend and a FastAPI backend. The backend protects public data API keys, converts XML to normalized JSON, calculates distance, derives safe display status, and returns frontend-friendly responses.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS, FastAPI, Python, pytest, Vitest, public data OpenAPI, PWA manifest/service worker.

---

## Phase 0: Safe project scaffold

### Task 0.1: Verify target directory safety

**Objective:** Ensure `/home/ptec07/.hermes/hermes-agent/workforce/oneul-emergency` is the intended project path and avoid overwriting user files.

**Files:**
- Inspect: `/home/ptec07/.hermes/hermes-agent/workforce/oneul-emergency`

**Steps:**
1. Run `test -d /home/ptec07/.hermes/hermes-agent/workforce/oneul-emergency && find /home/ptec07/.hermes/hermes-agent/workforce/oneul-emergency -maxdepth 2 -type f | sort || true`
2. If existing files are not the docs created for this plan, stop and ask before editing.
3. If only this design scaffold exists, proceed.

---

## Phase 1: Minimal backend scaffold with TDD

### Task 1.1: Create FastAPI backend smoke test

**Objective:** Add a failing test for `/api/health` before implementation.

**Files:**
- Create: `backend/tests/test_health.py`
- Create after RED: `backend/app/main.py`
- Create: `backend/pyproject.toml`

**Step 1: Write failing test**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_returns_service_status():
    client = TestClient(app)

    response = client.get('/api/health')

    assert response.status_code == 200
    assert response.json() == {
        'status': 'ok',
        'service': 'oneul-emergency-api',
    }
```

**Step 2: Run RED**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
pytest tests/test_health.py -v
```

Expected: FAIL because `app.main` or `/api/health` does not exist.

**Step 3: Implement minimal FastAPI app**

```python
from fastapi import FastAPI

app = FastAPI(title='오늘응급 API')


@app.get('/api/health')
def health():
    return {'status': 'ok', 'service': 'oneul-emergency-api'}
```

**Step 4: Run GREEN**

```bash
pytest tests/test_health.py -v
```

Expected: PASS.

---

### Task 1.2: Add backend settings test

**Objective:** Ensure public data API key is read from environment without hardcoding.

**Files:**
- Create: `backend/tests/test_settings.py`
- Create: `backend/app/core/settings.py`
- Create: `backend/.env.example`

**Step 1: Write failing test**

```python
from app.core.settings import Settings


def test_settings_reads_public_data_service_key():
    settings = Settings(public_data_service_key='test-key')

    assert settings.public_data_service_key == 'test-key'
```

**Step 2: Run RED**

```bash
pytest tests/test_settings.py -v
```

Expected: FAIL because settings module does not exist.

**Step 3: Implement settings**

Use Pydantic settings or a small dataclass. Keep minimal.

**Step 4: Run GREEN**

```bash
pytest tests/test_settings.py -v
pytest tests/ -q
```

---

## Phase 2: Public data parsing layer

### Task 2.1: Add emergency room XML parser fixture test

**Objective:** Normalize public emergency API XML into an internal `EmergencyRoom` shape.

**Files:**
- Create: `backend/tests/fixtures/emergency_rooms_sample.xml`
- Create: `backend/tests/test_emergency_parser.py`
- Create after RED: `backend/app/providers/emergency.py`

**Test behavior:**
- Parses hospital name, address, phone, latitude, longitude.
- Missing state fields become `CALL_REQUIRED` not misleading `AVAILABLE`.

**Verification:**

```bash
pytest tests/test_emergency_parser.py -v
```

---

### Task 2.2: Add pharmacy XML parser fixture test

**Objective:** Normalize pharmacy XML into an internal `Pharmacy` shape.

**Files:**
- Create: `backend/tests/fixtures/pharmacies_sample.xml`
- Create: `backend/tests/test_pharmacy_parser.py`
- Create after RED: `backend/app/providers/pharmacy.py`

**Test behavior:**
- Parses pharmacy name, address, phone, latitude, longitude, today hours.
- Missing operation hours become `CALL_REQUIRED`.

**Verification:**

```bash
pytest tests/test_pharmacy_parser.py -v
```

---

### Task 2.3: Add distance calculation test

**Objective:** Sort facilities by distance from user coordinates.

**Files:**
- Create: `backend/tests/test_geo.py`
- Create after RED: `backend/app/services/geo.py`

**Test behavior:**
- Haversine distance returns meters.
- Sort order is nearest first.

**Verification:**

```bash
pytest tests/test_geo.py -v
```

---

### Task 2.4: Add pharmacy open-status test

**Objective:** Safely determine current pharmacy operating status.

**Files:**
- Create: `backend/tests/test_open_status.py`
- Create after RED: `backend/app/services/open_status.py`

**Test cases:**
- `09:00~22:00` at 21:00 -> `OPEN`
- `09:00~22:00` at 23:00 -> `CLOSED`
- `20:00~02:00` at 01:00 -> `OPEN`
- missing hours -> `CALL_REQUIRED`

**Verification:**

```bash
pytest tests/test_open_status.py -v
```

---

## Phase 3: Backend API routes

### Task 3.1: Add `/api/emergency-rooms` route test

**Objective:** Return normalized emergency room list in a stable envelope.

**Files:**
- Create: `backend/tests/test_emergency_routes.py`
- Modify after RED: `backend/app/main.py`
- Create after RED: `backend/app/routes/emergency_rooms.py`

**Expected response shape:**

```json
{
  "items": [],
  "count": 0,
  "notice": "응급실 상황은 실시간으로 변동될 수 있습니다. 방문 전 반드시 전화로 확인하세요."
}
```

**Verification:**

```bash
pytest tests/test_emergency_routes.py -v
pytest tests/ -q
```

---

### Task 3.2: Add `/api/pharmacies/open-now` route test

**Objective:** Return normalized pharmacy list in a stable envelope.

**Files:**
- Create: `backend/tests/test_pharmacy_routes.py`
- Modify after RED: `backend/app/main.py`
- Create after RED: `backend/app/routes/pharmacies.py`

**Verification:**

```bash
pytest tests/test_pharmacy_routes.py -v
pytest tests/ -q
```

---

## Phase 4: Frontend/PWA scaffold with TDD

### Task 4.1: Create Vite React frontend smoke test

**Objective:** Render the app title and primary emergency actions.

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/test/smoke.test.tsx`
- Create: `frontend/src/test/setup.ts`

**Test behavior:**
- Title `오늘응급` renders.
- Buttons `가까운 응급실 찾기`, `지금 문 연 약국 찾기`, `119 전화하기` render.

**Verification:**

```bash
cd frontend
npm install
npm test -- --run
npm run build
```

---

### Task 4.2: Add PWA manifest test

**Objective:** Ensure installable app metadata exists.

**Files:**
- Create: `frontend/public/manifest.webmanifest`
- Create: `frontend/src/test/pwa.test.ts`

**Test behavior:**
- `name` is `오늘응급`.
- `short_name` is `오늘응급`.
- `display` is `standalone`.
- `start_url` is `/`.

**Verification:**

```bash
npm test -- --run
npm run build
```

---

## Phase 5: Frontend feature screens

### Task 5.1: Add facility card component test

**Objective:** Render emergency/pharmacy cards with phone and directions links.

**Files:**
- Create: `frontend/src/components/FacilityCard.tsx`
- Create: `frontend/src/components/FacilityCard.test.tsx`

**Test behavior:**
- Shows facility name, distance, status label.
- Phone button uses `tel:` link.
- Directions button renders.

---

### Task 5.2: Add location permission UI test

**Objective:** Gracefully handle location permission states.

**Files:**
- Create: `frontend/src/components/LocationPrompt.tsx`
- Create: `frontend/src/components/LocationPrompt.test.tsx`

**Test behavior:**
- Shows current location CTA.
- Shows address search fallback message when denied.

---

### Task 5.3: Add API client tests

**Objective:** Fetch emergency rooms and pharmacies through backend API only.

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/client.test.ts`

**Test behavior:**
- Calls `/api/emergency-rooms` with lat/lng/radiusM.
- Calls `/api/pharmacies/open-now` with lat/lng/radiusM.
- Throws a visible error on non-OK response.

---

## Phase 6: Integration and verification

### Task 6.1: Add root README run instructions

**Objective:** Document how to run backend and frontend locally.

**Files:**
- Modify: `README.md`

**Include:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
uvicorn app.main:app --reload

cd frontend
npm install
npm run dev
```

---

### Task 6.2: Run full verification

**Objective:** Ensure MVP scaffold is testable and buildable.

**Commands:**

```bash
cd backend && source .venv/bin/activate && pytest tests/ -q
cd frontend && npm test -- --run
cd frontend && npm run build
```

Expected: all tests pass and frontend builds.

---

## Guardrails

- Do not hardcode API keys.
- Do not store precise user location by default.
- Do not display `진료 가능` unless source data confidently supports it.
- Prefer `전화 확인 필요` for uncertain states.
- Always show emergency disclaimer.
- Follow TDD: failing test first, then implementation.
