import Phaser from 'phaser';

export default class MahjongScene extends Phaser.Scene {
  constructor() {
    super('MahjongScene');
    this.tiles = [];
    this.selected = null;
    this.matches = 0;
    this.totalPairs = 18;
    this.score = 0;
  }

  preload() {
    // Generate tile graphics programmatically (no external assets needed)
    this.generateTileTextures();
  }

  generateTileTextures() {
    const tileTypes = ['bamboo', 'circle', 'character', 'wind', 'dragon', 'flower'];
    const colors = {
      bamboo: 0x2d5f2e,
      circle: 0x4a90e2,
      character: 0xe74c3c,
      wind: 0xf39c12,
      dragon: 0x9b59b6,
      flower: 0xe91e63
    };

    tileTypes.forEach((type, idx) => {
      for (let i = 1; i <= 3; i++) {
        const graphics = this.add.graphics();
        
        // Tile background
        graphics.fillStyle(0xfff8dc, 1);
        graphics.fillRoundedRect(0, 0, 60, 80, 4);
        graphics.lineStyle(2, 0x8b7355, 1);
        graphics.strokeRoundedRect(0, 0, 60, 80, 4);

        // Symbol
        graphics.fillStyle(colors[type], 1);
        graphics.fillCircle(30, 30, 15);
        
        // Number or symbol
        graphics.fillStyle(0xffffff, 1);
        const text = this.add.text(30, 30, i, {
          fontSize: '20px',
          fontFamily: 'Arial',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        // Pattern indicator
        graphics.fillStyle(colors[type], 0.3);
        graphics.fillRect(5, 55, 50, 20);

        graphics.generateTexture(`tile_${type}_${i}`, 60, 80);
        text.destroy();
        graphics.destroy();
      }
    });
  }

  create() {
    // Background
    this.add.rectangle(600, 400, 1200, 800, 0x1a5f3e);
    
    // Title
    this.add.text(600, 40, 'RMAX MAHJONG', {
      fontSize: '42px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(100, 100, 'Matches: 0 / 18', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    this.timerText = this.add.text(1100, 100, 'Time: 0s', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(1, 0);

    this.startTime = Date.now();
    
    // Create tiles
    this.createTileGrid();

    // Timer
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  createTileGrid() {
    const tileTypes = ['bamboo', 'circle', 'character', 'wind', 'dragon', 'flower'];
    const tiles = [];

    // Create pairs
    for (let i = 0; i < this.totalPairs; i++) {
      const type = tileTypes[Math.floor(i / 3) % tileTypes.length];
      const num = (i % 3) + 1;
      const key = `tile_${type}_${num}`;
      tiles.push(key, key);
    }

    // Shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Layout in grid (6 columns x 12 rows)
    const cols = 6;
    const rows = 6;
    const startX = 400;
    const startY = 200;
    const gapX = 80;
    const gapY = 100;

    tiles.forEach((key, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      const tile = this.add.image(
        startX + col * gapX,
        startY + row * gapY,
        key
      ).setInteractive();

      tile.setData('tileKey', key);
      tile.setData('matched', false);

      tile.on('pointerdown', () => this.onTileClick(tile));
      tile.on('pointerover', () => {
        if (!tile.getData('matched')) {
          tile.setScale(1.1);
        }
      });
      tile.on('pointerout', () => tile.setScale(1));

      this.tiles.push(tile);
    });
  }

  onTileClick(tile) {
    if (tile.getData('matched')) return;

    if (!this.selected) {
      this.selected = tile;
      tile.setTint(0xffff00);
    } else {
      if (this.selected === tile) {
        this.selected.clearTint();
        this.selected = null;
        return;
      }

      const key1 = this.selected.getData('tileKey');
      const key2 = tile.getData('tileKey');

      if (key1 === key2) {
        // Match found
        this.selected.setData('matched', true);
        tile.setData('matched', true);
        
        this.tweens.add({
          targets: [this.selected, tile],
          alpha: 0,
          scale: 0.5,
          duration: 300,
          onComplete: () => {
            this.selected.destroy();
            tile.destroy();
          }
        });

        this.matches++;
        this.scoreText.setText(`Matches: ${this.matches} / ${this.totalPairs}`);

        if (this.matches === this.totalPairs) {
          this.gameWin();
        }
      } else {
        // No match
        this.selected.clearTint();
        tile.setTint(0xff0000);
        
        this.time.delayedCall(500, () => {
          tile.clearTint();
        });
      }

      this.selected.clearTint();
      this.selected = null;
    }
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.timerText.setText(`Time: ${elapsed}s`);

    // Time limit: 180 seconds (3 minutes)
    if (elapsed >= 180 && this.matches < this.totalPairs) {
      this.gameLose();
    }
  }

  gameWin() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const timeBonus = Math.max(0, 180 - elapsed);
    const winAmount = this.matches * 500 + timeBonus * 10;

    this.add.rectangle(600, 400, 1200, 800, 0x000000, 0.7);
    this.add.text(600, 300, 'YOU WIN!', {
      fontSize: '72px',
      fontFamily: 'Arial Black',
      color: '#00ff00',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(600, 400, `+Rp ${(winAmount / 100).toLocaleString('id-ID')}`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      this.game.events.emit('game-end', { status: 'WON', winAmount });
    });
  }

  gameLose() {
    this.add.rectangle(600, 400, 1200, 800, 0x000000, 0.7);
    this.add.text(600, 350, 'TIME UP!', {
      fontSize: '72px',
      fontFamily: 'Arial Black',
      color: '#ff0000',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(600, 450, 'Better luck next time', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      this.game.events.emit('game-end', { status: 'LOST', winAmount: 0 });
    });
  }
}
