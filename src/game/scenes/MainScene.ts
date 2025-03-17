import Phaser from 'phaser';
import { GerenciadorBairros } from '../objects/GerenciadorBairros';

export class MainScene extends Phaser.Scene {
    private chorao!: Phaser.GameObjects.Sprite;
    private music!: Phaser.Sound.BaseSound;
    private pontuacao: number = 0;
    private distanciamentoAcumulado: number = 0;
    private tempoRestante: number = 10;
    private bairroAtual: string | null = null;
    private textoPontuacao!: Phaser.GameObjects.Text;
    private textoTempo!: Phaser.GameObjects.Text;
    private textoBairro!: Phaser.GameObjects.Text;
    private timerEvento!: Phaser.Time.TimerEvent;
    private gerenciadorBairros!: GerenciadorBairros;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Carregando as imagens
        this.load.image('map', '/assets/images/map.png');
        this.load.image('chorao', '/assets/images/chorao.png');
        this.load.image('bandeira', '/assets/images/bandeira2.png');
        
        // Carregando o áudio
        this.load.audio('musica', '/assets/audio/musica.ogg');
    }

    create() {
        // Adicionando o mapa como fundo
        this.add.image(0, 0, 'map').setOrigin(0, 0);
        
        // Inicializando o gerenciador de bairros
        this.gerenciadorBairros = new GerenciadorBairros(this);
        
        // Adicionando o personagem (Chorão)
        this.chorao = this.add.sprite(-200, 50, 'chorao');
        this.chorao.setScale(0.2);
        
        // Adicionando o título
        this.add.text(this.cameras.main.centerX, 50, 'O CAIÇARA', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Iniciando a música
        this.music = this.sound.add('musica', { loop: true });
        this.music.play();

        // Criando os textos de interface
        this.textoPontuacao = this.add.text(10, 10, 'Pontuação: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });

        this.textoTempo = this.add.text(10, 522, 'Tempo: 10.00', {
            fontSize: '16px',
            color: '#ffffff'
        });

        // Criando a caixa de texto inferior
        const graphics = this.add.graphics();
        graphics.fillStyle(0x002200, 0.8);
        graphics.fillRect(0, this.cameras.main.height - 180, this.cameras.main.width, 180);
        graphics.lineStyle(3, 0x000000);
        graphics.strokeRect(0, this.cameras.main.height - 180, this.cameras.main.width, 180);

        // Iniciando o timer
        this.timerEvento = this.time.addEvent({
            delay: 20,
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
        this.bairroAtual = bairroAleatorio.getNome();
        
        // Atualizar texto do bairro
        if (this.textoBairro) {
            this.textoBairro.destroy();
        }
        
        this.textoBairro = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            `${this.bairroAtual}!`,
            {
                fontSize: '90px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
    }

    private atualizarTempo = () => {
        this.tempoRestante -= 0.02;
        if (this.tempoRestante <= 0) {
            this.gameOver();
        } else {
            this.textoTempo.setText(`Tempo restante: ${this.tempoRestante.toFixed(2)}`);
            // Atualizar barra de tempo
            const graphics = this.add.graphics();
            const width = (this.tempoRestante / 10) * this.cameras.main.width;
            graphics.clear();
            graphics.fillStyle(this.tempoRestante > 5 ? 0x008000 : 0xff0000);
            graphics.fillRect(0, 502, width, 75);
        }
    }

    private verificarClique = (pointer: Phaser.Input.Pointer) => {
        if (!this.bairroAtual) return;

        const acertou = this.gerenciadorBairros.verificarClique(
            pointer.x,
            pointer.y,
            this.bairroAtual
        );

        if (acertou) {
            const bairro = this.gerenciadorBairros.getBairroPorNome(this.bairroAtual);
            if (bairro) {
                // Animar o bairro
                this.gerenciadorBairros.desenharBairro(bairro);
                this.time.delayedCall(500, () => {
                    this.gerenciadorBairros.limparDesenho();
                });

                // Atualizar pontuação
                const pontoCentral = bairro.getPontoCentral();
                const distancia = Phaser.Math.Distance.Between(
                    pointer.x,
                    pointer.y,
                    pontoCentral.x,
                    pontoCentral.y
                );
                this.pontuacao += this.calcularPontuacao(distancia, 10 - this.tempoRestante);
                this.textoPontuacao.setText(`Pontuação: ${Math.floor(this.pontuacao)}`);
                
                if (this.pontuacao >= 1000) {
                    this.parabens();
                } else {
                    this.reiniciarRodada();
                }
            }
        } else {
            const pontoCentral = this.gerenciadorBairros.getPontoCentralBairro(this.bairroAtual);
            if (pontoCentral) {
                this.desenharSeta(pointer.x, pointer.y, pontoCentral.x, pontoCentral.y);
                const distancia = Phaser.Math.Distance.Between(
                    pointer.x,
                    pointer.y,
                    pontoCentral.x,
                    pontoCentral.y
                );
                this.distanciamentoAcumulado += distancia;
                
                if (this.distanciamentoAcumulado > 1000) {
                    this.gameOver();
                }
            }
        }
    }

    private calcularPontuacao(distancia: number, tempo: number): number {
        if (distancia > 50) {
            return -(distancia * 2) * (tempo / 40);
        } else {
            return distancia * (10 / tempo);
        }
    }

    private desenharSeta(x1: number, y1: number, x2: number, y2: number) {
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0xff0000);
        graphics.beginPath();
        graphics.moveTo(x1, y1);
        graphics.lineTo(x2, y2);
        graphics.stroke();

        // Desenhar a ponta da seta
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const length = 15;
        
        graphics.lineTo(
            x2 - length * Math.cos(angle - Math.PI / 6),
            y2 - length * Math.sin(angle - Math.PI / 6)
        );
        graphics.moveTo(x2, y2);
        graphics.lineTo(
            x2 - length * Math.cos(angle + Math.PI / 6),
            y2 - length * Math.sin(angle + Math.PI / 6)
        );
        graphics.stroke();

        // Limpar a seta após 1 segundo
        this.time.delayedCall(1000, () => {
            graphics.clear();
        });
    }

    private gameOver() {
        this.timerEvento.remove();
        this.music.stop();
        
        const texto = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Game Over\nPressione ESPAÇO para recomeçar',
            {
                fontSize: '32px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        const keyboard = this.input.keyboard;
        if (keyboard) {
            keyboard.once('keydown-SPACE', () => {
                this.scene.restart();
            });
        }
    }

    private parabens() {
        this.timerEvento.remove();
        this.music.stop();
        
        const texto = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Parabéns!\nVocê venceu!\nPressione ENTER para jogar novamente',
            {
                fontSize: '32px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        const keyboard = this.input.keyboard;
        if (keyboard) {
            keyboard.once('keydown-ENTER', () => {
                this.scene.restart();
            });
        }
    }

    private reiniciarRodada() {
        this.tempoRestante = 10;
        this.selecionarNovoBairro();
    }

    update() {
        // A lógica de atualização contínua será implementada aqui se necessário
    }
} 