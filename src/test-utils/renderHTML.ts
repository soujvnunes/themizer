import 'jest-puppeteer'
import 'expect-puppeteer'
import { type FrameAddStyleTagOptions } from 'puppeteer'

type ScreenViewportAliases = 'mobile' | 'desktop'
type ScreenColorSchemes = 'dark' | 'light'
type ScreenType = `${ScreenViewportAliases}.${ScreenColorSchemes}`

export default async function renderHTML(
  content: string,
  options?: Omit<FrameAddStyleTagOptions, 'url'>,
) {
  await page.setContent(content)

  if (options) await page.addStyleTag(options)

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
