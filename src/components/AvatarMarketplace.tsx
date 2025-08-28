import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Coins, Star, Check, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { colors, fonts, spacing } from '../utils/theme';
import { 
  AVATAR_CATALOG, 
  RARITY_COLORS, 
  AvatarId, 
  AvatarInfo,
  getAllAvatarIds 
} from '../types/avatarTypes';
import { 
  getCoins, 
  getOwnedAvatars, 
  getSelectedAvatar,
  purchaseAvatar, 
  setSelectedAvatar,
  ownsAvatar 
} from '../utils/coinSystem';

interface AvatarMarketplaceProps {
  onAvatarSelect?: (avatarId: AvatarId) => void;
}

const AvatarMarketplace: React.FC<AvatarMarketplaceProps> = ({ onAvatarSelect }) => {
  const [coins, setCoinsState] = useState<number>(getCoins());
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>(getOwnedAvatars());
  const [selectedAvatar, setSelectedAvatarState] = useState<string>(getSelectedAvatar());
  const [purchaseStates, setPurchaseStates] = useState<Record<string, 'idle' | 'purchasing' | 'success' | 'error'>>({});

  // Refresh data on mount
  useEffect(() => {
    setCoinsState(getCoins());
    setOwnedAvatars(getOwnedAvatars());
    setSelectedAvatarState(getSelectedAvatar());
  }, []);

  const handlePurchase = async (avatarId: AvatarId) => {
    const avatar = AVATAR_CATALOG[avatarId];
    
    setPurchaseStates(prev => ({ ...prev, [avatarId]: 'purchasing' }));
    
    // Simulate purchase delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = purchaseAvatar(avatarId, avatar.price);
    
    if (success) {
      setPurchaseStates(prev => ({ ...prev, [avatarId]: 'success' }));
      setCoinsState(getCoins());
      setOwnedAvatars(getOwnedAvatars());
      
      // Auto-select newly purchased avatar
      if (setSelectedAvatar(avatarId)) {
        setSelectedAvatarState(avatarId);
        onAvatarSelect?.(avatarId);
      }
      
      // Clear success state after animation
      setTimeout(() => {
        setPurchaseStates(prev => ({ ...prev, [avatarId]: 'idle' }));
      }, 2000);
    } else {
      setPurchaseStates(prev => ({ ...prev, [avatarId]: 'error' }));
      setTimeout(() => {
        setPurchaseStates(prev => ({ ...prev, [avatarId]: 'idle' }));
      }, 2000);
    }
  };

  const handleSelect = (avatarId: AvatarId) => {
    if (ownsAvatar(avatarId)) {
      if (setSelectedAvatar(avatarId)) {
        setSelectedAvatarState(avatarId);
        onAvatarSelect?.(avatarId);
      }
    }
  };

  const getPurchaseButtonText = (avatarId: AvatarId): string => {
    const state = purchaseStates[avatarId] || 'idle';
    switch (state) {
      case 'purchasing': return 'Purchasing...';
      case 'success': return 'Purchased!';
      case 'error': return 'Insufficient Coins';
      default: return `Buy for ${AVATAR_CATALOG[avatarId].price} coins`;
    }
  };

  const getPurchaseButtonVariant = (avatarId: AvatarId): "default" | "outline" => {
    const state = purchaseStates[avatarId] || 'idle';
    return state === 'error' ? 'outline' : 'default';
  };

  const groupedAvatars = getAllAvatarIds().reduce((acc, id) => {
    const avatar = AVATAR_CATALOG[id];
    if (!acc[avatar.rarity]) {
      acc[avatar.rarity] = [];
    }
    acc[avatar.rarity].push(avatar);
    return acc;
  }, {} as Record<AvatarInfo['rarity'], AvatarInfo[]>);

  return (
    <div style={{ padding: spacing.lg, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with coin balance */}
      <motion.div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xl,
          padding: spacing.lg,
          backgroundColor: colors.background,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontFamily: fonts.logo,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            marginBottom: spacing.xs,
          }}>
            Avatar Marketplace
          </h1>
          <p style={{
            color: colors.textSecondary,
            margin: 0,
            fontSize: '1.1rem',
          }}>
            Purchase avatars with coins to use in battle
          </p>
        </div>
        
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.md,
            backgroundColor: colors.primary + '10',
            borderRadius: '8px',
            border: `2px solid ${colors.primary}30`,
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Coins size={24} color={colors.primary} />
          <span style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.primary,
          }}>
            {coins.toLocaleString()}
          </span>
        </motion.div>
      </motion.div>

      {/* Avatar sections by rarity */}
      {(['common', 'rare', 'epic', 'legendary'] as const).map((rarity, sectionIndex) => {
        const avatarsInRarity = groupedAvatars[rarity] || [];
        if (avatarsInRarity.length === 0) return null;

        return (
          <motion.section
            key={rarity}
            style={{ marginBottom: spacing.xl }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: sectionIndex * 0.2 }}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: RARITY_COLORS[rarity],
              marginBottom: spacing.lg,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              textTransform: 'capitalize',
            }}>
              <Star size={20} fill={RARITY_COLORS[rarity]} color={RARITY_COLORS[rarity]} />
              {rarity} Avatars
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: spacing.lg,
            }}>
              {avatarsInRarity.map((avatar, index) => {
                const isOwned = ownedAvatars.includes(avatar.id);
                const isSelected = selectedAvatar === avatar.id;
                const purchaseState = purchaseStates[avatar.id] || 'idle';
                
                return (
                  <motion.div
                    key={avatar.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader style={{ position: 'relative' }}>
                        {/* Rarity indicator */}
                        <div style={{
                          position: 'absolute',
                          top: spacing.sm,
                          right: spacing.sm,
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: RARITY_COLORS[avatar.rarity],
                        }} />
                        
                        {/* Avatar preview */}
                        <div style={{
                          width: '120px',
                          height: '120px',
                          margin: '0 auto',
                          position: 'relative',
                          border: isSelected 
                            ? `3px solid ${colors.primary}` 
                            : `3px solid ${colors.border}`,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: colors.background,
                        }}>
                          <img
                            src={avatar.previewImage}
                            alt={avatar.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              filter: isOwned ? 'none' : 'grayscale(100%)',
                            }}
                          />
                          
                          {!isOwned && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Lock size={32} color="white" />
                            </div>
                          )}
                          
                          {isSelected && (
                            <motion.div
                              style={{
                                position: 'absolute',
                                top: spacing.xs,
                                right: spacing.xs,
                                width: '24px',
                                height: '24px',
                                backgroundColor: colors.primary,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', bounce: 0.5 }}
                            >
                              <Check size={14} color="white" />
                            </motion.div>
                          )}
                        </div>
                        
                        <CardTitle style={{ textAlign: 'center', marginTop: spacing.md }}>
                          {avatar.name}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent>
                        <p style={{
                          color: colors.textSecondary,
                          fontSize: '0.9rem',
                          textAlign: 'center',
                          marginBottom: spacing.lg,
                          lineHeight: 1.5,
                        }}>
                          {avatar.description}
                        </p>
                        
                        {isOwned ? (
                          <Button
                            onClick={() => handleSelect(avatar.id)}
                            variant={isSelected ? "default" : "outline"}
                            style={{ width: '100%' }}
                            disabled={isSelected}
                          >
                            {isSelected ? 'Selected' : 'Select Avatar'}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handlePurchase(avatar.id)}
                            variant={getPurchaseButtonVariant(avatar.id)}
                            style={{ 
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing.xs,
                            }}
                            disabled={purchaseState !== 'idle' || coins < avatar.price}
                          >
                            {purchaseState === 'idle' && <ShoppingCart size={16} />}
                            {purchaseState === 'success' && <Check size={16} />}
                            {getPurchaseButtonText(avatar.id)}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
};

export default AvatarMarketplace;