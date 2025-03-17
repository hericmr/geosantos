import { Bairro, BairroData, Coordenada } from './Bairro';

export class GerenciadorBairros {
    private bairros: Bairro[] = [];
    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        this.graphics = scene.add.graphics();
        this.carregarBairros();
    }

    private carregarBairros() {
        // TODO: Carregar dados reais do arquivo GeoJSON
        // Por enquanto, vamos usar dados de exemplo
        const dadosBairros: BairroData[] = [
            {
                nome: 'Gonzaga',
                coordenadas: [
                    { x: 400, y: 300 },
                    { x: 500, y: 300 },
                    { x: 500, y: 400 },
                    { x: 400, y: 400 }
                ],
                pontoCentral: { x: 450, y: 350 }
            },
            {
                nome: 'Ponta da Praia',
                coordenadas: [
                    { x: 800, y: 200 },
                    { x: 900, y: 200 },
                    { x: 900, y: 300 },
                    { x: 800, y: 300 }
                ],
                pontoCentral: { x: 850, y: 250 }
            }
        ];

        this.bairros = dadosBairros.map(dados => new Bairro(dados));
    }

    getBairros(): Bairro[] {
        return this.bairros;
    }

    getBairroPorNome(nome: string): Bairro | undefined {
        return this.bairros.find(bairro => bairro.getNome() === nome);
    }

    desenharBairro(bairro: Bairro, cor: number = 0x00ff00, alpha: number = 0.5) {
        this.graphics.clear();
        bairro.desenhar(this.graphics, cor, alpha);
    }

    limparDesenho() {
        this.graphics.clear();
    }

    verificarClique(x: number, y: number, nomeBairro: string): boolean {
        const bairro = this.getBairroPorNome(nomeBairro);
        return bairro ? bairro.contemPonto(x, y) : false;
    }

    getPontoCentralBairro(nomeBairro: string): Coordenada | undefined {
        const bairro = this.getBairroPorNome(nomeBairro);
        return bairro?.getPontoCentral();
    }
} 