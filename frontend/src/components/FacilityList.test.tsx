import { render, screen } from '@testing-library/react'

import { FacilityList, type FacilityListItem } from './FacilityList'

const facilities: FacilityListItem[] = [
  {
    name: '서울OO병원 응급실',
    distanceM: 1240,
    statusLabel: '전화 확인 필요',
    address: '서울특별시 중구 세종대로 110',
    phone: '02-0000-0001',
    latitude: 37.5665,
    longitude: 126.978,
  },
]

describe('FacilityList', () => {
  it('renders a notice, map preview, and a card for each facility', () => {
    render(<FacilityList title="가까운 응급실" notice="방문 전 반드시 전화로 확인하세요." facilities={facilities} onViewDetails={() => undefined} />)

    expect(screen.getByRole('heading', { name: '가까운 응급실' })).toBeInTheDocument()
    expect(screen.getByText('방문 전 반드시 전화로 확인하세요.')).toBeInTheDocument()
    expect(screen.getByText('서울OO병원 응급실')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '검색 결과 지도 미리보기' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '서울OO병원 응급실 지도에서 보기' })).toHaveAttribute('href', expect.stringContaining('map.kakao.com'))
  })

  it('renders an empty-state message when no facilities are available', () => {
    render(<FacilityList title="지금 문 연 약국" notice="약국 안내" facilities={[]} />)

    expect(screen.getByText('조건에 맞는 결과를 찾지 못했습니다. 검색 반경을 넓히거나 119/기관 전화 확인을 이용하세요.')).toBeInTheDocument()
  })
})
