import type { NPCConfiguration, NPCInteraction } from '../types/npc';

interface NPCInteractionEditorProps {
  config: NPCConfiguration;
  onChange: (config: NPCConfiguration) => void;
}

export function NPCInteractionEditor({ config, onChange }: NPCInteractionEditorProps) {
  const currentInteraction = config.interaction || { type: 'none' };

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
                checked={currentInteraction.type === type}
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

      {currentInteraction.type === 'dialogue' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Dialogue Reference</label>
          <input
            type="text"
            value={currentInteraction.dialogue || ''}
            onChange={(e) => handleInteractionChange({ type: 'dialogue', dialogue: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="dialogue_id"
          />
        </div>
      )}

      {currentInteraction.type === 'script' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Script Path</label>
          <input
            type="text"
            value={currentInteraction.script || ''}
            onChange={(e) => handleInteractionChange({ type: 'script', script: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="path/to/script.js"
          />
        </div>
      )}

      {currentInteraction.type === 'custom_script' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Custom Script</label>
          <textarea
            value={currentInteraction.script || ''}
            onChange={(e) => handleInteractionChange({ type: 'custom_script', script: e.target.value })}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="// Your custom script here..."
          />
        </div>
      )}

      {currentInteraction.type === 'none' && (
        <div className="text-gray-500 italic">
          This NPC will not have any special interaction behavior.
        </div>
      )}
    </div>
  );
}