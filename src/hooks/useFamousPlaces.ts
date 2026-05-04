import { useState, useEffect } from 'react';
import { FamousPlace } from '../types/famousPlaces';
import { famousPlacesService } from '../lib/supabase';

export function useFamousPlaces(category: string | null = null) {
  const [places, setPlaces] = useState<FamousPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPlaces([]); // limpa enquanto carrega para evitar seleção da categoria errada
    setIsLoading(true);

    const fetchPlaces = async () => {
      try {
        const fetchedPlaces = await famousPlacesService.getFamousPlaces();
        const filtered = category
          ? fetchedPlaces.filter(p => p.category === category)
          : fetchedPlaces;
        setPlaces(filtered);
      } catch (err) {
        console.error("Failed to fetch famous places:", err);
        setError("Failed to load famous places.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [category]);

  function getRandomPlace(): FamousPlace {
    if (places.length === 0) {
      // Fallback or handle error if no places are loaded
      return { 
        id: 'mock-id',
        name: 'Placeholder',
        description: 'No famous places loaded.',
        latitude: 0,
        longitude: 0,
        category: 'unknown',
        address: 'unknown',
        imageUrl: 'https://via.placeholder.com/56'
      };
    }
    const idx = Math.floor(Math.random() * places.length);
    return places[idx];
  }

  return {
    places,
    getRandomPlace,
    isLoading,
    error,
  };
} 