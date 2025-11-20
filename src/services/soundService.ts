import correctSoundFile from "/sounds/correct.mp3";
import wrongSoundFile from "/sounds/wrong.mp3";
import partyHornSoundFile from "/sounds/party-horn.mp3";
import diceSoundFile from "/sounds/dice.mp3";
import clickSoundFile from "/sounds/click-button.mp3";

/**
 * Enum of all available audio files in the application
 */
export enum SoundType {
  CORRECT = "correct",
  WRONG = "wrong",
  PARTY_HORN = "partyHorn",
  DICE = "dice",
  CLICK = "click",
}

/**
 * Audio service for managing and playing sounds throughout the application
 * Implemented as a singleton that auto-initializes on first import
 */
class SoundService {
  private static instance: SoundService;
  private audioMap: Map<SoundType, HTMLAudioElement>;
  private loadedMap: Map<SoundType, boolean>;
  private defaultVolume: number = 0.7;

  private constructor() {
    this.audioMap = new Map();
    this.loadedMap = new Map();
    this.initializeAudio();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  /**
   * Initialize all audio files with preloading
   */
  private initializeAudio(): void {
    // Map audio tracks to their file paths
    const audioFiles: Record<SoundType, string> = {
      [SoundType.CORRECT]: correctSoundFile,
      [SoundType.WRONG]: wrongSoundFile,
      [SoundType.PARTY_HORN]: partyHornSoundFile,
      [SoundType.DICE]: diceSoundFile,
      [SoundType.CLICK]: clickSoundFile,
    };

    // Create and preload each audio element
    Object.entries(audioFiles).forEach(([track, file]) => {
      const audio = new Audio(file);
      audio.volume = this.defaultVolume;
      audio.preload = "auto";

      // Track when audio is loaded
      audio.addEventListener(
        "canplaythrough",
        () => {
          this.loadedMap.set(track as SoundType, true);
        },
        { once: true }
      );

      audio.load();
      this.audioMap.set(track as SoundType, audio);
      this.loadedMap.set(track as SoundType, false);
    });
  }

  /**
   * Play a specific audio track
   * @param track - The audio track to play
   * @param options - Optional playback options
   */
  public async play(
    track: SoundType,
    options?: {
      volume?: number;
      restart?: boolean;
    }
  ): Promise<void> {
    const audio = this.audioMap.get(track);
    if (!audio) {
      console.warn(`Audio track "${track}" not found`);
      return;
    }

    // Set volume if specified
    if (options?.volume !== undefined) {
      audio.volume = Math.max(0, Math.min(1, options.volume));
    }

    // Restart from beginning if specified or already playing
    if (options?.restart !== false) {
      audio.currentTime = 0;
    }

    try {
      // If audio is loaded, play immediately
      if (this.loadedMap.get(track)) {
        await audio.play();
      } else {
        // Wait for audio to be ready
        await new Promise<void>((resolve, reject) => {
          const playWhenReady = async () => {
            try {
              await audio.play();
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          audio.addEventListener("canplaythrough", playWhenReady, {
            once: true,
          });
        });
      }
    } catch (err) {
      console.warn(`Could not play audio track "${track}":`, err);
    }
  }

  /**
   * Stop a specific audio track
   * @param track - The audio track to stop
   */
  public stop(track: SoundType): void {
    const audio = this.audioMap.get(track);
    if (!audio) {
      console.warn(`Audio track "${track}" not found`);
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  }

  /**
   * Stop all currently playing audio
   */
  public stopAll(): void {
    this.audioMap.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Set volume for a specific audio track
   * @param track - The audio track to modify
   * @param volume - Volume level (0.0 to 1.0)
   */
  public setVolume(track: SoundType, volume: number): void {
    const audio = this.audioMap.get(track);
    if (!audio) {
      console.warn(`Audio track "${track}" not found`);
      return;
    }

    audio.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set the default volume for all audio tracks
   * @param volume - Volume level (0.0 to 1.0)
   */
  public setDefaultVolume(volume: number): void {
    this.defaultVolume = Math.max(0, Math.min(1, volume));
    this.audioMap.forEach((audio) => {
      audio.volume = this.defaultVolume;
    });
  }

  /**
   * Get the current volume of a specific audio track
   * @param track - The audio track to query
   * @returns Current volume level (0.0 to 1.0)
   */
  public getVolume(track: SoundType): number {
    const audio = this.audioMap.get(track);
    return audio?.volume ?? this.defaultVolume;
  }

  /**
   * Check if an audio track is currently playing
   * @param track - The audio track to check
   * @returns True if the audio is playing
   */
  public isPlaying(track: SoundType): boolean {
    const audio = this.audioMap.get(track);
    return audio ? !audio.paused : false;
  }

  /**
   * Check if an audio track is loaded and ready to play
   * @param track - The audio track to check
   * @returns True if the audio is loaded
   */
  public isLoaded(track: SoundType): boolean {
    return this.loadedMap.get(track) ?? false;
  }
}

// Export singleton instance - auto-initializes on first import
export const soundService = SoundService.getInstance();
