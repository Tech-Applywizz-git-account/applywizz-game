/**
 * Utility functions for role-based access control
 */

/**
 * Check if the current user has career-associate or equivalent roles
 * @returns boolean indicating if user has access to career associate features
 */
export const isCareerAssociate = (): boolean => {
  const role = localStorage.getItem("role");
  return role === "career-associate" || role === "CA" || role === "Team Lead" || role === "Junior CA";
};

/**
 * Get the current user's role from localStorage
 * @returns string role or null if not set
 */
export const getCurrentRole = (): string | null => {
  return localStorage.getItem("role");
};