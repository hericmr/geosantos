import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../../constants/game';

export class UIManager {
    private scene: Phaser.Scene;
    private textoPontuacao!: Phaser.GameObjects.Text;
    private textoTempo!: Phaser.GameObjects.Text;
    private textoBairro!: Phaser.GameObjects.Text;
    private particulasAcerto!: Phaser.GameObjects.Particles.ParticleEmitter;
    private particulasErro!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initializeUI();
        this.initializeParticles();
    }

    private initializeUI() {
        // Adicionar título
        this.scene.add.text(this.scene.cameras.main.centerX, 50, 'O CAIÇARA', GAME_CONSTANTS.TEXT_STYLES.TITLE)
            .setOrigin(0.5);

        // Criar textos de interface
        this.textoPontuacao = this.scene.add.text(10, 10, 'Pontuação: 0', GAME_CONSTANTS.TEXT_STYLES.SCORE);
        this.textoTempo = this.scene.add.text(10, 522, 'Tempo: 10.00', GAME_CONSTANTS.TEXT_STYLES.TIME);

        // Criar caixa de texto inferior
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(GAME_CONSTANTS.COLORS.BACKGROUND, 0.8);
        graphics.fillRect(0, this.scene.cameras.main.height - 180, this.scene.cameras.main.width, 180);
        graphics.lineStyle(3, GAME_CONSTANTS.COLORS.BORDER);
        graphics.strokeRect(0, this.scene.cameras.main.height - 180, this.scene.cameras.main.width, 180);
    }

    private initializeParticles() {
        const baseConfig = {
            ...GAME_CONSTANTS.PARTICLE_CONFIG,
            particleClass: Phaser.GameObjects.Particles.Particle
        };

        this.particulasAcerto = this.scene.add.particles(0, 0, 'particula', {
            ...baseConfig,
            tint: GAME_CONSTANTS.COLORS.SUCCESS
        });
        this.particulasAcerto.stop();

        this.particulasErro = this.scene.add.particles(0, 0, 'particula', {
            ...baseConfig,
            tint: GAME_CONSTANTS.COLORS.ERROR
        });
        this.particulasErro.stop();
    }

    updateScore(score: number) {
        this.textoPontuacao.setText(`Pontuação: ${score}`);
    }

    updateTime(time: number) {
        this.textoTempo.setText(`Tempo restante: ${time.toFixed(2)}`);
        this.updateTimeBar(time);
    }

    private updateTimeBar(time: number) {
        const graphics = this.scene.add.graphics();
        const width = (time / GAME_CONSTANTS.INITIAL_TIME) * this.scene.cameras.main.width;

        graphics.clear();
        graphics.fillStyle(0x333333, 0.5);
        graphics.fillRect(0, 502, this.scene.cameras.main.width, 75);

        graphics.fillStyle(time > GAME_CONSTANTS.WARNING_TIME ? GAME_CONSTANTS.COLORS.SUCCESS : GAME_CONSTANTS.COLORS.ERROR);
        graphics.fillRect(0, 502, width, 75);

        graphics.lineStyle(2, GAME_CONSTANTS.COLORS.TEXT, 0.3);
        graphics.strokeRect(0, 502, this.scene.cameras.main.width, 75);

        if (time <= GAME_CONSTANTS.CRITICAL_TIME) {
            this.addWarningEffect(graphics, width);
        }

        this.scene.time.delayedCall(1000, () => {
            graphics.destroy();
        });
    }

    private addWarningEffect(graphics: Phaser.GameObjects.Graphics, width: number) {
        const glowGraphics = this.scene.add.graphics();
        glowGraphics.fillStyle(GAME_CONSTANTS.COLORS.ERROR, 0.2);
        glowGraphics.fillRect(0, 502, width, 75);

        this.scene.tweens.add({
            targets: glowGraphics,
            alpha: 0.4,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.scene.time.delayedCall(1000, () => {
            glowGraphics.destroy();
        });
    }

    updateDistrict(districtName: string) {
        if (this.textoBairro) {
            this.textoBairro.destroy();
        }

        this.textoBairro = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.height - 100,
            `${districtName}!`,
            GAME_CONSTANTS.TEXT_STYLES.DISTRICT
        ).setOrigin(0.5);
    }

    showSuccessEffect(x: number, y: number, points: number) {
        this.particulasAcerto.setPosition(x, y);
        this.particulasAcerto.start();

        const textoPontos = this.scene.add.text(x, y - 50, `+${Math.floor(points)}`, {
            fontSize: '24px',
            color: '#10b981',
            stroke: '#000000',
            strokeThickness: 4
        });
    }

    showErrorEffect(x: number, y: number) {
        this.particulasErro.setPosition(x, y);
        this.particulasErro.start();
    }

    animateDistrictText() {
        if (this.textoBairro) {
            this.scene.tweens.add({
                targets: this.textoBairro,
                alpha: 0.5,
                duration: 200,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    this.textoBairro.setAlpha(1);
                }
            });
        }
    }
} 