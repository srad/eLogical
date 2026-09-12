/**
 * Vitest setup.
 *
 * `fake-indexeddb/auto` installs a spec-compliant in-memory IndexedDB on globalThis.
 * This replaces a hand-written mock that invoked handlers as `onsuccess(new Event('x'))`,
 * leaving `event.target` null and failing every call site that read it.
 */
import 'fake-indexeddb/auto';
