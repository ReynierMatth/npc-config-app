import React from 'react';
import type { NPCConfiguration, NPCInteraction } from '../types/npc';

interface NPCInteractionEditorProps {
  config: NPCConfiguration;
  onChange: (config: NPCConfiguration) => void;
}

export const NPCInteractionEditor: React.FC<NPCInteractionEditorProps> = ({ config, onChange }) => {
  const handleInteractionChange = (interaction: NPCInteraction) => {
    onChange({ ...config, interaction });
  };

  const handleTypeChange = (type: NPCInteraction['type']) => {
    switch (type) {
      case 'dialogue':
        handleInteractionChange({ type: 'dialogue', dialogue: '' });
        break;
      case 'script':
        handleInteractionChange({ type: 'script', script: '' });
        break;
      case 'custom_script':
        handleInteractionChange({ type: 'custom_script', script: '' });
        break;
      case 'none':
        handleInteractionChange({ type: 'none' });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Interaction Configuration</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Interaction Type</label>
        <div className="space-y-2">
          {(['dialogue', 'script', 'custom_script', 'none'] as const).map((type) => (
            <label key={type} className="inline-flex items-center mr-6">
              <input
                type="radio"
                value={type}
                checked={config.interaction.type === type}
                onChange={(e) => handleTypeChange(e.target.value as NPCInteraction['type'])}
                className="form-radio"
              />
              <span className="ml-2">
                {type === 'dialogue' && 'Dialogue'}
                {type === 'script' && 'Predefined Script'}
                {type === 'custom_script' && 'Custom Script'}
                {type === 'none' && 'No Interaction'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {config.interaction.type === 'dialogue' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Dialogue Resource Location</label>
          <input
            type="text"
            value={config.interaction.dialogue}
            onChange={(e) => handleInteractionChange({ type: 'dialogue', dialogue: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="cobblemon:my_dialogue"
          />
          <p className="text-xs text-gray-500 mt-1">
            Reference to a dialogue file (e.g., "cobblemon:my_dialogue" refers to data/cobblemon/dialogues/my_dialogue.json)
          </p>
        </div>
      )}

      {config.interaction.type === 'script' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Script Resource Location</label>
          <input
            type="text"
            value={config.interaction.script}
            onChange={(e) => handleInteractionChange({ type: 'script', script: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="cobblemon:my_script"
          />
          <p className="text-xs text-gray-500 mt-1">
            Reference to a MoLang script file (e.g., "cobblemon:my_script" refers to data/cobblemon/molang/my_script.molang)
          </p>
        </div>
      )}

      {config.interaction.type === 'custom_script' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Custom MoLang Script</label>
          <textarea
            value={config.interaction.script}
            onChange={(e) => handleInteractionChange({ type: 'custom_script', script: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="q.player.send_message('Hello from custom script!');"
          />
          <p className="text-xs text-gray-500 mt-1">
            Direct MoLang script code to execute when player interacts with NPC
          </p>
        </div>
      )}

      {config.interaction.type === 'none' && (
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600">
            This NPC will not respond to player interactions. Useful for decorative NPCs.
          </p>
        </div>
      )}
    </div>
  );
};