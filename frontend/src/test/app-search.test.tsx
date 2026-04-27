import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../App'
import { fetchEmergencyRooms, fetchGeocode, fetchOpenPharmacies } from '../api/client'

vi.mock('../api/client', () => ({
  fetchEmergencyRooms: vi.fn(),
  fetchGeocode: vi.fn(),
  fetchOpenPharmacies: vi.fn(),
}))

const mockFetchEmergencyRooms = vi.mocked(fetchEmergencyRooms)
const mockFetchGeocode = vi.mocked(fetchGeocode)
const mockFetchOpenPharmacies = vi.mocked(fetchOpenPharmacies)

describe('오늘응급 검색 흐름', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    })
  })

  it('shows an offline-ready guidance note for installed PWA users', () => {
    render(<App />)

    expect(screen.getByText('오프라인 상태에서는 마지막으로 불러온 안내와 전화 확인 문구를 우선 보여줍니다.')).toBeInTheDocument()
  })

  it('uses browser geolocation instead of a Seoul default when the emergency button is clicked', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: 37.636,
          longitude: 127.216,
          accuracy: 20,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: 1234,
        toJSON: () => ({}),
      })
    })
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })
    mockFetchEmergencyRooms.mockResolvedValue({
      items: [
        {
          name: '남양주OO병원 응급실',
          distanceM: 1240,
          statusLabel: '전화 확인 필요',
          address: '경기도 남양주시',
          phone: '031-0000-0001',
          latitude: 37.636,
          longitude: 127.216,
        },
      ],
      count: 1,
      notice: '응급실 상황은 실시간으로 변동될 수 있습니다. 방문 전 반드시 전화로 확인하세요.',
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '가까운 응급실 찾기' }))

    await waitFor(() => expect(mockFetchEmergencyRooms).toHaveBeenCalledWith({ lat: 37.636, lng: 127.216, radiusM: 15000 }))
    expect(mockFetchEmergencyRooms).not.toHaveBeenCalledWith({ lat: 37.5665, lng: 126.978, radiusM: 5000 })
    expect(await screen.findByRole('heading', { name: '가까운 응급실' })).toBeInTheDocument()
    expect(screen.getByText('남양주OO병원 응급실')).toBeInTheDocument()
  })

  it('uses browser geolocation instead of a Seoul default when the pharmacy button is clicked', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: 37.636,
          longitude: 127.216,
          accuracy: 20,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: 1234,
        toJSON: () => ({}),
      })
    })
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })
    mockFetchOpenPharmacies.mockResolvedValue({
      items: [
        {
          name: '남양주OO약국',
          distanceM: 850,
          statusLabel: '현재 운영 중',
          address: '경기도 남양주시',
          phone: '031-0000-0002',
          latitude: 37.635,
          longitude: 127.217,
        },
      ],
      count: 1,
      notice: '약국 운영시간은 변동될 수 있습니다. 방문 전 전화로 확인하세요.',
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '지금 문 연 약국 찾기' }))

    await waitFor(() => expect(mockFetchOpenPharmacies).toHaveBeenCalledWith({ lat: 37.636, lng: 127.216, radiusM: 10000 }))
    expect(mockFetchOpenPharmacies).not.toHaveBeenCalledWith({ lat: 37.5665, lng: 126.978, radiusM: 3000 })
    expect(await screen.findByRole('heading', { name: '지금 문 연 약국' })).toBeInTheDocument()
    expect(screen.getByText('남양주OO약국')).toBeInTheDocument()
  })

  it('shows a visible error when search fails', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: 37.636,
          longitude: 127.216,
          accuracy: 20,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: 1234,
        toJSON: () => ({}),
      })
    })
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })
    mockFetchEmergencyRooms.mockRejectedValue(new Error('network down'))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '가까운 응급실 찾기' }))

    expect(await screen.findByText('현재 정보를 불러오지 못했습니다. 잠시 후 다시 시도하거나 119/기관 전화 확인을 이용하세요.')).toBeInTheDocument()
  })

  it('uses browser geolocation coordinates for current-location emergency search', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: 37.501,
          longitude: 127.039,
          accuracy: 15,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: 1234,
        toJSON: () => ({}),
      })
    })
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })
    mockFetchEmergencyRooms.mockResolvedValue({
      items: [],
      count: 0,
      notice: '응급실 상황은 실시간으로 변동될 수 있습니다. 방문 전 반드시 전화로 확인하세요.',
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '현재 위치로 찾기' }))

    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(mockFetchEmergencyRooms).toHaveBeenCalledWith({ lat: 37.501, lng: 127.039, radiusM: 15000 }))
  })

  it('shows a permission guidance message when current location cannot be read', async () => {
    const getCurrentPosition = vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 })
    })
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '현재 위치로 찾기' }))

    expect(await screen.findByText('현재 위치를 확인하지 못했습니다. 위치 권한을 허용하거나 주소/지역명으로 검색해 주세요.')).toBeInTheDocument()
    expect(mockFetchEmergencyRooms).not.toHaveBeenCalled()
  })

  it('geocodes an address query and searches emergency rooms around the matched coordinates', async () => {
    mockFetchGeocode.mockResolvedValue({
      items: [{ label: '강남역', address: '서울특별시 강남구 강남대로 지하396', lat: 37.4979, lng: 127.0276, source: 'fixture' }],
      count: 1,
    })
    mockFetchEmergencyRooms.mockResolvedValue({
      items: [],
      count: 0,
      notice: '응급실 상황은 실시간으로 변동될 수 있습니다. 방문 전 반드시 전화로 확인하세요.',
    })

    render(<App />)
    fireEvent.change(screen.getByLabelText('주소 또는 지역명'), { target: { value: '강남역' } })
    fireEvent.click(screen.getByRole('button', { name: '주소로 찾기' }))

    await waitFor(() => expect(mockFetchGeocode).toHaveBeenCalledWith('강남역'))
    await waitFor(() => expect(mockFetchEmergencyRooms).toHaveBeenCalledWith({ lat: 37.4979, lng: 127.0276, radiusM: 15000 }))
  })

  it('opens a detail panel with source, updated time, and call confirmation guidance', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: 37.636,
          longitude: 127.216,
          accuracy: 20,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: 1234,
        toJSON: () => ({}),
      })
    })
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })
    mockFetchEmergencyRooms.mockResolvedValue({
      items: [
        {
          name: '서울OO병원 응급실',
          distanceM: 1240,
          statusLabel: '전화 확인 필요',
          address: '서울특별시 중구 세종대로 110',
          phone: '02-0000-0001',
          latitude: 37.5665,
          longitude: 126.978,
          source: '국립중앙의료원',
          updatedAt: '2026-04-27T09:30:00',
        },
      ],
      count: 1,
      notice: '응급실 상황은 실시간으로 변동될 수 있습니다. 방문 전 반드시 전화로 확인하세요.',
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '가까운 응급실 찾기' }))
    fireEvent.click(await screen.findByRole('button', { name: '상세 보기' }))

    expect(screen.getByRole('dialog', { name: '서울OO병원 응급실 상세 정보' })).toBeInTheDocument()
    expect(screen.getByText('데이터 출처: 국립중앙의료원')).toBeInTheDocument()
    expect(screen.getByText('마지막 갱신: 2026-04-27 09:30')).toBeInTheDocument()
    expect(screen.getByText('방문 전 전화 확인 필요')).toBeInTheDocument()
  })

  it('shows a visible message when address search has no coordinate candidates', async () => {
    mockFetchGeocode.mockResolvedValue({ items: [], count: 0 })

    render(<App />)
    fireEvent.change(screen.getByLabelText('주소 또는 지역명'), { target: { value: '없는장소' } })
    fireEvent.click(screen.getByRole('button', { name: '주소로 찾기' }))

    expect(await screen.findByText('입력한 주소나 지역명을 찾지 못했습니다. 다른 검색어로 다시 시도해 주세요.')).toBeInTheDocument()
    expect(mockFetchEmergencyRooms).not.toHaveBeenCalled()
  })
})
