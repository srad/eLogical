/**
 * Vitest setup file with IndexedDB mock
 */

import { beforeAll } from 'vitest';

// Mock IndexedDB for tests
beforeAll(() => {
  if (typeof global.indexedDB === 'undefined') {
    // Simple in-memory mock of IndexedDB
    const stores = new Map<string, Map<string | number, unknown>>();

    class MockIDBRequest {
      error: DOMException | null = null;
      readyState: 'pending' | 'done' = 'pending';
      result: unknown;
      source: unknown = null;
      transaction: unknown = null;
      onsuccess: ((this: MockIDBRequest, ev: Event) => unknown) | null = null;
      onerror: ((this: MockIDBRequest, ev: Event) => unknown) | null = null;
      onblocked: ((this: MockIDBRequest, ev: Event) => unknown) | null = null;

      addEventListener() {}
      removeEventListener() {}
      dispatchEvent() {
        return true;
      }
    }

    class MockIDBOpenRequest extends MockIDBRequest {
      onupgradeneeded: ((this: MockIDBOpenRequest, ev: Event) => unknown) | null = null;
      onblocked: ((this: MockIDBOpenRequest, ev: Event) => unknown) | null = null;
    }

    class MockIDBDatabase {
      name: string;
      version: number;
      objectStoreNames: DOMStringList;

      constructor(name: string, version: number) {
        this.name = name;
        this.version = version;
        this.objectStoreNames = {
          contains: () => true,
          item: () => '',
          length: 0,
          [Symbol.iterator]: function* () {},
        } as unknown as DOMStringList;
      }

      createObjectStore(name: string) {
        const store = new Map<string | number, unknown>();
        stores.set(name, store);
        return {
          name,
          createIndex: () => ({}),
        } as unknown as IDBObjectStore;
      }

      transaction() {
        return {
          objectStore: (storeName: string) => ({
            add: (value: unknown) => {
              const store = stores.get(storeName) || new Map();
              const id = (store.size || 0) + 1;
              store.set(id, value);
              stores.set(storeName, store);
              const req = new MockIDBRequest();
              req.result = id;
              setTimeout(() => {
                if (req.onsuccess) req.onsuccess(new Event('success'));
              }, 0);
              return req;
            },
            get: (key: string | number) => {
              const req = new MockIDBRequest();
              const store = stores.get(storeName);
              req.result = store?.get(key);
              setTimeout(() => {
                if (req.onsuccess) req.onsuccess(new Event('success'));
              }, 0);
              return req;
            },
            getAll: () => {
              const req = new MockIDBRequest();
              const store = stores.get(storeName);
              req.result = store ? Array.from(store.values()) : [];
              setTimeout(() => {
                if (req.onsuccess) req.onsuccess(new Event('success'));
              }, 0);
              return req;
            },
            put: (value: unknown) => {
              const store = stores.get(storeName) || new Map();
              const id = (value as Record<string, unknown>).key || (store.size || 0) + 1;
              store.set(id, value);
              stores.set(storeName, store);
              const req = new MockIDBRequest();
              req.result = id;
              setTimeout(() => {
                if (req.onsuccess) req.onsuccess(new Event('success'));
              }, 0);
              return req;
            },
            clear: () => {
              const req = new MockIDBRequest();
              stores.delete(storeName);
              setTimeout(() => {
                if (req.onsuccess) req.onsuccess(new Event('success'));
              }, 0);
              return req;
            },
            index: () => ({
              getAll: () => {
                const req = new MockIDBRequest();
                const store = stores.get(storeName);
                req.result = store ? Array.from(store.values()) : [];
                setTimeout(() => {
                  if (req.onsuccess) req.onsuccess(new Event('success'));
                }, 0);
                return req;
              },
            }),
          }),
        } as unknown as IDBTransaction;
      }

      close() {}
    }

    (global as unknown as Record<string, unknown>).indexedDB = {
      open: (dbName: string, version: number = 1) => {
        const req = new MockIDBOpenRequest();
        const db = new MockIDBDatabase(dbName, version);

        setTimeout(() => {
          req.result = db as unknown;
          if (req.onupgradeneeded) {
            req.onupgradeneeded({
              target: req as unknown,
            } as unknown as Event);
          }
          if (req.onsuccess) req.onsuccess(new Event('success'));
        }, 0);

        return req;
      },
      deleteDatabase: () => {
        const req = new MockIDBRequest();
        setTimeout(() => {
          if (req.onsuccess) req.onsuccess(new Event('success'));
        }, 0);
        return req;
      },
    };
  }
});
