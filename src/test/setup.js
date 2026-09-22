import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// react-loader-spinner does not load under the test runner (styled-components interop),
// and the animation is irrelevant to what the tests check
vi.mock('react-loader-spinner', () => ({
  Watch: () => null,
}));

// The pages inject thousands of lines of CSS as <style> tags. jsdom parses them on every render, which
// makes the tests very slow, and the tests check structure and behaviour rather than appearance.
// (vi.mock is hoisted above everything else, so each module is listed out and shares this helper.)
const blankStyles = vi.hoisted(() => async (importOriginal) => {
  const actual = await importOriginal();
  return Object.fromEntries(Object.keys(actual).map((name) => [name, '']));
});

vi.mock('../pages/Land.styles', blankStyles);
vi.mock('../pages/Dashboard.styles', blankStyles);
vi.mock('../pages/Profile.styles', blankStyles);
vi.mock('../pages/InvestmentPlans.styles', blankStyles);
vi.mock('../pages/SavingsManagement.styles', blankStyles);
vi.mock('../pages/BeneficiaryManagement.styles', blankStyles);
vi.mock('../pages/Auth.styles', blankStyles);
vi.mock('../pages/AdminDashboard.styles', blankStyles);

// jsdom has no matchMedia; react-bootstrap's Offcanvas (login page) asks for it
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Newer Node versions ship their own experimental localStorage global, which is unusable without a
// file path and shadows jsdom's. Give the tests a plain in-memory Storage instead.
const createMemoryStorage = () => {
  const store = new Map();

  return {
    getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
    setItem: (key, value) => {
      store.set(String(key), String(value));
    },
    removeItem: (key) => {
      store.delete(String(key));
    },
    clear: () => {
      store.clear();
    },
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
};

for (const name of ['localStorage', 'sessionStorage']) {
  const storage = createMemoryStorage();
  Object.defineProperty(window, name, { value: storage, configurable: true });
  Object.defineProperty(globalThis, name, { value: storage, configurable: true });
}

// Testing Library only cleans up automatically when test globals are enabled; do it explicitly
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
