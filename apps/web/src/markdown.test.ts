import { expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';

test('sanitizes generated Markdown HTML and unsafe URL schemes', async () => {
  const window = new JSDOM('<!doctype html>').window;
  Object.assign(globalThis, { window, document: window.document });
  const { renderMarkdown } = await import('./markdown');
  const html = renderMarkdown('[click](javascript:alert(1)) [mixed](JaVaScRiPt:alert(1)) [encoded](javascript&#58;alert(1)) ![bad](data:text/html,evil) <img src=x onerror=alert(1)> <script>alert(1)</script> [safe](https://example.com) **bold**');
  const container = window.document.createElement('div');
  container.innerHTML = html;
  expect(container.querySelector('script')).toBeNull();
  expect(container.querySelector('[onerror]')).toBeNull();
  for (const element of container.querySelectorAll('[href], [src]')) {
    const url = element.getAttribute('href') ?? element.getAttribute('src') ?? '';
    expect(url).not.toMatch(/^(javascript|data):/i);
  }
  expect(container.querySelector('a[href="https://example.com"]')?.textContent).toBe('safe');
  expect(container.querySelector('strong')?.textContent).toBe('bold');
  window.close();
});
