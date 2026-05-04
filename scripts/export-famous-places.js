#!/usr/bin/env node
// Roda uma vez para exportar os dados do Supabase para JSON local:
//   node scripts/export-famous-places.js

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_KEY no ambiente (ou no .env)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { data, error } = await supabase.from('famous_places').select('*');

if (error) {
  console.error('Erro ao buscar dados:', error.message);
  process.exit(1);
}

const places = data.map(p => ({
  id: String(p.id),
  name: p.name,
  description: p.description ?? '',
  latitude: p.latitude,
  longitude: p.longitude,
  category: p.category ?? '',
  address: p.address ?? '',
  imageUrl: (p.image_url && p.image_url !== '') ? p.image_url : '',
}));

const __dir = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dir, '../src/data/famous_places.json');

writeFileSync(outPath, JSON.stringify(places, null, 2), 'utf-8');
console.log(`✓ ${places.length} lugares salvos em src/data/famous_places.json`);
