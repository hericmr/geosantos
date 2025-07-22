import { useState, useEffect } from 'react';
import { FamousPlace } from '../types/famousPlaces';
import { famousPlacesService } from '../lib/supabase';

export function useFamousPlaces() {
  const [places, setPlaces] = useState<FamousPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        const fetchedPlaces = await famousPlacesService.getFamousPlaces();
        setPlaces(fetchedPlaces);
        console.log("useFamousPlaces: Places after fetch:", fetchedPlaces);
      } catch (err) {
        console.error("Failed to fetch famous places:", err);
        setError("Failed to load famous places.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, []);

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