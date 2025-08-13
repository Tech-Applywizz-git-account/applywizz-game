/**
 * Utility functions for role-based access control
 */

/**
 * Check if the current user has career-associate role
 * @returns boolean indicating if user is a career-associate
 */
export const isCareerAssociate = (): boolean => {
  const role = localStorage.getItem("role");
  return role === "career-associate";
};

/**
 * Get the current user's role from localStorage
 * @returns string role or null if not set
 */
export const getCurrentRole = (): string | null => {
  return localStorage.getItem("role");
};