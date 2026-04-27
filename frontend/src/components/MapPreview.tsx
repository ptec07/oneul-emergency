import type { FacilityCardFacility } from './FacilityCard'

type MapPreviewProps = {
  facilities: FacilityCardFacility[]
}

function buildMapUrl(facility: FacilityCardFacility): string {
  const label = encodeURIComponent(facility.name)
  return `https://map.kakao.com/link/map/${label},${facility.latitude},${facility.longitude}`
}

export function MapPreview({ facilities }: MapPreviewProps) {
  if (facilities.length === 0) {
    return null
  }

  return (
    <section className="map-preview" aria-label="검색 결과 지도 미리보기">
      <h3>지도 미리보기</h3>
      <p>정식 지도 연동 전까지 카카오맵 링크로 위치를 확인합니다.</p>
      <ul>
        {facilities.map((facility) => (
          <li key={`${facility.name}-${facility.latitude}-${facility.longitude}`}>
            <a href={buildMapUrl(facility)} target="_blank" rel="noreferrer">
              {facility.name} 지도에서 보기
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
