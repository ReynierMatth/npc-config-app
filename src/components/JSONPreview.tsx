import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import type { NPCConfiguration, DialogueConfiguration } from '../types/npc';
import { ValidationPanel } from './ValidationPanel';

interface JSONPreviewProps {
  npcConfig: NPCConfiguration;
  dialogueConfig: DialogueConfiguration | null;
}

export function JSONPreview({ npcConfig, dialogueConfig }: JSONPreviewProps) {
  const [copiedNPC, setCopiedNPC] = useState(false);
  const [copiedDialogue, setCopiedDialogue] = useState(false);

  const cleanNPCConfig = (config: NPCConfiguration) => {
    const cleaned = { ...config };
    
    // Remove empty or undefined values
    Object.keys(cleaned).forEach(key => {
      const value = cleaned[key as keyof NPCConfiguration];
      if (value === undefined || value === null || 
          (typeof value === 'string' && value === '') ||
          (Array.isArray(value) && value.length === 0)) {
        delete cleaned[key as keyof NPCConfiguration];
      }
    });

    // Remove empty battle configuration
    if (cleaned.battleConfiguration && !cleaned.battleConfiguration.canChallenge) {
      delete cleaned.battleConfiguration;
    }

    // Remove party if no battle configuration
    if (!cleaned.battleConfiguration?.canChallenge) {
      delete cleaned.party;
    }

    return cleaned;
  };

  const npcJson = JSON.stringify(cleanNPCConfig(npcConfig), null, 2);
  const dialogueJson = dialogueConfig ? JSON.stringify(dialogueConfig, null, 2) : null;

  const copyToClipboard = async (text: string, type: 'npc' | 'dialogue') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'npc') {
        setCopiedNPC(true);
        setTimeout(() => setCopiedNPC(false), 2000);
      } else {
        setCopiedDialogue(true);
        setTimeout(() => setCopiedDialogue(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadJSON = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateFilenames = () => {
    const baseName = (npcConfig.resourceIdentifier || 'cobblemon:npc')
      .split(':')[1] || 'npc';
    
    return {
      npc: `${baseName}.json`,
      dialogue: `${baseName}-dialogue.json`
    };
  };

  const filenames = generateFilenames();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">JSON Preview & Export</h2>

      {/* Validation Panel */}
      <ValidationPanel npcConfig={npcConfig} dialogueConfig={dialogueConfig} />

      {/* NPC Configuration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">NPC Configuration</h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => copyToClipboard(npcJson, 'npc')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {copiedNPC ? (
                <Check className="h-4 w-4 mr-1 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              Copy
            </button>
            <button
              type="button"
              onClick={() => downloadJSON(npcJson, filenames.npc)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
          <pre className="text-sm text-gray-100 whitespace-pre-wrap">
            {npcJson}
          </pre>
        </div>
        
        <p className="text-sm text-gray-600">
          Save as: <code className="bg-gray-100 px-1 rounded">{filenames.npc}</code> in your mod's data folder
        </p>
      </div>

      {/* Dialogue Configuration */}
      {dialogueConfig && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Dialogue Configuration</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => copyToClipboard(dialogueJson!, 'dialogue')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {copiedDialogue ? (
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                Copy
              </button>
              <button
                type="button"
                onClick={() => downloadJSON(dialogueJson!, filenames.dialogue)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-sm text-gray-100 whitespace-pre-wrap">
              {dialogueJson}
            </pre>
          </div>
          
          <p className="text-sm text-gray-600">
            Save as: <code className="bg-gray-100 px-1 rounded">{filenames.dialogue}</code> in your mod's dialogues folder
          </p>
        </div>
      )}

      {/* File Structure Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">File Structure Guide</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>Place your files in the following locations within your mod:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>
              <strong>NPC Config:</strong> <code>data/&lt;namespace&gt;/npcs/{filenames.npc}</code>
            </li>
            {dialogueConfig && (
              <li>
                <strong>Dialogue Config:</strong> <code>data/&lt;namespace&gt;/dialogues/{filenames.dialogue}</code>
              </li>
            )}
          </ul>
          <p className="mt-2 text-xs">
            Replace <code>&lt;namespace&gt;</code> with your mod's namespace (e.g., "cobblemon", "mymod")
          </p>
        </div>
      </div>
    </div>
  );
}