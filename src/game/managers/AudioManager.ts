import Phaser from 'phaser';

export class AudioManager {
    private scene: Phaser.Scene;
    private music: Phaser.Sound.BaseSound;
    private isMuted: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.loadAudio();
    }

    private loadAudio() {
        this.scene.load.audio('musica', 'https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/audio/musica.ogg');
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

    setVolume(volume: number) {
        if (this.music) {
            this.music.setVolume(volume);
        }
    }

    isMusicMuted(): boolean {
        return this.isMuted;
    }
} 