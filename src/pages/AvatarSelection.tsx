import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shuffle, Palette, Star, Upload, Image } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Avatar, { getAvailableAvatarIds, AvatarData } from '../components/Avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { colors, fonts, spacing } from '../utils/theme';
import { useAuthContext } from '../hooks/hooks';
import { backendPostRequest } from '../lib/backendRequest';

const avatarIds = getAvailableAvatarIds();

const AvatarSelection: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarData | null>(null);
  const [isRandomizing, setIsRandomizing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const handleContinue = async (): Promise<void> => {
    if (selectedAvatar && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        // Send POST request to backend with avatar data
        await backendPostRequest('/avatar-info', token as string, selectedAvatar);
        
        // Store selected avatar in localStorage with the new simplified format
        localStorage.setItem('avatar', JSON.stringify(selectedAvatar));
        
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to save avatar:', error);
        // Continue to dashboard even if backend request fails
        localStorage.setItem('avatar', JSON.stringify(selectedAvatar));
        navigate('/dashboard');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRandomize = (): void => {
    setIsRandomizing(true);
    
    // Animate through random selections
    let count = 0;
    const interval = setInterval(() => {
      const randomId = avatarIds[Math.floor(Math.random() * avatarIds.length)];
      const randomAvatar: AvatarData = { id: randomId };
      setSelectedAvatar(randomAvatar);
      count++;
      
      if (count >= 8) {
        clearInterval(interval);
        setIsRandomizing(false);
      }
    }, 150);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`,
      display: 'flex',
      fontFamily: fonts.body,
    }}>
      <Sidebar />
      
      <main style={{
        flex: 1,
        marginLeft: window.innerWidth >= 1024 ? '280px' : '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 400px' : '1fr',
          gap: spacing['3xl'],
          alignItems: 'start',
        }}>
        {/* Left Column - Avatar Selection */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <motion.div
            style={{ marginBottom: spacing['2xl'] }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing.md,
              background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.primaryLight} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: fonts.logo,
            }}>
              Choose Your Avatar
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: colors.textSecondary,
              margin: 0,
              lineHeight: 1.6,
            }}>
              Pick an avatar that represents you, or let us surprise you!
            </p>
          </motion.div>

          {/* Randomize Button */}
          <motion.div
            style={{ marginBottom: spacing['2xl'] }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              onClick={handleRandomize}
              disabled={isRandomizing}
              variant="outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <motion.div
                animate={isRandomizing ? { rotate: 360 } : {}}
                transition={isRandomizing ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : {}}
              >
                <Shuffle size={16} />
              </motion.div>
              {isRandomizing ? 'Randomizing...' : 'Surprise Me!'}
            </Button>
          </motion.div>

          {/* Avatar Grid */}
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(auto-fit, minmax(120px, 1fr))' : 'repeat(3, 1fr)',
              gap: window.innerWidth >= 768 ? spacing.lg : spacing.md,
              marginBottom: spacing['2xl'],
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {avatarIds.map((id, index) => (
              <Avatar
                key={id}
                id={id}
                size={120}
                isSelected={selectedAvatar?.id === id}
                onClick={() => setSelectedAvatar({ id })}
                animationDelay={index * 0.1}
              />
            ))}
          </motion.div>

          {/* Custom Avatar Placeholder Section */}
          <motion.div
            style={{
              marginBottom: spacing['2xl'],
              padding: spacing.lg,
              border: `2px dashed ${colors.primary}40`,
              borderRadius: '12px',
              backgroundColor: `${colors.primary}05`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div style={{
              textAlign: 'center',
              color: colors.textSecondary,
            }}>
              <motion.div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginBottom: spacing.md,
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Upload size={20} style={{ color: colors.primary }} />
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: colors.primary,
                  margin: 0,
                }}>
                  Custom Avatar Upload
                </h4>
              </motion.div>
              <p style={{
                fontSize: '0.9rem',
                color: colors.textMuted,
                margin: 0,
                marginBottom: spacing.sm,
              }}>
                Upload your own image for a personalized avatar
              </p>
              <motion.button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.primary}40`,
                  borderRadius: '6px',
                  color: colors.primary,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: fonts.body,
                }}
                whileHover={{ 
                  backgroundColor: `${colors.primary}10`,
                  borderColor: colors.primary,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Image size={16} />
                Coming Soon
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Preview & Continue */}
        <motion.div
          style={{
            position: 'sticky',
            top: spacing.xl,
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card style={{ padding: spacing['2xl'] }}>
            <CardHeader style={{ textAlign: 'center' }}>
              <CardTitle style={{ 
                fontSize: '1.5rem', 
                marginBottom: spacing.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
              }}>
                <Palette size={24} style={{ color: colors.primary }} />
                Avatar Preview
              </CardTitle>
              <CardDescription style={{ fontSize: '1rem' }}>
                {selectedAvatar ? 'Great choice! This avatar will represent you.' : 'Select an avatar to see preview'}
              </CardDescription>
            </CardHeader>
            
            <CardContent style={{ textAlign: 'center' }}>
              {/* Avatar Preview */}
              <motion.div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: spacing.xl,
                }}
                key={selectedAvatar?.id || 'empty'}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {selectedAvatar ? (
                  <div style={{ position: 'relative' }}>
                    <Avatar
                      id={selectedAvatar.id}
                      size={160}
                      isSelected={true}
                      style={{
                        boxShadow: `0 8px 32px rgba(139, 92, 246, 0.4)`,
                      }}
                    />
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '24px',
                        height: '24px',
                        backgroundColor: colors.success,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 3,
                        border: `2px solid ${colors.surface}`,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                    >
                      <Star size={12} style={{ color: colors.textPrimary }} />
                    </motion.div>
                  </div>
                ) : (
                  <div style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    backgroundColor: colors.surfaceLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px dashed ${colors.surfaceLight}`,
                  }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: colors.surface,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>👤</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Avatar Details */}
              {selectedAvatar && (
                <motion.div
                  style={{
                    marginBottom: spacing.xl,
                    padding: spacing.md,
                    backgroundColor: `${colors.surfaceLight}40`,
                    borderRadius: '8px',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p style={{
                    fontSize: '0.9rem',
                    color: colors.textSecondary,
                    margin: 0,
                    marginBottom: spacing.xs,
                  }}>
                    Avatar: <span style={{ color: colors.primary, fontWeight: '600' }}>#{selectedAvatar.id}</span>
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: colors.textSecondary,
                    margin: 0,
                  }}>
                    Style: <span style={{ color: colors.primary, fontWeight: '600' }}>Premium Avatar</span>
                  </p>
                </motion.div>
              )}

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                disabled={!selectedAvatar || isSubmitting}
                size="lg"
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  marginBottom: spacing.lg,
                }}
              >
                <span>{isSubmitting ? 'Saving...' : 'Continue to Dashboard'}</span>
                {selectedAvatar && !isSubmitting && (
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                )}
              </Button>

              {/* Progress indicator */}
              <motion.div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: spacing.sm,
                  marginBottom: spacing.md,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {[0, 1, 2].map((step) => (
                  <motion.div
                    key={step}
                    style={{
                      width: step === 1 ? '32px' : '8px',
                      height: '8px',
                      backgroundColor: step <= 1 ? colors.primary : colors.surfaceLight,
                      borderRadius: '4px',
                    }}
                  />
                ))}
              </motion.div>

              <motion.p
                style={{
                  color: colors.textMuted,
                  fontSize: '0.85rem',
                  margin: 0,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                Step 2 of 3 - Avatar Selection
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AvatarSelection;