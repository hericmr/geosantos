-- =====================================================
-- CONFIGURAÇÃO DA TABELA FAMOUS_PLACES
-- =====================================================

-- Criar a tabela famous_places
CREATE TABLE IF NOT EXISTS famous_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category VARCHAR(100),
  address TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_famous_places_location ON famous_places(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_famous_places_category ON famous_places(category);

-- =====================================================
-- INSERIR DADOS DOS LUGARES FAMOSOS DE SANTOS
-- =====================================================

-- Limpar dados existentes (opcional - descomente se quiser resetar)
-- DELETE FROM famous_places;

-- Inserir lugares famosos
INSERT INTO famous_places (name, description, latitude, longitude, category, address) VALUES
(
  'Escultura 100 Anos da Imigração Japonesa',
  'Monumento criado pela artista Tomie Ohtake em homenagem aos 100 anos da imigração japonesa no Brasil. Localizada na Praça da Independência, a escultura representa a união entre Brasil e Japão.',
  -23.9829486,
  -46.3705368,
  'monumento',
  'Praça da Independência, Santos - SP'
),
(
  'Monumento aos Andradas',
  'Monumento em homenagem aos irmãos Andradas (José Bonifácio, Antônio Carlos e Martim Francisco), importantes figuras da independência do Brasil. Localizado na Praça Barão do Rio Branco.',
  -23.9735,
  -46.3092,
  'monumento',
  'Praça Barão do Rio Branco, Santos - SP'
),
(
  'Museu do Café',
  'Museu histórico localizado no antigo Palácio da Bolsa Oficial de Café, construído em 1922. Abriga exposições sobre a história do café no Brasil e sua importância econômica.',
  -23.9735,
  -46.3092,
  'museu',
  'Rua XV de Novembro, 95, Santos - SP'
),
(
  'Aquário Municipal',
  'Um dos maiores aquários da América Latina, inaugurado em 1945. Possui mais de 800 animais de 200 espécies diferentes, incluindo tubarões, pinguins e tartarugas marinhas.',
  -23.9735,
  -46.3092,
  'turismo',
  'Av. Bartolomeu de Gusmão, s/n, Santos - SP'
),
(
  'Orquidário Municipal',
  'Jardim botânico inaugurado em 1945, com mais de 3.500 exemplares de orquídeas e outras plantas exóticas. Possui trilhas, lagos e uma rica biodiversidade.',
  -23.9735,
  -46.3092,
  'turismo',
  'Praça Washington, s/n, Santos - SP'
),
(
  'Teatro Coliseu',
  'Teatro histórico inaugurado em 1924, um dos mais importantes da cidade. Arquitetura neoclássica com capacidade para 1.200 espectadores.',
  -23.9735,
  -46.3092,
  'cultura',
  'Rua Amador Bueno, 237, Santos - SP'
),
(
  'Basílica de Santo Antônio do Embaré',
  'Igreja histórica construída em 1640, uma das mais antigas do Brasil. Arquitetura colonial portuguesa com rica decoração interna.',
  -23.9735,
  -46.3092,
  'igreja',
  'Av. Bartolomeu de Gusmão, 32, Santos - SP'
),
(
  'Museu de Pesca',
  'Museu dedicado à pesca e vida marinha, localizado em um antigo forte. Possui esqueleto de baleia e exposições sobre a história da pesca no litoral paulista.',
  -23.9735,
  -46.3092,
  'museu',
  'Av. Bartolomeu de Gusmão, 158, Santos - SP'
),
(
  'Jardim da Orla',
  'Maior jardim frontal de praia do mundo, com 5.335 metros de extensão. Projetado pelo paisagista Roberto Burle Marx, possui diversas espécies de plantas e esculturas.',
  -23.9735,
  -46.3092,
  'turismo',
  'Av. Bartolomeu de Gusmão, Santos - SP'
),
(
  'Bolsa Oficial de Café',
  'Edifício histórico construído em 1922, sede da antiga Bolsa Oficial de Café. Arquitetura eclética com influências neoclássicas e art déco.',
  -23.9735,
  -46.3092,
  'histórico',
  'Rua XV de Novembro, 95, Santos - SP'
);

-- =====================================================
-- VERIFICAR DADOS INSERIDOS
-- =====================================================

-- Consulta para verificar os dados inseridos
SELECT 
  id,
  name,
  category,
  latitude,
  longitude,
  created_at
FROM famous_places 
ORDER BY name;

-- Contar total de registros
SELECT COUNT(*) as total_lugares FROM famous_places;

-- Agrupar por categoria
SELECT 
  category,
  COUNT(*) as quantidade
FROM famous_places 
GROUP BY category 
ORDER BY quantidade DESC; 