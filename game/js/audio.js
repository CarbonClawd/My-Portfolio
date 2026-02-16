// Audio System - Sound Effects & Background Music using Web Audio API
class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.musicVolume = 0.25;
        this.sfxVolume = 0.4;
        this.currentMusic = null;
        this.currentMusicSource = null;
        this.musicBuffers = {};
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Generate a tone-based sound effect
    _playTone(freq, duration, type, volume, ramp, delay) {
        if (!this.initialized || !this.sfxEnabled) return;
        const t = this.ctx.currentTime + (delay || 0);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, t);
        if (ramp) osc.frequency.exponentialRampToValueAtTime(ramp, t + duration);
        gain.gain.setValueAtTime((volume || 0.3) * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + duration);
    }

    // Play noise burst (for hits, impacts)
    _playNoise(duration, volume, delay) {
        if (!this.initialized || !this.sfxEnabled) return;
        const t = this.ctx.currentTime + (delay || 0);
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime((volume || 0.3) * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(t);
    }

    // === SOUND EFFECTS ===

    playJump() {
        this._playTone(300, 0.15, 'square', 0.2, 600);
    }

    playDoubleJump() {
        this._playTone(400, 0.1, 'square', 0.2, 800);
        this._playTone(600, 0.12, 'sine', 0.15, 900, 0.05);
    }

    playPuckCollect() {
        this._playTone(800, 0.08, 'square', 0.2, 1200);
        this._playTone(1200, 0.1, 'sine', 0.15, 1600, 0.06);
    }

    playShot() {
        this._playNoise(0.08, 0.4);
        this._playTone(200, 0.12, 'sawtooth', 0.25, 80);
    }

    playGoalieHit() {
        this._playNoise(0.15, 0.5);
        this._playTone(150, 0.2, 'square', 0.3, 60);
        this._playTone(100, 0.25, 'sawtooth', 0.2, 40, 0.1);
    }

    playGoalieBlock() {
        this._playNoise(0.1, 0.3);
        this._playTone(300, 0.1, 'square', 0.2, 200);
    }

    playGoalieFreeze() {
        this._playTone(1000, 0.15, 'sine', 0.2, 2000);
        this._playTone(1500, 0.2, 'sine', 0.15, 2500, 0.1);
        this._playTone(2000, 0.25, 'sine', 0.1, 3000, 0.2);
    }

    playPowerUp() {
        for (let i = 0; i < 5; i++) {
            this._playTone(400 + i * 200, 0.12, 'sine', 0.2, 600 + i * 200, i * 0.06);
        }
    }

    playCombo(level) {
        const baseFreq = 500 + level * 100;
        this._playTone(baseFreq, 0.1, 'square', 0.25, baseFreq * 1.5);
        this._playTone(baseFreq * 1.2, 0.1, 'sine', 0.2, baseFreq * 1.8, 0.05);
    }

    playLevelComplete() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        for (let i = 0; i < notes.length; i++) {
            this._playTone(notes[i], 0.3, 'sine', 0.25, notes[i] * 1.01, i * 0.15);
            this._playTone(notes[i] * 0.5, 0.3, 'triangle', 0.15, notes[i] * 0.51, i * 0.15);
        }
    }

    playGameOver() {
        this._playTone(400, 0.3, 'sawtooth', 0.2, 200);
        this._playTone(300, 0.3, 'sawtooth', 0.2, 150, 0.25);
        this._playTone(200, 0.5, 'sawtooth', 0.25, 80, 0.5);
    }

    playWin() {
        // Triumphant fanfare
        const melody = [523, 659, 784, 1047, 784, 1047, 1319];
        for (let i = 0; i < melody.length; i++) {
            this._playTone(melody[i], 0.25, 'sine', 0.2, melody[i] * 1.01, i * 0.12);
            this._playTone(melody[i] * 0.5, 0.25, 'triangle', 0.1, melody[i] * 0.51, i * 0.12);
        }
    }

    playHurt() {
        this._playNoise(0.12, 0.4);
        this._playTone(200, 0.2, 'sawtooth', 0.3, 80);
    }

    playDash() {
        this._playNoise(0.06, 0.25);
        this._playTone(500, 0.1, 'sawtooth', 0.2, 800);
    }

    playCheckpoint() {
        this._playTone(600, 0.15, 'sine', 0.2, 900);
        this._playTone(900, 0.2, 'sine', 0.15, 1200, 0.1);
    }

    playMenuSelect() {
        this._playTone(800, 0.08, 'square', 0.15, 1000);
    }

    playNewShot() {
        this._playTone(600, 0.1, 'square', 0.2, 1000);
        this._playTone(1000, 0.15, 'sine', 0.15, 1400, 0.08);
    }

    playWaterSquirt() {
        this._playNoise(0.1, 0.2);
        this._playTone(800, 0.15, 'sine', 0.15, 1200);
    }

    playBossHit() {
        this._playNoise(0.2, 0.5);
        this._playTone(120, 0.3, 'sawtooth', 0.35, 50);
        this._playTone(80, 0.4, 'square', 0.2, 30, 0.15);
    }

    playBossDefeat() {
        for (let i = 0; i < 8; i++) {
            this._playTone(200 + i * 150, 0.2, 'sine', 0.2, 400 + i * 150, i * 0.1);
            this._playNoise(0.1, 0.15, i * 0.1);
        }
    }

    // === BACKGROUND MUSIC ===
    // Procedurally generated looping music

    _createMusicBuffer(notePattern, tempo, waveType, bassPattern) {
        if (!this.initialized) return null;
        const bps = tempo / 60; // beats per second
        const beatDuration = 1 / bps;
        const totalBeats = notePattern.length;
        const duration = totalBeats * beatDuration;
        const sampleRate = this.ctx.sampleRate;
        const bufferLength = Math.floor(sampleRate * duration);
        const buffer = this.ctx.createBuffer(2, bufferLength, sampleRate);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let beat = 0; beat < totalBeats; beat++) {
            const freq = notePattern[beat];
            const bassFreq = bassPattern ? bassPattern[beat % bassPattern.length] : freq * 0.5;
            if (freq === 0) continue;

            const startSample = Math.floor(beat * beatDuration * sampleRate);
            const noteSamples = Math.floor(beatDuration * 0.85 * sampleRate);

            for (let i = 0; i < noteSamples; i++) {
                const t = i / sampleRate;
                const envelope = Math.min(1, i / (sampleRate * 0.01)) * Math.max(0, 1 - i / noteSamples);
                const idx = startSample + i;
                if (idx >= bufferLength) break;

                // Melody
                let sample = 0;
                if (waveType === 'sine') {
                    sample = Math.sin(2 * Math.PI * freq * t) * 0.3;
                } else if (waveType === 'square') {
                    sample = (Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1) * 0.15;
                } else {
                    sample = Math.sin(2 * Math.PI * freq * t) * 0.25 + Math.sin(4 * Math.PI * freq * t) * 0.1;
                }

                // Bass
                const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.15 * envelope;

                // Subtle pad
                const pad = Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.05 * envelope;

                const val = (sample * envelope + bass + pad) * 0.5;
                left[idx] += val;
                right[idx] += val * 0.9;
            }
        }

        return buffer;
    }

    startMusic(levelNum) {
        if (!this.initialized || !this.musicEnabled) return;
        this.stopMusic();

        let buffer;
        const key = 'level' + levelNum;

        if (!this.musicBuffers[key]) {
            if (levelNum === 1) {
                // Level 1: Upbeat, simple hockey arena feel
                const melody = [
                    262, 330, 392, 330, 262, 330, 392, 523,
                    440, 392, 330, 262, 330, 392, 330, 262,
                    294, 349, 440, 349, 294, 349, 440, 523,
                    392, 349, 294, 262, 294, 330, 392, 330
                ];
                const bass = [131, 131, 165, 165, 147, 147, 131, 131];
                this.musicBuffers[key] = this._createMusicBuffer(melody, 140, 'square', bass);
            } else if (levelNum === 2) {
                // Level 2: More intense, playoff energy
                const melody = [
                    330, 392, 494, 392, 330, 392, 494, 659,
                    523, 494, 440, 392, 440, 494, 523, 494,
                    349, 440, 523, 440, 349, 440, 523, 659,
                    523, 440, 392, 349, 392, 440, 494, 440
                ];
                const bass = [165, 165, 196, 196, 175, 175, 165, 165];
                this.musicBuffers[key] = this._createMusicBuffer(melody, 155, 'triangle', bass);
            } else {
                // Level 3: Epic finals music
                const melody = [
                    392, 494, 587, 494, 392, 494, 587, 784,
                    659, 587, 494, 392, 494, 587, 659, 784,
                    440, 523, 659, 523, 440, 523, 659, 784,
                    659, 587, 523, 440, 494, 587, 659, 784
                ];
                const bass = [196, 196, 220, 220, 196, 196, 247, 247];
                this.musicBuffers[key] = this._createMusicBuffer(melody, 165, 'sine', bass);
            }
        }

        buffer = this.musicBuffers[key];
        if (!buffer) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);

        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();

        this.currentMusicSource = source;
        this.currentMusicGain = gain;
        this.currentMusic = key;
    }

    stopMusic() {
        if (this.currentMusicSource) {
            try {
                this.currentMusicSource.stop();
            } catch (e) { }
            this.currentMusicSource = null;
            this.currentMusicGain = null;
            this.currentMusic = null;
        }
    }

    fadeOutMusic(duration) {
        if (this.currentMusicGain && this.initialized) {
            const t = this.ctx.currentTime;
            this.currentMusicGain.gain.setValueAtTime(this.musicVolume, t);
            this.currentMusicGain.gain.linearRampToValueAtTime(0, t + (duration || 1));
            setTimeout(() => this.stopMusic(), (duration || 1) * 1000 + 100);
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled) {
            this.stopMusic();
        }
        return this.musicEnabled;
    }

    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }
}

// Global audio instance
const audio = new AudioManager();
