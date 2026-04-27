import { render, screen } from '@testing-library/react'

import App from '../App'

describe('오늘응급 홈', () => {
  it('renders title and primary emergency actions', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '오늘응급' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '가까운 응급실 찾기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '지금 문 연 약국 찾기' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '119 전화하기' })).toHaveAttribute('href', 'tel:119')
  })
})
