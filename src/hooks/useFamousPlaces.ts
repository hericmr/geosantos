import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FamousPlace } from '../types/famousPlaces';

export const useFamousPlaces = () => {
  const [places, setPlaces] = useState<FamousPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('famous_places')
        .select('*')
        .order('name');
      
      if (supabaseError) throw supabaseError;
      setPlaces(data || []);
    } catch (err) {
      console.error('Erro ao carregar lugares famosos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomPlace = (): FamousPlace | null => {
    if (places.length === 0) return null;
    return places[Math.floor(Math.random() * places.length)];
  };

  const getPlaceById = (id: string): FamousPlace | null => {
    return places.find(place => place.id === id) || null;
  };

  const getPlacesByCategory = (category: string): FamousPlace[] => {
    return places.filter(place => place.category === category);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  return {
    places,
    isLoading,
    error,
    fetchPlaces,
    getRandomPlace,
    getPlaceById,
    getPlacesByCategory
  };
}; 