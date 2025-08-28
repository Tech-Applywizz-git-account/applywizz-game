/**
 * Avatar system types and mappings for the marketplace and game
 */

export type AvatarId = 
  | "fighter"
  | "girl1" 
  | "pyromancer1"
  | "pyromancer2"
  | "pyromancer3"
  | "samurai"
  | "samurai2"
  | "samurai3"
  | "samuraiArcher"
  | "shinobi";

export interface AvatarInfo {
  id: AvatarId;
  name: string;
  description: string;
  folderName: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  previewImage: string; // Path to preview image (idle frame)
}

// Map avatar IDs to their folder names for asset loading
export const AVATAR_FOLDER_MAP: Record<AvatarId, string> = {
  fighter: "Fighter",
  girl1: "Girl_1", 
  pyromancer1: "Pyromancer_1",
  pyromancer2: "Pyromancer_2",
  pyromancer3: "Pyromancer_3",
  samurai: "Samurai",
  samurai2: "Samurai2",
  samurai3: "Samurai3",
  samuraiArcher: "SamuraiArcher",
  shinobi: "Shinobi",
};

// Avatar marketplace data
export const AVATAR_CATALOG: Record<AvatarId, AvatarInfo> = {
  fighter: {
    id: "fighter",
    name: "Fighter",
    description: "A powerful warrior with balanced abilities",
    folderName: "Fighter",
    price: 0, // Free starter avatar
    rarity: 'common',
    previewImage: "/assets/avatars/Fighter/Idle.png"
  },
  girl1: {
    id: "girl1", 
    name: "Girl Warrior",
    description: "Swift and agile warrior with graceful movements",
    folderName: "Girl_1",
    price: 100,
    rarity: 'common',
    previewImage: "/assets/avatars/Girl_1/Idle.png"
  },
  pyromancer1: {
    id: "pyromancer1",
    name: "Fire Mage I",
    description: "Master of fire magic with devastating attacks",
    folderName: "Pyromancer_1", 
    price: 250,
    rarity: 'rare',
    previewImage: "/assets/avatars/Pyromancer_1/Idle.png"
  },
  pyromancer2: {
    id: "pyromancer2",
    name: "Fire Mage II",
    description: "Advanced pyromancer with enhanced fire abilities",
    folderName: "Pyromancer_2",
    price: 400,
    rarity: 'rare', 
    previewImage: "/assets/avatars/Pyromancer_2/Idle.png"
  },
  pyromancer3: {
    id: "pyromancer3",
    name: "Fire Mage III",
    description: "Elite fire master with ultimate flame powers",
    folderName: "Pyromancer_3",
    price: 600,
    rarity: 'epic',
    previewImage: "/assets/avatars/Pyromancer_3/Idle.png"
  },
  samurai: {
    id: "samurai", 
    name: "Samurai",
    description: "Honor-bound warrior with deadly precision",
    folderName: "Samurai",
    price: 200,
    rarity: 'common',
    previewImage: "/assets/avatars/Samurai/Idle.png"
  },
  samurai2: {
    id: "samurai2",
    name: "Samurai Elite", 
    description: "Veteran samurai with superior combat skills",
    folderName: "Samurai2",
    price: 350,
    rarity: 'rare',
    previewImage: "/assets/avatars/Samurai2/Idle.png"
  },
  samurai3: {
    id: "samurai3",
    name: "Samurai Master",
    description: "Legendary samurai with unmatched sword mastery",
    folderName: "Samurai3",
    price: 500,
    rarity: 'epic',
    previewImage: "/assets/avatars/Samurai3/Idle.png"
  },
  samuraiArcher: {
    id: "samuraiArcher",
    name: "Samurai Archer", 
    description: "Deadly marksman combining sword and bow skills",
    folderName: "SamuraiArcher",
    price: 750,
    rarity: 'legendary',
    previewImage: "/assets/avatars/SamuraiArcher/Idle.png"
  },
  shinobi: {
    id: "shinobi",
    name: "Shinobi",
    description: "Silent assassin striking from the shadows",
    folderName: "Shinobi", 
    price: 300,
    rarity: 'rare',
    previewImage: "/assets/avatars/Shinobi/Idle.png"
  }
};

export const RARITY_COLORS = {
  common: '#9CA3AF',    // Gray
  rare: '#3B82F6',      // Blue  
  epic: '#8B5CF6',      // Purple
  legendary: '#F59E0B'  // Gold
} as const;

// Get all available avatar IDs
export const getAllAvatarIds = (): AvatarId[] => {
  return Object.keys(AVATAR_CATALOG) as AvatarId[];
};

// Get avatars by rarity
export const getAvatarsByRarity = (rarity: AvatarInfo['rarity']): AvatarInfo[] => {
  return Object.values(AVATAR_CATALOG).filter(avatar => avatar.rarity === rarity);
};