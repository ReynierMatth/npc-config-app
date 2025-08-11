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
  canChallenge: boolean;
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

export type NPCPartyProvider = SimplePartyProvider | PoolPartyProvider | ScriptPartyProvider;

export interface DialogueInteraction {
  type: "dialogue";
  dialogue: string;
}

export interface ScriptInteraction {
  type: "script";
  script: string;
}

export interface CustomScriptInteraction {
  type: "custom_script";
  script: string;
}

export interface NoInteraction {
  type: "none";
}

export type NPCInteraction = DialogueInteraction | ScriptInteraction | CustomScriptInteraction | NoInteraction;

export interface NPCConfiguration {
  hitbox: NPCHitboxValue;
  presets: string[];
  resourceIdentifier: string;
  config: MoLangConfigVariable[];
  isInvulnerable?: boolean;
  canDespawn?: boolean;
  isMovable?: boolean;
  isLeashable?: boolean;
  allowProjectileHits?: boolean;
  hideNameTag?: boolean;
  names: string[];
  aspects?: string[];
  modelScale?: number;
  interaction: NPCInteraction;
  battleConfiguration?: NPCBattleConfiguration;
  autoHealParty?: boolean;
  randomizePartyOrder?: boolean;
  skill?: number;
  battleTheme?: string;
  party?: NPCPartyProvider;
}

// Dialogue System Types
export interface DialogueText {
  type?: "expression";
  expression?: string;
  text?: string;
}

export interface DialogueOption {
  text: DialogueText | string;
  value: string;
  action: string | string[];
  isSelectable?: string;
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
  // No additional properties needed
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