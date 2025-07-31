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
    private particulasAcerto!: Phaser.GameObjects.Particles.ParticleEmitter;
    private particulasErro!: Phaser.GameObjects.Particles.ParticleEmitter;
    private circuloDistancia!: Phaser.GameObjects.Graphics;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Carregando as imagens
        this.load.image('map', '/assets/images/map.png');
        this.load.image('chorao', '/assets/images/chorao.png');
        this.load.image('bandeira', `${import.meta.env.BASE_URL || ''}/assets/images/bandeira2.png`);
        this.load.image('particula', '/assets/images/particula.png');
        
        // Carregando o áudio
        this.load.audio('musica', `${import.meta.env.BASE_URL || ''}/assets/audio/musica.ogg`);
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
            color: '#ffffff',
            fontFamily: 'Figtree'
        }).setOrigin(0.5);

        // Iniciando a música
        this.music = this.sound.add('musica', { loop: true });
        this.music.play();

        // Criando os textos de interface
        this.textoPontuacao = this.add.text(10, 10, 'Pontuação: 0', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Figtree'
        });

        this.textoTempo = this.add.text(10, 522, 'Tempo: 10.00', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Figtree'
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

        // Configurando partículas para acertos
        this.particulasAcerto = this.add.particles(0, 0, 'particula', {
            speed: { min: 200, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: 20,
            blendMode: 'ADD',
            tint: 0x00ff00
        });
        this.particulasAcerto.stop();

        // Configurando partículas para erros
        this.particulasErro = this.add.particles(0, 0, 'particula', {
            speed: { min: 200, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: 20,
            blendMode: 'ADD',
            tint: 0xff0000
        });
        this.particulasErro.stop();

        // Criar círculo de distância (inicialmente invisível)
        this.circuloDistancia = this.add.graphics();
        this.circuloDistancia.setVisible(false);
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
                color: '#ffffff',
                fontFamily: 'Figtree'
            }
        ).setOrigin(0.5);
    }

    private atualizarTempo = () => {
        this.tempoRestante -= 0.02;
        if (this.tempoRestante <= 0) {
            this.gameOver();
        } else {
            this.textoTempo.setText(`Tempo restante: ${this.tempoRestante.toFixed(2)}`);
            
            // Atualizar barra de tempo com efeitos visuais
            const graphics = this.add.graphics();
            const width = (this.tempoRestante / 10) * this.cameras.main.width;
            
            // Limpar gráficos anteriores
            graphics.clear();
            
            // Desenhar fundo da barra
            graphics.fillStyle(0x333333, 0.5);
            graphics.fillRect(0, 502, this.cameras.main.width, 75);
            
            // Desenhar barra de progresso
            if (this.tempoRestante > 5) {
                graphics.fillStyle(0x00ff00);
            } else {
                graphics.fillStyle(0xff0000);
            }
            graphics.fillRect(0, 502, width, 75);
            
            // Adicionar borda
            graphics.lineStyle(2, 0xffffff, 0.3);
            graphics.strokeRect(0, 502, this.cameras.main.width, 75);
            
            // Efeito de brilho quando o tempo está acabando
            if (this.tempoRestante <= 3) {
                const glowGraphics = this.add.graphics();
                glowGraphics.fillStyle(0xff0000, 0.2);
                glowGraphics.fillRect(0, 502, width, 75);
                
                // Animação de pulso
                this.tweens.add({
                    targets: glowGraphics,
                    alpha: 0.4,
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                // Destruir o efeito de brilho após 1 segundo
                this.time.delayedCall(1000, () => {
                    glowGraphics.destroy();
                });
            }
            
            // Destruir a barra de tempo anterior após 1 segundo
            this.time.delayedCall(1000, () => {
                graphics.destroy();
            });
        }
    }

    private verificarClique = (pointer: Phaser.Input.Pointer) => {
        if (!this.bairroAtual) return;

        const acertou = this.gerenciadorBairros.verificarClique(
            pointer.x,
            pointer.y,
            this.bairroAtual
        );

        const bairro = this.gerenciadorBairros.getBairroPorNome(this.bairroAtual);
        if (bairro) {
            const pontoCentral = bairro.getPontoCentral();
            const distancia = Phaser.Math.Distance.Between(
                pointer.x,
                pointer.y,
                pontoCentral.x,
                pontoCentral.y
            );

            // Desenhar círculo de distância
            this.circuloDistancia.clear();
            this.circuloDistancia.setVisible(true);
            
            // Desenhar círculo externo (borda)
            this.circuloDistancia.lineStyle(2, acertou ? 0x00ff00 : 0xff0000, 0.5);
            this.circuloDistancia.strokeCircle(pointer.x, pointer.y, distancia);
            
            // Desenhar círculo interno (preenchimento)
            this.circuloDistancia.fillStyle(acertou ? 0x00ff00 : 0xff0000, 0.1);
            this.circuloDistancia.fillCircle(pointer.x, pointer.y, distancia);

            // Esconder o círculo após 1 segundo
            this.time.delayedCall(1000, () => {
                this.circuloDistancia.setVisible(false);
            });

            if (acertou) {
                // Efeito visual de acerto
                this.particulasAcerto.setPosition(pointer.x, pointer.y);
                this.particulasAcerto.start();

                // Adicionar animação da bandeira
                const bandeira = this.add.sprite(pointer.x, pointer.y, 'bandeira');
                bandeira.setScale(0.5);

                // Animação da bandeira
                this.tweens.add({
                    targets: bandeira,
                    y: pointer.y - 100,
                    scale: 0.8,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Power2',
                    onComplete: () => {
                        bandeira.destroy();
                    }
                });
                
                // Animar o bairro com efeito de brilho
                this.gerenciadorBairros.desenharBairro(bairro);
                this.tweens.add({
                    targets: this.textoBairro,
                    alpha: 0.5,
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => {
                        this.textoBairro.setAlpha(1);
                    }
                });

                this.time.delayedCall(500, () => {
                    this.gerenciadorBairros.limparDesenho();
                });

                // Atualizar pontuação com animação
                const pontosGanhos = this.calcularPontuacao(distancia, 10 - this.tempoRestante);
                this.pontuacao += pontosGanhos;
                
                // Animação da pontuação
                const textoPontos = this.add.text(pointer.x, pointer.y - 50, `+${Math.floor(pontosGanhos)}`, {
                    fontSize: '24px',
                    color: '#10b981',
                    stroke: '#000000',
                    strokeThickness: 4
                });
            }
        }
    }

    private calcularPontuacao(distancia: number, multiplicador: number): number {
        // Implemente a lógica para calcular a pontuação com base na distância
        return distancia * multiplicador;
    }

    private gameOver() {
        // Implemente a lógica para o fim do jogo
    }
}