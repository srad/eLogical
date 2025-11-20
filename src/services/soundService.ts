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
 * Uses audio pooling to allow overlapping sounds
 */
class SoundService {
  private static instance: SoundService;
  private audioFiles: Record<SoundType, string>;
  private defaultVolume: number = 0.7;
  private activeAudioInstances: HTMLAudioElement[] = [];

  private constructor() {
    this.audioFiles = {
      [SoundType.CORRECT]: correctSoundFile,
      [SoundType.WRONG]: wrongSoundFile,
      [SoundType.PARTY_HORN]: partyHornSoundFile,
      [SoundType.DICE]: diceSoundFile,
      [SoundType.CLICK]: clickSoundFile,
    };
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
   * Play a specific audio track
   * Creates a new Audio instance for each play to allow overlapping sounds
   * @param track - The audio track to play
   * @param options - Optional playback options
   */
  public async play(
    track: SoundType,
    options?: {
      volume?: number;
    }
  ): Promise<void> {
    const audioFile = this.audioFiles[track];
    if (!audioFile) {
      console.warn(`Audio track "${track}" not found`);
      return;
    }

    try {
      // Create a new Audio instance for this play
      const audio = new Audio(audioFile);
      audio.volume = options?.volume ?? this.defaultVolume;

      // Track active instance
      this.activeAudioInstances.push(audio);

      // Clean up when finished
      audio.addEventListener("ended", () => {
        const index = this.activeAudioInstances.indexOf(audio);
        if (index > -1) {
          this.activeAudioInstances.splice(index, 1);
        }
      });

      // Play the audio
      await audio.play();
    } catch (err) {
      console.warn(`Could not play audio track "${track}":`, err);
    }
  }

  /**
   * Stop all currently playing audio instances
   */
  public stopAll(): void {
    this.activeAudioInstances.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeAudioInstances = [];
  }

  /**
   * Set the default volume for all future audio playback
   * @param volume - Volume level (0.0 to 1.0)
   */
  public setDefaultVolume(volume: number): void {
    this.defaultVolume = Math.max(0, Math.min(1, volume));
    // Also update volume of currently playing instances
    this.activeAudioInstances.forEach((audio) => {
      audio.volume = this.defaultVolume;
    });
  }

  /**
   * Get the default volume level
   * @returns Current default volume level (0.0 to 1.0)
   */
  public getVolume(): number {
    return this.defaultVolume;
  }

  /**
   * Get the number of currently playing audio instances
   * @returns Number of active audio instances
   */
  public getActiveCount(): number {
    return this.activeAudioInstances.length;
  }
}

// Export singleton instance - auto-initializes on first import
export const soundService = SoundService.getInstance();
