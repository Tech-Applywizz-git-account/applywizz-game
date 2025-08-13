import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  Settings, 
  Trophy, 
  Grid3X3,
  Menu,
  X,
  LucideIcon
} from 'lucide-react';
import Logo from './Logo';
import { colors, fonts, spacing } from '../utils/theme';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  disabled?: boolean;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'avatar', label: 'Avatar', icon: User, path: '/avatar' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { id: 'spaces', label: 'Spaces', icon: Grid3X3, path: '/spaces' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleNavigate = (path: string, disabled?: boolean): void => {
    if (!disabled) {
      navigate(path);
      if (isMobile) {
        setIsMobileMenuOpen(false);
      }
    }
  };

  // Mobile menu toggle button
  const MobileMenuButton = () => (
    <motion.button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      style={{
        position: 'fixed',
        top: spacing.lg,
        left: spacing.lg,
        zIndex: 1001,
        width: '48px',
        height: '48px',
        backgroundColor: colors.surface,
        border: `1px solid ${colors.surfaceLight}`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
      whileHover={{ backgroundColor: colors.surfaceLight }}
      whileTap={{ scale: 0.95 }}
    >
      {isMobileMenuOpen ? (
        <X size={20} style={{ color: colors.textPrimary }} />
      ) : (
        <Menu size={20} style={{ color: colors.textPrimary }} />
      )}
    </motion.button>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && <MobileMenuButton />}

      {/* Sidebar */}
      <motion.div
        className="sidebar"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '280px',
          height: '100vh',
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.surfaceLight}`,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: spacing.lg,
          transform: isMobile && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}
        initial={{ x: isMobile ? -280 : 0 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Logo Section */}
        <div style={{ marginBottom: spacing['2xl'] }}>
          <Logo size="medium" />
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isDisabled = item.disabled;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.path, isDisabled)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? colors.primary : 'transparent',
                  color: isDisabled ? colors.textMuted : (isActive ? colors.textPrimary : colors.textSecondary),
                  fontSize: '0.95rem',
                  fontFamily: fonts.body,
                  fontWeight: isActive ? '600' : '400',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                  opacity: isDisabled ? 0.5 : 1,
                }}
                whileHover={!isDisabled ? { 
                  backgroundColor: isActive ? colors.primaryDark : colors.surfaceLight,
                  x: 4,
                } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ 
          paddingTop: spacing.lg, 
          borderTop: `1px solid ${colors.surfaceLight}`,
          color: colors.textMuted,
          fontSize: '0.8rem',
          fontFamily: fonts.body,
        }}>
          <p>© 2024 ApplyWizz</p>
          <p style={{ opacity: 0.7 }}>v1.0.0</p>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;