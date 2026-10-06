/**
 * Stardew Valley Web Prototype - Audio System
 * Uses Web Audio API for 100% self-contained, zero-dependency retro sound effects and cozy country soundtrack.
 */

class SoundSystem {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.musicEnabled = false;
        this.musicInterval = null;
        this.musicStep = 0;
        this.masterVolume = 0.4;
        this.musicGain = null;
        this.sfxGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.masterVolume;
            this.sfxGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.masterVolume * 0.45;
            this.musicGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Helper: generate white noise buffer
    createNoiseBuffer(duration = 0.2) {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    playFootstep(surface = 'grass') {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(surface === 'dirt' ? 85 : 120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    playTill() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Low thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.16);

        // Gravelly noise scoop
        const noiseBuffer = this.createNoiseBuffer(0.12);
        if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(600, now);
            filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);

            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.2, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            noise.connect(filter);
            filter.connect(nGain);
            nGain.connect(this.sfxGain);
            noise.start(now);
        }
    }

    playWater() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;

        const noiseBuffer = this.createNoiseBuffer(0.28);
        if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(800, now + 0.28);
            filter.Q.value = 3;

            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.18, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            noise.connect(filter);
            filter.connect(nGain);
            nGain.connect(this.sfxGain);
            noise.start(now);
        }

        // Bubbling droplet blip
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.18);
        gain.gain.setValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + 0.05);
        osc.stop(now + 0.22);
    }

    playPlant() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.17);
    }

    playChop() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Wood impact thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.13);

        // Wood chip crackle
        const noiseBuffer = this.createNoiseBuffer(0.1);
        if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1500, now);

            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.2, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

            noise.connect(filter);
            filter.connect(nGain);
            nGain.connect(this.sfxGain);
            noise.start(now);
        }
    }

    playTreeFall() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Creaking crack
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.12;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(260 - i * 40, t);
            osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.1);
        }

        // Heavy ground crash
        const crashTime = now + 0.45;
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(90, crashTime);
        sub.frequency.exponentialRampToValueAtTime(25, crashTime + 0.3);
        subGain.gain.setValueAtTime(0.4, crashTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, crashTime + 0.3);
        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(crashTime);
        sub.stop(crashTime + 0.32);
    }

    playHarvest() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (classic happy Stardew harvest chime)

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.055;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    playAnimalPet() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        // Warm sweet heart chime
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.07;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    playChickenCluck() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 2; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.09;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(450 + (i * 70), t);
            osc.frequency.exponentialRampToValueAtTime(260, t + 0.07);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.08);
        }
    }

    playCoin() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playSelect() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    playEat() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.08;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220 + (i % 2) * 80, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.06);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.07);
        }
    }

    playTextLetter() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420 + Math.random() * 50, now);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    playPaper() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const noiseBuffer = this.createNoiseBuffer(0.18);
        if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(900, now);
            filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);

            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.18, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            noise.connect(filter);
            filter.connect(nGain);
            nGain.connect(this.sfxGain);
            noise.start(now);
        }
    }

    playDoor() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        // Heavy wooden door creak & latch thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.15);

        // Latch click
        const click = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        click.type = 'triangle';
        click.frequency.setValueAtTime(480, now + 0.08);
        click.frequency.exponentialRampToValueAtTime(240, now + 0.13);
        cGain.gain.setValueAtTime(0.12, now + 0.08);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        click.connect(cGain);
        cGain.connect(this.sfxGain);
        click.start(now + 0.08);
        click.stop(now + 0.15);
    }

    playCook() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        // Sizzling pan sound
        for (let i = 0; i < 4; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.06;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520 + Math.random() * 200, t);
            osc.frequency.exponentialRampToValueAtTime(260, t + 0.05);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.06);
        }
    }

    playFireplace() {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        // Warm crackling embers
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + i * 0.07;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(380 + Math.random() * 120, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.07);
        }
    }

    // Cozy Stardew Valley-inspired procedural theme music
    toggleMusic() {
        this.init();
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
        return this.musicEnabled;
    }

    startMusic() {
        if (this.musicInterval) clearInterval(this.musicInterval);
        this.musicStep = 0;

        // Charming pastoral arpeggio melody in C Major / G Major
        // [Pitch in Hz, type: 'lead'|'bass'|'chord']
        const melodyPattern = [
            // Measure 1: C Major (C - E - G - C)
            { f: 261.63, b: 130.81, dur: 0.35 },
            { f: 329.63, b: null,   dur: 0.30 },
            { f: 392.00, b: null,   dur: 0.30 },
            { f: 523.25, b: 130.81, dur: 0.40 },
            { f: 392.00, b: null,   dur: 0.30 },
            { f: 329.63, b: null,   dur: 0.30 },
            
            // Measure 2: G Major (G - B - D - G)
            { f: 392.00, b: 98.00,  dur: 0.35 },
            { f: 493.88, b: null,   dur: 0.30 },
            { f: 587.33, b: null,   dur: 0.30 },
            { f: 783.99, b: 98.00,  dur: 0.40 },
            { f: 587.33, b: null,   dur: 0.30 },
            { f: 493.88, b: null,   dur: 0.30 },

            // Measure 3: A Minor (A - C - E - A)
            { f: 440.00, b: 110.00, dur: 0.35 },
            { f: 523.25, b: null,   dur: 0.30 },
            { f: 659.25, b: null,   dur: 0.30 },
            { f: 880.00, b: 110.00, dur: 0.40 },
            { f: 659.25, b: null,   dur: 0.30 },
            { f: 523.25, b: null,   dur: 0.30 },

            // Measure 4: F Major (F - A - C - F)
            { f: 349.23, b: 87.31,  dur: 0.35 },
            { f: 440.00, b: null,   dur: 0.30 },
            { f: 523.25, b: null,   dur: 0.30 },
            { f: 698.46, b: 87.31,  dur: 0.40 },
            { f: 523.25, b: null,   dur: 0.30 },
            { f: 440.00, b: null,   dur: 0.30 }
        ];

        this.musicInterval = setInterval(() => {
            if (!this.musicEnabled || !this.ctx) return;
            const now = this.ctx.currentTime;
            const note = melodyPattern[this.musicStep % melodyPattern.length];

            // Melody Flute / Marimba synth
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.09, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.dur);

            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(now);
            osc.stop(now + note.dur + 0.05);

            // Warm Bass note
            if (note.b) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'sine';
                bOsc.frequency.setValueAtTime(note.b, now);

                bGain.gain.setValueAtTime(0, now);
                bGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

                bOsc.connect(bGain);
                bGain.connect(this.musicGain);
                bOsc.start(now);
                bOsc.stop(now + 0.75);
            }

            this.musicStep++;
        }, 340);
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

// Global audio singleton
window.gameAudio = new SoundSystem();
