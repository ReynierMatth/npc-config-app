export interface NPCHitbox {
  width: number;
  height: number;
}

export type NPCHitboxValue = "player" | NPCHitbox;

export interface MoLangConfigVariable {
  variableName: string;
  displayName: string;
  description: string;
  type: "NUMBER" | "TEXT" | "BOOLEAN";
  defaultValue: string | number | boolean;
}

export interface NPCBattleConfiguration {
  canBattle?: boolean;
  canChallenge?: boolean;
  battleTheme?: string;
  victoryTheme?: string;
  defeatTheme?: string;
  simultaneousBattles?: boolean;
  healAfterwards?: boolean;
}

export interface SimplePartyProvider {
  type: "simple";
  pokemon: string[];
  isStatic?: boolean;
}

export interface PoolEntry {
  pokemon: string;
  weight?: number;
  selectableTimes?: number;
  npcLevels?: number[];
  levelVariation?: number;
  level?: number;
}

export interface PoolPartyProvider {
  type: "pool";
  minPokemon?: number;
  maxPokemon?: number;
  pool: PoolEntry[];
  isStatic?: boolean;
  useFixedRandom?: boolean;
}

export interface ScriptPartyProvider {
  type: "script";
  script: string;
  isStatic?: boolean;
}

export type PartyProvider = SimplePartyProvider | PoolPartyProvider | ScriptPartyProvider;

// Alias pour compatibilité avec les autres fichiers
export type NPCPartyProvider = PartyProvider;

// Dialogue System Types
export interface DialogueText {
  type?: "expression";
  expression?: string;
  text?: string;
}

export interface DialogueOption {
  text: DialogueText | string;
  value: string;
  action?: string | string[];
  isSelectable?: string;
}

export interface DialogueEntry {
  id: string;
  text: DialogueText | string;
  options?: DialogueOption[];
  nextDialogue?: string;
}

export interface DialogueOptionInput {
  type: "option";
  vertical?: boolean;
  options: DialogueOption[];
}

export interface DialogueTextInput {
  type: "text";
  placeholder?: string;
  maxLength?: number;
  action: string | string[];
}

export interface DialogueAutoContinueInput {
  type: "auto_continue";
  delay: number;
  action: string | string[];
}

export interface DialogueNoInput {
  type: "none";
}

export type DialogueInput = DialogueOptionInput | DialogueTextInput | DialogueAutoContinueInput | DialogueNoInput;

export interface DialogueSpeaker {
  name: DialogueText;
  face?: string;
}

export interface DialoguePage {
  id: string;
  speaker: string;
  lines: (DialogueText | string)[];
  input?: DialogueInput | string;
  background?: string;
  clientActions?: string[];
}

export interface DialogueConfiguration {
  initializationAction?: string;
  escapeAction?: string;
  speakers: Record<string, DialogueSpeaker>;
  pages: DialoguePage[];
  background?: string;
}

export interface NPCInteraction {
  type: string;
  data?: any;
  dialogue?: string;
  script?: string;
}

export interface NPCConfiguration {
  id: string;
  name: string;
  names: string[];
  displayName?: string;
  resourceIdentifier?: string;
  model?: string;
  modelScale?: number;
  texture?: string;
  aspects?: string[];
  hitbox?: NPCHitboxValue;
  battleConfiguration?: NPCBattleConfiguration;
  party?: PartyProvider;
  config?: MoLangConfigVariable[];
  configVariables?: Record<string, any>;
  dialogue?: DialogueEntry[];
  canInteract?: boolean;
  interactionDistance?: number;
  interaction?: NPCInteraction;
  interactions?: NPCInteraction[];
  skill?: number;
  battleTheme?: string;
  autoHealParty?: boolean;
  randomizePartyOrder?: boolean;
  isInvulnerable?: boolean;
  canDespawn?: boolean;
  isMovable?: boolean;
  isLeashable?: boolean;
  allowProjectileHits?: boolean;
  hideNameTag?: boolean;
}

// Alias pour l'interface NPCConfig pour la compatibilité avec ImportExport
export type NPCConfig = NPCConfiguration;
