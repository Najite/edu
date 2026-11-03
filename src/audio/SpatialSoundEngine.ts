/**
 * SpatialSoundEngine - Web Audio API procedural acoustic engine for PraxiLabs simulation
 * Synthesizes photorealistic fluid streams, droplet plops, borosilicate glass resonance,
 * stopcock friction, and pneumatic pipetting bulb acoustics with zero external MP3 dependencies.
 */

class SpatialSoundEngine {
  private ctx: AudioContext | null = null;
  private streamGainNode: GainNode | null = null;
  private streamNoiseNode: AudioBufferSourceNode | null = null;
  private streamFilter: BiquadFilterNode | null = null;
  private streamPanner: PannerNode | null = null;
  private isStreamPlaying = false;
  private isMuted = false;

  // Stirrer / Swirling Acoustic Nodes
  private stirrerOsc1: OscillatorNode | null = null;
  private stirrerOsc2: OscillatorNode | null = null;
  private stirrerNoise: AudioBufferSourceNode | null = null;
  private stirrerFilter: BiquadFilterNode | null = null;
  private stirrerLfo: OscillatorNode | null = null;
  private stirrerGain: GainNode | null = null;
  private isStirrerPlaying = false;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public resume() {
    this.initContext();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isStreamPlaying) {
      this.stopStream();
    }
  }

  /**
   * Updates camera listener position and orientation in Web Audio 3D space
   */
  public updateListener(
    posX: number, posY: number, posZ: number,
    forwardX: number, forwardY: number, forwardZ: number,
    upX: number, upY: number, upZ: number
  ) {
    const ctx = this.ctx;
    if (!ctx) return;
    const listener = ctx.listener;
    if (listener.positionX) {
      listener.positionX.setValueAtTime(posX, ctx.currentTime);
      listener.positionY.setValueAtTime(posY, ctx.currentTime);
      listener.positionZ.setValueAtTime(posZ, ctx.currentTime);
      listener.forwardX.setValueAtTime(forwardX, ctx.currentTime);
      listener.forwardY.setValueAtTime(forwardY, ctx.currentTime);
      listener.forwardZ.setValueAtTime(forwardZ, ctx.currentTime);
      listener.upX.setValueAtTime(upX, ctx.currentTime);
      listener.upY.setValueAtTime(upY, ctx.currentTime);
      listener.upZ.setValueAtTime(upZ, ctx.currentTime);
    } else {
      // Fallback for older Web Audio implementations
      listener.setPosition(posX, posY, posZ);
      listener.setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ);
    }
  }

  private createPanner(pos: [number, number, number]): PannerNode | null {
    const ctx = this.initContext();
    if (!ctx) return null;
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 0.5;
    panner.maxDistance = 10;
    panner.rolloffFactor = 1.2;
    panner.coneInnerAngle = 360;
    if (panner.positionX) {
      panner.positionX.setValueAtTime(pos[0], ctx.currentTime);
      panner.positionY.setValueAtTime(pos[1], ctx.currentTime);
      panner.positionZ.setValueAtTime(pos[2], ctx.currentTime);
    } else {
      panner.setPosition(pos[0], pos[1], pos[2]);
    }
    return panner;
  }

  /**
   * Synthesize discrete droplet plop impacting liquid surface
   * Fast downward frequency sweep + damped bubble resonance
   */
  public playDropPlop(pos: [number, number, number] = [0, 0.05, 0.18], volume = 0.28) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const panner = this.createPanner(pos);

    // Primary bubble cavity resonator oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pitch sweep: characteristic droplet "plop" (high to low sweep with resonant formant)
    const startFreq = 1100 + Math.random() * 200;
    const endFreq = 420 + Math.random() * 60;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.038);

    // Fast attack, exponential decay (total 45ms)
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

    // Subtle impact click transient (short burst of filtered noise)
    const clickBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.008), ctx.sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    for (let i = 0; i < clickData.length; i++) {
      clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.002));
    }
    const clickSource = ctx.createBufferSource();
    clickSource.buffer = clickBuffer;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(volume * 0.5, t);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.008);

    // Routing
    if (panner) {
      osc.connect(gain);
      gain.connect(panner);
      clickSource.connect(clickGain);
      clickGain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      osc.connect(gain);
      gain.connect(ctx.destination);
      clickSource.connect(clickGain);
      clickGain.connect(ctx.destination);
    }

    osc.start(t);
    osc.stop(t + 0.05);
    clickSource.start(t);
  }

  /**
   * Continuous laminar fluid stream sound generator
   */
  public updateStream(flowRateMlPerSec: number, pos: [number, number, number] = [0, 0.05, 0.18]) {
    if (this.isMuted || flowRateMlPerSec <= 0.05) {
      this.stopStream();
      return;
    }

    const ctx = this.initContext();
    if (!ctx) return;

    if (!this.isStreamPlaying) {
      this.startStream(pos);
    }

    if (this.streamGainNode && this.streamFilter) {
      const t = ctx.currentTime;
      // Scale gain from 0.05 to 0.4 based on flow rate (0.2 to 2.0 mL/s)
      const targetGain = Math.min(0.45, Math.max(0.05, (flowRateMlPerSec / 2.0) * 0.4));
      this.streamGainNode.gain.cancelScheduledValues(t);
      this.streamGainNode.gain.linearRampToValueAtTime(targetGain, t + 0.05);

      // Low pass filter frequency increases with flow turbulence (800 Hz to 2400 Hz)
      const targetCutoff = 800 + Math.min(1600, (flowRateMlPerSec / 2.0) * 1600);
      this.streamFilter.frequency.cancelScheduledValues(t);
      this.streamFilter.frequency.linearRampToValueAtTime(targetCutoff, t + 0.05);
    }
  }

  private startStream(pos: [number, number, number]) {
    const ctx = this.initContext();
    if (!ctx || this.isStreamPlaying) return;

    // Generate looping pinkish noise buffer (2 seconds loop)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.1243690;
      b2 = 0.57000 * b2 + white * 0.4508790;
      output[i] = (b0 + b1 + b2) * 0.15;
    }

    this.streamNoiseNode = ctx.createBufferSource();
    this.streamNoiseNode.buffer = noiseBuffer;
    this.streamNoiseNode.loop = true;

    this.streamFilter = ctx.createBiquadFilter();
    this.streamFilter.type = 'lowpass';
    this.streamFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    this.streamFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    this.streamGainNode = ctx.createGain();
    this.streamGainNode.gain.setValueAtTime(0.001, ctx.currentTime);

    this.streamPanner = this.createPanner(pos);

    if (this.streamPanner) {
      this.streamNoiseNode.connect(this.streamFilter);
      this.streamFilter.connect(this.streamGainNode);
      this.streamGainNode.connect(this.streamPanner);
      this.streamPanner.connect(ctx.destination);
    } else {
      this.streamNoiseNode.connect(this.streamFilter);
      this.streamFilter.connect(this.streamGainNode);
      this.streamGainNode.connect(ctx.destination);
    }

    this.streamNoiseNode.start();
    this.isStreamPlaying = true;
  }

  public stopStream() {
    if (!this.isStreamPlaying) return;
    if (this.streamGainNode && this.ctx) {
      const t = this.ctx.currentTime;
      this.streamGainNode.gain.cancelScheduledValues(t);
      this.streamGainNode.gain.linearRampToValueAtTime(0.0001, t + 0.08);
      setTimeout(() => {
        try {
          this.streamNoiseNode?.stop();
          this.streamNoiseNode?.disconnect();
          this.streamFilter?.disconnect();
          this.streamGainNode?.disconnect();
          this.streamPanner?.disconnect();
        } catch {
          // ignore
        }
        this.streamNoiseNode = null;
        this.streamFilter = null;
        this.streamGainNode = null;
        this.streamPanner = null;
        this.isStreamPlaying = false;
      }, 90);
    } else {
      this.isStreamPlaying = false;
    }
  }

  /**
   * Borosilicate glass collision / resonant chime
   * High-Q modal resonators at glass vibrational modes
   */
  public playGlassClink(pos: [number, number, number] = [0, 0.05, 0.18], intensity = 0.35) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const panner = this.createPanner(pos);

    // Borosilicate modal modes: ~2450 Hz, 4920 Hz, 7840 Hz
    const modes = [2450, 4920, 7840];
    const decayTimes = [0.18, 0.12, 0.07];
    const amplitudes = [0.6, 0.35, 0.2];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(intensity, t);

    modes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * (0.98 + Math.random() * 0.04), t);

      oscGain.gain.setValueAtTime(0.0001, t);
      oscGain.gain.linearRampToValueAtTime(amplitudes[idx], t + 0.001);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + decayTimes[idx]);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(t);
      osc.stop(t + decayTimes[idx] + 0.01);
    });

    if (panner) {
      masterGain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      masterGain.connect(ctx.destination);
    }
  }

  /**
   * Stopcock rotary friction sound (creak / PTFE turn)
   */
  public playStopcockCreak(pos: [number, number, number] = [0, 0.45, 0.18]) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const panner = this.createPanner(pos);

    // Friction transient: short burst of filtered noise with rising resonance
    const dur = 0.06;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(3.5, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);

    if (panner) {
      gain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }

    noise.start(t);
  }

  /**
   * Pipette bulb pneumatic squeeze / release sound (valves A, S, E)
   */
  public playBulbValve(valve: 'A' | 'S' | 'E', pos: [number, number, number] = [-0.25, 0.45, 0.28]) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const panner = this.createPanner(pos);

    const dur = valve === 'A' ? 0.12 : valve === 'S' ? 0.08 : 0.06;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const centerFreq = valve === 'A' ? 650 : valve === 'S' ? 1200 : 950;
    filter.frequency.setValueAtTime(centerFreq, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);

    if (panner) {
      gain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }

    noise.start(t);
  }

  /**
   * Wash bottle squirt jet sound
   */
  public playWashBottleSquirt(pos: [number, number, number] = [-0.15, 0.25, 0.28]) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const panner = this.createPanner(pos);

    const dur = 0.25;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(1200, t + dur);
    filter.Q.setValueAtTime(2.2, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);

    if (panner) {
      gain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }

    noise.start(t);
  }

  /**
   * Harmonious resonant chord for endpoint completion
   */
  public playSuccessChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5 major arpeggio
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.95);
    });
  }

  /**
   * Magnetic Stirrer & Liquid Swirl Acoustic Synthesizer
   * 60Hz/120Hz motor hum + 3.2Hz LFO-modulated liquid sloshing vortex
   */
  public startStirrer(pos: [number, number, number] = [0, 0.02, 0.18]) {
    if (this.isMuted || this.isStirrerPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const panner = this.createPanner(pos);

    // Master stirrer gain
    this.stirrerGain = ctx.createGain();
    this.stirrerGain.gain.setValueAtTime(0.001, t);
    this.stirrerGain.gain.linearRampToValueAtTime(0.16, t + 0.2);

    // 1. Motor 60 Hz hum oscillator
    this.stirrerOsc1 = ctx.createOscillator();
    this.stirrerOsc1.type = 'sine';
    this.stirrerOsc1.frequency.setValueAtTime(60, t);

    // 2. Motor 120 Hz harmonic
    this.stirrerOsc2 = ctx.createOscillator();
    this.stirrerOsc2.type = 'triangle';
    this.stirrerOsc2.frequency.setValueAtTime(120, t);

    const motorMixGain = ctx.createGain();
    motorMixGain.gain.setValueAtTime(0.08, t);
    this.stirrerOsc1.connect(motorMixGain);
    this.stirrerOsc2.connect(motorMixGain);
    motorMixGain.connect(this.stirrerGain);

    // 3. Fluid vortex sloshing noise (modulated by 3.2 Hz LFO)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }

    this.stirrerNoise = ctx.createBufferSource();
    this.stirrerNoise.buffer = noiseBuffer;
    this.stirrerNoise.loop = true;

    this.stirrerFilter = ctx.createBiquadFilter();
    this.stirrerFilter.type = 'bandpass';
    this.stirrerFilter.frequency.setValueAtTime(650, t);
    this.stirrerFilter.Q.setValueAtTime(2.5, t);

    const sloshGain = ctx.createGain();
    sloshGain.gain.setValueAtTime(0.12, t);

    // 3.2 Hz LFO for rotational slosh modulation
    this.stirrerLfo = ctx.createOscillator();
    this.stirrerLfo.type = 'sine';
    this.stirrerLfo.frequency.setValueAtTime(3.2, t);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.08, t);
    this.stirrerLfo.connect(lfoGain);
    lfoGain.connect(sloshGain.gain);

    this.stirrerNoise.connect(this.stirrerFilter);
    this.stirrerFilter.connect(sloshGain);
    sloshGain.connect(this.stirrerGain);

    if (panner) {
      this.stirrerGain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      this.stirrerGain.connect(ctx.destination);
    }

    this.stirrerOsc1.start(t);
    this.stirrerOsc2.start(t);
    this.stirrerNoise.start(t);
    this.stirrerLfo.start(t);
    this.isStirrerPlaying = true;
  }

  public stopStirrer() {
    if (!this.isStirrerPlaying || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.stirrerGain) {
      this.stirrerGain.gain.cancelScheduledValues(t);
      this.stirrerGain.gain.linearRampToValueAtTime(0.0001, t + 0.15);
    }
    setTimeout(() => {
      try {
        this.stirrerOsc1?.stop();
        this.stirrerOsc2?.stop();
        this.stirrerNoise?.stop();
        this.stirrerLfo?.stop();
        this.stirrerOsc1?.disconnect();
        this.stirrerOsc2?.disconnect();
        this.stirrerNoise?.disconnect();
        this.stirrerLfo?.disconnect();
        this.stirrerGain?.disconnect();
      } catch {
        // ignore
      }
      this.stirrerOsc1 = null;
      this.stirrerOsc2 = null;
      this.stirrerNoise = null;
      this.stirrerLfo = null;
      this.stirrerGain = null;
      this.isStirrerPlaying = false;
    }, 160);
  }

  /**
   * Burette Tip Air-Bubble Purge sound
   * Rapid liquid discharge + air bubble escape pop
   */
  public playBubblePurge(pos: [number, number, number] = [0, 0.15, 0.18]) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const panner = this.createPanner(pos);

    // Air pop oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }

    osc.start(t);
    osc.stop(t + 0.13);
  }
}

export const soundEngine = new SpatialSoundEngine();

