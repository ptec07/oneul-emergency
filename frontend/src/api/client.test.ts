import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchEmergencyRooms, fetchGeocode, fetchOpenPharmacies } from './client'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('오늘응급 API client', () => {
  it('fetches nearby emergency rooms through the backend API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [], count: 0, notice: '응급실 안내' }),
    } as Response)

    const result = await fetchEmergencyRooms({ lat: 37.5665, lng: 126.978, radiusM: 5000 })

    expect(fetchMock).toHaveBeenCalledWith('/api/emergency-rooms?lat=37.5665&lng=126.978&radiusM=5000')
    expect(result).toEqual({ items: [], count: 0, notice: '응급실 안내' })
  })

  it('fetches currently open pharmacies through the backend API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [], count: 0, notice: '약국 안내' }),
    } as Response)

    const result = await fetchOpenPharmacies({ lat: 37.5665, lng: 126.978, radiusM: 3000 })

    expect(fetchMock).toHaveBeenCalledWith('/api/pharmacies/open-now?lat=37.5665&lng=126.978&radiusM=3000')
    expect(result).toEqual({ items: [], count: 0, notice: '약국 안내' })
  })

  it('fetches geocode candidates for an address or place query', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: [{ label: '강남역', address: '서울특별시 강남구 강남대로 지하396', lat: 37.4979, lng: 127.0276, source: 'fixture' }],
        count: 1,
      }),
    } as Response)

    const result = await fetchGeocode('강남역 2번 출구')

    expect(fetchMock).toHaveBeenCalledWith('/api/geocode?query=%EA%B0%95%EB%82%A8%EC%97%AD+2%EB%B2%88+%EC%B6%9C%EA%B5%AC')
    expect(result.items[0]).toMatchObject({ label: '강남역', lat: 37.4979, lng: 127.0276 })
  })

  it('throws a useful error when the backend request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ detail: '공공데이터 응답 지연' }),
    } as Response)

    await expect(fetchEmergencyRooms({ lat: 37.5665, lng: 126.978, radiusM: 5000 })).rejects.toThrow(
      '요청에 실패했습니다. 상태 코드: 503',
    )
  })
})
