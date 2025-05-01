import 'jest-puppeteer'
import 'expect-puppeteer'

type ScreenType = `${'mobile' | 'desktop'}.${'dark' | 'light'}`

export async function render(html: string) {
  await page.setContent(html)

  return {
    async setScreenType(type: ScreenType) {
      await page.emulateMediaFeatures([
        {
          name: 'prefers-color-scheme',
          value: /light/.test(type) ? 'light' : 'dark',
        },
      ])
      await page.setViewport({
        width: /mobile/.test(type) ? 540 : 1080,
        height: 1024,
      })

      return page.evaluate(() => {
        const element = document.getElementById('element')

        if (!element) return

        const { color, fontSize } = window.getComputedStyle(element)

        return {
          color,
          fontSize,
        }
      })
    },
  }
}
