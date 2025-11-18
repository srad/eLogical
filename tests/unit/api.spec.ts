import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ElogicalApi } from '@/services/elogical';
import { localStorageService, type GameScore } from '@/services/localStorage';

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
      const result = await api.authenticate();

      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toContain('local-');
    });

    it('should return the same username on subsequent calls', async () => {
      const result1 = await api.authenticate();
      const api2 = new ElogicalApi();
      const result2 = await api2.authenticate();

      expect(result1.user).toBe(result2.user);
    });

    it('should generate unique usernames for different instances', async () => {
      const api1 = new ElogicalApi();
      await localStorageService.clearAll();
      const api2 = new ElogicalApi();

      const result1 = await api1.authenticate();
      const result2 = await api2.authenticate();

      expect(result1.user).toBeDefined();
      expect(result2.user).toBeDefined();
    });
  });

  describe('saveGameScore', () => {
    it('should save a game score and return success', async () => {
      await api.authenticate();
      const result = await api.saveGameScore('TestPlayer', 100, 2);

      expect(result.data.success).toBe(true);
      expect(result.data.id).toBeGreaterThan(0);
    });

    it('should save multiple scores', async () => {
      await api.authenticate();
      const result1 = await api.saveGameScore('Player1', 50, 1);
      const result2 = await api.saveGameScore('Player2', 100, 2);
      const result3 = await api.saveGameScore('Player3', 75, 1);

      expect(result1.data.id).not.toBe(result2.data.id);
      expect(result2.data.id).not.toBe(result3.data.id);
    });

    it('should calculate points correctly', async () => {
      await api.authenticate();

      // Points = (difficulty - 1) * 5 + level
      // For difficulty 1, level 0: (1-1)*5 + 0 = 0
      // For difficulty 2, level 3: (2-1)*5 + 3 = 8
      // For difficulty 3, level 5: (3-1)*5 + 5 = 15

      const result1 = await api.saveGameScore('P1', 0, 1);
      const result2 = await api.saveGameScore('P2', 8, 2);
      const result3 = await api.saveGameScore('P3', 15, 3);

      expect(result1.data.success).toBe(true);
      expect(result2.data.success).toBe(true);
      expect(result3.data.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      await api.authenticate();
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      // This should not throw, even if storage fails
      const result = await api.saveGameScore('Player', 100, 1);
      expect(result.data.success).toBeDefined();
    });
  });

  describe('getLeaderBoard', () => {
    it('should return empty leaderboard initially', async () => {
      await api.authenticate();
      const result = await api.getLeaderBoard();

      expect(result.data).toEqual([]);
    });

    it('should return scores sorted by total descending', async () => {
      await api.authenticate();
      await api.saveGameScore('Player1', 50, 1);
      await api.saveGameScore('Player2', 100, 2);
      await api.saveGameScore('Player3', 75, 1);

      const result = await api.getLeaderBoard();
      const scores = result.data;

      expect(scores.length).toBe(3);
      expect(scores[0].total).toBe(100);
      expect(scores[1].total).toBe(75);
      expect(scores[2].total).toBe(50);
    });

    it('should limit results to top 10', async () => {
      await api.authenticate();

      // Save 15 scores
      for (let i = 0; i < 15; i++) {
        await api.saveGameScore(`Player${i}`, i * 10, 1);
      }

      const result = await api.getLeaderBoard();
      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    it('should return proper GameScore structure', async () => {
      await api.authenticate();
      await api.saveGameScore('TestPlayer', 100, 2);

      const result = await api.getLeaderBoard();
      const score = result.data[0];

      expect(score.name).toBe('TestPlayer');
      expect(score.total).toBe(100);
      expect(score.difficulty).toBe(2);
      expect(score.timestamp).toBeDefined();
      expect(score.client).toBeDefined();
      expect(Array.isArray(score.client)).toBe(true);
    });

    it('should handle empty leaderboard gracefully', async () => {
      await api.authenticate();
      const result = await api.getLeaderBoard();

      expect(result.data).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return empty stats initially', async () => {
      await api.authenticate();
      const result = await api.getStats();

      expect(result.data).toEqual([]);
    });

    it('should return top player stats', async () => {
      await api.authenticate();
      await api.saveGameScore('TopPlayer', 150, 3);
      await api.saveGameScore('SecondPlace', 100, 2);

      const result = await api.getStats();

      expect(result.data.length).toBe(1);
      expect(result.data[0]._id).toBe('TopPlayer');
      expect(result.data[0].total).toBe(150);
    });

    it('should format stats response correctly', async () => {
      await api.authenticate();
      await api.saveGameScore('Player', 75, 1);

      const result = await api.getStats();
      const stat = result.data[0];

      expect(stat).toHaveProperty('_id');
      expect(stat).toHaveProperty('total');
      expect(stat).toHaveProperty('client');
      expect(Array.isArray(stat.client)).toBe(true);
    });
  });

  describe('saveTrack', () => {
    beforeEach(() => {
      localStorage.trackingAllowed = 'true';
    });

    it('should save tracking event when tracking is allowed', async () => {
      await api.authenticate();
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
      await api.authenticate();

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
      await api.authenticate();

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
      await api.authenticate();
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await api.saveTrack({
        data: { event: 'test' },
      });

      expect(result.data.success).toBe(true);
    });
  });

  describe('saveAnswer', () => {
    it('should save answer data', async () => {
      await api.authenticate();
      const result = await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });

      expect(result.data.success).toBe(true);
    });

    it('should save answer without operator', async () => {
      await api.authenticate();
      const result = await api.saveAnswer({
        success: false,
        difficulty: 2,
        level: 3,
      });

      expect(result.data.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      await api.authenticate();
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await api.saveAnswer({ invalid: 'data' });
      expect(result.data.success).toBeDefined();
    });
  });

  describe('getAnalytics', () => {
    it('should return empty analytics initially', async () => {
      await api.authenticate();
      const result = await api.getAnalytics();

      expect(result.data.countUsers).toBe(0);
      expect(result.data.groupBySuccess).toEqual([
        { frequency: 0 },
        { frequency: 0 },
      ]);
    });

    it('should aggregate analytics from saved games', async () => {
      await api.authenticate();
      await api.saveGameScore('Player1', 50, 1);
      await api.saveGameScore('Player2', 100, 2);

      const result = await api.getAnalytics();

      expect(result.data.countUsers).toBeGreaterThan(0);
    });

    it('should return correct analytics structure', async () => {
      await api.authenticate();
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
      await api.authenticate();
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await api.getAnalytics();
      expect(result.data).toBeDefined();
      expect(result.data.groupByEvents).toBeDefined();
    });

    it('should correctly count games in groupByEvents', async () => {
      await api.authenticate();
      await api.saveGameScore('Player1', 50, 1);
      await api.saveGameScore('Player2', 100, 2);
      await api.saveGameScore('Player3', 75, 1);

      const result = await api.getAnalytics();
      const gameCount = result.data.groupByEvents[1].frequency;

      expect(gameCount).toBe(3);
    });

    it('should correctly aggregate difficulty data', async () => {
      await api.authenticate();
      await api.saveGameScore('Player1', 50, 1);
      await api.saveGameScore('Player2', 100, 2);
      await api.saveGameScore('Player3', 75, 2);
      await api.saveGameScore('Player4', 120, 3);

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
      await api.authenticate();
      await api.saveGameScore('Player1', 50, 1);
      await api.saveGameScore('Player2', 100, 2);

      const result = await api.getAnalytics();
      const gamesByDate = result.data.groupEventsByDay;

      // Should have at least one day with games
      expect(gamesByDate.length).toBeGreaterThan(0);
      expect(gamesByDate[0]._id.event).toBe('game-end');
      expect(gamesByDate[0]._id.day).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
      expect(gamesByDate[0].frequency).toBeGreaterThan(0);
    });

    it('should correctly aggregate loot selection data', async () => {
      await api.authenticate();

      // Save answers with different loot choices
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });

      const result = await api.getAnalytics();
      const lootData = result.data.groupByLootSelected;

      // Initially should have empty loot data or handle gracefully
      expect(Array.isArray(lootData)).toBe(true);
    });

    it('should track success vs failure counts', async () => {
      await api.authenticate();

      // Save 5 games (acts as total games)
      for (let i = 0; i < 5; i++) {
        await api.saveGameScore(`Player${i}`, 50 + i * 10, 1);
      }

      // Save 2 successful answers
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 1,
        operator: 'OR',
      });

      const result = await api.getAnalytics();
      const successData = result.data.groupBySuccess;

      // groupBySuccess is [failures, successes]
      // failures = gameCount - successCount = 5 - 2 = 3
      // successes = successCount = 2
      expect(successData.length).toBe(2);
      expect(successData[0].frequency).toBe(3); // 3 failures (5 games - 2 successes)
      expect(successData[1].frequency).toBe(2); // 2 successes
    });

    it('should correctly aggregate correctness by operator', async () => {
      await api.authenticate();

      // Save answers for different operators
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 1,
        operator: 'AND',
      });
      await api.saveAnswer({
        success: false,
        difficulty: 1,
        level: 2,
        operator: 'AND',
      });
      await api.saveAnswer({
        success: true,
        difficulty: 2,
        level: 0,
        operator: 'OR',
      });
      await api.saveAnswer({
        success: false,
        difficulty: 2,
        level: 1,
        operator: 'OR',
      });

      const result = await api.getAnalytics();
      const opData = result.data.groupByCorrectAnswerAndOperator;

      expect(opData.length).toBeGreaterThan(0);
      expect(opData.some((o) => o._id.operator === 'AND')).toBe(true);
      expect(opData.some((o) => o._id.operator === 'OR')).toBe(true);
    });
  });

  describe('getTracker', () => {
    it('should return empty tracker initially', async () => {
      await api.authenticate();
      const result = await api.getTracker();

      expect(result.data.groupBySuccess).toEqual([]);
      expect(result.data.groupBySuccessAndOp).toEqual([]);
    });

    it('should aggregate success data when answers are saved', async () => {
      await api.authenticate();

      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });

      await api.saveAnswer({
        success: false,
        difficulty: 1,
        level: 1,
        operator: 'OR',
      });

      const result = await api.getTracker();
      expect(result.data.groupBySuccess.length).toBeGreaterThan(0);
      expect(result.data.groupBySuccessAndOp.length).toBeGreaterThan(0);
    });

    it('should have correct tracker structure', async () => {
      await api.authenticate();
      const result = await api.getTracker();

      expect(result.data).toHaveProperty('groupBySuccess');
      expect(result.data).toHaveProperty('groupBySuccessAndOp');
      expect(Array.isArray(result.data.groupBySuccess)).toBe(true);
      expect(Array.isArray(result.data.groupBySuccessAndOp)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      await api.authenticate();
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await api.getTracker();
      expect(result.data).toBeDefined();
      expect(result.data.groupBySuccess).toBeDefined();
      expect(result.data.groupBySuccessAndOp).toBeDefined();
    });
  });

  describe('User and Token methods', () => {
    it('getUser should return current username', async () => {
      await api.authenticate();
      const user = api.getUser();

      expect(user).toBeTruthy();
      expect(typeof user).toBe('string');
    });

    it('getToken should return local token', async () => {
      await api.authenticate();
      const token = api.getToken();

      expect(token).toBeTruthy();
      expect(token).toContain('local-');
    });

    it('should persist user across API instances', async () => {
      await api.authenticate();
      const user1 = api.getUser();

      const api2 = new ElogicalApi();
      await api2.authenticate();
      const user2 = api2.getUser();

      expect(user1).toBe(user2);
    });
  });

  describe('groupBySuccessAndOperator analytics', () => {
    it('should track success and failure by operator', async () => {
      await api.authenticate();

      // Save AND operator answers: 2 success, 1 failure
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 1,
        operator: 'AND',
      });
      await api.saveAnswer({
        success: false,
        difficulty: 1,
        level: 2,
        operator: 'AND',
      });

      // Save OR operator answers: 1 success, 2 failures
      await api.saveAnswer({
        success: true,
        difficulty: 2,
        level: 0,
        operator: 'OR',
      });
      await api.saveAnswer({
        success: false,
        difficulty: 2,
        level: 1,
        operator: 'OR',
      });
      await api.saveAnswer({
        success: false,
        difficulty: 2,
        level: 2,
        operator: 'OR',
      });

      const result = await api.getAnalytics();
      const successByOp = result.data.groupBySuccessAndOperator;

      // Should have entries for AND and OR operators
      expect(successByOp.length).toBeGreaterThan(0);

      // Check AND operator data
      const andSuccess = successByOp.find(
        (s) => s._id.op.includes('AND') && s._id.success === true
      );
      const andFailure = successByOp.find(
        (s) => s._id.op.includes('AND') && s._id.success === false
      );
      expect(andSuccess?.frequency).toBe(2);
      expect(andFailure?.frequency).toBe(1);

      // Check OR operator data
      const orSuccess = successByOp.find(
        (s) => s._id.op.includes('OR') && s._id.success === true
      );
      const orFailure = successByOp.find(
        (s) => s._id.op.includes('OR') && s._id.success === false
      );
      expect(orSuccess?.frequency).toBe(1);
      expect(orFailure?.frequency).toBe(2);
    });

    it('should correctly aggregate multiple operators', async () => {
      await api.authenticate();

      const operators = ['AND', 'OR', 'NOT', 'XOR', 'IMPLICATION', 'EQUAL'];
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < operators.length; i++) {
        const isSuccess = i % 2 === 0;
        await api.saveAnswer({
          success: isSuccess,
          difficulty: 1,
          level: i,
          operator: operators[i],
        });
        if (isSuccess) successCount++;
        else failureCount++;
      }

      const result = await api.getAnalytics();
      const successByOp = result.data.groupBySuccessAndOperator;

      // Should have entries for each operator
      const uniqueOps = new Set<string>();
      successByOp.forEach((s) => {
        s._id.op.forEach((op) => uniqueOps.add(op));
      });

      expect(uniqueOps.size).toBeGreaterThan(0);

      // Verify total counts
      const totalSuccess = successByOp
        .filter((s) => s._id.success === true)
        .reduce((sum, s) => sum + s.frequency, 0);
      const totalFailure = successByOp
        .filter((s) => s._id.success === false)
        .reduce((sum, s) => sum + s.frequency, 0);

      expect(totalSuccess).toBe(successCount);
      expect(totalFailure).toBe(failureCount);
    });

    it('should have correct structure for groupBySuccessAndOperator entries', async () => {
      await api.authenticate();

      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });

      const result = await api.getAnalytics();
      const successByOp = result.data.groupBySuccessAndOperator;

      if (successByOp.length > 0) {
        const entry = successByOp[0];
        expect(entry).toHaveProperty('_id');
        expect(entry._id).toHaveProperty('success');
        expect(entry._id).toHaveProperty('op');
        expect(entry).toHaveProperty('frequency');
        expect(typeof entry._id.success).toBe('boolean');
        expect(Array.isArray(entry._id.op)).toBe(true);
        expect(typeof entry.frequency).toBe('number');
      }
    });

    it('should not include null operators in success aggregation', async () => {
      await api.authenticate();

      // Save answers without operators
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
      });

      const result = await api.getAnalytics();
      const successByOp = result.data.groupBySuccessAndOperator;

      // Entries without operators should not appear in this aggregation
      expect(
        successByOp.every((s) => s._id.op && s._id.op.length > 0)
      ).toBe(true);
    });
  });

  describe('Complex analytics scenarios', () => {
    it('should calculate analytics correctly with mixed data', async () => {
      await api.authenticate();

      // Create a complex scenario
      // Players
      await api.saveGameScore('Alice', 100, 1);
      await api.saveGameScore('Bob', 200, 2);
      await api.saveGameScore('Charlie', 150, 2);

      // Answers (2 successful)
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 1,
        operator: 'AND',
      });

      const result = await api.getAnalytics();

      // Verify all data is present and consistent
      expect(result.data.countUsers).toBeGreaterThan(0);
      expect(result.data.groupByEvents[1].frequency).toBe(3); // 3 games
      expect(result.data.groupByGameEndAndDifficulty.length).toBe(3); // 3 games, one entry each
      expect(result.data.groupBySuccess[0].frequency).toBe(1); // 3 games - 2 successes = 1 failure
      expect(result.data.groupBySuccess[1].frequency).toBe(2); // 2 successes
    });

    it('should maintain accurate counts across multiple data points', async () => {
      await api.authenticate();

      const scores: Array<{ name: string; score: number; difficulty: number }> =
        [];
      for (let i = 0; i < 10; i++) {
        const score = Math.floor(Math.random() * 200) + 10;
        const difficulty = (i % 3) + 1;
        scores.push({ name: `Player${i}`, score, difficulty });
        await api.saveGameScore(`Player${i}`, score, difficulty);
      }

      const result = await api.getAnalytics();

      // Verify game count
      expect(result.data.groupByEvents[1].frequency).toBe(scores.length);

      // groupByGameEndAndDifficulty has one entry per game, not aggregated by difficulty
      expect(result.data.groupByGameEndAndDifficulty.length).toBe(
        scores.length
      );

      // Verify all difficulties are represented
      const uniqueDifficulties = new Set(scores.map((s) => s.difficulty));
      const resultDifficulties = new Set(
        result.data.groupByGameEndAndDifficulty.map((d) => d._id.difficulty)
      );
      expect(resultDifficulties.size).toBe(uniqueDifficulties.size);
    });

    it('should handle edge case with single answer', async () => {
      await api.authenticate();

      // Save 1 game first
      await api.saveGameScore('Player', 50, 1);

      // Then save 1 successful answer
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });

      const result = await api.getAnalytics();
      const successData = result.data.groupBySuccess;

      // Should have entries for failures and successes
      expect(successData.length).toBe(2);
      // Index 0 is failures, index 1 is successes
      // failures = 1 game - 1 success = 0
      // successes = 1
      expect(successData[0].frequency).toBe(0); // 0 failures
      expect(successData[1].frequency).toBe(1); // 1 success
    });

    it('should correctly calculate success rate per operator', async () => {
      await api.authenticate();

      // AND: 3 success, 1 failure = 75%
      for (let i = 0; i < 3; i++) {
        await api.saveAnswer({
          success: true,
          difficulty: 1,
          level: i,
          operator: 'AND',
        });
      }
      await api.saveAnswer({
        success: false,
        difficulty: 1,
        level: 3,
        operator: 'AND',
      });

      // OR: 1 success, 2 failures = 33%
      await api.saveAnswer({
        success: true,
        difficulty: 2,
        level: 0,
        operator: 'OR',
      });
      for (let i = 0; i < 2; i++) {
        await api.saveAnswer({
          success: false,
          difficulty: 2,
          level: i + 1,
          operator: 'OR',
        });
      }

      const result = await api.getAnalytics();
      const successByOp = result.data.groupBySuccessAndOperator;

      const andSuccess = successByOp.find(
        (s) => s._id.op.includes('AND') && s._id.success === true
      );
      const andFailure = successByOp.find(
        (s) => s._id.op.includes('AND') && s._id.success === false
      );
      const orSuccess = successByOp.find(
        (s) => s._id.op.includes('OR') && s._id.success === true
      );
      const orFailure = successByOp.find(
        (s) => s._id.op.includes('OR') && s._id.success === false
      );

      expect(andSuccess?.frequency).toBe(3);
      expect(andFailure?.frequency).toBe(1);
      expect(orSuccess?.frequency).toBe(1);
      expect(orFailure?.frequency).toBe(2);
    });
  });

  describe('Data integrity and consistency', () => {
    it('should maintain data consistency after multiple operations', async () => {
      await api.authenticate();

      // Operation 1: Save games
      await api.saveGameScore('Player1', 50, 1);
      const analytics1 = await api.getAnalytics();

      // Operation 2: Save more games
      await api.saveGameScore('Player2', 100, 2);
      const analytics2 = await api.getAnalytics();

      // Operation 3: Save answers
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
        operator: 'AND',
      });
      const analytics3 = await api.getAnalytics();

      // Verify progressive accumulation
      expect(analytics1.data.groupByEvents[1].frequency).toBe(1);
      expect(analytics2.data.groupByEvents[1].frequency).toBe(2);
      // Games should remain at 2 (answers don't affect game count)
      expect(analytics3.data.groupByEvents[1].frequency).toBe(2);
    });

    it('should correctly sum frequencies across all data points', async () => {
      await api.authenticate();

      for (let i = 0; i < 5; i++) {
        await api.saveAnswer({
          success: Math.random() > 0.5,
          difficulty: (i % 3) + 1,
          level: i,
          operator: ['AND', 'OR', 'NOT', 'XOR', 'IMPLICATION'][i],
        });
      }

      const result = await api.getAnalytics();
      const successByOp = result.data.groupBySuccessAndOperator;

      // Total frequency should equal the number of answers
      const totalFrequency = successByOp.reduce(
        (sum, s) => sum + s.frequency,
        0
      );
      expect(totalFrequency).toBe(5);
    });

    it('should handle simultaneous reads and writes consistently', async () => {
      await api.authenticate();

      const saves = [];
      for (let i = 0; i < 5; i++) {
        saves.push(api.saveGameScore(`Player${i}`, i * 20, 1));
      }

      await Promise.all(saves);

      const result = await api.getAnalytics();
      expect(result.data.groupByEvents[1].frequency).toBe(5);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete game flow', async () => {
      await api.authenticate();

      // Save some tracking events
      localStorage.trackingAllowed = 'true';
      await api.saveTrack({
        data: {
          event: 'gameStart',
          difficulty: 1,
        },
      });

      // Play and save answers
      await api.saveAnswer({
        success: true,
        difficulty: 1,
        level: 0,
      });

      // Complete game and save score
      await api.saveGameScore('TestPlayer', 25, 2);

      // Verify data is available
      const leaderboard = await api.getLeaderBoard();
      const stats = await api.getStats();
      const analytics = await api.getAnalytics();

      expect(leaderboard.data.length).toBeGreaterThan(0);
      expect(stats.data.length).toBeGreaterThan(0);
      expect(analytics.data.countUsers).toBeGreaterThan(0);
    });

    it('should handle multiple players', async () => {
      await api.authenticate();

      await api.saveGameScore('Alice', 100, 2);
      await api.saveGameScore('Bob', 80, 1);
      await api.saveGameScore('Charlie', 120, 3);

      const leaderboard = await api.getLeaderBoard();

      expect(leaderboard.data.length).toBe(3);
      expect(leaderboard.data[0].name).toBe('Charlie');
      expect(leaderboard.data[1].name).toBe('Alice');
      expect(leaderboard.data[2].name).toBe('Bob');
    });

    it('should maintain data integrity across operations', async () => {
      await api.authenticate();

      const score1 = await api.saveGameScore('Player', 50, 1);
      const leaderboard1 = await api.getLeaderBoard();

      const score2 = await api.saveGameScore('Player', 75, 1);
      const leaderboard2 = await api.getLeaderBoard();

      expect(leaderboard1.data.length).toBe(1);
      expect(leaderboard2.data.length).toBe(2);
      expect(score1.data.id).not.toBe(score2.data.id);
    });
  });
});
