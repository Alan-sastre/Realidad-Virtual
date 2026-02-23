class Puzzle3 extends Phaser.Scene {
  constructor() {
    super("Puzzle3");
  }

  create() {
    // Ensure texture exists
    if (typeof createParticleTexture === "function") {
      createParticleTexture(this);
    }

    // Music
    if (typeof AudioManager !== "undefined") {
      this.audioManager = new AudioManager(this, "bgm", {
        primaryColor: 0x00e5ff,
        secondaryColor: 0x000000,
      });
    }

    // --- Background: Cyber Grid (VR Space) ---
    this.createCyberBackground();

    // Target IPD (Interpupillary Distance)
    this.targetSpacing = Phaser.Math.Between(150, 300);
    this.currentSpacing = 50;
    this.centerY = 220;

    // Visual Targets
    this.leftTargetX = 500 - this.targetSpacing / 2;
    this.rightTargetX = 500 + this.targetSpacing / 2;

    this.createTarget(this.leftTargetX, this.centerY);
    this.createTarget(this.rightTargetX, this.centerY);

    // The Lenses
    this.lensesContainer = this.add.container(500, this.centerY);
    this.lensLeft = this.createLens(-25);
    this.lensRight = this.createLens(25);
    this.lensesContainer.add([this.lensLeft, this.lensRight]);

    // Slider Control
    this.sliderY = 400;
    this.createSlider();

    // Title
    this.add
      .text(500, 50, "👁️ CALIBRACIÓN 👁️", {
        fontSize: "32px",
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#00E5FF",
      })
      .setOrigin(0.5);

    // Hint Hand
    this.handHint = this.add
      .text(0, 0, "👆🏻", { fontSize: "60px" })
      .setOrigin(0.5);
    this.handHint.setVisible(false);
    this.showHint();
  }

  createCyberBackground() {
    this.cameras.main.setBackgroundColor("#000000");

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00e5ff, 0.3); // Cyan lines

    // Perspective Grid
    // Horizon line at y=250 (center)

    // Vertical lines radiating from center
    for (let i = -1000; i <= 2000; i += 100) {
      graphics.moveTo(500, 250);
      graphics.lineTo(i, 500);
    }

    // Horizontal lines
    for (let y = 250; y <= 500; y += 40) {
      graphics.moveTo(0, y);
      graphics.lineTo(1000, y);
    }
    graphics.strokePath();

    // Top half (Sky/Stars)
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 1000);
      const y = Phaser.Math.Between(0, 250);
      this.add.circle(
        x,
        y,
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.8),
      );
    }
  }

  createTarget(x, y) {
    const target = this.add.graphics();
    target.lineStyle(4, 0x00e5ff, 0.8);

    // Crosshair
    target.lineBetween(x - 20, y, x + 20, y);
    target.lineBetween(x, y - 20, x, y + 20);

    // Target Circle
    target.strokeCircle(x, y, 30);

    // Outer dashed ring
    target.lineStyle(2, 0x00e5ff, 0.3);
    target.strokeCircle(x, y, 50);

    // Pulsing animation
    this.tweens.add({
      targets: target,
      scale: { from: 1, to: 1.1 },
      alpha: { from: 0.8, to: 1 },
      yoyo: true,
      repeat: -1,
      duration: 800,
    });
  }

  createLens(offsetX) {
    const lens = this.add.container(offsetX, 0);

    // Glass
    const glass = this.add.circle(0, 0, 60, 0xffffff, 0.1);
    glass.setStrokeStyle(4, 0xfafafa);

    // Reflection
    const reflection = this.add.ellipse(-20, -20, 30, 15, 0xffffff, 0.4);
    reflection.setRotation(Phaser.Math.DegToRad(-45));

    // Center Dot (Calibration point)
    const dot = this.add.circle(0, 0, 6, 0xff0000);
    lens.dot = dot;

    // Glow behind lens
    const glow = this.add.circle(0, 0, 70, 0x00e5ff, 0.0);
    lens.glow = glow;

    lens.add([glow, glass, reflection, dot]);
    return lens;
  }

  createSlider() {
    // Slider Background Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x212121, 0.8);
    panel.fillRoundedRect(250, this.sliderY - 30, 500, 60, 10);
    panel.lineStyle(2, 0x424242);
    panel.strokeRoundedRect(250, this.sliderY - 30, 500, 60, 10);

    // Track
    const track = this.add.rectangle(500, this.sliderY, 400, 6, 0x000000);

    // Labels
    this.add
      .text(280, this.sliderY, "-", { fontSize: "40px", color: "#888" })
      .setOrigin(0.5);
    this.add
      .text(720, this.sliderY, "+", { fontSize: "40px", color: "#888" })
      .setOrigin(0.5);

    // Knob
    this.knob = this.add.container(500, this.sliderY);

    const knobGfx = this.add.graphics();
    knobGfx.fillStyle(0xff5722, 1);
    knobGfx.fillCircle(0, 0, 20);
    knobGfx.lineStyle(3, 0xffffff);
    knobGfx.strokeCircle(0, 0, 20);

    // Grip lines
    knobGfx.lineStyle(2, 0xbf360c);
    knobGfx.lineBetween(-10, -5, -10, 5);
    knobGfx.lineBetween(0, -5, 0, 5);
    knobGfx.lineBetween(10, -5, 10, 5);

    this.knob.add(knobGfx);
    this.knob.setSize(40, 40);
    this.knob.setInteractive({ draggable: true });

    this.knob.on("drag", (pointer, dragX, dragY) => {
      const x = Phaser.Math.Clamp(dragX, 300, 700);
      this.knob.x = x;
      this.knob.y = this.sliderY;

      const progress = (x - 300) / 400;
      this.updateLensSpacing(progress);

      this.handHint.setVisible(false);
    });

    this.knob.on("dragend", () => {
      this.checkAlignment();
    });
  }

  updateLensSpacing(progress) {
    const totalSpacing = 50 + progress * 350;
    const halfSpacing = totalSpacing / 2;

    this.lensLeft.x = -halfSpacing;
    this.lensRight.x = halfSpacing;

    this.currentSpacing = totalSpacing;

    const diff = Math.abs(this.currentSpacing - this.targetSpacing);

    if (diff < 20) {
      this.lensLeft.dot.setFillStyle(0x00ff00); // Green
      this.lensRight.dot.setFillStyle(0x00ff00);
      this.lensLeft.glow.setAlpha(0.3);
      this.lensRight.glow.setAlpha(0.3);
    } else {
      this.lensLeft.dot.setFillStyle(0xff0000); // Red
      this.lensRight.dot.setFillStyle(0xff0000);
      this.lensLeft.glow.setAlpha(0);
      this.lensRight.glow.setAlpha(0);
    }
  }

  checkAlignment() {
    const diff = Math.abs(this.currentSpacing - this.targetSpacing);

    if (diff < 15) {
      this.winGame();
    } else {
      this.tweens.add({
        targets: this.knob,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 200,
      });
    }
  }

  showHint() {
    this.handHint.setVisible(true);
    this.handHint.setPosition(500, this.sliderY);

    const targetP = (this.targetSpacing - 50) / 350;
    const targetX = 300 + targetP * 400;

    this.tweens.add({
      targets: this.handHint,
      x: targetX,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
  }

  winGame() {
    this.knob.disableInteractive();
    this.handHint.setVisible(false);

    // Snap
    const halfTarget = this.targetSpacing / 2;
    this.tweens.add({
      targets: this.lensLeft,
      x: -halfTarget,
      duration: 300,
    });
    this.tweens.add({
      targets: this.lensRight,
      x: halfTarget,
      duration: 300,
    });

    // Expand transition
    this.tweens.add({
      targets: [this.lensLeft, this.lensRight],
      scale: 15,
      alpha: 0,
      duration: 1500,
      ease: "Power2",
      onComplete: () => {
        const winText = this.add
          .text(500, 250, "¡VISIÓN CLARA!", {
            fontSize: "60px",
            fontStyle: "bold",
            color: "#FFFFFF",
            stroke: "#00E5FF",
            strokeThickness: 6,
          })
          .setOrigin(0.5)
          .setScale(0);

        this.tweens.add({
          targets: winText,
          scale: 1,
          duration: 500,
          ease: "Back.out",
        });

        // Confetti
        const particles = this.add.particles("star");
        particles.createEmitter({
          x: { min: 0, max: 1000 },
          y: 0,
          speedY: { min: 100, max: 300 },
          speedX: { min: -50, max: 50 },
          scale: { start: 0.5, end: 0 },
          lifespan: 3000,
          gravityY: 100,
          quantity: 4,
          frequency: 100,
        });

        // Transition to EndScene
        this.time.delayedCall(4000, () => {
          this.scene.start("EndScene");
        });
      },
    });
  }
}
