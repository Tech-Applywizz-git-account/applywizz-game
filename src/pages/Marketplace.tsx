import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Coins, Star, Lock } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { colors, fonts, spacing } from "../utils/theme";
import { useCoinsXP } from "../hooks/hooks";
import { getSafeCharacterId, getFallbackIdlePath } from "../utils/characterUtils";

// Sprite data structure
interface SpriteData {
  id: string;
  name: string;
  displayName: string;
  price: number;
  owned: boolean;
}

// Available sprites from assets/avatars - matches actual directory structure
const AVAILABLE_SPRITES: SpriteData[] = [
  { id: 'Amazon_1', name: 'Amazon_1', displayName: 'Amazon Warrior I', price: 100, owned: false },
  { id: 'Amazon_2', name: 'Amazon_2', displayName: 'Amazon Warrior II', price: 150, owned: false },
  { id: 'Amazon_3', name: 'Amazon_3', displayName: 'Amazon Warrior III', price: 200, owned: false },
  { id: 'Fire Wizard', name: 'Fire Wizard', displayName: 'Fire Wizard', price: 300, owned: false },
  { id: 'Girl_1', name: 'Girl_1', displayName: 'Warrior Girl I', price: 120, owned: false },
  { id: 'Girl_2', name: 'Girl_2', displayName: 'Warrior Girl II', price: 140, owned: false },
  { id: 'Girl_3', name: 'Girl_3', displayName: 'Warrior Girl III', price: 160, owned: false },
  { id: 'Gladiator_1', name: 'Gladiator_1', displayName: 'Gladiator I', price: 180, owned: false },
  { id: 'Gladiator_2', name: 'Gladiator_2', displayName: 'Gladiator II', price: 200, owned: false },
  { id: 'Gladiator_3', name: 'Gladiator_3', displayName: 'Gladiator III', price: 220, owned: false },
  { id: 'Karasu_tengu', name: 'Karasu_tengu', displayName: 'Karasu Tengu', price: 400, owned: false },
  { id: 'Kitsune', name: 'Kitsune', displayName: 'Kitsune Spirit', price: 350, owned: false },
  { id: 'Knight_1', name: 'Knight_1', displayName: 'Knight I', price: 250, owned: false },
  { id: 'Knight_2', name: 'Knight_2', displayName: 'Knight II', price: 300, owned: false },
  { id: 'Knight_3', name: 'Knight_3', displayName: 'Knight III', price: 350, owned: false },
  { id: 'Kunoichi', name: 'Kunoichi', displayName: 'Kunoichi Ninja', price: 450, owned: false },
  { id: 'Lightning Mage', name: 'Lightning Mage', displayName: 'Lightning Mage', price: 320, owned: false },
  { id: 'Man_1', name: 'Man_1', displayName: 'Warrior Man I', price: 110, owned: false },
  { id: 'Man_2', name: 'Man_2', displayName: 'Warrior Man II', price: 130, owned: false },
  { id: 'Man_3', name: 'Man_3', displayName: 'Warrior Man III', price: 150, owned: false },
  { id: 'Ninja_Monk', name: 'Ninja_Monk', displayName: 'Ninja Monk', price: 380, owned: false },
  { id: 'Ninja_Peasant', name: 'Ninja_Peasant', displayName: 'Ninja Peasant', price: 280, owned: false },
  { id: 'Pyromancer_1', name: 'Pyromancer_1', displayName: 'Fire Mage I', price: 200, owned: false },
  { id: 'Pyromancer_2', name: 'Pyromancer_2', displayName: 'Fire Mage II', price: 250, owned: false },
  { id: 'Pyromancer_3', name: 'Pyromancer_3', displayName: 'Fire Mage III', price: 300, owned: false },
  { id: 'Wanderer Magican', name: 'Wanderer Magican', displayName: 'Wanderer Magician', price: 270, owned: false },
  { id: 'Wild Zombie', name: 'Wild Zombie', displayName: 'Wild Zombie', price: 180, owned: false },
  { id: 'Witch_1', name: 'Witch_1', displayName: 'Witch I', price: 190, owned: false },
  { id: 'Witch_2', name: 'Witch_2', displayName: 'Witch II', price: 240, owned: false },
  { id: 'Witch_3', name: 'Witch_3', displayName: 'Witch III', price: 290, owned: false },
  { id: 'Yamabushi_tengu', name: 'Yamabushi_tengu', displayName: 'Yamabushi Tengu', price: 420, owned: false },
  { id: 'Zombie Man', name: 'Zombie Man', displayName: 'Zombie Man', price: 160, owned: false },
  { id: 'Zombie Woman', name: 'Zombie Woman', displayName: 'Zombie Woman', price: 170, owned: false },
  { id: 'Zombie_1', name: 'Zombie_1', displayName: 'Zombie I', price: 140, owned: false },
  { id: 'Zombie_2', name: 'Zombie_2', displayName: 'Zombie II', price: 150, owned: false },
  { id: 'Zombie_3', name: 'Zombie_3', displayName: 'Zombie III', price: 160, owned: false },
];

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
      private spriteObj?: Phaser.GameObjects.Sprite;
      private spriteId: string;

      constructor() {
        super();
        this.spriteId = sprite.id;
      }

      preload() {
        try {
          const safeSprite = getSafeCharacterId(this.spriteId);
          this.load.spritesheet(
            `${this.spriteId}_idle`,
            `/assets/characters/${safeSprite}/Idle.png`,
            { frameWidth: 128, frameHeight: 128 }
          );
          
          // Fallback spritesheet in case the main one fails
          this.load.spritesheet(
            'fallback_idle',
            getFallbackIdlePath(),
            { frameWidth: 128, frameHeight: 128 }
          );
          
          // Add error handling for failed loads
          this.load.on('loaderror', (file: any) => {
            console.warn(`Failed to load sprite: ${file.src}, will use fallback`);
          });
        } catch (error) {
          console.error(`Error loading sprite sheet for ${this.spriteId}:`, error);
        }
      }

      create() {
        try {
          let spriteKey = `${this.spriteId}_idle`;
          let animKey = `${this.spriteId}_idle_anim`;
          
          // Check if texture was loaded successfully, use fallback if not
          if (!this.textures.exists(spriteKey)) {
            console.warn(`Texture ${spriteKey} not found, using fallback`);
            spriteKey = 'fallback_idle';
            animKey = 'fallback_idle_anim';
          }

          // Create sprite at center
          this.spriteObj = this.add.sprite(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            spriteKey
          );

          // Scale to fit card
          this.spriteObj.setScale(0.8);

          // Create idle animation if it doesn't exist
          if (!this.anims.exists(animKey)) {
            try {
              this.anims.create({
                key: animKey,
                frames: this.anims.generateFrameNumbers(spriteKey),
                frameRate: 8,
                repeat: -1,
              });
            } catch (animError) {
              console.warn(`Failed to create animation for ${spriteKey}:`, animError);
              return;
            }
          }

          // Play animation
          this.spriteObj.play(animKey);
        } catch (error) {
          console.error(`Error creating sprite scene for ${this.spriteId}:`, error);
        }
      }
    }

    try {
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
    } catch (error) {
      console.error(`Failed to initialize Phaser game for ${sprite.id}:`, error);
    }

    return () => {
      if (game) {
        try {
          game.destroy(true);
        } catch (error) {
          console.warn(`Error destroying Phaser game for ${sprite.id}:`, error);
        }
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
          border: `2px solid ${colors.border}`,
          background: colors.surface,
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
              marginBottom: spacing.md,
            }}
          >
            {sprite.displayName}
          </h3>

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
  const userCoins = coinsXPData?.coins ?? 500;
  const userXP = coinsXPData?.xp ?? 1250;

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
    
    // Also update avatar selection for consistency
    localStorage.setItem('avatar', JSON.stringify({ id: spriteId }));
    
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