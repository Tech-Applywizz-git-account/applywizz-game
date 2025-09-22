import React, { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { colors, fonts, spacing } from "../utils/theme";

// Game configuration
const CONFIG = {
  scene: {
    key: "TeamVsTeamScene",
  },
  arena: {
    width: 1000,
    height: 600,
  },
  teams: {
    green: {
      avatars: ["Fighter", "Samurai", "Pyromancer_1", "Girl_1"],
      color: "#22c55e",
    },
    red: {
      avatars: ["Shinobi", "Samurai2", "Pyromancer_2", "SamuraiArcher"],
      color: "#ef4444",
    },
  },
  avatar: {
    scale: 0.8,
    spacing: 120,
    frontScale: 1.2,
  },
  healthBar: {
    width: 300,
    height: 20,
    yOffset: 50,
  },
};

interface TeamData {
  name: "green" | "red";
  health: number;
  maxHealth: number;
  avatars: string[];
  bigAvatar: Phaser.GameObjects.Sprite | null;
  smallAvatars: Phaser.GameObjects.Sprite[];
  isLeft: boolean;
}

class TeamVsTeamScene extends Phaser.Scene {
  private teams: { green: TeamData; red: TeamData };
  private healthBars: {
    green: { bg: Phaser.GameObjects.Image; bar: Phaser.GameObjects.Image };
    red: { bg: Phaser.GameObjects.Image; bar: Phaser.GameObjects.Image };
  };
  private attackButtons: {
    greenBig: Phaser.GameObjects.Text;
    greenSmall: Phaser.GameObjects.Text;
    redBig: Phaser.GameObjects.Text;
    redSmall: Phaser.GameObjects.Text;
  };
  private isAttacking = false;

  constructor() {
    super({ key: CONFIG.scene.key });
    
    this.teams = {
      green: {
        name: "green",
        health: 100,
        maxHealth: 100,
        avatars: CONFIG.teams.green.avatars,
        bigAvatar: null,
        smallAvatars: [],
        isLeft: true,
      },
      red: {
        name: "red",
        health: 100,
        maxHealth: 100,
        avatars: CONFIG.teams.red.avatars,
        bigAvatar: null,
        smallAvatars: [],
        isLeft: false,
      },
    };

    this.healthBars = {
      green: { bg: null as any, bar: null as any },
      red: { bg: null as any, bar: null as any },
    };

    this.attackButtons = {
      greenBig: null as any,
      greenSmall: null as any,
      redBig: null as any,
      redSmall: null as any,
    };
  }

  preload() {
    // Load background
    this.load.image("arena_bg", "/assets/teamvsteam/backgrounds/bg-1.png");
    
    // Load health bar assets
    this.load.image("green_health_bg", "/assets/teamvsteam/ui/Green_Bar_Bg.png");
    this.load.image("green_health_bar", "/assets/teamvsteam/ui/Green_Bar.png");
    this.load.image("red_health_bg", "/assets/teamvsteam/ui/Red_Bar_Bg.png");
    this.load.image("red_health_bar", "/assets/teamvsteam/ui/Red_Bar.png");

    // Load all avatar sprite sheets for both teams
    const allAvatars = [...CONFIG.teams.green.avatars, ...CONFIG.teams.red.avatars];
    const uniqueAvatars = [...new Set(allAvatars)];
    
    uniqueAvatars.forEach((avatar) => {
      this.load.spritesheet(`${avatar}_idle`, `/assets/avatars/${avatar}/Idle.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${avatar}_walk`, `/assets/avatars/${avatar}/Walk.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${avatar}_run`, `/assets/avatars/${avatar}/Run.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${avatar}_attack1`, `/assets/avatars/${avatar}/Attack_1.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
    });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Add background
    const bg = this.add.image(width / 2, height / 2, "arena_bg");
    bg.setDisplaySize(width, height);

    // Create animations for all avatars
    this.createAnimations();

    // Setup teams
    this.setupTeams();

    // Create health bars
    this.createHealthBars();

    // Create attack buttons
    this.createAttackButtons();

    // Add click handlers
    this.setupInteractions();
  }

  private createAnimations() {
    const allAvatars = [...CONFIG.teams.green.avatars, ...CONFIG.teams.red.avatars];
    const uniqueAvatars = [...new Set(allAvatars)];

    uniqueAvatars.forEach((avatar) => {
      // Idle animations
      if (!this.anims.exists(`${avatar}_idle_anim`)) {
        this.anims.create({
          key: `${avatar}_idle_anim`,
          frames: this.anims.generateFrameNumbers(`${avatar}_idle`),
          frameRate: 8,
          repeat: -1,
        });
      }

      // Walk animations
      if (!this.anims.exists(`${avatar}_walk_anim`)) {
        this.anims.create({
          key: `${avatar}_walk_anim`,
          frames: this.anims.generateFrameNumbers(`${avatar}_walk`),
          frameRate: 10,
          repeat: -1,
        });
      }

      // Run animations
      if (!this.anims.exists(`${avatar}_run_anim`)) {
        this.anims.create({
          key: `${avatar}_run_anim`,
          frames: this.anims.generateFrameNumbers(`${avatar}_run`),
          frameRate: 15,
          repeat: -1,
        });
      }

      // Attack animations
      if (!this.anims.exists(`${avatar}_attack_anim`)) {
        this.anims.create({
          key: `${avatar}_attack_anim`,
          frames: this.anims.generateFrameNumbers(`${avatar}_attack1`),
          frameRate: 12,
          repeat: 0,
        });
      }
    });
  }

  private setupTeams() {
    const { width, height } = this.cameras.main;
    const groundY = height - 100;

    // Green team (left side)
    this.setupTeam(this.teams.green, width * 0.25, groundY);
    
    // Red team (right side)
    this.setupTeam(this.teams.red, width * 0.75, groundY);
  }

  private setupTeam(team: TeamData, centerX: number, groundY: number) {
    const bigAvatarId = team.avatars[0];
    const smallAvatarIds = team.avatars.slice(1);

    // Create big avatar (front)
    team.bigAvatar = this.add.sprite(centerX, groundY, `${bigAvatarId}_idle`);
    team.bigAvatar.setScale(CONFIG.avatar.frontScale);
    team.bigAvatar.setFlipX(!team.isLeft); // Face opposing team
    team.bigAvatar.play(`${bigAvatarId}_idle_anim`);

    // Create small avatars (behind)
    smallAvatarIds.forEach((avatarId, index) => {
      const offsetX = team.isLeft ? -80 - (index * 40) : 80 + (index * 40);
      const offsetY = -20 - (index * 10);
      
      const avatar = this.add.sprite(
        centerX + offsetX,
        groundY + offsetY,
        `${avatarId}_idle`
      );
      avatar.setScale(CONFIG.avatar.scale);
      avatar.setFlipX(!team.isLeft); // Face opposing team
      avatar.play(`${avatarId}_idle_anim`);
      
      team.smallAvatars.push(avatar);
    });
  }

  private createHealthBars() {
    const { width } = this.cameras.main;
    const yPos = 60;

    // Green team health bar (left)
    this.healthBars.green.bg = this.add.image(width * 0.25, yPos, "green_health_bg");
    this.healthBars.green.bar = this.add.image(width * 0.25, yPos, "green_health_bar");

    // Red team health bar (right)
    this.healthBars.red.bg = this.add.image(width * 0.75, yPos, "red_health_bg");
    this.healthBars.red.bar = this.add.image(width * 0.75, yPos, "red_health_bar");

    // Scale health bars appropriately
    [this.healthBars.green.bg, this.healthBars.green.bar].forEach(obj => {
      obj.setDisplaySize(CONFIG.healthBar.width, CONFIG.healthBar.height);
    });
    
    [this.healthBars.red.bg, this.healthBars.red.bar].forEach(obj => {
      obj.setDisplaySize(CONFIG.healthBar.width, CONFIG.healthBar.height);
    });
  }

  private createAttackButtons() {
    const { width, height } = this.cameras.main;

    // Green team buttons (left side)
    this.attackButtons.greenBig = this.add.text(
      50, height - 120,
      "Green Big Attack",
      {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: CONFIG.teams.green.color,
        padding: { x: 10, y: 5 },
      }
    ).setInteractive({ useHandCursor: true });

    this.attackButtons.greenSmall = this.add.text(
      50, height - 80,
      "Green Small Attack",
      {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: CONFIG.teams.green.color,
        padding: { x: 10, y: 5 },
      }
    ).setInteractive({ useHandCursor: true });

    // Red team buttons (right side)
    this.attackButtons.redBig = this.add.text(
      width - 200, height - 120,
      "Red Big Attack",
      {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: CONFIG.teams.red.color,
        padding: { x: 10, y: 5 },
      }
    ).setInteractive({ useHandCursor: true });

    this.attackButtons.redSmall = this.add.text(
      width - 200, height - 80,
      "Red Small Attack",
      {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: CONFIG.teams.red.color,
        padding: { x: 10, y: 5 },
      }
    ).setInteractive({ useHandCursor: true });
  }

  private setupInteractions() {
    // Green team attack handlers
    this.attackButtons.greenBig.on("pointerdown", () => {
      if (!this.isAttacking) {
        this.performAttack(this.teams.green, "big");
      }
    });

    this.attackButtons.greenSmall.on("pointerdown", () => {
      if (!this.isAttacking) {
        this.performAttack(this.teams.green, "small");
      }
    });

    // Red team attack handlers
    this.attackButtons.redBig.on("pointerdown", () => {
      if (!this.isAttacking) {
        this.performAttack(this.teams.red, "big");
      }
    });

    this.attackButtons.redSmall.on("pointerdown", () => {
      if (!this.isAttacking) {
        this.performAttack(this.teams.red, "small");
      }
    });
  }

  private performAttack(attackingTeam: TeamData, attackType: "big" | "small") {
    if (this.isAttacking) return;
    this.isAttacking = true;

    const defendingTeam = attackingTeam.name === "green" ? this.teams.red : this.teams.green;
    let attacker: Phaser.GameObjects.Sprite;

    if (attackType === "big") {
      attacker = attackingTeam.bigAvatar!;
    } else {
      // Choose random small avatar
      const randomIndex = Math.floor(Math.random() * attackingTeam.smallAvatars.length);
      attacker = attackingTeam.smallAvatars[randomIndex];
    }

    const target = defendingTeam.bigAvatar!;
    const originalX = attacker.x;
    const originalY = attacker.y;
    
    // Calculate attack position
    const attackX = target.x + (attackingTeam.isLeft ? -100 : 100);
    
    // Start attack sequence
    const avatarId = attackingTeam.avatars[attackType === "big" ? 0 : Math.floor(Math.random() * 3) + 1];
    
    // Run to target
    attacker.play(`${avatarId}_run_anim`);
    
    this.tweens.add({
      targets: attacker,
      x: attackX,
      duration: 800,
      ease: "Power2",
      onComplete: () => {
        // Attack animation
        attacker.play(`${avatarId}_attack_anim`);
        
        // Camera shake and damage
        this.cameras.main.shake(200, 0.01);
        
        // Deal damage
        this.dealDamage(defendingTeam);
        
        // Return to original position
        this.time.delayedCall(500, () => {
          attacker.play(`${avatarId}_run_anim`);
          attacker.setFlipX(attackingTeam.isLeft); // Face home direction
          
          this.tweens.add({
            targets: attacker,
            x: originalX,
            y: originalY,
            duration: 800,
            ease: "Power2",
            onComplete: () => {
              attacker.setFlipX(!attackingTeam.isLeft); // Face opposing team again
              attacker.play(`${avatarId}_idle_anim`);
              this.isAttacking = false;
            },
          });
        });
      },
    });
  }

  private dealDamage(team: TeamData) {
    const damage = 10 + Math.random() * 15; // 10-25 damage
    team.health = Math.max(0, team.health - damage);
    
    // Update health bar
    const healthBar = this.healthBars[team.name].bar;
    const healthPercent = team.health / team.maxHealth;
    
    this.tweens.add({
      targets: healthBar,
      scaleX: healthPercent,
      duration: 300,
      ease: "Power2",
    });

    // Check for victory
    if (team.health <= 0) {
      this.handleVictory(team.name === "green" ? "red" : "green");
    }
  }

  private handleVictory(winnerTeam: "green" | "red") {
    const { width, height } = this.cameras.main;
    
    const victoryText = this.add.text(
      width / 2,
      height / 2,
      `${winnerTeam.toUpperCase()} TEAM WINS!`,
      {
        fontSize: "48px",
        color: winnerTeam === "green" ? CONFIG.teams.green.color : CONFIG.teams.red.color,
        stroke: "#000000",
        strokeThickness: 4,
      }
    ).setOrigin(0.5);

    // Victory animation
    this.tweens.add({
      targets: victoryText,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.5, to: 1 },
      duration: 1000,
      ease: "Back.easeOut",
    });

    // Reset game after delay
    this.time.delayedCall(3000, () => {
      this.resetGame();
    });
  }

  private resetGame() {
    // Reset health
    this.teams.green.health = this.teams.green.maxHealth;
    this.teams.red.health = this.teams.red.maxHealth;
    
    // Reset health bars
    this.healthBars.green.bar.setScale(1);
    this.healthBars.red.bar.setScale(1);
    
    // Clear victory text
    this.children.getChildren().forEach(child => {
      if (child instanceof Phaser.GameObjects.Text && child.text.includes("WINS")) {
        child.destroy();
      }
    });
  }
}

const TeamVsTeam: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: CONFIG.arena.width,
      height: CONFIG.arena.height,
      parent: gameRef.current,
      backgroundColor: "#2c3e50",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [TeamVsTeamScene],
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.background }}>
      <Sidebar />
      
      <main style={{ flex: 1, marginLeft: "280px", padding: spacing.xl }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              color: colors.textPrimary,
              fontFamily: fonts.heading,
              marginBottom: spacing.lg,
            }}
          >
            Team Vs Team Arena
          </h1>
          
          <p
            style={{
              fontSize: "1.1rem",
              color: colors.textSecondary,
              fontFamily: fonts.body,
              marginBottom: spacing.xl,
              lineHeight: 1.6,
            }}
          >
            Choose your attacks and lead your team to victory! Green team on the left, Red team on the right.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.surface,
              borderRadius: "16px",
              padding: spacing.lg,
              border: `2px solid ${colors.surfaceLight}`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div ref={gameRef} style={{ borderRadius: "12px", overflow: "hidden" }} />
          </div>

          <div
            style={{
              marginTop: spacing.lg,
              padding: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: "12px",
              border: `1px solid ${colors.surfaceLight}`,
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: colors.textPrimary,
                marginBottom: spacing.sm,
              }}
            >
              How to Play:
            </h3>
            <ul
              style={{
                color: colors.textSecondary,
                lineHeight: 1.6,
                paddingLeft: spacing.md,
              }}
            >
              <li>Click "Big Attack" to send your front fighter to attack</li>
              <li>Click "Small Attack" to send a random back fighter to attack</li>
              <li>All attacks target the enemy team's main fighter</li>
              <li>First team to reduce enemy health to zero wins!</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TeamVsTeam;