import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { pokemonApi, type PokemonListItem, type Pokemon } from '../services/pokemonApi';

interface PokemonFormData {
  pokemon: string;
  level: number;
  moves: string[];
}

interface PokemonFormSelectorProps {
  onSelect: (pokemonString: string) => void;
  onClose: () => void;
  isOpen: boolean;
  initialPokemonString?: string; // Nouvelle prop pour le Pokémon à modifier
}

export function PokemonFormSelector({ onSelect, onClose, isOpen, initialPokemonString }: PokemonFormSelectorProps) {
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isLoadingMoves, setIsLoadingMoves] = useState(false);
  const [availableMoves, setAvailableMoves] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<PokemonFormData>({
    pokemon: '',
    level: 50,
    moves: ['', '', '', '']
  });

  // Load all Pokemon on component mount
  useEffect(() => {
    const loadAllPokemon = async () => {
      try {
        const response = await pokemonApi.getAllPokemon(1010); // Gen 1-9
        setAllPokemon(response.results);
      } catch (error) {
        console.error('Failed to load Pokemon list:', error);
      }
    };

    if (isOpen && allPokemon.length === 0) {
      loadAllPokemon();
    }
  }, [isOpen, allPokemon.length]);

  // Load Pokemon details when Pokemon is selected
  useEffect(() => {
    const loadPokemonDetails = async () => {
      if (!formData.pokemon) {
        setSelectedPokemon(null);
        setAvailableMoves([]);
        return;
      }

      setIsLoadingMoves(true);
      try {
        const pokemon = await pokemonApi.getPokemon(formData.pokemon);
        setSelectedPokemon(pokemon);
        
        // Get all moves the Pokemon can learn
        const moves = pokemon.moves
          .filter(moveData => 
            moveData.version_group_details.some(detail => 
              detail.move_learn_method.name === 'level-up' ||
              detail.move_learn_method.name === 'machine' ||
              detail.move_learn_method.name === 'tutor'
            )
          )
          .map(moveData => moveData.move.name)
          .sort();
        
        setAvailableMoves(moves);
      } catch (error) {
        console.error('Failed to load Pokemon details:', error);
        setSelectedPokemon(null);
        setAvailableMoves([]);
      } finally {
        setIsLoadingMoves(false);
      }
    };

    loadPokemonDetails();
  }, [formData.pokemon]);

  // Si une chaîne Pokémon initiale est fournie, la définir dans l'état du formulaire
  useEffect(() => {
    if (initialPokemonString && isOpen) {
      const parsePokemonString = (pokemonString: string) => {
        const regex = /(\w+)(?:\s+level=(\d+))?(?:\s+moves=([\w,-]+))?/;
        const match = pokemonString.match(regex);

        if (match) {
          const pokemon = match[1];
          const level = match[2] ? parseInt(match[2]) : 50;
          const moves = match[3] ? match[3].split(',').map(move => move.trim()) : ['', '', '', ''];

          setFormData({ pokemon, level, moves });
        }
      };

      parsePokemonString(initialPokemonString);
    }
  }, [initialPokemonString, isOpen]);

  const handlePokemonChange = (pokemonName: string) => {
    setFormData(prev => ({
      ...prev,
      pokemon: pokemonName,
      moves: ['', '', '', ''] // Reset moves when Pokemon changes
    }));
  };

  const handleLevelChange = (level: number) => {
    setFormData(prev => ({ ...prev, level }));
  };

  const handleMoveChange = (index: number, move: string) => {
    setFormData(prev => {
      const newMoves = [...prev.moves];
      newMoves[index] = move;
      return { ...prev, moves: newMoves };
    });
  };

  const handleSubmit = () => {
    if (!formData.pokemon) return;

    // Filter out empty moves
    const selectedMoves = formData.moves.filter(move => move !== '');
    const movesString = selectedMoves.length > 0 ? ` moves=${selectedMoves.join(',')}` : '';
    const pokemonString = `${formData.pokemon} level=${formData.level}${movesString}`;
    
    onSelect(pokemonString);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      pokemon: '',
      level: 50,
      moves: ['', '', '', '']
    });
    setSelectedPokemon(null);
    setAvailableMoves([]);
    onClose();
  };

  const isFormValid = formData.pokemon !== '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add Pokémon to Team</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Pokemon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Pokémon *
            </label>
            <select
              value={formData.pokemon}
              onChange={(e) => handlePokemonChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a Pokémon...</option>
              {allPokemon.map((pokemon) => (
                <option key={pokemon.name} value={pokemon.name}>
                  {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Pokemon Info */}
          {selectedPokemon && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                {selectedPokemon.sprites.other?.['official-artwork']?.front_default && (
                  <img
                    src={selectedPokemon.sprites.other['official-artwork'].front_default}
                    alt={selectedPokemon.name}
                    className="w-16 h-16 mr-4"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold capitalize">{selectedPokemon.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {selectedPokemon.types.map((type) => (
                      <span
                        key={type.slot}
                        className="px-2 py-1 bg-white border text-xs rounded capitalize"
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Height: {selectedPokemon.height / 10}m</div>
                <div>Weight: {selectedPokemon.weight / 10}kg</div>
                <div>Base Experience: {selectedPokemon.base_experience}</div>
                <div>Available Moves: {availableMoves.length}</div>
              </div>
            </div>
          )}

          {/* Level Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level: {formData.level}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                value={formData.level}
                onChange={(e) => handleLevelChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="1"
                max="100"
                value={formData.level}
                onChange={(e) => handleLevelChange(parseInt(e.target.value) || 1)}
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Move Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moves (Optional - up to 4)
            </label>
            
            {isLoadingMoves ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-5 w-5 animate-spin text-indigo-600" />
                <span className="ml-2 text-sm text-gray-600">Loading available moves...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.moves.map((selectedMove, index) => (
                  <div key={index}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Move {index + 1}
                    </label>
                    <select
                      value={selectedMove}
                      onChange={(e) => handleMoveChange(index, e.target.value)}
                      disabled={availableMoves.length === 0}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">No move</option>
                      {availableMoves.map((move) => (
                        <option key={move} value={move}>
                          {move.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                
                {availableMoves.length === 0 && selectedPokemon && (
                  <p className="text-sm text-gray-500 italic">
                    No moves available for this Pokémon
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          {isFormValid && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="bg-gray-100 p-3 rounded border font-mono text-sm">
                {formData.pokemon} level={formData.level}
                {formData.moves.filter(m => m !== '').length > 0 && (
                  <span> moves={formData.moves.filter(m => m !== '').join(',')}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoadingMoves}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add to Team
          </button>
        </div>
      </div>
    </div>
  );
}