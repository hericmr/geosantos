import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbdofilxcfnxhaimuilu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZG9maWx4Y2ZueGhhaW11aWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTEzOTEsImV4cCI6MjA2ODU4NzM5MX0.4s_8p_jMPfL-TWqPqzX26ca-GkuEFBX1KbJmKy8RieI';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
export const rankingService = {
  // Buscar top 10 jogadores
  async getTopPlayers(limit: number = 10): Promise<RankingEntry[]> {
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

  // Adicionar nova pontuação
  async addScore(entry: Omit<RankingEntry, 'id' | 'created_at'>): Promise<boolean> {
    const { error } = await supabase
      .from('ranking')
      .insert([entry]);

    if (error) {
      console.error('Erro ao adicionar pontuação:', error);
      return false;
    }

    return true;
  },

  // Buscar posição do jogador
  async getPlayerPosition(playerName: string): Promise<number> {
    const { data, error } = await supabase
      .from('ranking')
      .select('score')
      .gte('score', 0)
      .order('score', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posição:', error);
      return -1;
    }

    const position = data?.findIndex(entry => entry.score === 0) + 1;
    return position > 0 ? position : data?.length || 0;
  },

  // Buscar estatísticas do jogador
  async getPlayerStats(playerName: string): Promise<RankingEntry | null> {
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