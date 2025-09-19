import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Card } from "./ui/card";

interface TeamVsTeamGameProps {
  // We can add props later if needed
}

interface GameConfig {
  // Game configuration constants
}

const CONFIG: GameConfig = {
  game: {
    width: 1280,
    height: 720,
  },
  teams: {
    green: {
      color: 0x00ff00,
      positions: {
        leader: { x: 200, y: 500 },
        followers: [
          { x: 150, y: 550 },
          { x: 120, y: 520 },
          { x: 180, y: 520 }
        ]
      }
    },
    red: {
      color: 0xff0000,
      positions: {
        leader: { x: 1080, y: 500 },
        followers: [
          { x: 1130, y: 550 },
          { x: 1160, y: 520 },
          { x: 1100, y: 520 }
        ]
      }
    }
  },
  avatars: {
    scale: 2,
    leaderScale: 2.5,
  },
  ui: {
    healthBarWidth: 300,
    healthBarHeight: 20,
    buttonWidth: 150,
    buttonHeight: 40,
  }
};

class TeamVsTeamScene extends Phaser.Scene {
  private greenTeam: { leader?: Phaser.GameObjects.Sprite; followers: Phaser.GameObjects.Sprite[] } = { followers: [] };
  private redTeam: { leader?: Phaser.GameObjects.Sprite; followers: Phaser.GameObjects.Sprite[] } = { followers: [] };
  private greenHP = 100;
  private redHP = 100;
  private greenHealthBar?: Phaser.GameObjects.Graphics;
  private redHealthBar?: Phaser.GameObjects.Graphics;
  private greenHealthBarBg?: Phaser.GameObjects.Graphics;
  private redHealthBarBg?: Phaser.GameObjects.Graphics;
  private attackButtons: { [key: string]: Phaser.GameObjects.Graphics } = {};
  private buttonTexts: { [key: string]: Phaser.GameObjects.Text } = {};

  constructor() {
    super({ key: "TeamVsTeamScene" });
  }

  preload(): void {
    // Load background
    this.load.image("teamvsteam_bg", "/assets/teamvsteam/backgrounds/bg-1.png");
    
    // Load health bar assets
    this.load.image("green_bar", "/assets/teamvsteam/ui/Green_Bar.png");
    this.load.image("green_bar_bg", "/assets/teamvsteam/ui/Green_Bar_Bg.png");
    this.load.image("red_bar", "/assets/teamvsteam/ui/Red_Bar.png");
    this.load.image("red_bar_bg", "/assets/teamvsteam/ui/Red_Bar_Bg.png");

    // Load avatar sprites - we'll use Fighter and Samurai for variety
    const avatarTypes = ["Fighter", "Samurai", "Shinobi", "SamuraiArcher"];
    
    avatarTypes.forEach(avatarType => {
      this.load.spritesheet(`${avatarType}_idle`, `/assets/avatars/${avatarType}/Idle.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${avatarType}_attack1`, `/assets/avatars/${avatarType}/Attack_1.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${avatarType}_hurt`, `/assets/avatars/${avatarType}/Hurt.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
    });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Add background
    const bg = this.add.image(0, 0, "teamvsteam_bg").setOrigin(0, 0).setDepth(0);
    bg.setDisplaySize(width, height);

    this.createAnimations();
    this.createTeams();
    this.createHealthBars();
    this.createAttackButtons();
  }

  private createAnimations(): void {
    const avatarTypes = ["Fighter", "Samurai", "Shinobi", "SamuraiArcher"];
    
    avatarTypes.forEach(avatarType => {
      // Idle animation
      if (!this.anims.exists(`${avatarType}_idle_anim`)) {
        this.anims.create({
          key: `${avatarType}_idle_anim`,
          frames: this.anims.generateFrameNumbers(`${avatarType}_idle`),
          frameRate: 8,
          repeat: -1,
        });
      }

      // Attack animation
      if (!this.anims.exists(`${avatarType}_attack1_anim`)) {
        this.anims.create({
          key: `${avatarType}_attack1_anim`,
          frames: this.anims.generateFrameNumbers(`${avatarType}_attack1`),
          frameRate: 12,
          repeat: 0,
        });
      }

      // Hurt animation
      if (!this.anims.exists(`${avatarType}_hurt_anim`)) {
        this.anims.create({
          key: `${avatarType}_hurt_anim`,
          frames: this.anims.generateFrameNumbers(`${avatarType}_hurt`),
          frameRate: 10,
          repeat: 0,
        });
      }
    });
  }

  private createTeams(): void {
    // Green team (left side)
    const greenLeaderType = "Fighter";
    const greenFollowerTypes = ["Samurai", "Shinobi", "SamuraiArcher"];

    // Create green team leader
    this.greenTeam.leader = this.add.sprite(
      CONFIG.teams.green.positions.leader.x,
      CONFIG.teams.green.positions.leader.y,
      `${greenLeaderType}_idle`
    )
      .setScale(CONFIG.avatars.leaderScale)
      .setDepth(10);
    this.greenTeam.leader.play(`${greenLeaderType}_idle_anim`);

    // Create green team followers
    CONFIG.teams.green.positions.followers.forEach((pos, index) => {
      const followerType = greenFollowerTypes[index];
      const follower = this.add.sprite(pos.x, pos.y, `${followerType}_idle`)
        .setScale(CONFIG.avatars.scale)
        .setDepth(9);
      follower.play(`${followerType}_idle_anim`);
      this.greenTeam.followers.push(follower);
    });

    // Red team (right side)
    const redLeaderType = "Samurai";
    const redFollowerTypes = ["Fighter", "Shinobi", "SamuraiArcher"];

    // Create red team leader
    this.redTeam.leader = this.add.sprite(
      CONFIG.teams.red.positions.leader.x,
      CONFIG.teams.red.positions.leader.y,
      `${redLeaderType}_idle`
    )
      .setScale(CONFIG.avatars.leaderScale)
      .setDepth(10)
      .setFlipX(true); // Face left

    this.redTeam.leader.play(`${redLeaderType}_idle_anim`);

    // Create red team followers
    CONFIG.teams.red.positions.followers.forEach((pos, index) => {
      const followerType = redFollowerTypes[index];
      const follower = this.add.sprite(pos.x, pos.y, `${followerType}_idle`)
        .setScale(CONFIG.avatars.scale)
        .setDepth(9)
        .setFlipX(true); // Face left
      follower.play(`${followerType}_idle_anim`);
      this.redTeam.followers.push(follower);
    });
  }

  private createHealthBars(): void {
    const { width } = this.cameras.main;
    
    // Green team health bar (left)
    const greenBarX = 50;
    const greenBarY = 30;
    
    this.greenHealthBarBg = this.add.graphics();
    this.greenHealthBarBg.fillStyle(0x333333);
    this.greenHealthBarBg.fillRect(greenBarX, greenBarY, CONFIG.ui.healthBarWidth, CONFIG.ui.healthBarHeight);
    
    this.greenHealthBar = this.add.graphics();
    this.updateHealthBar(this.greenHealthBar, greenBarX, greenBarY, this.greenHP, 0x00ff00);

    // Green team label
    this.add.text(greenBarX, greenBarY - 25, "Green Team", {
      fontSize: "18px",
      fill: "#00ff00",
      fontFamily: "Arial"
    });

    // Red team health bar (right)
    const redBarX = width - CONFIG.ui.healthBarWidth - 50;
    const redBarY = 30;

    this.redHealthBarBg = this.add.graphics();
    this.redHealthBarBg.fillStyle(0x333333);
    this.redHealthBarBg.fillRect(redBarX, redBarY, CONFIG.ui.healthBarWidth, CONFIG.ui.healthBarHeight);
    
    this.redHealthBar = this.add.graphics();
    this.updateHealthBar(this.redHealthBar, redBarX, redBarY, this.redHP, 0xff0000);

    // Red team label
    this.add.text(redBarX, redBarY - 25, "Red Team", {
      fontSize: "18px",
      fill: "#ff0000",
      fontFamily: "Arial"
    });
  }

  private updateHealthBar(healthBar: Phaser.GameObjects.Graphics, x: number, y: number, hp: number, color: number): void {
    healthBar.clear();
    const width = (hp / 100) * CONFIG.ui.healthBarWidth;
    healthBar.fillStyle(color);
    healthBar.fillRect(x, y, width, CONFIG.ui.healthBarHeight);
  }

  private createAttackButtons(): void {
    const { width, height } = this.cameras.main;
    
    // Green team buttons (bottom left)
    this.createButton("greenLeaderAttack", 50, height - 100, "Leader Attack", 0x006600, () => {
      this.performAttack("green", "leader");
    });

    this.createButton("greenFollowerAttack", 220, height - 100, "Follower Attack", 0x004400, () => {
      this.performAttack("green", "follower");
    });

    // Red team buttons (bottom right)
    this.createButton("redLeaderAttack", width - 200, height - 100, "Leader Attack", 0x660000, () => {
      this.performAttack("red", "leader");
    });

    this.createButton("redFollowerAttack", width - 370, height - 100, "Follower Attack", 0x440000, () => {
      this.performAttack("red", "follower");
    });
  }

  private createButton(id: string, x: number, y: number, text: string, color: number, callback: () => void): void {
    // Button background
    const button = this.add.graphics();
    button.fillStyle(color);
    button.fillRoundedRect(x, y, CONFIG.ui.buttonWidth, CONFIG.ui.buttonHeight, 8);
    button.setInteractive(new Phaser.Geom.Rectangle(x, y, CONFIG.ui.buttonWidth, CONFIG.ui.buttonHeight), Phaser.Geom.Rectangle.Contains);
    button.on("pointerdown", callback);
    button.on("pointerover", () => {
      button.clear();
      button.fillStyle(color + 0x222222); // Lighter color on hover
      button.fillRoundedRect(x, y, CONFIG.ui.buttonWidth, CONFIG.ui.buttonHeight, 8);
    });
    button.on("pointerout", () => {
      button.clear();
      button.fillStyle(color);
      button.fillRoundedRect(x, y, CONFIG.ui.buttonWidth, CONFIG.ui.buttonHeight, 8);
    });

    // Button text
    const buttonText = this.add.text(x + CONFIG.ui.buttonWidth / 2, y + CONFIG.ui.buttonHeight / 2, text, {
      fontSize: "14px",
      fill: "#ffffff",
      fontFamily: "Arial"
    }).setOrigin(0.5);

    this.attackButtons[id] = button;
    this.buttonTexts[id] = buttonText;
  }

  private performAttack(team: "green" | "red", attackerType: "leader" | "follower"): void {
    const isGreenTeam = team === "green";
    const attackingTeam = isGreenTeam ? this.greenTeam : this.redTeam;
    const targetTeam = isGreenTeam ? this.redTeam : this.greenTeam;

    // Get attacker
    let attacker: Phaser.GameObjects.Sprite;
    if (attackerType === "leader") {
      attacker = attackingTeam.leader!;
    } else {
      // Random follower
      const randomIndex = Math.floor(Math.random() * attackingTeam.followers.length);
      attacker = attackingTeam.followers[randomIndex];
    }

    // Play attack animation
    const attackerType_name = this.getAvatarType(attacker);
    attacker.play(`${attackerType_name}_attack1_anim`);

    // Deal damage to target team leader
    const target = targetTeam.leader!;
    const targetType_name = this.getAvatarType(target);
    
    // Play hurt animation on target
    this.time.delayedCall(300, () => {
      target.play(`${targetType_name}_hurt_anim`);
    });

    // Update HP
    const damage = attackerType === "leader" ? 20 : 15;
    if (isGreenTeam) {
      this.redHP = Math.max(0, this.redHP - damage);
      this.updateHealthBar(this.redHealthBar!, this.cameras.main.width - CONFIG.ui.healthBarWidth - 50, 30, this.redHP, 0xff0000);
    } else {
      this.greenHP = Math.max(0, this.greenHP - damage);
      this.updateHealthBar(this.greenHealthBar!, 50, 30, this.greenHP, 0x00ff00);
    }

    // Check for game over
    if (this.greenHP <= 0) {
      this.showGameOver("Red Team Wins!");
    } else if (this.redHP <= 0) {
      this.showGameOver("Green Team Wins!");
    }
  }

  private getAvatarType(sprite: Phaser.GameObjects.Sprite): string {
    const texture = sprite.texture.key;
    return texture.split('_')[0]; // Extract avatar type from texture key
  }

  private showGameOver(message: string): void {
    const { width, height } = this.cameras.main;
    
    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(100);

    // Game over text
    this.add.text(width / 2, height / 2, message, {
      fontSize: "48px",
      fill: "#ffffff",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(101);

    // Restart button
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x4CAF50);
    restartButton.fillRoundedRect(width / 2 - 75, height / 2 + 50, 150, 40, 8);
    restartButton.setDepth(101);
    restartButton.setInteractive(new Phaser.Geom.Rectangle(width / 2 - 75, height / 2 + 50, 150, 40), Phaser.Geom.Rectangle.Contains);
    restartButton.on("pointerdown", () => {
      this.scene.restart();
    });

    this.add.text(width / 2, height / 2 + 70, "Restart", {
      fontSize: "16px",
      fill: "#ffffff",
      fontFamily: "Arial"
    }).setOrigin(0.5).setDepth(101);
  }
}

const TeamVsTeamGame: React.FC<TeamVsTeamGameProps> = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: CONFIG.game.width,
      height: CONFIG.game.height,
      parent: containerRef.current,
      backgroundColor: "#2c3e50",
      scene: TeamVsTeamScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <Card style={{ 
      padding: 0, 
      overflow: "hidden", 
      backgroundColor: "#1a252f",
      border: "2px solid #34495e",
      borderRadius: "12px"
    }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "600px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    </Card>
  );
};

export default TeamVsTeamGame;