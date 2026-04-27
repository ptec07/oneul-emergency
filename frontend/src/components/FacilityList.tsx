import { FacilityCard, type FacilityCardFacility } from './FacilityCard'
import { MapPreview } from './MapPreview'

export type FacilityListItem = FacilityCardFacility

type FacilityListProps = {
  title: string
  notice: string
  facilities: FacilityListItem[]
  onViewDetails?: (facility: FacilityListItem) => void
}

const EMPTY_MESSAGE = '조건에 맞는 결과를 찾지 못했습니다. 검색 반경을 넓히거나 119/기관 전화 확인을 이용하세요.'

export function FacilityList({ title, notice, facilities, onViewDetails }: FacilityListProps) {
  return (
    <section className="facility-list" aria-labelledby="facility-list-title">
      <div className="facility-list__header">
        <h2 id="facility-list-title">{title}</h2>
        <p>{notice}</p>
      </div>
      {facilities.length === 0 ? (
        <p className="facility-list__empty">{EMPTY_MESSAGE}</p>
      ) : (
        <>
          <MapPreview facilities={facilities} />
          <div className="facility-list__items">
            {facilities.map((facility) => (
              <FacilityCard key={`${facility.name}-${facility.latitude}-${facility.longitude}`} facility={facility} onViewDetails={onViewDetails} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
