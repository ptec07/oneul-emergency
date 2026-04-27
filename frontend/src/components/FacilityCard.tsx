export type FacilityCardFacility = {
  name: string
  distanceM: number
  statusLabel: string
  address: string
  phone?: string | null
  latitude: number
  longitude: number
  source?: string
  updatedAt?: string | null
  todayHours?: string | null
}

type FacilityCardProps = {
  facility: FacilityCardFacility
  onViewDetails?: (facility: FacilityCardFacility) => void
}

function formatDistance(distanceM: number): string {
  if (distanceM >= 1000) {
    return `${(distanceM / 1000).toFixed(1)}km`
  }

  return `${Math.round(distanceM)}m`
}

function buildDirectionsUrl(facility: FacilityCardFacility): string {
  const label = encodeURIComponent(facility.name)
  return `https://map.kakao.com/link/to/${label},${facility.latitude},${facility.longitude}`
}

export function FacilityCard({ facility, onViewDetails }: FacilityCardProps) {
  return (
    <article className="facility-card" aria-label={facility.name}>
      <div className="facility-card__header">
        <span className="status-badge">{facility.statusLabel}</span>
        <strong className="facility-card__distance">{formatDistance(facility.distanceM)}</strong>
      </div>
      <h2 className="facility-card__title">{facility.name}</h2>
      <p className="facility-card__address">{facility.address}</p>
      <div className="facility-card__actions">
        {facility.phone ? (
          <a className="facility-card__call" href={`tel:${facility.phone}`}>
            전화하기
          </a>
        ) : (
          <span className="facility-card__call facility-card__call--disabled">전화번호 없음</span>
        )}
        <a className="facility-card__directions" href={buildDirectionsUrl(facility)} target="_blank" rel="noreferrer">
          길찾기
        </a>
        {onViewDetails ? (
          <button className="facility-card__details" type="button" onClick={() => onViewDetails(facility)}>
            상세 보기
          </button>
        ) : null}
      </div>
    </article>
  )
}
