import { createClient } from '@supabase/supabase-js';
import { FamousPlace } from '../types/famousPlaces';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Tipos para o ranking
export interface RankingEntry {
  id?: number;
  player_name: string;
  score: number;
  play_time: number;
  rounds_played: number;
  accuracy: number;
  created_at?: string;
}

// Funções para interagir com o ranking
export const famousPlacesService = {
  async getFamousPlaces(): Promise<FamousPlace[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('famous_places')
      .select('*');

    if (error) {
      console.error('Erro ao buscar lugares famosos:', error);
      return [];
    }

    return data.map(place => ({
      id: place.id,
      name: place.name,
      description: place.description,
      latitude: place.latitude,
      longitude: place.longitude,
      category: place.category,
      address: place.address,
      imageUrl: (place.image_url && place.image_url !== '') ? place.image_url : 'https://via.placeholder.com/56',
    })) || [];
  },
};

export const rankingService = {
  async getTopPlayers(limit: number = 10): Promise<RankingEntry[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('ranking')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar ranking:', error);
      return [];
    }

    return data || [];
  },

  async addScore(entry: Omit<RankingEntry, 'id' | 'created_at'>): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
      .from('ranking')
      .insert([entry]);

    if (error) {
      console.error('Erro ao adicionar pontuação:', error);
      return false;
    }

    return true;
  },

  async getPlayerPosition(playerName: string, playerScore: number): Promise<number> {
    if (!supabase) return -1;

    const { data, error } = await supabase
      .from('ranking')
      .select('score')
      .order('score', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posição:', error);
      return -1;
    }

    const position = data?.findIndex(entry => entry.score <= playerScore) + 1;
    return position > 0 ? position : (data?.length || 0) + 1;
  },

  async getPlayerStats(playerName: string): Promise<RankingEntry | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('ranking')
      .select('*')
      .eq('player_name', playerName)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar estatísticas do jogador:', error);
      return null;
    }

    return data;
  }
}; 