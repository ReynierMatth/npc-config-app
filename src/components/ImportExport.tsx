import React, { useRef } from 'react';
import { Upload, Download, FileText, AlertTriangle } from 'lucide-react';
import type { NPCConfiguration, DialogueConfiguration } from '../types/npc';

interface ImportExportProps {
  npcConfig: NPCConfiguration;
  dialogueConfig: DialogueConfiguration | null;
  onNPCConfigLoad: (config: NPCConfiguration) => void;
  onDialogueConfigLoad: (config: DialogueConfiguration) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({
  npcConfig,
  dialogueConfig,
  onNPCConfigLoad,
  onDialogueConfigLoad
}) => {
  const npcFileInputRef = useRef<HTMLInputElement>(null);
  const dialogueFileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [importSuccess, setImportSuccess] = React.useState<string | null>(null);

  const handleFileRead = (
    file: File,
    onLoad: (config: any) => void,
    configType: string
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content);
        
        // Basic validation
        if (configType === 'npc') {
          if (!config.resourceIdentifier || !config.names) {
            throw new Error('Invalid NPC configuration: missing required fields');
          }
        } else if (configType === 'dialogue') {
          if (!config.pages || !config.speakers) {
            throw new Error('Invalid dialogue configuration: missing required fields');
          }
        }
        
        onLoad(config);
        setImportSuccess(`${configType} configuration loaded successfully!`);
        setImportError(null);
        setTimeout(() => setImportSuccess(null), 3000);
      } catch (error) {
        setImportError(`Error loading ${configType}: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
        setImportSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  const handleNPCFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileRead(file, onNPCConfigLoad, 'npc');
    }
  };

  const handleDialogueFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileRead(file, onDialogueConfigLoad, 'dialogue');
    }
  };

  const exportExample = () => {
    const exampleNPC: NPCConfiguration = {
      hitbox: "player",
      presets: [],
      resourceIdentifier: "mymod:example_npc",
      config: [
        {
          variableName: "greeting_message",
          displayName: "Greeting Message",
          description: "The message displayed when first talking to the NPC",
          type: "TEXT",
          defaultValue: "Hello, trainer!"
        }
      ],
      isInvulnerable: true,
      canDespawn: false,
      names: ["Example NPC"],
      interaction: {
        type: "dialogue",
        dialogue: "mymod:example_dialogue"
      },
      battleConfiguration: {
        canChallenge: true
      },
      skill: 3,
      party: {
        type: "simple",
        pokemon: [
          "pikachu level=25 moves=thunderbolt,quick-attack",
          "charmander level=24 moves=ember,scratch"
        ]
      }
    };

    const exampleDialogue: DialogueConfiguration = {
      speakers: {
        npc: {
          name: { type: "expression", expression: "q.npc.name" },
          face: "q.npc.face(false);"
        },
        player: {
          name: { type: "expression", expression: "q.player.username" },
          face: "q.player.face();"
        }
      },
      pages: [
        {
          id: "greeting",
          speaker: "npc",
          lines: ["Hello there, trainer! Would you like to battle?"],
          input: {
            type: "option",
            vertical: true,
            options: [
              {
                text: "Yes, let's battle!",
                value: "accept",
                action: ["q.npc.start_battle(q.player, 'single');"]
              },
              {
                text: "Maybe later.",
                value: "decline",
                action: ["q.dialogue.close();"]
              }
            ]
          }
        }
      ]
    };

    // Download both files
    const downloadFile = (content: string, filename: string) => {
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

    downloadFile(JSON.stringify(exampleNPC, null, 2), 'example_npc.json');
    downloadFile(JSON.stringify(exampleDialogue, null, 2), 'example_dialogue.json');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Import & Export</h2>

      {/* Status Messages */}
      {importError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Import Error</h3>
              <p className="text-sm text-red-700">{importError}</p>
            </div>
          </div>
        </div>
      )}

      {importSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <FileText className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{importSuccess}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Import Configurations</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import NPC Configuration
              </label>
              <input
                ref={npcFileInputRef}
                type="file"
                accept=".json"
                onChange={handleNPCFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => npcFileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose NPC JSON File
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Dialogue Configuration
              </label>
              <input
                ref={dialogueFileInputRef}
                type="file"
                accept=".json"
                onChange={handleDialogueFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => dialogueFileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Dialogue JSON File
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 text-sm">Import Tips</h4>
            <ul className="mt-2 text-xs text-blue-800 space-y-1">
              <li>• Files must be valid JSON format</li>
              <li>• NPC configs require resourceIdentifier and names</li>
              <li>• Dialogue configs require pages and speakers</li>
              <li>• Import will override current configuration</li>
            </ul>
          </div>
        </div>

        {/* Export/Examples Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Examples & Templates</h3>
          
          <div className="space-y-3">
            <button
              type="button"
              onClick={exportExample}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Example Files
            </button>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 text-sm mb-2">Example Includes:</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Complete NPC with battle configuration</li>
                <li>• Simple dialogue with options</li>
                <li>• Configuration variables example</li>
                <li>• Battle party setup</li>
                <li>• MoLang expressions</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 text-sm">Quick Start</h4>
            <p className="mt-1 text-xs text-yellow-700">
              Download the example files to see a complete working NPC configuration. 
              You can then import and modify them to create your own NPCs.
            </p>
          </div>
        </div>
      </div>

      {/* Current Configuration Summary */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Current Configuration Summary</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-900">NPC Name</dt>
              <dd className="text-gray-700">{npcConfig.names[0] || 'Unnamed NPC'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Resource ID</dt>
              <dd className="text-gray-700 font-mono text-xs">{npcConfig.resourceIdentifier || 'Not set'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Interaction</dt>
              <dd className="text-gray-700 capitalize">{npcConfig.interaction.type}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Can Battle</dt>
              <dd className="text-gray-700">{npcConfig.battleConfiguration?.canChallenge ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Config Variables</dt>
              <dd className="text-gray-700">{npcConfig.config.length}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Has Dialogue</dt>
              <dd className="text-gray-700">{dialogueConfig ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};