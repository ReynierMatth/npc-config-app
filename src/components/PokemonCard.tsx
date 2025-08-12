import { useState, useEffect } from 'react';
import { Search, Trash2, ImageOff } from 'lucide-react';
import { pokemonApi } from '../services/pokemonApi';

interface PokemonCardProps {
  pokemonString: string;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onOpenSelector: (index: number) => void;
  isCompact?: boolean;
}

export function PokemonCard({ 
  pokemonString, 
  index, 
  onUpdate, 
  onRemove, 
  onOpenSelector,
  isCompact = false 
}: PokemonCardProps) {
  const [pokemonInfo, setPokemonInfo] = useState<{
    name: string;
    imageUrl: string | null;
    displayName: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadPokemonInfo = async () => {
      if (!pokemonString.trim()) {
        setPokemonInfo(null);
        return;
      }

      setLoading(true);
      setImageError(false);
      try {
        const info = await pokemonApi.getPokemonInfo(pokemonString);
        setPokemonInfo(info);
      } catch (error) {
        console.error('Failed to load Pokemon info:', error);
        setPokemonInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadPokemonInfo();
  }, [pokemonString]);

  const handleImageError = () => {
    setImageError(true);
  };

  if (isCompact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
        {/* Image du Pokémon */}
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
          ) : pokemonInfo?.imageUrl && !imageError ? (
            <img 
              src={pokemonInfo.imageUrl} 
              alt={pokemonInfo.displayName}
              className="w-full h-full object-contain"
              onError={handleImageError}
            />
          ) : (
            <ImageOff className="h-8 w-8 text-gray-400" />
          )}
        </div>

        {/* Informations et contrôles */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={pokemonString}
            onChange={(e) => onUpdate(index, e.target.value)}
            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="pikachu level=50 moves=thunderbolt,quick-attack"
          />
          {pokemonInfo && (
            <p className="text-xs text-gray-500 mt-1 truncate">{pokemonInfo.displayName}</p>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onOpenSelector(index)}
            className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
            title="Select Pokémon"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors shadow-sm hover:shadow-md">
      <div className="flex flex-col items-center space-y-3">
        {/* Image du Pokémon */}
        <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden border">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-500 border-t-transparent"></div>
          ) : pokemonInfo?.imageUrl && !imageError ? (
            <img 
              src={pokemonInfo.imageUrl} 
              alt={pokemonInfo.displayName}
              className="w-full h-full object-contain transition-transform hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <ImageOff className="h-12 w-12 text-gray-400" />
          )}
        </div>

        {/* Nom du Pokémon */}
        {pokemonInfo && (
          <div className="text-center">
            <h4 className="font-semibold text-gray-800">{pokemonInfo.displayName}</h4>
            <p className="text-xs text-gray-500">#{index + 1}</p>
          </div>
        )}

        {/* Champ de saisie */}
        <div className="w-full">
          <textarea
            value={pokemonString}
            onChange={(e) => onUpdate(index, e.target.value)}
            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
            placeholder="pikachu level=50 moves=thunderbolt,quick-attack"
            rows={3}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-2 w-full">
          <button
            type="button"
            onClick={() => onOpenSelector(index)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
          >
            <Search className="h-4 w-4 mr-1" />
            Select
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="px-3 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
