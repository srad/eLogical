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
      const id = await localStorageService.saveGameScore('TestPlayer', 100, 2);

      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    it('should save multiple game scores', async () => {
      const id1 = await localStorageService.saveGameScore('Player1', 50, 1);
      const id2 = await localStorageService.saveGameScore('Player2', 100, 2);
      const id3 = await localStorageService.saveGameScore('Player3', 75, 1);

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
    });

    it('should retrieve leaderboard sorted by score descending', async () => {
      await localStorageService.saveGameScore('Player1', 50, 1);
      await localStorageService.saveGameScore('Player2', 100, 2);
      await localStorageService.saveGameScore('Player3', 75, 1);

      const leaderboard = await localStorageService.getLeaderboard(10);

      expect(leaderboard.length).toBe(3);
      expect(leaderboard[0].total).toBe(100);
      expect(leaderboard[1].total).toBe(75);
      expect(leaderboard[2].total).toBe(50);
    });

    it('should respect limit parameter', async () => {
      for (let i = 0; i < 15; i++) {
        await localStorageService.saveGameScore(`Player${i}`, i * 10, 1);
      }

      const limited = await localStorageService.getLeaderboard(5);
      expect(limited.length).toBeLessThanOrEqual(5);
    });

    it('should include all GameScore properties', async () => {
      await localStorageService.saveGameScore('TestPlayer', 100, 2);
      const leaderboard = await localStorageService.getLeaderboard(1);
      const score = leaderboard[0];

      expect(score).toHaveProperty('name');
      expect(score).toHaveProperty('total');
      expect(score).toHaveProperty('difficulty');
      expect(score).toHaveProperty('timestamp');
      expect(score).toHaveProperty('client');

      expect(score.name).toBe('TestPlayer');
      expect(score.total).toBe(100);
      expect(score.difficulty).toBe(2);
      expect(typeof score.timestamp).toBe('number');
      expect(Array.isArray(score.client)).toBe(true);
    });

    it('should handle duplicate names with different scores', async () => {
      await localStorageService.saveGameScore('Player', 50, 1);
      await localStorageService.saveGameScore('Player', 100, 2);
      await localStorageService.saveGameScore('Player', 75, 1);

      const leaderboard = await localStorageService.getLeaderboard(10);
      expect(leaderboard.length).toBe(3);
      expect(leaderboard.every((s) => s.name === 'Player')).toBe(true);
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

  describe('Analytics operations', () => {
    it('should save analytics data', async () => {
      const id = await localStorageService.saveAnalyticsData({
        timestamp: Date.now(),
        event: 'answer',
        difficulty: 1,
        level: 0,
        success: true,
      });

      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    it('should retrieve all analytics data', async () => {
      await localStorageService.saveAnalyticsData({
        timestamp: Date.now(),
        event: 'answer',
        difficulty: 1,
        level: 0,
        success: true,
      });

      await localStorageService.saveAnalyticsData({
        timestamp: Date.now(),
        event: 'answer',
        difficulty: 2,
        level: 1,
        success: false,
      });

      const data = await localStorageService.getAnalyticsData();
      expect(data.length).toBe(2);
    });

    it('should include all analytics properties', async () => {
      const analyticsData = {
        timestamp: Date.now(),
        event: 'answer',
        difficulty: 1,
        level: 0,
        success: true,
        operator: 'AND',
      };

      await localStorageService.saveAnalyticsData(analyticsData);
      const data = await localStorageService.getAnalyticsData();

      expect(data[0]).toHaveProperty('timestamp');
      expect(data[0]).toHaveProperty('event');
      expect(data[0]).toHaveProperty('difficulty');
      expect(data[0]).toHaveProperty('level');
      expect(data[0].success).toBe(true);
      expect(data[0].operator).toBe('AND');
    });

    it('should return empty array when no analytics exist', async () => {
      const data = await localStorageService.getAnalyticsData();
      expect(data).toEqual([]);
    });

    it('should handle optional fields', async () => {
      await localStorageService.saveAnalyticsData({
        timestamp: Date.now(),
        event: 'game-start',
        difficulty: 1,
        level: 0,
      });

      const data = await localStorageService.getAnalyticsData();
      expect(data[0].success).toBeUndefined();
      expect(data[0].operator).toBeUndefined();
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

    it('should return null for non-existent preferences', async () => {
      const value = await localStorageService.getPreference('nonExistent');
      expect(value).toBeNull();
    });

    it('should overwrite existing preferences', async () => {
      await localStorageService.setPreference('key', 'value1');
      await localStorageService.setPreference('key', 'value2');

      const value = await localStorageService.getPreference('key');
      expect(value).toBe('value2');
    });

    it('should handle username preference', async () => {
      const username = `user-${Date.now()}`;
      await localStorageService.setPreference('username', username);

      const retrieved = await localStorageService.getPreference('username');
      expect(retrieved).toBe(username);
    });
  });

  describe('clearAll', () => {
    it('should clear all data', async () => {
      // Add data to all stores
      await localStorageService.saveGameScore('Player', 100, 1);
      await localStorageService.saveTrackingEvent('event', { data: 'test' });
      await localStorageService.saveAnalyticsData({
        timestamp: Date.now(),
        event: 'test',
        difficulty: 1,
        level: 0,
      });
      await localStorageService.setPreference('key', 'value');

      // Clear all
      await localStorageService.clearAll();

      // Verify everything is cleared
      const leaderboard = await localStorageService.getLeaderboard(10);
      const events = await localStorageService.getAllTrackingEvents();
      const analytics = await localStorageService.getAnalyticsData();
      const pref = await localStorageService.getPreference('key');

      expect(leaderboard).toEqual([]);
      expect(events).toEqual([]);
      expect(analytics).toEqual([]);
      expect(pref).toBeNull();
    });

    it('should allow saving data after clearAll', async () => {
      await localStorageService.saveGameScore('Player', 100, 1);
      await localStorageService.clearAll();

      const id = await localStorageService.saveGameScore('NewPlayer', 50, 1);
      expect(id).toBeGreaterThan(0);

      const leaderboard = await localStorageService.getLeaderboard(10);
      expect(leaderboard.length).toBe(1);
      expect(leaderboard[0].name).toBe('NewPlayer');
    });
  });

  describe('Error handling', () => {
    it('should handle concurrent operations', async () => {
      const promises = [
        localStorageService.saveGameScore('P1', 50, 1),
        localStorageService.saveGameScore('P2', 100, 2),
        localStorageService.saveGameScore('P3', 75, 1),
        localStorageService.saveTrackingEvent('e1', { a: 1 }),
        localStorageService.saveTrackingEvent('e2', { b: 2 }),
      ];

      const results = await Promise.all(promises);
      expect(results.every((r) => typeof r === 'number')).toBe(true);

      const leaderboard = await localStorageService.getLeaderboard(10);
      const events = await localStorageService.getAllTrackingEvents();

      expect(leaderboard.length).toBe(3);
      expect(events.length).toBe(2);
    });

    it('should maintain data consistency', async () => {
      const operations = 100;
      for (let i = 0; i < operations; i++) {
        await localStorageService.saveGameScore(`Player${i}`, i * 10, 1);
      }

      const leaderboard = await localStorageService.getLeaderboard(100);
      expect(leaderboard.length).toBe(operations);

      // Verify sorted order
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].total).toBeGreaterThanOrEqual(
          leaderboard[i + 1].total
        );
      }
    });
  });
});
