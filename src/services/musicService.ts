import quizCountdownFile from "/music/quiz-countdown-thinking-time-238530.mp3";
import thinkingTimeFile from "/music/thinking-time-148496.mp3";
import examenFile from "/music/examen-179610.mp3";

/**
 * Music service for playing background music throughout the application
 * Implemented as a singleton that auto-initializes on first import
 * Plays tracks continuously in random order until stopped
 */
class MusicService {
  private static instance: MusicService;
  private tracks: string[];
  private currentAudio: HTMLAudioElement | null = null;
  private currentTrackIndex: number = -1;
  private lastPlayedIndex: number = -1;
  private defaultVolume: number = 0.3;
  private shouldContinuePlaying: boolean = false;
  private isPaused: boolean = false;

  private constructor() {
    this.tracks = [quizCountdownFile, thinkingTimeFile, examenFile];
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): MusicService {
    if (!MusicService.instance) {
      MusicService.instance = new MusicService();
    }
    return MusicService.instance;
  }

  /**
   * Get a random track index that is different from the last played track
   */
  private getRandomTrackIndex(): number {
    if (this.tracks.length === 1) {
      return 0;
    }

    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * this.tracks.length);
    } while (randomIndex === this.lastPlayedIndex);

    return randomIndex;
  }

  /**
   * Play the next track in the queue
   * Continues playing forever until stop() or pause() is called
   */
  private playNextTrack(): void {
    if (!this.shouldContinuePlaying) {
      return;
    }

    this.currentTrackIndex = this.getRandomTrackIndex();
    this.lastPlayedIndex = this.currentTrackIndex;

    const trackUrl = this.tracks[this.currentTrackIndex];
    this.currentAudio = new Audio(trackUrl);
    this.currentAudio.volume = this.defaultVolume;
    this.currentAudio.preload = "auto";

    // When track ends, play the next one automatically (forever loop)
    this.currentAudio.addEventListener("ended", () => {
      if (this.shouldContinuePlaying) {
        this.playNextTrack();
      }
    });

    // Play the track
    this.currentAudio.play().catch((err) => {
      console.warn("Could not play music track:", err);
      this.shouldContinuePlaying = false;
    });
  }

  /**
   * Start playing background music
   * Plays random tracks continuously forever until pause() or stop() is called
   */
  public play(): void {
    if (this.shouldContinuePlaying && !this.isPaused) {
      // Already playing
      return;
    }

    if (this.isPaused && this.currentAudio) {
      // Resume from pause
      this.isPaused = false;
      this.shouldContinuePlaying = true;
      this.currentAudio.play().catch((err) => {
        console.warn("Could not resume music:", err);
      });
      return;
    }

    // Start playing from the beginning
    this.shouldContinuePlaying = true;
    this.isPaused = false;
    this.playNextTrack();
  }

  /**
   * Pause the currently playing music
   * Can be resumed with play()
   */
  public pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.isPaused = true;
      this.shouldContinuePlaying = false;
    }
  }

  /**
   * Stop the music completely
   * Next play() will start from a new random track
   */
  public stop(): void {
    this.shouldContinuePlaying = false;
    this.isPaused = false;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    this.currentTrackIndex = -1;
  }

  /**
   * Set the volume for background music
   * @param volume - Volume level (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.defaultVolume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.defaultVolume;
    }
  }

  /**
   * Get the current volume
   * @returns Current volume level (0.0 to 1.0)
   */
  public getVolume(): number {
    return this.defaultVolume;
  }

  /**
   * Check if music is currently playing (not paused or stopped)
   * @returns True if music is playing
   */
  public isCurrentlyPlaying(): boolean {
    return this.shouldContinuePlaying && !this.isPaused;
  }

  /**
   * Check if music is paused
   * @returns True if music is paused
   */
  public isCurrentlyPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get the name of the currently playing track
   * @returns Track name or null if nothing is playing
   */
  public getCurrentTrack(): string | null {
    if (this.currentTrackIndex === -1) {
      return null;
    }
    const trackUrl = this.tracks[this.currentTrackIndex];
    // Extract filename from URL
    return trackUrl.split("/").pop()?.split("?")[0] || null;
  }
}

// Export singleton instance - auto-initializes on first import
export const musicService = MusicService.getInstance();
