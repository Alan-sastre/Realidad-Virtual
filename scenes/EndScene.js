class EndScene extends Phaser.Scene {
  constructor() {
    super("EndScene");
  }

  create() {
    // Ensure particle texture exists
    if (typeof createParticleTexture === "function") {
      createParticleTexture(this);
    }

    // Music
    if (typeof AudioManager !== "undefined") {
      this.audioManager = new AudioManager(this, "bgm", {
        primaryColor: 0x76ff03,
        secondaryColor: 0x050510,
      });
    }

    // --- Cyber/VR Background ---
    this.cameras.main.setBackgroundColor("#050510");
    this.createCyberGrid();

    // --- Confetti (Digital Style) ---
    const particles = this.add.particles("star");
    const emitter = particles.createEmitter({
      x: { min: 0, max: 1000 },
      y: -50,
      speedY: { min: 150, max: 350 },
      speedX: { min: -100, max: 100 },
      rotate: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 5000,
      gravityY: 50,
      quantity: 3,
      frequency: 100,
      blendMode: "ADD",
      tint: [0x00e5ff, 0x76ff03, 0xd500f9, 0xffea00], // Neon Cyan, Green, Purple, Yellow
    });

    // --- Center VR Icon (Holographic) ---
    this.createHolographicIcon(500, 220);

    // --- Congratulations Text (Neon Style) ---
    const titleText = this.add
      .text(500, 100, "¡SISTEMA LISTO!", {
        fontSize: "70px",
        fontFamily: "Arial Black, Impact",
        color: "#00E5FF",
        stroke: "#FFFFFF",
        strokeThickness: 4,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#00E5FF",
          blur: 20,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setScale(0)
      .setDepth(10);

    const subtitleText = this.add
      .text(500, 360, "Entrenamiento VR Completado", {
        fontSize: "32px",
        fontFamily: "Courier New, monospace",
        color: "#FFFFFF",
        fontStyle: "bold",
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#D500F9",
          blur: 10,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(10);

    // Animation for text
    this.tweens.add({
      targets: titleText,
      scale: 1,
      ease: "Back.out",
      duration: 800,
    });

    // Pulse effect for title
    this.tweens.add({
      targets: titleText,
      alpha: 0.8,
      yoyo: true,
      repeat: -1,
      duration: 1500,
    });

    this.tweens.add({
      targets: subtitleText,
      alpha: 1,
      delay: 600,
      duration: 1000,
    });

    // --- "Play Again" Button (Futuristic UI) ---
    const buttonContainer = this.add.container(500, 480);

    const buttonBg = this.add.graphics();
    // Inner fill
    buttonBg.fillStyle(0x1a1a1a, 0.9);
    buttonBg.fillRoundedRect(-140, -35, 280, 70, 10);
    // Neon Border
    buttonBg.lineStyle(3, 0x76ff03);
    buttonBg.strokeRoundedRect(-140, -35, 280, 70, 10);
    // Glow
    buttonBg.lineStyle(2, 0x76ff03, 0.5);
    buttonBg.strokeRoundedRect(-144, -39, 288, 78, 14);

    const buttonText = this.add
      .text(0, 0, "REINICIAR", {
        fontSize: "28px",
        fontFamily: "Arial",
        color: "#76FF03",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    buttonContainer.add([buttonBg, buttonText]);
    buttonContainer.setSize(280, 70);
    buttonContainer.setInteractive({ useHandCursor: true });
    buttonContainer.setAlpha(0);
    buttonContainer.setDepth(10);

    // Button Animation (Slide Up)
    this.tweens.add({
      targets: buttonContainer,
      alpha: 1,
      y: 430,
      delay: 1200,
      duration: 600,
      ease: "Power2",
    });

    // Button Interactions
    buttonContainer.on("pointerover", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x76ff03, 1); // Invert colors
      buttonBg.fillRoundedRect(-140, -35, 280, 70, 10);
      buttonBg.lineStyle(3, 0xffffff);
      buttonBg.strokeRoundedRect(-140, -35, 280, 70, 10);
      buttonText.setColor("#000000");

      this.tweens.add({
        targets: buttonContainer,
        scale: 1.05,
        duration: 100,
      });
    });

    buttonContainer.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x1a1a1a, 0.9);
      buttonBg.fillRoundedRect(-140, -35, 280, 70, 10);
      buttonBg.lineStyle(3, 0x76ff03);
      buttonBg.strokeRoundedRect(-140, -35, 280, 70, 10);
      buttonBg.lineStyle(2, 0x76ff03, 0.5);
      buttonBg.strokeRoundedRect(-144, -39, 288, 78, 14);
      buttonText.setColor("#76FF03");

      this.tweens.add({
        targets: buttonContainer,
        scale: 1.0,
        duration: 100,
      });
    });

    buttonContainer.on("pointerdown", () => {
      this.tweens.add({
        targets: buttonContainer,
        scale: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => {
          this.scene.start("Puzzle1");
        },
      });
    });
  }

  createCyberGrid() {
    const graphics = this.add.graphics();

    // Moving Grid Floor
    graphics.lineStyle(2, 0xd500f9, 0.3); // Purple grid

    // Perspective lines
    for (let i = -1000; i <= 2000; i += 150) {
      graphics.moveTo(500, 250);
      graphics.lineTo(i, 500);
    }

    // Horizontal lines (Static for now, could animate)
    for (let y = 250; y <= 500; y += 30) {
      graphics.moveTo(0, y);
      graphics.lineTo(1000, y);
    }

    graphics.strokePath();

    // Random Digital Particles in background
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 1000);
      const y = Phaser.Math.Between(0, 500);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
      this.add.rectangle(x, y, size, size, 0x00e5ff, alpha);
    }
  }

  createHolographicIcon(x, y) {
    const container = this.add.container(x, y);

    const gfx = this.add.graphics();

    // Headset Outline
    gfx.lineStyle(4, 0x00e5ff);
    gfx.strokeRoundedRect(-60, -30, 120, 60, 10);
    gfx.strokeCircle(0, 0, 20); // Lens center

    // Rays
    gfx.lineStyle(2, 0x00e5ff, 0.5);
    gfx.beginPath();
    gfx.moveTo(-70, 0);
    gfx.lineTo(-90, 0);
    gfx.moveTo(70, 0);
    gfx.lineTo(90, 0);
    gfx.strokePath();

    // Glow
    const glow = this.add.circle(0, 0, 80, 0x00e5ff, 0.1);

    container.add([glow, gfx]);

    // Float Animation
    this.tweens.add({
      targets: container,
      y: y - 20,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Rotate Animation (3D-ish feel)
    this.tweens.add({
      targets: container,
      scaleX: 0.8,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
