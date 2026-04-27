import manifestText from '../../public/manifest.webmanifest?raw'

const manifest = JSON.parse(manifestText)

describe('PWA manifest', () => {
  it('contains installable 오늘응급 metadata', () => {
    expect(manifest).toMatchObject({
      name: '오늘응급',
      short_name: '오늘응급',
      start_url: '/',
      display: 'standalone',
      theme_color: '#dc2626',
      background_color: '#ffffff',
    })
  })
})
