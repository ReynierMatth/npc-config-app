import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { NPCConfiguration, MoLangConfigVariable } from '../types/npc';

interface ConfigVariablesEditorProps {
  config: NPCConfiguration;
  onChange: (config: NPCConfiguration) => void;
}

export const ConfigVariablesEditor: React.FC<ConfigVariablesEditorProps> = ({ config, onChange }) => {
  const addVariable = () => {
    const newVariable: MoLangConfigVariable = {
      variableName: '',
      displayName: '',
      description: '',
      type: 'TEXT',
      defaultValue: ''
    };

    onChange({
      ...config,
      config: [...config.config, newVariable]
    });
  };

  const removeVariable = (index: number) => {
    onChange({
      ...config,
      config: config.config.filter((_, i) => i !== index)
    });
  };

  const updateVariable = (index: number, field: keyof MoLangConfigVariable, value: any) => {
    const newConfig = [...config.config];
    newConfig[index] = { ...newConfig[index], [field]: value };
    onChange({
      ...config,
      config: newConfig
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Configuration Variables</h2>
        <button
          type="button"
          onClick={addVariable}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Variable
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Configuration variables allow for customizable NPC behavior through MoLang expressions.
        These variables can be referenced in dialogues, scripts, and other configurations.
      </p>

      {config.config.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No configuration variables defined. Click "Add Variable" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {config.config.map((variable, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Variable {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeVariable(index)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Remove variable"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Variable Name</label>
                  <input
                    type="text"
                    value={variable.variableName}
                    onChange={(e) => updateVariable(index, 'variableName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="challenge_cooldown"
                  />
                  <p className="text-xs text-gray-500 mt-1">Internal identifier for the variable</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <input
                    type="text"
                    value={variable.displayName}
                    onChange={(e) => updateVariable(index, 'displayName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Challenge Cooldown"
                  />
                  <p className="text-xs text-gray-500 mt-1">Human-readable name shown in UI</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={variable.description}
                    onChange={(e) => updateVariable(index, 'description', e.target.value)}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="How long in ticks the NPC will be un-challengable from that player's last challenge."
                  />
                  <p className="text-xs text-gray-500 mt-1">Detailed description of what this variable controls</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={variable.type}
                    onChange={(e) => updateVariable(index, 'type', e.target.value as MoLangConfigVariable['type'])}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="BOOLEAN">Boolean</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Data type for the variable</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Value</label>
                  {variable.type === 'BOOLEAN' ? (
                    <select
                      value={variable.defaultValue.toString()}
                      onChange={(e) => updateVariable(index, 'defaultValue', e.target.value === 'true')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="false">False</option>
                      <option value="true">True</option>
                    </select>
                  ) : variable.type === 'NUMBER' ? (
                    <input
                      type="number"
                      value={String(variable.defaultValue)}
                      onChange={(e) => updateVariable(index, 'defaultValue', e.target.value ? parseFloat(e.target.value) : 0)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(variable.defaultValue)}
                      onChange={(e) => updateVariable(index, 'defaultValue', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Default text value"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">Initial value for the variable</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};