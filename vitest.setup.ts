import '@testing-library/jest-dom/vitest';

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

// framer-motion's whileInView needs this; jsdom doesn't implement it.
globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;

