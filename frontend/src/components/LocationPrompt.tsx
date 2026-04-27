import { useState, type FormEvent } from 'react'

export type LocationPermissionState = 'prompt' | 'granted' | 'denied'

type LocationPromptProps = {
  permissionState: LocationPermissionState
  onUseCurrentLocation: () => void
  onSearchAddress?: (query: string) => void
}

export function LocationPrompt({ permissionState, onUseCurrentLocation, onSearchAddress }: LocationPromptProps) {
  const [addressQuery, setAddressQuery] = useState('')
  const isDenied = permissionState === 'denied'

  function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = addressQuery.trim()
    if (trimmedQuery) {
      onSearchAddress?.(trimmedQuery)
    }
  }

  return (
    <section className="location-prompt" aria-labelledby="location-prompt-title">
      <h2 id="location-prompt-title">내 주변 정보를 찾을 위치를 선택하세요</h2>
      {isDenied ? (
        <p className="location-prompt__warning">위치 권한이 꺼져 있습니다.</p>
      ) : (
        <p className="location-prompt__description">현재 위치를 사용하면 가까운 응급실과 약국을 거리순으로 볼 수 있습니다.</p>
      )}
      <button type="button" className="location-prompt__button" onClick={onUseCurrentLocation} disabled={isDenied}>
        현재 위치로 찾기
      </button>
      <p className="location-prompt__fallback">위치 권한이 꺼져 있어도 주소나 지역명으로 검색할 수 있습니다.</p>
      <form className="location-prompt__form" onSubmit={handleAddressSubmit}>
        <label className="location-prompt__label">
          주소 또는 지역명
          <input
            className="location-prompt__input"
            name="address"
            onChange={(event) => setAddressQuery(event.target.value)}
            placeholder="예: 서울 중구, 강남역"
            type="search"
            value={addressQuery}
          />
        </label>
        <button type="submit" className="location-prompt__search-button">
          주소로 찾기
        </button>
      </form>
    </section>
  )
}
