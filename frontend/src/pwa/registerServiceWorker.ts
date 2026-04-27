export function registerServiceWorker(appWindow: Window = window, appNavigator: Navigator = navigator): void {
  if (!('serviceWorker' in appNavigator)) {
    return
  }

  appWindow.addEventListener('load', () => {
    void appNavigator.serviceWorker.register('/sw.js')
  })
}
