/**
 * Stardew Valley Web Prototype - Main Game Engine, Rendering, HUD & Lifecycle
 */

class StardewGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Game World Setup
        this.world = new World(36, 26);
        this.player = new Player(this.world, 10.5 * 16, 7 * 16); // Starts outside farmhouse porch door

        // Character Customization Profile
        this.characterConfig = {
            gender: 'female',
            name: 'Fazendeiro(a)',
            farmName: 'Vale Afesu',
            skin: '#fcd0a1',
            hairStyle: 'long',
            hairColor: '#5c3317',
            eyeColor: '#5c3317',
            hat: 'straw',
            hatColor: '#e1b12c',
            glasses: 'none',
            shirtColor: '#d63031',
            pantsType: 'overalls',
            pantsColor: '#2e6b9e',
            bootsColor: '#3e2723'
        };
        this.previewDir = 'down';
        this.fireplaceActive = true;

        // Time & Calendar
        this.season = 'Primavera'; // Spring
        this.day = 1;
        this.dayOfWeek = 'Seg.'; // Monday
        this.timeHours = 6;
        this.timeMinutes = 0;
        this.timeTickTimer = 0;
        this.timeTickInterval = 5.0; // 5 segundos reais = 10 minutos no jogo (~10 minutos por dia completo)

        // Camera
        this.camera = {
            x: 0,
            y: 0,
            zoom: 3 // 3x pixel scale
        };

        // Game State: 'MENU', 'CUTSCENE', 'PLAYING'
        this.gameState = 'MENU';
        this.cutsceneIndex = 0;
        this.cutsceneTyping = false;
        this.cutsceneTimer = null;
        this.currentFullText = '';

        this.storySlides = [
            {
                badge: 'Prólogo • A Carta do Vovô',
                icon: '✉️',
                title: 'Um Velho Envelope Guardado',
                text: 'Para você, meu querido neto(a)... Se estiver lendo isso, significa que você está exausto da rotina sufocante do mundo moderno. O mesmo aconteceu comigo anos atrás... Quando tudo parecer perdido, abra esta carta.'
            },
            {
                badge: 'Capítulo 1 • Joja Corp',
                icon: '🏢',
                title: 'Anos Mais Tarde...',
                text: 'Você está sentado diante da tela de um computador cinzento no 14º andar da Joja Corp. O ar condicionado chia, pilhas de relatórios se acumulam e o brilho dos seus olhos parece ter se apagado. Foi então que você se lembrou da carta do vovô no fundo da gaveta...'
            },
            {
                badge: 'Capítulo 2 • O Testamento',
                icon: '📜',
                title: 'A Velha Fazenda da Família',
                text: 'Você rompe o selo de cera: "Deixo para você o meu bem mais precioso: o antigo lote de terra da nossa família no Vale Afesu. É um lugar de terra fértil e paz verdadeira. Cuide bem dele!" Sem hesitar, você pede demissão e corre para a estação!'
            },
            {
                badge: 'Capítulo 3 • A Viagem de Ônibus',
                icon: '🚌',
                title: 'Rumo ao Vale',
                text: 'O ônibus sacoleja pela estrada de terra enquanto os prédios altos de concreto vão ficando para trás, dando lugar a colinas verdes, pinheiros perfumados e um céu azul cristalino. Você respira fundo pela primeira vez em anos.'
            },
            {
                badge: 'Chegada • O Novo Começo',
                icon: '🌾',
                title: 'Bem-vindo(a) à sua Fazenda!',
                text: 'Você desembarca diante da velha casa de madeira. A terra está esperando por você, a enxada e o regador estão ao seu alcance, e uma nova vida campestre começa agora!'
            }
        ];

        // Input State
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            shift: false
        };
        this.mouse = {
            screenX: 0,
            screenY: 0,
            worldX: 0,
            worldY: 0,
            down: false,
            rightDown: false
        };

        // Last loop timestamp
        this.lastTime = performance.now();
        this.isPaused = false;

        this.initEventListeners();
        this.updateHUD();
        this.renderInventoryHotbar();
        this.applyGameStateUI();
        this.checkSaveGame();
    }

    start() {
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    initEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            window.gameAudio.init();

            // Handling during Cutscene
            if (this.gameState === 'CUTSCENE') {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    this.advanceCutscene();
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    this.skipCutscene();
                }
                return;
            }

            // Handling during Menu
            if (this.gameState === 'MENU') {
                return;
            }

            // In-Game Keys
            if (e.code === 'Escape') {
                this.openSettingsModal();
                return;
            }

            if (['KeyW', 'ArrowUp'].includes(e.code)) this.input.up = true;
            if (['KeyS', 'ArrowDown'].includes(e.code)) this.input.down = true;
            if (['KeyA', 'ArrowLeft'].includes(e.code)) this.input.left = true;
            if (['KeyD', 'ArrowRight'].includes(e.code)) this.input.right = true;
            if (['ShiftLeft', 'ShiftRight'].includes(e.code)) this.input.shift = true;

            // Number keys 1-9, 0, -, = for hotbar slot selection
            if (e.code.startsWith('Digit')) {
                const num = parseInt(e.code.replace('Digit', ''));
                if (num >= 1 && num <= 9) this.selectSlot(num - 1);
                else if (num === 0) this.selectSlot(9);
            }
            if (e.code === 'Minus') this.selectSlot(10);
            if (e.code === 'Equal') this.selectSlot(11);

            // Action keys: Space or C to use tool, E or X to interact/sleep
            if (e.code === 'Space' || e.code === 'KeyC') {
                e.preventDefault();
                this.player.useAction(this.mouse);
                this.renderInventoryHotbar();
                this.updateHUD();
            }

            if (e.code === 'KeyE' || e.code === 'KeyX') {
                // Secondary action: interact / check
                this.player.useAction(this.mouse);
                this.renderInventoryHotbar();
                this.updateHUD();
            }

            // M to toggle music
            if (e.code === 'KeyM') {
                this.toggleMusic();
            }

            // H for Help / Guide
            if (e.code === 'KeyH') {
                this.toggleGuideModal();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (['KeyW', 'ArrowUp'].includes(e.code)) this.input.up = false;
            if (['KeyS', 'ArrowDown'].includes(e.code)) this.input.down = false;
            if (['KeyA', 'ArrowLeft'].includes(e.code)) this.input.left = false;
            if (['KeyD', 'ArrowRight'].includes(e.code)) this.input.right = false;
            if (['ShiftLeft', 'ShiftRight'].includes(e.code)) this.input.shift = false;
        });

        // Mouse interactions
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.screenX = e.clientX - rect.left;
            this.mouse.screenY = e.clientY - rect.top;

            this.mouse.worldX = (this.mouse.screenX / this.camera.zoom) + this.camera.x;
            this.mouse.worldY = (this.mouse.screenY / this.camera.zoom) + this.camera.y;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            window.gameAudio.init();

            if (this.gameState === 'CUTSCENE') {
                this.advanceCutscene();
                return;
            }
            if (this.gameState !== 'PLAYING') return;

            if (e.button === 0) {
                this.mouse.down = true;
                this.player.useAction({ x: this.mouse.worldX, y: this.mouse.worldY });
                this.renderInventoryHotbar();
                this.updateHUD();
            } else if (e.button === 2) {
                e.preventDefault();
                this.mouse.rightDown = true;
                this.player.useAction({ x: this.mouse.worldX, y: this.mouse.worldY });
                this.renderInventoryHotbar();
                this.updateHUD();
            }
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Mouse Wheel to cycle hotbar
        window.addEventListener('wheel', (e) => {
            if (e.deltaY > 0) {
                this.selectSlot((this.player.selectedSlot + 1) % 12);
            } else if (e.deltaY < 0) {
                this.selectSlot((this.player.selectedSlot + 11) % 12);
            }
        });

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx.imageSmoothingEnabled = false;
    }

    selectSlot(idx) {
        if (idx < 0 || idx >= 12) return;
        this.player.selectedSlot = idx;
        window.gameAudio.playSelect();
        this.renderInventoryHotbar();
    }

    // MAIN GAME LOOP
    gameLoop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        if (!this.isPaused) {
            this.update(dt);
        }
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
        if (this.gameState !== 'PLAYING') {
            // Animate ambient blossom petals in background during menu
            this.world.petals.forEach(petal => {
                petal.x -= petal.speed * 40 * dt;
                petal.y += petal.speed * 25 * dt;
                petal.drift += dt * 2;
                petal.x += Math.sin(petal.drift) * 0.5;

                const mapW = this.world.cols * this.world.tileSize;
                const mapH = this.world.rows * this.world.tileSize;
                if (petal.x < -10) petal.x = mapW + 10;
                if (petal.y > mapH + 10) petal.y = -10;
            });
            return;
        }

        // Update Time of Day
        this.timeTickTimer += dt;
        if (this.timeTickTimer >= this.timeTickInterval) {
            this.timeTickTimer = 0;
            this.timeMinutes += 10;
            if (this.timeMinutes >= 60) {
                this.timeMinutes = 0;
                this.timeHours++;
                if (this.timeHours >= 26) { // 2:00 AM: Collapse from exhaustion or sleep
                    this.triggerSleep();
                    return;
                }
            }
            this.updateHUDTime();
        }

        // Update Player & World
        this.player.update(dt, this.input);
        this.world.updateAnimals(dt, this.player);
        this.world.updateParticles(dt);

        // Update Camera Smooth follow
        const targetCamX = (this.player.x + 8) - (this.canvas.width / (2 * this.camera.zoom));
        const targetCamY = (this.player.y + 12) - (this.canvas.height / (2 * this.camera.zoom));

        this.camera.x += (targetCamX - this.camera.x) * 0.12;
        this.camera.y += (targetCamY - this.camera.y) * 0.12;

        // Clamp camera to map bounds
        const maxCamX = (this.world.cols * this.world.tileSize) - (this.canvas.width / this.camera.zoom);
        const maxCamY = (this.world.rows * this.world.tileSize) - (this.canvas.height / this.camera.zoom);

        this.camera.x = Math.max(0, Math.min(maxCamX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(maxCamY, this.camera.y));

        // Update Energy UI
        this.updateEnergyBar();
    }

    drawShadow(ctx, cx, cy, rx, ry, alpha = 0.28) {
        ctx.save();
        ctx.fillStyle = `rgba(12, 24, 10, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    render() {
        const ctx = this.ctx;
        const zoom = this.camera.zoom;
        const ts = this.world.tileSize;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.scale(zoom, zoom);
        ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

        // 1. RENDER TERRAIN TILES
        const minC = Math.max(0, Math.floor(this.camera.x / ts));
        const maxC = Math.min(this.world.cols - 1, Math.ceil((this.camera.x + this.canvas.width / zoom) / ts));
        const minR = Math.max(0, Math.floor(this.camera.y / ts));
        const maxR = Math.min(this.world.rows - 1, Math.ceil((this.camera.y + this.canvas.height / zoom) / ts));

        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                const tile = this.world.tiles[r][c];
                let spriteKey = 'tile_grass';

                if (tile.terrain === 'path') spriteKey = 'tile_path';
                else if (tile.terrain === 'water') spriteKey = 'tile_water';
                else if (tile.terrain === 'tilled_dry') spriteKey = 'tile_tilled_dry';
                else if (tile.terrain === 'tilled_wet') spriteKey = 'tile_tilled_wet';

                const spr = window.gameSprites.get(spriteKey);
                if (spr) {
                    ctx.drawImage(spr, c * ts, r * ts);
                }

                // Water animated shimmer & ripples
                if (tile.terrain === 'water') {
                    const wavePhase = (performance.now() * 0.003) + c * 1.3 + r * 1.7;
                    const wave = Math.sin(wavePhase);
                    if (wave > 0.25) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
                        ctx.fillRect(c * ts + 3 + (wave > 0.65 ? 1 : 0), r * ts + 5 + Math.floor(wave * 2), 4, 1);
                        ctx.fillStyle = 'rgba(180, 230, 255, 0.3)';
                        ctx.fillRect(c * ts + 8, r * ts + 11, 3, 1);
                    }
                }
                // Tilled Soil (Autotiling natural edge blends)
                else if (tile.terrain.startsWith('tilled')) {
                    if (r > 0 && this.world.tiles[r - 1][c].terrain === 'grass') {
                        ctx.fillStyle = 'rgba(40, 20, 10, 0.4)';
                        ctx.fillRect(c * ts, r * ts, ts, 2);
                    }
                    if (c > 0 && this.world.tiles[r][c - 1].terrain === 'grass') {
                        ctx.fillStyle = 'rgba(40, 20, 10, 0.3)';
                        ctx.fillRect(c * ts, r * ts, 2, ts);
                    }
                }

                // Render Crop if present on tile
                if (tile.crop) {
                    const cropSpr = window.gameSprites.get(`crop_${tile.crop.type}_${tile.crop.stage}`);
                    if (cropSpr) {
                        ctx.drawImage(cropSpr, c * ts, r * ts);
                    }
                }
            }
        }

        // 2. RENDER TARGET TILE RETICLE (Stardew Red/Gold Highlight Box)
        const targetTile = this.player.getTargetTile(this.mouse.worldX, this.mouse.worldY);
        if (targetTile) {
            ctx.strokeStyle = '#ffeaa7';
            ctx.lineWidth = 1;
            ctx.strokeRect(targetTile.c * ts + 0.5, targetTile.r * ts + 0.5, ts - 1, ts - 1);
            ctx.fillStyle = 'rgba(255, 234, 167, 0.2)';
            ctx.fillRect(targetTile.c * ts + 0.5, targetTile.r * ts + 0.5, ts - 1, ts - 1);
        }

        // 3. Y-SORTED ENTITY RENDERING (Depth sorting for 3D layered feel)
        const renderList = [];

        // Add fences & small ground objects
        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                const obj = this.world.tiles[r][c].object;
                if (!obj) continue;

                if (obj.type === 'fence') {
                    renderList.push({
                        y: r * ts + 14,
                        draw: () => {
                            const spr = window.gameSprites.get('obj_fence');
                            if (spr) ctx.drawImage(spr, c * ts, r * ts);
                        }
                    });
                } else if (obj.type === 'rock') {
                    renderList.push({
                        y: r * ts + 12,
                        draw: () => {
                            this.drawShadow(ctx, c * ts + 8, r * ts + 13, 6, 2.5);
                            const spr = window.gameSprites.get('obj_rock');
                            if (spr) ctx.drawImage(spr, c * ts, r * ts);
                        }
                    });
                } else if (obj.type === 'weed') {
                    renderList.push({
                        y: r * ts + 8,
                        draw: () => {
                            const spr = window.gameSprites.get('obj_weed');
                            if (spr) ctx.drawImage(spr, c * ts, r * ts);
                        }
                    });
                } else if (obj.type === 'log') {
                    renderList.push({
                        y: r * ts + 12,
                        draw: () => {
                            this.drawShadow(ctx, c * ts + 8, r * ts + 13, 7, 3);
                            const spr = window.gameSprites.get('obj_log');
                            if (spr) ctx.drawImage(spr, c * ts, r * ts);
                        }
                    });
                } else if (obj.type === 'egg') {
                    renderList.push({
                        y: r * ts + 8,
                        draw: () => {
                            this.drawShadow(ctx, c * ts + 8, r * ts + 13, 4, 1.5, 0.2);
                            const spr = window.gameSprites.get('icon_egg');
                            if (spr) ctx.drawImage(spr, c * ts + 2, r * ts + 2);
                        }
                    });
                } else if (obj.type === 'tree_oak' || obj.type === 'tree_pine') {
                    renderList.push({
                        y: r * ts + 14, // Exact base of tree trunk
                        draw: () => {
                            // Trunk touches ground at local y=45, sprite drawn at r*ts - 32
                            this.drawShadow(ctx, c * ts + 8, r * ts + 13, 9, 3.5, 0.35);
                            const spr = window.gameSprites.get(`obj_${obj.type}`);
                            if (spr) ctx.drawImage(spr, c * ts - 8, r * ts - 32);
                        }
                    });
                } else if (obj.type === 'farmhouse') {
                    renderList.push({
                        y: r * ts + 78, // Base of 96x80 enlarged farmhouse foundation
                        draw: () => {
                            this.drawShadow(ctx, c * ts + 48, r * ts + 78, 44, 5, 0.35);
                            const spr = window.gameSprites.get('building_farmhouse');
                            if (spr) ctx.drawImage(spr, c * ts, r * ts);
                        }
                    });
                } else if (obj.type === 'barn') {
                    renderList.push({
                        y: r * ts + 70, // Base of 80x72 celeiro
                        draw: () => {
                            this.drawShadow(ctx, c * ts + 40, r * ts + 70, 38, 5, 0.35);
                            const spr = window.gameSprites.get('building_barn');
                            if (spr) ctx.drawImage(spr, c * ts, r * ts);
                        }
                    });
                } else if (obj.type === 'shipping_bin') {
                    renderList.push({
                        y: r * ts + 20, // Base of wooden shipping chest on barn porch
                        draw: () => {
                            this.drawShadow(ctx, c * ts + 16, r * ts + 20, 13, 2.5, 0.35);
                            const spr = window.gameSprites.get('obj_shipping_bin');
                            if (spr) ctx.drawImage(spr, c * ts, r * ts);
                        }
                    });
                }
            }
        }

        // Add Animals with multi-frame walking and actions
        this.world.animals.forEach(animal => {
            renderList.push({
                y: animal.y + (animal.type === 'chicken' ? 14 : 22),
                draw: () => {
                    const sprKey = `animal_${animal.type}_${animal.frame}`;
                    const spr = window.gameSprites.get(sprKey) || window.gameSprites.get(`animal_${animal.type}_0`) || window.gameSprites.get(`animal_${animal.type}`);
                    if (spr) {
                        ctx.save();
                        // Contact shadow directly beneath feet
                        if (animal.type === 'chicken') {
                            this.drawShadow(ctx, animal.x + 8, animal.y + 13, 5, 1.8, 0.28);
                        } else {
                            this.drawShadow(ctx, animal.x + 16, animal.y + 21, 11, 3, 0.3);
                        }

                        // Flip horizontally if facing left
                        if (animal.dir === 'left') {
                            ctx.translate(animal.x + animal.w, animal.y);
                            ctx.scale(-1, 1);
                            ctx.drawImage(spr, 0, 0);
                        } else {
                            ctx.drawImage(spr, animal.x, animal.y);
                        }
                        ctx.restore();
                    }
                }
            });
        });

        // Add Player
        renderList.push({
            y: this.player.y + 22,
            draw: () => {
                // Drop shadow directly beneath boots
                this.drawShadow(ctx, this.player.x + 8, this.player.y + 22, 5.5, 2, 0.28);

                let sprKey = `farmer_${this.player.dir}_${this.player.animFrame}`;
                if (this.player.state === 'acting') sprKey = `farmer_${this.player.dir}_action`;
                else if (this.player.state === 'pose') sprKey = `farmer_${this.player.dir}_pose`;

                const spr = window.gameSprites.get(sprKey);
                if (spr) {
                    ctx.drawImage(spr, this.player.x, this.player.y);
                }

                // If player is posing with item above head (Stardew Harvest triumph!)
                if (this.player.state === 'pose' && this.player.heldItemAboveHead) {
                    const heldSpr = window.gameSprites.get(this.player.heldItemAboveHead);
                    if (heldSpr) {
                        ctx.drawImage(heldSpr, this.player.x, this.player.y - 14);
                    }
                }
            }
        });

        // Sort all entities by Y position and draw in order
        renderList.sort((a, b) => a.y - b.y);
        renderList.forEach(item => item.draw());

        // 4. RENDER PARTICLES & FLOATING TEXTS
        this.world.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size || 2, p.size || 2);
        });

        this.world.floatingTexts.forEach(ft => {
            ctx.font = 'bold 8px VT323, monospace';
            ctx.fillStyle = ft.color;
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
        });

        // 5. AMBIENT WIND BLOSSOM PETALS
        this.world.petals.forEach(petal => {
            ctx.fillStyle = petal.color;
            ctx.fillRect(petal.x, petal.y, petal.size, petal.size);
        });

        ctx.restore();

        // 6. DAY / NIGHT LIGHTING OVERLAY
        this.renderLightingOverlay();
    }

    renderLightingOverlay() {
        const totalMinutes = this.timeHours * 60 + this.timeMinutes;
        // 06:00 (360m) to 26:00 (1560m)
        let alpha = 0;
        let color = '0, 0, 40';

        if (totalMinutes < 480) {
            // Early morning golden glow (06:00 to 08:00)
            const factor = 1 - (totalMinutes - 360) / 120;
            color = '255, 180, 50';
            alpha = factor * 0.15;
        } else if (totalMinutes >= 480 && totalMinutes < 1020) {
            // Clear daylight (08:00 to 17:00)
            alpha = 0;
        } else if (totalMinutes >= 1020 && totalMinutes < 1200) {
            // Sunset / Dusk (17:00 to 20:00)
            const factor = (totalMinutes - 1020) / 180;
            color = '240, 100, 30'; // warm amber orange dusk
            alpha = factor * 0.35;
        } else {
            // Night (20:00 to 02:00)
            const factor = Math.min(1, (totalMinutes - 1200) / 120);
            color = '10, 15, 45'; // deep night indigo
            alpha = 0.35 + factor * 0.42;
        }

        if (alpha > 0.02) {
            this.ctx.fillStyle = `rgba(${color}, ${alpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // If it's dusk or night time, render cozy lighting
            if (totalMinutes >= 1020 || totalMinutes < 450) {
                const zoom = this.camera.zoom;

                // 1. Cozy Farmhouse Window Amber Glow
                const winX = (12 * 16 + 43 - this.camera.x) * zoom;
                const winY = (2 * 16 + 46 - this.camera.y) * zoom;
                if (winX > -80 && winX < this.canvas.width + 80 && winY > -80 && winY < this.canvas.height + 80) {
                    const winGlow = this.ctx.createRadialGradient(winX, winY, 6, winX, winY, 55 * zoom);
                    winGlow.addColorStop(0, 'rgba(255, 230, 130, 0.42)');
                    winGlow.addColorStop(0.6, 'rgba(255, 180, 60, 0.16)');
                    winGlow.addColorStop(1, 'rgba(255, 180, 60, 0)');
                    this.ctx.fillStyle = winGlow;
                    this.ctx.fillRect(winX - 60 * zoom, winY - 60 * zoom, 120 * zoom, 120 * zoom);
                }

                // 2. Lantern glow around player
                const px = (this.player.x + 8 - this.camera.x) * zoom;
                const py = (this.player.y + 12 - this.camera.y) * zoom;

                const playerGlow = this.ctx.createRadialGradient(px, py, 8, px, py, 75 * zoom);
                playerGlow.addColorStop(0, 'rgba(255, 235, 160, 0.42)');
                playerGlow.addColorStop(0.5, 'rgba(255, 195, 90, 0.18)');
                playerGlow.addColorStop(1, 'rgba(255, 195, 90, 0)');

                this.ctx.fillStyle = playerGlow;
                this.ctx.fillRect(px - 85 * zoom, py - 85 * zoom, 170 * zoom, 170 * zoom);
            }
        }

        // 3. Render ambient glowing fireflies at dusk & night
        if ((totalMinutes >= 1050 || totalMinutes < 480) && this.world.fireflies) {
            const zoom = this.camera.zoom;
            this.world.fireflies.forEach(f => {
                const fx = (f.x - this.camera.x) * zoom;
                const fy = (f.y - this.camera.y) * zoom;
                if (fx >= -10 && fx <= this.canvas.width + 10 && fy >= -10 && fy <= this.canvas.height + 10) {
                    const pulse = 0.4 + 0.6 * Math.sin(f.pulsePhase);
                    // Core
                    this.ctx.fillStyle = `rgba(255, 245, 120, ${0.8 * pulse})`;
                    this.ctx.beginPath();
                    this.ctx.arc(fx, fy, (f.size || 2) * zoom * 0.7, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Soft glowing aura
                    this.ctx.fillStyle = `rgba(255, 230, 80, ${0.25 * pulse})`;
                    this.ctx.beginPath();
                    this.ctx.arc(fx, fy, (f.size || 2) * zoom * 2.2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
        }
    }

    // UI & HUD MANAGEMENT
    updateHUD() {
        this.updateHUDTime();
        this.updateGoldCounter();
        this.updateEnergyBar();
    }

    updateHUDTime() {
        const clockEl = document.getElementById('hudTime');
        const dayEl = document.getElementById('hudDay');
        const seasonEl = document.getElementById('hudSeason');

        let displayHour = this.timeHours % 24;
        let period = 'AM';
        if (displayHour >= 12 && displayHour < 24) period = 'PM';
        let formattedHour = displayHour % 12;
        if (formattedHour === 0) formattedHour = 12;
        const formattedMin = this.timeMinutes < 10 ? `0${this.timeMinutes}` : this.timeMinutes;

        if (clockEl) clockEl.innerText = `${formattedHour}:${formattedMin} ${period}`;
        if (dayEl) dayEl.innerText = `${this.dayOfWeek} ${this.day}`;
        if (seasonEl) seasonEl.innerText = this.season;
    }

    updateGoldCounter() {
        const goldEl = document.getElementById('hudGold');
        if (goldEl) {
            goldEl.innerText = `${this.player.gold} g`;
        }
    }

    updateEnergyBar() {
        const barFill = document.getElementById('energyFill');
        const valText = document.getElementById('energyText');
        const pct = Math.max(0, Math.min(100, (this.player.energy / this.player.maxEnergy) * 100));

        if (barFill) {
            barFill.style.height = `${pct}%`;
            if (pct < 20) {
                barFill.style.background = 'linear-gradient(to top, #c0392b, #e74c3c)';
            } else if (pct < 50) {
                barFill.style.background = 'linear-gradient(to top, #d35400, #f39c12)';
            } else {
                barFill.style.background = 'linear-gradient(to top, #27ae60, #2ecc71)';
            }
        }
        if (valText) {
            valText.innerText = Math.round(this.player.energy);
        }
    }

    renderInventoryHotbar() {
        const container = document.getElementById('hotbarSlots');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < 12; i++) {
            const item = this.player.inventory[i];
            const slot = document.createElement('div');
            slot.className = `hotbar-slot ${this.player.selectedSlot === i ? 'selected' : ''}`;
            slot.dataset.index = i;

            // Slot number key badge
            const numBadge = document.createElement('div');
            numBadge.className = 'slot-key';
            numBadge.innerText = (i === 9) ? '0' : (i === 10 ? '-' : (i === 11 ? '=' : (i + 1)));
            slot.appendChild(numBadge);

            if (item) {
                const iconCanvas = window.gameSprites.get(item.icon);
                if (iconCanvas) {
                    const img = document.createElement('img');
                    img.src = iconCanvas.toDataURL();
                    img.className = 'slot-icon';
                    img.alt = item.name;
                    slot.appendChild(img);
                }

                // Count badge
                if (item.count && item.count > 1) {
                    const countBadge = document.createElement('div');
                    countBadge.className = 'slot-count';
                    countBadge.innerText = item.count;
                    slot.appendChild(countBadge);
                }

                // Watering can water gauge
                if (item.id === 'watering_can') {
                    const waterGauge = document.createElement('div');
                    waterGauge.className = 'slot-water-gauge';
                    const fillPct = (item.water / item.maxWater) * 100;
                    waterGauge.innerHTML = `<div class="water-fill" style="width: ${fillPct}%"></div>`;
                    slot.appendChild(waterGauge);
                }

                slot.title = `${item.name}\n${item.desc || ''}`;
            }

            slot.addEventListener('click', () => {
                this.selectSlot(i);
            });

            container.appendChild(slot);
        }
    }

    toggleMusic() {
        const active = window.gameAudio.toggleMusic();
        const musicBtn = document.getElementById('btnMusic');
        if (musicBtn) {
            musicBtn.innerHTML = active ? '🎵 Música: Ligada' : '🔇 Música: Desligada';
            musicBtn.classList.toggle('active', active);
        }
        this.updateSettingsUI();
    }

    triggerSleep() {
        this.isPaused = true;
        const ledger = this.world.advanceDay();

        // Advance Calendar
        this.day++;
        this.timeHours = 6;
        this.timeMinutes = 0;
        this.player.energy = this.player.maxEnergy; // Fully rest
        this.player.gold += ledger.totalRevenue;

        // Days of week cycle
        const dows = ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'];
        this.dayOfWeek = dows[(this.day - 1) % 7];

        window.gameAudio.playHarvest();

        // Show Stardew End of Day Ledger Modal
        const modal = document.getElementById('sleepModal');
        const details = document.getElementById('sleepDetails');
        const revEl = document.getElementById('sleepRevenue');

        if (modal && details && revEl) {
            let html = '<div class="ledger-list">';
            if (Object.keys(ledger.soldSummary).length === 0) {
                html += '<p class="empty-bin">Nenhum item depositado no caixote de vendas hoje.</p>';
            } else {
                for (const [name, qty] of Object.entries(ledger.soldSummary)) {
                    html += `<div class="ledger-row"><span>${name} x${qty}</span></div>`;
                }
            }
            html += '</div>';
            details.innerHTML = html;
            revEl.innerText = `+${ledger.totalRevenue} G`;
            modal.classList.add('visible');
        }

        this.updateHUD();
        this.renderInventoryHotbar();
    }

    wakeUpNewDay() {
        const modal = document.getElementById('sleepModal');
        if (modal) modal.classList.remove('visible');
        this.isPaused = false;
        this.lastTime = performance.now();
        window.gameAudio.playHarvest();
        this.player.x = 10.5 * 16;
        this.player.y = 7 * 16; // Wakes up outside farmhouse porch door
        this.world.addFloatingText(`Dia ${this.day} de ${this.season}! ☀️`, this.player.x, this.player.y - 16, '#f1c40f');
        this.saveGame();
    }

    toggleGuideModal() {
        const modal = document.getElementById('guideModal');
        if (modal) {
            modal.classList.toggle('visible');
            if (modal.classList.contains('visible') && !modal._hasOverlayClick) {
                modal._hasOverlayClick = true;
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('visible');
                    }
                });
            }
        }
    }

    // ==========================================
    // UI SCREEN MANAGEMENT & STATE TRANSITIONS
    // ==========================================
    applyGameStateUI() {
        const mainMenu = document.getElementById('mainMenuScreen');
        const cutscene = document.getElementById('cutsceneScreen');
        const hudClock = document.querySelector('.hud-clock-widget');
        const topBar = document.querySelector('.top-bar-controls');
        const hotbar = document.querySelector('.hotbar-container');
        const energy = document.querySelector('.energy-container');

        if (this.gameState === 'MENU') {
            if (mainMenu) mainMenu.style.display = 'flex';
            if (cutscene) cutscene.style.display = 'none';
            if (hudClock) hudClock.style.display = 'none';
            if (topBar) topBar.style.display = 'none';
            if (hotbar) hotbar.style.display = 'none';
            if (energy) energy.style.display = 'none';
        } else if (this.gameState === 'CUTSCENE') {
            if (mainMenu) mainMenu.style.display = 'none';
            if (cutscene) cutscene.style.display = 'flex';
            if (hudClock) hudClock.style.display = 'none';
            if (topBar) topBar.style.display = 'none';
            if (hotbar) hotbar.style.display = 'none';
            if (energy) energy.style.display = 'none';
        } else { // 'PLAYING'
            if (mainMenu) mainMenu.style.display = 'none';
            if (cutscene) cutscene.style.display = 'none';
            if (hudClock) hudClock.style.display = 'flex';
            if (topBar) topBar.style.display = 'flex';
            if (hotbar) hotbar.style.display = 'flex';
            if (energy) energy.style.display = 'flex';
        }
    }

    // ==========================================
    // STORY INTRO & CUTSCENE PROLOGUE
    // ==========================================
    startNewGameStory() {
        window.gameAudio.init();
        window.gameAudio.playPaper();

        // Fresh world and player setup for a brand new game
        this.world = new World(36, 26);
        this.player = new Player(this.world, 10.5 * 16, 7 * 16);
        this.day = 1;
        this.dayOfWeek = 'Seg.';
        this.season = 'Primavera';
        this.timeHours = 6;
        this.timeMinutes = 0;
        this.updateHUD();
        this.renderInventoryHotbar();

        // Open Character Creation screen first before prologue!
        this.openCharCreator();
    }

    startCutsceneAfterCharCreation() {
        this.gameState = 'CUTSCENE';
        this.cutsceneIndex = 0;
        this.applyGameStateUI();
        this.displayCutsceneSlide(0);
    }

    displayCutsceneSlide(index) {
        if (index < 0 || index >= this.storySlides.length) return;
        this.cutsceneIndex = index;
        const slide = this.storySlides[index];

        const badgeEl = document.getElementById('cutsceneChapterBadge');
        const iconEl = document.getElementById('cutsceneVisualIcon');
        const titleEl = document.getElementById('cutsceneTitle');
        const textEl = document.getElementById('cutsceneText');
        const btnNext = document.getElementById('btnCutsceneNext');

        if (badgeEl) badgeEl.innerText = slide.badge;
        if (iconEl) iconEl.innerText = slide.icon;
        if (titleEl) titleEl.innerText = slide.title;

        if (btnNext) {
            if (index === this.storySlides.length - 1) {
                btnNext.innerHTML = '🌾 Entrar na Fazenda!';
                btnNext.classList.add('primary');
            } else {
                btnNext.innerHTML = 'Avançar História ▸';
                btnNext.classList.remove('primary');
            }
        }

        // Animated typewriter text effect
        if (this.cutsceneTimer) {
            clearInterval(this.cutsceneTimer);
            this.cutsceneTimer = null;
        }

        this.currentFullText = slide.text;
        if (textEl) {
            textEl.innerText = '';
            this.cutsceneTyping = true;
            let charIdx = 0;

            this.cutsceneTimer = setInterval(() => {
                if (charIdx < this.currentFullText.length) {
                    textEl.innerText += this.currentFullText[charIdx];
                    if (charIdx % 3 === 0 && this.currentFullText[charIdx] !== ' ') {
                        window.gameAudio.playTextLetter();
                    }
                    charIdx++;
                } else {
                    clearInterval(this.cutsceneTimer);
                    this.cutsceneTimer = null;
                    this.cutsceneTyping = false;
                }
            }, 24);
        }
    }

    advanceCutscene() {
        window.gameAudio.init();

        // If typewriter is still animating, instantly finish full text on click/key
        if (this.cutsceneTyping && this.cutsceneTimer) {
            clearInterval(this.cutsceneTimer);
            this.cutsceneTimer = null;
            this.cutsceneTyping = false;
            const textEl = document.getElementById('cutsceneText');
            if (textEl) textEl.innerText = this.currentFullText;
            return;
        }

        // Otherwise go to next story slide or enter gameplay
        if (this.cutsceneIndex < this.storySlides.length - 1) {
            window.gameAudio.playPaper();
            this.displayCutsceneSlide(this.cutsceneIndex + 1);
        } else {
            this.enterGameFromStory();
        }
    }

    skipCutscene() {
        window.gameAudio.init();
        window.gameAudio.playSelect();
        this.enterGameFromStory();
    }

    enterGameFromStory() {
        if (this.cutsceneTimer) {
            clearInterval(this.cutsceneTimer);
            this.cutsceneTimer = null;
        }
        this.cutsceneTyping = false;
        this.gameState = 'PLAYING';
        this.isPaused = false;
        this.lastTime = performance.now();
        this.applyGameStateUI();
        this.saveGame();
        window.gameAudio.playHarvest();
        this.world.addFloatingText('🌾 Bem-vindo(a) ao Vale Afesu!', this.player.x, this.player.y - 20, '#f1c40f');
    }

    // ==========================================
    // SETTINGS / CONFIGURAÇÕES MODAL
    // ==========================================
    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('visible');
            this.updateSettingsUI();
            if (!modal._hasOverlayClick) {
                modal._hasOverlayClick = true;
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeSettingsModal();
                    }
                });
            }
        }
    }

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) modal.classList.remove('visible');
    }

    updateSettingsUI() {
        const musicBtn = document.getElementById('btnSettingsMusicToggle');
        if (musicBtn) {
            musicBtn.innerText = window.gameAudio.musicEnabled ? '🎵 Música: Tocando ♫' : '🎵 Música: Desligada';
            musicBtn.classList.toggle('active', window.gameAudio.musicEnabled);
        }
        const sfxBtn = document.getElementById('btnSettingsSfxToggle');
        if (sfxBtn) {
            sfxBtn.innerText = window.gameAudio.soundEnabled ? '🔊 Sons: Ligados' : '🔇 Sons: Mudos';
            sfxBtn.classList.toggle('active', window.gameAudio.soundEnabled);
        }
        // Speed selectors
        const btnFast = document.getElementById('btnSpeedFast');
        const btnNorm = document.getElementById('btnSpeedNormal');
        const btnSlow = document.getElementById('btnSpeedSlow');
        if (btnFast) btnFast.classList.toggle('active', Math.abs(this.timeTickInterval - 2.5) < 0.1);
        if (btnNorm) btnNorm.classList.toggle('active', Math.abs(this.timeTickInterval - 5.0) < 0.1);
        if (btnSlow) btnSlow.classList.toggle('active', Math.abs(this.timeTickInterval - 7.5) < 0.1);
    }

    setDaySpeed(seconds, label) {
        window.gameAudio.init();
        window.gameAudio.playSelect();
        this.timeTickInterval = seconds;
        this.updateSettingsUI();
        this.saveGame();
        if (this.gameState === 'PLAYING') {
            this.world.addFloatingText(`⏱️ Ritmo do dia: ${label}`, this.player.x, this.player.y - 16, '#3498db');
        }
    }

    toggleSfx() {
        window.gameAudio.init();
        window.gameAudio.soundEnabled = !window.gameAudio.soundEnabled;
        this.updateSettingsUI();
        if (window.gameAudio.soundEnabled) {
            window.gameAudio.playSelect();
        }
    }

    // ==========================================
    // SAVE / LOAD SYSTEM & MAIN MENU
    // ==========================================
    saveGame() {
        try {
            const saveData = {
                day: this.day,
                dayOfWeek: this.dayOfWeek,
                season: this.season,
                timeHours: this.timeHours,
                timeMinutes: this.timeMinutes,
                timeTickInterval: this.timeTickInterval,
                characterConfig: this.characterConfig,
                player: {
                    x: this.player.x,
                    y: this.player.y,
                    energy: this.player.energy,
                    maxEnergy: this.player.maxEnergy,
                    gold: this.player.gold,
                    inventory: this.player.inventory,
                    selectedSlot: this.player.selectedSlot
                },
                tiles: this.world.tiles.map(row => row.map(tile => ({
                    terrain: tile.terrain,
                    crop: tile.crop ? { ...tile.crop } : null,
                    hasObject: !!tile.object,
                    objectType: tile.object && !tile.object.parent ? tile.object.type : null
                }))),
                shippingBinItems: this.world.shippingBinItems
            };
            localStorage.setItem('stardew_farm_save', JSON.stringify(saveData));
            this.checkSaveGame();
        } catch (e) {
            console.warn('Erro ao salvar no localStorage:', e);
        }
    }

    loadGame() {
        try {
            const raw = localStorage.getItem('stardew_farm_save');
            if (!raw) return false;
            const saveData = JSON.parse(raw);
            if (!saveData || !saveData.player) return false;

            this.day = saveData.day || 1;
            this.dayOfWeek = saveData.dayOfWeek || 'Seg.';
            this.season = saveData.season || 'Primavera';
            this.timeHours = saveData.timeHours !== undefined ? saveData.timeHours : 6;
            this.timeMinutes = saveData.timeMinutes !== undefined ? saveData.timeMinutes : 0;
            if (saveData.timeTickInterval) this.timeTickInterval = saveData.timeTickInterval;

            if (saveData.characterConfig) {
                this.characterConfig = Object.assign(this.characterConfig, saveData.characterConfig);
                window.gameSprites.updateFarmerCustomization(this.characterConfig);
            }

            this.player.x = saveData.player.x;
            this.player.y = saveData.player.y;
            this.player.energy = saveData.player.energy;
            this.player.maxEnergy = saveData.player.maxEnergy || 100;
            this.player.gold = saveData.player.gold;
            if (saveData.player.inventory) this.player.inventory = saveData.player.inventory;
            if (saveData.player.selectedSlot !== undefined) this.player.selectedSlot = saveData.player.selectedSlot;

            // Restore farm terrain & crops
            if (saveData.tiles && Array.isArray(saveData.tiles)) {
                for (let r = 0; r < this.world.rows; r++) {
                    if (!saveData.tiles[r]) continue;
                    for (let c = 0; c < this.world.cols; c++) {
                        const st = saveData.tiles[r][c];
                        if (!st || !this.world.tiles[r] || !this.world.tiles[r][c]) continue;
                        if (st.terrain) this.world.tiles[r][c].terrain = st.terrain;
                        this.world.tiles[r][c].crop = st.crop;
                        if (st.objectType === null && this.world.tiles[r][c].object &&
                            ['tree_oak', 'tree_pine', 'rock', 'weed', 'wood_log'].includes(this.world.tiles[r][c].object.type)) {
                            this.world.tiles[r][c].object = null;
                        }
                    }
                }
            }

            if (saveData.shippingBinItems) {
                this.world.shippingBinItems = saveData.shippingBinItems;
            }

            this.updateHUD();
            this.renderInventoryHotbar();
            this.updateSettingsUI();
            return true;
        } catch (e) {
            console.error('Falha ao carregar jogo salvo:', e);
            return false;
        }
    }

    continueGame() {
        window.gameAudio.init();
        if (this.loadGame()) {
            window.gameAudio.playHarvest();
            this.gameState = 'PLAYING';
            this.isPaused = false;
            this.lastTime = performance.now();
            this.applyGameStateUI();
            this.world.addFloatingText('💾 Jogo Carregado com Sucesso!', this.player.x, this.player.y - 20, '#2ecc71');
        } else {
            this.startNewGameStory();
        }
    }

    checkSaveGame() {
        const btn = document.getElementById('btnMenuContinue');
        if (!btn) return;
        const save = localStorage.getItem('stardew_farm_save');
        if (save) {
            try {
                const data = JSON.parse(save);
                btn.style.display = 'block';
                btn.innerHTML = `💾 Continuar (Dia ${data.day || 1}, ${data.season || 'Primavera'})`;
            } catch (e) {
                btn.style.display = 'block';
                btn.innerHTML = '💾 Continuar Fazenda';
            }
        } else {
            btn.style.display = 'none';
        }
    }

    returnToMainMenu() {
        window.gameAudio.init();
        window.gameAudio.playSelect();
        this.saveGame();
        this.closeSettingsModal();
        this.gameState = 'MENU';
        this.applyGameStateUI();
        this.checkSaveGame();
    }

    resetSaveData() {
        if (confirm('Tem certeza de que deseja apagar todos os dados salvos e reiniciar sua fazenda do zero?')) {
            localStorage.removeItem('stardew_farm_save');
            window.location.reload();
        }
    }

    // ==========================================
    // CHARACTER CREATOR CONTROLS
    // ==========================================
    openCharCreator() {
        const modal = document.getElementById('charCreatorModal');
        if (!modal) return;
        modal.classList.add('visible');
        this.initCharCreatorForm();
        this.updateCharPreview();
    }

    closeCharCreator() {
        const modal = document.getElementById('charCreatorModal');
        if (modal) modal.classList.remove('visible');
    }

    initCharCreatorForm() {
        const nameInput = document.getElementById('charNameInput');
        const farmInput = document.getElementById('charFarmInput');
        if (nameInput) nameInput.value = this.characterConfig.name;
        if (farmInput) farmInput.value = this.characterConfig.farmName;

        // Sync gender buttons
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.gender === this.characterConfig.gender);
        });

        // Sync active swatch chips
        this.syncActiveSwatches();
    }

    syncActiveSwatches() {
        const cfg = this.characterConfig;
        document.querySelectorAll('.color-chip').forEach(chip => {
            const field = chip.dataset.field;
            const val = chip.dataset.val;
            if (field && val) {
                chip.classList.toggle('active', cfg[field] === val);
            }
        });
        document.querySelectorAll('.style-choice-btn').forEach(btn => {
            const field = btn.dataset.field;
            const val = btn.dataset.val;
            if (field && val) {
                btn.classList.toggle('active', cfg[field] === val);
            }
        });
    }

    setGender(g) {
        window.gameAudio.init();
        window.gameAudio.playSelect();
        this.characterConfig.gender = g;
        if (g === 'male') {
            this.characterConfig.hairStyle = 'short';
            this.characterConfig.pantsType = 'overalls';
        } else if (g === 'female') {
            this.characterConfig.hairStyle = 'long';
        }
        window.gameSprites.updateFarmerCustomization(this.characterConfig);
        this.syncActiveSwatches();
        this.updateCharPreview();
    }

    updateCharCustomization(field, value) {
        window.gameAudio.init();
        window.gameAudio.playSelect();
        this.characterConfig[field] = value;
        window.gameSprites.updateFarmerCustomization(this.characterConfig);
        this.syncActiveSwatches();
        this.updateCharPreview();
    }

    rotateCharPreview(delta) {
        window.gameAudio.init();
        window.gameAudio.playSelect();
        const dirs = ['down', 'right', 'up', 'left'];
        let idx = dirs.indexOf(this.previewDir);
        idx = (idx + delta + dirs.length) % dirs.length;
        this.previewDir = dirs[idx];
        this.updateCharPreview();
    }

    updateCharPreview() {
        const canvas = document.getElementById('charPreviewCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Character sprite is 16x24. Scale up 5x onto 120x150 canvas
        const sprKey = `farmer_${this.previewDir}_0`;
        const spr = window.gameSprites.get(sprKey);
        if (!spr) return;

        const scale = 5;
        const dw = 16 * scale;
        const dh = 24 * scale;
        const dx = Math.floor((canvas.width - dw) / 2);
        const dy = Math.floor((canvas.height - dh) / 2) + 6;

        // Pedestal shadow
        ctx.fillStyle = 'rgba(20, 30, 20, 0.35)';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, dy + dh - 4, 30, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw farmer sprite
        ctx.drawImage(spr, dx, dy, dw, dh);
    }

    randomizeCharacter() {
        window.gameAudio.init();
        window.gameAudio.playHarvest();

        const pick = arr => arr[Math.floor(Math.random() * arr.length)];
        const skins = ['#fcd0a1', '#f5c396', '#e0ac69', '#c68642', '#8d5524'];
        const hairs = ['short', 'long', 'curly'];
        const hairColors = ['#5c3317', '#d4ac0d', '#111111', '#c0392b', '#e84393', '#0984e3', '#ecf0f1'];
        const eyes = ['#5c3317', '#222222', '#2980b9', '#27ae60', '#d35400'];
        const hats = ['none', 'straw', 'cap', 'beanie', 'flower'];
        const glasses = ['none', 'round', 'classic', 'sunglasses'];
        const shirts = ['#d63031', '#27ae60', '#2980b9', '#e67e22', '#8e44ad', '#ecf0f1'];
        const pants = ['overalls', 'jeans', 'skirt'];
        const pantsCols = ['#2e6b9e', '#4a3525', '#2c3e50', '#27ae60', '#8c2d19'];
        const boots = ['#3e2723', '#16a085', '#2d3436', '#bdc3c7'];

        this.characterConfig.skin = pick(skins);
        this.characterConfig.hairStyle = pick(hairs);
        this.characterConfig.hairColor = pick(hairColors);
        this.characterConfig.eyeColor = pick(eyes);
        this.characterConfig.hat = pick(hats);
        this.characterConfig.glasses = pick(glasses);
        this.characterConfig.shirtColor = pick(shirts);
        this.characterConfig.pantsType = pick(pants);
        this.characterConfig.pantsColor = pick(pantsCols);
        this.characterConfig.bootsColor = pick(boots);

        window.gameSprites.updateFarmerCustomization(this.characterConfig);
        this.syncActiveSwatches();
        this.updateCharPreview();
    }

    confirmCharacterCreation() {
        window.gameAudio.init();
        window.gameAudio.playHarvest();

        const nameInput = document.getElementById('charNameInput');
        const farmInput = document.getElementById('charFarmInput');
        if (nameInput && nameInput.value.trim()) {
            this.characterConfig.name = nameInput.value.trim();
        }
        if (farmInput && farmInput.value.trim()) {
            this.characterConfig.farmName = farmInput.value.trim();
        }

        // Personalize story cutscene slides
        this.storySlides[0].text = `Para você, ${this.characterConfig.name}... Se estiver lendo isso, significa que você está exausto(a) da rotina sufocante do mundo moderno. O mesmo aconteceu comigo anos atrás... Quando tudo parecer perdido, abra esta carta.`;
        this.storySlides[2].text = `Você rompe o selo de cera: "Deixo para você o meu bem mais precioso: a Fazenda ${this.characterConfig.farmName}. É um lugar de terra fértil e paz verdadeira. Cuide bem dela!" Sem hesitar, você pede demissão e corre para a estação!`;
        this.storySlides[4].title = `Bem-vindo(a) à Fazenda ${this.characterConfig.farmName}!`;
        this.storySlides[4].text = `Você desembarca diante da acolhedora cabana de madeira. A terra está esperando por você, a enxada e o regador estão ao seu alcance, e sua nova vida começa agora!`;

        this.closeCharCreator();
        this.startCutsceneAfterCharCreation();
    }

    // ==========================================
    // HOUSE INTERIOR & COZY LIVING
    // ==========================================
    openHouseInterior() {
        window.gameAudio.init();
        window.gameAudio.playDoor();
        const modal = document.getElementById('houseInteriorModal');
        if (!modal) return;
        modal.classList.add('visible');
        this.updateHouseCookingUI();
        this.updateHouseFireplaceUI();
        if (!modal._hasOverlayClick) {
            modal._hasOverlayClick = true;
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeHouseInterior();
            });
        }
    }

    closeHouseInterior() {
        window.gameAudio.playDoor();
        const modal = document.getElementById('houseInteriorModal');
        if (modal) modal.classList.remove('visible');
    }

    sleepInHouseBed() {
        this.closeHouseInterior();
        this.triggerSleep();
    }

    updateHouseFireplaceUI() {
        const fpBtn = document.getElementById('btnToggleFireplace');
        const fpText = document.getElementById('fireplaceStatus');
        if (fpBtn) {
            fpBtn.innerText = this.fireplaceActive ? '🔥 Apagar Lareira' : '🪵 Acender Lareira';
        }
        if (fpText) {
            fpText.innerText = this.fireplaceActive ? 'Acesa com brasas acolhedoras' : 'Apagada';
        }
    }

    toggleFireplace() {
        window.gameAudio.init();
        this.fireplaceActive = !this.fireplaceActive;
        if (this.fireplaceActive) {
            window.gameAudio.playFireplace();
        } else {
            window.gameAudio.playSelect();
        }
        this.updateHouseFireplaceUI();
    }

    updateHouseCookingUI() {
        const recipes = [
            {
                id: 'omelette',
                name: 'Omelete Caipira Especial',
                icon: '🍳',
                ingredients: '1x Ovo Fresco',
                hasIngredients: this.player.inventory.some(i => i && i.type === 'egg' && i.count >= 1),
                energy: '+50 Energia',
                desc: 'Ovos caipiras fritos com manteiga dourada.'
            },
            {
                id: 'parsnip_soup',
                name: 'Sopa Cremosa de Chirívia',
                icon: '🥣',
                ingredients: '1x Chirívia',
                hasIngredients: this.player.inventory.some(i => i && i.type === 'crop_parsnip' && i.count >= 1),
                energy: '+65 Energia',
                desc: 'Sopa aveludada servida quentinha na cumbuca.'
            },
            {
                id: 'berry_tart',
                name: 'Torta de Frutas Silvestres',
                icon: '🥧',
                ingredients: '1x Chirívia + 1x Ovo',
                hasIngredients: this.player.inventory.some(i => i && i.type === 'crop_parsnip' && i.count >= 1) &&
                               this.player.inventory.some(i => i && i.type === 'egg' && i.count >= 1),
                energy: '+85 Energia',
                desc: 'Massa folhada com recheio doce e dourado.'
            },
            {
                id: 'pumpkin_pie',
                name: 'Bolo de Abóbora do Vale',
                icon: '🎃',
                ingredients: '1x Abóbora + 1x Ovo',
                hasIngredients: this.player.inventory.some(i => i && i.type === 'crop_pumpkin' && i.count >= 1) &&
                               this.player.inventory.some(i => i && i.type === 'egg' && i.count >= 1),
                energy: '+100 Energia (Máx)',
                desc: 'Fatia farta perfumada com canela e noz-moscada.'
            }
        ];

        const container = document.getElementById('cookingRecipeList');
        if (!container) return;

        let html = '';
        recipes.forEach(r => {
            const canCook = r.hasIngredients;
            html += `
                <div class="recipe-card ${canCook ? 'available' : 'locked'}">
                    <div class="recipe-icon">${r.icon}</div>
                    <div class="recipe-info">
                        <div class="recipe-title">${r.name}</div>
                        <div class="recipe-desc">${r.desc}</div>
                        <div class="recipe-req">Requisitos: <strong>${r.ingredients}</strong> <span class="recipe-buff">(${r.energy})</span></div>
                    </div>
                    <button class="stardew-btn cook-btn ${canCook ? 'primary' : ''}" 
                            ${canCook ? '' : 'disabled'} 
                            onclick="window.game.cookRecipe('${r.id}')">
                        ${canCook ? '🍳 Cozinhar' : 'Faltam Itens'}
                    </button>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    cookRecipe(id) {
        window.gameAudio.init();
        let cookedName = '';
        let energyGain = 0;

        if (id === 'omelette') {
            const egg = this.player.inventory.find(i => i && i.type === 'egg' && i.count >= 1);
            if (!egg) return;
            egg.count--;
            if (egg.count <= 0) {
                const idx = this.player.inventory.indexOf(egg);
                this.player.inventory[idx] = null;
            }
            cookedName = 'Omelete Caipira';
            energyGain = 50;
        } else if (id === 'parsnip_soup') {
            const p = this.player.inventory.find(i => i && i.type === 'crop_parsnip' && i.count >= 1);
            if (!p) return;
            p.count--;
            if (p.count <= 0) {
                const idx = this.player.inventory.indexOf(p);
                this.player.inventory[idx] = null;
            }
            cookedName = 'Sopa de Chirívia';
            energyGain = 65;
        } else if (id === 'berry_tart') {
            const p = this.player.inventory.find(i => i && i.type === 'crop_parsnip' && i.count >= 1);
            const egg = this.player.inventory.find(i => i && i.type === 'egg' && i.count >= 1);
            if (!p || !egg) return;
            p.count--;
            if (p.count <= 0) this.player.inventory[this.player.inventory.indexOf(p)] = null;
            egg.count--;
            if (egg.count <= 0) this.player.inventory[this.player.inventory.indexOf(egg)] = null;
            cookedName = 'Torta de Frutas';
            energyGain = 85;
        } else if (id === 'pumpkin_pie') {
            const p = this.player.inventory.find(i => i && i.type === 'crop_pumpkin' && i.count >= 1);
            const egg = this.player.inventory.find(i => i && i.type === 'egg' && i.count >= 1);
            if (!p || !egg) return;
            p.count--;
            if (p.count <= 0) this.player.inventory[this.player.inventory.indexOf(p)] = null;
            egg.count--;
            if (egg.count <= 0) this.player.inventory[this.player.inventory.indexOf(egg)] = null;
            cookedName = 'Bolo de Abóbora';
            energyGain = 100;
        }

        window.gameAudio.playCook();
        this.player.addEnergy(energyGain);
        this.renderInventoryHotbar();
        this.updateHUD();
        this.updateHouseCookingUI();

        const tv = document.getElementById('tvOutput');
        if (tv) {
            tv.innerText = `🍳 Hummm! Você preparou ${cookedName} e recuperou +${energyGain} de Energia!`;
        }
        this.world.addFloatingText(`+${energyGain} Energia! 🍳`, this.player.x, this.player.y - 16, '#2ecc71');
    }

    watchTV(channel) {
        window.gameAudio.init();
        window.gameAudio.playTextLetter();
        const tv = document.getElementById('tvOutput');
        if (!tv) return;

        if (channel === 'weather') {
            tv.innerText = `☀️ Noticiário do Tempo: "Amanhã o dia no Vale será ensolarado, com brisa agradável de 24°C. Ótimo momento para regar seus canteiros e colher!"`;
        } else if (channel === 'tips') {
            tv.innerText = `🌾 A Rainha do Molho: "Querido fazendeiro(a), colha seus ovos todo dia e use o fogão da cabana para preparar refeições deliciosas que recuperam sua energia!"`;
        } else if (channel === 'fortune') {
            tv.innerText = `🔮 Vidente Welwick: "Os espíritos do campo estão em perfeita harmonia hoje! Sua colheita renderá frutos fartos e muito ouro no caixote!"`;
        }
    }
}

// Instantiate and start when window loads
window.addEventListener('load', () => {
    window.game = new StardewGame();
    window.game.start();
});
