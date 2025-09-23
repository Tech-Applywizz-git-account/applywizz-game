/**
 * Utility functions for badge management
 * Maps badge names to their corresponding PNG image paths
 */

export interface BadgeInfo {
  name: string;
  imagePath: string;
  displayName: string;
}

/**
 * Badge mapping configuration
 * Maps badge names (as returned from API) to their PNG file paths
 */
const BADGE_MAPPING: Record<string, BadgeInfo> = {
  'Bronze': {
    name: 'Bronze',
    imagePath: '/assets/Badges/Bronze.png',
    displayName: 'Bronze Badge'
  },
  'Silver': {
    name: 'Silver',
    imagePath: '/assets/Badges/Silver.png',
    displayName: 'Silver Badge'
  },
  'Gold': {
    name: 'Gold',
    imagePath: '/assets/Badges/Gold.png',
    displayName: 'Gold Badge'
  },
  'Diamond': {
    name: 'Diamond',
    imagePath: '/assets/Badges/Diamond.png',
    displayName: 'Diamond Badge'
  },
  'Ruby': {
    name: 'Ruby',
    imagePath: '/assets/Badges/Ruby.png',
    displayName: 'Ruby Badge'
  },
  'Emerald': {
    name: 'Emerald',
    imagePath: '/assets/Badges/Emerald.png',
    displayName: 'Emerald Badge'
  },
  'Sapphire': {
    name: 'Sapphire',
    imagePath: '/assets/Badges/Sapphire.png',
    displayName: 'Sapphire Badge'
  },
  'Baahubali': {
    name: 'Baahubali',
    imagePath: '/assets/Badges/Baahubali.png',
    displayName: 'Baahubali Badge'
  }
};

/**
 * Get badge information by badge name
 * @param badgeName - Name of the badge (e.g., "Bronze", "Silver")
 * @returns BadgeInfo object or null if badge not found
 */
export const getBadgeInfo = (badgeName: string | null | undefined): BadgeInfo | null => {
  if (!badgeName) return null;
  
  // Try exact match first
  if (BADGE_MAPPING[badgeName]) {
    return BADGE_MAPPING[badgeName];
  }
  
  // Try case-insensitive match
  const lowerBadgeName = badgeName.toLowerCase();
  const foundKey = Object.keys(BADGE_MAPPING).find(
    key => key.toLowerCase() === lowerBadgeName
  );
  
  return foundKey ? BADGE_MAPPING[foundKey] : null;
};

/**
 * Get badge image path by badge name
 * @param badgeName - Name of the badge
 * @returns Image path string or null if badge not found
 */
export const getBadgeImagePath = (badgeName: string | null | undefined): string | null => {
  const badgeInfo = getBadgeInfo(badgeName);
  return badgeInfo ? badgeInfo.imagePath : null;
};

/**
 * Check if a badge name is valid
 * @param badgeName - Name of the badge to check
 * @returns Boolean indicating if badge exists
 */
export const isValidBadge = (badgeName: string | null | undefined): boolean => {
  return getBadgeInfo(badgeName) !== null;
};

/**
 * Get all available badge names
 * @returns Array of all badge names
 */
export const getAllBadgeNames = (): string[] => {
  return Object.keys(BADGE_MAPPING);
};

/**
 * Get all available badges
 * @returns Array of all BadgeInfo objects
 */
export const getAllBadges = (): BadgeInfo[] => {
  return Object.values(BADGE_MAPPING);
};