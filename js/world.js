/**
 * Stardew Valley Web Prototype - World, Farm Map, and Entities
 */

class World {
    constructor(cols = 36, rows = 26) {
        this.cols = cols;
        this.rows = rows;
        this.tileSize = 16;
        this.tiles = [];
        this.particles = [];
        this.animals = [];
        this.floatingTexts = [];
        this.shippingBinItems = [];
        
        // Ambient wind blossom particles
        this.petals = [];
        for (let i = 0; i < 28; i++) {
            this.petals.push({
                x: Math.random() * (this.cols * this.tileSize),
                y: Math.random() * (this.rows * this.tileSize),
                speed: 0.6 + Math.random() * 0.8,
                drift: Math.sin(Math.random() * Math.PI * 2),
                size: 2 + Math.random() * 2,
                color: Math.random() > 0.4 ? 'rgba(255, 182, 193, 0.75)' : 'rgba(255, 255, 255, 0.65)'
            });
        }

        // Ambient Fireflies (Vaga-lumes noturnos)
        this.fireflies = [];
        for (let i = 0; i < 24; i++) {
            const bx = 12 * 16 + Math.random() * (22 * 16);
            const by = 8 * 16 + Math.random() * (15 * 16);
            this.fireflies.push({
                x: bx,
                y: by,
                baseX: bx,
                baseY: by,
                vx: (Math.random() - 0.5) * 14,
                vy: (Math.random() - 0.5) * 14,
                pulsePhase: Math.random() * Math.PI * 2,
                size: 1.5 + Math.random() * 1.5
            });
        }

        this.generateMap();
        this.initAnimals();
    }

    generateMap() {
        this.tiles = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                let terrain = 'grass';
                
                // Farm Pond at bottom right
                if (c >= 28 && c <= 33 && r >= 17 && r <= 22) {
                    terrain = 'water';
                }
                // Sandy paths connecting Farmhouse door, Celeiro porch, Crops, and Animal coop
                else if (
                    (c >= 10 && c <= 11 && r >= 7 && r <= 18) || // path down from farmhouse door
                    (r === 7 && c >= 10 && c <= 21) ||           // path connecting farmhouse and celeiro
                    (r === 12 && c >= 6 && c <= 26)              // central farm path
                ) {
                    terrain = 'path';
                }

                row.push({
                    terrain: terrain,
                    crop: null,
                    object: null
                });
            }
            this.tiles.push(row);
        }

        // 1. PLACE ENLARGED STARDEW FARMHOUSE (c=8..13, r=2..6 -> 96x80px, 6x5 tiles)
        this.tiles[2][8].object = {
            type: 'farmhouse',
            solid: true,
            w: 6,
            h: 5,
            pixelW: 96,
            pixelH: 80
        };
        // Mark occupied tiles for farmhouse collision
        for (let ro = 2; ro <= 6; ro++) {
            for (let co = 8; co <= 13; co++) {
                if (ro === 6 && (co === 10 || co === 11)) {
                    // Front door entrance threshold (walkable into house interior)
                    this.tiles[ro][co].object = { type: 'farmhouse_door', solid: false, parent: { c: 8, r: 2 } };
                } else if (ro !== 2 || co !== 8) {
                    this.tiles[ro][co].object = { type: 'farmhouse_part', solid: true, parent: { c: 8, r: 2 } };
                }
            }
        }

        // 2. PLACE RUSTIC RED BARN (CELEIRO) (c=16..20, r=2..6 -> 80x72px, 5x5 tiles)
        this.tiles[2][16].object = {
            type: 'barn',
            solid: true,
            w: 5,
            h: 5,
            pixelW: 80,
            pixelH: 72
        };
        // Mark occupied tiles for barn collision (main barn walls c=16..18, r=2..6)
        for (let ro = 2; ro <= 6; ro++) {
            for (let co = 16; co <= 18; co++) {
                if (ro !== 2 || co !== 16) {
                    this.tiles[ro][co].object = { type: 'barn_part', solid: true, parent: { c: 16, r: 2 } };
                }
            }
        }

        // 3. PLACE BAÚ (SHIPPING BIN) INSIDE/ON THE CELEIRO COVERED PORCH (c=19..20, r=5..6)
        this.tiles[5][19].object = {
            type: 'shipping_bin',
            solid: true,
            w: 2,
            h: 2,
            pixelW: 32,
            pixelH: 24,
            opened: false
        };
        this.tiles[5][20].object = { type: 'shipping_bin_part', solid: true, parent: { c: 19, r: 5 } };
        this.tiles[6][19].object = { type: 'shipping_bin_part', solid: true, parent: { c: 19, r: 5 } };
        this.tiles[6][20].object = { type: 'shipping_bin_part', solid: true, parent: { c: 19, r: 5 } };

        // Fencing around the animal coop pasture (c=2..8, r=14..22)
        for (let c = 2; c <= 8; c++) {
            this.tiles[14][c].object = { type: 'fence', solid: true };
            this.tiles[22][c].object = { type: 'fence', solid: true };
        }
        for (let r = 15; r <= 21; r++) {
            this.tiles[r][2].object = { type: 'fence', solid: true };
            if (r !== 18) { // gate opening at r=18
                this.tiles[r][8].object = { type: 'fence', solid: true };
            }
        }

        // Starting Farm Cultivation Garden Plots (c=16..24, r=9..15)
        for (let r = 9; r <= 15; r++) {
            for (let c = 16; c <= 24; c++) {
                if ((r === 10 || r === 11 || r === 13 || r === 14) && (c >= 17 && c <= 23)) {
                    this.tiles[r][c].terrain = 'tilled_dry';
                }
            }
        }

        // Pre-plant a few beginner crops to showcase the visual splendor immediately
        this.tiles[10][17].crop = { type: 'parsnip', stage: 4, name: 'Chirívia' }; // ready to harvest!
        this.tiles[10][18].crop = { type: 'parsnip', stage: 3, name: 'Chirívia' };
        this.tiles[10][19].crop = { type: 'strawberry', stage: 4, name: 'Morango' }; // ready!
        this.tiles[10][20].crop = { type: 'strawberry', stage: 2, name: 'Morango' };
        this.tiles[10][21].crop = { type: 'pumpkin', stage: 4, name: 'Abóbora' }; // giant pumpkin!
        this.tiles[10][22].crop = { type: 'corn', stage: 4, name: 'Milho' }; // tall corn!

        this.tiles[11][17].terrain = 'tilled_wet';
        this.tiles[11][18].terrain = 'tilled_wet';
        this.tiles[11][17].crop = { type: 'parsnip', stage: 1, name: 'Chirívia' };
        this.tiles[11][18].crop = { type: 'parsnip', stage: 2, name: 'Chirívia' };

        // Scatter Natural Oak & Pine trees, rocks, weeds, logs around the farm
        const treeSpots = [
            { c: 4, r: 4, type: 'tree_oak' },
            { c: 3, r: 2, type: 'tree_pine' },
            { c: 24, r: 3, type: 'tree_oak' },
            { c: 28, r: 4, type: 'tree_pine' },
            { c: 32, r: 7, type: 'tree_oak' },
            { c: 30, r: 12, type: 'tree_pine' },
            { c: 4, r: 10, type: 'tree_oak' },
            { c: 14, r: 21, type: 'tree_oak' },
            { c: 25, r: 22, type: 'tree_pine' }
        ];

        treeSpots.forEach(t => {
            if (this.isWalkableTile(t.c, t.r)) {
                this.tiles[t.r][t.c].object = {
                    type: t.type,
                    solid: true,
                    health: 3,
                    w: 2,
                    h: 3,
                    pixelW: 32,
                    pixelH: 48
                };
            }
        });

        // Scatter breakable rocks, weeds, logs
        const scatter = [
            { c: 6, r: 7, type: 'rock' },
            { c: 14, r: 16, type: 'rock' },
            { c: 26, r: 16, type: 'rock' },
            { c: 27, r: 10, type: 'log' },
            { c: 11, r: 21, type: 'log' },
            { c: 7, r: 11, type: 'weed' },
            { c: 13, r: 8, type: 'weed' },
            { c: 23, r: 8, type: 'weed' },
            { c: 15, r: 14, type: 'weed' },
            { c: 25, r: 14, type: 'weed' }
        ];

        scatter.forEach(s => {
            if (this.isWalkableTile(s.c, s.r) && !this.tiles[s.r][s.c].object && this.tiles[s.r][s.c].terrain === 'grass') {
                this.tiles[s.r][s.c].object = {
                    type: s.type,
                    solid: s.type !== 'weed',
                    health: s.type === 'log' ? 2 : 1
                };
            }
        });
    }

    initAnimals() {
        // Chicken "Pipoca" (w: 16, h: 16)
        this.animals.push({
            name: 'Pipoca',
            type: 'chicken',
            x: 5 * this.tileSize,
            y: 17 * this.tileSize,
            vx: 0,
            vy: 0,
            dir: 'right',
            action: 'idle',
            frame: 0,
            timer: 2.0,
            pettedToday: false,
            hearts: 3,
            w: 16,
            h: 16,
            // Feet / collision box offset
            boxOffsetX: 2,
            boxOffsetY: 8,
            boxW: 12,
            boxH: 7,
            // Boundaries inside pasture:
            // Left fence is col 2 (ends at x=48) -> minX = 50
            // Right fence is col 8 (starts at x=128) -> maxX = 128 - 16 - 2 = 110
            // Top fence is row 14 (ends at y=240) -> minY = 242
            // Bottom fence is row 22 (starts at y=352) -> maxY = 352 - 16 - 2 = 334
            minX: 50,
            maxX: 110,
            minY: 242,
            maxY: 334
        });

        // Cow "Mimosa" (w: 32, h: 24)
        this.animals.push({
            name: 'Mimosa',
            type: 'cow',
            x: 4 * this.tileSize,
            y: 19 * this.tileSize,
            vx: 0,
            vy: 0,
            dir: 'right',
            action: 'idle',
            frame: 0,
            timer: 2.8,
            pettedToday: false,
            hearts: 4,
            w: 32,
            h: 24,
            // Feet / collision box offset
            boxOffsetX: 4,
            boxOffsetY: 12,
            boxW: 24,
            boxH: 10,
            // Boundaries: cow width is 32, height is 24
            // maxX = 128 - 32 - 2 = 94 (keeps right edge of cow inside x=126, preventing any fence overlap!)
            // maxY = 352 - 24 - 2 = 326 (keeps bottom of cow inside y=350)
            minX: 50,
            maxX: 94,
            minY: 242,
            maxY: 326
        });
    }

    isWalkableTile(c, r) {
        if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return false;
        const tile = this.tiles[r][c];
        if (tile.terrain === 'water') return false;
        if (tile.object && tile.object.solid) return false;
        return true;
    }

    updateAnimals(dt, player = null) {
        this.animals.forEach(animal => {
            animal.timer -= dt;

            // Pick a new natural activity
            if (animal.timer <= 0) {
                const act = Math.random();
                if (act < 0.50) {
                    // Wander activity
                    const pastureCenterX = (animal.minX + animal.maxX) / 2;
                    const pastureCenterY = (animal.minY + animal.maxY) / 2;

                    // Proximity to fences: steer back toward pasture center
                    const distToLeft = animal.x - animal.minX;
                    const distToRight = animal.maxX - animal.x;
                    const distToTop = animal.y - animal.minY;
                    const distToBottom = animal.maxY - animal.y;

                    let angle;
                    if (distToLeft < 12 || distToRight < 12 || distToTop < 12 || distToBottom < 12) {
                        const toCenter = Math.atan2(pastureCenterY - animal.y, pastureCenterX - animal.x);
                        angle = toCenter + (Math.random() - 0.5) * 0.7;
                    } else {
                        angle = Math.random() * Math.PI * 2;
                    }

                    const speed = animal.type === 'chicken' ? 14 : 9;
                    animal.vx = Math.cos(angle) * speed;
                    animal.vy = Math.sin(angle) * speed;

                    // Immediately face the direction of walking!
                    if (Math.abs(animal.vx) > 0.5) {
                        animal.dir = animal.vx < 0 ? 'left' : 'right';
                    }
                    animal.action = 'walk';
                    animal.timer = 1.8 + Math.random() * 2.5;
                } else if (act < 0.78) {
                    // Standing still / Resting
                    animal.vx = 0;
                    animal.vy = 0;
                    animal.action = 'idle';
                    animal.timer = 1.5 + Math.random() * 2.2;
                } else {
                    // Pecking the ground (chicken) or grazing grass (cow)
                    animal.vx = 0;
                    animal.vy = 0;
                    animal.action = 'action';
                    animal.timer = 2.0 + Math.random() * 3.0;
                }
            }

            // Movement & Fence Collision (no backwards moonwalking!)
            if (animal.action === 'walk') {
                const nx = animal.x + animal.vx * dt;
                const ny = animal.y + animal.vy * dt;

                let hitEdge = false;

                // X movement & boundary check
                if (nx < animal.minX) {
                    animal.x = animal.minX;
                    hitEdge = true;
                    animal.dir = 'right'; // Turned around to face into pen!
                } else if (nx > animal.maxX) {
                    animal.x = animal.maxX;
                    hitEdge = true;
                    animal.dir = 'left'; // Turned around to face into pen!
                } else {
                    animal.x = nx;
                    if (Math.abs(animal.vx) > 0.5) {
                        animal.dir = animal.vx < 0 ? 'left' : 'right';
                    }
                }

                // Y movement & boundary check
                if (ny < animal.minY) {
                    animal.y = animal.minY;
                    hitEdge = true;
                } else if (ny > animal.maxY) {
                    animal.y = animal.maxY;
                    hitEdge = true;
                } else {
                    animal.y = ny;
                }

                // If hit the fence, pause naturally and turn facing into the pasture
                if (hitEdge) {
                    animal.vx = 0;
                    animal.vy = 0;
                    animal.action = 'idle';
                    animal.timer = 1.2 + Math.random() * 1.5;
                }
            }

            // Animate frames
            if (animal.action === 'walk' && (animal.vx !== 0 || animal.vy !== 0)) {
                animal.animTimer = (animal.animTimer || 0) + dt * (animal.type === 'chicken' ? 7.5 : 4.5);
                animal.frame = Math.floor(animal.animTimer) % 4;
            } else if (animal.action === 'action') {
                animal.frame = 'action';
            } else {
                animal.frame = 0;
            }
        });

        // Soft separation between animals (Pipoca and Mimosa don't clip through each other)
        for (let i = 0; i < this.animals.length; i++) {
            for (let j = i + 1; j < this.animals.length; j++) {
                const a1 = this.animals[i];
                const a2 = this.animals[j];
                const c1x = a1.x + a1.w / 2;
                const c1y = a1.y + a1.h / 2;
                const c2x = a2.x + a2.w / 2;
                const c2y = a2.y + a2.h / 2;
                const dist = Math.hypot(c1x - c2x, c1y - c2y);
                const minDist = (a1.w + a2.w) * 0.45;
                if (dist < minDist && dist > 0.1) {
                    const angle = Math.atan2(c1y - c2y, c1x - c2x);
                    const push = (minDist - dist) * 0.5;
                    a1.x = Math.max(a1.minX, Math.min(a1.maxX, a1.x + Math.cos(angle) * push));
                    a1.y = Math.max(a1.minY, Math.min(a1.maxY, a1.y + Math.sin(angle) * push));
                    a2.x = Math.max(a2.minX, Math.min(a2.maxX, a2.x - Math.cos(angle) * push));
                    a2.y = Math.max(a2.minY, Math.min(a2.maxY, a2.y - Math.sin(angle) * push));
                }
            }
        }

        // Reaction if player gets close to walking animal (stops walking into player)
        if (player) {
            this.animals.forEach(animal => {
                const ax = animal.x + animal.w / 2;
                const ay = animal.y + animal.h / 2;
                const px = player.x + 8;
                const py = player.y + 16;
                const pDist = Math.hypot(ax - px, ay - py);
                if (pDist < (animal.type === 'cow' ? 24 : 16) && animal.action === 'walk') {
                    animal.vx = 0;
                    animal.vy = 0;
                    animal.action = 'idle';
                    animal.timer = 1.4;
                    animal.dir = px < ax ? 'left' : 'right'; // Face player
                }
            });
        }
    }

    addParticle(particle) {
        this.particles.push(particle);
    }

    addFloatingText(text, x, y, color = '#ffffff') {
        this.floatingTexts.push({
            text,
            x,
            y,
            color,
            life: 1.6,
            maxLife: 1.6
        });
    }

    updateParticles(dt) {
        // Update particles (water drops, dirt chunks, wood chips)
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            p.x += (p.vx || 0) * dt;
            p.y += (p.vy || 0) * dt;
            if (p.gravity) p.vy += p.gravity * dt;
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.life -= dt;
            ft.y -= 18 * dt; // float upwards
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Update ambient breeze blossom petals
        this.petals.forEach(petal => {
            petal.x -= petal.speed * 40 * dt;
            petal.y += petal.speed * 25 * dt;
            petal.drift += dt * 2;
            petal.x += Math.sin(petal.drift) * 0.5;

            // Wrap around world
            const mapW = this.cols * this.tileSize;
            const mapH = this.rows * this.tileSize;
            if (petal.x < -10) petal.x = mapW + 10;
            if (petal.y > mapH + 10) petal.y = -10;
        });

        // Update ambient fireflies
        this.fireflies.forEach(f => {
            f.pulsePhase += dt * 3.5;
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            if (Math.hypot(f.x - f.baseX, f.y - f.baseY) > 35) {
                f.vx = -f.vx;
                f.vy = -f.vy;
            }
        });
    }

    // Triggered when sleeping / starting a new day
    advanceDay() {
        let harvestedCount = 0;
        let driedCount = 0;

        // Process all tiles
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const tile = this.tiles[r][c];

                // If soil was watered, grow crop and dry out soil
                if (tile.terrain === 'tilled_wet') {
                    if (tile.crop && tile.crop.stage < 4) {
                        tile.crop.stage += 1;
                    }
                    tile.terrain = 'tilled_dry'; // soil dries overnight
                    driedCount++;
                }
            }
        }

        // Animals reset petted and lay eggs
        this.animals.forEach(animal => {
            animal.pettedToday = false;
            if (animal.type === 'chicken') {
                // Lay an egg in pasture
                const eggC = 5 + Math.floor(Math.random() * 2);
                const eggR = 17 + Math.floor(Math.random() * 2);
                if (this.tiles[eggR][eggC] && !this.tiles[eggR][eggC].object) {
                    this.tiles[eggR][eggC].object = {
                        type: 'egg',
                        solid: false,
                        name: 'Ovo Fresco'
                    };
                }
            }
        });

        // Calculate Shipping Bin Profits
        let totalRevenue = 0;
        const prices = {
            parsnip: 35,
            strawberry: 120,
            pumpkin: 320,
            corn: 60,
            egg: 50,
            wood: 2
        };

        const soldSummary = {};
        this.shippingBinItems.forEach(item => {
            const price = prices[item.id] || 25;
            totalRevenue += price * item.count;
            soldSummary[item.name] = (soldSummary[item.name] || 0) + item.count;
        });

        this.shippingBinItems = []; // cleared for new day

        return {
            totalRevenue,
            soldSummary
        };
    }
}

window.World = World;
