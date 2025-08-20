import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Grid3X3 } from 'lucide-react';
import { colors, fonts, spacing } from '../utils/theme';

const FloatingNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'spaces', label: 'Spaces', icon: Grid3X3, path: '/spaces' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
  ];

  const handleNavigate = (path: string): void => {
    navigate(path);
  };

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: spacing.lg,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: colors.surface,
        borderRadius: '16px',
        padding: spacing.md,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        border: `1px solid ${colors.surfaceLight}`,
        display: 'flex',
        gap: spacing.sm,
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <motion.button
            key={item.id}
            onClick={() => handleNavigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '12px',
              border: 'none',
              backgroundColor: isActive ? colors.primary : 'transparent',
              color: isActive ? colors.textPrimary : colors.textSecondary,
              fontSize: '0.9rem',
              fontFamily: fonts.body,
              fontWeight: isActive ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            whileHover={{ 
              backgroundColor: isActive ? colors.primaryDark : colors.surfaceLight,
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default FloatingNavbar;