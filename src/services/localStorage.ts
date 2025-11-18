/**
 * Local Storage Service using IndexedDB
 * Provides persistent offline storage for game scores, tracking events, and user preferences
 */

/**
 * Convert Proxy objects to plain objects for IndexedDB serialization
 * Strips Vue reactivity proxies and circular references using JSON serialization
 */
function toPlainObject<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (typeof obj === 'object') {
    // Use JSON serialization to strip Proxies and circular references
    try {
      return JSON.parse(JSON.stringify(obj)) as T;
    } catch {
      // If JSON serialization fails, return the object as-is
      return obj as T;
    }
  }

  return obj as T;
}

/**
 * Validate required fields in an object
 */
function validateRequired(obj: Record<string, unknown>, requiredFields: string[], context: string): void {
  const missingFields = requiredFields.filter(field => obj[field] === undefined || obj[field] === null);
  if (missingFields.length > 0) {
    throw new Error(`${context}: Missing required fields: ${missingFields.join(', ')}`);
  }
}

interface GameScore {
  id?: number;
  total: number;
  difficulty: number;
  timestamp: number;
}

interface TrackingEvent {
  id?: number;
  event: string;
  timestamp: number;
  data: Record<string, unknown>;
}

class LocalStorageService {
  private dbName = 'eLogical';
  private version = 3;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

        // Migration: v1 to v2 - rename leaderboard to score
        if (oldVersion < 2 && db.objectStoreNames.contains('leaderboard')) {
          // Delete old stores that are being removed
          if (db.objectStoreNames.contains('analytics')) {
            db.deleteObjectStore('analytics');
          }
        }

        // Score store
        if (!db.objectStoreNames.contains('score')) {
          const scoreStore = db.createObjectStore('score', {
            keyPath: 'id',
            autoIncrement: true,
          });
          scoreStore.createIndex('timestamp', 'timestamp', {
            unique: false,
          });
        }

        // Tracking events store
        if (!db.objectStoreNames.contains('tracking')) {
          const trackingStore = db.createObjectStore('tracking', {
            keyPath: 'id',
            autoIncrement: true,
          });
          trackingStore.createIndex('timestamp', 'timestamp', {
            unique: false,
          });
        }

        // User preferences
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }

        // Delete old leaderboard store after migration
        if (oldVersion < 2 && db.objectStoreNames.contains('leaderboard')) {
          db.deleteObjectStore('leaderboard');
        }
      };
    });
  }

  async saveGameScore(
    total: number,
    difficulty: number
  ): Promise<number> {
    // Validate required fields
    if (typeof total !== 'number' || total < 0) {
      throw new Error('saveGameScore: total must be a non-negative number');
    }
    if (typeof difficulty !== 'number' || difficulty < 1) {
      throw new Error('saveGameScore: difficulty must be a positive number');
    }

    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['score'], 'readwrite');
      const store = transaction.objectStore('score');

      const score: GameScore = {
        total,
        difficulty,
        timestamp: Date.now(),
      };

      const request = store.add(toPlainObject<GameScore>(score));
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getLeaderboard(limit: number = 10): Promise<GameScore[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['score'], 'readonly');
      const store = transaction.objectStore('score');
      const index = store.index('timestamp');

      const request = index.getAll();

      request.onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result as GameScore[];
        const sorted = result
          .sort((a, b) => b.total - a.total)
          .slice(0, limit);
        resolve(sorted);
      };
      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async saveTrackingEvent(
    event: string,
    data: Record<string, unknown>
  ): Promise<number> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tracking'], 'readwrite');
      const store = transaction.objectStore('tracking');

      const trackingEvent: TrackingEvent = {
        event,
        timestamp: Date.now(),
        data,
      };

      const request = store.add(toPlainObject<TrackingEvent>(trackingEvent));
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTrackingEvents(): Promise<TrackingEvent[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tracking'], 'readonly');
      const store = transaction.objectStore('tracking');

      const request = store.getAll();

      request.onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result as TrackingEvent[];
        resolve(result);
      };
      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async setPreference(key: string, value: unknown): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');

      const preference = toPlainObject<Record<string, unknown>>({ key, value });
      const request = store.put(preference);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPreference(key: string): Promise<unknown> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');

      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result?.value ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ['score', 'tracking', 'preferences'],
        'readwrite'
      );

      const stores = [
        transaction.objectStore('score'),
        transaction.objectStore('tracking'),
        transaction.objectStore('preferences'),
      ];

      let completed = 0;
      stores.forEach((store) => {
        const request = store.clear();
        request.onsuccess = () => {
          completed++;
          if (completed === stores.length) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }
}

export const localStorageService = new LocalStorageService();
export { LocalStorageService, GameScore, TrackingEvent };
