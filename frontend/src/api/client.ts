export type CoordinatesQuery = {
  lat: number
  lng: number
  radiusM: number
}

export type FacilityApiItem = {
  id?: string
  name: string
  distanceM: number
  statusLabel?: string
  openStatusLabel?: string
  address: string
  phone?: string | null
  emergencyPhone?: string | null
  latitude: number
  longitude: number
  source?: string
  updatedAt?: string | null
  todayHours?: string | null
}

export type FacilityListResponse = {
  items: FacilityApiItem[]
  count: number
  notice: string
}

export type GeocodeCandidate = {
  label: string
  address: string
  lat: number
  lng: number
  source: string
}

export type GeocodeResponse = {
  items: GeocodeCandidate[]
  count: number
}

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export function buildApiUrl(path: string, baseUrl = DEFAULT_API_BASE_URL): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return `${normalizedBase}${normalizedPath}`
}

function buildQuery({ lat, lng, radiusM }: CoordinatesQuery): string {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusM: String(radiusM),
  })

  return params.toString()
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`요청에 실패했습니다. 상태 코드: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function fetchEmergencyRooms(query: CoordinatesQuery): Promise<FacilityListResponse> {
  const response = await fetch(buildApiUrl(`/emergency-rooms?${buildQuery(query)}`))
  return parseJsonResponse<FacilityListResponse>(response)
}

export async function fetchOpenPharmacies(query: CoordinatesQuery): Promise<FacilityListResponse> {
  const response = await fetch(buildApiUrl(`/pharmacies/open-now?${buildQuery(query)}`))
  return parseJsonResponse<FacilityListResponse>(response)
}

export async function fetchGeocode(query: string): Promise<GeocodeResponse> {
  const params = new URLSearchParams({ query })
  const response = await fetch(buildApiUrl(`/geocode?${params.toString()}`))
  return parseJsonResponse<GeocodeResponse>(response)
}
