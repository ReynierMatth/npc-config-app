import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { NPCConfiguration, NPCPartyProvider, SimplePartyProvider, PoolPartyProvider, PoolEntry } from '../types/npc';

interface NPCPartyBuilderProps {
  config: NPCConfiguration;
  onChange: (config: NPCConfiguration) => void;
}

export function NPCPartyBuilder({ config, onChange }: NPCPartyBuilderProps) {
  const [partyType, setPartyType] = useState<'simple' | 'pool' | 'script'>(config.party?.type || 'simple');

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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Pokemon List</h4>
          <button
            type="button"
            onClick={addPokemon}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Pokemon
          </button>
        </div>

        {party.pokemon.map((pokemon, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={pokemon}
              onChange={(e) => updatePokemon(index, e.target.value)}
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="pikachu level=50 moves=thunderbolt,quick-attack"
            />
            <button
              type="button"
              onClick={() => removePokemon(index)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={party.isStatic || false}
              onChange={(e) => handlePartyChange({ ...party, isStatic: e.target.checked })}
              className="form-checkbox"
            />
            <span className="ml-2 text-sm">Static Party</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">If true, party won't change between battles</p>
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
  );
}