import { useState } from 'react';
import { Plus, Trash2, Shuffle, Zap, Search, Grid, List } from 'lucide-react';
import type { NPCConfiguration, NPCPartyProvider, SimplePartyProvider, PoolPartyProvider, PoolEntry } from '../types/npc';
import { pokemonApi } from '../services/pokemonApi';
import { PokemonFormSelector } from './PokemonFormSelector';
import { PokemonCard } from './PokemonCard';

interface NPCPartyBuilderProps {
  config: NPCConfiguration;
  onChange: (config: NPCConfiguration) => void;
}

export function NPCPartyBuilder({ config, onChange }: NPCPartyBuilderProps) {
  const [partyType, setPartyType] = useState<'simple' | 'pool' | 'script'>(config.party?.type || 'simple');
  const [showPokemonFormSelector, setShowPokemonFormSelector] = useState(false);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number>(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPokemonString, setCurrentPokemonString] = useState<string>(''); // Ajout de l'état pour le Pokémon actuel

  const handlePartyChange = (party: NPCPartyProvider) => {
    onChange({ ...config, party });
  };

  const handlePartyTypeChange = (type: 'simple' | 'pool' | 'script') => {
    setPartyType(type);
    
    switch (type) {
      case 'simple':
        handlePartyChange({ type: 'simple', pokemon: [''] });
        break;
      case 'pool':
        handlePartyChange({ type: 'pool', pool: [{ pokemon: '', weight: 1 }] });
        break;
      case 'script':
        handlePartyChange({ type: 'script', script: '' });
        break;
    }
  };

  const generateRandomTeam = async (teamSize: number = 6) => {
    setIsGenerating(true);
    try {
      const team = await pokemonApi.generateRandomTeam(teamSize);
      const pokemonStrings = team.map(pokemon => pokemonApi.formatToCobblemonString(pokemon));
      
      if (partyType === 'simple') {
        handlePartyChange({
          type: 'simple',
          pokemon: pokemonStrings,
          isStatic: (config.party as SimplePartyProvider)?.isStatic
        });
      }
    } catch (error) {
      console.error('Failed to generate random team:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTeamByType = async (type: string, teamSize: number = 6) => {
    setIsGenerating(true);
    try {
      const team = await pokemonApi.generateTeamByType(type, teamSize);
      const pokemonStrings = team.map(pokemon => pokemonApi.formatToCobblemonString(pokemon));
      
      if (partyType === 'simple') {
        handlePartyChange({
          type: 'simple',
          pokemon: pokemonStrings,
          isStatic: (config.party as SimplePartyProvider)?.isStatic
        });
      }
    } catch (error) {
      console.error(`Failed to generate ${type} team:`, error);
    } finally {
      setIsGenerating(false);
    }
  };

  const openPokemonFormSelector = (index: number) => {
    setSelectedPokemonIndex(index);

    // Si on modifie un Pokémon existant, récupérer sa chaîne actuelle
    if (partyType === 'simple') {
      const party = config.party as SimplePartyProvider;
      const existingPokemon = party.pokemon[index];
      setCurrentPokemonString(existingPokemon || '');
    }

    setShowPokemonFormSelector(true);
  };

  const handlePokemonFormSelect = (pokemonString: string) => {
    if (partyType === 'simple') {
      const party = config.party as SimplePartyProvider;
      const newPokemon = [...party.pokemon];
      newPokemon[selectedPokemonIndex] = pokemonString;
      
      handlePartyChange({
        ...party,
        pokemon: newPokemon
      });
    }
    setShowPokemonFormSelector(false);
    setSelectedPokemonIndex(-1);
  };

  const renderSimpleParty = () => {
    const party = config.party as SimplePartyProvider;
    
    if (!party || !party.pokemon) {
      return null;
    }
    
    const addPokemon = () => {
      handlePartyChange({
        ...party,
        pokemon: [...party.pokemon, '']
      });
    };

    const removePokemon = (index: number) => {
      handlePartyChange({
        ...party,
        pokemon: party.pokemon.filter((_, i) => i !== index)
      });
    };

    const updatePokemon = (index: number, value: string) => {
      const newPokemon = [...party.pokemon];
      newPokemon[index] = value;
      handlePartyChange({
        ...party,
        pokemon: newPokemon
      });
    };

    return (
      <div className="space-y-6">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h4 className="font-semibold text-lg text-gray-800">Pokemon Team</h4>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
              {party.pokemon.length} Pokemon
            </span>
          </div>

          {/* Display mode and add controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-md p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={addPokemon}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Empty Slot
            </button>
            <button
              type="button"
              onClick={() => {
                addPokemon();
                const newIndex = (config.party as SimplePartyProvider)?.pokemon?.length || 0;
                openPokemonFormSelector(newIndex);
              }}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <Search className="h-4 w-4 mr-1" />
              Add Pokémon
            </button>
          </div>
        </div>

        {/* Team Generation Tools */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border">
          <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Shuffle className="h-4 w-4 mr-2 text-indigo-600" />
            Team Generation
          </h5>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => generateRandomTeam(6)}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Shuffle className="h-4 w-4 mr-1" />
              {isGenerating ? 'Generating...' : 'Random Team'}
            </button>
            
            <select
              onChange={(e) => {
                if (e.target.value) {
                  generateTeamByType(e.target.value, 6);
                  e.target.value = '';
                }
              }}
              disabled={isGenerating}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors"
            >
              <option value="">Generate by Type</option>
              <option value="fire">🔥 Fire Team</option>
              <option value="water">💧 Water Team</option>
              <option value="grass">🌱 Grass Team</option>
              <option value="electric">⚡ Electric Team</option>
              <option value="psychic">🔮 Psychic Team</option>
              <option value="fighting">👊 Fighting Team</option>
              <option value="poison">☠️ Poison Team</option>
              <option value="ground">🌍 Ground Team</option>
              <option value="rock">🗿 Rock Team</option>
              <option value="bug">🐛 Bug Team</option>
              <option value="ghost">👻 Ghost Team</option>
              <option value="steel">⚔️ Steel Team</option>
              <option value="dragon">🐉 Dragon Team</option>
              <option value="dark">🌑 Dark Team</option>
              <option value="fairy">🧚 Fairy Team</option>
            </select>

            <button
              type="button"
              onClick={() => generateRandomTeam(3)}
              disabled={isGenerating}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200 disabled:opacity-50 transition-colors"
            >
              <Zap className="h-4 w-4 mr-1" />
              Quick 3
            </button>
          </div>
        </div>

        {/* Pokemon List/Grid */}
        {party.pokemon.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No Pokémon in the team</p>
            <p className="text-gray-400 text-sm mt-1">Start by adding a Pokémon</p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-3"}>
            {party.pokemon.map((pokemon, index) => (
              <PokemonCard
                key={index}
                pokemonString={pokemon}
                index={index}
                onUpdate={updatePokemon}
                onRemove={removePokemon}
                onOpenSelector={openPokemonFormSelector}
                isCompact={viewMode === 'list'}
              />
            ))}
          </div>
        )}

        {/* Static configuration */}
        <div className="pt-4 border-t border-gray-200">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={party.isStatic || false}
              onChange={(e) => handlePartyChange({ ...party, isStatic: e.target.checked })}
              className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">Static Party</span>
          </label>
          <p className="text-xs text-gray-500 mt-2 ml-7">
            If true, party won't change between battles
          </p>
        </div>
      </div>
    );
  };

  const renderPoolParty = () => {
    const party = config.party as PoolPartyProvider;
    
    const addPoolEntry = () => {
      handlePartyChange({
        ...party,
        pool: [...party.pool, { pokemon: '', weight: 1 }]
      });
    };

    const removePoolEntry = (index: number) => {
      handlePartyChange({
        ...party,
        pool: party.pool.filter((_, i) => i !== index)
      });
    };

    const updatePoolEntry = (index: number, field: keyof PoolEntry, value: any) => {
      const newPool = [...party.pool];
      newPool[index] = { ...newPool[index], [field]: value };
      handlePartyChange({
        ...party,
        pool: newPool
      });
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Pokemon</label>
            <input
              type="number"
              min="1"
              max="6"
              value={party.minPokemon || 1}
              onChange={(e) => handlePartyChange({ ...party, minPokemon: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Pokemon</label>
            <input
              type="number"
              min="1"
              max="6"
              value={party.maxPokemon || 6}
              onChange={(e) => handlePartyChange({ ...party, maxPokemon: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h4 className="font-medium">Pool Entries</h4>
          <button
            type="button"
            onClick={addPoolEntry}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Entry
          </button>
        </div>

        {party.pool.map((entry, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <h5 className="font-medium text-sm">Entry {index + 1}</h5>
              <button
                type="button"
                onClick={() => removePoolEntry(index)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700">Pokemon</label>
              <input
                type="text"
                value={entry.pokemon}
                onChange={(e) => updatePoolEntry(index, 'pokemon', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="pikachu level=50"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Weight</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={entry.weight || 1}
                  onChange={(e) => updatePoolEntry(index, 'weight', parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Selectable Times</label>
                <input
                  type="number"
                  min="0"
                  value={entry.selectableTimes || ''}
                  onChange={(e) => updatePoolEntry(index, 'selectableTimes', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Level Variation</label>
                <input
                  type="number"
                  min="0"
                  value={entry.levelVariation || ''}
                  onChange={(e) => updatePoolEntry(index, 'levelVariation', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={party.isStatic || false}
              onChange={(e) => handlePartyChange({ ...party, isStatic: e.target.checked })}
              className="form-checkbox"
            />
            <span className="ml-2 text-sm">Static</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={party.useFixedRandom || false}
              onChange={(e) => handlePartyChange({ ...party, useFixedRandom: e.target.checked })}
              className="form-checkbox"
            />
            <span className="ml-2 text-sm">Fixed Random</span>
          </label>
        </div>
      </div>
    );
  };

  const renderScriptParty = () => {
    const party = config.party as { type: 'script'; script: string; isStatic?: boolean };
    
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Script Resource Location</label>
          <input
            type="text"
            value={party.script}
            onChange={(e) => handlePartyChange({ ...party, script: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="cobblemon:party_script"
          />
        </div>

        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={party.isStatic || false}
            onChange={(e) => handlePartyChange({ ...party, isStatic: e.target.checked })}
            className="form-checkbox"
          />
          <span className="ml-2 text-sm">Static Party</span>
        </label>
      </div>
    );
  };

  if (!config.battleConfiguration?.canChallenge) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Pokemon Party</h2>
        <p className="text-gray-500 italic">Enable battle configuration to set up a party</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Pokemon Party</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Party Type</label>
          <div className="flex space-x-4">
            {(['simple', 'pool', 'script'] as const).map((type) => (
              <label key={type} className="inline-flex items-center">
                <input
                  type="radio"
                  value={type}
                  checked={partyType === type}
                  onChange={(e) => handlePartyTypeChange(e.target.value as 'simple' | 'pool' | 'script')}
                  className="form-radio"
                />
                <span className="ml-2 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {partyType === 'simple' && renderSimpleParty()}
        {partyType === 'pool' && renderPoolParty()}
        {partyType === 'script' && renderScriptParty()}
      </div>

      <PokemonFormSelector
        isOpen={showPokemonFormSelector}
        onSelect={handlePokemonFormSelect}
        onClose={() => {
          setShowPokemonFormSelector(false);
          setSelectedPokemonIndex(-1);
          setCurrentPokemonString('');
        }}
        initialPokemonString={currentPokemonString}
      />
    </>
  );
}