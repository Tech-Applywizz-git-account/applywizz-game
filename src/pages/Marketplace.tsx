import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Coins, Star, Lock } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { colors, fonts, spacing } from "../utils/theme";
import { useCoinsXP } from "../hooks/hooks";

// Sprite data structure
interface SpriteData {
  id: string;
  name: string;
  displayName: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owned: boolean;
}

// Available sprites from assets/avatars
const AVAILABLE_SPRITES: SpriteData[] = [
  { id: 'Fighter', name: 'Fighter', displayName: 'Fighter', price: 100, rarity: 'common', owned: false },
  { id: 'Girl_1', name: 'Girl_1', displayName: 'Warrior Girl', price: 150, rarity: 'common', owned: false },
  { id: 'Pyromancer_1', name: 'Pyromancer_1', displayName: 'Fire Mage I', price: 200, rarity: 'rare', owned: false },
  { id: 'Pyromancer_2', name: 'Pyromancer_2', displayName: 'Fire Mage II', price: 250, rarity: 'rare', owned: false },
  { id: 'Pyromancer_3', name: 'Pyromancer_3', displayName: 'Fire Mage III', price: 300, rarity: 'epic', owned: false },
  { id: 'Samurai', name: 'Samurai', displayName: 'Samurai', price: 400, rarity: 'epic', owned: false },
  { id: 'Samurai2', name: 'Samurai2', displayName: 'Samurai Master', price: 500, rarity: 'epic', owned: false },
  { id: 'Samurai3', name: 'Samurai3', displayName: 'Samurai Legend', price: 600, rarity: 'legendary', owned: false },
  { id: 'SamuraiArcher', name: 'SamuraiArcher', displayName: 'Samurai Archer', price: 550, rarity: 'epic', owned: false },
  { id: 'Shinobi', name: 'Shinobi', displayName: 'Shadow Ninja', price: 700, rarity: 'legendary', owned: false },
];

const RARITY_COLORS = {
  common: '#6B7280',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B'
};

interface SpriteCardProps {
  sprite: SpriteData;
  userCoins: number;
  onPurchase: (spriteId: string) => void;
}

const SpriteCard: React.FC<SpriteCardProps> = ({ sprite, userCoins, onPurchase }) => {
  const canAfford = userCoins >= sprite.price;
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Create Phaser scene for idle animation preview
  useEffect(() => {
    if (!canvasRef.current) return;

    let game: Phaser.Game | null = null;

    class IdlePreviewScene extends Phaser.Scene {
      private sprite?: Phaser.GameObjects.Sprite;

      preload() {
        this.load.spritesheet(
          `${sprite.id}_idle`,
          `/assets/avatars/${sprite.id}/Idle.png`,
          { frameWidth: 128, frameHeight: 128 }
        );
      }

      create() {
        // Create sprite at center
        this.sprite = this.add.sprite(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          `${sprite.id}_idle`
        );

        // Scale to fit card
        this.sprite.setScale(0.8);

        // Create idle animation
        if (!this.anims.exists(`${sprite.id}_idle_anim`)) {
          this.anims.create({
            key: `${sprite.id}_idle_anim`,
            frames: this.anims.generateFrameNumbers(`${sprite.id}_idle`),
            frameRate: 8,
            repeat: -1,
          });
        }

        // Play animation
        this.sprite.play(`${sprite.id}_idle_anim`);
      }
    }

    game = new Phaser.Game({
      type: Phaser.CANVAS,
      width: 120,
      height: 120,
      canvas: canvasRef.current,
      scene: IdlePreviewScene,
      physics: { default: 'arcade' },
      backgroundColor: 'transparent',
      parent: undefined,
    });

    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, [sprite.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        style={{
          padding: spacing.lg,
          border: `2px solid ${RARITY_COLORS[sprite.rarity]}40`,
          background: `linear-gradient(135deg, ${colors.surface} 0%, ${RARITY_COLORS[sprite.rarity]}10 100%)`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        hover={true}
      >
        {/* Sprite Preview */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: spacing.md,
            position: 'relative',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              borderRadius: '8px',
              background: `${colors.surfaceLight}50`,
            }}
          />
          {sprite.owned && (
            <div
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: colors.success,
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Star size={12} color="white" fill="white" />
            </div>
          )}
        </div>

        {/* Sprite Info */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing.xs,
            }}
          >
            {sprite.displayName}
          </h3>
          
          <div
            style={{
              display: 'inline-block',
              padding: `${spacing.xs} ${spacing.sm}`,
              backgroundColor: `${RARITY_COLORS[sprite.rarity]}20`,
              borderRadius: '4px',
              marginBottom: spacing.md,
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: RARITY_COLORS[sprite.rarity],
                textTransform: 'uppercase',
              }}
            >
              {sprite.rarity}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              marginBottom: spacing.md,
            }}
          >
            <Coins size={16} color={colors.warning} />
            <span
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: colors.textPrimary,
              }}
            >
              {sprite.price}
            </span>
          </div>
        </div>

        {/* Purchase Button */}
        <Button
          onClick={() => onPurchase(sprite.id)}
          disabled={!canAfford || sprite.owned}
          style={{
            width: '100%',
            backgroundColor: sprite.owned 
              ? colors.success 
              : canAfford 
                ? colors.primary 
                : colors.surfaceLight,
            color: sprite.owned 
              ? colors.textPrimary 
              : canAfford 
                ? colors.textPrimary 
                : colors.textMuted,
            border: 'none',
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: sprite.owned || !canAfford ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
          }}
        >
          {sprite.owned ? (
            <>
              <Star size={16} />
              Owned
            </>
          ) : !canAfford ? (
            <>
              <Lock size={16} />
              Insufficient Coins
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Purchase
            </>
          )}
        </Button>
      </Card>
    </motion.div>
  );
};

const Marketplace: React.FC = () => {
  const [sprites, setSprites] = useState<SpriteData[]>(AVAILABLE_SPRITES);
  const { data: coinsXPData, isLoading: coinsLoading, error: coinsError } = useCoinsXP();

  // Fallback values when API fails
  const userCoins = coinsXPData?.coins ?? 0;
  const userXP = coinsXPData?.xp ?? 0;

  const handlePurchase = (spriteId: string) => {
    const sprite = sprites.find(s => s.id === spriteId);
    if (!sprite || sprite.owned || userCoins < sprite.price) return;

    // Update sprite as owned (in real app, this would be an API call)
    setSprites(prev => 
      prev.map(s => 
        s.id === spriteId ? { ...s, owned: true } : s
      )
    );

    // Store selected sprite in localStorage for PhaserThanosGame
    localStorage.setItem('selectedSprite', spriteId);
    
    // TODO: Make API call to purchase sprite and deduct coins
    console.log(`Purchased ${sprite.displayName} for ${sprite.price} coins`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        fontFamily: fonts.body,
        display: "flex",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          marginLeft: window.innerWidth >= 1024 ? "280px" : "0",
          padding: spacing["2xl"],
        }}
      >
        <motion.div
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing["2xl"],
            }}
          >
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: colors.textPrimary,
                margin: 0,
                fontFamily: fonts.logo,
              }}
            >
              Marketplace
            </h1>

            {/* Coins & XP Display */}
            <div style={{ display: "flex", gap: spacing.lg }}>
              <Card
                style={{
                  padding: spacing.md,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                  background: `linear-gradient(135deg, ${colors.warning}20 0%, ${colors.warning}10 100%)`,
                }}
              >
                <Coins size={20} color={colors.warning} />
                <div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: colors.textPrimary,
                    }}
                  >
                    {coinsLoading ? "..." : userCoins.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: colors.textSecondary,
                    }}
                  >
                    Coins
                  </div>
                </div>
              </Card>

              <Card
                style={{
                  padding: spacing.md,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                  background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.primary}10 100%)`,
                }}
              >
                <Star size={20} color={colors.primary} />
                <div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: colors.textPrimary,
                    }}
                  >
                    {coinsLoading ? "..." : userXP.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: colors.textSecondary,
                    }}
                  >
                    XP
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Error handling for coins/XP */}
          {coinsError && (
            <Card
              style={{
                padding: spacing.md,
                marginBottom: spacing.lg,
                backgroundColor: `${colors.warning}10`,
                border: `1px solid ${colors.warning}30`,
              }}
            >
              <p style={{ margin: 0, color: colors.textSecondary, fontSize: "0.9rem" }}>
                ⚠️ Using fallback values for coins and XP. API endpoint /api/v1/coinsxp not available.
              </p>
            </Card>
          )}

          {/* Sprites Section */}
          <section style={{ marginBottom: spacing["2xl"] }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: colors.textPrimary,
                marginBottom: spacing.lg,
              }}
            >
              Battle Sprites
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: spacing.lg,
                marginBottom: spacing["2xl"],
              }}
            >
              {sprites.map((sprite) => (
                <SpriteCard
                  key={sprite.id}
                  sprite={sprite}
                  userCoins={userCoins}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
          </section>

          {/* Backgrounds Section */}
          <section>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: colors.textPrimary,
                marginBottom: spacing.lg,
              }}
            >
              Backgrounds
            </h2>

            <Card
              style={{
                padding: spacing["2xl"],
                textAlign: "center",
                background: `linear-gradient(135deg, ${colors.surfaceLight} 0%, ${colors.surface} 100%)`,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block", marginBottom: spacing.lg }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: `3px solid ${colors.primary}`,
                    borderTopColor: "transparent",
                  }}
                />
              </motion.div>
              
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  marginBottom: spacing.sm,
                }}
              >
                Coming Soon
              </h3>
              
              <p
                style={{
                  color: colors.textSecondary,
                  margin: 0,
                }}
              >
                Battle backgrounds are currently under construction. Stay tuned for epic arena environments!
              </p>
            </Card>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Marketplace;