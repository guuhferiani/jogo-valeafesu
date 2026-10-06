/**
 * Stardew Valley Web Prototype - Sprite & Pixel Art Generator
 * Generates crisp 16x16, 32x32, and large building pixel art sprites on offscreen canvases.
 */

class SpriteManager {
    constructor() {
        this.cache = {};
        this.tileSize = 16;
        this.scale = 3; // Render scale for crisp retro look
        this.initAllSprites();
    }

    createCanvas(w, h) {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas, ctx };
    }

    initAllSprites() {
        this.generateTerrainTiles();
        this.generateNatureSprites();
        this.generateFarmhouse();
        this.generateBarn();
        this.generateShippingBin();
        this.generateCropSprites();
        this.generateAnimalSprites();
        this.generateFarmerSprites();
        this.generateItemIcons();
    }

    // TERRAIN TILES (16x16)
    generateTerrainTiles() {
        // 1. Grass
        const { canvas: grassCanvas, ctx: gCtx } = this.createCanvas(16, 16);
        gCtx.fillStyle = '#5cae38'; // vibrant lush green
        gCtx.fillRect(0, 0, 16, 16);
        // darker grass patches
        gCtx.fillStyle = '#4c962b';
        gCtx.fillRect(2, 3, 2, 1);
        gCtx.fillRect(8, 7, 2, 1);
        gCtx.fillRect(12, 2, 1, 2);
        gCtx.fillRect(4, 12, 2, 1);
        gCtx.fillRect(10, 13, 2, 1);
        // lighter grass blades
        gCtx.fillStyle = '#71c646';
        gCtx.fillRect(3, 2, 1, 2);
        gCtx.fillRect(9, 6, 1, 2);
        gCtx.fillRect(13, 11, 1, 2);
        gCtx.fillRect(5, 11, 1, 1);
        // tiny flower specks
        gCtx.fillStyle = '#fce46d';
        gCtx.fillRect(6, 4, 1, 1);
        gCtx.fillStyle = '#ffffff';
        gCtx.fillRect(14, 8, 1, 1);
        this.cache['tile_grass'] = grassCanvas;

        // 2. Dirt (Path)
        const { canvas: pathCanvas, ctx: pCtx } = this.createCanvas(16, 16);
        pCtx.fillStyle = '#c89d5f';
        pCtx.fillRect(0, 0, 16, 16);
        pCtx.fillStyle = '#b3884d';
        pCtx.fillRect(2, 4, 3, 2);
        pCtx.fillRect(10, 8, 2, 2);
        pCtx.fillRect(6, 12, 3, 1);
        pCtx.fillStyle = '#d9b275';
        pCtx.fillRect(3, 2, 2, 1);
        pCtx.fillRect(11, 6, 2, 1);
        pCtx.fillStyle = '#8f6838'; // pebble
        pCtx.fillRect(4, 9, 1, 1);
        pCtx.fillRect(12, 13, 1, 1);
        this.cache['tile_path'] = pathCanvas;

        // 3. Tilled Soil (Dry)
        const { canvas: drySoil, ctx: dsCtx } = this.createCanvas(16, 16);
        dsCtx.fillStyle = '#5c381e'; // outer ridge shadow
        dsCtx.fillRect(0, 0, 16, 16);
        dsCtx.fillStyle = '#84532b'; // furrow base
        dsCtx.fillRect(1, 1, 14, 14);
        dsCtx.fillStyle = '#9e6737'; // mound highlights
        dsCtx.fillRect(2, 3, 12, 2);
        dsCtx.fillRect(2, 7, 12, 2);
        dsCtx.fillRect(2, 11, 12, 2);
        dsCtx.fillStyle = '#4a2c14'; // furrow troughs
        dsCtx.fillRect(2, 5, 12, 2);
        dsCtx.fillRect(2, 9, 12, 2);
        this.cache['tile_tilled_dry'] = drySoil;

        // 4. Tilled Soil (Watered - Deep rich dark wet mud with shine)
        const { canvas: wetSoil, ctx: wsCtx } = this.createCanvas(16, 16);
        wsCtx.fillStyle = '#321d10';
        wsCtx.fillRect(0, 0, 16, 16);
        wsCtx.fillStyle = '#4c2e17';
        wsCtx.fillRect(1, 1, 14, 14);
        wsCtx.fillStyle = '#633e20';
        wsCtx.fillRect(2, 3, 12, 2);
        wsCtx.fillRect(2, 7, 12, 2);
        wsCtx.fillRect(2, 11, 12, 2);
        wsCtx.fillStyle = '#26140a';
        wsCtx.fillRect(2, 5, 12, 2);
        wsCtx.fillRect(2, 9, 12, 2);
        // Water glistening specks
        wsCtx.fillStyle = '#8cb4d2';
        wsCtx.fillRect(4, 4, 1, 1);
        wsCtx.fillRect(10, 8, 1, 1);
        wsCtx.fillRect(6, 12, 1, 1);
        this.cache['tile_tilled_wet'] = wetSoil;

        // 5. Water Tile
        const { canvas: waterCanvas, ctx: wCtx } = this.createCanvas(16, 16);
        wCtx.fillStyle = '#3288b8';
        wCtx.fillRect(0, 0, 16, 16);
        wCtx.fillStyle = '#256d94';
        wCtx.fillRect(0, 0, 16, 3);
        wCtx.fillRect(0, 8, 16, 2);
        wCtx.fillStyle = '#4ba7db';
        wCtx.fillRect(3, 4, 4, 1);
        wCtx.fillRect(10, 11, 5, 1);
        wCtx.fillStyle = '#b3e3fa';
        wCtx.fillRect(4, 5, 2, 1);
        wCtx.fillRect(11, 12, 2, 1);
        this.cache['tile_water'] = waterCanvas;

        // 6. Wooden Fence (16x16)
        const { canvas: fenceCanvas, ctx: fCtx } = this.createCanvas(16, 16);
        // Post
        fCtx.fillStyle = '#4d2a12'; // outline
        fCtx.fillRect(6, 2, 4, 14);
        fCtx.fillStyle = '#9e6230'; // wood base
        fCtx.fillRect(7, 3, 2, 13);
        fCtx.fillStyle = '#be7b41'; // wood highlight
        fCtx.fillRect(7, 3, 1, 12);
        // Rails
        fCtx.fillStyle = '#4d2a12';
        fCtx.fillRect(0, 4, 16, 3);
        fCtx.fillRect(0, 10, 16, 3);
        fCtx.fillStyle = '#9e6230';
        fCtx.fillRect(0, 5, 16, 1);
        fCtx.fillRect(0, 11, 16, 1);
        fCtx.fillStyle = '#c78546';
        fCtx.fillRect(0, 5, 16, 1);
        this.cache['obj_fence'] = fenceCanvas;
    }

    // NATURE SPRITES (Trees, Rocks, Weeds)
    generateNatureSprites() {
        // 1. Oak Tree (32x48)
        const { canvas: oakCanvas, ctx: oCtx } = this.createCanvas(32, 48);
        // Trunk
        oCtx.fillStyle = '#462b16';
        oCtx.fillRect(12, 28, 8, 18);
        oCtx.fillStyle = '#82522c';
        oCtx.fillRect(14, 28, 4, 17);
        oCtx.fillStyle = '#a16839';
        oCtx.fillRect(14, 28, 1, 16);
        // Foliage base shadows
        oCtx.fillStyle = '#22551a';
        oCtx.beginPath();
        oCtx.arc(16, 18, 15, 0, Math.PI * 2);
        oCtx.fill();
        // Foliage middle green
        oCtx.fillStyle = '#3c882b';
        oCtx.beginPath();
        oCtx.arc(15, 16, 13, 0, Math.PI * 2);
        oCtx.fill();
        // Foliage highlights
        oCtx.fillStyle = '#5eb83f';
        oCtx.beginPath();
        oCtx.arc(13, 13, 10, 0, Math.PI * 2);
        oCtx.fill();
        oCtx.fillStyle = '#80d85a';
        oCtx.beginPath();
        oCtx.arc(11, 11, 5, 0, Math.PI * 2);
        oCtx.fill();
        this.cache['obj_tree_oak'] = oakCanvas;

        // 2. Pine Tree (32x48)
        const { canvas: pineCanvas, ctx: piCtx } = this.createCanvas(32, 48);
        // Trunk
        piCtx.fillStyle = '#462b16';
        piCtx.fillRect(13, 34, 6, 12);
        piCtx.fillStyle = '#7a4b27';
        piCtx.fillRect(14, 34, 4, 11);
        // Layered pine cones (3 layers)
        const drawPineLayer = (cy, rw, rh) => {
            piCtx.fillStyle = '#184724';
            piCtx.beginPath();
            piCtx.moveTo(16, cy - rh);
            piCtx.lineTo(16 - rw, cy + rh);
            piCtx.lineTo(16 + rw, cy + rh);
            piCtx.closePath();
            piCtx.fill();

            piCtx.fillStyle = '#2d6d3c';
            piCtx.beginPath();
            piCtx.moveTo(16, cy - rh + 2);
            piCtx.lineTo(16 - rw + 3, cy + rh - 1);
            piCtx.lineTo(16 + rw - 3, cy + rh - 1);
            piCtx.closePath();
            piCtx.fill();

            piCtx.fillStyle = '#48965c';
            piCtx.beginPath();
            piCtx.moveTo(15, cy - rh + 3);
            piCtx.lineTo(16 - rw + 4, cy + rh - 3);
            piCtx.lineTo(16, cy + rh - 3);
            piCtx.closePath();
            piCtx.fill();
        };
        drawPineLayer(30, 14, 8);
        drawPineLayer(20, 12, 7);
        drawPineLayer(10, 9, 6);
        this.cache['obj_tree_pine'] = pineCanvas;

        // 3. Rock / Boulder (16x16)
        const { canvas: rockCanvas, ctx: rCtx } = this.createCanvas(16, 16);
        rCtx.fillStyle = '#404552';
        rCtx.beginPath();
        rCtx.ellipse(8, 9, 6, 5, 0, 0, Math.PI * 2);
        rCtx.fill();
        rCtx.fillStyle = '#7b8396';
        rCtx.beginPath();
        rCtx.ellipse(7, 8, 5, 4, 0, 0, Math.PI * 2);
        rCtx.fill();
        rCtx.fillStyle = '#a6afc2';
        rCtx.fillRect(5, 6, 3, 2);
        this.cache['obj_rock'] = rockCanvas;

        // 4. Weed / Grass clump (16x16)
        const { canvas: weedCanvas, ctx: wdCtx } = this.createCanvas(16, 16);
        wdCtx.fillStyle = '#387820';
        wdCtx.fillRect(3, 8, 3, 7);
        wdCtx.fillRect(7, 5, 3, 10);
        wdCtx.fillRect(11, 7, 3, 8);
        wdCtx.fillStyle = '#5eb834';
        wdCtx.fillRect(4, 7, 1, 5);
        wdCtx.fillRect(8, 4, 1, 8);
        wdCtx.fillRect(12, 6, 1, 6);
        this.cache['obj_weed'] = weedCanvas;

        // 5. Wood Log / Stump (16x16)
        const { canvas: logCanvas, ctx: lCtx } = this.createCanvas(16, 16);
        lCtx.fillStyle = '#3d240f';
        lCtx.fillRect(3, 5, 10, 8);
        lCtx.fillStyle = '#7a4a22';
        lCtx.fillRect(4, 6, 8, 6);
        lCtx.fillStyle = '#d49b65'; // wood rings inside
        lCtx.fillRect(5, 7, 6, 4);
        lCtx.fillStyle = '#a87442';
        lCtx.fillRect(7, 8, 2, 2);
        this.cache['obj_log'] = logCanvas;
    }

    // STARDEW VALLEY FARMHOUSE (ENLARGED 96x80 - 6x5 Tiles)
    generateFarmhouse() {
        const { canvas, ctx } = this.createCanvas(96, 80);
        
        // 1. Chimney on right side (Stone/brick with terracotta cap)
        ctx.fillStyle = '#4a2316';
        ctx.fillRect(68, 5, 14, 25);
        ctx.fillStyle = '#9e462d';
        ctx.fillRect(69, 6, 12, 23);
        // Mortar brick lines
        ctx.fillStyle = '#d27d65';
        for (let y = 10; y <= 24; y += 4) {
            ctx.fillRect(69, y, 12, 1);
        }
        // Chimney rim
        ctx.fillStyle = '#3a1b10';
        ctx.fillRect(67, 3, 16, 4);
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(68, 4, 14, 2);
        // Chimney weathervane
        ctx.fillStyle = '#222';
        ctx.fillRect(74, 0, 2, 4);
        ctx.fillStyle = '#ffd147';
        ctx.fillRect(73, 0, 4, 2);

        // 2. Terracotta Shingled Roof (width: 92px)
        // Roof dark shadow triangle
        ctx.fillStyle = '#7a2512';
        ctx.beginPath();
        ctx.moveTo(48, 10);
        ctx.lineTo(3, 44);
        ctx.lineTo(93, 44);
        ctx.closePath();
        ctx.fill();

        // Roof warm terracotta base
        ctx.fillStyle = '#c84b25';
        ctx.beginPath();
        ctx.moveTo(48, 12);
        ctx.lineTo(6, 43);
        ctx.lineTo(90, 43);
        ctx.closePath();
        ctx.fill();

        // Roof shingles texture rows
        ctx.fillStyle = '#e26b3e';
        for (let y = 16; y < 42; y += 4) {
            const spread = (y - 10) * 1.85;
            for (let x = 48 - spread; x < 48 + spread; x += 6) {
                if (x > 8 && x < 88) {
                    ctx.fillRect(Math.floor(x), y, 5, 2);
                }
            }
        }

        // Roof eave overhang trim
        ctx.fillStyle = '#4a2512';
        ctx.fillRect(2, 43, 92, 3);
        ctx.fillStyle = '#783b1a';
        ctx.fillRect(4, 44, 88, 1);

        // 3. Main Wall Structure (Warm rustic wooden planks)
        ctx.fillStyle = '#3d2010'; // outline
        ctx.fillRect(8, 45, 80, 29);
        ctx.fillStyle = '#8f5b32'; // wood fill
        ctx.fillRect(10, 46, 76, 27);

        // Horizontal wood log plank lines
        ctx.fillStyle = '#6e4321';
        for (let y = 51; y < 73; y += 5) {
            ctx.fillRect(10, y, 76, 1);
        }

        // Heavy vertical timber corner posts
        ctx.fillStyle = '#542e14';
        ctx.fillRect(8, 45, 6, 29);
        ctx.fillRect(82, 45, 6, 29);
        ctx.fillStyle = '#7a421b';
        ctx.fillRect(10, 46, 2, 28);
        ctx.fillRect(84, 46, 2, 28);

        // 4. Cobblestone Foundation Base
        ctx.fillStyle = '#4d5561';
        ctx.fillRect(7, 74, 82, 6);
        ctx.fillStyle = '#828c9b';
        ctx.fillRect(9, 75, 78, 4);
        // Stone texture highlights
        ctx.fillStyle = '#a9b4c4';
        ctx.fillRect(12, 76, 5, 2);
        ctx.fillRect(24, 75, 6, 2);
        ctx.fillRect(42, 76, 5, 2);
        ctx.fillRect(64, 75, 7, 2);
        ctx.fillRect(78, 76, 5, 2);

        // 5. Entrance Porch Awning & Door
        // Awning roof over door
        ctx.fillStyle = '#592911';
        ctx.fillRect(36, 47, 24, 4);
        ctx.fillStyle = '#8e431e';
        ctx.fillRect(38, 48, 20, 2);

        // Wooden Door frame & leaf (fits 24px player!)
        ctx.fillStyle = '#30180a';
        ctx.fillRect(40, 51, 16, 23);
        ctx.fillStyle = '#6b3c1b';
        ctx.fillRect(41, 52, 14, 22);
        // Door panels
        ctx.fillStyle = '#8f5227';
        ctx.fillRect(43, 54, 10, 8);
        ctx.fillRect(43, 64, 10, 8);
        // Brass doorknob
        ctx.fillStyle = '#ffd147';
        ctx.fillRect(51, 62, 2, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(51, 62, 1, 1);

        // "Bem-Vindo" red doormat
        ctx.fillStyle = '#8f2f21';
        ctx.fillRect(38, 75, 20, 4);
        ctx.fillStyle = '#c74936';
        ctx.fillRect(40, 76, 16, 2);

        // 6. Left Window with flower box
        ctx.fillStyle = '#30180a';
        ctx.fillRect(18, 52, 16, 14);
        ctx.fillStyle = '#ffeaa7'; // glowing warm light
        ctx.fillRect(20, 54, 12, 10);
        // Window mullions
        ctx.fillStyle = '#5c3316';
        ctx.fillRect(25, 54, 2, 10);
        ctx.fillRect(20, 58, 12, 2);
        // Flower box
        ctx.fillStyle = '#7a421b';
        ctx.fillRect(17, 65, 18, 4);
        ctx.fillStyle = '#e84393';
        ctx.fillRect(19, 64, 3, 2);
        ctx.fillStyle = '#fdcb6e';
        ctx.fillRect(24, 64, 3, 2);
        ctx.fillStyle = '#00b894';
        ctx.fillRect(29, 64, 3, 2);

        // 7. Right Double Window with flower box
        ctx.fillStyle = '#30180a';
        ctx.fillRect(62, 51, 18, 15);
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(64, 53, 14, 11);
        ctx.fillStyle = '#5c3316';
        ctx.fillRect(70, 53, 2, 11);
        ctx.fillRect(64, 58, 14, 2);
        // Flower box
        ctx.fillStyle = '#7a421b';
        ctx.fillRect(61, 65, 20, 4);
        ctx.fillStyle = '#ff7675';
        ctx.fillRect(63, 64, 4, 2);
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(69, 64, 4, 2);
        ctx.fillStyle = '#55efc4';
        ctx.fillRect(75, 64, 4, 2);

        // 8. Wall mounted iron lantern near door
        ctx.fillStyle = '#222';
        ctx.fillRect(57, 56, 3, 1);
        ctx.fillRect(58, 57, 3, 5);
        ctx.fillStyle = '#fdcb6e';
        ctx.fillRect(59, 58, 2, 3);

        this.cache['building_farmhouse'] = canvas;
    }

    // RUSTIC RED BARN (CELEIRO) WITH COVERED PORCH FOR THE SHIPPING CHEST (80x72 - 5x4.5 Tiles)
    generateBarn() {
        const { canvas, ctx } = this.createCanvas(80, 72);

        // 1. Barn Gambrel Roof (classic red barn double slope)
        // Dark roof base
        ctx.fillStyle = '#40130c';
        ctx.beginPath();
        ctx.moveTo(30, 4);
        ctx.lineTo(46, 12);
        ctx.lineTo(54, 32);
        ctx.lineTo(2, 32);
        ctx.lineTo(10, 12);
        ctx.closePath();
        ctx.fill();

        // Shingle fill
        ctx.fillStyle = '#7a2417';
        ctx.beginPath();
        ctx.moveTo(30, 6);
        ctx.lineTo(44, 13);
        ctx.lineTo(52, 31);
        ctx.lineTo(4, 31);
        ctx.lineTo(12, 13);
        ctx.closePath();
        ctx.fill();

        // Shingle details
        ctx.fillStyle = '#a63929';
        for (let y = 14; y < 30; y += 4) {
            ctx.fillRect(14, y, 28, 1);
        }

        // Weathervane on barn top
        ctx.fillStyle = '#222';
        ctx.fillRect(29, 0, 2, 5);
        ctx.fillStyle = '#f1c40f'; // golden rooster
        ctx.fillRect(27, 0, 6, 2);

        // 2. Red Barn Walls
        ctx.fillStyle = '#2d0e09';
        ctx.fillRect(6, 32, 44, 34);
        ctx.fillStyle = '#9e2b1b'; // rich barn red
        ctx.fillRect(8, 33, 40, 32);

        // Barn vertical wood siding planks
        ctx.fillStyle = '#781f12';
        for (let x = 12; x < 48; x += 4) {
            ctx.fillRect(x, 33, 1, 32);
        }

        // White Barn Sliding Doors with X-Brace
        ctx.fillStyle = '#f5f0e6';
        ctx.fillRect(16, 42, 24, 23);
        ctx.fillStyle = '#9e2b1b';
        ctx.fillRect(18, 44, 9, 19);
        ctx.fillRect(29, 44, 9, 19);
        // White "X" cross-brace
        ctx.fillStyle = '#f5f0e6';
        ctx.fillRect(19, 45, 7, 2);
        ctx.fillRect(19, 60, 7, 2);
        ctx.fillRect(22, 47, 2, 13);
        ctx.fillRect(30, 45, 7, 2);
        ctx.fillRect(30, 60, 7, 2);
        ctx.fillRect(33, 47, 2, 13);

        // Hayloft upper window with golden straw
        ctx.fillStyle = '#2d0e09';
        ctx.fillRect(24, 18, 12, 11);
        ctx.fillStyle = '#4a2512';
        ctx.fillRect(25, 19, 10, 9);
        // Golden straw spilling out
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(26, 24, 8, 4);
        ctx.fillRect(25, 27, 10, 2);

        // 3. COVERED CELEIRO PORCH FOR THE BAÚ (Right Annex)
        // Overhang roof
        ctx.fillStyle = '#40130c';
        ctx.fillRect(48, 28, 30, 4);
        ctx.fillStyle = '#7a2417';
        ctx.fillRect(50, 27, 28, 3);
        // Wooden support pillars
        ctx.fillStyle = '#4a2512';
        ctx.fillRect(75, 32, 3, 34);
        ctx.fillRect(52, 32, 2, 34);

        // Rustic wooden deck / platform where chest sits
        ctx.fillStyle = '#3a1f0e';
        ctx.fillRect(50, 64, 28, 6);
        ctx.fillStyle = '#8f5227';
        ctx.fillRect(51, 65, 26, 4);
        ctx.fillStyle = '#b06a38';
        ctx.fillRect(51, 65, 26, 1);

        // Hay bale on porch beside chest
        ctx.fillStyle = '#d4ac0d';
        ctx.fillRect(53, 53, 9, 11);
        ctx.fillStyle = '#f7dc6f';
        ctx.fillRect(54, 54, 7, 9);
        ctx.fillStyle = '#b7950b';
        ctx.fillRect(53, 56, 9, 1);
        ctx.fillRect(53, 60, 9, 1);

        // Wooden tool barrel
        ctx.fillStyle = '#5c3316';
        ctx.fillRect(72, 55, 6, 9);
        ctx.fillStyle = '#9e5a2c';
        ctx.fillRect(73, 56, 4, 7);
        ctx.fillStyle = '#222';
        ctx.fillRect(72, 57, 6, 1);
        ctx.fillRect(72, 61, 6, 1);

        // Hanging barn lantern
        ctx.fillStyle = '#222';
        ctx.fillRect(66, 31, 1, 4);
        ctx.fillRect(64, 35, 5, 5);
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(65, 36, 3, 3);

        this.cache['building_barn'] = canvas;
    }

    // SHIPPING BIN (32x24) - Iconic Stardew Chest
    generateShippingBin() {
        const { canvas, ctx } = this.createCanvas(32, 24);
        // Shadow base
        ctx.fillStyle = '#261408';
        ctx.fillRect(2, 6, 28, 16);
        // Main wooden chest body
        ctx.fillStyle = '#7a421e';
        ctx.fillRect(4, 7, 24, 14);
        // Wooden planks
        ctx.fillStyle = '#9e5a2c';
        ctx.fillRect(5, 8, 22, 5);
        ctx.fillRect(5, 14, 22, 6);
        // Curved wooden lid
        ctx.fillStyle = '#b56833';
        ctx.fillRect(3, 4, 26, 4);
        ctx.fillStyle = '#d48046';
        ctx.fillRect(5, 3, 22, 2);
        // Iron metal reinforcements & lock
        ctx.fillStyle = '#393c45';
        ctx.fillRect(8, 4, 3, 17);
        ctx.fillRect(21, 4, 3, 17);
        ctx.fillStyle = '#707787';
        ctx.fillRect(9, 5, 1, 15);
        ctx.fillRect(22, 5, 1, 15);
        // Golden lock latch
        ctx.fillStyle = '#e6a817';
        ctx.fillRect(14, 8, 4, 5);
        ctx.fillStyle = '#261408';
        ctx.fillRect(15, 10, 2, 2);

        this.cache['obj_shipping_bin'] = canvas;
    }

    // CROPS (4 Stages for Parsnip, Strawberry, Pumpkin, Corn)
    generateCropSprites() {
        const crops = ['parsnip', 'strawberry', 'pumpkin', 'corn'];

        crops.forEach(crop => {
            for (let stage = 1; stage <= 4; stage++) {
                const { canvas, ctx } = this.createCanvas(16, 16);

                if (stage === 1) {
                    // Stage 1: Sprout (all start as little green shoots)
                    ctx.fillStyle = '#4c8a2b';
                    ctx.fillRect(7, 10, 2, 4);
                    ctx.fillStyle = '#7ec84e';
                    ctx.fillRect(6, 9, 2, 2);
                    ctx.fillRect(8, 8, 2, 2);
                } else if (stage === 2) {
                    // Stage 2: Small growing plant
                    ctx.fillStyle = '#39701f';
                    ctx.fillRect(7, 8, 2, 6);
                    ctx.fillStyle = '#61b038';
                    ctx.fillRect(4, 7, 4, 3);
                    ctx.fillRect(8, 6, 4, 3);
                    ctx.fillStyle = '#8ee65a';
                    ctx.fillRect(5, 6, 2, 2);
                    ctx.fillRect(9, 5, 2, 2);
                } else if (stage === 3) {
                    // Stage 3: Bushy / flowering plant
                    ctx.fillStyle = '#2f6119';
                    ctx.fillRect(6, 6, 4, 8);
                    ctx.fillStyle = '#4fa32a';
                    ctx.fillRect(3, 5, 10, 6);
                    ctx.fillStyle = '#78cf48';
                    ctx.fillRect(4, 4, 8, 4);

                    if (crop === 'parsnip') {
                        // Top of root peeking
                        ctx.fillStyle = '#e3c68a';
                        ctx.fillRect(7, 11, 2, 2);
                    } else if (crop === 'strawberry') {
                        // White flowers
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(4, 5, 2, 2);
                        ctx.fillRect(10, 6, 2, 2);
                        ctx.fillStyle = '#ffd12b';
                        ctx.fillRect(5, 6, 1, 1);
                    } else if (crop === 'pumpkin') {
                        // Yellow blossom & small green bulb
                        ctx.fillStyle = '#68962f';
                        ctx.fillRect(6, 8, 4, 4);
                        ctx.fillStyle = '#f7d039';
                        ctx.fillRect(9, 6, 3, 3);
                    } else if (crop === 'corn') {
                        // Tall green stalk
                        ctx.fillStyle = '#3c7a20';
                        ctx.fillRect(7, 2, 2, 12);
                        ctx.fillStyle = '#6ab83e';
                        ctx.fillRect(4, 4, 8, 3);
                    }
                } else if (stage === 4) {
                    // Stage 4: FULLY RIPE AND READY TO HARVEST
                    if (crop === 'parsnip') {
                        // Parsnip foliage
                        ctx.fillStyle = '#4fa32a';
                        ctx.fillRect(4, 2, 8, 4);
                        ctx.fillStyle = '#7bd448';
                        ctx.fillRect(5, 1, 6, 3);
                        // Creamy golden parsnip root
                        ctx.fillStyle = '#a88243';
                        ctx.fillRect(5, 6, 6, 8);
                        ctx.fillStyle = '#ebd6a7';
                        ctx.fillRect(6, 6, 4, 7);
                        ctx.fillStyle = '#fff5de';
                        ctx.fillRect(6, 7, 2, 5);
                        ctx.fillStyle = '#ebd6a7';
                        ctx.fillRect(7, 13, 2, 2); // tip
                    } else if (crop === 'strawberry') {
                        // Strawberry leaves
                        ctx.fillStyle = '#34751f';
                        ctx.fillRect(3, 4, 10, 5);
                        ctx.fillStyle = '#54ad36';
                        ctx.fillRect(4, 3, 8, 4);
                        // Red strawberries (2-3 berries)
                        ctx.fillStyle = '#d92525';
                        ctx.fillRect(4, 8, 4, 4);
                        ctx.fillRect(9, 7, 4, 4);
                        ctx.fillStyle = '#ff4d4d';
                        ctx.fillRect(5, 8, 2, 2);
                        ctx.fillRect(10, 7, 2, 2);
                        // Yellow seeds
                        ctx.fillStyle = '#fff078';
                        ctx.fillRect(5, 10, 1, 1);
                        ctx.fillRect(11, 9, 1, 1);
                    } else if (crop === 'pumpkin') {
                        // Stem
                        ctx.fillStyle = '#4a7522';
                        ctx.fillRect(7, 3, 2, 3);
                        // Big plump orange pumpkin
                        ctx.fillStyle = '#ad470c';
                        ctx.fillRect(3, 6, 10, 8);
                        ctx.fillStyle = '#f07824';
                        ctx.fillRect(4, 6, 8, 8);
                        // Ribbed segments
                        ctx.fillStyle = '#ff9f4a';
                        ctx.fillRect(5, 7, 2, 6);
                        ctx.fillRect(9, 7, 2, 6);
                        ctx.fillStyle = '#c75914';
                        ctx.fillRect(7, 6, 2, 8);
                    } else if (crop === 'corn') {
                        // Tall green stalk
                        ctx.fillStyle = '#3c7a20';
                        ctx.fillRect(7, 0, 2, 15);
                        ctx.fillStyle = '#6ab83e';
                        ctx.fillRect(3, 3, 10, 3);
                        ctx.fillRect(4, 8, 8, 3);
                        // Yellow ear of corn in husk
                        ctx.fillStyle = '#d49817';
                        ctx.fillRect(6, 5, 4, 6);
                        ctx.fillStyle = '#ffd438';
                        ctx.fillRect(7, 5, 2, 5);
                        // Green husk wrapping
                        ctx.fillStyle = '#55a329';
                        ctx.fillRect(5, 7, 2, 5);
                        ctx.fillRect(9, 7, 2, 5);
                    }
                }

                this.cache[`crop_${crop}_${stage}`] = canvas;
            }
        });
    }

    // ANIMALS (Cute Stardew White Chicken & Brown Cow)
    // ANIMALS (Cute Stardew White Chicken & Brown Cow with Walking Animations)
    generateAnimalSprites() {
        // --- CHICKEN FRAMES (0: standing, 1: step left, 2: standing flapped, 3: step right, action: peck) ---
        const drawChicken = (frame) => {
            const { canvas, ctx } = this.createCanvas(16, 16);
            const bob = (frame === 1 || frame === 3) ? 1 : 0;
            const isPeck = frame === 'action';

            if (isPeck) {
                // Pecking animation (head down touching ground)
                ctx.fillStyle = '#c2c2c2'; // shadow body
                ctx.fillRect(3, 5, 8, 7);
                ctx.fillStyle = '#ffffff'; // body
                ctx.fillRect(3, 4, 7, 7);
                ctx.fillStyle = '#e8e8e8'; // wing tilted up
                ctx.fillRect(2, 5, 4, 4);
                // Head lowered
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(9, 7, 4, 5);
                ctx.fillStyle = '#f7b731'; // yellow beak touching ground
                ctx.fillRect(13, 11, 2, 2);
                ctx.fillStyle = '#d92525'; // red comb
                ctx.fillRect(10, 5, 3, 2);
                // Eye
                ctx.fillStyle = '#1e272e';
                ctx.fillRect(10, 8, 1, 1);
                // Legs
                ctx.fillStyle = '#f7b731';
                ctx.fillRect(4, 11, 2, 3);
                ctx.fillRect(7, 11, 2, 3);
                return canvas;
            }

            // Body shadow
            ctx.fillStyle = '#c2c2c2';
            ctx.fillRect(4, 5 + bob, 8, 7);
            // Body white
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(4, 4 + bob, 7, 7);
            // Wing
            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(frame === 2 ? 4 : 5, 6 + bob, 4, 4);
            // Red comb & wattle
            ctx.fillStyle = '#d92525';
            ctx.fillRect(8, 2 + bob, 3, 2);
            ctx.fillRect(11, 6 + bob, 2, 2);
            // Yellow beak
            ctx.fillStyle = '#f7b731';
            ctx.fillRect(12, 5 + bob, 2, 2);
            // Eye
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(9, 4 + bob, 1, 1);

            // Legs with alternating stride
            ctx.fillStyle = '#f7b731';
            if (frame === 1) {
                // Left leg forward, right leg back
                ctx.fillRect(4, 11, 2, 3);
                ctx.fillRect(8, 10, 2, 2);
            } else if (frame === 3) {
                // Right leg forward, left leg back
                ctx.fillRect(5, 10, 2, 2);
                ctx.fillRect(9, 11, 2, 3);
            } else {
                // Neutral standing
                ctx.fillRect(5, 11, 2, 3);
                ctx.fillRect(8, 11, 2, 3);
            }

            return canvas;
        };

        this.cache['animal_chicken_0'] = drawChicken(0);
        this.cache['animal_chicken_1'] = drawChicken(1);
        this.cache['animal_chicken_2'] = drawChicken(2);
        this.cache['animal_chicken_3'] = drawChicken(3);
        this.cache['animal_chicken_action'] = drawChicken('action');
        this.cache['animal_chicken'] = this.cache['animal_chicken_0'];

        // --- COW FRAMES (0: idle standing, 1: step A, 2: idle tail wag, 3: step B, action: graze) ---
        const drawCow = (frame) => {
            const { canvas, ctx } = this.createCanvas(32, 24);
            const isGraze = frame === 'action';
            const bob = (frame === 1 || frame === 3) ? 1 : 0;

            // Body base (warm brown)
            ctx.fillStyle = '#5c381c';
            ctx.fillRect(4, 6 + bob, 22, 12);
            ctx.fillStyle = '#9e673a';
            ctx.fillRect(5, 6 + bob, 20, 11);

            // White cow spots
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(8, 7 + bob, 6, 6);
            ctx.fillRect(17, 9 + bob, 5, 5);

            if (isGraze) {
                // Head lowered down grazing grass
                ctx.fillStyle = '#9e673a';
                ctx.fillRect(23, 9, 8, 9);
                ctx.fillStyle = '#f5a6b7'; // pink snout
                ctx.fillRect(27, 13, 5, 5);
                ctx.fillStyle = '#2d1808';
                ctx.fillRect(29, 15, 1, 1);
                // Horns
                ctx.fillStyle = '#ebd6a7';
                ctx.fillRect(24, 7, 2, 2);
                // Eye
                ctx.fillStyle = '#222';
                ctx.fillRect(26, 11, 1, 1);
            } else {
                // Normal head
                ctx.fillStyle = '#9e673a';
                ctx.fillRect(22, 5 + bob, 8, 9);
                // Snout (pink)
                ctx.fillStyle = '#f5a6b7';
                ctx.fillRect(26, 9 + bob, 5, 5);
                ctx.fillStyle = '#2d1808';
                ctx.fillRect(28, 11 + bob, 1, 1);
                // Horns
                ctx.fillStyle = '#ebd6a7';
                ctx.fillRect(23, 3 + bob, 2, 2);
                // Eye
                ctx.fillStyle = '#222';
                ctx.fillRect(25, 7 + bob, 1, 1);
            }

            // Tail
            ctx.fillStyle = '#7a4e28';
            if (frame === 2) {
                // Tail swished up
                ctx.fillRect(2, 6 + bob, 3, 2);
                ctx.fillRect(1, 7 + bob, 2, 4);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 10 + bob, 2, 2);
            } else {
                // Tail hanging down
                ctx.fillRect(3, 8 + bob, 2, 6);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(2, 13 + bob, 2, 2);
            }

            // Legs with true quadruped walk cycle
            ctx.fillStyle = '#4a2c14';
            if (frame === 1) {
                // Front-right & back-left forward
                ctx.fillRect(8, 17, 3, 5);
                ctx.fillRect(11, 16, 3, 4);
                ctx.fillRect(17, 16, 3, 4);
                ctx.fillRect(23, 17, 3, 5);
            } else if (frame === 3) {
                // Front-left & back-right forward
                ctx.fillRect(5, 17, 3, 5);
                ctx.fillRect(12, 17, 3, 5);
                ctx.fillRect(18, 17, 3, 5);
                ctx.fillRect(21, 16, 3, 4);
            } else {
                // Standing legs
                ctx.fillRect(6, 17, 3, 5);
                ctx.fillRect(11, 17, 3, 5);
                ctx.fillRect(18, 17, 3, 5);
                ctx.fillRect(22, 17, 3, 5);
            }

            return canvas;
        };

        this.cache['animal_cow_0'] = drawCow(0);
        this.cache['animal_cow_1'] = drawCow(1);
        this.cache['animal_cow_2'] = drawCow(2);
        this.cache['animal_cow_3'] = drawCow(3);
        this.cache['animal_cow_action'] = drawCow('action');
        this.cache['animal_cow'] = this.cache['animal_cow_0'];
    }

    // FARMER CHARACTER (Modular & Fully Customizable - Sex, Hair, Clothes, Hats, Glasses, Boots)
    updateFarmerCustomization(config) {
        this.farmerConfig = Object.assign(this.farmerConfig || {}, config);
        this.generateFarmerSprites(this.farmerConfig);
    }

    generateFarmerSprites(config = null) {
        if (!this.farmerConfig) {
            this.farmerConfig = {
                skin: '#fcd0a1',
                hairStyle: 'short',
                hairColor: '#5c3317',
                eyeColor: '#222222',
                hat: 'straw',
                hatColor: '#e1b12c',
                glasses: 'none',
                shirtColor: '#d63031',
                pantsType: 'overalls',
                pantsColor: '#2e6b9e',
                bootsColor: '#3e2723'
            };
        }
        const cfg = config || this.farmerConfig;

        const cSkin = cfg.skin || '#fcd0a1';
        const cHair = cfg.hairColor || '#5c3317';
        const cShirt = cfg.shirtColor || '#d63031';
        const cPants = cfg.pantsColor || '#2e6b9e';
        const cBoots = cfg.bootsColor || '#3e2723';
        const cHat = cfg.hatColor || '#e1b12c';
        const hatType = cfg.hat || 'straw';
        const glassesType = cfg.glasses || 'none';
        const hairStyle = cfg.hairStyle || 'short';
        const pantsType = cfg.pantsType || 'overalls';

        const directions = ['down', 'up', 'left', 'right'];
        const frames = [0, 1, 2, 3]; // walk frames

        directions.forEach(dir => {
            frames.forEach(frame => {
                const { canvas, ctx } = this.createCanvas(16, 24);
                const legOffset = (frame === 1) ? -1 : (frame === 3 ? 1 : 0);

                // 1. Draw Hair under/around hat
                if (hatType === 'none' || hatType === 'flower') {
                    ctx.fillStyle = cHair;
                    ctx.fillRect(4, 1, 8, 4); // crown hair
                    if (hairStyle === 'curly') {
                        ctx.fillRect(3, 0, 10, 3);
                        ctx.fillRect(2, 3, 2, 4);
                        ctx.fillRect(12, 3, 2, 4);
                    } else if (hairStyle === 'long') {
                        ctx.fillRect(3, 3, 2, 7);
                        ctx.fillRect(11, 3, 2, 7);
                    }
                }

                // 2. Draw Hat
                if (hatType === 'straw') {
                    ctx.fillStyle = cHat;
                    ctx.fillRect(2, 1, 12, 3);
                    ctx.fillRect(4, 0, 8, 2);
                    ctx.fillStyle = '#8c1d1d'; // red ribbon
                    ctx.fillRect(4, 2, 8, 1);
                } else if (hatType === 'cap') {
                    ctx.fillStyle = cHat;
                    ctx.fillRect(4, 0, 8, 3);
                    const visorX = dir === 'left' ? 2 : (dir === 'right' ? 8 : 4);
                    ctx.fillRect(visorX, 2, 6, 2);
                } else if (hatType === 'beanie') {
                    ctx.fillStyle = cHat;
                    ctx.fillRect(4, 0, 8, 3);
                    ctx.fillRect(3, 2, 10, 2);
                } else if (hatType === 'flower') {
                    ctx.fillStyle = '#e84393';
                    ctx.fillRect(11, 1, 3, 3);
                    ctx.fillStyle = '#ffeaa7';
                    ctx.fillRect(12, 2, 1, 1);
                }

                // 3. Head & Body by Direction
                if (dir === 'down') {
                    // Face
                    ctx.fillStyle = cSkin;
                    ctx.fillRect(5, 4, 6, 4);
                    // Hair sideburns
                    ctx.fillStyle = cHair;
                    ctx.fillRect(4, 4, 1, 3);
                    ctx.fillRect(11, 4, 1, 3);
                    // Eyes
                    ctx.fillStyle = cfg.eyeColor || '#222';
                    ctx.fillRect(6, 5, 1, 1);
                    ctx.fillRect(9, 5, 1, 1);

                    // Glasses
                    if (glassesType === 'round') {
                        ctx.fillStyle = '#f1c40f';
                        ctx.fillRect(5, 4, 3, 3);
                        ctx.fillRect(8, 4, 3, 3);
                        ctx.fillRect(7, 5, 2, 1);
                        ctx.fillStyle = cSkin;
                        ctx.fillRect(6, 5, 1, 1);
                        ctx.fillRect(9, 5, 1, 1);
                        ctx.fillStyle = cfg.eyeColor || '#222';
                        ctx.fillRect(6, 5, 1, 1);
                        ctx.fillRect(9, 5, 1, 1);
                    } else if (glassesType === 'classic') {
                        ctx.fillStyle = '#111';
                        ctx.fillRect(5, 5, 3, 2);
                        ctx.fillRect(8, 5, 3, 2);
                        ctx.fillRect(7, 5, 2, 1);
                    } else if (glassesType === 'sunglasses') {
                        ctx.fillStyle = '#1e272e';
                        ctx.fillRect(5, 5, 6, 2);
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(6, 5, 1, 1);
                    }

                    // Shirt collar
                    ctx.fillStyle = cShirt;
                    ctx.fillRect(5, 8, 6, 2);

                    // Torso (Overalls vs Regular Shirt)
                    if (pantsType === 'overalls') {
                        ctx.fillStyle = cPants;
                        ctx.fillRect(5, 9, 6, 6);
                        // Gold buttons
                        ctx.fillStyle = '#f1c40f';
                        ctx.fillRect(5, 10, 1, 1);
                        ctx.fillRect(10, 10, 1, 1);
                    } else {
                        ctx.fillStyle = cShirt;
                        ctx.fillRect(5, 9, 6, 5);
                        ctx.fillStyle = '#3e2723'; // belt
                        ctx.fillRect(5, 13, 6, 1);
                    }

                    // Sleeves
                    ctx.fillStyle = cShirt;
                    ctx.fillRect(3, 9, 2, 4);
                    ctx.fillRect(11, 9, 2, 4);

                    // Hands
                    ctx.fillStyle = cSkin;
                    ctx.fillRect(3, 13, 2, 2);
                    ctx.fillRect(11, 13, 2, 2);

                    // Legs / Pants
                    ctx.fillStyle = cPants;
                    if (pantsType === 'skirt') {
                        ctx.fillRect(4, 14, 8, 4);
                        ctx.fillStyle = cSkin;
                        ctx.fillRect(5, 17, 2, 2);
                        ctx.fillRect(9, 17, 2, 2);
                    } else {
                        ctx.fillRect(5, 14, 2, 5);
                        ctx.fillRect(9, 14, 2, 5);
                    }

                    // Boots
                    ctx.fillStyle = cBoots;
                    ctx.fillRect(5, 19 + legOffset, 2, 3);
                    ctx.fillRect(9, 19 - legOffset, 2, 3);

                } else if (dir === 'up') {
                    // Back of head (all hair)
                    ctx.fillStyle = cHair;
                    ctx.fillRect(4, 4, 8, 4);
                    if (hairStyle === 'long') {
                        ctx.fillRect(4, 8, 8, 4);
                    }

                    // Back shirt
                    ctx.fillStyle = cShirt;
                    ctx.fillRect(4, 8, 8, 3);

                    // Back torso
                    if (pantsType === 'overalls') {
                        ctx.fillStyle = cPants;
                        ctx.fillRect(5, 9, 6, 6);
                        ctx.fillStyle = cShirt;
                        ctx.fillRect(7, 9, 2, 4); // gap between straps
                    } else {
                        ctx.fillStyle = cShirt;
                        ctx.fillRect(5, 9, 6, 5);
                        ctx.fillStyle = '#3e2723';
                        ctx.fillRect(5, 13, 6, 1);
                    }

                    // Sleeves
                    ctx.fillStyle = cShirt;
                    ctx.fillRect(3, 9, 2, 4);
                    ctx.fillRect(11, 9, 2, 4);

                    // Legs
                    ctx.fillStyle = cPants;
                    ctx.fillRect(5, 14, 2, 5);
                    ctx.fillRect(9, 14, 2, 5);

                    // Boots
                    ctx.fillStyle = cBoots;
                    ctx.fillRect(5, 19 + legOffset, 2, 3);
                    ctx.fillRect(9, 19 - legOffset, 2, 3);

                } else if (dir === 'left' || dir === 'right') {
                    const flip = dir === 'left';
                    const hx = flip ? 4 : 6;

                    // Side head
                    ctx.fillStyle = cSkin;
                    ctx.fillRect(hx, 4, 6, 4);
                    ctx.fillStyle = cHair;
                    ctx.fillRect(flip ? hx + 3 : hx - 1, 4, 3, 4);

                    // Eye
                    ctx.fillStyle = cfg.eyeColor || '#222';
                    ctx.fillRect(flip ? hx + 1 : hx + 4, 5, 1, 1);

                    // Glasses profile
                    if (glassesType === 'round' || glassesType === 'classic') {
                        ctx.fillStyle = glassesType === 'round' ? '#f1c40f' : '#111';
                        ctx.fillRect(flip ? hx : hx + 3, 4, 3, 2);
                    } else if (glassesType === 'sunglasses') {
                        ctx.fillStyle = '#1e272e';
                        ctx.fillRect(flip ? hx : hx + 3, 4, 3, 2);
                    }

                    // Torso
                    if (pantsType === 'overalls') {
                        ctx.fillStyle = cPants;
                        ctx.fillRect(5, 8, 6, 7);
                    } else {
                        ctx.fillStyle = cShirt;
                        ctx.fillRect(5, 8, 6, 6);
                        ctx.fillStyle = '#3e2723';
                        ctx.fillRect(5, 13, 6, 1);
                    }

                    // Sleeve & hand
                    ctx.fillStyle = cShirt;
                    ctx.fillRect(flip ? 4 : 10, 9, 2, 4);
                    ctx.fillStyle = cSkin;
                    ctx.fillRect(flip ? 4 : 10, 13, 2, 2);

                    // Legs
                    ctx.fillStyle = cPants;
                    ctx.fillRect(5 - legOffset, 15, 3, 4);
                    ctx.fillRect(8 + legOffset, 15, 3, 4);

                    // Boots
                    ctx.fillStyle = cBoots;
                    ctx.fillRect(5 - legOffset, 19, 3, 3);
                    ctx.fillRect(8 + legOffset, 19, 3, 3);
                }

                this.cache[`farmer_${dir}_${frame}`] = canvas;
            });

            // Action frame
            const { canvas: actCanvas, ctx: aCtx } = this.createCanvas(16, 24);
            if (hatType === 'straw') {
                aCtx.fillStyle = cHat;
                aCtx.fillRect(3, 3, 10, 3);
            } else if (hatType === 'cap' || hatType === 'beanie') {
                aCtx.fillStyle = cHat;
                aCtx.fillRect(4, 2, 8, 3);
            } else {
                aCtx.fillStyle = cHair;
                aCtx.fillRect(4, 3, 8, 3);
            }
            aCtx.fillStyle = cSkin;
            aCtx.fillRect(5, 6, 6, 4);
            aCtx.fillStyle = cPants;
            aCtx.fillRect(4, 10, 8, 7);
            aCtx.fillStyle = cShirt;
            aCtx.fillRect(2, 11, 4, 3);
            aCtx.fillRect(10, 11, 4, 3);
            aCtx.fillStyle = cBoots;
            aCtx.fillRect(4, 18, 3, 3);
            aCtx.fillRect(9, 18, 3, 3);
            this.cache[`farmer_${dir}_action`] = actCanvas;

            // Pose frame
            const { canvas: poseCanvas, ctx: pCtx } = this.createCanvas(16, 24);
            if (hatType === 'straw') {
                pCtx.fillStyle = cHat;
                pCtx.fillRect(2, 5, 12, 3);
            } else if (hatType === 'cap' || hatType === 'beanie') {
                pCtx.fillStyle = cHat;
                pCtx.fillRect(4, 4, 8, 3);
            } else {
                pCtx.fillStyle = cHair;
                pCtx.fillRect(4, 4, 8, 3);
            }
            pCtx.fillStyle = cSkin;
            pCtx.fillRect(5, 7, 6, 4);
            pCtx.fillStyle = cfg.eyeColor || '#222';
            pCtx.fillRect(6, 8, 1, 1);
            pCtx.fillRect(9, 8, 1, 1);
            pCtx.fillStyle = cPants;
            pCtx.fillRect(5, 12, 6, 6);
            pCtx.fillStyle = cShirt;
            pCtx.fillRect(3, 6, 2, 6);
            pCtx.fillRect(11, 6, 2, 6);
            pCtx.fillStyle = cSkin;
            pCtx.fillRect(3, 4, 2, 2);
            pCtx.fillRect(11, 4, 2, 2);
            pCtx.fillStyle = cBoots;
            pCtx.fillRect(5, 19, 2, 3);
            pCtx.fillRect(9, 19, 2, 3);
            this.cache[`farmer_${dir}_pose`] = poseCanvas;
        });
    }

    // ITEM ICONS (16x16) for Stardew Hotbar & Inventory
    generateItemIcons() {
        // 1. Hoe
        const { canvas: hoe, ctx: hCtx } = this.createCanvas(16, 16);
        hCtx.fillStyle = '#7a421b'; // wooden handle
        hCtx.fillRect(3, 11, 2, 2);
        hCtx.fillRect(5, 9, 2, 2);
        hCtx.fillRect(7, 7, 2, 2);
        hCtx.fillRect(9, 5, 2, 2);
        hCtx.fillStyle = '#9aa2b0'; // metal blade
        hCtx.fillRect(10, 3, 4, 3);
        hCtx.fillRect(12, 6, 2, 3);
        hCtx.fillStyle = '#ffffff';
        hCtx.fillRect(11, 4, 2, 1);
        this.cache['icon_hoe'] = hoe;

        // 2. Watering Can
        const { canvas: can, ctx: wcCtx } = this.createCanvas(16, 16);
        wcCtx.fillStyle = '#8395a7'; // body
        wcCtx.fillRect(5, 7, 7, 7);
        wcCtx.fillStyle = '#c8d6e5';
        wcCtx.fillRect(6, 8, 5, 5);
        // Handle
        wcCtx.fillStyle = '#576574';
        wcCtx.fillRect(3, 6, 2, 6);
        wcCtx.fillRect(4, 5, 3, 2);
        // Spout
        wcCtx.fillStyle = '#8395a7';
        wcCtx.fillRect(11, 6, 3, 3);
        wcCtx.fillRect(13, 4, 2, 3);
        // Water drops
        wcCtx.fillStyle = '#48dbfb';
        wcCtx.fillRect(14, 2, 1, 1);
        this.cache['icon_watering_can'] = can;

        // 3. Axe
        const { canvas: axe, ctx: axCtx } = this.createCanvas(16, 16);
        axCtx.fillStyle = '#7a421b';
        axCtx.fillRect(3, 12, 2, 2);
        axCtx.fillRect(5, 10, 2, 2);
        axCtx.fillRect(7, 8, 2, 2);
        axCtx.fillRect(9, 6, 2, 2);
        axCtx.fillStyle = '#8395a7'; // axe head
        axCtx.fillRect(9, 3, 4, 4);
        axCtx.fillRect(13, 2, 2, 5);
        axCtx.fillStyle = '#c8d6e5';
        axCtx.fillRect(13, 3, 1, 3);
        this.cache['icon_axe'] = axe;

        // 4. Pickaxe
        const { canvas: pick, ctx: pkCtx } = this.createCanvas(16, 16);
        pkCtx.fillStyle = '#7a421b';
        pkCtx.fillRect(4, 11, 2, 2);
        pkCtx.fillRect(6, 9, 2, 2);
        pkCtx.fillRect(8, 7, 2, 2);
        pkCtx.fillStyle = '#718093';
        pkCtx.fillRect(7, 3, 6, 3);
        pkCtx.fillRect(6, 5, 2, 2);
        pkCtx.fillRect(12, 5, 2, 2);
        this.cache['icon_pickaxe'] = pick;

        // 5. Scythe
        const { canvas: scythe, ctx: sCtx } = this.createCanvas(16, 16);
        sCtx.fillStyle = '#7a421b';
        sCtx.fillRect(4, 11, 2, 3);
        sCtx.fillRect(6, 8, 2, 3);
        sCtx.fillRect(8, 5, 2, 3);
        sCtx.fillStyle = '#c8d6e5';
        sCtx.fillRect(6, 2, 6, 2);
        sCtx.fillRect(4, 3, 3, 2);
        sCtx.fillRect(3, 5, 2, 3);
        this.cache['icon_scythe'] = scythe;

        // 6. Seed Packets (Parsnip, Strawberry, Pumpkin, Corn)
        const generateSeedBag = (name, color) => {
            const { canvas: bag, ctx: bCtx } = this.createCanvas(16, 16);
            bCtx.fillStyle = '#a0753b';
            bCtx.fillRect(4, 4, 8, 9);
            bCtx.fillStyle = '#d2a76a';
            bCtx.fillRect(5, 5, 6, 7);
            bCtx.fillStyle = '#7a5423';
            bCtx.fillRect(5, 3, 6, 2); // bag tie
            // Color stamp
            bCtx.fillStyle = color;
            bCtx.fillRect(6, 7, 4, 3);
            this.cache[`icon_seed_${name}`] = bag;
        };
        generateSeedBag('parsnip', '#f5cd79');
        generateSeedBag('strawberry', '#ea2027');
        generateSeedBag('pumpkin', '#ff9f1a');
        generateSeedBag('corn', '#ffd32a');

        // 7. Harvested Items
        // Parsnip
        const { canvas: hParsnip, ctx: hpCtx } = this.createCanvas(16, 16);
        hpCtx.fillStyle = '#4fa32a';
        hpCtx.fillRect(6, 2, 4, 3);
        hpCtx.fillStyle = '#ebd6a7';
        hpCtx.fillRect(6, 5, 4, 6);
        hpCtx.fillStyle = '#fff5de';
        hpCtx.fillRect(6, 6, 2, 4);
        hpCtx.fillStyle = '#ebd6a7';
        hpCtx.fillRect(7, 11, 2, 3);
        this.cache['icon_crop_parsnip'] = hParsnip;

        // Strawberry
        const { canvas: hStraw, ctx: hsCtx } = this.createCanvas(16, 16);
        hsCtx.fillStyle = '#4fa32a';
        hsCtx.fillRect(6, 3, 4, 2);
        hsCtx.fillStyle = '#ea2027';
        hsCtx.fillRect(4, 5, 8, 6);
        hsCtx.fillRect(5, 11, 6, 2);
        hsCtx.fillRect(6, 13, 4, 1);
        hsCtx.fillStyle = '#ff6b81';
        hsCtx.fillRect(5, 6, 3, 3);
        hsCtx.fillStyle = '#fff078';
        hsCtx.fillRect(6, 8, 1, 1);
        hsCtx.fillRect(9, 7, 1, 1);
        this.cache['icon_crop_strawberry'] = hStraw;

        // Pumpkin
        const { canvas: hPump, ctx: hpmCtx } = this.createCanvas(16, 16);
        hpmCtx.fillStyle = '#4fa32a';
        hpmCtx.fillRect(7, 3, 2, 2);
        hpmCtx.fillStyle = '#ff793f';
        hpmCtx.fillRect(3, 5, 10, 8);
        hpmCtx.fillStyle = '#ff9f1a';
        hpmCtx.fillRect(4, 6, 3, 6);
        hpmCtx.fillRect(9, 6, 3, 6);
        hpmCtx.fillStyle = '#cd6133';
        hpmCtx.fillRect(7, 5, 2, 8);
        this.cache['icon_crop_pumpkin'] = hPump;

        // Corn
        const { canvas: hCorn, ctx: hcCtx } = this.createCanvas(16, 16);
        hcCtx.fillStyle = '#ffd32a';
        hcCtx.fillRect(6, 3, 4, 9);
        hcCtx.fillStyle = '#ffb142';
        hcCtx.fillRect(7, 4, 2, 7);
        hcCtx.fillStyle = '#2ed573';
        hcCtx.fillRect(4, 8, 3, 5);
        hcCtx.fillRect(9, 8, 3, 5);
        this.cache['icon_crop_corn'] = hCorn;

        // Fresh Egg
        const { canvas: egg, ctx: eCtx } = this.createCanvas(16, 16);
        eCtx.fillStyle = '#dcdde1';
        eCtx.beginPath();
        eCtx.ellipse(8, 9, 5, 6, 0, 0, Math.PI * 2);
        eCtx.fill();
        eCtx.fillStyle = '#ffffff';
        eCtx.beginPath();
        eCtx.ellipse(7, 8, 4, 5, 0, 0, Math.PI * 2);
        eCtx.fill();
        this.cache['icon_egg'] = egg;

        // Wood Material
        const { canvas: woodMat, ctx: wmCtx } = this.createCanvas(16, 16);
        wmCtx.fillStyle = '#7a421b';
        wmCtx.fillRect(4, 4, 8, 4);
        wmCtx.fillRect(3, 9, 9, 4);
        wmCtx.fillStyle = '#d49b65';
        wmCtx.fillRect(11, 4, 2, 4);
        wmCtx.fillRect(11, 9, 2, 4);
        this.cache['icon_wood'] = woodMat;

        // Energy Pie / Snack
        const { canvas: pie, ctx: piCtx } = this.createCanvas(16, 16);
        piCtx.fillStyle = '#b33939';
        piCtx.fillRect(4, 6, 8, 6);
        piCtx.fillStyle = '#f7d794';
        piCtx.fillRect(3, 5, 10, 3);
        piCtx.fillStyle = '#e55039';
        piCtx.fillRect(5, 7, 2, 2);
        piCtx.fillRect(8, 8, 2, 2);
        this.cache['icon_pie'] = pie;
    }

    get(name) {
        return this.cache[name] || null;
    }
}

// Global sprite manager singleton
window.gameSprites = new SpriteManager();
