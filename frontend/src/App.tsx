import { useState } from 'react'

import { fetchEmergencyRooms, fetchGeocode, fetchOpenPharmacies, type FacilityApiItem, type FacilityListResponse } from './api/client'
import { FacilityDetail } from './components/FacilityDetail'
import { FacilityList, type FacilityListItem } from './components/FacilityList'
import { LocationPrompt } from './components/LocationPrompt'
import './styles.css'

const ERROR_MESSAGE = '현재 정보를 불러오지 못했습니다. 잠시 후 다시 시도하거나 119/기관 전화 확인을 이용하세요.'
const LOCATION_ERROR_MESSAGE = '현재 위치를 확인하지 못했습니다. 위치 권한을 허용하거나 주소/지역명으로 검색해 주세요.'
const ADDRESS_NOT_FOUND_MESSAGE = '입력한 주소나 지역명을 찾지 못했습니다. 다른 검색어로 다시 시도해 주세요.'

type ActiveSearch = 'emergency' | 'pharmacy' | null

type SearchLocation = {
  lat: number
  lng: number
}

function getCurrentCoordinates(): Promise<SearchLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation is not available'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      () => {
        reject(new Error('geolocation permission denied'))
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  })
}

function toFacilityListItem(item: FacilityApiItem): FacilityListItem {
  return {
    name: item.name,
    distanceM: item.distanceM,
    statusLabel: item.statusLabel ?? item.openStatusLabel ?? '전화 확인 필요',
    address: item.address,
    phone: item.emergencyPhone ?? item.phone,
    latitude: item.latitude,
    longitude: item.longitude,
    source: item.source,
    updatedAt: item.updatedAt,
    todayHours: item.todayHours,
  }
}

export default function App() {
  const [activeSearch, setActiveSearch] = useState<ActiveSearch>(null)
  const [result, setResult] = useState<FacilityListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [selectedFacility, setSelectedFacility] = useState<FacilityListItem | null>(null)

  async function runEmergencySearch(location: SearchLocation) {
    setActiveSearch('emergency')
    setIsLoading(true)
    setErrorMessage(null)
    setResult(null)
    setSelectedFacility(null)

    try {
      const response = await fetchEmergencyRooms({ ...location, radiusM: 5000 })
      setResult(response)
    } catch {
      setErrorMessage(ERROR_MESSAGE)
    } finally {
      setIsLoading(false)
    }
  }

  async function runPharmacySearch(location: SearchLocation) {
    setActiveSearch('pharmacy')
    setIsLoading(true)
    setErrorMessage(null)
    setResult(null)
    setSelectedFacility(null)

    try {
      const response = await fetchOpenPharmacies({ ...location, radiusM: 3000 })
      setResult(response)
    } catch {
      setErrorMessage(ERROR_MESSAGE)
    } finally {
      setIsLoading(false)
    }
  }

  async function runCurrentLocationSearch(searchType: Exclude<ActiveSearch, null> = 'emergency') {
    setActiveSearch(searchType)
    setIsLoading(true)
    setErrorMessage(null)
    setResult(null)
    setSelectedFacility(null)

    try {
      const location = await getCurrentCoordinates()
      setPermissionState('granted')
      if (searchType === 'pharmacy') {
        await runPharmacySearch(location)
      } else {
        await runEmergencySearch(location)
      }
    } catch {
      setPermissionState('denied')
      setErrorMessage(LOCATION_ERROR_MESSAGE)
      setIsLoading(false)
    }
  }

  async function runAddressSearch(query: string) {
    setActiveSearch('emergency')
    setIsLoading(true)
    setErrorMessage(null)
    setResult(null)
    setSelectedFacility(null)

    try {
      const response = await fetchGeocode(query)
      const candidate = response.items[0]
      if (!candidate) {
        setErrorMessage(ADDRESS_NOT_FOUND_MESSAGE)
        return
      }

      await runEmergencySearch({ lat: candidate.lat, lng: candidate.lng })
    } catch {
      setErrorMessage(ERROR_MESSAGE)
    } finally {
      setIsLoading(false)
    }
  }

  const title = activeSearch === 'pharmacy' ? '지금 문 연 약국' : '가까운 응급실'
  const facilities = result?.items.map(toFacilityListItem) ?? []

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">공공데이터 기반 생활 안전 PWA</p>
        <h1 id="home-title">오늘응급</h1>
        <p className="subtitle">내 주변 응급실과 지금 문 연 약국을 빠르게 찾으세요.</p>
        <div className="actions" aria-label="주요 기능">
          <button type="button" className="primary-action emergency" onClick={() => void runCurrentLocationSearch('emergency')}>
            가까운 응급실 찾기
          </button>
          <button type="button" className="primary-action pharmacy" onClick={() => void runCurrentLocationSearch('pharmacy')}>
            지금 문 연 약국 찾기
          </button>
          <a className="call-119" href="tel:119">
            119 전화하기
          </a>
        </div>
        <p className="notice">생명이 위급한 경우 앱보다 먼저 119에 신고하세요.</p>
      </section>

      <p className="offline-note">오프라인 상태에서는 마지막으로 불러온 안내와 전화 확인 문구를 우선 보여줍니다.</p>

      <LocationPrompt permissionState={permissionState} onUseCurrentLocation={runCurrentLocationSearch} onSearchAddress={runAddressSearch} />

      {isLoading ? <p className="search-status">정보를 불러오는 중입니다...</p> : null}
      {errorMessage ? <p className="search-error">{errorMessage}</p> : null}
      {result ? <FacilityList title={title} notice={result.notice} facilities={facilities} onViewDetails={setSelectedFacility} /> : null}
      {selectedFacility ? <FacilityDetail facility={selectedFacility} onClose={() => setSelectedFacility(null)} /> : null}
    </main>
  )
}
