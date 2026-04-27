import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { FacilityCard, type FacilityCardFacility } from './FacilityCard'

const facility: FacilityCardFacility = {
  name: '서울OO병원 응급실',
  distanceM: 1240,
  statusLabel: '전화 확인 필요',
  address: '서울특별시 중구 세종대로 110',
  phone: '02-0000-0001',
  latitude: 37.5665,
  longitude: 126.978,
}

describe('FacilityCard', () => {
  it('renders facility details with phone, directions, and detail actions', () => {
    const handleViewDetails = vi.fn()
    render(<FacilityCard facility={facility} onViewDetails={handleViewDetails} />)

    expect(screen.getByText('서울OO병원 응급실')).toBeInTheDocument()
    expect(screen.getByText('1.2km')).toBeInTheDocument()
    expect(screen.getByText('전화 확인 필요')).toBeInTheDocument()
    expect(screen.getByText('서울특별시 중구 세종대로 110')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: '전화하기' })).toHaveAttribute('href', 'tel:02-0000-0001')
    expect(screen.getByRole('link', { name: '길찾기' })).toHaveAttribute(
      'href',
      expect.stringContaining('37.5665,126.978'),
    )

    fireEvent.click(screen.getByRole('button', { name: '상세 보기' }))

    expect(handleViewDetails).toHaveBeenCalledWith(facility)
  })
})
