import React from 'react';
import { motion } from 'framer-motion';
import TVNavbar from './TVNavbar';
import { colors, fonts } from '../utils/theme';

interface TVLayoutProps {
  children: React.ReactNode;
}

const TVLayout: React.FC<TVLayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        fontFamily: fonts.body,
        position: 'relative',
      }}
    >
      <TVNavbar />
      <main
        style={{
          width: '100%',
          minHeight: '100vh',
          paddingTop: 0, // No fixed padding, content starts from top
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '100%',
            minHeight: '100vh',
          }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default TVLayout;