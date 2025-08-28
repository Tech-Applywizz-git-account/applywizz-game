/**
 * Utility to map avatar IDs (1-12) to character IDs used in games
 */

import { CharacterId } from "../components/fourplayer";

// Map avatar IDs to character IDs used in the games
const AVATAR_TO_CHARACTER_MAP: Record<number, CharacterId> = {
  1: "fighter",
  2: "shinobi", 
  3: "samurai",
  4: "samurai2",
  5: "samurai3",
  6: "samuraiArcher",
  7: "fighter", // Map back to fighter for additional avatars
  8: "shinobi",
  9: "samurai", 
  10: "samurai2",
  11: "samurai3",
  12: "samuraiArcher",
};

/**
 * Convert an avatar ID to a character ID for use in games
 * @param avatarId - Avatar ID (1-12)
 * @returns Character ID that can be used in games
 */
export const getCharacterIdFromAvatarId = (avatarId: number): CharacterId => {
  // Ensure ID is within valid range (1-12)
  const validId = Math.max(1, Math.min(12, avatarId));
  return AVATAR_TO_CHARACTER_MAP[validId] || "fighter";
};

/**
 * Get the character ID for the currently selected avatar from localStorage
 * @returns Character ID for the stored avatar, or default "fighter"
 */
export const getSelectedCharacterId = (): CharacterId => {
  try {
    const storedAvatar = localStorage.getItem("avatar");
    if (!storedAvatar) return "fighter";

    const parsedAvatar = JSON.parse(storedAvatar);
    const avatarId = typeof parsedAvatar === "object" ? parsedAvatar.id : parsedAvatar;
    
    return getCharacterIdFromAvatarId(avatarId);
  } catch (error) {
    console.error("Failed to get selected character ID:", error);
    return "fighter";
  }
};