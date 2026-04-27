# 오늘응급 데이터/API 설계

## 1. 공공데이터 소스

### 1.1 국립중앙의료원_전국 응급의료기관 정보 조회 서비스

- URL: https://www.data.go.kr/data/15000563/openapi.do
- 제공기관: 국립중앙의료원
- 응답 형식: XML
- 업데이트 주기: 실시간
- 활용 목적: 응급실, 응급의료기관, 병상, 중증질환 수용가능정보, 위치, 전화번호
- 우선순위: 1순위

### 1.2 국립중앙의료원_전국 약국 정보 조회 서비스

- URL: https://www.data.go.kr/data/15000576/openapi.do
- 제공기관: 국립중앙의료원
- 응답 형식: XML
- 업데이트 주기: 실시간
- 활용 목적: 전국 약국 정보, 운영 중 약국 검색, 약국 상세
- 우선순위: 1순위

### 1.3 건강보험심사평가원_약국정보서비스

- URL: https://www.data.go.kr/data/15001673/openapi.do
- 제공기관: 건강보험심사평가원
- 응답 형식: XML
- 업데이트 주기: 실시간
- 활용 목적: 약국 기본정보 보강
- 우선순위: 2순위

### 1.4 행정안전부_응급의료시설

- URL: https://www.data.go.kr/data/15101855/openapi.do
- 제공기관: 행정안전부
- 응답 형식: WMS
- 업데이트 주기: 실시간
- 활용 목적: 응급의료시설 위치/부가정보 보강
- 우선순위: 3순위

## 2. 내부 API 설계

## 2.1 Health Check

```http
GET /api/health
```

응답:

```json
{
  "status": "ok",
  "service": "oneul-emergency-api"
}
```

## 2.2 응급실 목록

```http
GET /api/emergency-rooms?lat=37.5665&lng=126.9780&radiusM=5000
```

### 응답

```json
{
  "items": [
    {
      "id": "A1100010",
      "name": "서울OO병원",
      "category": "권역응급의료센터",
      "address": "서울특별시 ...",
      "phone": "02-0000-0000",
      "emergencyPhone": "02-0000-0001",
      "latitude": 37.56,
      "longitude": 126.97,
      "distanceM": 1240,
      "status": "CALL_REQUIRED",
      "statusLabel": "전화 확인 필요",
      "availableBeds": null,
      "source": "국립중앙의료원_전국 응급의료기관 정보 조회 서비스",
      "updatedAt": "2026-04-27T06:00:00+09:00"
    }
  ],
  "count": 1,
  "notice": "응급실 상황은 실시간으로 변동될 수 있습니다. 방문 전 반드시 전화로 확인하세요."
}
```

## 2.3 현재 운영 중 약국 목록

```http
GET /api/pharmacies/open-now?lat=37.5665&lng=126.9780&radiusM=3000
```

### 응답

```json
{
  "items": [
    {
      "id": "PHARM-001",
      "name": "OO약국",
      "address": "서울특별시 ...",
      "phone": "02-0000-0000",
      "latitude": 37.56,
      "longitude": 126.97,
      "distanceM": 850,
      "openStatus": "OPEN",
      "openStatusLabel": "현재 운영 중",
      "todayHours": "09:00~22:00",
      "source": "국립중앙의료원_전국 약국 정보 조회 서비스",
      "updatedAt": "2026-04-27T06:00:00+09:00"
    }
  ],
  "count": 1,
  "notice": "약국 운영시간은 변동될 수 있습니다. 방문 전 전화로 확인하세요."
}
```

## 2.4 상세 조회

```http
GET /api/facilities/emergency-room/{id}
GET /api/facilities/pharmacy/{id}
```

상세 응답은 목록 필드에 원천 데이터 상세 필드를 추가한다.

## 3. 내부 데이터 타입

### EmergencyRoom

```ts
export type EmergencyRoom = {
  id: string
  name: string
  category?: string
  address: string
  phone?: string
  emergencyPhone?: string
  latitude: number
  longitude: number
  distanceM: number
  status: 'AVAILABLE' | 'LIMITED' | 'CALL_REQUIRED' | 'UNAVAILABLE' | 'UNKNOWN'
  statusLabel: string
  availableBeds?: number | null
  source: string
  updatedAt?: string | null
}
```

### Pharmacy

```ts
export type Pharmacy = {
  id: string
  name: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  distanceM: number
  openStatus: 'OPEN' | 'CLOSED' | 'CALL_REQUIRED' | 'UNKNOWN'
  openStatusLabel: string
  todayHours?: string | null
  source: string
  updatedAt?: string | null
}
```

## 4. 캐싱 전략

MVP:

- 위치 기반 검색 응답: 30~60초 TTL
- API 장애 시 최근 성공 응답을 `stale` 표시와 함께 최대 5분까지 fallback 검토

주의:

- 응급실 병상/수용 가능 정보는 오래 캐시하면 위험하므로 장기 캐시 금지
- stale 데이터는 반드시 `정보가 최신이 아닐 수 있음`으로 표시

## 5. 테스트 전략

### 백엔드

- 공공데이터 XML fixture 저장
- XML parser 단위 테스트
- 거리 계산 테스트
- 운영시간 판정 테스트
- API route 응답 schema 테스트
- 공공 API 장애/타임아웃 테스트

### 프론트엔드

- 홈 화면 렌더링 테스트
- 위치 권한 거부 안내 테스트
- 응급실/약국 카드 렌더링 테스트
- 전화 링크 href 테스트
- 길찾기 링크 생성 테스트
- PWA manifest 존재 테스트
