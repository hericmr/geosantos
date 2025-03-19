# O Caiçara 🎮

Um jogo divertido que testa seu conhecimento sobre os bairros de Santos! Desenvolvido com React, TypeScript e Leaflet.

## 🎯 Como Jogar

1. Clique em "Iniciar Jogo" para começar
2. Um bairro de Santos será mostrado na tela
3. Clique no mapa onde você acha que esse bairro está localizado
4. Quanto mais próximo do bairro correto você clicar, mais pontos ganha
5. Quanto mais rápido você responder, mais pontos de bônus recebe
6. Continue jogando até acumular pontos negativos demais

## 🏆 Sistema de Pontuação

- **Pontuação Base (até 1000 pontos)**:
  - Calculada com base na distância entre seu clique e o bairro correto
  - Quanto menor a distância, maior a pontuação
  - Máximo de 1000 pontos para distância de 0km
  - Mínimo de 0 pontos para distância de 10km ou mais

- **Bônus de Tempo (até 500 pontos)**:
  - Disponível apenas se você responder em 2 segundos ou menos
  - Quanto mais rápido, maior o bônus
  - Máximo de 500 pontos de bônus

- **Bônus de Tempo Adicional**:
  - Excelente (≥2000 pontos): +2 segundos
  - Bom (≥1500 pontos): +1.5 segundos
  - Razoável (≥1000 pontos): +1 segundo

## 🗺️ Cálculo de Distância

O cálculo da distância é feito usando a fórmula de Haversine, que considera a curvatura da Terra:

```typescript
const EARTH_RADIUS = 6371000; // Raio da Terra em metros

const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return EARTH_RADIUS * c;
};
```

## 🎮 Níveis de Desempenho

score >= 20000 ? "REI DA GEOGRAFIA! Você conhece Santos!" :
 score >= 15000 ? "MITO SANTISTA! Até as ondas do mar te aplaudem!" :
 score >= 10000 ? "LENDÁRIO! Você é um Pelé da geografia santista!" :
 score >= 8000 ? "MESTRE DOS BAIRROS! 🧠 Você é um GPS ambulante!" :
 score >= 5000 ? "IMPRESSIONANTE! 🌟 Quase um GPS humano!!" :
 score >= 4000 ? "VC É MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA! 🥟" :
 score >= 3000 ? "SANTISTA DE CORAÇÃO! ❤️ Você é um caiçara que manja dos bairros!" :
 score >= 2000 ? "MUITO BOM! 👏 Você é um verdadeiro caiçara da geografia!" :
 score >= 1000 ? "BOM JOGO! 👍 Mas ainda precisa andar mais na zona noroeste!" :
 score >= 500 ? "QUASE LÁ! 🎯 Dá um role no bondinho pra pegar mais dicas!" :
 score >= 100 ? "TÁ MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA! 🏖️" :
 "Game Over! 🚨 Eita! Parece que você confundiu Santos com São Vicente!"}


## 🛠️ Tecnologias Utilizadas

- React
- TypeScript
- Leaflet (para o mapa)
- GeoJSON (para os dados dos bairros)
- CSS moderno com variáveis e flexbox

## 🎵 Recursos

- Mapa interativo de Santos
- Feedback visual com setas indicando a direção correta
- Sistema de pontuação detalhado
- Animações suaves
- Efeitos sonoros
- Design responsivo
- Compartilhamento de pontuação

## 🎨 Design

O jogo utiliza um design moderno e minimalista, com:
- Cores vibrantes e contrastantes
- Tipografia clara e legível
- Animações suaves
- Feedback visual imediato
- Interface intuitiva

## 🎯 Objetivo

Teste seu conhecimento sobre a geografia de Santos e tente conseguir a maior pontuação possível! Compartilhe suas conquistas com amigos e veja quem consegue a pontuação mais alta.

## 💻 Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Leaflet (para o mapa interativo)
- GeoJSON (para os dados dos bairros)

## 🛠️ Desenvolvimento Local

Se você quiser rodar o jogo localmente ou contribuir com o desenvolvimento:

1. Clone este repositório:
```bash
git clone https://github.com/hericmr/jogocaicara.git
```

2. Navegue até o diretório do projeto:
```bash
cd jogocaicara
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Abra [http://localhost:5173](http://localhost:5173) no seu navegador

## 🤝 Contribuições

O jogo está em constante evolução! Sugestões e contribuições são mais que bem-vindas! Encontrou um problema ou tem uma ideia para melhorar o jogo? Abra uma issue ou envie uma pull request.

Esse é um jogo de código aberto e a sua ajuda é fundamental para tornar "O Caiçara" ainda melhor!

### 🎮 Possibilidades de Expansão

A lógica desse jogo pode ser adaptada para criar experiências educacionais em diversas áreas:
- Anatomia
- Biologia
- Astronomia
- Geografia de outras cidades/países
- E muito mais!

## 👤 Autor

Este jogo foi desenvolvido por Héric Moura.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
