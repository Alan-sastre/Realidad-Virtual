function createParticleTexture(scene) {
    if (!scene.textures.exists('star')) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xFFFF00, 1);
        
        // Draw star manually
        graphics.beginPath();
        graphics.moveTo(16, 0);
        graphics.lineTo(20, 10);
        graphics.lineTo(32, 10);
        graphics.lineTo(22, 18);
        graphics.lineTo(26, 30);
        graphics.lineTo(16, 22);
        graphics.lineTo(6, 30);
        graphics.lineTo(10, 18);
        graphics.lineTo(0, 10);
        graphics.lineTo(12, 10);
        graphics.closePath();
        graphics.fillPath();
        
        graphics.generateTexture('star', 32, 32);
    }
}
