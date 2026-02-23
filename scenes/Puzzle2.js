class Puzzle2 extends Phaser.Scene {
  constructor() {
    super("Puzzle2");
  }

  create() {
    if (typeof createParticleTexture === "function") {
      createParticleTexture(this);
    }

    // Music
    if (typeof AudioManager !== "undefined") {
      this.audioManager = new AudioManager(this, "bgm", {
        primaryColor: 0x00e5ff,
        secondaryColor: 0x101010,
      });
    }

    // --- Background: Inside Headset ---
    this.cameras.main.setBackgroundColor("#101010");
    this.createHeadsetMask();

    // --- Lenses ---
    this.leftLens = this.createRealisticLens(300, 250);
    this.rightLens = this.createRealisticLens(700, 250);

    // --- Dirt ---
    this.dirtParticles = [];
    this.spawnDirt(300, 250);
    this.spawnDirt(700, 250);

    // --- Cloth Cursor ---
    this.createClothCursor();

    // --- Hint Hand ---
    this.handHint = this.add
      .text(500, 250, "👆🏻", { fontSize: "80px" })
      .setOrigin(0.5);
    this.tweens.add({
      targets: this.handHint,
      x: { from: 450, to: 550 },
      y: { from: 250, to: 250 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // --- Input Handling ---
    this.input.on("pointerdown", (pointer) => {
      this.handHint.setVisible(false);
      this.updateCloth(pointer);
      this.clean(pointer.x, pointer.y);
    });

    this.input.on("pointermove", (pointer) => {
      this.updateCloth(pointer);
      if (pointer.isDown) {
        this.clean(pointer.x, pointer.y);
      }
    });

    this.input.on("pointerup", () => {
      this.clothContainer.setVisible(false);
    });

    // Initial state
    this.clothContainer.setVisible(false);
  }

  createHeadsetMask() {
    const graphics = this.add.graphics();

    // Dark foam padding texture
    graphics.fillStyle(0x212121, 1);
    graphics.fillRoundedRect(50, 50, 900, 400, 50);

    // Inner plastic
    graphics.fillStyle(0x000000, 1);
    graphics.fillRoundedRect(80, 80, 840, 340, 40);

    // Bridge nose
    graphics.beginPath();
    graphics.moveTo(450, 420);
    graphics.lineTo(500, 350);
    graphics.lineTo(550, 420);
    graphics.closePath();
    graphics.fillPath();

    // Title
    this.add
      .text(500, 40, "✨ LIMPIA LOS LENTES", {
        fontSize: "28px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }

  createRealisticLens(x, y) {
    const container = this.add.container(x, y);

    // Lens base
    const glass = this.add.circle(0, 0, 140, 0x29b6f6, 0.1);
    glass.setStrokeStyle(4, 0x111111);

    // Fresnel ridges (Concentric circles)
    const ridges = this.add.graphics();
    ridges.lineStyle(2, 0xffffff, 0.05);
    for (let r = 20; r < 140; r += 15) {
      ridges.strokeCircle(0, 0, r);
    }

    // Reflection highlight
    const reflection = this.add.ellipse(-40, -40, 60, 30, 0xffffff, 0.2);
    reflection.setRotation(Phaser.Math.DegToRad(-45));

    container.add([glass, ridges, reflection]);
    return container;
  }

  createClothCursor() {
    this.clothContainer = this.add.container(0, 0);

    // Cloth visual (Simplified to overlapping circles to simulate a wadded cloth)
    const cloth = this.add.graphics();
    cloth.fillStyle(0x00bcd4, 0.9); // Microfiber blue

    cloth.fillCircle(0, 0, 30);
    cloth.fillCircle(-15, -15, 25);
    cloth.fillCircle(15, -15, 25);
    cloth.fillCircle(-15, 15, 25);
    cloth.fillCircle(15, 15, 25);

    // Hand (Simple circle for finger/hand holding it)
    const hand = this.add.circle(10, 10, 20, 0xffccbc); // Skin tone

    this.clothContainer.add([cloth, hand]);
    this.clothContainer.setDepth(100); // Always on top
  }

  updateCloth(pointer) {
    this.clothContainer.setPosition(pointer.x, pointer.y);

    // Tilt effect based on movement could be cool, but keep simple
    if (pointer.isDown) {
      this.clothContainer.setVisible(true);
    }
  }

  spawnDirt(centerX, centerY) {
    for (let i = 0; i < 40; i++) {
      const r = 130 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const x = centerX + r * Math.cos(theta);
      const y = centerY + r * Math.sin(theta);

      // Varied dirt shapes
      const size = Phaser.Math.Between(4, 8);
      const color = Phaser.Utils.Array.GetRandom([
        0x5d4037, 0x795548, 0x3e2723,
      ]); // Browns

      const dirt = this.add.circle(x, y, size, color, 0.8);
      this.dirtParticles.push(dirt);
    }
  }

  clean(x, y) {
    let cleanedAny = false;

    for (let i = this.dirtParticles.length - 1; i >= 0; i--) {
      const dirt = this.dirtParticles[i];
      if (dirt.active) {
        const dist = Phaser.Math.Distance.Between(x, y, dirt.x, dirt.y);
        if (dist < 50) {
          // Poof effect
          this.tweens.add({
            targets: dirt,
            scale: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => dirt.destroy(),
          });

          this.dirtParticles.splice(i, 1);
          cleanedAny = true;
        }
      }
    }

    if (cleanedAny) {
      // Create a trail/sparkle where we cleaned
      const sparkle = this.add.star(x, y, 5, 2, 5, 0xffffff);
      this.tweens.add({
        targets: sparkle,
        scale: 0,
        duration: 300,
        onComplete: () => sparkle.destroy(),
      });
    }

    if (this.dirtParticles.length === 0) {
      this.success();
    }
  }

  success() {
    // Stop interaction
    this.input.off("pointerdown");
    this.input.off("pointermove");
    this.clothContainer.setVisible(false);

    // Flash Lenses Clean
    this.tweens.add({
      targets: [this.leftLens, this.rightLens],
      scale: 1.1,
      duration: 300,
      yoyo: true,
      repeat: 1,
    });

    // "Sparkle" Animation all over
    const particles = this.add.particles("star");
    particles.createEmitter({
      x: { min: 200, max: 800 },
      y: { min: 150, max: 350 },
      speed: { min: 0, max: 50 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: 5,
      frequency: 100,
      blendMode: "ADD",
    });

    // Success Text
    const text = this.add
      .text(500, 250, "¡IMPECABLE!", {
        fontSize: "70px",
        fontStyle: "bold",
        color: "#00E5FF",
        stroke: "#FFFFFF",
        strokeThickness: 6,
        shadow: { offsetX: 4, offsetY: 4, color: "#000", blur: 4, fill: true },
      })
      .setOrigin(0.5)
      .setScale(0);

    this.tweens.add({
      targets: text,
      scale: 1,
      ease: "Elastic.out",
      duration: 800,
    });

    this.time.delayedCall(3000, () => {
      this.scene.start("Puzzle3");
    });
  }
}
