import React from 'react';
import { motion } from 'framer-motion';

interface AvatarProps {
  /** Avatar ID (1-12) that maps to avatar_XX.png */
  id: number;
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
}

// Map avatar IDs to filename format
const getAvatarImagePath = (id: number): string => {
  // Ensure ID is within valid range (1-12)
  const validId = Math.max(1, Math.min(12, id));
  const paddedId = validId.toString().padStart(2, '0');
  return `/assets/avatar_${paddedId}.png`;
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
}) => {
  const avatarPath = getAvatarImagePath(id);

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    border: isSelected ? '3px solid #8B5CF6' : '3px solid transparent',
    transition: 'all 0.3s ease',
    boxShadow: isSelected 
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
        src={avatarPath}
        alt={`Avatar ${id}`}
        style={imageStyle}
        loading="lazy"
      />
      
      {/* Selection Indicator */}
      {isSelected && (
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

// Utility function to get all available avatar IDs
export const getAvailableAvatarIds = (): number[] => {
  return Array.from({ length: 12 }, (_, i) => i + 1);
};

// Type for avatar selection
export interface AvatarData {
  id: number;
}