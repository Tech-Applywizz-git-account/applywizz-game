/**
 * Utility functions for avatar management
 * Handles localStorage-based avatar storage and retrieval for client-side avatar handling
 */

export interface AvatarData {
  id: number;
}

/**
 * Retrieve avatar data from localStorage
 * @returns AvatarData or null if no avatar is stored
 */
export const getStoredAvatar = (): AvatarData | null => {
  try {
    const storedAvatar = localStorage.getItem("avatar");
    if (!storedAvatar) return null;

    const parsedAvatar = JSON.parse(storedAvatar);
    
    // Handle both old format (with color/pattern) and new format (just id)
    if (typeof parsedAvatar === "object" && parsedAvatar.id) {
      return { id: parsedAvatar.id };
    } else if (typeof parsedAvatar === "number") {
      return { id: parsedAvatar };
    }
    
    return null;
  } catch (error) {
    console.error("Failed to parse stored avatar:", error);
    return null;
  }
};

/**
 * Store avatar data in localStorage
 * @param avatar - Avatar data to store
 */
export const storeAvatar = (avatar: AvatarData): void => {
  try {
    localStorage.setItem("avatar", JSON.stringify(avatar));
  } catch (error) {
    console.error("Failed to store avatar:", error);
  }
};

/**
 * Remove avatar data from localStorage
 */
export const removeStoredAvatar = (): void => {
  try {
    localStorage.removeItem("avatar");
  } catch (error) {
    console.error("Failed to remove stored avatar:", error);
  }
};

/**
 * Check if user has a stored avatar
 * @returns boolean indicating if avatar exists in localStorage
 */
export const hasStoredAvatar = (): boolean => {
  return getStoredAvatar() !== null;
};

/**
 * Get default fallback avatar data
 * @returns Default avatar data
 */
export const getDefaultAvatar = (): AvatarData => {
  return { id: 1 };
};

/**
 * Get avatar for display purposes - returns stored avatar or default
 * @returns AvatarData that can be used for display
 */
export const getDisplayAvatar = (): AvatarData => {
  return getStoredAvatar() || getDefaultAvatar();
};