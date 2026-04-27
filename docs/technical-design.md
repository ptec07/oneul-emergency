# 오늘응급 기술 설계서

## 1. 아키텍처 개요

오늘응급은 PWA 프론트엔드와 공공데이터 프록시 백엔드로 구성한다.

```text
Mobile Browser / PWA
  ↓ HTTPS
Frontend React App
  ↓ /api/*
Backend FastAPI
  ↓
Public Data APIs
  - NMC emergency medical institution API
  - NMC pharmacy API
  - HIRA pharmacy API(optional)
  - MOIS emergency facility API(optional)
```

## 2. 왜 PWA인가

- 앱스토어 없이 빠르게 배포 가능
- iOS/Android 공통 코드로 MVP 출시 가능
- 위치, 전화, 지도 연결 등 핵심 기능 구현 가능
- 응급 상황에서 링크 공유와 즉시 접속이 쉬움

## 3. 권장 스택

### Frontend

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query 또는 SWR
- 지도 SDK: Kakao Map 우선 검토

### Backend

- FastAPI
- Pydantic
- httpx
- defusedxml 또는 xmltodict
- pytest
- ruff

### Cache

MVP:
- in-memory TTL cache

확장:
- Redis

### Deployment

- Frontend: Vercel
- Backend: Render/Fly.io/Railway
- Secrets: PUBLIC_DATA_SERVICE_KEY, map API key 등 서버/플랫폼 환경변수

## 4. 백엔드 역할

프론트엔드에서 공공데이터 API를 직접 호출하지 않는다. 백엔드가 다음을 담당한다.

1. 공공데이터 API 키 보호
2. XML 응답을 JSON으로 변환
3. 응답 필드 정규화
4. 거리 계산
5. 운영 여부 계산
6. 장애/타임아웃 처리
7. 캐싱

## 5. 프론트엔드 역할

1. 위치 권한 요청
2. 주소 검색 대체 UI
3. 응급실/약국 결과 표시
4. 전화/길찾기 연결
5. PWA manifest/service worker 등록
6. 오류·재시도·전화 확인 안내 표시

## 6. API 경계

프론트엔드는 내부 백엔드 API만 호출한다.

```http
GET /api/health
GET /api/emergency-rooms?lat={lat}&lng={lng}&radiusM={radiusM}
GET /api/pharmacies/open-now?lat={lat}&lng={lng}&radiusM={radiusM}
GET /api/facilities/{type}/{id}
```

## 7. 상태 모델

### EmergencyRoomStatus

```text
AVAILABLE       응급 진료 가능으로 판단
LIMITED         혼잡 또는 제한적 가능
CALL_REQUIRED   정보 부족/전화 확인 필요
UNAVAILABLE     수용 어려움으로 판단
UNKNOWN         원천 데이터 상태 미상
```

### PharmacyOpenStatus

```text
OPEN            현재 운영 중
CLOSED          현재 운영 종료
CALL_REQUIRED   운영시간 정보 부족/전화 확인 필요
UNKNOWN         상태 미상
```

## 8. 위치/거리 계산

- 프론트엔드: 브라우저 Geolocation API로 현재 좌표 획득
- 백엔드: Haversine 거리 계산 후 거리순 정렬
- 추후 DB/PostGIS 도입 가능

## 9. PWA 구성

필수 파일:

```text
frontend/public/manifest.webmanifest
frontend/public/icons/icon-192.png
frontend/public/icons/icon-512.png
frontend/src/registerServiceWorker.ts
```

manifest 핵심값:

```json
{
  "name": "오늘응급",
  "short_name": "오늘응급",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#dc2626",
  "background_color": "#ffffff"
}
```

서비스 워커 MVP 범위:

- 앱 shell 캐시
- 오프라인 fallback 페이지
- 공공데이터 응답은 짧은 TTL만 적용하고 장기 오프라인 신뢰 정보로 쓰지 않음

## 10. 오류 처리 원칙

- 공공데이터 API 실패: `현재 정보를 불러오지 못했습니다. 전화 확인 또는 잠시 후 다시 시도하세요.`
- 위치 권한 거부: 주소 검색/지역 선택으로 대체
- 운영시간 부족: `전화 확인 필요` 명확히 표시
- 응급 상황: 항상 119 버튼 제공

## 11. 보안/개인정보

- API 키는 백엔드 환경변수에만 저장
- 위치 좌표는 요청 처리에만 사용하고 기본 저장하지 않음
- 로그에는 좌표를 정밀 저장하지 않거나 마스킹
- 건강정보, 이름, 전화번호 등 민감정보 수집 금지
