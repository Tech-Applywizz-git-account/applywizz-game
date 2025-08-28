/**
 * Avatar Context for managing avatar state across the application
 * Provides avatar selection, localStorage persistence, and revert functionality
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAvatarMapping, 
  getSpriteFolder, 
  getDefaultAvatarId,
  isValidAvatarId,
  type AvatarMapping,
  type AvatarSpriteId 
} from '../utils/avatarMapping';

// Enhanced avatar data interface
export interface AvatarData {
  id: number;
  spriteFolder: AvatarSpriteId;
  name: string;
  preview: string;
}

interface AvatarContextType {
  // Current avatar data
  currentAvatar: AvatarData;
  previousAvatar: AvatarData | null;
  
  // Avatar management
  selectAvatar: (avatarId: number) => void;
  revertAvatar: () => void;
  
  // Utility functions
  getSpriteFolder: () => AvatarSpriteId;
  hasChanged: boolean;
  
  // Storage management
  saveToStorage: () => void;
  loadFromStorage: () => AvatarData | null;
  clearStorage: () => void;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

// Storage key
const AVATAR_STORAGE_KEY = 'selectedAvatar';
const PREVIOUS_AVATAR_STORAGE_KEY = 'previousAvatar';

// Helper function to create avatar data from ID
const createAvatarData = (avatarId: number): AvatarData => {
  const mapping = getAvatarMapping(avatarId);
  if (!mapping) {
    // Fallback to default
    const defaultMapping = getAvatarMapping(getDefaultAvatarId())!;
    return {
      id: defaultMapping.id,
      spriteFolder: defaultMapping.spriteFolder,
      name: defaultMapping.name,
      preview: defaultMapping.preview
    };
  }
  
  return {
    id: mapping.id,
    spriteFolder: mapping.spriteFolder,
    name: mapping.name,
    preview: mapping.preview
  };
};

// Helper function to load avatar from localStorage
const loadAvatarFromStorage = (): AvatarData | null => {
  try {
    const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Handle both old format (just ID) and new format (full data)
    if (typeof parsed === 'number') {
      return createAvatarData(parsed);
    } else if (parsed && typeof parsed === 'object' && parsed.id) {
      return createAvatarData(parsed.id);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load avatar from storage:', error);
    return null;
  }
};

// Helper function to load previous avatar from localStorage
const loadPreviousAvatarFromStorage = (): AvatarData | null => {
  try {
    const stored = localStorage.getItem(PREVIOUS_AVATAR_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object' && parsed.id) {
      return createAvatarData(parsed.id);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load previous avatar from storage:', error);
    return null;
  }
};

interface AvatarProviderProps {
  children: ReactNode;
}

export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  // Initialize with stored avatar or default
  const [currentAvatar, setCurrentAvatar] = useState<AvatarData>(() => {
    const storedAvatar = loadAvatarFromStorage();
    return storedAvatar || createAvatarData(getDefaultAvatarId());
  });
  
  const [previousAvatar, setPreviousAvatar] = useState<AvatarData | null>(() => {
    return loadPreviousAvatarFromStorage();
  });
  
  // Track if avatar has changed from initial/stored value
  const [initialAvatar] = useState<AvatarData>(currentAvatar);
  const hasChanged = currentAvatar.id !== initialAvatar.id;
  
  // Select new avatar
  const selectAvatar = (avatarId: number) => {
    if (!isValidAvatarId(avatarId)) {
      console.warn(`Invalid avatar ID: ${avatarId}`);
      return;
    }
    
    // Store current as previous before changing
    setPreviousAvatar(currentAvatar);
    localStorage.setItem(PREVIOUS_AVATAR_STORAGE_KEY, JSON.stringify(currentAvatar));
    
    // Set new avatar
    const newAvatar = createAvatarData(avatarId);
    setCurrentAvatar(newAvatar);
  };
  
  // Revert to previous avatar
  const revertAvatar = () => {
    if (previousAvatar) {
      setCurrentAvatar(previousAvatar);
      setPreviousAvatar(null);
      localStorage.removeItem(PREVIOUS_AVATAR_STORAGE_KEY);
    }
  };
  
  // Save current avatar to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(currentAvatar));
      console.log('Avatar saved to storage:', currentAvatar);
    } catch (error) {
      console.error('Failed to save avatar to storage:', error);
    }
  };
  
  // Load avatar from localStorage
  const loadFromStorage = (): AvatarData | null => {
    return loadAvatarFromStorage();
  };
  
  // Clear avatar from localStorage
  const clearStorage = () => {
    try {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
      localStorage.removeItem(PREVIOUS_AVATAR_STORAGE_KEY);
      setPreviousAvatar(null);
    } catch (error) {
      console.error('Failed to clear avatar storage:', error);
    }
  };
  
  // Get sprite folder for current avatar
  const getCurrentSpriteFolder = (): AvatarSpriteId => {
    return getSpriteFolder(currentAvatar.id);
  };
  
  // Auto-save to storage when avatar changes
  useEffect(() => {
    saveToStorage();
  }, [currentAvatar]);
  
  const value: AvatarContextType = {
    currentAvatar,
    previousAvatar,
    selectAvatar,
    revertAvatar,
    getSpriteFolder: getCurrentSpriteFolder,
    hasChanged,
    saveToStorage,
    loadFromStorage,
    clearStorage
  };
  
  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
};

// Hook to use avatar context
export const useAvatar = (): AvatarContextType => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};