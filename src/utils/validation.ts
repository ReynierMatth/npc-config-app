import type { NPCConfiguration, DialogueConfiguration } from '../types/npc';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export const validateNPCConfiguration = (config: NPCConfiguration): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!config.resourceIdentifier) {
    errors.push({
      field: 'resourceIdentifier',
      message: 'Resource identifier is required',
      severity: 'error'
    });
  } else if (!/^[a-z_]+:[a-z_]+$/i.test(config.resourceIdentifier)) {
    errors.push({
      field: 'resourceIdentifier',
      message: 'Resource identifier should follow the format "namespace:identifier" (e.g., "cobblemon:my_npc")',
      severity: 'warning'
    });
  }

  if (!config.names || config.names.length === 0) {
    errors.push({
      field: 'names',
      message: 'At least one name is required',
      severity: 'error'
    });
  } else if (config.names.some(name => !name.trim())) {
    errors.push({
      field: 'names',
      message: 'Names cannot be empty',
      severity: 'error'
    });
  }

  // Hitbox validation
  if (typeof config.hitbox === 'object') {
    if (config.hitbox.width <= 0 || config.hitbox.height <= 0) {
      errors.push({
        field: 'hitbox',
        message: 'Hitbox width and height must be positive numbers',
        severity: 'error'
      });
    }
    if (config.hitbox.width > 10 || config.hitbox.height > 10) {
      errors.push({
        field: 'hitbox',
        message: 'Unusually large hitbox dimensions - are you sure this is correct?',
        severity: 'warning'
      });
    }
  }

  // Battle configuration validation
  if (config.battleConfiguration?.canChallenge) {
    if (!config.party) {
      errors.push({
        field: 'party',
        message: 'Battle NPCs must have a party configuration',
        severity: 'error'
      });
    } else if (config.party.type === 'simple' && config.party.pokemon.length === 0) {
      errors.push({
        field: 'party',
        message: 'Simple party must have at least one Pokemon',
        severity: 'error'
      });
    } else if (config.party.type === 'pool' && config.party.pool.length === 0) {
      errors.push({
        field: 'party',
        message: 'Pool party must have at least one pool entry',
        severity: 'error'
      });
    } else if (config.party.type === 'script' && !config.party.script) {
      errors.push({
        field: 'party',
        message: 'Script party must specify a script resource location',
        severity: 'error'
      });
    }

    if (config.skill && (config.skill < 1 || config.skill > 5)) {
      errors.push({
        field: 'skill',
        message: 'Skill level must be between 1 and 5',
        severity: 'error'
      });
    }

    // Validate Pokemon strings in simple party
    if (config.party?.type === 'simple') {
      config.party.pokemon.forEach((pokemon, index) => {
        if (!pokemon.trim()) {
          errors.push({
            field: `party.pokemon.${index}`,
            message: `Pokemon entry ${index + 1} cannot be empty`,
            severity: 'error'
          });
        }
      });
    }
  }

  // Interaction validation
  const interaction = config.interaction || { type: 'none' };
  if (interaction.type === 'dialogue' && !interaction.dialogue) {
    errors.push({
      field: 'interaction.dialogue',
      message: 'Dialogue interaction must specify a dialogue resource location',
      severity: 'error'
    });
  }

  if (interaction.type === 'script' && !interaction.script) {
    errors.push({
      field: 'interaction.script',
      message: 'Script interaction must specify a script resource location',
      severity: 'error'
    });
  }

  if (interaction.type === 'custom_script' && !interaction.script) {
    errors.push({
      field: 'interaction.script',
      message: 'Custom script interaction must provide script code',
      severity: 'error'
    });
  }

  // Configuration variables validation
  (config.config || []).forEach((variable, index) => {
    if (!variable.variableName) {
      errors.push({
        field: `config.${index}.variableName`,
        message: `Variable ${index + 1} must have a name`,
        severity: 'error'
      });
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.variableName)) {
      errors.push({
        field: `config.${index}.variableName`,
        message: `Variable ${index + 1} name must be a valid identifier (letters, numbers, underscores only)`,
        severity: 'error'
      });
    }

    if (!variable.displayName) {
      errors.push({
        field: `config.${index}.displayName`,
        message: `Variable ${index + 1} must have a display name`,
        severity: 'error'
      });
    }

    if (variable.type === 'NUMBER' && typeof variable.defaultValue !== 'number') {
      errors.push({
        field: `config.${index}.defaultValue`,
        message: `Variable ${index + 1} has type NUMBER but default value is not a number`,
        severity: 'error'
      });
    }

    if (variable.type === 'BOOLEAN' && typeof variable.defaultValue !== 'boolean') {
      errors.push({
        field: `config.${index}.defaultValue`,
        message: `Variable ${index + 1} has type BOOLEAN but default value is not a boolean`,
        severity: 'error'
      });
    }
  });

  // Model scale validation
  if (config.modelScale && (config.modelScale <= 0 || config.modelScale > 10)) {
    errors.push({
      field: 'modelScale',
      message: 'Model scale should be a positive number, typically between 0.1 and 2.0',
      severity: 'warning'
    });
  }

  return errors;
};

export const validateDialogueConfiguration = (config: DialogueConfiguration): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Speakers validation
  if (!config.speakers || Object.keys(config.speakers).length === 0) {
    errors.push({
      field: 'speakers',
      message: 'At least one speaker is required',
      severity: 'error'
    });
  } else {
    Object.entries(config.speakers).forEach(([speakerId, speaker]) => {
      if (!speaker.name?.expression) {
        errors.push({
          field: `speakers.${speakerId}.name`,
          message: `Speaker "${speakerId}" must have a name expression`,
          severity: 'error'
        });
      }
    });
  }

  // Pages validation
  if (!config.pages || config.pages.length === 0) {
    errors.push({
      field: 'pages',
      message: 'At least one dialogue page is required',
      severity: 'error'
    });
  } else {
    config.pages.forEach((page, index) => {
      if (!page.id) {
        errors.push({
          field: `pages.${index}.id`,
          message: `Page ${index + 1} must have an ID`,
          severity: 'error'
        });
      }

      if (!page.speaker) {
        errors.push({
          field: `pages.${index}.speaker`,
          message: `Page ${index + 1} must specify a speaker`,
          severity: 'error'
        });
      } else if (!config.speakers[page.speaker]) {
        errors.push({
          field: `pages.${index}.speaker`,
          message: `Page ${index + 1} references undefined speaker "${page.speaker}"`,
          severity: 'error'
        });
      }

      if (!page.lines || page.lines.length === 0) {
        errors.push({
          field: `pages.${index}.lines`,
          message: `Page ${index + 1} must have at least one line`,
          severity: 'error'
        });
      } else {
        page.lines.forEach((line, lineIndex) => {
          if (typeof line === 'string' && !line.trim()) {
            errors.push({
              field: `pages.${index}.lines.${lineIndex}`,
              message: `Page ${index + 1}, line ${lineIndex + 1} cannot be empty`,
              severity: 'error'
            });
          }
        });
      }

      if (!page.input) {
        errors.push({
          field: `pages.${index}.input`,
          message: `Page ${index + 1} must specify input handling`,
          severity: 'warning'
        });
      }
    });

    // Check for duplicate page IDs
    const pageIds = config.pages.map(page => page.id).filter(id => id);
    const duplicateIds = pageIds.filter((id, index) => pageIds.indexOf(id) !== index);
    duplicateIds.forEach(id => {
      errors.push({
        field: 'pages',
        message: `Duplicate page ID: "${id}"`,
        severity: 'error'
      });
    });
  }

  return errors;
};

export const getValidationSummary = (errors: ValidationError[]) => {
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  return {
    hasErrors: errorCount > 0,
    hasWarnings: warningCount > 0,
    errorCount,
    warningCount,
    isValid: errorCount === 0
  };
};