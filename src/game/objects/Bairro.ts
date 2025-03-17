export interface Coordenada {
    x: number;
    y: number;
}

export interface BairroData {
    nome: string;
    coordenadas: Coordenada[];
    pontoCentral: Coordenada;
}

export class Bairro {
    private nome: string;
    private coordenadas: Coordenada[];
    private pontoCentral: Coordenada;

    constructor(data: BairroData) {
        this.nome = data.nome;
        this.coordenadas = data.coordenadas;
        this.pontoCentral = data.pontoCentral;
    }

    getNome(): string {
        return this.nome;
    }

    getPontoCentral(): Coordenada {
        return this.pontoCentral;
    }

    getCoordenadas(): Coordenada[] {
        return this.coordenadas;
    }

    desenhar(graphics: Phaser.GameObjects.Graphics, cor: number = 0x00ff00, alpha: number = 0.5) {
        graphics.lineStyle(2, 0x000000);
        graphics.fillStyle(cor, alpha);
        graphics.beginPath();
        
        // Mover para o primeiro ponto
        graphics.moveTo(this.coordenadas[0].x, this.coordenadas[0].y);
        
        // Desenhar linhas para cada ponto subsequente
        for (let i = 1; i < this.coordenadas.length; i++) {
            graphics.lineTo(this.coordenadas[i].x, this.coordenadas[i].y);
        }
        
        // Fechar o polígono
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }

    contemPonto(x: number, y: number): boolean {
        let dentro = false;
        for (let i = 0, j = this.coordenadas.length - 1; i < this.coordenadas.length; j = i++) {
            const xi = this.coordenadas[i].x;
            const yi = this.coordenadas[i].y;
            const xj = this.coordenadas[j].x;
            const yj = this.coordenadas[j].y;

            const intersecta = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersecta) dentro = !dentro;
        }
        return dentro;
    }
} 