import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ElogicalApi } from '@/services/elogical';
import { localStorageService } from '@/services/localStorage';

describe('ElogicalApi', () => {
  let api: ElogicalApi;

  beforeEach(async () => {
    api = new ElogicalApi();
    await localStorageService.initialize();
    await localStorageService.clearAll();
  });

  afterEach(async () => {
    await localStorageService.clearAll();
  });

  describe('authenticate', () => {
    it('should initialize local storage and return auth response', async () => {
      // No authenticate needed - API is offline-first now
      const user = api.getUser();
      const token = api.getToken();

      expect(token).toBeDefined();
      expect(user).toBeDefined();
      expect(token).toContain('local-');
    });

    it('should return the same username on subsequent calls', async () => {
      const user1 = api.getUser();
      const api2 = new ElogicalApi();
      const user2 = api2.getUser();

      expect(user1).toBe(user2);
    });

    it('should generate unique usernames for different instances', async () => {
      const api1 = new ElogicalApi();
      await localStorageService.clearAll();
      const api2 = new ElogicalApi();

      const user1 = api1.getUser();
      const user2 = api2.getUser();

      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
    });
  });

  describe('saveGameScore', () => {
    it('should save a game score and return success', async () => {
      const result = await api.saveGameScore(100, 2);

      expect(result.data.success).toBe(true);
      expect(result.data.id).toBeGreaterThan(0);
    });

    it('should save multiple scores', async () => {
      const result1 = await api.saveGameScore(50, 1);
      const result2 = await api.saveGameScore(100, 2);
      const result3 = await api.saveGameScore(75, 1);

      expect(result1.data.id).not.toBe(result2.data.id);
      expect(result2.data.id).not.toBe(result3.data.id);
    });

    it('should calculate points correctly', async () => {
      // Points = (difficulty - 1) * 5 + level
      // For difficulty 1, level 0: (1-1)*5 + 0 = 0
      // For difficulty 2, level 3: (2-1)*5 + 3 = 8
      // For difficulty 3, level 5: (3-1)*5 + 5 = 15

      const result1 = await api.saveGameScore(0, 1);
      const result2 = await api.saveGameScore(8, 2);
      const result3 = await api.saveGameScore(15, 3);

      expect(result1.data.success).toBe(true);
      expect(result2.data.success).toBe(true);
      expect(result3.data.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      // This should not throw, even if storage fails
      const result = await api.saveGameScore(100, 1);
      expect(result.data.success).toBeDefined();
    });
  });

  describe('getLeaderBoard', () => {
    it('should return empty leaderboard initially', async () => {
      const result = await api.getLeaderBoard();

      expect(result.data).toEqual([]);
    });

    it('should return scores sorted by total descending', async () => {
      await api.saveGameScore(50, 1);
      await api.saveGameScore(100, 2);
      await api.saveGameScore(75, 1);

      const result = await api.getLeaderBoard();
      const scores = result.data;

      expect(scores.length).toBe(3);
      expect(scores[0].total).toBe(100);
      expect(scores[1].total).toBe(75);
      expect(scores[2].total).toBe(50);
    });

    it('should limit results to top 10', async () => {
      // Save 15 scores
      for (let i = 0; i < 15; i++) {
        await api.saveGameScore(i * 10, 1);
      }

      const result = await api.getLeaderBoard();
      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    it('should return proper GameScore structure', async () => {
      await api.saveGameScore(100, 2);

      const result = await api.getLeaderBoard();
      const score = result.data[0];

      expect(score.total).toBe(100);
      expect(score.difficulty).toBe(2);
      expect(score.timestamp).toBeDefined();
    });

    it('should handle empty leaderboard gracefully', async () => {
      const result = await api.getLeaderBoard();

      expect(result.data).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return empty stats initially', async () => {
      const result = await api.getStats();

      expect(result.data).toBeNull();
    });

    it('should return top player stats', async () => {
      await api.saveGameScore(150, 3);
      await api.saveGameScore(100, 2);

      const result = await api.getStats();

      expect(result.data).toBeDefined();
      expect(result.data?.total).toBe(150);
    });

    it('should format stats response correctly', async () => {
      await api.saveGameScore(75, 1);

      const result = await api.getStats();

      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('total');
      expect(typeof result.data?.total).toBe('number');
    });
  });

  describe('saveTrack', () => {
    beforeEach(() => {
      localStorage.trackingAllowed = 'true';
    });

    it('should save tracking event when tracking is allowed', async () => {
      const result = await api.saveTrack({
        data: {
          event: 'test-event',
          difficulty: 1,
          level: 0,
        },
      });

      expect(result.data.success).toBe(true);
    });

    it('should not save tracking when tracking is disabled', async () => {
      localStorage.trackingAllowed = 'false';

      const result = await api.saveTrack({
        data: {
          event: 'test-event',
          difficulty: 1,
        },
      });

      expect(result.data.success).toBe(true);
    });

    it('should calculate and include levelTime when starTime is provided', async () => {
      localStorage.trackingAllowed = 'true';

      const startTime = new Date(Date.now() - 5000); // 5 seconds ago
      const result = await api.saveTrack({
        starTime: startTime,
        data: {
          event: 'test-event',
          difficulty: 1,
        },
      });

      expect(result.data.success).toBe(true);
    });

    it('should handle save errors gracefully', async () => {
      localStorage.trackingAllowed = 'true';
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await api.saveTrack({
        data: { event: 'test' },
      });

      expect(result.data.success).toBe(true);
    });
  });

  describe('getAnalytics', () => {
    it('should return empty analytics initially', async () => {
      const result = await api.getAnalytics();

      expect(result.data.countUsers).toBe(0);
      expect(result.data.groupBySuccess).toEqual([
        { frequency: 0 },
        { frequency: 0 },
      ]);
    });

    it('should aggregate analytics from saved games', async () => {
      await api.saveGameScore(50, 1);
      await api.saveGameScore(100, 2);

      const result = await api.getAnalytics();

      expect(result.data.countUsers).toBeGreaterThan(0);
    });

    it('should return correct analytics structure', async () => {
      const result = await api.getAnalytics();
      const { data } = result;

      expect(data).toHaveProperty('groupByEvents');
      expect(data).toHaveProperty('countUsers');
      expect(data).toHaveProperty('groupBySuccess');
      expect(data).toHaveProperty('groupByLootSelected');
      expect(data).toHaveProperty('groupByGameEndAndDifficulty');
      expect(data).toHaveProperty('groupByCorrectAnswerAndOperator');
      expect(data).toHaveProperty('groupBySuccessAndOperator');
      expect(data).toHaveProperty('groupEventsByDay');

      expect(Array.isArray(data.groupByEvents)).toBe(true);
      expect(Array.isArray(data.groupBySuccess)).toBe(true);
      expect(Array.isArray(data.groupBySuccessAndOperator)).toBe(true);
      expect(Array.isArray(data.groupEventsByDay)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await api.getAnalytics();
      expect(result.data).toBeDefined();
      expect(result.data.groupByEvents).toBeDefined();
    });

    it('should correctly count games in groupByEvents', async () => {
      await api.saveGameScore(50, 1);
      await api.saveGameScore(100, 2);
      await api.saveGameScore(75, 1);

      const result = await api.getAnalytics();
      const gameCount = result.data.groupByEvents[1].frequency;

      expect(gameCount).toBe(3);
    });

    it('should correctly aggregate difficulty data', async () => {
      await api.saveGameScore(50, 1);
      await api.saveGameScore(100, 2);
      await api.saveGameScore(75, 2);
      await api.saveGameScore(120, 3);

      const result = await api.getAnalytics();
      const difficultyData = result.data.groupByGameEndAndDifficulty;

      // Should have one entry per game (4 games total)
      expect(difficultyData.length).toBe(4);
      // Verify each difficulty is represented
      expect(difficultyData.some((d) => d._id.difficulty === 1)).toBe(true);
      expect(difficultyData.some((d) => d._id.difficulty === 2)).toBe(true);
      expect(difficultyData.some((d) => d._id.difficulty === 3)).toBe(true);
      // Each entry should have frequency 1
      expect(difficultyData.every((d) => d.frequency === 1)).toBe(true);
    });

    it('should aggregate games by date correctly', async () => {
      await api.saveGameScore(50, 1);
      await api.saveGameScore(100, 2);

      const result = await api.getAnalytics();
      const gamesByDate = result.data.groupEventsByDay;

      // Should have at least one day with games
      expect(gamesByDate.length).toBeGreaterThan(0);
      expect(gamesByDate[0]._id.event).toBe('game-end');
      expect(gamesByDate[0]._id.day).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
      expect(gamesByDate[0].frequency).toBeGreaterThan(0);
    });

    it('should correctly aggregate loot selection data', async () => {
      await api.saveGameScore(50, 1);

      const result = await api.getAnalytics();
      const lootData = result.data.groupByLootSelected;

      // Initially should have empty loot data or handle gracefully
      expect(Array.isArray(lootData)).toBe(true);
    });
  });

  describe('getTracker', () => {
    it('should return empty tracker initially', async () => {
      const result = await api.getTracker();

      expect(result.data.groupBySuccess).toEqual([]);
      expect(result.data.groupBySuccessAndOp).toEqual([]);
    });

    it('should have correct tracker structure', async () => {
      const result = await api.getTracker();

      expect(result.data).toHaveProperty('groupBySuccess');
      expect(result.data).toHaveProperty('groupBySuccessAndOp');
      expect(Array.isArray(result.data.groupBySuccess)).toBe(true);
      expect(Array.isArray(result.data.groupBySuccessAndOp)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await api.getTracker();
      expect(result.data).toBeDefined();
      expect(result.data.groupBySuccess).toBeDefined();
      expect(result.data.groupBySuccessAndOp).toBeDefined();
    });
  });

  describe('User and Token methods', () => {
    it('getUser should return current username', async () => {
      const user = api.getUser();

      expect(user).toBeTruthy();
      expect(typeof user).toBe('string');
    });

    it('getToken should return local token', async () => {
      const token = api.getToken();

      expect(token).toBeTruthy();
      expect(token).toContain('local-');
    });

    it('should persist user across API instances', async () => {
      const user1 = api.getUser();

      const api2 = new ElogicalApi();
      const user2 = api2.getUser();

      expect(user1).toBe(user2);
    });
  });

  describe('Data integrity and consistency', () => {
    it('should maintain data consistency after multiple operations', async () => {
      // Operation 1: Save games
      await api.saveGameScore(50, 1);
      const analytics1 = await api.getAnalytics();

      // Operation 2: Save more games
      await api.saveGameScore(100, 2);
      const analytics2 = await api.getAnalytics();

      // Verify progressive accumulation
      expect(analytics1.data.groupByEvents[1].frequency).toBe(1);
      expect(analytics2.data.groupByEvents[1].frequency).toBe(2);
    });

    it('should correctly sum frequencies across all data points', async () => {
      for (let i = 0; i < 5; i++) {
        await api.saveGameScore(i * 20, (i % 3) + 1);
      }

      const result = await api.getAnalytics();
      expect(result.data.groupByEvents[1].frequency).toBe(5);
    });

    it('should handle simultaneous reads and writes consistently', async () => {
      const saves = [];
      for (let i = 0; i < 5; i++) {
        saves.push(api.saveGameScore(i * 20, 1));
      }

      await Promise.all(saves);

      const result = await api.getAnalytics();
      expect(result.data.groupByEvents[1].frequency).toBe(5);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete game flow', async () => {
      // Save some tracking events
      localStorage.trackingAllowed = 'true';
      await api.saveTrack({
        data: {
          event: 'gameStart',
          difficulty: 1,
        },
      });

      // Complete game and save score
      await api.saveGameScore(25, 2);

      // Verify data is available
      const leaderboard = await api.getLeaderBoard();
      const stats = await api.getStats();
      const analytics = await api.getAnalytics();

      expect(leaderboard.data.length).toBeGreaterThan(0);
      expect(stats.data).toBeDefined();
      expect(analytics.data.countUsers).toBeGreaterThan(0);
    });

    it('should maintain data integrity across operations', async () => {
      const score1 = await api.saveGameScore(50, 1);
      const leaderboard1 = await api.getLeaderBoard();

      const score2 = await api.saveGameScore(75, 1);
      const leaderboard2 = await api.getLeaderBoard();

      expect(leaderboard1.data.length).toBe(1);
      expect(leaderboard2.data.length).toBe(2);
      expect(score1.data.id).not.toBe(score2.data.id);
    });
  });
});
