/**
 * Coin system utilities for avatar purchasing
 */

const COINS_STORAGE_KEY = 'game_coins';
const OWNED_AVATARS_STORAGE_KEY = 'owned_avatars';
const SELECTED_AVATAR_STORAGE_KEY = 'selected_avatar';

// Default starting coins and owned avatars
const DEFAULT_COINS = 1000;
const DEFAULT_OWNED_AVATARS = ['fighter']; // Fighter is free starter

/**
 * Get user's current coin balance
 */
export const getCoins = (): number => {
  try {
    const stored = localStorage.getItem(COINS_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : DEFAULT_COINS;
  } catch (error) {
    console.error('Failed to get coins:', error);
    return DEFAULT_COINS;
  }
};

/**
 * Set user's coin balance
 */
export const setCoins = (amount: number): void => {
  try {
    localStorage.setItem(COINS_STORAGE_KEY, amount.toString());
  } catch (error) {
    console.error('Failed to set coins:', error);
  }
};

/**
 * Add coins to user's balance
 */
export const addCoins = (amount: number): number => {
  const currentCoins = getCoins();
  const newAmount = currentCoins + amount;
  setCoins(newAmount);
  return newAmount;
};

/**
 * Spend coins (returns true if successful, false if insufficient funds)
 */
export const spendCoins = (amount: number): boolean => {
  const currentCoins = getCoins();
  if (currentCoins >= amount) {
    setCoins(currentCoins - amount);
    return true;
  }
  return false;
};

/**
 * Get list of owned avatar IDs
 */
export const getOwnedAvatars = (): string[] => {
  try {
    const stored = localStorage.getItem(OWNED_AVATARS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_OWNED_AVATARS;
  } catch (error) {
    console.error('Failed to get owned avatars:', error);
    return DEFAULT_OWNED_AVATARS;
  }
};

/**
 * Add avatar to owned list
 */
export const addOwnedAvatar = (avatarId: string): void => {
  try {
    const owned = getOwnedAvatars();
    if (!owned.includes(avatarId)) {
      owned.push(avatarId);
      localStorage.setItem(OWNED_AVATARS_STORAGE_KEY, JSON.stringify(owned));
    }
  } catch (error) {
    console.error('Failed to add owned avatar:', error);
  }
};

/**
 * Check if user owns a specific avatar
 */
export const ownsAvatar = (avatarId: string): boolean => {
  const owned = getOwnedAvatars();
  return owned.includes(avatarId);
};

/**
 * Get currently selected avatar ID
 */
export const getSelectedAvatar = (): string => {
  try {
    const stored = localStorage.getItem(SELECTED_AVATAR_STORAGE_KEY);
    return stored || 'fighter'; // Default to fighter
  } catch (error) {
    console.error('Failed to get selected avatar:', error);
    return 'fighter';
  }
};

/**
 * Set selected avatar (only if owned)
 */
export const setSelectedAvatar = (avatarId: string): boolean => {
  if (ownsAvatar(avatarId)) {
    try {
      localStorage.setItem(SELECTED_AVATAR_STORAGE_KEY, avatarId);
      return true;
    } catch (error) {
      console.error('Failed to set selected avatar:', error);
    }
  }
  return false;
};

/**
 * Purchase an avatar (returns true if successful)
 */
export const purchaseAvatar = (avatarId: string, price: number): boolean => {
  // Check if already owned
  if (ownsAvatar(avatarId)) {
    return false;
  }
  
  // Check if user has enough coins
  if (spendCoins(price)) {
    addOwnedAvatar(avatarId);
    return true;
  }
  
  return false;
};

/**
 * Reset coin and avatar data (for testing/debugging)
 */
export const resetUserData = (): void => {
  try {
    localStorage.removeItem(COINS_STORAGE_KEY);
    localStorage.removeItem(OWNED_AVATARS_STORAGE_KEY);
    localStorage.removeItem(SELECTED_AVATAR_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset user data:', error);
  }
};