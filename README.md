# 오늘응급

> 공공데이터 기반 응급실 및 야간·주말 약국 PWA

**오늘응급**은 사용자의 현재 위치를 기준으로 가까운 응급실과 지금 운영 중인 약국을 빠르게 찾고, 전화하기·길찾기까지 바로 이어주는 생활 안전 PWA입니다.

## 제품 방향

- **형태:** PWA 우선 개발
- **핵심 가치:** 긴급 상황에서 10초 안에 행동 가능한 정보 제공
- **1차 MVP:** 응급실 검색, 약국 검색, 전화하기, 길찾기, 지도 표시
- **데이터:** 공공데이터포털 OpenAPI 중심

## 주요 문서

- [제품 요구사항 문서](docs/product-requirements.md)
- [기술 설계서](docs/technical-design.md)
- [데이터/API 설계](docs/data-api-design.md)
- [화면/UX 설계](docs/ux-design.md)
- [구현 계획](docs/implementation-plan.md)

## 핵심 공공데이터 후보

1. 국립중앙의료원_전국 응급의료기관 정보 조회 서비스
   - https://www.data.go.kr/data/15000563/openapi.do
2. 국립중앙의료원_전국 약국 정보 조회 서비스
   - https://www.data.go.kr/data/15000576/openapi.do
3. 건강보험심사평가원_약국정보서비스
   - https://www.data.go.kr/data/15001673/openapi.do
4. 행정안전부_응급의료시설
   - https://www.data.go.kr/data/15101855/openapi.do

## 추천 기술 스택

```text
Frontend/PWA: Vite + React + TypeScript + Tailwind CSS
Backend: FastAPI + Python
Cache: Redis 또는 in-memory cache MVP
Map: Kakao Map 또는 Naver Map
Deploy: Vercel(frontend) + Render/Fly.io/Railway(backend)
```

## 안전 고지 원칙

응급실·약국 운영 상태는 실시간으로 변동될 수 있으므로 모든 상세 화면과 결과 카드에 다음 원칙을 반영합니다.

> 방문 전 반드시 전화로 확인하세요. 생명이 위급한 경우 즉시 119에 신고하세요.

## 로컬 실행

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

프론트는 기본적으로 `/api`를 호출합니다. 배포 환경에서는 `VITE_API_BASE_URL`을 Render 등 백엔드 공개 URL로 설정합니다.

## Render Backend 배포

배포 준비 파일:

```text
render.yaml
backend/render.yaml
backend/Dockerfile
backend/Procfile
backend/.env.example
```

Render 설정 핵심값:

```text
Health check: /api/health
Dockerfile: ./backend/Dockerfile
Docker context: ./backend
```

필수 환경변수:

```text
ONEUL_EMERGENCY_PUBLIC_DATA_SERVICE_KEY
ONEUL_EMERGENCY_FRONTEND_ORIGIN
PORT=8000
```

`ONEUL_EMERGENCY_PUBLIC_DATA_SERVICE_KEY`는 data.go.kr에서 해당 응급의료기관/약국 API 활용신청이 승인된 키를 넣어야 합니다. 승인 전이나 API 장애 시에는 fixture fallback으로 MVP가 계속 동작합니다.

## Vercel Frontend 배포

배포 준비 파일:

```text
frontend/vercel.json
frontend/.env.example
```

Vercel 환경변수:

```text
VITE_API_BASE_URL=https://<render-backend>.onrender.com/api
```

`npm run build`는 Vite build 후 `dist/index.html`을 `dist/404.html`로 복사하여 정적 SPA fallback을 제공합니다.
