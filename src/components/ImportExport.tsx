import React, { useRef, useState } from 'react';
import { Download, FileText, Package } from 'lucide-react';
import JSZip from 'jszip';
import type {DialogueConfiguration, NPCConfig} from '../types/npc';

interface ImportExportProps {
  npcConfigs: NPCConfig[];
  dialogueConfiguration: DialogueConfiguration | null;
  onImport: (configs: NPCConfig[]) => void;
}

const MINECRAFT_VERSIONS = [
  { value: '1.20.1', label: 'Minecraft 1.20.1' },
  { value: '1.20.2', label: 'Minecraft 1.20.2' },
  { value: '1.20.3', label: 'Minecraft 1.20.3' },
  { value: '1.20.4', label: 'Minecraft 1.20.4' },
  { value: '1.20.5', label: 'Minecraft 1.20.5' },
  { value: '1.20.6', label: 'Minecraft 1.20.6' },
  { value: '1.21', label: 'Minecraft 1.21' },
  { value: '1.21.1', label: 'Minecraft 1.21.1' },
];

const PACK_FORMAT: { [key: string]: number } = {
  '1.20.1': 15,
  '1.20.2': 18,
  '1.20.3': 26,
  '1.20.4': 26,
  '1.20.5': 41,
  '1.20.6': 48,
  '1.21': 48,
  '1.21.1': 48,
};

export function ImportExport({ npcConfigs, dialogueConfiguration, onImport }: ImportExportProps) {
  const npcFileInputRef = useRef<HTMLInputElement>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [minecraftVersion, setMinecraftVersion] = useState('1.20.1');
  const [datapackName, setDatapackName] = useState('cobblemon_npcs');

  const handleImportNPCs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const configs = JSON.parse(content);

        if (!Array.isArray(configs)) {
          setImportError('Le fichier doit contenir un tableau de configurations NPC');
          return;
        }

        // Validation basique de la structure
        for (let index = 0; index < configs.length; index++) {
          const config = configs[index];
          if (!config.id || !config.name) {
            setImportError(`Configuration NPC ${index + 1} invalide: id et name sont requis`);
            return;
          }
        }

        onImport(configs);
        setImportSuccess(`${configs.length} configuration(s) NPC importée(s) avec succès`);

        // Reset input
        if (npcFileInputRef.current) {
          npcFileInputRef.current.value = '';
        }
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Erreur lors de l\'importation');
      }
    };
    reader.readAsText(file);
  };

  const generatePackMcmeta = (version: string, packName: string) => {
    const packFormat = PACK_FORMAT[version] || 15;

    return {
      pack: {
        pack_format: packFormat,
        description: `${packName} - Datapack pour Cobblemon avec NPCs personnalisés`
      }
    };
  };

  const generateNPCFile = (npc: NPCConfig) => {
    return {
      aspects: npc.aspects || [],
      model: npc.model || "cobblemon:generic_npc",
      dialogue: npc.dialogue ? [`${npc.id}_dialogue`] : [],
      party: npc.party || [],
      battleTheme: npc.battleConfiguration?.battleTheme || "",
      victoryTheme: npc.battleConfiguration?.victoryTheme || "",
      defeatTheme: npc.battleConfiguration?.defeatTheme || "",
      canBattle: npc.battleConfiguration?.canBattle || false,
      ...npc.configVariables
    };
  };

  const exportAsDatapack = async () => {
    try {
      setExportError(null);

      if (npcConfigs.length === 0) {
        setExportError('Aucune configuration NPC à exporter');
        return;
      }

      if (!datapackName.trim()) {
        setExportError('Le nom du datapack est requis');
        return;
      }

      const zip = new JSZip();

      // Générer pack.mcmeta
      const packMcmeta = generatePackMcmeta(minecraftVersion, datapackName);
      zip.file('pack.mcmeta', JSON.stringify(packMcmeta, null, 2));

      // Créer les dossiers de structure
      const dataFolder = zip.folder('data');
      const cobblemonFolder = dataFolder!.folder('cobblemon');
      const npcsFolder = cobblemonFolder!.folder('npc');
      const dialogueFolder = cobblemonFolder!.folder('dialogue');

      // Générer les fichiers pour chaque NPC
      for (const npc of npcConfigs) {
        // Fichier NPC
        const npcFile = generateNPCFile(npc);
        npcsFolder!.file(`${npc.id}.json`, JSON.stringify(npcFile, null, 2));

        console.log(dialogueConfiguration)
        if (dialogueConfiguration) {
          console.log(dialogueConfiguration)
          // Utiliser la même approche que JSONPreview.tsx - sérialisation directe
          const dialogueJson = JSON.stringify(dialogueConfiguration, null, 2);
          dialogueFolder!.file(`${npc.id}_dialogue.json`, dialogueJson);
        }
      }

      // Générer le ZIP et déclencher le téléchargement
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${datapackName}.zip`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Erreur lors de l\'exportation');
    }
  };

  const exportAsJSON = () => {
    try {
      setExportError(null);
      const dataStr = JSON.stringify(npcConfigs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'npc_configurations.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Erreur lors de l\'exportation');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Import / Export</h2>

      {exportError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <FileText className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{exportError}</p>
            </div>
          </div>
        </div>
      )}

      {importError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <FileText className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{importError}</p>
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
                onChange={handleImportNPCs}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fichier JSON contenant un tableau de configurations NPC
              </p>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Export Configurations</h3>

          <div className="space-y-4">
            {/* Configuration du Datapack */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Configuration du Datapack</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version Minecraft
                </label>
                <select
                  value={minecraftVersion}
                  onChange={(e) => setMinecraftVersion(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {MINECRAFT_VERSIONS.map(version => (
                    <option key={version.value} value={version.value}>
                      {version.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du Datapack
                </label>
                <input
                  type="text"
                  value={datapackName}
                  onChange={(e) => setDatapackName(e.target.value)}
                  placeholder="nom_du_datapack"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Boutons d'export */}
            <div className="space-y-3">
              <button
                onClick={exportAsDatapack}
                disabled={npcConfigs.length === 0}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Package className="h-4 w-4 mr-2" />
                Export Cobblemon Datapack (.zip)
              </button>

              <button
                onClick={exportAsJSON}
                disabled={npcConfigs.length === 0}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON Configuration
              </button>

              <p className="text-xs text-gray-500">
                {npcConfigs.length} configuration(s) prête(s) à l'export
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}