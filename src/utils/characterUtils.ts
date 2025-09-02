/**
 * Character utilities for handling character asset loading and fallbacks
 */

export const DEFAULT_CHARACTER = 'Girl_1';
export const CHARACTERS_PATH = '/assets/characters';

// List of all available characters based on the actual directory structure
export const AVAILABLE_CHARACTERS = [
  'Amazon_1', 'Amazon_2', 'Amazon_3', 'Fire Wizard', 'Girl_1', 'Girl_2', 'Girl_3',
  'Gladiator_1', 'Gladiator_2', 'Gladiator_3', 'Karasu_tengu', 'Kitsune',
  'Knight_1', 'Knight_2', 'Knight_3', 'Kunoichi', 'Lightning Mage',
  'Man_1', 'Man_2', 'Man_3', 'Ninja_Monk', 'Ninja_Peasant',
  'Pyromancer_1', 'Pyromancer_2', 'Pyromancer_3', 'Wanderer Magican', 'Wild Zombie',
  'Witch_1', 'Witch_2', 'Witch_3', 'Yamabushi_tengu', 'Zombie Man', 'Zombie Woman',
  'Zombie_1', 'Zombie_2', 'Zombie_3'
];

/**
 * Check if a character exists in the available characters list
 */
export const characterExists = (characterId: string): boolean => {
  return AVAILABLE_CHARACTERS.includes(characterId);
};

/**
 * Get a safe character ID, falling back to default if the character doesn't exist
 */
export const getSafeCharacterId = (characterId: string): string => {
  return characterExists(characterId) ? characterId : DEFAULT_CHARACTER;
};

/**
 * Get the path to a character's idle sprite with fallback
 */
export const getCharacterIdlePath = (characterId: string): string => {
  const safeCharacterId = getSafeCharacterId(characterId);
  return `${CHARACTERS_PATH}/${safeCharacterId}/Idle.png`;
};

/**
 * Get the path to a character's sprite with fallback
 */
export const getCharacterSpritePath = (characterId: string, spriteName: string): string => {
  const safeCharacterId = getSafeCharacterId(characterId);
  return `${CHARACTERS_PATH}/${safeCharacterId}/${spriteName}`;
};

/**
 * Get fallback path for error cases
 */
export const getFallbackIdlePath = (): string => {
  return `${CHARACTERS_PATH}/${DEFAULT_CHARACTER}/Idle.png`;
};