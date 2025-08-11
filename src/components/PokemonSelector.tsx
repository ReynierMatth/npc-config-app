import { useState, useEffect, useRef } from 'react';
import { Search, Loader, X } from 'lucide-react';
import { pokemonApi, type PokemonListItem, type Pokemon } from '../services/pokemonApi';

interface PokemonSelectorProps {
  onSelect: (pokemonString: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function PokemonSelector({ onSelect, onClose, isOpen }: PokemonSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PokemonListItem[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState(50);
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchPokemon = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await pokemonApi.searchPokemon(searchQuery, 10);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchPokemon, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePokemonSelect = async (pokemonItem: PokemonListItem) => {
    setIsLoading(true);
    try {
      const pokemon = await pokemonApi.getPokemon(pokemonItem.name);
      setSelectedPokemon(pokemon);
      setSearchResults([]);
      setSearchQuery('');
      
      // Auto-select some random moves
      const levelMoves = pokemon.moves
        .filter(moveData => 
          moveData.version_group_details.some(detail => 
            detail.move_learn_method.name === 'level-up'
          )
        )
        .map(moveData => moveData.move.name);
      
      const randomMoves = levelMoves
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      
      setSelectedMoves(randomMoves);
    } catch (error) {
      console.error('Failed to load pokemon:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedPokemon) {
      const moves = selectedMoves.length > 0 ? ` moves=${selectedMoves.join(',')}` : '';
      const pokemonString = `${selectedPokemon.name} level=${level}${moves}`;
      onSelect(pokemonString);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPokemon(null);
    setSelectedMoves([]);
    setLevel(50);
    onClose();
  };

  const toggleMove = (move: string) => {
    if (selectedMoves.includes(move)) {
      setSelectedMoves(selectedMoves.filter(m => m !== move));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, move]);
    }
  };

  const availableMoves = selectedPokemon?.moves
    .filter(moveData => 
      moveData.version_group_details.some(detail => 
        detail.move_learn_method.name === 'level-up'
      )
    )
    .map(moveData => moveData.move.name)
    .sort() || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Select a Pokémon</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!selectedPokemon ? (
            // Search Phase
            <div className="p-4 flex-1 flex flex-col">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a Pokémon..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {isSearching && (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-64 overflow-y-auto">
                  {searchResults.map((pokemon) => (
                    <button
                      key={pokemon.name}
                      onClick={() => handlePokemonSelect(pokemon)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                    >
                      <span className="capitalize font-medium">{pokemon.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <p className="text-gray-500 text-center py-4">No Pokémon found</p>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="ml-2">Loading Pokémon details...</span>
                </div>
              )}
            </div>
          ) : (
            // Configuration Phase
            <div className="p-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center mb-4">
                {selectedPokemon.sprites.other?.['official-artwork']?.front_default && (
                  <img
                    src={selectedPokemon.sprites.other['official-artwork'].front_default}
                    alt={selectedPokemon.name}
                    className="w-16 h-16 mr-4"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold capitalize">{selectedPokemon.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {selectedPokemon.types.map((type) => (
                      <span
                        key={type.slot}
                        className="px-2 py-1 bg-gray-100 text-xs rounded capitalize"
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Level */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level: {level}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={level}
                  onChange={(e) => setLevel(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Moves */}
              <div className="flex-1 overflow-hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moves ({selectedMoves.length}/4)
                </label>
                <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1">
                    {availableMoves.map((move) => (
                      <button
                        key={move}
                        onClick={() => toggleMove(move)}
                        disabled={selectedMoves.length >= 4 && !selectedMoves.includes(move)}
                        className={`text-left px-2 py-1 text-xs rounded transition-colors ${
                          selectedMoves.includes(move)
                            ? 'bg-indigo-100 text-indigo-800'
                            : selectedMoves.length >= 4
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {move.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedPokemon && (
          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              onClick={() => setSelectedPokemon(null)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add to Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}