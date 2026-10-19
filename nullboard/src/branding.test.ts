import { readFileSync } from 'fs';
import { join } from 'path';

const publicDirectory = join(__dirname, '../public');
const html = new DOMParser().parseFromString(
  readFileSync(join(publicDirectory, 'index.html'), 'utf8'),
  'text/html'
);
const manifest = JSON.parse(readFileSync(join(publicDirectory, 'manifest.json'), 'utf8'));

test('introduces NullBoard and its deliberately useless premise in browser metadata', () => {
  expect(html.title).toBe('NullBoard Pro Max | 50% more nothing');
  expect(html.documentElement.lang).toBe('en');
  expect(html.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
    'The ultra-premium project management tool with absolutely no features. Zero tasks. Zero pressure. Now with 50% more nothing.'
  );
});

test('keeps share-preview titles and descriptions aligned with the page', () => {
  const description = html.querySelector('meta[name="description"]')?.getAttribute('content');

  expect(html.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('website');
  expect(html.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary');
  ['meta[property="og:title"]', 'meta[name="twitter:title"]'].forEach((selector) => {
    expect(html.querySelector(selector)?.getAttribute('content')).toBe(html.title);
  });
  ['meta[property="og:description"]', 'meta[name="twitter:description"]'].forEach((selector) => {
    expect(html.querySelector(selector)?.getAttribute('content')).toBe(description);
  });
});

test('uses NullBoard branding and the default dark theme in the app manifest', () => {
  expect(manifest.short_name).toBe('NullBoard');
  expect(manifest.name).toBe('NullBoard Pro Max');
  expect(manifest.description).toBe(html.querySelector('meta[name="description"]')?.getAttribute('content'));
  expect(manifest.theme_color).toBe('#000000');
  expect(manifest.background_color).toBe('#000000');
  expect(html.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe(manifest.theme_color);
  expect(manifest.start_url).toBe('.');
});

test('ships local branding assets with paths that support non-root deployments', () => {
  const links = html.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]');

  expect(links).toHaveLength(4);
  links.forEach((link) => {
    const href = link.getAttribute('href')!;
    expect(href).toMatch(/^%PUBLIC_URL%\//);
    expect(readFileSync(join(publicDirectory, href.replace('%PUBLIC_URL%/', ''))).length).toBeGreaterThan(0);
  });
  manifest.icons.forEach((icon: { src: string }) => {
    expect(icon.src).not.toMatch(/^(\/|https?:)/);
    expect(readFileSync(join(publicDirectory, icon.src)).length).toBeGreaterThan(0);
  });
});

test.each([192, 512])('ships a %i-pixel PNG icon matching its manifest entry', (size) => {
  const filename = `logo${size}.png`;
  const icon = readFileSync(join(publicDirectory, filename));

  expect(icon.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(icon.readUInt32BE(16)).toBe(size);
  expect(icon.readUInt32BE(20)).toBe(size);
  expect(manifest.icons).toContainEqual({ src: filename, type: 'image/png', sizes: `${size}x${size}` });
});

test('ships the fallback favicon at every size advertised in the manifest', () => {
  const icon = readFileSync(join(publicDirectory, 'favicon.ico'));
  const entry = manifest.icons.find((item: { src: string }) => item.src === 'favicon.ico');
  const sizes = entry.sizes.split(' ');

  expect(icon.readUInt16LE(0)).toBe(0);
  expect(icon.readUInt16LE(2)).toBe(1);
  expect(icon.readUInt16LE(4)).toBe(sizes.length);
  const actualSizes = Array.from({ length: icon.readUInt16LE(4) }, (_, index) => {
    const offset = 6 + index * 16;
    return `${icon[offset] || 256}x${icon[offset + 1] || 256}`;
  });
  expect(actualSizes.sort()).toEqual(sizes.sort());
});

test('ships a scalable empty-set icon for modern browsers', () => {
  const svg = new DOMParser().parseFromString(
    readFileSync(join(publicDirectory, 'favicon.svg'), 'utf8'),
    'image/svg+xml'
  );

  expect(svg.querySelector('parsererror')).toBeNull();
  expect(svg.documentElement.getAttribute('viewBox')).toBe('0 0 64 64');
  expect(svg.querySelector('title')?.textContent).toBe('NullBoard: the empty set');
  expect(html.querySelector('link[rel="icon"][type="image/svg+xml"]')?.getAttribute('href')).toBe('%PUBLIC_URL%/favicon.svg');
  expect(manifest.icons).toContainEqual({ src: 'favicon.svg', type: 'image/svg+xml', sizes: 'any' });
});
