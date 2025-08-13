import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Card } from "./ui/card";

interface ThanosGameProps {
  isThanosDead: boolean;
}

interface GameConfig {
  thanos: {
    scale: number;
    yPosition: number;
    xOffset: number;
    leftInsetPx: 120;
    hitEffect: {
      scaleIncrease: number;
      tintColor: number;
      duration: number;
    };
  };
  attacker: {
    scale: number;
    spawnXOffset: number;
    yPosition: number;
    attackOffset: number;
    animation: {
      duration: number;
      ease: string;
    };
    heavy: {
      holdFrameIndex: number;
      holdMs: number;
      dashDuration: number;
    };
  };
  defeatBanner: {
    fontSize: string;
    color: string;
    stroke: string;
    strokeThickness: number;
  };
}

const CONFIG: GameConfig = {
  thanos: {
    scale: 1.1,
    yPosition: 450,
    xOffset: 300,
    leftInsetPx: 120,
    hitEffect: {
      scaleIncrease: 0.08,
      tintColor: 0xff0000,
      duration: 49,
    },
  },
  attacker: {
    scale: 2,
    spawnXOffset: 150,
    yPosition: 570,
    attackOffset: 150,
    animation: {
      duration: 500,
      ease: "Power1",
    },
    heavy: {
      holdFrameIndex: 2, // 3rd frame
      holdMs: 700, // 0.7s hold before the dash
      dashDuration: 260, // dash speed
    },
  },
  defeatBanner: {
    fontSize: "64px",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 8,
  },
};

class ArenaScene extends Phaser.Scene {
  private layoutReady = false;
  private thanos!: Phaser.GameObjects.Image;
  private attacker!: Phaser.GameObjects.Sprite;
  private isThanosDead: boolean = false;
  private isBusy: boolean = false; // prevents overlapping actions
  private lightAttackTimer?: Phaser.Time.TimerEvent;
  private deathSequenceStarted: boolean = false;
  private defeatText!: Phaser.GameObjects.Text;
  private bg!: Phaser.GameObjects.Image;

  constructor() {
    super("ArenaScene");
  }

  /**
   * Initialize the scene with Thanos death state
   * @param data - Scene initialization data containing isThanosDead state
   */
  init(data: { isThanosDead: boolean }): void {
    this.isThanosDead = data.isThanosDead || false;
  }

  preload(): void {
    this.load.image("thanos", "/assets/thanos.png");

    // Fighter sprites
    this.load.spritesheet("fighter_idle", "/assets/avatars/Fighter/Idle.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("fighter_walk", "/assets/avatars/Fighter/Walk.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("fighter_run", "/assets/avatars/Fighter/Run.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    // Attack sprites
    this.load.spritesheet(
      "fighter_attack1",
      "/assets/avatars/Fighter/Attack_1.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
    this.load.spritesheet(
      "fighter_attack2",
      "/assets/avatars/Fighter/Attack_2.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
    this.load.spritesheet(
      "fighter_attack3",
      "/assets/avatars/Fighter/Attack_3.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.image("bg", "/assets/background.png");
  }

  private fitThanosToCamera(): void {
    if (!this.thanos) return;
    const cam = this.cameras.main;

    const padX = 0; // horizontal margin
    const padY = 55; // vertical lift — increase to move Thanos up

    // natural image size
    const tex = this.textures
      .get("thanos")
      .getSourceImage() as HTMLImageElement;
    const natW = tex.width;
    const natH = tex.height;

    // max space he can occupy
    const maxW = cam.width - padX * 2;
    const maxH = cam.height - padY * 2;

    // base scale from CONFIG, but clamp so he stays fully visible
    const clampScale = Math.min(CONFIG.thanos.scale, maxW / natW, maxH / natH);
    this.thanos.setScale(clampScale);

    // stick to bottom-right, with independent padding
    this.thanos.setOrigin(1, 1);
    this.thanos.setPosition(cam.width - padX, cam.height - padY);
  }
  private getGroundY(): number {
    // tune this single number to match the background's stone top line
    return this.cameras.main.height - 200;
  }

  private targetXInFrontOfThanos(gap = 30): number {
    // sensible default
    if (!this.layoutReady) {
      return Math.round(this.cameras.main.width * 0.66); // safe fallback
    }
    const tex = this.textures
      .get("thanos")
      .getSourceImage() as HTMLImageElement;
    const scaleX = this.thanos.displayWidth / tex.width; // accounts for fitThanosToCamera()
    const inset = (CONFIG.thanos as any).leftInsetPx * scaleX; // scale the visual inset
    const thanosLeftVisual = this.thanos.getBounds().left + inset;
    const halfAttacker = this.attacker.displayWidth * this.attacker.originX; // 0.5 by default
    // base stop: attacker's RIGHT edge is `gap` before visual left edge
    const base = thanosLeftVisual - gap - halfAttacker; // bump the fighter a bit further TOWARD Thanos (positive values move right)
    const bumpTowardThanosPx = 12; // tweak: try 8–18 until it looks perfect
    return Math.round(base + bumpTowardThanosPx);
  }
  create(): void {
    const { width, height } = this.cameras.main;
    this.bg = this.add.image(0, 0, "bg").setOrigin(0, 0).setDepth(0);
    this.bg.setDisplaySize(width, height); // fill canvas
    this.bg.setScrollFactor(0);

    this.createAnimations();

    // Thanos - positioned based on original game
    this.thanos = this.add.image(0, 0, "thanos").setDepth(5);
    this.fitThanosToCamera();
    this.time.delayedCall(0, () => {
      this.layoutReady = true;
    });
    // Fighter - positioned based on original game
    this.attacker = this.add
      .sprite(CONFIG.attacker.spawnXOffset, this.getGroundY())
      .setScale(CONFIG.attacker.scale)
      .setDepth(6); // always above thanos
    this.attacker.play("fighter_walk_anim");

    // Defeat banner (hidden initially)
    this.defeatText = this.add
      .text(width / 2, height / 2, "THANOS HAS BEEN DEFEATED", {
        fontFamily: "sans-serif",
        fontSize: CONFIG.defeatBanner.fontSize,
        color: CONFIG.defeatBanner.color,
        stroke: CONFIG.defeatBanner.stroke,
        strokeThickness: CONFIG.defeatBanner.strokeThickness,
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setAlpha(0);

    // Start appropriate battle sequence based on death state
    this.startBattleSequence();

    this.scale.on("resize", this.resize, this);
  }

  /**
   * Start the appropriate battle sequence based on Thanos death state
   * - If alive: Start light attack loop every 4 seconds
   * - If dead: Perform single heavy attack
   */
  private startBattleSequence(): void {
    if (this.isThanosDead && !this.deathSequenceStarted) {
      // Perform single heavy attack (death sequence)
      this.deathSequenceStarted = true;
      this.time.delayedCall(1000, () => this.performHeavyAttack());
    } else if (!this.isThanosDead) {
      // Start light attack loop every 4 seconds
      this.lightAttackTimer = this.time.addEvent({
        delay: 4000, // Changed from 2000 to 4000ms as per requirements
        loop: true,
        callback: () => this.performLightAttack(),
      });
    }
  }

  /**
   * Update the death state and handle transitions
   * @param isThanosDead - New death state
   */
  updateDeathState(isThanosDead: boolean): void {
    if (this.isThanosDead !== isThanosDead) {
      this.isThanosDead = isThanosDead;

      if (isThanosDead && !this.deathSequenceStarted) {
        // Stop light attacks and start death sequence
        if (this.lightAttackTimer) {
          this.lightAttackTimer.destroy();
        }
        this.deathSequenceStarted = true;
        this.performHeavyAttack();
      }
    }
  }

  createAnimations(): void {
    const loopAnim = (key: string, spriteKey: string, rate = 10) => {
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(spriteKey),
        frameRate: rate,
        repeat: -1,
      });
    };
    const oneShotAnim = (key: string, spriteKey: string, rate = 12) => {
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(spriteKey),
        frameRate: rate,
        repeat: 0,
      });
    };

    loopAnim("fighter_idle_anim", "fighter_idle", 8);
    loopAnim("fighter_walk_anim", "fighter_walk", 10);
    loopAnim("fighter_run_anim", "fighter_run", 20);

    oneShotAnim("fighter_attack1_anim", "fighter_attack1", 14);
    oneShotAnim("fighter_attack2_anim", "fighter_attack2", 14);
    oneShotAnim("fighter_attack3_anim", "fighter_attack3", 14);
  }

  /**
   * Perform a light attack - attacker runs in, hits Thanos, and returns
   */
  private performLightAttack(): void {
    if (this.isThanosDead || this.isBusy) return;
    this.isBusy = true;

    const originalX = this.attacker.x;
    const groundY = CONFIG.attacker.yPosition;
    const targetX = this.targetXInFrontOfThanos(); // try 30; change to taste
    this.tweens.killTweensOf(this.attacker);
    this.attacker.play("fighter_run_anim", true);
    this.tweens.add({
      targets: this.attacker,
      x: targetX,
      duration: CONFIG.attacker.animation.duration,
      ease: CONFIG.attacker.animation.ease,
      onComplete: () => {
        this.attacker.play("fighter_attack2_anim", true);

        // light hit feedback only
        this.time.delayedCall(150, () => {
          this.cameras.main.shake(120, 0.004);
          this.hitThanosEffect();
        });

        this.attacker.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.returnToStart(originalX, groundY);
        });
      },
    });
  }

  /**
   * Perform a heavy attack - attacker dashes in, kills Thanos, and remains
   */
  private performHeavyAttack(): void {
    if (this.isThanosDead || this.isBusy) return;
    this.isBusy = true;

    const originalX = this.attacker.x;
    const groundY = CONFIG.attacker.yPosition;

    // Start Attack1 and PAUSE on 3rd frame
    this.attacker.play("fighter_attack1_anim", true);

    this.tweens.killTweensOf(this.attacker); // ensure no leftover tween
    const targetX = this.targetXInFrontOfThanos();
    const anim = this.attacker.anims.currentAnim;
    const frames = anim ? anim.frames : [];
    const holdIx = Math.min(
      CONFIG.attacker.heavy.holdFrameIndex,
      Math.max(0, frames.length - 1)
    );
    if (frames.length) {
      this.attacker.anims.pause(frames[holdIx]);
    } else {
      this.attacker.anims.pause();
    }

    // Hold for 0.7s, THEN dash while still frozen
    this.time.delayedCall(CONFIG.attacker.heavy.holdMs, () => {
      this.tweens.add({
        targets: this.attacker,
        x: targetX,
        duration: CONFIG.attacker.heavy.dashDuration,
        ease: "Quad.easeOut",
        onComplete: () => {
          // Resume the remainder of Attack1
          this.attacker.anims.resume();

          // Impact & kill shortly after resuming
          this.time.delayedCall(120, () => {
            this.cameras.main.shake(220, 0.006);

            // 🔴 Show red flash before starting death sequence
            this.thanos.setTint(0xff0000);

            // Keep tint for 150ms, then clear & kill
            this.time.delayedCall(150, () => {
              this.thanos.clearTint();
              this.killThanosLikeMario(); // start death animation
            });
          });

          // After animation completes, return to start (even after death)
          this.attacker.once(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            () => {
              this.returnToStart(originalX, groundY);
            }
          );
        },
      });
    });
  }

  private returnToStart(originalX: number, groundY: number): void {
    this.tweens.add({
      targets: this.attacker,
      x: originalX,
      y: this.getGroundY(),
      duration: CONFIG.attacker.animation.duration,
      ease: CONFIG.attacker.animation.ease,
      onStart: () => this.attacker.play("fighter_run_anim", true),
      onComplete: () => {
        this.attacker.play("fighter_walk_anim", true);
        this.isBusy = false;
      },
    });
  }

  private hitThanosEffect(): void {
    this.thanos.setTint(CONFIG.thanos.hitEffect.tintColor);

    this.tweens.add({
      targets: this.thanos,
      scale: this.thanos.scale + CONFIG.thanos.hitEffect.scaleIncrease,
      duration: CONFIG.thanos.hitEffect.duration,
      yoyo: true,
      ease: "Quad.easeInOut",
      onComplete: () => {
        if (!this.isThanosDead) this.thanos.clearTint();
      },
    });
  }

  private killThanosLikeMario(): void {
    if (this.isThanosDead) return;
    this.isThanosDead = true;
    this.thanos.clearTint();

    const upDistance = 180;
    const dropY = this.cameras.main.height + 200;

    // Pop up, then fall
    this.tweens.add({
      targets: this.thanos,
      y: this.thanos.y - upDistance,
      duration: 350,
      ease: "Quad.easeOut",
      onComplete: () => {
        // 🔁 Blink while falling
        let blinkCount = 0;
        const blinkTimer = this.time.addEvent({
          delay: 100,
          loop: true,
          callback: () => {
            this.thanos.visible = !this.thanos.visible;
            blinkCount++;
            if (blinkCount > 10) {
              // stop after ~1s
              this.thanos.visible = true;
              blinkTimer.remove();
            }
          },
        });

        // Fall down
        this.tweens.add({
          targets: this.thanos,
          y: dropY,
          alpha: 0,
          duration: 900,
          ease: "Quad.easeIn",
          onComplete: () => {
            this.thanos.destroy();
            this.showDefeatBanner();
          },
        });
      },
    });
  }

  private showDefeatBanner(): void {
    this.defeatText.setAlpha(0).setVisible(true);
    this.tweens.add({
      targets: this.defeatText,
      alpha: 1,
      duration: 600,
      ease: "Quad.easeOut",
    });
  }

  private resize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;
    this.cameras.resize(width, height);

    if (this.bg) {
      this.bg.setDisplaySize(width, height);
    }

    // fit keeps Thanos fully visible at bottom-right
    this.fitThanosToCamera();

    if (this.attacker) {
      this.attacker.setPosition(
        Math.min(this.attacker.x, width - 20),
        this.getGroundY()
      );
    }

    if (this.defeatText) {
      this.defeatText.setPosition(width / 2, height / 2);
    }
  }
}

const PhaserThanosGame: React.FC<ThanosGameProps> = ({ isThanosDead }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<ArenaScene | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;
    if (phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: "100%",
        height: "100%",
      },
      backgroundColor: "transparent",
      parent: gameRef.current,
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
      scene: [ArenaScene],
    };

    phaserGameRef.current = new Phaser.Game(config);

    // Store reference to the scene for later updates
    phaserGameRef.current.scene.start("ArenaScene", { isThanosDead });
    sceneRef.current = phaserGameRef.current.scene.getScene(
      "ArenaScene"
    ) as ArenaScene;

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, []);

  // Update scene when death state changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateDeathState(isThanosDead);
    }
  }, [isThanosDead]);

  return (
    <Card
      style={{
        padding: "0",
        overflow: "visible",
        border: "2px solid rgba(99, 102, 241, 0.2)",
        boxShadow: "0 10px 30px rgba(99, 102, 241, 0.1)",
        background:
          "linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%)",
      }}
    >
      <div
        ref={gameRef}
        id="phaser-thanos-container"
        style={{
          width: "100%",
          height: "90vh",
          borderRadius: "14px",
          overflow: "hidden",
          background: "transparent",
          position: "relative",
        }}
      />
    </Card>
  );
};

export default PhaserThanosGame;
