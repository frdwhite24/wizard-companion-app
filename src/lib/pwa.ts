export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope)
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  }
}

export function updateThemeColor() {
  const root = document.documentElement
  const computedStyle = getComputedStyle(root)
  const backgroundColor = computedStyle
    .getPropertyValue('--pico-background-color')
    .trim()

  // Update theme-color meta tags
  const metaTags = document.querySelectorAll('meta[name="theme-color"]')
  metaTags.forEach((tag) => {
    if (
      tag.media === '(prefers-color-scheme: dark)' ||
      tag.media === '(prefers-color-scheme: light)'
    ) {
      tag.content = backgroundColor
    }
  })
}
