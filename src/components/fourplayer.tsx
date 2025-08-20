import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Card } from "./../components/ui/card.tsx";

/* ---------------------- Types ---------------------- */
type SlotId = "TL" | "TR" | "BR" | "BL";

export type CharacterId =
  | "fighter"
  | "shinobi"
  | "samurai"
  | "samurai2"
  | "samurai3"
  | "samuraiArcher";

export interface PlayerSpec {
  uname: string;
  characterId: CharacterId;
}

interface FourPlayerArenaProps {
  players: [PlayerSpec, PlayerSpec, PlayerSpec, PlayerSpec];
  bossHp: number;
}

const DESIGN_W = 1280;
const DESIGN_H = 720;

/* ---------------------- Assets map ---------------------- */
const CHAR_FOLDER: Record<CharacterId, string> = {
  fighter: "Fighter",
  shinobi: "Shinobi",
  samurai: "Samurai",
  samurai2: "Samurai2",
  samurai3: "Samurai3",
  samuraiArcher: "SamuraiArcher",
};

/* ---------------------- Config ---------------------- */
const CONFIG = {
  thanos: {
    scale: .95,
    yPosition: 370, // in design coords
    hitEffect: { scaleIncrease: 0.08, tintColor: 0xff0000, duration: 60 },
  },
  attacker: {
    scale: 2,
    attackOffset: 150,
    lightDashDuration: 500,
    animation: { duration: 900, ease: "Power1" as const },
    heavy: { holdFrameIndex: 2, holdMs: 700, dashDuration: 260 },
  },
  defeatBanner: {
    fontSize: "64px",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 8,
  },
  platforms: { width: 220, height: 60 },
  groundOffsetFromBottom: 270, // in design coords
};

type AttackerRecord = {
  id: SlotId;
  prefix: CharacterId;
  sprite: Phaser.GameObjects.Sprite;
  nameTag: Phaser.GameObjects.Text;
  busy: boolean;
  platformImg?: Phaser.GameObjects.Image | null;
  platformHome: { x: number; y: number };
  groundHome: { x: number; y: number };
  onPlatform: boolean;
};

const ORDER_CLOCKWISE: SlotId[] = ["TL", "TR", "BR", "BL"];

/* ---------------------- Scene ---------------------- */
class ArenaScene extends Phaser.Scene {
  private players!: [PlayerSpec, PlayerSpec, PlayerSpec, PlayerSpec];
  private currentHp = 0;
  private lastHp = 0;

  // bg
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgNear!: Phaser.GameObjects.TileSprite;

  // boss + UI
  private thanos!: Phaser.GameObjects.Image;
  private defeatText!: Phaser.GameObjects.Text;

  // attackers
  private A: Record<SlotId, AttackerRecord> = {} as any;

  // loop control
  private loopIndex = 0;
  private loopRunning = false;
  private pendingHeavy = false; // set when HP drops

  constructor() {
    super("ArenaScene");
  }

  init(data: { players: FourPlayerArenaProps["players"]; bossHp: number }) {
    this.players = data.players;
    this.currentHp = data.bossHp ?? 0;
    this.lastHp = this.currentHp;
  }

  // expose to React
  public updateBossHp(newHp: number) {
    if (newHp < this.currentHp) {
      this.pendingHeavy = true;
    }
    this.lastHp = this.currentHp;
    this.currentHp = newHp;
  }

  preload() {
    // backgrounds
    this.load.image("background", "assets/dark_background.png");
    this.load.image("background_far", "assets/dark_background_far.png");

    this.load.image("thanos", "assets/thanos.png");
    this.load.image("platform", "assets/platform.png");

    this.load.audio("sfx_slash", "assets/Sounds/slash.mp3");
    this.load.audio("sfx_impact", "assets/Sounds/impact.mp3");

    // only the needed characters
    [...new Set(this.players.map((p) => p.characterId))].forEach((id) => {
      const base = `assets/avatars/${CHAR_FOLDER[id]}`;
      this.load.spritesheet(`${id}_idle`, `${base}/Idle.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${id}_walk`, `${base}/Walk.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${id}_run`, `${base}/Run.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${id}_attack1`, `${base}/Attack_1.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${id}_attack2`, `${base}/Attack_2.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(`${id}_attack3`, `${base}/Attack_3.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
    });
  }

  create() {
    // Author everything in DESIGN_W/DESIGN_H space
    const width = DESIGN_W;
    const height = DESIGN_H;

    // parallax bgs (smaller so shake won't feel like zoom)
    this.bgFar = this.add
      .tileSprite(width / 2, height / 2, width, height, "background_far")
      .setScrollFactor(0);
    this.bgNear = this.add
      .tileSprite(width / 2, height / 2 - 80 , width * 1.5, height * 1.5, "background")
      .setScrollFactor(0);

    // 🔒 Lock camera: eliminate any zoom drift/wobble during shakes
    const cam = this.cameras.main;
    cam.setBounds(0, 0, DESIGN_W, DESIGN_H);
    cam.setScroll(0, 0);
    cam.setZoom(1);
    cam.setRoundPixels(true);

    this.createAllAnims();

    // boss
    this.thanos = this.add
      .image(width / 2 - 50, CONFIG.thanos.yPosition, "thanos")
      .setScale(CONFIG.thanos.scale)
      .setDepth(2);

    // attackers + platforms
    this.buildAttackers();

    // UI
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

    // start clockwise loop
    this.loopRunning = true;
    this.runClockwiseLoop();
  }

  update() {
    if (this.bgFar) this.bgFar.tilePositionX += 0.1;
    if (this.bgNear) this.bgNear.tilePositionX += 0.3;

    (Object.values(this.A) as AttackerRecord[]).forEach((a) => {
      if (!a?.sprite || !a?.nameTag) return;
      a.nameTag.setPosition(a.sprite.x, a.sprite.y - 82);
    });
  }

  /* ---------------------- Helpers (use design coords) ---------------------- */

  private groundY() {
    return DESIGN_H - CONFIG.groundOffsetFromBottom;
  }
  private isTop(id: SlotId) {
    return id === "TL" || id === "TR";
  }
  private isRight(id: SlotId) {
    return id === "TR" || id === "BR";
  }

  private jumpUpToPlatform(A: AttackerRecord, after?: () => void) {
    if (!A.platformImg) return after?.(); // BL/BR safety

    const sprite = A.sprite;
    const startY = sprite.y;
    const landX = A.platformHome.x;
    const landY = A.platformHome.y;

    // move X to platform center
    this.tweens.add({
      targets: sprite,
      x: landX,
      duration: 600,
      ease: "Quad.easeInOut",
    });

    // parabolic Y
    this.tweens.add({
      targets: sprite,
      y: landY,
      duration: 600,
      ease: "Quad.easeOut",
      onUpdate: (tw, target: any) => {
        const t = (tw as any).progress;
        const H = 160;
        const arc = (1 - (2 * t - 1) ** 2) * H;
        const base = Phaser.Math.Linear(startY, landY, t);
        target.y = base - arc;
      },
      onComplete: () => {
        A.onPlatform = true;

        // face OUTWARD when they’re back on the platform
        const outward = A.id === "TR"; // TL=false (face left), TR=true (face right)
        sprite.setFlipX(outward);

        // idle walk (rev on right side)
        const onRight = this.isRight(A.id);
        sprite.play(
          onRight ? `${A.prefix}_walk_anim_rev` : `${A.prefix}_walk_anim`,
          true
        );

        after?.();
      },
    });
  }
  private createAnimsFor(prefix: CharacterId) {
    const ensure = (
      key: string,
      sheetKey: string,
      frameRate = 12,
      repeat = -1,
      framesOverride: any = null
    ) => {
      if (this.anims.exists(key)) return;
      let frames = framesOverride;
      if (!frames) {
        const tex = this.textures.get(sheetKey);
        const max = Math.max(0, (tex ? tex.frameTotal : 0) - 1);
        frames = this.anims.generateFrameNumbers(sheetKey, {
          start: 0,
          end: max,
        });
      }
      this.anims.create({ key, frames, frameRate, repeat });
    };

    ensure(`${prefix}_idle_anim`, `${prefix}_idle`, 8, -1);
    ensure(`${prefix}_walk_anim`, `${prefix}_walk`, 12, -1);
    ensure(`${prefix}_run_anim`, `${prefix}_run`, 16, -1);
    ensure(`${prefix}_attack1_anim`, `${prefix}_attack1`, 14, 0);
    ensure(`${prefix}_attack2_anim`, `${prefix}_attack2`, 14, 0);
    ensure(`${prefix}_attack3_anim`, `${prefix}_attack3`, 14, 0);

    const rev = this.anims
      .generateFrameNumbers(`${prefix}_walk`)
      .slice()
      .reverse();
    ensure(`${prefix}_walk_anim_rev`, `${prefix}_walk`, 12, -1, rev);
  }

  private createAllAnims() {
    [...new Set(this.players.map((p) => p.characterId))].forEach((id) =>
      this.createAnimsFor(id)
    );
  }

  private buildAttackers() {
    const width = DESIGN_W;

    // Positions authored in design space (stable everywhere)
    const padX = 160;
    const leftX = padX;
    const rightX = width - padX;
    const platformYTop = 220;

    const centers: Record<SlotId, { x: number; y: number }> = {
      TL: { x: leftX, y: platformYTop },
      TR: { x: rightX, y: platformYTop },
      BL: { x: leftX, y: this.groundY() },
      BR: { x: rightX, y: this.groundY() },
    };

    ORDER_CLOCKWISE.forEach((slot, i) => {
      const p = this.players[i];
      const prefix = p.characterId;
      const c = centers[slot];

      let platformImg: Phaser.GameObjects.Image | null = null;
      if (slot === "TL" || slot === "TR") {
        platformImg = this.add
          .image(c.x, c.y, "platform")
          .setOrigin(0.7, -1)
          .setDepth(1);
        platformImg.setScale(
          CONFIG.platforms.width / platformImg.width,
          CONFIG.platforms.height / platformImg.height
        );
      }

      const platformHome = { x: c.x - 40, y: platformImg ? c.y - 40 : c.y };
      const groundHome = { x: c.x, y: this.groundY() };

      const sprite = this.add
        .sprite(platformHome.x, platformHome.y, `${prefix}_idle`, 0)
        .setScale(CONFIG.attacker.scale)
        .setDepth(2);

      const onRight = this.isRight(slot);
      sprite.setFlipX(onRight);
      sprite.play(
        onRight ? `${prefix}_walk_anim_rev` : `${prefix}_walk_anim`,
        true
      );

      const nameTag = this.add
        .text(platformHome.x, platformHome.y - 82, p.uname, {
          fontFamily: "sans-serif",
          fontSize: "14px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(3);

      this.A[slot] = {
        id: slot,
        prefix,
        sprite,
        nameTag,
        busy: false,
        platformImg,
        platformHome,
        groundHome,
        onPlatform: !!platformImg,
      };
    });
  }

  /* ---------------------- Loop & attacks ---------------------- */

  private async runClockwiseLoop() {
    while (this.loopRunning) {
      // If a heavy is pending (HP dropped), TL goes now.
      if (this.pendingHeavy) {
        this.pendingHeavy = false;
        await this.heavy("TL");
        // continue loop from whoever is next after TL
        this.loopIndex = 1; // next is TR in the clockwise array
        continue;
      }

      const id = ORDER_CLOCKWISE[this.loopIndex] as SlotId;
      await this.light(id);

      this.loopIndex = (this.loopIndex + 1) % ORDER_CLOCKWISE.length;
    }
  }

  private light(id: SlotId) {
    const A = this.A[id];
    if (!A) return Promise.resolve();

    return new Promise<void>((resolve) => {
      if (A.busy) return resolve();
      A.busy = true;

      const runAndStrike = () => {
        const sprite = A.sprite;
        const prefix = A.prefix;
        const targetX =
          this.thanos.x +
          (sprite.x < this.thanos.x
            ? -CONFIG.attacker.attackOffset
            : CONFIG.attacker.attackOffset);

        sprite.setFlipX(sprite.x > this.thanos.x);
        sprite.play(`${prefix}_run_anim`, true);

        this.tweens.add({
          targets: sprite,
          x: targetX,
          duration: CONFIG.attacker.lightDashDuration,
          ease: "Quad.easeOut",
          onComplete: () => {
            const attackKey = `${prefix}_attack${
              1 + Math.floor(Math.random() * 3)
            }_anim`;
            sprite.play(attackKey, true);

            this.sound.play("sfx_impact", { volume: 0.7 });
            this.sound.play("sfx_slash", { volume: 0.6, rate: 1.05 });

            // gentler shake to avoid perceived zoom
            this.time.delayedCall(120, () => {
              this.cameras.main.shake(200, 0.004);
              this.thanos.setTint(0xff0000);
              this.time.delayedCall(150, () => this.thanos.clearTint());
            });

            sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
              this.returnToStart(A, resolve);
            });
          },
        });
      };

      if (this.isTop(id) && A.onPlatform) this.jumpDown(A, runAndStrike);
      else runAndStrike();
    });
  }

  private heavy(id: SlotId) {
    const A = this.A[id];
    if (!A) return Promise.resolve();

    return new Promise<void>((resolve) => {
      if (A.busy) return resolve();
      A.busy = true;

      const doHeavy = () => {
        const sprite = A.sprite;
        const prefix = A.prefix;
        const targetX =
          this.thanos.x +
          (sprite.x < this.thanos.x
            ? -CONFIG.attacker.attackOffset
            : CONFIG.attacker.attackOffset);

        sprite.setFlipX(sprite.x > this.thanos.x);

        const attackKey = `${prefix}_attack1_anim`;
        sprite.play(attackKey, true);

        const anim = sprite.anims.currentAnim;
        const frames = anim ? anim.frames : [];
        const holdIx = Math.min(
          CONFIG.attacker.heavy.holdFrameIndex,
          Math.max(0, frames.length - 1)
        );
        if (frames.length) sprite.anims.pause(frames[holdIx]);
        else sprite.anims.pause();

        this.time.delayedCall(CONFIG.attacker.heavy.holdMs, () => {
          this.tweens.add({
            targets: sprite,
            x: targetX,
            duration: CONFIG.attacker.heavy.dashDuration,
            ease: "Quad.easeOut",
            onComplete: () => {
              sprite.anims.resume();

              this.time.delayedCall(120, () => {
                this.cameras.main.flash(60, 255, 255, 255, false);
                this.cameras.main.shake(200, 0.004);
                this.thanos.setTint(0xff0000);
                this.time.delayedCall(150, () => this.thanos.clearTint());
              });

              sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.returnToStart(A, resolve);
              });
            },
          });
        });
      };

      if (this.isTop(id) && A.onPlatform) this.jumpDown(A, doHeavy);
      else doHeavy();
    });
  }

  private returnToStart(A: AttackerRecord, done: () => void) {
    const sprite = A.sprite;
    const prefix = A.prefix;

    // Case A: top player who is currently on the GROUND -> run under platform, then jump up.
    if (this.isTop(A.id) && !A.onPlatform && A.platformImg) {
      const targetX = A.groundHome.x;
      const targetY = A.groundHome.y;

      // face run direction
      const goingLeft = sprite.x > targetX;
      sprite.setFlipX(goingLeft);

      this.tweens.add({
        targets: sprite,
        x: targetX,
        y: targetY,
        duration: CONFIG.attacker.animation.duration,
        ease: CONFIG.attacker.animation.ease,
        onStart: () => sprite.play(`${prefix}_run_anim`, true),
        onComplete: () => {
          // now jump back up to platform
          this.jumpUpToPlatform(A, () => {
            A.busy = false;
            done();
          });
        },
      });

      return; // important: stop here
    }

    // Case B: already at correct layer (bottoms or tops already on platform)
    const targetX = A.onPlatform ? A.platformHome.x : A.groundHome.x;
    const targetY = A.onPlatform ? A.platformHome.y : A.groundHome.y;

    const goingLeft = sprite.x > targetX;
    sprite.setFlipX(goingLeft);

    this.tweens.add({
      targets: sprite,
      x: targetX,
      y: targetY,
      duration: CONFIG.attacker.animation.duration,
      ease: CONFIG.attacker.animation.ease,
      onStart: () => sprite.play(`${prefix}_run_anim`, true),
      onComplete: () => {
        const onRight = this.isRight(A.id);
        sprite.setFlipX(onRight);
        sprite.play(
          onRight ? `${prefix}_walk_anim_rev` : `${prefix}_walk_anim`,
          true
        );
        A.busy = false;
        done();
      },
    });
  }

  /* ---------------------- Jumps ---------------------- */
  private jumpDown(A: AttackerRecord, after: () => void) {
    const sprite = A.sprite;
    const startY = sprite.y;
    const landX = A.groundHome.x + (this.isRight(A.id) ? -60 : 60);
    const landY = A.groundHome.y;

    this.tweens.add({
      targets: sprite,
      x: landX,
      duration: 600,
      ease: "Quad.easeOut",
    });
    this.tweens.add({
      targets: sprite,
      y: landY,
      duration: 600,
      ease: "Quad.easeIn",
      onUpdate: (tw, target) => {
        const t = (tw as any).progress;
        const H = 160;
        const arc = (1 - (2 * t - 1) ** 2) * H;
        const base = Phaser.Math.Linear(startY, landY, t);
        (target as any).y = base - arc;
      },
      onComplete: () => {
        A.onPlatform = false;
        after();
      },
    });
  }
}

/* ---------------------- React wrapper ---------------------- */
const FourPlayerArena: React.FC<FourPlayerArenaProps> = ({ players, bossHp }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<ArenaScene | null>(null);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    // Parent element sizing and interaction guards
    const parentEl = gameRef.current;
    parentEl.style.width = "100%";
    parentEl.style.height = "100svh"; // avoid mobile toolbar vh jumps
    parentEl.style.position = "relative";
    parentEl.style.background = "transparent";
    parentEl.style.overflow = "hidden";
    // reduce accidental browser zoom/scroll during shakes
    (parentEl.style as any).touchAction = "none";
    (parentEl.style as any).overscrollBehavior = "contain";

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: parentEl,
      backgroundColor: "transparent",

      // Use virtual design resolution + FIT so world coords remain stable.
      width: DESIGN_W,
      height: DESIGN_H,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 1, // keep canvas CSS zoom at 1
      },

      physics: { default: "arcade", arcade: { debug: false } },
      scene: [ArenaScene],
      render: { pixelArt: false, antialias: true },
    };

    phaserGameRef.current = new Phaser.Game(config);

    // start with players and initial hp
    phaserGameRef.current.scene.start("ArenaScene", { players, bossHp });
    sceneRef.current = phaserGameRef.current.scene.getScene("ArenaScene") as ArenaScene;

    // keep canvas sized with window; Scale.FIT handles aspect safely
    const onResize = () => {
      phaserGameRef.current?.scale.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      phaserGameRef.current?.destroy(true);
      phaserGameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // pass HP changes into the scene (triggers TL heavy when it drops)
  useEffect(() => {
    sceneRef.current?.updateBossHp(bossHp);
  }, [bossHp]);

  return (
    <Card fullBleed hover style={{ borderRadius: 16, overflow: "hidden" }}>
      <div ref={gameRef} id="phaser-thanos-container" />
    </Card>
  );
};

export default FourPlayerArena;
