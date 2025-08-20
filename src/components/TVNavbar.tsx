import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Grid3X3 } from 'lucide-react';
import Logo from './Logo';
import { colors, fonts, spacing } from '../utils/theme';

interface TVNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

const TVNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const navItems: TVNavItem[] = [
    { id: 'spaces', label: 'Spaces', icon: Grid3X3, path: '/spaces' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '100px',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <motion.nav
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          backgroundColor: `${colors.surface}95`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${colors.surfaceLight}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${spacing['2xl']}`,
          pointerEvents: 'auto',
        }}
        initial={{ y: -80 }}
        animate={{ y: isVisible ? 0 : -80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo size="small" />
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', gap: spacing.lg }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? colors.primary : 'transparent',
                  color: isActive ? colors.textPrimary : colors.textSecondary,
                  fontSize: '1rem',
                  fontFamily: fonts.body,
                  fontWeight: isActive ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                whileHover={!isActive ? { 
                  backgroundColor: colors.surfaceLight,
                  color: colors.textPrimary,
                } : {}}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
};

export default TVNavbar;