import 'jest-puppeteer';
import 'expect-puppeteer';

export async function renderUI(html: string) {
  await page.setContent(html);

  return {
    getStyle: () => {
      return page.evaluate(() => {
        const element = document.getElementById('element');

        if (!element) return;

        const { color, fontSize } = window.getComputedStyle(element);

        return { color, fontSize };
      });
    },
    setType: async (type: `${'mobile' | 'desktop'}.${'dark' | 'light'}`) => {
      await page.emulateMediaFeatures([
        {
          name: 'prefers-color-scheme',
          value: /light/.test(type) ? 'light' : 'dark',
        },
      ]);
      await page.setViewport({
        width: /mobile/.test(type) ? 540 : 1080,
        height: 1024,
      });
    },
  };
}
