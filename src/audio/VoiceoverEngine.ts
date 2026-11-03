/**
 * VoiceoverEngine - Pedagogical Speech Synthesis & Audio Guidance Engine
 * Uses the Web Speech API to provide university-level laboratory instructor
 * spoken guidance, technique mistake warnings, and endpoint announcements.
 */

type SubtitleListener = (text: string) => void;

class VoiceoverEngine {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isMuted = false;
  private subtitleListeners: Set<SubtitleListener> = new Set();
  private subtitleTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoice();
      }
      const savedMute = localStorage.getItem('praxisim_voice_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer clear, articulate English voices
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Natural') ||
          v.name.includes('David') ||
          v.name.includes('Karen'))
    );
    this.voice = preferred || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }

  public subscribeSubtitles(listener: SubtitleListener) {
    this.subtitleListeners.add(listener);
    return () => {
      this.subtitleListeners.delete(listener);
    };
  }

  private emitSubtitle(text: string) {
    if (this.subtitleTimeout) {
      clearTimeout(this.subtitleTimeout);
    }
    this.subtitleListeners.forEach((fn) => fn(text));
    this.subtitleTimeout = setTimeout(() => {
      this.subtitleListeners.forEach((fn) => fn(''));
    }, 6500);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('praxisim_voice_muted', String(muted));
    }
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public speak(text: string, priority: 'normal' | 'high' = 'normal') {
    this.emitSubtitle(text);

    if (this.isMuted || !this.synth) return;

    if (priority === 'high') {
      this.synth.cancel(); // Interrupt current speech for critical alerts
    } else if (this.synth.speaking) {
      return; // Do not overlap normal speech
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.02;
      utterance.volume = 0.85;
      utterance.onerror = () => {};

      this.synth.speak(utterance);
    } catch {
      // Headless / non-TTS environment safe fallback
    }
  }

  /**
   * Spoken guidance for each titration step
   */
  public speakStepGuidance(stepIndex: number) {
    switch (stepIndex) {
      case 0:
        this.speak(
          'Step one: Begin by aspirating 25 milliliters of hydrochloric acid analyte using the volumetric pipette. Squeeze Valve A to clear air, then use Valve S to draw liquid past the graduation line.',
          'normal'
        );
        break;
      case 1:
        this.speak(
          'Step two: Transfer the pipette over the Erlenmeyer flask. Press Valve E to drain, holding the tip against the inner flask wall for complete delivery.',
          'normal'
        );
        break;
      case 2:
        this.speak(
          'Step three: Use the deionized water wash bottle to rinse down any acid droplets adhering to the flask neck into the solution.',
          'normal'
        );
        break;
      case 3:
        this.speak(
          'Step four: Add three drops of phenolphthalein indicator solution into the Erlenmeyer flask.',
          'normal'
        );
        break;
      case 4:
        this.speak(
          'Step five: Mount the prepared Erlenmeyer flask onto the white contrast tile beneath the burette tip.',
          'normal'
        );
        break;
      case 5:
        this.speak(
          'Step six: Begin titrating with sodium hydroxide. Open the stopcock rapidly at first, then transition to dropwise as you approach the faint pink endpoint.',
          'normal'
        );
        break;
      case 6:
        this.speak(
          'Congratulations! You have determined the equivalence point. Record the delivered volume and confirm your stoichiometry.',
          'high'
        );
        break;
    }
  }

  /**
   * Spoken pedagogical error / technique warnings
   */
  public speakWarning(warningKey: string) {
    switch (warningKey) {
      case 'missing_valve_a':
        this.speak('Technique error: You must squeeze Valve A to discharge air before attempting suction with Valve S.', 'high');
        break;
      case 'over_titrated':
        this.speak('Warning: Over-titration detected. The solution has turned deep magenta, exceeding the equivalence window.', 'high');
        break;
      case 'tip_bubble':
        this.speak('Caution: Purge the air bubble from the burette delivery tip before beginning titration.', 'high');
        break;
      case 'near_endpoint':
        this.speak('Notice: Temporary pink blushes are appearing upon mixing. Slow down your flow to single drops.', 'high');
        break;
      case 'parallax_error':
        this.speak('Parallax warning: Align your eye level directly with the bottom of the meniscus to avoid reading errors.', 'high');
        break;
    }
  }
}

export const voiceoverEngine = new VoiceoverEngine();
