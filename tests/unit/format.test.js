import { escapeHtml } from '../../src/js/utils/format.js';

test('escapeHtml escapes dangerous characters', () => {
  const s = '<script>alert("x")</script>&\'"';
  const out = escapeHtml(s);
  expect(out).toContain('&lt;script&gt;');
  expect(out).toContain('&amp;');
  expect(out).toContain('&#39;');
  expect(out).toContain('&quot;');
});
