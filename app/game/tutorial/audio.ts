import type { GameEffect } from "./model";

/** One optional context, unlocked by a user gesture. No background soundtrack. */
export class TutorialAudio {
  private context: AudioContext | null = null;
  private voices = 0;
  unlock() {
    try { this.context ??= new AudioContext(); void this.context.resume().catch(() => {}); } catch { /* Audio is optional. */ }
  }
  close() { if (this.context) void this.context.close().catch(() => {}); this.context = null; }
  private tone(frequency: number, end: number, duration: number, type: OscillatorType = "sine", delay = 0, gain = .035) {
    const context = this.context;
    if (!context || context.state !== "running" || this.voices >= 10) return;
    const start = context.currentTime + delay, oscillator = context.createOscillator(), volume = context.createGain();
    this.voices++;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start); oscillator.frequency.exponentialRampToValueAtTime(end, start + duration);
    volume.gain.setValueAtTime(0, start); volume.gain.linearRampToValueAtTime(gain, start + .008);
    volume.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(volume); volume.connect(context.destination);
    oscillator.start(start); oscillator.stop(start + duration + .015);
    oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); this.voices--; };
  }
  play(effect: GameEffect) {
    switch (effect.kind) {
      case "pulse": this.tone(720, 420, .12, "triangle", 0, .016); break;
      case "dodge": this.tone(190, 65, .15, "triangle", 0, .023); break;
      case "observe": this.tone(330, 660, .32, "sine", 0, .023); break;
      case "mirror": this.tone(240, 160, .065, "triangle"); break;
      case "bell": { const note = [523.25, 659.25, 783.99][effect.detail ?? 0]; this.tone(note, note, .5); break; }
      case "shield": this.tone(160, 100, .12, "triangle"); break;
      case "hit": this.tone(880, 660, .19); break;
      case "damage": this.tone(150, 70, .22, "triangle"); break;
      case "blast": this.tone(90, 42, .2, "triangle", 0, .024); break;
      case "collect": case "aligned": case "droneDown": case "complete": case "checkpoint":
        [440, 554.37, 659.25].forEach((note, i) => this.tone(note, note, .26, "sine", i * .075, .025)); break;
    }
  }
}
