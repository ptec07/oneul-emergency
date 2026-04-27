import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { LocationPrompt } from './LocationPrompt'

describe('LocationPrompt', () => {
  it('offers current-location search and address fallback', () => {
    const onUseCurrentLocation = vi.fn()

    render(<LocationPrompt permissionState="prompt" onUseCurrentLocation={onUseCurrentLocation} />)

    fireEvent.click(screen.getByRole('button', { name: '현재 위치로 찾기' }))

    expect(onUseCurrentLocation).toHaveBeenCalledTimes(1)
    expect(screen.getByText('위치 권한이 꺼져 있어도 주소나 지역명으로 검색할 수 있습니다.')).toBeInTheDocument()
    expect(screen.getByLabelText('주소 또는 지역명')).toBeInTheDocument()
  })

  it('shows a clear denied-permission message', () => {
    render(<LocationPrompt permissionState="denied" onUseCurrentLocation={vi.fn()} />)

    expect(screen.getByText('위치 권한이 꺼져 있습니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '현재 위치로 찾기' })).toBeDisabled()
  })

  it('submits typed address or place query', () => {
    const onSearchAddress = vi.fn()

    render(<LocationPrompt permissionState="prompt" onUseCurrentLocation={vi.fn()} onSearchAddress={onSearchAddress} />)
    fireEvent.change(screen.getByLabelText('주소 또는 지역명'), { target: { value: '강남역' } })
    fireEvent.click(screen.getByRole('button', { name: '주소로 찾기' }))

    expect(onSearchAddress).toHaveBeenCalledWith('강남역')
  })
})
