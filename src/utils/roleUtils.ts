/**
 * Utility functions for role-based access control
 * Centralized role management for better maintainability
 */

/**
 * Valid career associate role identifiers
 */
const CAREER_ASSOCIATE_ROLES = [
  "career-associate",
  "CA", 
  "Team Lead",
  "Junior CA"
] as const;

/**
 * Check if the current user has career-associate or equivalent roles
 * @returns boolean indicating if user has access to career associate features
 */
export const isCareerAssociate = (): boolean => {
  const role = localStorage.getItem("role");
  return role ? CAREER_ASSOCIATE_ROLES.includes(role as any) : false;
};

/**
 * Get the current user's role from localStorage
 * @returns string role or null if not set
 */
export const getCurrentRole = (): string | null => {
  return localStorage.getItem("role");
};

/**
 * Check if user has non-career associate access (for UI restrictions)
 * @returns boolean indicating if user is a non-career associate
 */
export const isNonCareerAssociate = (): boolean => {
  return !isCareerAssociate();
};

/**
 * Get role display name for UI purposes
 * @returns formatted role name or "Guest" if no role
 */
export const getRoleDisplayName = (): string => {
  const role = getCurrentRole();
  if (!role) return "Guest";
  
  // Convert role to display format
  switch (role) {
    case "CA":
      return "Career Associate";
    case "Team Lead":
      return "Team Lead";
    case "Junior CA":
      return "Junior Career Associate";
    case "career-associate":
      return "Career Associate";
    default:
      return role;
  }
};

/**
 * Role-based feature access control
 */
export const roleAccess = {
  /**
   * Features available only to career associates
   */
  careerAssociate: {
    dashboard: (): boolean => isCareerAssociate(),
    avatarSelection: (): boolean => isCareerAssociate(),
    settings: (): boolean => isCareerAssociate(),
    progressTracking: (): boolean => isCareerAssociate(),
  },
  
  /**
   * Features available to all users
   */
  general: {
    spaces: (): boolean => true,
    leaderboard: (): boolean => true,
  },
  
  /**
   * Features specific to non-career associates
   */
  nonCareerAssociate: {
    avatarUpload: (): boolean => isNonCareerAssociate(),
    limitedSettings: (): boolean => isNonCareerAssociate(),
  }
} as const;