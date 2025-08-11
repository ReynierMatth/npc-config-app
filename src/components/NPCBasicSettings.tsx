import type { NPCConfiguration, NPCHitboxValue } from '../types/npc';

interface NPCBasicSettingsProps {
  config: NPCConfiguration;
  onChange: (config: NPCConfiguration) => void;
}

export function NPCBasicSettings({ config, onChange }: NPCBasicSettingsProps) {
  const handleChange = (field: keyof NPCConfiguration, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const handleHitboxChange = (hitbox: NPCHitboxValue) => {
    handleChange('hitbox', hitbox);
  };

  const handleNamesChange = (names: string) => {
    handleChange('names', names.split(',').map(name => name.trim()).filter(name => name));
  };

  const handleAspectsChange = (aspects: string) => {
    handleChange('aspects', aspects ? aspects.split(',').map(aspect => aspect.trim()).filter(aspect => aspect) : undefined);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Basic Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Resource Identifier</label>
          <input
            type="text"
            value={config.resourceIdentifier}
            onChange={(e) => handleChange('resourceIdentifier', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="cobblemon:npc_name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Names (comma-separated)</label>
          <input
            type="text"
            value={config.names.join(', ')}
            onChange={(e) => handleNamesChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="NPC Name 1, NPC Name 2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hitbox</label>
          <div className="mt-1 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={config.hitbox === "player"}
                onChange={() => handleHitboxChange("player")}
                className="form-radio"
              />
              <span className="ml-2">Player (default)</span>
            </label>
            <div className="space-y-1">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={typeof config.hitbox === "object"}
                  onChange={() => handleHitboxChange({ width: 0.6, height: 1.8 })}
                  className="form-radio"
                />
                <span className="ml-2">Custom</span>
              </label>
              {typeof config.hitbox === "object" && (
                <div className="ml-6 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600">Width</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.hitbox.width}
                      onChange={(e) => handleHitboxChange({ 
                        width: parseFloat(e.target.value), 
                        height: typeof config.hitbox === "object" ? config.hitbox.height : 1.8 
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Height</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.hitbox.height}
                      onChange={(e) => handleHitboxChange({ 
                        width: typeof config.hitbox === "object" ? config.hitbox.width : 0.6, 
                        height: parseFloat(e.target.value) 
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Model Scale</label>
          <input
            type="number"
            step="0.01"
            value={config.modelScale || 0.9375}
            onChange={(e) => handleChange('modelScale', parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Aspects (comma-separated)</label>
          <input
            type="text"
            value={config.aspects?.join(', ') || ''}
            onChange={(e) => handleAspectsChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="aspect1, aspect2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">Behavior Settings</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={config.isInvulnerable || false}
              onChange={(e) => handleChange('isInvulnerable', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Invulnerable</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={!(config.canDespawn ?? true)}
              onChange={(e) => handleChange('canDespawn', !e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Persistent</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={config.isMovable ?? true}
              onChange={(e) => handleChange('isMovable', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Movable</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={config.isLeashable || false}
              onChange={(e) => handleChange('isLeashable', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Leashable</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={config.allowProjectileHits ?? true}
              onChange={(e) => handleChange('allowProjectileHits', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Projectile Hits</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={config.hideNameTag || false}
              onChange={(e) => handleChange('hideNameTag', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Hide Name Tag</span>
          </label>
        </div>
      </div>
    </div>
  );
}