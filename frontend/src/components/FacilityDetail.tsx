import type { FacilityCardFacility } from './FacilityCard'

type FacilityDetailProps = {
  facility: FacilityCardFacility
  onClose: () => void
}

function formatUpdatedAt(value?: string | null): string {
  if (!value) {
    return '정보 없음'
  }

  return value.replace('T', ' ').slice(0, 16)
}

export function FacilityDetail({ facility, onClose }: FacilityDetailProps) {
  return (
    <section className="facility-detail" role="dialog" aria-label={`${facility.name} 상세 정보`}>
      <div className="facility-detail__header">
        <h2>{facility.name}</h2>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>
      <p className="facility-detail__status">방문 전 전화 확인 필요</p>
      <dl>
        <div>
          <dt>주소</dt>
          <dd>{facility.address}</dd>
        </div>
        <div>
          <dt>전화</dt>
          <dd>{facility.phone ?? '전화번호 없음'}</dd>
        </div>
        {facility.todayHours ? (
          <div>
            <dt>오늘 운영시간</dt>
            <dd>{facility.todayHours}</dd>
          </div>
        ) : null}
        <div>
          <dt>출처</dt>
          <dd>데이터 출처: {facility.source ?? '공공데이터'}</dd>
        </div>
        <div>
          <dt>갱신</dt>
          <dd>마지막 갱신: {formatUpdatedAt(facility.updatedAt)}</dd>
        </div>
      </dl>
      <p className="facility-detail__notice">상황은 실시간으로 바뀔 수 있으므로 출발 전 반드시 전화로 확인하세요.</p>
    </section>
  )
}
