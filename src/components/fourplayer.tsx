import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Card } from "./../components/ui/card.tsx";
import { AvatarId, AVATAR_FOLDER_MAP } from "../types/avatarTypes";
import { getSelectedAvatar } from "../utils/coinSystem";

/* ---------------------- Types ---------------------- */
type SlotId = "TL" | "TR" | "BR" | "BL";

// Use the new avatar system
export type CharacterId = AvatarId;

export interface PlayerSpec {
  uname: string;
  characterId: CharacterId;
}

interface FourPlayerArenaProps {
  players: [PlayerSpec, PlayerSpec, PlayerSpec, PlayerSpec];
  bossHp: number; // 0..100
}

const DESIGN_W = 1280;
const DESIGN_H = 720;

/* ---------------------- Assets map ---------------------- */
const CHAR_FOLDER: Record<CharacterId, string> = AVATAR_FOLDER_MAP;

/* ---------------------- Config ---------------------- */
const CONFIG = {
  thanos: {
    scale: 0.75,
    yPosition: 470,
    hitEffect: { scaleIncrease: 0.08, tintColor: 0xff0000, duration: 60 },
  },
  attacker: {
    scale: 1.6,
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
  groundOffsetFromBottom: 190,
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
  private currentHp = 100;
  private lastHp = 100;

  // bg
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgNear!: Phaser.GameObjects.TileSprite;

  // boss + UI
  private thanos!: Phaser.GameObjects.Image;
  private defeatText!: Phaser.GameObjects.Text;

  // attackers
  private A: Record<SlotId, AttackerRecord> = {} as any;

  // control
  private loopIndex = 0;
  private loopRunning = false;
  private pendingHeavy = false;
  private isThanosDead = false;
  private finalAssaultStarted = false;

  // base display size of normal thanos so swaps keep identical size
  private thanosBaseW = 0;
  private thanosBaseH = 0;

  constructor() {
    super("ArenaScene");
  }

  init(data: { players: FourPlayerArenaProps["players"]; bossHp: number }) {
    this.players = data.players;

    // Use incoming bossHp (clamped 0..100)
    const hpFromProps =
      typeof data.bossHp === "number" && !Number.isNaN(data.bossHp)
        ? Math.max(0, Math.min(100, data.bossHp))
        : 100;

    this.currentHp = hpFromProps;
    this.lastHp = hpFromProps;
    this.isThanosDead = false;
    this.finalAssaultStarted = false;
    this.loopIndex = 0;
    this.loopRunning = false;
    this.pendingHeavy = false;
  }

  /** Called from React when bossHp prop changes */
  public updateBossHp(newHp: number) {
    if (this.isThanosDead || this.finalAssaultStarted) return;
    const clamped = Math.max(0, Math.min(100, Number(newHp) || 0));

    if (clamped < this.currentHp) {
      this.pendingHeavy = true; // cue heavy from TL on next tick
    }
    this.lastHp = this.currentHp;
    this.currentHp = clamped;

    if (this.currentHp <= 0) this.killThanos(); // orchestration (final heavies -> death)
  }

  preload() {
    // backgrounds
    this.load.image("background", "assets/dark_background.png");
    this.load.image("background_far", "assets/dark_background_far.png");

    // boss images
    this.load.image("thanos", "assets/thanos.png");
    this.load.image("thanos_hit", "assets/thanos-gettinghit.png");
    this.load.image("thanos_dead", "assets/thanos-dead.png");

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
    const width = DESIGN_W;
    const height = DESIGN_H;

    // parallax bgs
    this.bgFar = this.add
      .tileSprite(width / 2, height / 2, width, height, "background_far")
      .setScrollFactor(0);
    this.bgNear = this.add
      .tileSprite(
        width / 2,
        height / 2 - 20,
        width * 1.5,
        height * 1.5,
        "background"
      )
      .setScrollFactor(0);

    // camera lock
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

    // record base display size after scale so all future textures match it
    this.thanosBaseW = this.thanos.displayWidth;
    this.thanosBaseH = this.thanos.displayHeight;

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

    // If HP already 0 on mount, run final assault then death (after sprites exist)
    if (this.currentHp <= 0) {
      this.time.delayedCall(0, () => this.killThanos());
      return; // don't start loop
    }

    // start loop
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

  /* ---------------------- Helpers ---------------------- */
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
    if (!A.platformImg) return after?.();

    const sprite = A.sprite;
    const startY = sprite.y;
    const landX = A.platformHome.x;
    const landY = A.platformHome.y;

    this.tweens.add({
      targets: sprite,
      x: landX,
      duration: 600,
      ease: "Quad.easeInOut",
    });

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
        const outward = A.id === "TR";
        sprite.setFlipX(outward);
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

    const padX = 160;
    const leftX = padX;
    const rightX = width - padX;
    const platformYTop = 300;

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
          .setOrigin(0.7, -0.55)
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

  /* ---------------------- Texture helpers to enforce consistent size ---------------------- */
  private fitThanosSize() {
    if (!this.thanos) return;
    if (this.thanosBaseW > 0 && this.thanosBaseH > 0) {
      this.thanos.setDisplaySize(this.thanosBaseW, this.thanosBaseH);
    }
  }
  private setThanosTexture(key: string) {
    this.thanos.setTexture(key);
    this.fitThanosSize();
  }

  /* ---------------------- UTIL: Apply hit FX (texture + tint + facing) ---------------------- */
  private showHitFlash(attackerX: number) {
    if (this.isThanosDead) return;

    // Face the attacker (turn if hit from behind)
    this.thanos.setFlipX(attackerX > this.thanos.x);

    // Switch to "getting hit" texture for the duration of the red highlight
    this.setThanosTexture("thanos_hit");
    this.thanos.setTint(0xff0000);

    // Revert after highlight if not dead
    this.time.delayedCall(150, () => {
      if (this.isThanosDead) return; // don't revert if already dead
      this.thanos.clearTint();
      this.setThanosTexture("thanos"); // back to normal after highlight
    });
  }

  /* ---------------------- Final Assault Orchestration ---------------------- */
  private async killThanos() {
    if (this.finalAssaultStarted || this.isThanosDead) return;
    this.finalAssaultStarted = true;

    // stop the normal loop, clear any pending heavy cue from hp drop
    this.loopRunning = false;
    this.pendingHeavy = false;

    // helper delay using Phaser clock
    const delay = (ms: number) =>
      new Promise<void>((resolve) =>
        this.time.delayedCall(ms, () => resolve())
      );

    // ensure an attacker is free before commanding heavy
    const heavyWhenFree = async (id: SlotId) => {
      const a = this.A[id];
      if (!a) return;
      // wait until not busy (e.g., finishing a light)
      let guard = 0;
      while (a.busy && guard < 120) {
        await delay(50);
        guard++;
      }
      await this.heavy(id);
    };

    // Sequential big finish: TL -> TR -> BR -> BL
    for (const id of ORDER_CLOCKWISE) {
      await heavyWhenFree(id);
      await delay(120); // small beat between smashes
    }

    // Now actually die (dead texture -> blink -> fall)
    this.killThanosVisuals();
  }

  /* ---------------------- Death Visuals ---------------------- */
  private killThanosVisuals() {
    if (this.isThanosDead) return;
    this.isThanosDead = true;

    // lock to the dead texture at the same visual size
    this.setThanosTexture("thanos_dead");
    this.thanos.clearTint();
    this.thanos.setAlpha(1);

    this.cameras.main.flash(80, 255, 255, 255, false);
    this.cameras.main.shake(240, 0.004);

    // blink while dead image is shown
    const blinkTimes = 6;
    this.time.addEvent({
      delay: 80,
      repeat: blinkTimes * 2,
      callback: () => {
        this.thanos.setAlpha(this.thanos.alpha === 1 ? 0.2 : 1);
      },
    });

    // fall & fade
    this.tweens.add({
      targets: this.thanos,
      y: this.thanos.y + 180,
      alpha: 0,
      duration: 900,
      ease: "Quad.easeIn",
      delay: 80 * blinkTimes,
      onComplete: () => {
        this.tweens.add({
          targets: this.defeatText,
          alpha: 1,
          duration: 450,
          ease: "Quad.easeOut",
        });

        // send everyone home
        (Object.values(this.A) as AttackerRecord[]).forEach((a) => {
          if (!a) return;
          this.returnToStart(a, () => {
            const onRight = this.isRight(a.id);
            a.sprite.setFlipX(onRight);
            a.sprite.play(
              onRight ? `${a.prefix}_walk_anim_rev` : `${a.prefix}_walk_anim`,
              true
            );
            a.busy = false;
          });
        });
      },
    });
  }

  /* ---------------------- Loop & attacks ---------------------- */
  private async runClockwiseLoop() {
    while (this.loopRunning) {
      if (this.isThanosDead || this.finalAssaultStarted) break;

      if (this.pendingHeavy) {
        this.pendingHeavy = false;
        if (!this.isThanosDead && !this.finalAssaultStarted)
          await this.heavy("TL");
        this.loopIndex = 1; // next TR
        continue;
      }

      const id = ORDER_CLOCKWISE[this.loopIndex] as SlotId;
      if (!this.isThanosDead && !this.finalAssaultStarted) await this.light(id);

      this.loopIndex = (this.loopIndex + 1) % ORDER_CLOCKWISE.length;
    }
  }

  private light(id: SlotId) {
    const A = this.A[id];
    if (!A) return Promise.resolve();

    return new Promise<void>((resolve) => {
      if (A.busy || this.isThanosDead || this.finalAssaultStarted)
        return resolve();
      A.busy = true;

      const runAndStrike = () => {
        if (this.isThanosDead || this.finalAssaultStarted) {
          A.busy = false;
          return resolve();
        }

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
            if (this.isThanosDead || this.finalAssaultStarted) {
              this.returnToStart(A, resolve);
              return;
            }

            const attackKey = `${prefix}_attack${
              1 + Math.floor(Math.random() * 3)
            }_anim`;
            sprite.play(attackKey, true);

            this.sound.play("sfx_impact", { volume: 0.7 });
            this.sound.play("sfx_slash", { volume: 0.6, rate: 1.05 });

            // shake + red highlight; make Thanos face attacker & show hit image for the highlight
            this.time.delayedCall(120, () => {
              this.cameras.main.shake(200, 0.004);
              this.showHitFlash(sprite.x);
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
      if (A.busy || this.isThanosDead) return resolve(); // allow during finalAssaultStarted (until visuals)
      A.busy = true;

      const doHeavy = () => {
        if (this.isThanosDead) {
          A.busy = false;
          return resolve();
        }

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
          if (this.isThanosDead) {
            A.busy = false;
            return resolve();
          }

          this.tweens.add({
            targets: sprite,
            x: targetX,
            duration: CONFIG.attacker.heavy.dashDuration,
            ease: "Quad.easeOut",
            onComplete: () => {
              sprite.anims.resume();

              // flash + shake + highlight; also orient Thanos to attacker during hit
              this.time.delayedCall(120, () => {
                this.cameras.main.flash(60, 255, 255, 255, false);
                this.cameras.main.shake(200, 0.004);
                this.showHitFlash(sprite.x);
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

    // top player on ground -> run to under platform, then jump up
    if (this.isTop(A.id) && !A.onPlatform && A.platformImg) {
      const targetX = A.groundHome.x;
      const targetY = A.groundHome.y;

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
          this.jumpUpToPlatform(A, () => {
            A.busy = false;
            done();
          });
        },
      });

      return;
    }

    // already correct layer
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

// Helper function to create player specs with user's selected avatar
const createPlayerSpecs = (): [PlayerSpec, PlayerSpec, PlayerSpec, PlayerSpec] => {
  const selectedAvatarId = getSelectedAvatar() as CharacterId;
  
  return [
    { uname: "Player 1", characterId: selectedAvatarId },
    { uname: "Player 2", characterId: selectedAvatarId },
    { uname: "Player 3", characterId: selectedAvatarId },
    { uname: "Player 4", characterId: selectedAvatarId },
  ];
};

const FourPlayerArena: React.FC<FourPlayerArenaProps> = ({
  players,
  bossHp,
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<ArenaScene | null>(null);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const parentEl = gameRef.current;
    parentEl.style.width = "100%";
    parentEl.style.height = "100svh";
    parentEl.style.position = "relative";
    parentEl.style.background = "transparent";
    parentEl.style.overflow = "hidden";
    (parentEl.style as any).touchAction = "none";
    (parentEl.style as any).overscrollBehavior = "contain";

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: parentEl,
      backgroundColor: "transparent",
      width: DESIGN_W,
      height: DESIGN_H,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 1,
      },
      physics: { default: "arcade", arcade: { debug: false } },
      scene: [], // we'll add the scene instance manually to avoid boot race
      render: { pixelArt: false, antialias: true },
    };

    phaserGameRef.current = new Phaser.Game(config);

    // Use player's selected avatar for all players
    const playerSpecs = createPlayerSpecs();

    // Avoid race: add an instance and autostart with initial data
    const scene = new ArenaScene();
    phaserGameRef.current.scene.add("ArenaScene", scene, true, {
      players: playerSpecs,
      bossHp,
    });
    sceneRef.current = scene;

    const onResize = () => phaserGameRef.current?.scale.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      phaserGameRef.current?.destroy(true);
      phaserGameRef.current = null;
      sceneRef.current = null;
    };
  }, []); // mount once

  // React → Scene HP updates (prop changes over time)
  useEffect(() => {
    sceneRef.current?.updateBossHp(bossHp);
  }, [bossHp]);

  return (
    <Card fullBleed>
      <div ref={gameRef} id="phaser-thanos-container" />
    </Card>
  );
};

export default FourPlayerArena;
