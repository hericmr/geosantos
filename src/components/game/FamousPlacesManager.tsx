import React from 'react';
import { FamousPlace } from '../../types/famousPlaces';

interface FamousPlacesManagerProps {
  onPlaceChange: (place: FamousPlace) => void;
  currentPlace: FamousPlace | null;
  isGameActive: boolean;
}

export const FamousPlacesManager: React.FC<FamousPlacesManagerProps> = () => null;
