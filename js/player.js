/**
 * Stardew Valley Web Prototype - Player Character & Action Handling
 */

class Player {
    constructor(world, startX, startY) {
        this.world = world;
        this.x = startX;
        this.y = startY;
        this.width = 16;
        this.height = 24;

        this.vx = 0;
        this.vy = 0;
        this.baseSpeed = 75;
        this.runMultiplier = 1.45;
        this.dir = 'down'; // 'down', 'up', 'left', 'right'

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.stepTimer = 0;
        this.state = 'idle'; // 'idle', 'walking', 'acting', 'pose'
        this.actionTimer = 0;
        this.heldItemAboveHead = null;
        this.poseTimer = 0;

        // Player Stats
        this.gold = 500;
        this.energy = 100;
        this.maxEnergy = 100;

        // Inventory (12 slots)
        this.selectedSlot = 0;
        this.inventory = [
            { id: 'hoe', name: 'Enxada', type: 'tool', icon: 'icon_hoe', desc: 'Prepara a terra para o plantio.' },
            { id: 'watering_can', name: 'Regador', type: 'tool', icon: 'icon_watering_can', water: 40, maxWater: 40, desc: 'Rega as plantas. Recarregue no lago!' },
            { id: 'axe', name: 'Machado', type: 'tool', icon: 'icon_axe', desc: 'Derruba árvores e troncos.' },
            { id: 'pickaxe', name: 'Picareta', type: 'tool', icon: 'icon_pickaxe', desc: 'Quebra pedras e remove canteiros.' },
            { id: 'scythe', name: 'Foice', type: 'tool', icon: 'icon_scythe', desc: 'Corta mato alto e ervas daninhas.' },
            { id: 'seed_parsnip', name: 'Sem. Chirívia', type: 'seed', crop: 'parsnip', count: 12, icon: 'icon_seed_parsnip', desc: 'Sementes de primavera. Cresce em 4 dias.' },
            { id: 'seed_strawberry', name: 'Sem. Morango', type: 'seed', crop: 'strawberry', count: 6, icon: 'icon_seed_strawberry', desc: 'Fruta doce e lucrativa.' },
            { id: 'seed_pumpkin', name: 'Sem. Abóbora', type: 'seed', crop: 'pumpkin', count: 4, icon: 'icon_seed_pumpkin', desc: 'Cresce uma abóbora gigante!' },
            { id: 'seed_corn', name: 'Sem. Milho', type: 'seed', crop: 'corn', count: 6, icon: 'icon_seed_corn', desc: 'Planta de colheita alta e nutritiva.' },
            { id: 'pie', name: 'Torta de Amora', type: 'food', count: 3, energyRestore: 45, icon: 'icon_pie', desc: 'Comida deliciosa! Restaura +45 de Energia.' },
            null,
            null
        ];
    }

    getSelectedItem() {
        return this.inventory[this.selectedSlot] || null;
    }

    getTargetTile(mouseX = null, mouseY = null) {
        // If mouse is provided within 2.8 tiles reach, use mouse tile (Stardew PC style)
        if (mouseX !== null && mouseY !== null) {
            const mc = Math.floor(mouseX / this.world.tileSize);
            const mr = Math.floor(mouseY / this.world.tileSize);
            const pc = Math.floor((this.x + 8) / this.world.tileSize);
            const pr = Math.floor((this.y + 16) / this.world.tileSize);

            const dist = Math.hypot(mc - pc, mr - pr);
            if (dist <= 2.8 && mc >= 0 && mc < this.world.cols && mr >= 0 && mr < this.world.rows) {
                return { c: mc, r: mr };
            }
        }

        // Otherwise target tile right in front of the player's facing direction
        const pc = Math.floor((this.x + 8) / this.world.tileSize);
        const pr = Math.floor((this.y + 16) / this.world.tileSize);

        let tc = pc;
        let tr = pr;
        if (this.dir === 'down') tr += 1;
        else if (this.dir === 'up') tr -= 1;
        else if (this.dir === 'left') tc -= 1;
        else if (this.dir === 'right') tc += 1;

        tc = Math.max(0, Math.min(this.world.cols - 1, tc));
        tr = Math.max(0, Math.min(this.world.rows - 1, tr));

        return { c: tc, r: tr };
    }

    update(dt, input) {
        // Update Action / Pose Timers
        if (this.state === 'acting') {
            this.actionTimer -= dt;
            if (this.actionTimer <= 0) {
                this.state = 'idle';
            }
            return; // Can't move during tool swing
        }

        if (this.state === 'pose') {
            this.poseTimer -= dt;
            if (this.poseTimer <= 0) {
                this.state = 'idle';
                this.heldItemAboveHead = null;
            }
        }

        // Movement input
        let mx = 0;
        let my = 0;

        if (input.left) mx -= 1;
        if (input.right) mx += 1;
        if (input.up) my -= 1;
        if (input.down) my += 1;

        if (mx !== 0 || my !== 0) {
            // Cancel pose if walking
            if (this.state === 'pose') {
                this.state = 'idle';
                this.heldItemAboveHead = null;
            }

            // Normalize diagonal speed
            if (mx !== 0 && my !== 0) {
                mx *= 0.7071;
                my *= 0.7071;
            }

            // Direction facing
            if (Math.abs(mx) > Math.abs(my)) {
                this.dir = mx > 0 ? 'right' : 'left';
            } else {
                this.dir = my > 0 ? 'down' : 'up';
            }

            const speed = (this.energy > 0 ? this.baseSpeed : this.baseSpeed * 0.45) * (input.shift ? this.runMultiplier : 1);
            const moveX = mx * speed * dt;
            const moveY = my * speed * dt;

            // Collision resolution (box collision around player's feet)
            const targetX = this.x + moveX;
            const targetY = this.y + moveY;

            // Check X collision
            if (this.canMoveTo(targetX, this.y)) {
                this.x = targetX;
            }
            // Check Y collision
            if (this.canMoveTo(this.x, targetY)) {
                this.y = targetY;
            }

            // Check step onto farmhouse door threshold to enter house
            const pc = Math.floor((this.x + 8) / this.world.tileSize);
            const pr = Math.floor((this.y + 16) / this.world.tileSize);
            if ((pc === 10 || pc === 11) && pr === 6 && this.dir === 'up') {
                if (window.game && window.game.openHouseInterior) {
                    window.game.openHouseInterior();
                }
            }

            this.state = 'walking';
            this.animTimer += dt * (input.shift ? 10 : 7);
            this.animFrame = Math.floor(this.animTimer) % 4;

            // Footstep audio
            this.stepTimer += dt;
            if (this.stepTimer >= (input.shift ? 0.28 : 0.38)) {
                this.stepTimer = 0;
                const curTile = this.getCurrentTile();
                const surface = (curTile && curTile.terrain.startsWith('tilled')) ? 'dirt' : 'grass';
                window.gameAudio.playFootstep(surface);
            }
        } else {
            if (this.state !== 'pose') {
                this.state = 'idle';
                this.animFrame = 0;
                this.animTimer = 0;
            }
        }
    }

    getCurrentTile() {
        const c = Math.floor((this.x + 8) / this.world.tileSize);
        const r = Math.floor((this.y + 16) / this.world.tileSize);
        if (c >= 0 && c < this.world.cols && r >= 0 && r < this.world.rows) {
            return this.world.tiles[r][c];
        }
        return null;
    }

    canMoveTo(x, y) {
        // Player feet bounds (padding: 3px left/right, 4px height)
        const left = x + 3;
        const right = x + 13;
        const top = y + 14;
        const bottom = y + 23;

        const minC = Math.floor(left / this.world.tileSize);
        const maxC = Math.floor(right / this.world.tileSize);
        const minR = Math.floor(top / this.world.tileSize);
        const maxR = Math.floor(bottom / this.world.tileSize);

        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                if (!this.world.isWalkableTile(c, r)) {
                    return false;
                }
            }
        }

        // Animal collision - player cannot walk through cows or chickens!
        if (this.world && this.world.animals) {
            for (const animal of this.world.animals) {
                const aLeft = animal.x + (animal.boxOffsetX || 2);
                const aRight = aLeft + (animal.boxW || (animal.w - 4));
                const aTop = animal.y + (animal.boxOffsetY || 8);
                const aBottom = aTop + (animal.boxH || 8);

                if (right > aLeft && left < aRight && bottom > aTop && top < aBottom) {
                    return false; // Solid contact with animal
                }
            }
        }

        return true;
    }

    // MAIN INTERACTION / USE TOOL ACTION
    useAction(mouseWorld = null) {
        const item = this.getSelectedItem();
        const target = this.getTargetTile(mouseWorld ? mouseWorld.x : null, mouseWorld ? mouseWorld.y : null);
        const tile = this.world.tiles[target.r][target.c];

        // 1. Check Animal Petting first (if player clicks/presses near an animal)
        const nearbyAnimal = this.world.animals.find(a => {
            const dist = Math.hypot((this.x + 8) - (a.x + a.w / 2), (this.y + 16) - (a.y + a.h / 2));
            return dist < 32;
        });

        if (nearbyAnimal && (!item || item.type === 'food' || item.type === 'tool')) {
            this.petAnimal(nearbyAnimal);
            return;
        }

        // 2. Check Farmhouse Door interaction (Enter cozy cottage)
        if (tile.object && (tile.object.type === 'farmhouse_door' || tile.object.type === 'farmhouse' || tile.object.type === 'farmhouse_part')) {
            const distToDoor = Math.hypot((this.x + 8) - (10.5 * 16 + 8), (this.y + 16) - (6 * 16 + 16));
            if (distToDoor < 45) {
                if (window.game && window.game.openHouseInterior) {
                    window.game.openHouseInterior();
                    return;
                }
            }
        }

        // 3. Check Shipping Bin interaction (at Celeiro)
        if (tile.object && (tile.object.type === 'shipping_bin' || tile.object.type === 'shipping_bin_part')) {
            this.depositToShippingBin();
            return;
        }

        // 3. Harvest Ripe Crop (Hand or tool)
        if (tile.crop && tile.crop.stage === 4) {
            this.harvestCrop(tile, target);
            return;
        }

        // 4. Pickup Egg from chicken coop
        if (tile.object && tile.object.type === 'egg') {
            this.pickupEgg(tile, target);
            return;
        }

        // 5. Refill Watering Can if facing water pond
        if (item && item.id === 'watering_can' && tile.terrain === 'water') {
            item.water = item.maxWater;
            window.gameAudio.playWater();
            this.world.addFloatingText('Regador Cheio! 💧', this.x, this.y - 12, '#38ada9');
            this.triggerToolAnimation();
            return;
        }

        // 6. Food Item (Eat)
        if (item && item.type === 'food') {
            this.eatFood(item);
            return;
        }

        // Check exhaustion
        if (this.energy <= 0) {
            this.world.addFloatingText('Sem Energia! Durma ou coma algo.', this.x, this.y - 12, '#ff6b6b');
            return;
        }

        // 7. Use Selected Tool or Item on tile
        if (!item) return;

        if (item.id === 'hoe') {
            this.useHoe(tile, target);
        } else if (item.id === 'watering_can') {
            this.useWateringCan(tile, target, item);
        } else if (item.id === 'axe') {
            this.useAxe(tile, target);
        } else if (item.id === 'pickaxe') {
            this.usePickaxe(tile, target);
        } else if (item.id === 'scythe') {
            this.useScythe(tile, target);
        } else if (item.type === 'seed') {
            this.plantSeed(tile, target, item);
        }
    }

    triggerToolAnimation() {
        this.state = 'acting';
        this.actionTimer = 0.22;
    }

    useHoe(tile, target) {
        if (tile.terrain === 'grass' && !tile.object) {
            tile.terrain = 'tilled_dry';
            this.energy = Math.max(0, this.energy - 2);
            window.gameAudio.playTill();
            this.triggerToolAnimation();

            // Soil particle burst
            for (let i = 0; i < 6; i++) {
                this.world.addParticle({
                    x: target.c * 16 + 8,
                    y: target.r * 16 + 8,
                    vx: (Math.random() - 0.5) * 35,
                    vy: -15 - Math.random() * 25,
                    gravity: 80,
                    life: 0.35,
                    color: '#84532b',
                    size: 2
                });
            }
        }
    }

    useWateringCan(tile, target, item) {
        if (item.water <= 0) {
            this.world.addFloatingText('Regador Vazio! Encha no lago.', this.x, this.y - 12, '#48dbfb');
            return;
        }

        if (tile.terrain === 'tilled_dry' || tile.terrain === 'tilled_wet') {
            tile.terrain = 'tilled_wet';
            item.water--;
            this.energy = Math.max(0, this.energy - 2);
            window.gameAudio.playWater();
            this.triggerToolAnimation();

            // Water splash droplets
            for (let i = 0; i < 8; i++) {
                this.world.addParticle({
                    x: target.c * 16 + 4 + Math.random() * 8,
                    y: target.r * 16 + 4 + Math.random() * 8,
                    vx: (Math.random() - 0.5) * 20,
                    vy: -10 - Math.random() * 20,
                    gravity: 70,
                    life: 0.3,
                    color: '#48dbfb',
                    size: 2
                });
            }
        }
    }

    plantSeed(tile, target, item) {
        if ((tile.terrain === 'tilled_dry' || tile.terrain === 'tilled_wet') && !tile.crop && !tile.object) {
            tile.crop = {
                type: item.crop,
                stage: 1,
                name: item.crop === 'parsnip' ? 'Chirívia' : (item.crop === 'strawberry' ? 'Morango' : (item.crop === 'pumpkin' ? 'Abóbora' : 'Milho'))
            };
            item.count--;
            if (item.count <= 0) {
                this.inventory[this.selectedSlot] = null;
            }
            window.gameAudio.playPlant();
            this.triggerToolAnimation();
            this.world.addFloatingText(`${tile.crop.name} plantado(a)!`, target.c * 16, target.r * 16 - 8, '#7bed9f');
        }
    }

    useAxe(tile, target) {
        if (tile.object && (tile.object.type === 'tree_oak' || tile.object.type === 'tree_pine' || tile.object.type === 'log')) {
            tile.object.health = (tile.object.health || 3) - 1;
            this.energy = Math.max(0, this.energy - 3);
            this.triggerToolAnimation();

            // Wood chip splinters
            for (let i = 0; i < 7; i++) {
                this.world.addParticle({
                    x: target.c * 16 + 8,
                    y: target.r * 16 + 8,
                    vx: (Math.random() - 0.5) * 45,
                    vy: -20 - Math.random() * 30,
                    gravity: 90,
                    life: 0.4,
                    color: '#d49b65',
                    size: 2
                });
            }

            if (tile.object.health <= 0) {
                // Tree cut down!
                window.gameAudio.playTreeFall();
                const woodYield = tile.object.type === 'log' ? 4 : 12;
                tile.object = null;
                this.addItemToInventory({ id: 'wood', name: 'Madeira', type: 'material', count: woodYield, icon: 'icon_wood', desc: 'Madeira resistente para construções.' });
                this.world.addFloatingText(`+${woodYield} Madeira 🪵`, target.c * 16, target.r * 16 - 12, '#eccc68');
            } else {
                window.gameAudio.playChop();
            }
        }
    }

    usePickaxe(tile, target) {
        if (tile.object && tile.object.type === 'rock') {
            tile.object = null;
            this.energy = Math.max(0, this.energy - 3);
            window.gameAudio.playChop();
            this.triggerToolAnimation();
            this.addItemToInventory({ id: 'stone', name: 'Pedra', type: 'material', count: 3, icon: 'obj_rock', desc: 'Pedra comum de mina.' });
            this.world.addFloatingText('+3 Pedra 🪨', target.c * 16, target.r * 16 - 12, '#ced6e0');
        } else if (tile.terrain.startsWith('tilled') && !tile.crop) {
            // Untill soil back to grass
            tile.terrain = 'grass';
            window.gameAudio.playTill();
            this.triggerToolAnimation();
        }
    }

    useScythe(tile, target) {
        if (tile.object && tile.object.type === 'weed') {
            tile.object = null;
            this.energy = Math.max(0, this.energy - 1);
            window.gameAudio.playChop();
            this.triggerToolAnimation();
            this.world.addFloatingText('+1 Fibra 🌾', target.c * 16, target.r * 16 - 12, '#70a1ff');
        }
    }

    harvestCrop(tile, target) {
        const crop = tile.crop;
        tile.crop = null; // harvest
        window.gameAudio.playHarvest();

        // Stardew Overhead Triumph Pose!
        this.state = 'pose';
        this.poseTimer = 1.2;
        this.heldItemAboveHead = `icon_crop_${crop.type}`;

        const cropItem = {
            id: crop.type,
            name: crop.name,
            type: 'crop',
            count: 1,
            icon: `icon_crop_${crop.type}`,
            desc: `Colheita fresca e suculenta de ${crop.name}!`
        };
        this.addItemToInventory(cropItem);

        this.world.addFloatingText(`+1 ${crop.name}! ✨`, target.c * 16, target.r * 16 - 16, '#ffd32a');

        // Sparkle particles
        for (let i = 0; i < 9; i++) {
            this.world.addParticle({
                x: target.c * 16 + 8,
                y: target.r * 16 + 8,
                vx: (Math.random() - 0.5) * 35,
                vy: -15 - Math.random() * 25,
                gravity: 40,
                life: 0.5,
                color: '#fff200',
                size: 2
            });
        }
    }

    pickupEgg(tile, target) {
        tile.object = null;
        window.gameAudio.playHarvest();
        this.state = 'pose';
        this.poseTimer = 1.0;
        this.heldItemAboveHead = 'icon_egg';
        this.addItemToInventory({ id: 'egg', name: 'Ovo Fresco', type: 'animal_product', count: 1, icon: 'icon_egg', desc: 'Ovo fresco da galinha Pipoca!' });
        this.world.addFloatingText('+1 Ovo Fresco! 🥚', target.c * 16, target.r * 16 - 12, '#ffffff');
    }

    petAnimal(animal) {
        // Turn animal to face player immediately
        if (this.x + 8 < animal.x + animal.w / 2) {
            animal.dir = 'left';
        } else {
            animal.dir = 'right';
        }
        animal.vx = 0;
        animal.vy = 0;
        animal.action = 'idle';
        animal.timer = 2.5; // Stay still enjoying petting

        if (!animal.pettedToday) {
            animal.pettedToday = true;
            animal.hearts = Math.min(5, animal.hearts + 1);
            window.gameAudio.playAnimalPet();
            if (animal.type === 'chicken') window.gameAudio.playChickenCluck();

            // Heart emote particle
            this.world.addFloatingText('❤️', animal.x + animal.w / 2, animal.y - 12, '#ff4757');
            this.world.addFloatingText(`${animal.name} adorou o carinho!`, this.x, this.y - 14, '#ff6b81');
        } else {
            this.world.addFloatingText(`${animal.name} está feliz!`, animal.x + animal.w / 2, animal.y - 10, '#f1f2f6');
        }
    }

    depositToShippingBin() {
        const item = this.getSelectedItem();
        if (!item || (item.type !== 'crop' && item.type !== 'animal_product' && item.id !== 'wood')) {
            this.world.addFloatingText('Selecione algo para vender!', this.x, this.y - 14, '#ffa502');
            return;
        }

        // Deposit item into shipping bin
        this.world.shippingBinItems.push({
            id: item.id,
            name: item.name,
            count: 1
        });

        item.count--;
        if (item.count <= 0) {
            this.inventory[this.selectedSlot] = null;
        }

        window.gameAudio.playCoin();
        this.world.addFloatingText(`Depositado: 1x ${item.name} 📦`, 17 * 16, 4 * 16 - 8, '#2ed573');
    }

    eatFood(item) {
        this.energy = Math.min(this.maxEnergy, this.energy + (item.energyRestore || 35));
        item.count--;
        if (item.count <= 0) {
            this.inventory[this.selectedSlot] = null;
        }
        window.gameAudio.playEat();
        this.world.addFloatingText(`+${item.energyRestore || 35} Energia! 🥧`, this.x, this.y - 12, '#2ed573');
    }

    addItemToInventory(newItem) {
        // Stack if exists
        const existing = this.inventory.find(i => i && i.id === newItem.id);
        if (existing) {
            existing.count += (newItem.count || 1);
            return true;
        }

        // Else find first empty slot
        const emptyIndex = this.inventory.findIndex(i => i === null);
        if (emptyIndex !== -1) {
            this.inventory[emptyIndex] = newItem;
            return true;
        }

        this.world.addFloatingText('Mochila cheia!', this.x, this.y - 12, '#ff4757');
        return false;
    }
}

window.Player = Player;
