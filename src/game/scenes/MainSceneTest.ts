import Phaser from 'phaser';
import { GerenciadorBairros } from '../objects/GerenciadorBairros';
import { UIManager } from '../managers/UIManager';
import { GameStateManager } from '../managers/GameStateManager';
import { AudioManager } from '../managers/AudioManager';
import { GAME_CONSTANTS } from '../../constants/game';

export class MainSceneTest extends Phaser.Scene {
    private chorao!: Phaser.GameObjects.Sprite;
    private timerEvento!: Phaser.Time.TimerEvent;
    private gerenciadorBairros!: GerenciadorBairros;
    private uiManager!: UIManager;
    private gameStateManager!: GameStateManager;
    private audioManager!: AudioManager;

    constructor() {
        super({ key: 'MainSceneTest' });
    }

    preload() {
        // Carregando as imagens
        this.load.image('map', '/assets/images/map.png');
        this.load.image('chorao', '/assets/images/chorao.png');
        this.load.image('bandeira', 'https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/images/bandeira2.png');
        this.load.image('particula', '/assets/images/particula.png');
    }

    create() {
        // Adicionando o mapa como fundo
        this.add.image(0, 0, 'map').setOrigin(0, 0);
        
        // Inicializando os managers
        this.gerenciadorBairros = new GerenciadorBairros(this);
        this.uiManager = new UIManager(this);
        this.gameStateManager = new GameStateManager(() => this.gameOver());
        this.audioManager = new AudioManager(this);
        
        // Adicionando o personagem (Chorão)
        this.chorao = this.add.sprite(-200, 50, 'chorao');
        this.chorao.setScale(0.2);

        // Iniciando a música
        this.audioManager.playMusic();

        // Iniciando o timer
        this.timerEvento = this.time.addEvent({
            delay: GAME_CONSTANTS.TIME_UPDATE_INTERVAL,
            callback: this.atualizarTempo,
            callbackScope: this,
            loop: true
        });

        // Adicionando interação com o mouse
        this.input.on('pointerdown', this.verificarClique, this);

        // Iniciando o primeiro bairro
        this.selecionarNovoBairro();
    }

    private selecionarNovoBairro() {
        const bairros = this.gerenciadorBairros.getBairros();
        const bairroAleatorio = bairros[Math.floor(Math.random() * bairros.length)];
        this.gameStateManager.setCurrentDistrict(bairroAleatorio.getNome());
        this.uiManager.updateDistrict(bairroAleatorio.getNome());
    }

    private atualizarTempo = () => {
        const currentTime = this.gameStateManager.getState().tempoRestante - GAME_CONSTANTS.TIME_UPDATE_AMOUNT;
        this.gameStateManager.updateTime(currentTime);
        this.uiManager.updateTime(currentTime);
    }

    private verificarClique = (pointer: Phaser.Input.Pointer) => {
        const currentDistrict = this.gameStateManager.getCurrentDistrict();
        if (!currentDistrict) return;

        const acertou = this.gerenciadorBairros.verificarClique(
            pointer.x,
            pointer.y,
            currentDistrict
        );

        if (acertou) {
            const bairro = this.gerenciadorBairros.getBairroPorNome(currentDistrict);
            if (bairro) {
                // Efeito visual de acerto
                this.uiManager.showSuccessEffect(pointer.x, pointer.y, 0);
                
                // Animar o bairro com efeito de brilho
                this.gerenciadorBairros.desenharBairro(bairro);
                this.uiManager.animateDistrictText();

                this.time.delayedCall(500, () => {
                    this.gerenciadorBairros.limparDesenho();
                });

                // Atualizar pontuação com animação
                const pontoCentral = bairro.getPontoCentral();
                const distancia = Phaser.Math.Distance.Between(
                    pointer.x,
                    pointer.y,
                    pontoCentral.x,
                    pontoCentral.y
                );
                const timeMultiplier = GAME_CONSTANTS.INITIAL_TIME - this.gameStateManager.getState().tempoRestante;
                const pontosGanhos = this.gameStateManager.calculatePoints(distancia, timeMultiplier);
                this.gameStateManager.updateScore(pontosGanhos);
                this.uiManager.updateScore(this.gameStateManager.getState().pontuacao);
                this.uiManager.showSuccessEffect(pointer.x, pointer.y, pontosGanhos);
            }
        } else {
            this.uiManager.showErrorEffect(pointer.x, pointer.y);
        }
    }

    private gameOver() {
        // Implementar lógica de game over
        console.log('Game Over!');
    }
} 