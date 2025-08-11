import React, { useState } from 'react';
import { Settings, MessageSquare, Sword, Users, Code, FileText, Upload } from 'lucide-react';
import type { NPCConfiguration, DialogueConfiguration } from './types/npc';
import { NPCBasicSettings } from './components/NPCBasicSettings';
import { NPCBattleConfiguration } from './components/NPCBattleConfiguration';
import { NPCPartyBuilder } from './components/NPCPartyBuilder';
import { NPCInteractionEditor } from './components/NPCInteractionEditor';
import { ConfigVariablesEditor } from './components/ConfigVariablesEditor';
import { DialogueEditor } from './components/DialogueEditor';
import { JSONPreview } from './components/JSONPreview';
import { ImportExport } from './components/ImportExport';

type Tab = 'basic' | 'battle' | 'party' | 'interaction' | 'variables' | 'dialogue' | 'preview' | 'import';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  
  const [npcConfig, setNpcConfig] = useState<NPCConfiguration>({
    hitbox: "player",
    presets: [],
    resourceIdentifier: "cobblemon:my_npc",
    config: [],
    names: ["My NPC"],
    interaction: { type: "none" }
  });

  const [dialogueConfig, setDialogueConfig] = useState<DialogueConfiguration | null>(null);

  // Handle dialogue creation when interaction type changes to dialogue
  React.useEffect(() => {
    if (npcConfig.interaction.type === 'dialogue' && !dialogueConfig) {
      const newDialogue: DialogueConfiguration = {
        speakers: {
          npc: {
            name: { type: 'expression', expression: 'q.npc.name' },
            face: 'q.npc.face(false);'
          },
          player: {
            name: { type: 'expression', expression: 'q.player.username' },
            face: 'q.player.face();'
          }
        },
        pages: [{
          id: 'greeting',
          speaker: 'npc',
          lines: ['Hello there!'],
          input: 'q.dialogue.close();'
        }]
      };
      setDialogueConfig(newDialogue);
    }
  }, [npcConfig.interaction.type, dialogueConfig]);

  const tabs = [
    { id: 'basic', name: 'Basic Settings', icon: Settings },
    { id: 'battle', name: 'Battle Config', icon: Sword },
    { id: 'party', name: 'Pokemon Party', icon: Users },
    { id: 'interaction', name: 'Interaction', icon: MessageSquare },
    { id: 'variables', name: 'Variables', icon: Code },
    { id: 'dialogue', name: 'Dialogue', icon: MessageSquare },
    { id: 'preview', name: 'JSON Preview', icon: FileText },
    { id: 'import', name: 'Import/Export', icon: Upload }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'basic':
        return <NPCBasicSettings config={npcConfig} onChange={setNpcConfig} />;
      case 'battle':
        return <NPCBattleConfiguration config={npcConfig} onChange={setNpcConfig} />;
      case 'party':
        return <NPCPartyBuilder config={npcConfig} onChange={setNpcConfig} />;
      case 'interaction':
        return <NPCInteractionEditor config={npcConfig} onChange={setNpcConfig} />;
      case 'variables':
        return <ConfigVariablesEditor config={npcConfig} onChange={setNpcConfig} />;
      case 'dialogue':
        return <DialogueEditor dialogue={dialogueConfig} onChange={setDialogueConfig} />;
      case 'preview':
        return <JSONPreview npcConfig={npcConfig} dialogueConfig={dialogueConfig} />;
      case 'import':
        return (
          <ImportExport
            npcConfig={npcConfig}
            dialogueConfig={dialogueConfig}
            onNPCConfigLoad={setNpcConfig}
            onDialogueConfigLoad={setDialogueConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Cobblemon NPC Creator</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Create and customize NPCs for your Cobblemon mod
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
                        isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {tab.name}
                  </button>
                );
              })}
            </nav>

            {/* Quick Info Panel */}
            <div className="mt-8 bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Current NPC</h3>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="font-medium text-gray-700">Name</dt>
                  <dd className="text-gray-600">{npcConfig.names[0] || 'Unnamed'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Type</dt>
                  <dd className="text-gray-600 capitalize">
                    {npcConfig.battleConfiguration?.canChallenge ? 'Trainer' : 'NPC'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Interaction</dt>
                  <dd className="text-gray-600 capitalize">{npcConfig.interaction.type}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Variables</dt>
                  <dd className="text-gray-600">{npcConfig.config.length}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-8 lg:mt-0 lg:col-span-9">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-8">
                {renderActiveTab()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Built for the Cobblemon Minecraft mod - Create amazing NPCs for your world!
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;