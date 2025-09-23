import React from 'react';

interface BadgeDisplayProps {
  badgeText?: string;
  badgeImageUrl?: string;
  size?: number;
  style?: React.CSSProperties;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ 
  badgeText, 
  badgeImageUrl, 
  size = 24,
  style = {} 
}) => {
  // If we have a badge image URL from API, use that first
  if (badgeImageUrl) {
    return (
      <img
        src={badgeImageUrl}
        alt={badgeText || 'Badge'}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          ...style
        }}
      />
    );
  }

  // If badge text is "Bronze", show the Bronze.png image
  if (badgeText === 'Bronze') {
    return (
      <img
        src="/assets/Badges/Bronze.png"
        alt="Bronze Badge"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          ...style
        }}
      />
    );
  }

  // For other badge text values, display as text
  return (
    <span style={style}>
      {badgeText || 'N/A'}
    </span>
  );
};

export default BadgeDisplay;