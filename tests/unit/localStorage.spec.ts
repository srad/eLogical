import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { localStorageService, type GameScore, type TrackingEvent } from '@/services/localStorage';

describe('LocalStorageService', () => {
  beforeEach(async () => {
    await localStorageService.initialize();
    await localStorageService.clearAll();
  });

  afterEach(async () => {
    await localStorageService.clearAll();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const service = new (await import('@/services/localStorage'))
        .LocalStorageService();
      await expect(service.initialize()).resolves.toBeUndefined();
    });
  });

  describe('GameScore operations', () => {
    it('should save a game score', async () => {
      const id = await localStorageService.saveGameScore(100, 2);

      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    it('should save multiple game scores', async () => {
      const id1 = await localStorageService.saveGameScore(50, 1);
      const id2 = await localStorageService.saveGameScore(100, 2);
      const id3 = await localStorageService.saveGameScore(75, 1);

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
    });

    it('should retrieve leaderboard sorted by score descending', async () => {
      await localStorageService.saveGameScore(50, 1);
      await localStorageService.saveGameScore(100, 2);
      await localStorageService.saveGameScore(75, 1);

      const leaderboard = await localStorageService.getLeaderboard(10);

      expect(leaderboard.length).toBe(3);
      expect(leaderboard[0].total).toBe(100);
      expect(leaderboard[1].total).toBe(75);
      expect(leaderboard[2].total).toBe(50);
    });

    it('should respect limit parameter', async () => {
      for (let i = 0; i < 15; i++) {
        await localStorageService.saveGameScore(i * 10, 1);
      }

      const limited = await localStorageService.getLeaderboard(5);
      expect(limited.length).toBeLessThanOrEqual(5);
    });

    it('should include all GameScore properties', async () => {
      await localStorageService.saveGameScore(100, 2);
      const leaderboard = await localStorageService.getLeaderboard(1);
      const score = leaderboard[0];

      expect(score).toHaveProperty('total');
      expect(score).toHaveProperty('difficulty');
      expect(score).toHaveProperty('timestamp');

      expect(score.total).toBe(100);
      expect(score.difficulty).toBe(2);
      expect(typeof score.timestamp).toBe('number');
    });

    it('should handle duplicate saves with different scores', async () => {
      const id1 = await localStorageService.saveGameScore(50, 1);
      const id2 = await localStorageService.saveGameScore(100, 2);
      const id3 = await localStorageService.saveGameScore(75, 1);

      const leaderboard = await localStorageService.getLeaderboard(10);
      expect(leaderboard.length).toBe(3);
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
    });

    it('should return empty array when no scores exist', async () => {
      const leaderboard = await localStorageService.getLeaderboard(10);
      expect(leaderboard).toEqual([]);
    });
  });

  describe('Tracking operations', () => {
    it('should save a tracking event', async () => {
      const id = await localStorageService.saveTrackingEvent('test-event', {
        data: 'test',
      });

      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    it('should save multiple tracking events', async () => {
      const id1 = await localStorageService.saveTrackingEvent('event1', {
        value: 1,
      });
      const id2 = await localStorageService.saveTrackingEvent('event2', {
        value: 2,
      });

      expect(id1).not.toBe(id2);
    });

    it('should retrieve all tracking events', async () => {
      await localStorageService.saveTrackingEvent('event1', { a: 1 });
      await localStorageService.saveTrackingEvent('event2', { b: 2 });
      await localStorageService.saveTrackingEvent('event3', { c: 3 });

      const events = await localStorageService.getAllTrackingEvents();

      expect(events.length).toBe(3);
      expect(events[0].event).toBe('event1');
      expect(events[1].event).toBe('event2');
      expect(events[2].event).toBe('event3');
    });

    it('should include all TrackingEvent properties', async () => {
      const testData = { difficulty: 1, level: 0 };
      await localStorageService.saveTrackingEvent('test', testData);

      const events = await localStorageService.getAllTrackingEvents();
      const event = events[0];

      expect(event).toHaveProperty('event');
      expect(event).toHaveProperty('timestamp');
      expect(event).toHaveProperty('data');

      expect(event.event).toBe('test');
      expect(typeof event.timestamp).toBe('number');
      expect(event.data).toEqual(testData);
    });

    it('should return empty array when no events exist', async () => {
      const events = await localStorageService.getAllTrackingEvents();
      expect(events).toEqual([]);
    });

    it('should preserve data integrity in events', async () => {
      const complexData = {
        nested: { value: 42 },
        array: [1, 2, 3],
        string: 'test',
        number: 100,
      };

      await localStorageService.saveTrackingEvent('complex', complexData);
      const events = await localStorageService.getAllTrackingEvents();

      expect(events[0].data).toEqual(complexData);
    });
  });

  describe('Preference operations', () => {
    it('should save a preference', async () => {
      await localStorageService.setPreference('testKey', 'testValue');
      const value = await localStorageService.getPreference('testKey');

      expect(value).toBe('testValue');
    });

    it('should save and retrieve different data types', async () => {
      await localStorageService.setPreference('string', 'value');
      await localStorageService.setPreference('number', 42);
      await localStorageService.setPreference('boolean', true);
      await localStorageService.setPreference('object', { key: 'value' });

      expect(await localStorageService.getPreference('string')).toBe('value');
      expect(await localStorageService.getPreference('number')).toBe(42);
      expect(await localStorageService.getPreference('boolean')).toBe(true);
      expect(await localStorageService.getPreference('object')).toEqual({
        key: 'value',
      });
    });

    it('should handle non-existent preferences', async () => {
      const value = await localStorageService.getPreference('nonexistent');
      expect(value).toBeNull();
    });

    it('should update existing preferences', async () => {
      await localStorageService.setPreference('key', 'initial');
      expect(await localStorageService.getPreference('key')).toBe('initial');

      await localStorageService.setPreference('key', 'updated');
      expect(await localStorageService.getPreference('key')).toBe('updated');
    });
  });

  describe('clearAll', () => {
    it('should clear all data', async () => {
      // Add some data
      await localStorageService.saveGameScore(100, 2);
      await localStorageService.saveTrackingEvent('test', { data: 'test' });
      await localStorageService.setPreference('key', 'value');

      // Clear all
      await localStorageService.clearAll();

      // Verify everything is cleared
      expect(await localStorageService.getLeaderboard(10)).toEqual([]);
      expect(await localStorageService.getAllTrackingEvents()).toEqual([]);
      expect(await localStorageService.getPreference('key')).toBeNull();
    });

    it('should allow saving data after clearAll', async () => {
      // Clear
      await localStorageService.clearAll();

      // Add data
      const id = await localStorageService.saveGameScore(100, 2);

      // Verify data exists
      const leaderboard = await localStorageService.getLeaderboard(10);
      expect(leaderboard.length).toBe(1);
      expect(id).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle concurrent operations', async () => {
      const saves = [];
      for (let i = 0; i < 10; i++) {
        saves.push(localStorageService.saveGameScore(i * 10, 1));
      }

      const results = await Promise.all(saves);

      expect(results.length).toBe(10);
      expect(results.every((id) => id > 0)).toBe(true);

      const leaderboard = await localStorageService.getLeaderboard(20);
      expect(leaderboard.length).toBe(10);
    });

    it('should maintain data consistency', async () => {
      // Save initial data
      await localStorageService.saveGameScore(100, 2);
      await localStorageService.saveGameScore(50, 1);

      // Retrieve and verify
      const leaderboard = await localStorageService.getLeaderboard(10);

      expect(leaderboard.length).toBe(2);
      expect(leaderboard[0].total).toBe(100);
      expect(leaderboard[1].total).toBe(50);

      // Clear and verify empty
      await localStorageService.clearAll();
      const emptyLeaderboard = await localStorageService.getLeaderboard(10);

      expect(emptyLeaderboard).toEqual([]);
    });
  });
});
