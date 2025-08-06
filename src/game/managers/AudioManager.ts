import Phaser from 'phaser';

export class AudioManager {
    private music: Phaser.Sound.BaseSound | null = null;
    private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
    private isMuted: boolean = false;

    constructor(private scene: Phaser.Scene) {
        this.loadSounds();
    }

    private loadSounds() {
        // Carrega os sons
        this.scene.load.audio('success', '/geosantos/assets/audio/sucess.mp3');
        this.scene.load.audio('error', '/geosantos/assets/audio/error.mp3');
        this.scene.load.audio('background', '/geosantos/assets/audio/game_music.mp3');
    }

    public playSound(key: string) {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.play();
        }
    }

    public setMusicVolume(volume: number) {
        if (this.music) {
            (this.music as Phaser.Sound.WebAudioSound).setVolume(volume);
        }
    }

    playMusic() {
        if (!this.music) {
            this.music = this.scene.sound.add('musica', { loop: true });
        }
        if (!this.isMuted) {
            this.music.play();
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.stop();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopMusic();
        } else {
            this.playMusic();
        }
    }

    isMusicMuted(): boolean {
        return this.isMuted;
    }
} 