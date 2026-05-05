#!/usr/bin/env node
// Preenche imageUrl dos lugares famosos sem imagem usando Google Custom Search API.
//
// Pré-requisitos:
//   1. Google API Key com Custom Search API habilitada
//   2. Search Engine ID (cx) configurado para buscar na web toda + imagens habilitado
//      → console.developers.google.com → APIs & Services → Custom Search API
//      → programmablesearchengine.google.com → criar motor → "Buscar em toda a web" + "Ativar Pesquisa de imagens"
//
// Uso:
//   GOOGLE_API_KEY=xxx GOOGLE_CSE_ID=yyy node scripts/fill-missing-images.js
//
// Variáveis opcionais:
//   DRY_RUN=1          → apenas mostra o que faria, sem alterar nada
//   DELAY_MS=1200      → intervalo entre buscas (padrão 1200ms para respeitar quota)
//   START_FROM=10      → pula os primeiros N lugares (útil para retomar após interrupção)

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLACES_PATH = join(__dirname, '../src/data/famous_places.json');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID  = process.env.GOOGLE_CSE_ID;
const SUPABASE_URL   = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY   = process.env.VITE_SUPABASE_KEY;
const DRY_RUN        = process.env.DRY_RUN === '1';
const DELAY_MS       = Number(process.env.DELAY_MS ?? 1200);
const START_FROM     = Number(process.env.START_FROM ?? 0);

if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
  console.error('Defina GOOGLE_API_KEY e GOOGLE_CSE_ID no ambiente.');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_KEY no ambiente.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function randomId(len = 11) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.random() * chars.length | 0]).join('');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function searchImage(placeName) {
  const query = encodeURIComponent(`${placeName} Santos SP`);
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&searchType=image&num=5&q=${query}&imgType=photo&safe=active`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google API ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.items ?? [];
}

async function downloadImage(imageUrl) {
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar imagem`);
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, contentType };
}

function extensionFromContentType(ct) {
  if (ct.includes('png'))  return 'png';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif'))  return 'gif';
  return 'jpg';
}

async function uploadToSupabase(buffer, contentType, filename) {
  const { error } = await supabase.storage
    .from('media')
    .upload(`locations/${filename}`, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Supabase upload: ${error.message}`);
  return `${SUPABASE_URL}/storage/v1/object/public/media/locations/${filename}`;
}

async function processPlace(place) {
  const results = await searchImage(place.name);
  if (results.length === 0) {
    console.log(`  ⚠  Nenhuma imagem encontrada`);
    return null;
  }

  for (const item of results) {
    try {
      const { buffer, contentType } = await downloadImage(item.link);
      if (buffer.length < 5_000) continue; // ignora imagens muito pequenas
      const ext = extensionFromContentType(contentType);
      const filename = `${randomId()}.${ext}`;
      const publicUrl = await uploadToSupabase(buffer, contentType, filename);
      console.log(`  ✓  ${publicUrl}`);
      return publicUrl;
    } catch (err) {
      console.log(`  ✗  Falha em ${item.link.slice(0, 60)}: ${err.message}`);
    }
  }
  return null;
}

// ── main ──────────────────────────────────────────────────────────────────────

const places = JSON.parse(readFileSync(PLACES_PATH, 'utf8'));
const missing = places
  .map((p, i) => ({ ...p, _idx: i }))
  .filter(p => !p.imageUrl)
  .slice(START_FROM);

console.log(`${missing.length} lugares sem imagem${START_FROM > 0 ? ` (começando do índice ${START_FROM})` : ''}`);
if (DRY_RUN) console.log('DRY_RUN=1 — nada será alterado\n');

let updated = 0;
let failed  = 0;

for (let i = 0; i < missing.length; i++) {
  const place = missing[i];
  const progress = `[${i + 1 + START_FROM}/${missing.length + START_FROM}]`;
  console.log(`\n${progress} ${place.name}`);

  if (DRY_RUN) {
    console.log(`  (dry-run) buscaria: "${place.name} Santos SP"`);
    continue;
  }

  try {
    const url = await processPlace(place);
    if (url) {
      places[place._idx].imageUrl = url;
      updated++;
      // Salva depois de cada sucesso para não perder progresso
      writeFileSync(PLACES_PATH, JSON.stringify(places, null, 2), 'utf8');
    } else {
      failed++;
    }
  } catch (err) {
    console.error(`  ERRO: ${err.message}`);
    if (err.message.includes('429') || err.message.includes('quota')) {
      console.error('\nQuota da API atingida. Rode novamente amanhã ou aumente o limite.');
      process.exit(1);
    }
    failed++;
  }

  if (i < missing.length - 1) await sleep(DELAY_MS);
}

console.log(`\n✓ ${updated} imagens adicionadas, ${failed} falhas`);
if (!DRY_RUN) console.log(`JSON atualizado em ${PLACES_PATH}`);
