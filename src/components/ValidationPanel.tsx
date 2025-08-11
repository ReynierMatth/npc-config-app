import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { NPCConfiguration, DialogueConfiguration } from '../types/npc';
import { validateNPCConfiguration, validateDialogueConfiguration, getValidationSummary } from '../utils/validation';
import type { ValidationError } from '../utils/validation';

interface ValidationPanelProps {
  npcConfig: NPCConfiguration;
  dialogueConfig: DialogueConfiguration | null;
}

export function ValidationPanel({ npcConfig, dialogueConfig }: ValidationPanelProps) {
  const npcErrors = validateNPCConfiguration(npcConfig);
  const dialogueErrors = dialogueConfig ? validateDialogueConfiguration(dialogueConfig) : [];
  
  const allErrors = [...npcErrors, ...dialogueErrors];
  const summary = getValidationSummary(allErrors);

  function ErrorItem({ error }: { error: ValidationError }) {
    return (
    <div className={`flex items-start space-x-2 p-2 rounded ${
      error.severity === 'error' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
    }`}>
      {error.severity === 'error' ? (
        <XCircle className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{error.field}</p>
        <p className="text-xs">{error.message}</p>
      </div>
    </div>
    );
  }

  if (allErrors.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Configuration Valid</h3>
            <p className="text-sm text-green-700">No validation errors found. Your NPC configuration is ready to export!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={`border rounded-lg p-4 ${
        summary.hasErrors ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          {summary.hasErrors ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              summary.hasErrors ? 'text-red-800' : 'text-yellow-800'
            }`}>
              Validation {summary.hasErrors ? 'Errors' : 'Warnings'} Found
            </h3>
            <p className={`text-sm ${
              summary.hasErrors ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {summary.errorCount > 0 && `${summary.errorCount} error${summary.errorCount > 1 ? 's' : ''}`}
              {summary.errorCount > 0 && summary.warningCount > 0 && ', '}
              {summary.warningCount > 0 && `${summary.warningCount} warning${summary.warningCount > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* Errors List */}
      <div className="space-y-2">
        {summary.errorCount > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center">
              <XCircle className="h-4 w-4 mr-1" />
              Errors ({summary.errorCount})
            </h4>
            <div className="space-y-1">
              {allErrors
                .filter(error => error.severity === 'error')
                .map((error, index) => (
                  <ErrorItem key={`error-${index}`} error={error} />
                ))}
            </div>
          </div>
        )}

        {summary.warningCount > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-900 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Warnings ({summary.warningCount})
            </h4>
            <div className="space-y-1">
              {allErrors
                .filter(error => error.severity === 'warning')
                .map((error, index) => (
                  <ErrorItem key={`warning-${index}`} error={error} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Status */}
      <div className={`border-t pt-4 ${
        summary.hasErrors ? 'text-red-700' : 'text-yellow-700'
      }`}>
        <p className="text-sm">
          {summary.hasErrors 
            ? '⚠️ Fix all errors before exporting your configuration.'
            : '✅ Configuration has warnings but can still be exported.'
          }
        </p>
      </div>
    </div>
  );
}