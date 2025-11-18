import { type GameScore, localStorageService, type TrackingEvent } from "./localStorage";
import EventType from "./events";

interface TrackingData {
  [key: string]: unknown;
}

interface SaveTrackParams {
  starTime?: Date;
  data: TrackingData;
}

export interface LeaderboardResponse {
  data: GameScore[];
}

interface StatsResponse {
  data: Array<{
    _id: string;
    total: number;
    client: Array<{ name: string }>;
  }>;
}

interface AnalyticsResponse {
  data: {
    groupByEvents: Array<{ frequency: number }>;
    countUsers: number;
    groupBySuccess: Array<{ frequency: number }>;
    groupByLootSelected: Array<{ _id: { loot: string | null }; frequency: number }>;
    groupByGameEndAndDifficulty: Array<{ _id: { difficulty: number }; frequency: number }>;
    groupByCorrectAnswerAndOperator: Array<{ _id: { operator: string }; frequency: number }>;
    groupBySuccessAndOperator: Array<{ _id: { success: boolean; op: string[] }; frequency: number }>;
    groupEventsByDay: Array<{ _id: { day: string; event: string }; frequency: number }>;
  };
}

class ElogicalApi {
  private username: string = "offline-user";

  async getLeaderBoard(): Promise<LeaderboardResponse> {
    try {
      const scores = await localStorageService.getLeaderboard(10);
      return { data: scores };
    } catch (error) {
      console.warn("Failed to fetch leaderboard:", error);
      return { data: [] };
    }
  }

  async getUserHighScores(limit: number = 50): Promise<LeaderboardResponse> {
    try {
      const scores = await localStorageService.getLeaderboard(limit);
      return { data: scores };
    } catch (error) {
      console.warn("Failed to fetch user high scores:", error);
      return { data: [] };
    }
  }

  async getStats(): Promise<StatsResponse> {
    try {
      const scores = await localStorageService.getLeaderboard(1);
      return {
        data: scores.map((score) => ({
          _id: score.name,
          total: score.total,
          client: score.client,
        })),
      };
    } catch (error) {
      console.warn("Failed to fetch stats:", error);
      return { data: [] };
    }
  }

  async getAnalytics(): Promise<AnalyticsResponse> {
    try {
      const trackingEvents = await localStorageService.getAllTrackingEvents();
      const leaderboard = await localStorageService.getLeaderboard(1000);

      // Extract analytics from tracking events only
      interface ProcessedEvent {
        timestamp: number;
        event: string;
        difficulty: number;
        level: number;
        success?: boolean;
        operator?: string;
        loot?: string;
      }

      const allAnalyticsEvents: ProcessedEvent[] = [];

      trackingEvents.forEach((trackingEvent) => {
        // Process confirm-input events as answer events
        if (trackingEvent.event === EventType.confirmInput) {
          const data = trackingEvent.data as Record<string, unknown>;
          const ops = data.ops as string[] | undefined;
          allAnalyticsEvents.push({
            timestamp: trackingEvent.timestamp,
            event: "answer",
            difficulty: (data.difficulty as number) ?? 1,
            level: (data.level as number) ?? 0,
            success: (data.success as boolean) ?? false,
            operator: ops && ops.length > 0 ? ops[0] : undefined,
          });
        }
        // Process stage-completed events for loot
        if (trackingEvent.event === EventType.stageCompleted) {
          const data = trackingEvent.data as Record<string, unknown>;
          const loot = (data.loot as string) ?? null;
          allAnalyticsEvents.push({
            timestamp: trackingEvent.timestamp,
            event: "loot-selected",
            difficulty: (data.difficulty as number) ?? 1,
            level: 0,
            loot: loot === null ? undefined : loot,
          });
        }
      });

      // Process analytics data - only count answer events, not loot or other events
      const answerEvents = allAnalyticsEvents.filter((a) => a.event === "answer");
      const gameCount = leaderboard.length;
      const successCount = answerEvents.filter((a) => a.success === true).length;
      const failureCount = answerEvents.filter((a) => a.success === false).length;
      const lootMap: Record<string, number> = {};
      const operatorMap: Record<string, number> = {};
      const opSuccessMap = new Map<string, { success: boolean; count: number }[]>();

      allAnalyticsEvents.forEach((event) => {
        // Process loot data
        if (event.loot && event.event === "loot-selected") {
          lootMap[event.loot] = (lootMap[event.loot] ?? 0) + 1;
        }
        // Process operator success data
        if (event.operator && event.event === "answer" && event.success !== undefined) {
          operatorMap[event.operator] = (operatorMap[event.operator] ?? 0) + 1;

          // Aggregate by operator and success status
          if (!opSuccessMap.has(event.operator)) {
            opSuccessMap.set(event.operator, []);
          }
          const opData = opSuccessMap.get(event.operator)!;
          const existing = opData.find((d) => d.success === event.success);
          if (existing) {
            existing.count++;
          } else {
            opData.push({ success: event.success ?? false, count: 1 });
          }
        }
      });

      // Build groupBySuccessAndOperator from aggregated data
      const groupBySuccessAndOperator = Array.from(opSuccessMap.entries())
        .map(([ op, successData ]) => {
          const successGroups = successData.reduce(
            (acc, sd) => {
              const existing = acc.find((g) => g.success === sd.success);
              if (existing) {
                existing.frequency += sd.count;
              } else {
                acc.push({ success: sd.success, frequency: sd.count });
              }
              return acc;
            },
            [] as Array<{ success: boolean; frequency: number }>
          );
          return successGroups.map((sg) => ({
            _id: { success: sg.success, op: [ op ] },
            frequency: sg.frequency,
          }));
        })
        .flat();

      // Build groupEventsByDay from leaderboard timestamps
      const dayMap = new Map<string, number>();
      leaderboard.forEach((score) => {
        const date = new Date(score.timestamp);
        const day = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0"),
        ].join("-");
        dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      });

      const groupEventsByDay = Array.from(dayMap.entries())
        .map(([ day, freq ]) => ({
          _id: { day, event: "game-end" },
          frequency: freq,
        }))
        .sort((a, b) => a._id.day.localeCompare(b._id.day));

      return {
        data: {
          groupByEvents: [ { frequency: 0 }, { frequency: gameCount } ],
          countUsers: leaderboard.length > 0 ? 1 : 0,
          groupBySuccess: [
            { frequency: failureCount },
            { frequency: successCount },
          ],
          groupByLootSelected: Object.entries(lootMap).map(([ loot, freq ]) => ({
            _id: { loot: loot === "none" ? null : loot },
            frequency: freq,
          })),
          groupByGameEndAndDifficulty: Object.entries(
            leaderboard.reduce((acc, score) => {
              acc[score.difficulty] = (acc[score.difficulty] ?? 0) + 1;
              return acc;
            }, {} as Record<number, number>)
          ).map(([ difficulty, frequency ]) => ({
            _id: { difficulty: parseInt(difficulty) },
            frequency,
          })),
          groupByCorrectAnswerAndOperator: Object.entries(operatorMap).map(
            ([ operator, freq ]) => ({
              _id: { operator },
              frequency: freq,
            })
          ),
          groupBySuccessAndOperator,
          groupEventsByDay,
        },
      };
    } catch (error) {
      console.warn("Failed to fetch analytics:", error);
      return {
        data: {
          groupByEvents: [ { frequency: 0 }, { frequency: 0 } ],
          countUsers: 0,
          groupBySuccess: [ { frequency: 0 }, { frequency: 0 } ],
          groupByLootSelected: [],
          groupByGameEndAndDifficulty: [],
          groupByCorrectAnswerAndOperator: [],
          groupBySuccessAndOperator: [],
          groupEventsByDay: [],
        },
      };
    }
  }

  async getTracker(): Promise<{
    data: {
      groupBySuccess: Array<{ _id: { success: boolean }; frequency: number }>;
      groupBySuccessAndOp: Array<{ _id: { success: boolean; op: string[] }; frequency: number }>;
    };
  }> {
    try {
      const trackingEvents = await localStorageService.getAllTrackingEvents();

      // Aggregate by success status from confirm-input events
      const successMap = new Map<boolean, number>();
      trackingEvents.forEach((event) => {
        if (event.event === EventType.confirmInput && event.data.success !== undefined) {
          const success = event.data.success as boolean;
          const count = successMap.get(success) ?? 0;
          successMap.set(success, count + 1);
        }
      });

      const groupBySuccess = Array.from(successMap.entries()).map(([ success, frequency ]) => ({
        _id: { success },
        frequency,
      }));

      // Aggregate by success status and operator
      const opMap = new Map<string, { success: boolean; count: number }[]>();
      trackingEvents.forEach((event) => {
        if (event.event === EventType.confirmInput && event.data.success !== undefined) {
          const ops = event.data.ops as string[] | undefined;
          const success = event.data.success as boolean;
          const operator = ops && ops.length > 0 ? ops[0] : undefined;

          if (operator) {
            if (!opMap.has(operator)) {
              opMap.set(operator, []);
            }
            const opData = opMap.get(operator)!;
            const existing = opData.find((d) => d.success === success);
            if (existing) {
              existing.count++;
            } else {
              opData.push({ success, count: 1 });
            }
          }
        }
      });

      const groupBySuccessAndOp = Array.from(opMap.entries()).map(([ op, successData ]) =>
        successData.map((sd) => ({
          _id: { success: sd.success, op: [ op ] },
          frequency: sd.count,
        }))
      ).flat();

      return {
        data: {
          groupBySuccess,
          groupBySuccessAndOp,
        },
      };
    } catch (error) {
      console.warn("Failed to fetch tracker:", error);
      return {
        data: {
          groupBySuccess: [],
          groupBySuccessAndOp: [],
        },
      };
    }
  }

  getUser(): string | null {
    return this.username;
  }

  getToken(): string | null {
    return `local-${this.username}`;
  }

  async saveTrack({ starTime, data }: SaveTrackParams): Promise<{ data: { success: boolean } }> {
    // Validate required fields
    if (!data || typeof data !== "object") {
      console.warn("saveTrack: data is required and must be an object");
      return Promise.resolve({ data: { success: false } });
    }

    const eventType = (data.event as string) ?? "unknown";
    if (!eventType || typeof eventType !== "string") {
      console.warn("saveTrack: event type must be a string");
      return Promise.resolve({ data: { success: false } });
    }

    // Validate event-specific required fields
    if (eventType === EventType.confirmInput) {
      if (data.success === undefined) {
        console.warn("saveTrack: confirmInput event requires success field");
        return Promise.resolve({ data: { success: false } });
      }
      if (typeof data.difficulty !== "number" || data.difficulty < 1) {
        console.warn("saveTrack: confirmInput event requires valid difficulty field");
        return Promise.resolve({ data: { success: false } });
      }
      if (typeof data.level !== "number" || data.level < 0) {
        console.warn("saveTrack: confirmInput event requires valid level field");
        return Promise.resolve({ data: { success: false } });
      }
    }

    // Allow tracking by default for analytics to work
    const trackingAllowed = localStorage.trackingAllowed !== "false";
    if (trackingAllowed) {
      if (starTime) {
        (data as Record<string, unknown>).levelTime = Math.abs(
          starTime.getTime() - new Date().getTime()
        );
      }
      try {
        await localStorageService.saveTrackingEvent(eventType, data);
      } catch (error) {
        console.warn("Failed to save tracking:", error);
      }
    }

    return Promise.resolve({ data: { success: true } });
  }

  async saveGameScore(
    name: string,
    total: number,
    difficulty: number
  ): Promise<{ data: { success: boolean; id: number } }> {
    try {
      const id = await localStorageService.saveGameScore(name, total, difficulty);
      return { data: { success: true, id } };
    } catch (error) {
      console.warn("Failed to save game score:", error);
      return { data: { success: false, id: -1 } };
    }
  }

  async getAllTrackingEvents(): Promise<TrackingEvent[]> {
    try {
      return await localStorageService.getAllTrackingEvents();
    } catch (error) {
      console.warn("Failed to fetch tracking events:", error);
      return [];
    }
  }
}

export { ElogicalApi, type TrackingData };
