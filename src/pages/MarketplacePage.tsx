import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AvatarMarketplace from '../components/AvatarMarketplace';
import { Button } from '../components/ui/button';
import { colors, spacing } from '../utils/theme';
import { AvatarId } from '../types/avatarTypes';

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();

  const handleAvatarSelect = (avatarId: AvatarId) => {
    // Avatar selection is handled by the marketplace component
    console.log('Avatar selected:', avatarId);
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.background }}>
      <Sidebar />
      
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Back button */}
        <div style={{ 
          padding: spacing.lg,
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.background,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <Button
            onClick={handleGoBack}
            variant="outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>

        {/* Marketplace content */}
        <AvatarMarketplace onAvatarSelect={handleAvatarSelect} />
      </main>
    </div>
  );
};

export default MarketplacePage;