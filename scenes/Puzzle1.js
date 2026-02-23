class Puzzle1 extends Phaser.Scene {
  constructor() {
    super("Puzzle1");
  }

  preload() {
    this.load.audio("bgm", "musica1.mp3");
    this.load.image("logo", "roblogo.png");
  }

  create() {
    createParticleTexture(this);

    // Music (Managed by AudioManager)
    if (typeof AudioManager !== "undefined") {
      this.audioManager = new AudioManager(this, "bgm", {
        defaultVolume: 0.3,
        primaryColor: 0x00e676,
        secondaryColor: 0x263238,
      });
    } else {
      // Fallback
      if (!this.sound.get("bgm")) {
        const music = this.sound.add("bgm", { loop: true, volume: 0.3 });
        music.play();
      }
    }

    // --- Background: Tech Workbench ---
    this.createBackground();

    // --- Controllers (Left & Right) ---
    // We'll draw them with more detail
    this.leftController = this.createController(300, 250, "L");
    this.rightController = this.createController(700, 250, "R");

    // --- Battery Slots (Hit Areas) ---
    this.slots = [
      { x: 300, y: 320, filled: false, controller: this.leftController },
      { x: 700, y: 320, filled: false, controller: this.rightController },
    ];

    // Draw Open Battery Compartments
    this.slots.forEach((slot) => {
      this.createBatterySlotVisual(slot.x, slot.y);
    });

    // --- Batteries (Draggable) ---
    this.batteries = [];
    this.createBattery(500, 420);
    this.createBattery(600, 420);

    // --- Hint Hand ---
    this.handHint = this.add
      .text(500, 420, "👆🏻", { fontSize: "80px" })
      .setOrigin(0.5);
    this.tweens.add({
      targets: this.handHint,
      y: 320,
      x: 300,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      hold: 500,
    });

    // --- Drag Events ---
    this.input.on("dragstart", (pointer, gameObject) => {
      this.handHint.setVisible(false);
      this.children.bringToTop(gameObject);

      // Scale up slightly when picked up
      this.tweens.add({
        targets: gameObject,
        scale: 1.1,
        duration: 100,
      });
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("dragend", (pointer, gameObject) => {
      // Scale back down
      this.tweens.add({
        targets: gameObject,
        scale: 1.0,
        duration: 100,
      });

      let placed = false;

      // Check distance to slots
      for (let slot of this.slots) {
        if (!slot.filled) {
          const dist = Phaser.Math.Distance.Between(
            gameObject.x,
            gameObject.y,
            slot.x,
            slot.y,
          );
          if (dist < 60) {
            // Snap to slot
            gameObject.x = slot.x;
            gameObject.y = slot.y;
            gameObject.disableInteractive();
            slot.filled = true;
            placed = true;

            // Visual feedback: Flash slot
            const flash = this.add.circle(slot.x, slot.y, 40, 0x00ff00, 0.5);
            this.tweens.add({
              targets: flash,
              alpha: 0,
              scale: 2,
              duration: 500,
              onComplete: () => flash.destroy(),
            });

            // Play click sound simulation (visual shake)
            this.cameras.main.shake(100, 0.005);

            break;
          }
        }
      }

      if (!placed) {
        // Return to start
        this.tweens.add({
          targets: gameObject,
          x: gameObject.getData("startX"),
          y: gameObject.getData("startY"),
          duration: 300,
          ease: "Back.out",
        });
      } else {
        this.checkWin();
      }
    });
  }

  createBackground() {
    // Table surface
    this.add.rectangle(500, 250, 1000, 500, 0x263238); // Dark Slate

    // Grid mat pattern
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x37474f, 0.5);

    for (let i = 0; i < 1000; i += 50) {
      graphics.moveTo(i, 0);
      graphics.lineTo(i, 500);
    }
    for (let i = 0; i < 500; i += 50) {
      graphics.moveTo(0, i);
      graphics.lineTo(1000, i);
    }
    graphics.strokePath();

    // Title
    this.add
      .text(500, 50, "🔋 PREPARA TUS MANDOS", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }

  createController(x, y, side) {
    const container = this.add.container(x, y);

    const gfx = this.add.graphics();

    // --- Handle (Ergonomic Shape) ---
    gfx.fillStyle(0x424242, 1);
    // Main grip
    gfx.fillRoundedRect(-30, -40, 60, 140, 25);

    // Top Ring (Tracking Ring)
    gfx.lineStyle(12, 0x212121, 1);
    gfx.strokeCircle(0, -50, 55);

    // Faceplate
    gfx.fillStyle(0x000000, 1);
    gfx.fillCircle(0, -30, 35);

    // --- Buttons & Stick ---
    // Joystick
    gfx.fillStyle(0x212121, 1);
    gfx.fillCircle(0, -30, 18); // Stick base
    gfx.fillStyle(0x151515, 1);
    gfx.fillCircle(0, -30, 14); // Stick top
    gfx.lineStyle(2, 0x424242);
    gfx.strokeCircle(0, -30, 14);

    // Buttons (A/B or X/Y)
    gfx.fillStyle(0x757575, 1);
    const btnOffset = side === "L" ? -1 : 1;

    // Button 1
    gfx.fillCircle(15 * btnOffset, -10, 8);
    // Button 2
    gfx.fillCircle(5 * btnOffset, 10, 8);

    // Menu Button
    gfx.fillStyle(0x555555, 1);
    gfx.fillCircle(-10 * btnOffset, 10, 5);

    // --- Highlights/Shading ---
    gfx.lineStyle(2, 0x616161, 0.5);
    gfx.beginPath();
    gfx.moveTo(-20, -20);
    gfx.lineTo(-20, 80);
    gfx.strokePath();

    container.add(gfx);

    // Side Label
    const text = this.add
      .text(0, 80, side, {
        fontSize: "20px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    container.add(text);

    return container;
  }

  createBatterySlotVisual(x, y) {
    // The empty slot inside the controller handle
    const gfx = this.add.graphics();

    // Dark recess
    gfx.fillStyle(0x000000, 0.8);
    gfx.fillRoundedRect(x - 18, y - 45, 36, 90, 8);

    // Contacts
    gfx.fillStyle(0xc0c0c0, 1);
    gfx.fillRect(x - 10, y - 42, 20, 5); // Top contact
    gfx.fillStyle(0xdaa520, 1); // Gold spring
    gfx.fillRect(x - 10, y + 35, 20, 5); // Bottom contact

    // Outline
    gfx.lineStyle(2, 0x616161);
    gfx.strokeRoundedRect(x - 18, y - 45, 36, 90, 8);
  }

  createBattery(x, y) {
    const container = this.add.container(x, y);
    container.setData("startX", x);
    container.setData("startY", y);

    const gfx = this.add.graphics();

    // --- Body (Cylinder look) ---
    // Main yellow body
    gfx.fillStyle(0xffd600, 1);
    gfx.fillRoundedRect(-15, -35, 30, 70, 4);

    // Metallic Top (+)
    gfx.fillStyle(0xbdbdbd, 1);
    gfx.fillRect(-8, -40, 16, 5);
    gfx.fillRoundedRect(-15, -35, 30, 10, 2); // Cap rim

    // Metallic Bottom (-)
    gfx.fillRoundedRect(-15, 25, 30, 10, 2);

    // Black Branding Stripe
    gfx.fillStyle(0x000000, 1);
    gfx.fillRect(-15, -15, 30, 30);

    // Text
    const label = this.add
      .text(0, 0, "VOLT", {
        fontSize: "12px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Shine/Highlight (Cylinder effect)
    gfx.fillStyle(0xffffff, 0.3);
    gfx.fillRect(-10, -35, 5, 70);

    container.add([gfx, label]);
    container.setSize(40, 80);

    container.setInteractive({ draggable: true, cursor: "pointer" });
    this.input.setDraggable(container);

    this.batteries.push(container);
    return container;
  }

  checkWin() {
    const allFilled = this.slots.every((slot) => slot.filled);
    if (allFilled) {
      this.success();
    }
  }

  success() {
    // Particles
    const particles = this.add.particles("star");
    particles.createEmitter({
      x: 500,
      y: 250,
      speed: { min: 100, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      blendMode: "ADD",
      lifespan: 1500,
      quantity: 40,
      gravityY: 200,
    });

    // "Ready" Text
    const text = this.add
      .text(500, 250, "¡LISTOS!", {
        fontSize: "80px",
        fontStyle: "bold",
        color: "#00E676",
        stroke: "#FFFFFF",
        strokeThickness: 6,
        shadow: { offsetX: 4, offsetY: 4, color: "#000", blur: 4, fill: true },
      })
      .setOrigin(0.5)
      .setScale(0);

    this.tweens.add({
      targets: text,
      scale: 1,
      ease: "Back.out",
      duration: 500,
    });

    // Controller lights turn on (LEDs)
    this.slots.forEach((slot) => {
      const light = this.add.circle(slot.x, slot.y - 80, 8, 0x00ff00);
      light.setStrokeStyle(2, 0xffffff);

      // Glow
      const glow = this.add.circle(slot.x, slot.y - 80, 15, 0x00ff00, 0.4);

      this.tweens.add({
        targets: glow,
        alpha: 0.1,
        yoyo: true,
        repeat: -1,
        duration: 600,
      });
    });

    this.time.delayedCall(3000, () => {
      this.scene.start("Puzzle2");
    });
  }
}
