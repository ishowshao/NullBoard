import { features, zeroAchievement } from './features';

const allEntries = [...features, zeroAchievement];

// IDs are React keys and discovery Set keys, not just display metadata.
test('gives each feature and the certificate a unique, non-empty slug ID', () => {
  const ids = allEntries.map(({ id }) => id);
  expect(ids.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true);
  expect(new Set(ids).size).toBe(ids.length);
});

test('keeps the certificate separate from the discoverable features', () => {
  expect(features.length).toBeGreaterThan(0);
  expect(features.some(({ id }) => id === zeroAchievement.id)).toBe(false);
});

test('gives every control a distinct, non-empty accessible label', () => {
  const labels = allEntries.map(({ label }) => label.trim());
  expect(labels.every(Boolean)).toBe(true);
  expect(new Set(labels).size).toBe(labels.length);
});

test('gives every feature and the certificate a distinct, non-empty punchline', () => {
  const messages = allEntries.map(({ message }) => message.trim());
  expect(messages.every(Boolean)).toBe(true);
  expect(new Set(messages).size).toBe(messages.length);
});
