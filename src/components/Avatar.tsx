import React from 'react';
import { motion } from 'framer-motion';
import { getCharacterIdlePath, getFallbackIdlePath } from '../utils/characterUtils';

interface AvatarProps {
  /** Character ID that maps to folder name in /assets/characters */
  id: string;
  /** Size of the avatar in pixels */
  size?: number;
  /** Whether to show the avatar as selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS styles */
  style?: React.CSSProperties;
  /** Whether to show a status indicator */
  showStatus?: boolean;
  /** Animation delay for entrance animation */
  animationDelay?: number;
  /** Custom class name */
  className?: string;
  /** Whether to show selection indicators (borders, checkmarks) */
  showSelectionIndicators?: boolean;
}

// Map character IDs to Idle sprite path using the character utility
const getCharacterImagePath = (id: string): string => {
  return getCharacterIdlePath(id);
};

const Avatar: React.FC<AvatarProps> = ({
  id,
  size = 120,
  isSelected = false,
  onClick,
  style = {},
  showStatus = false,
  animationDelay = 0,
  className = '',
  showSelectionIndicators = true,
}) => {
  const characterPath = getCharacterImagePath(id);

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    border: isSelected && showSelectionIndicators ? '3px solid #8B5CF6' : '3px solid transparent',
    transition: 'all 0.3s ease',
    boxShadow: isSelected && showSelectionIndicators 
      ? '0 8px 32px rgba(139, 92, 246, 0.4)' 
      : '0 4px 16px rgba(0, 0, 0, 0.1)',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  };

  return (
    <motion.div
      className={`avatar-container ${className}`}
      style={containerStyle}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: animationDelay,
        type: 'spring',
        bounce: 0.3
      }}
    >
      <img
        src={characterPath}
        alt={`Character ${id}`}
        style={imageStyle}
        loading="lazy"
        onError={(e) => {
          // Fallback to a default character if image fails to load
          const target = e.target as HTMLImageElement;
          target.src = getFallbackIdlePath();
        }}
      />
      
      {/* Selection Indicator */}
      {isSelected && showSelectionIndicators && (
        <motion.div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '24px',
            height: '24px',
            backgroundColor: '#8B5CF6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </motion.div>
      )}

      {/* Status Indicator */}
      {showStatus && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            width: '20px',
            height: '20px',
            backgroundColor: '#10B981',
            borderRadius: '50%',
            border: '3px solid white',
            zIndex: 3,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
        />
      )}
    </motion.div>
  );
};

export default Avatar;

// Utility function to get all available character IDs from marketplace
export const getAvailableCharacterIds = (): string[] => {
  return [
    'Amazon_1', 'Amazon_2', 'Amazon_3', 'Fire Wizard', 'Girl_1', 'Girl_2', 'Girl_3',
    'Gladiator_1', 'Gladiator_2', 'Gladiator_3', 'Karasu_tengu', 'Kitsune',
    'Knight_1', 'Knight_2', 'Knight_3', 'Kunoichi', 'Lightning Mage',
    'Man_1', 'Man_2', 'Man_3', 'Ninja_Monk', 'Ninja_Peasant',
    'Pyromancer_1', 'Pyromancer_2', 'Pyromancer_3', 'Wanderer Magican', 'Wild Zombie',
    'Witch_1', 'Witch_2', 'Witch_3', 'Yamabushi_tengu', 'Zombie Man', 'Zombie Woman',
    'Zombie_1', 'Zombie_2', 'Zombie_3'
  ];
};

// Type for character selection (updated to use string IDs)
export interface AvatarData {
  id: string;
}