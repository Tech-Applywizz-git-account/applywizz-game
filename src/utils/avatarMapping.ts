/**
 * Avatar Mapping Utility
 * Maps avatar IDs (1-12) to sprite folders and provides unified access to avatar data
 */

// Type definitions
export type AvatarSpriteId = 
  | "Fighter"
  | "Girl_1"
  | "Pyromancer_1"
  | "Pyromancer_2"
  | "Pyromancer_3"
  | "Samurai"
  | "Samurai2"
  | "Samurai3"
  | "SamuraiArcher"
  | "Shinobi";

export interface AvatarMapping {
  id: number;
  spriteFolder: AvatarSpriteId;
  name: string;
  preview: string; // Path to preview image (avatar_XX.png)
}

// Mapping between avatar IDs and sprite folders
export const AVATAR_MAPPINGS: Record<number, AvatarMapping> = {
  1: {
    id: 1,
    spriteFolder: "Fighter",
    name: "Fighter",
    preview: "/assets/avatar_01.png"
  },
  2: {
    id: 2,
    spriteFolder: "Shinobi",
    name: "Shinobi",
    preview: "/assets/avatar_02.png"
  },
  3: {
    id: 3,
    spriteFolder: "Samurai",
    name: "Samurai",
    preview: "/assets/avatar_03.png"
  },
  4: {
    id: 4,
    spriteFolder: "Samurai2",
    name: "Samurai Warrior",
    preview: "/assets/avatar_04.png"
  },
  5: {
    id: 5,
    spriteFolder: "Samurai3",
    name: "Samurai Master",
    preview: "/assets/avatar_05.png"
  },
  6: {
    id: 6,
    spriteFolder: "SamuraiArcher",
    name: "Samurai Archer",
    preview: "/assets/avatar_06.png"
  },
  7: {
    id: 7,
    spriteFolder: "Girl_1",
    name: "Girl",
    preview: "/assets/avatar_07.png"
  },
  8: {
    id: 8,
    spriteFolder: "Pyromancer_1",
    name: "Pyromancer",
    preview: "/assets/avatar_08.png"
  },
  9: {
    id: 9,
    spriteFolder: "Pyromancer_2",
    name: "Fire Mage",
    preview: "/assets/avatar_09.png"
  },
  10: {
    id: 10,
    spriteFolder: "Pyromancer_3",
    name: "Flame Wizard",
    preview: "/assets/avatar_10.png"
  },
  // Default fallbacks for IDs 11-12 (reuse existing sprites)
  11: {
    id: 11,
    spriteFolder: "Fighter",
    name: "Fighter Elite",
    preview: "/assets/avatar_11.png"
  },
  12: {
    id: 12,
    spriteFolder: "Shinobi",
    name: "Shinobi Master",
    preview: "/assets/avatar_12.png"
  }
};

/**
 * Get avatar mapping by ID
 */
export const getAvatarMapping = (id: number): AvatarMapping | null => {
  return AVATAR_MAPPINGS[id] || null;
};

/**
 * Get sprite folder for avatar ID
 */
export const getSpriteFolder = (avatarId: number): AvatarSpriteId => {
  const mapping = getAvatarMapping(avatarId);
  return mapping?.spriteFolder || "Fighter"; // Default fallback
};

/**
 * Get all available avatar mappings
 */
export const getAllAvatarMappings = (): AvatarMapping[] => {
  return Object.values(AVATAR_MAPPINGS);
};

/**
 * Check if avatar ID is valid
 */
export const isValidAvatarId = (id: number): boolean => {
  return id >= 1 && id <= 12 && AVATAR_MAPPINGS[id] !== undefined;
};

/**
 * Get default avatar ID
 */
export const getDefaultAvatarId = (): number => {
  return 1; // Default to Fighter
};

/**
 * Convert legacy character ID to avatar sprite folder
 * This maintains compatibility with existing fourplayer.tsx logic
 */
export const convertCharacterIdToSpriteFolder = (characterId: string): AvatarSpriteId => {
  switch (characterId.toLowerCase()) {
    case "fighter":
      return "Fighter";
    case "shinobi":
      return "Shinobi";
    case "samurai":
      return "Samurai";
    case "samurai2":
      return "Samurai2";
    case "samurai3":
      return "Samurai3";
    case "samuraiarcher":
      return "SamuraiArcher";
    default:
      return "Fighter";
  }
};