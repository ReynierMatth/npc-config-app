import React from 'react';
import type { NPCConfiguration } from '../types/npc';

interface NPCBattleConfigurationProps {
  config: NPCConfiguration;
  onChange: (config: NPCConfiguration) => void;
}

export const NPCBattleConfiguration: React.FC<NPCBattleConfigurationProps> = ({ config, onChange }) => {
  const handleChange = (field: keyof NPCConfiguration, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleBattleConfigChange = (field: string, value: any) => {
    onChange({
      ...config,
      battleConfiguration: {
        canChallenge: config.battleConfiguration?.canChallenge ?? false,
        ...config.battleConfiguration,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Battle Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={config.battleConfiguration?.canChallenge || false}
              onChange={(e) => handleBattleConfigChange('canChallenge', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Can Challenge</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">Allow players to battle this NPC</p>
        </div>

        {config.battleConfiguration?.canChallenge && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Skill Level</label>
              <select
                value={config.skill || 1}
                onChange={(e) => handleChange('skill', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value={1}>1 - Beginner</option>
                <option value={2}>2 - Novice</option>
                <option value={3}>3 - Intermediate</option>
                <option value={4}>4 - Advanced</option>
                <option value={5}>5 - Expert</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">AI difficulty level (1-5)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Battle Theme</label>
              <input
                type="text"
                value={config.battleTheme || ''}
                onChange={(e) => handleChange('battleTheme', e.target.value || undefined)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="cobblemon:battle_music"
              />
              <p className="text-xs text-gray-500 mt-1">Resource location for battle music</p>
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoHealParty || false}
                  onChange={(e) => handleChange('autoHealParty', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2">Auto Heal Party</span>
              </label>
              <p className="text-xs text-gray-500">Heal Pokemon between battles</p>
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={config.randomizePartyOrder || false}
                  onChange={(e) => handleChange('randomizePartyOrder', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2">Randomize Party Order</span>
              </label>
              <p className="text-xs text-gray-500">Randomize lead Pokemon</p>
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={config.battleConfiguration?.simultaneousBattles || false}
                  onChange={(e) => handleBattleConfigChange('simultaneousBattles', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2">Simultaneous Battles</span>
              </label>
              <p className="text-xs text-gray-500">Allow multiple players to battle at once (deprecated)</p>
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={config.battleConfiguration?.healAfterwards ?? true}
                  onChange={(e) => handleBattleConfigChange('healAfterwards', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2">Heal Afterwards</span>
              </label>
              <p className="text-xs text-gray-500">Heal player's party after battle (deprecated)</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};