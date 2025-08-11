import { useState } from 'react';
import { Plus, Trash2, MessageCircle } from 'lucide-react';
import type { DialogueConfiguration, DialoguePage, DialogueSpeaker } from '../types/npc';

interface DialogueEditorProps {
  dialogue: DialogueConfiguration | null;
  onChange: (dialogue: DialogueConfiguration) => void;
}

export function DialogueEditor({ dialogue, onChange }: DialogueEditorProps) {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [speakerEditMode, setSpeakerEditMode] = useState(false);

  const initializeDialogue = () => {
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
    onChange(newDialogue);
    setSelectedPageId('greeting');
  };

  if (!dialogue) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Dialogue Editor</h2>
        <div className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No dialogue configured</p>
          <button
            type="button"
            onClick={initializeDialogue}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Dialogue
          </button>
        </div>
      </div>
    );
  }

  const addPage = () => {
    const newPageId = `page_${Date.now()}`;
    const newPage: DialoguePage = {
      id: newPageId,
      speaker: 'npc',
      lines: ['New dialogue line'],
      input: 'q.dialogue.close();'
    };
    
    onChange({
      ...dialogue,
      pages: [...dialogue.pages, newPage]
    });
    setSelectedPageId(newPageId);
  };

  const updatePage = (pageId: string, updatedPage: DialoguePage) => {
    onChange({
      ...dialogue,
      pages: dialogue.pages.map(page => 
        page.id === pageId ? updatedPage : page
      )
    });
  };

  const deletePage = (pageId: string) => {
    onChange({
      ...dialogue,
      pages: dialogue.pages.filter(page => page.id !== pageId)
    });
    if (selectedPageId === pageId) {
      setSelectedPageId(dialogue.pages.length > 1 ? dialogue.pages[0].id : null);
    }
  };

  const addSpeaker = () => {
    const speakerName = `speaker_${Object.keys(dialogue.speakers).length + 1}`;
    onChange({
      ...dialogue,
      speakers: {
        ...dialogue.speakers,
        [speakerName]: {
          name: { type: 'expression', expression: `'${speakerName}'` },
          face: ''
        }
      }
    });
  };

  const updateSpeaker = (speakerId: string, speaker: DialogueSpeaker) => {
    onChange({
      ...dialogue,
      speakers: {
        ...dialogue.speakers,
        [speakerId]: speaker
      }
    });
  };

  const deleteSpeaker = (speakerId: string) => {
    const newSpeakers = { ...dialogue.speakers };
    delete newSpeakers[speakerId];
    onChange({
      ...dialogue,
      speakers: newSpeakers
    });
  };

  const selectedPage = dialogue.pages.find(page => page.id === selectedPageId);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dialogue Editor</h2>

      {/* Global Dialogue Settings */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Global Settings</h3>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Initialization Action</label>
            <input
              type="text"
              value={dialogue.initializationAction || ''}
              onChange={(e) => onChange({ ...dialogue, initializationAction: e.target.value || undefined })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="q.dialogue.close();"
            />
            <p className="text-xs text-gray-500 mt-1">MoLang script executed when dialogue starts</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Escape Action</label>
            <input
              type="text"
              value={dialogue.escapeAction || ''}
              onChange={(e) => onChange({ ...dialogue, escapeAction: e.target.value || undefined })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="q.dialogue.close();"
            />
            <p className="text-xs text-gray-500 mt-1">MoLang script executed when ESC is pressed</p>
          </div>
        </div>
      </div>

      {/* Speakers Management */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Speakers</h3>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => setSpeakerEditMode(!speakerEditMode)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {speakerEditMode ? 'Done' : 'Edit Speakers'}
            </button>
            <button
              type="button"
              onClick={addSpeaker}
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Speaker
            </button>
          </div>
        </div>

        {speakerEditMode ? (
          <div className="space-y-3">
            {Object.entries(dialogue.speakers).map(([speakerId, speaker]) => (
              <div key={speakerId} className="border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm">{speakerId}</strong>
                  {!['npc', 'player'].includes(speakerId) && (
                    <button
                      type="button"
                      onClick={() => deleteSpeaker(speakerId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Name Expression</label>
                    <input
                      type="text"
                      value={speaker.name.expression || ''}
                      onChange={(e) => updateSpeaker(speakerId, {
                        ...speaker,
                        name: { ...speaker.name, expression: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                      placeholder="q.npc.name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Face Expression</label>
                    <input
                      type="text"
                      value={speaker.face || ''}
                      onChange={(e) => updateSpeaker(speakerId, {
                        ...speaker,
                        face: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                      placeholder="q.npc.face(false);"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.keys(dialogue.speakers).map(speakerId => (
              <span key={speakerId} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                {speakerId}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Pages</h3>
            <button
              type="button"
              onClick={addPage}
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Page
            </button>
          </div>
          
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {dialogue.pages.map(page => (
              <div
                key={page.id}
                className={`p-2 rounded cursor-pointer border ${
                  selectedPageId === page.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPageId(page.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{page.id}</div>
                    <div className="text-xs text-gray-500">Speaker: {page.speaker}</div>
                    <div className="text-xs text-gray-600 truncate">
                      {page.lines.length > 0 
                        ? (typeof page.lines[0] === 'string' 
                            ? page.lines[0] 
                            : (page.lines[0] as { text?: string }).text || 'Expression'
                          )
                        : 'No lines'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(page.id);
                    }}
                    className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page Editor */}
        <div className="lg:col-span-2">
          {selectedPage ? (
            <PageEditor
              page={selectedPage}
              speakers={dialogue.speakers}
              onChange={(updatedPage) => updatePage(selectedPage.id, updatedPage)}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a page to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PageEditorProps {
  page: DialoguePage;
  speakers: Record<string, DialogueSpeaker>;
  onChange: (page: DialoguePage) => void;
}

function PageEditor({ page, speakers, onChange }: PageEditorProps) {
  const updatePage = (field: keyof DialoguePage, value: any) => {
    onChange({ ...page, [field]: value });
  };

  const updateLine = (index: number, value: string) => {
    const newLines = [...page.lines];
    newLines[index] = value;
    updatePage('lines', newLines);
  };

  const addLine = () => {
    updatePage('lines', [...page.lines, '']);
  };

  const removeLine = (index: number) => {
    updatePage('lines', page.lines.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="font-medium text-lg">Edit Page: {page.id}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Page ID</label>
          <input
            type="text"
            value={page.id}
            onChange={(e) => updatePage('id', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Speaker</label>
          <select
            value={page.speaker}
            onChange={(e) => updatePage('speaker', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {Object.keys(speakers).map(speakerId => (
              <option key={speakerId} value={speakerId}>{speakerId}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Lines</label>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Line
          </button>
        </div>
        
        <div className="space-y-2">
          {page.lines.map((line, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={typeof line === 'string' ? line : line.expression || ''}
                onChange={(e) => updateLine(index, e.target.value)}
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="Dialogue text or MoLang expression"
              />
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Input/Action</label>
        <textarea
          value={typeof page.input === 'string' ? page.input : JSON.stringify(page.input, null, 2)}
          onChange={(e) => updatePage('input', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-mono"
          placeholder="q.dialogue.close(); or JSON for options"
        />
        <p className="text-xs text-gray-500 mt-1">
          MoLang script or JSON for dialogue options
        </p>
      </div>
    </div>
  );
}