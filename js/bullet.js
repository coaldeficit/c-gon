let bullet = [];

const b = {
    // dmgScale: null, //scales all damage, but not raw .dmg //set in levels.setDifficulty
    gravity: 0.0006, //most other bodies have   gravity = 0.001
    activeGun: null, //current gun in use by player
    inventoryGun: 0,
    inventory: [], //list of what guns player has  // 0 starts with basic gun
    setFireMethod() {
        if (tech.isFireMoveLock) {
            b.fire = b.fireFloat
            // } else if (tech.isFireNotMove) {
            //     if (tech.isAlwaysFire) {
            //         b.fire = b.fireAlwaysFire
            //     } else {
            //         b.fire = b.fireNotMove
            //     }
        } else if (tech.isAlwaysFire) {
            b.fire = b.fireAlwaysFire
        } else {
            b.fire = b.fireNormal
        }
    },
    fire() {},
    fireNormal() {
        if (b.inventory.length && !simulation.isChoosing) {
            if (input.fire && m.fireCDcycle < m.cycle && (!input.field || m.fieldFire)) {
                if (b.guns[b.activeGun].ammo > 0) {
                    b.fireWithAmmo()
                } else {
                    b.outOfAmmo()
                }
                if (m.holdingTarget) m.drop();
            }
            b.guns[b.activeGun].do();
        }
    },
    fireNotMove() { //added  && player.speed < 0.5 && m.onGround  
        if (b.inventory.length && !simulation.isChoosing) {
            if (input.fire && m.fireCDcycle < m.cycle && (!input.field || m.fieldFire) && player.speed < 2.5 && m.onGround && Math.abs(m.yOff - m.yOffGoal) < 1) {
                if (b.guns[b.activeGun].ammo > 0) {
                    b.fireWithAmmo()
                } else {
                    b.outOfAmmo()
                }
                if (m.holdingTarget) m.drop();
            }
            b.guns[b.activeGun].do();
        }
    },
    fireAlwaysFire() { //added  && player.speed < 0.5 && m.onGround  //removed input.fire && (!input.field || m.fieldFire)
        if (b.inventory.length && !simulation.isChoosing) {
            if (m.fireCDcycle < m.cycle && player.speed < 0.5 && m.onGround && Math.abs(m.yOff - m.yOffGoal) < 1) {
                if (b.guns[b.activeGun].ammo > 0) {
                    b.fireWithAmmo()
                }
                if (m.holdingTarget) m.drop();
            }
            b.guns[b.activeGun].do();
        }
    },
    fireFloat() { //added  && player.speed < 0.5 && m.onGround  
        if (b.inventory.length && !simulation.isChoosing) {
            if (input.fire && (!input.field || m.fieldFire)) {
                if (m.fireCDcycle < m.cycle) {
                    if (b.guns[b.activeGun].ammo > 0) {
                        b.fireWithAmmo()
                    } else {
                        b.outOfAmmo()
                    }
                    if (m.holdingTarget) m.drop();
                }
                Matter.Body.setVelocity(player, {
                    x: 0,
                    y: -55 * player.mass * simulation.g //undo gravity before it is added
                });
                player.force.x = 0
                player.force.y = 0
            }
            b.guns[b.activeGun].do();
        }
    },
    fireWithAmmo() { //triggers after firing when you have ammo
        b.guns[b.activeGun].fire();
        if (tech.crouchAmmoCount && input.down) {
            if (tech.crouchAmmoCount % 2) {
                b.guns[b.activeGun].ammo--;
                simulation.updateGunHUD();
            }
            tech.crouchAmmoCount++ //makes the no ammo toggle off and on
        } else {
            b.guns[b.activeGun].ammo--;
            simulation.updateGunHUD();
        }
    },
    outOfAmmo() { //triggers after firing when you have NO ammo
        simulation.makeTextLog(`${b.guns[b.activeGun].name}.<span class='color-g'>ammo</span><span class='color-symbol'>:</span> 0`);
        m.fireCDcycle = m.cycle + 30; //fire cooldown       
        if (tech.isAmmoFromHealth && m.health > 0.01) {
            tech.extraMaxHealth -= 0.01 //decrease max health
            m.setMaxHealth();
            for (let i = 0; i < 4; i++) powerUps.spawn(m.pos.x + 50 * (Math.random() - 0.5), m.pos.y + 50 * (Math.random() - 0.5), "ammo");
        }
    },
    refundAmmo() { //triggers after firing when you removed ammo for a gun, but didn't need to
        if (tech.crouchAmmoCount && input.down) {
            tech.crouchAmmoCount--
            if ((tech.crouchAmmoCount) % 2) {
                b.guns[b.activeGun].ammo++;
                simulation.updateGunHUD();
            }
        } else {
            b.guns[b.activeGun].ammo++;
            simulation.updateGunHUD();
        }
    },
    returnGunAmmo(name) {
        for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
            if (b.guns[i].name === name) return b.guns[i].ammo
        }
    },
    giveGuns(gun = "random", ammoPacks = 10) {
        if (tech.ammoCap) ammoPacks = 0.45 * tech.ammoCap
        if (tech.isOneGun) b.removeAllGuns();
        if (gun === "random") {
            //find what guns player doesn't have
            options = []
            for (let i = 0, len = b.guns.length; i < len; i++) {
                if (!b.guns[i].have) options.push(i)
            }
            if (options.length === 0) return
            //randomly pick from list of possible guns
            gun = options[Math.floor(Math.random() * options.length)]
        }
        if (gun === "all") {
            b.inventoryGun = 0;
            for (let i = 0; i < b.guns.length; i++) {
                b.inventory[i] = i;
                b.guns[i].have = true;
                b.guns[i].ammo = Math.ceil(b.guns[i].ammoPack * ammoPacks);
            }
            b.activeGun = 0;
        } else {
            if (isNaN(gun)) { //find gun by name
                let found = false;
                for (let i = 0; i < b.guns.length; i++) {
                    if (gun === b.guns[i].name) {
                        gun = i
                        found = true;
                        break
                    }
                }
                if (!found) return //if no gun found don't give a gun
            }
            if (!b.guns[gun].have) b.inventory.push(gun);
            b.guns[gun].have = true;
            b.guns[gun].ammo = Math.ceil(b.guns[gun].ammoPack * ammoPacks);
            if (b.activeGun === null) {
                b.activeGun = gun //if no active gun switch to new gun
                if (b.guns[b.activeGun].charge) b.guns[b.activeGun].charge = 0; //set foam charge to zero if foam is a new gun
            }
        }
        simulation.makeGunHUD();
        b.setFireCD();
        if (tech.isOneGun && b.inventory > 0) {
            //count how many gun tech you have and remove them
            let gunTechCount = 0 //2 bonus gun tech
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (tech.tech[i].isGunTech && tech.tech[i].count > 0 && !tech.tech[i].isNonRefundable && !tech.tech[i].isRemoveGun) {
                    const remove = tech.removeTech(i)
                    // console.log(remove, tech.tech[i].count, tech.tech[i].name)
                    gunTechCount += remove
                }
            }
            // console.log(gunTechCount)

            //get a random gun tech for your gun
            for (let i = 0; i < gunTechCount; i++) {
                const gunTechPool = []
                for (let j = 0, len = tech.tech.length; j < len; j++) {
                    if (tech.tech[j].isGunTech && tech.tech[j].allowed() && !tech.tech[i].isRemoveGun && !tech.tech[j].isJunk && !tech.tech[j].isBadRandomOption && tech.tech[j].count < tech.tech[j].maxCount) {
                        const regex = tech.tech[j].requires.search(b.guns[b.activeGun].name) //get string index of gun name
                        const not = tech.tech[j].requires.search(' not ') //get string index of ' not '
                        //look for the gun name in the requirements, but the gun name needs to show up before the word ' not '
                        if (regex !== -1 && (not === -1 || not > regex)) gunTechPool.push(j)
                    }
                }
                if (gunTechPool.length) {
                    const index = Math.floor(Math.random() * gunTechPool.length)
                    tech.giveTech(gunTechPool[index]) // choose from the gun pool
                    simulation.makeTextLog(`<span class='color-var'>tech</span>.giveTech("<span class='color-text'>${tech.tech[gunTechPool[index]].name}</span>")`)
                } else {
                    tech.giveTech() //get normal tech if you can't find any gun tech
                }
            }

        }
    },
    removeGun(gunName) {
        for (let i = 0; i < b.guns.length; i++) {
            if (b.guns[i].name === gunName && b.guns[i].have) {
                b.guns[i].have = false
                for (let j = 0; j < b.inventory.length; j++) {
                    if (b.inventory[j] === i) {
                        b.inventory.splice(j, 1)
                        break
                    }
                }
                if (b.inventory.length > 0) {
                    b.activeGun = b.inventory[0];
                } else {
                    b.activeGun = null;
                }
                simulation.makeGunHUD();
                break
            }
        }
        b.setFireCD();
    },
    removeAllGuns() {
        b.inventory = []; //removes guns and ammo  
        for (let i = 0, len = b.guns.length; i < len; ++i) {
            b.guns[i].count = 0;
            b.guns[i].have = false;
            if (b.guns[i].ammo != Infinity) b.guns[i].ammo = 0;
        }
        b.activeGun = null;
    },
    bulletRemove() { //run in main loop
        //remove bullet if at end cycle for that bullet
        let i = bullet.length;
        while (i--) {
            if (bullet[i].endCycle < simulation.cycle) {
                bullet[i].onEnd(i); //some bullets do stuff on end
                if (bullet[i]) {
                    Matter.Composite.remove(engine.world, bullet[i]);
                    bullet.splice(i, 1);
                } else {
                    break; //if bullet[i] doesn't exist don't complete the for loop, because the game probably reset
                }
            }
        }
    },
    bulletDraw() {
        ctx.beginPath();
        for (let i = 0, len = bullet.length; i < len; i++) {
            if (!bullet[i].dontRender) {
                let vertices = bullet[i].vertices;
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
            }
        }
        ctx.fillStyle = color.bullet;
        ctx.fill();
        for (let i=0;i<b.guns[12].activeDetonationEffects.length;i++) {
            let shockwave = b.guns[12].activeDetonationEffects[i]
            shockwave.progress += 0.08
            ctx.lineWidth = 80
            ctx.beginPath()
            let gradient = ctx.createRadialGradient(shockwave.x, shockwave.y, (shockwave.targetRange*shockwave.progress)-40, shockwave.x, shockwave.y, (shockwave.targetRange*shockwave.progress)+40)
            gradient.addColorStop(0, "rgba(0,0,0,0)")
            gradient.addColorStop(0.5, "rgba("+shockwave.color+","+Math.max(0, (1-shockwave.progress)/2)+")")
            gradient.addColorStop(1, "rgba(0,0,0,0)")
            ctx.strokeStyle = gradient
            ctx.arc(shockwave.x, shockwave.y, shockwave.targetRange*shockwave.progress, 0, 2*Math.PI)
            ctx.stroke()
            if (shockwave.progress > 1) b.guns[12].activeDetonationEffects.splice(i,1)
        }
    },
    bulletDo() {
        for (let i = 0, len = bullet.length; i < len; i++) {
            bullet[i].do();
        }
    },
    fireProps(cd, speed, dir, me) {
        m.fireCDcycle = m.cycle + Math.floor(cd * b.fireCDscale); // cool down
        Matter.Body.setVelocity(bullet[me], {
            x: m.Vx / 2 + speed * Math.cos(dir),
            y: m.Vy / 2 + speed * Math.sin(dir)
        });
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    fireCDscale: 1,
    setFireCD() {
        b.fireCDscale = tech.fireRate * tech.slowFire * tech.researchHaste * tech.aimDamage
        if (tech.isFastTime) b.fireCDscale *= 0.5
        if (tech.isFireRateForGuns) b.fireCDscale *= Math.pow(0.8, b.inventory.length)
        if (tech.isFireMoveLock) b.fireCDscale *= 0.5
        if (tech.isNitinol) b.fireCDscale *= 1.55
        if (tech.isShotgunHeat) b.fireCDscale *= 1-(tech.isShotgunHeat-1)
    },
    fireAttributes(dir, rotate = true) {
        if (rotate) {
            return {
                // density: 0.0015,			//frictionAir: 0.01,			//restitution: 0,
                angle: dir,
                friction: 0.5,
                frictionAir: 0,
                dmg: 0, //damage done in addition to the damage from momentum
                classType: "bullet",
                collisionFilter: {
                    category: cat.bullet,
                    mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield
                },
                minDmgSpeed: 10,
                beforeDmg() {}, //this.endCycle = 0  //triggers despawn
                onEnd() {}
            };
        } else {
            return {
                // density: 0.0015,			//frictionAir: 0.01,			//restitution: 0,
                inertia: Infinity, //prevents rotation
                angle: dir,
                friction: 0.5,
                frictionAir: 0,
                dmg: 0, //damage done in addition to the damage from momentum
                classType: "bullet",
                collisionFilter: {
                    category: cat.bullet,
                    mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield
                },
                minDmgSpeed: 10,
                beforeDmg() {}, //this.endCycle = 0  //triggers despawn
                onEnd() {}
            };
        }
    },
    muzzleFlash(radius = 10) {
        ctx.fillStyle = "#fb0";
        ctx.beginPath();
        ctx.arc(m.pos.x + 35 * Math.cos(m.angle), m.pos.y + 35 * Math.sin(m.angle), radius, 0, 2 * Math.PI);
        ctx.fill();
    },
    removeConsBB(me) {
        for (let i = 0, len = consBB.length; i < len; ++i) {
            if (consBB[i].bodyA === me) {
                consBB[i].bodyA = consBB[i].bodyB;
                consBB.splice(i, 1);
                break;
            } else if (consBB[i].bodyB === me) {
                consBB[i].bodyB = consBB[i].bodyA;
                consBB.splice(i, 1);
                break;
            }
        }
    },
    onCollision(event) {
        const pairs = event.pairs;
        for (let i = 0, j = pairs.length; i != j; i++) {
            //map + bullet collisions
            if (pairs[i].bodyA.collisionFilter.category === cat.map && pairs[i].bodyB.collisionFilter.category === cat.bullet) {
                collideBulletStatic(pairs[i].bodyB)
            } else if (pairs[i].bodyB.collisionFilter.category === cat.map && pairs[i].bodyA.collisionFilter.category === cat.bullet) {
                collideBulletStatic(pairs[i].bodyA)
            }

            function collideBulletStatic(obj) {
                if (obj.onWallHit) obj.onWallHit();
            }
        }
    },
    explosionRange() {
        return tech.explosiveRadius * (tech.isExplosionHarm ? 1.8 : 1) * (tech.isSmallExplosion ? 0.66 : 1) * (tech.isExplodeRadio ? 1.25 : 1)
    },
    explosion(where, radius, color = "rgba(255,25,0,0.6)") { // typically explode is used for some bullets with .onEnd
        radius *= tech.explosiveRadius

        // radius = Math.max(0, Math.min(radius, (distanceToPlayer - 70) / b.explosionRange()))

        let dist, sub, knock;
        let dmg = radius * 0.019 * (tech.isExplosionStun ? 0.7 : 1); //* 0.013 * (tech.isExplosionStun ? 0.7 : 1);
        dmg /= Math.log(Math.max(b.explosionRange(),1))+1 // shit is busted yo
        if (tech.isExplosionHarm) radius *= 1.8 //    1/sqrt(2) radius -> area
        if (tech.isSmallExplosion) {
            color = "rgba(255,0,30,0.7)"
            radius *= 0.66
            dmg *= 1.66
        }

        if (tech.isExplodeRadio) { //radiation explosion
            radius *= 1.25; //alert range
            if (tech.isSmartRadius) radius = Math.max(Math.min(radius, Vector.magnitude(Vector.sub(where, player.position)) - 25), 1)
            color = "rgba(25,139,170,0.25)"
            simulation.drawList.push({ //add dmg to draw queue
                x: where.x,
                y: where.y,
                radius: radius,
                color: color,
                time: simulation.drawTime * 2
            });

            //player damage
            if (Vector.magnitude(Vector.sub(where, player.position)) < radius) {
                const DRAIN = (tech.isExplosionHarm ? 0.9 : 0.45) * (tech.isRadioactiveResistance ? 0.25 : 1)
                // * (tech.isImmuneExplosion ? Math.min(1, Math.max(1 - m.energy * 0.7, 0)) : 1) 
                if (m.immuneCycle < m.cycle) m.energy -= DRAIN
                if (m.energy < 0) {
                    m.energy = 0
                    if (simulation.dmgScale) m.damage(0.03 * (tech.isRadioactiveResistance ? 0.25 : 1));
                }
            }

            //mob damage and knock back with alert
            let damageScale = 1.5; // reduce dmg for each new target to limit total AOE damage
            for (let i = 0, len = mob.length; i < len; ++i) {
                if (mob[i].alive && !mob[i].isShielded) {
                    sub = Vector.sub(where, mob[i].position);
                    dist = Vector.magnitude(sub) - mob[i].radius;
                    if (dist < radius) {
                        if (mob[i].shield) dmg *= 2.5 //balancing explosion dmg to shields
                        if (Matter.Query.ray(map, mob[i].position, where).length > 0) dmg *= 0.5 //reduce damage if a wall is in the way
                        mobs.statusDoT(mob[i], dmg * damageScale * 0.25, 240) //apply radiation damage status effect on direct hits
                        if (tech.isExplosionStun) mobs.statusStun(mob[i], 60)
                        mob[i].locatePlayer();
                        damageScale *= 0.87 //reduced damage for each additional explosion target
                    }
                }
            }
        } else { //normal explosions
            if (tech.isSmartRadius) radius = Math.max(Math.min(radius, Vector.magnitude(Vector.sub(where, player.position)) - 25), 1)
            simulation.drawList.push({ //add dmg to draw queue
                x: where.x,
                y: where.y,
                radius: radius,
                color: color,
                time: simulation.drawTime
            });
            const alertRange = 100 + radius * 2; //alert range
            simulation.drawList.push({ //add alert to draw queue
                x: where.x,
                y: where.y,
                radius: alertRange,
                color: "rgba(100,20,0,0.03)",
                time: simulation.drawTime
            });

            //player damage and knock back
            if (m.immuneCycle < m.cycle) {
                sub = Vector.sub(where, player.position);
                dist = Vector.magnitude(sub);

                if (dist < radius) {
                    const harm = radius * (tech.isExplosionHarm ? 0.00036 : 0.00018)
                    if (tech.isImmuneExplosion) {
                        const mitigate = Math.min(1, Math.max(1 - m.energy * 0.5, 0))
                        if (simulation.dmgScale) m.damage(mitigate * harm);
                    } else {
                        if (simulation.dmgScale) m.damage(harm);
                    }
                    knock = Vector.mult(Vector.normalise(sub), -Math.sqrt(dmg) * player.mass * 0.013);
                    player.force.x += knock.x;
                    player.force.y += knock.y;
                } else if (dist < alertRange) {
                    knock = Vector.mult(Vector.normalise(sub), -Math.sqrt(dmg) * player.mass * 0.005);
                    player.force.x += knock.x;
                    player.force.y += knock.y;
                }
            }

            //body knock backs
            for (let i = body.length - 1; i > -1; i--) {
                if (!body[i].isNotHoldable) {
                    sub = Vector.sub(where, body[i].position);
                    dist = Vector.magnitude(sub);
                    if (dist < radius) {
                        knock = Vector.mult(Vector.normalise(sub), (-Math.sqrt(dmg) * body[i].mass) * 0.022);
                        body[i].force.x += knock.x;
                        body[i].force.y += knock.y;
                        if (tech.isBlockExplode) {
                            if (body[i] === m.holdingTarget) m.drop()
                            const size = 20 + 350 * Math.pow(body[i].mass, 0.25)
                            const where = body[i].position
                            const onLevel = level.onLevel //prevent explosions in the next level
                            Matter.Composite.remove(engine.world, body[i]);
                            body.splice(i, 1);
                            setTimeout(() => {
                                if (onLevel === level.onLevel) b.explosion(where, size); //makes bullet do explosive damage at end
                            }, 150 + 300 * Math.random());
                        }
                    } else if (dist < alertRange) {
                        knock = Vector.mult(Vector.normalise(sub), (-Math.sqrt(dmg) * body[i].mass) * 0.011);
                        body[i].force.x += knock.x;
                        body[i].force.y += knock.y;
                    }
                }
            }

            //power up knock backs
            for (let i = 0, len = powerUp.length; i < len; ++i) {
                sub = Vector.sub(where, powerUp[i].position);
                dist = Vector.magnitude(sub);
                if (dist < radius) {
                    knock = Vector.mult(Vector.normalise(sub), (-Math.sqrt(dmg) * powerUp[i].mass) * 0.013);
                    powerUp[i].force.x += knock.x;
                    powerUp[i].force.y += knock.y;
                } else if (dist < alertRange) {
                    knock = Vector.mult(Vector.normalise(sub), (-Math.sqrt(dmg) * powerUp[i].mass) * 0.007);
                    powerUp[i].force.x += knock.x;
                    powerUp[i].force.y += knock.y;
                }
            }

            //mob damage and knock back with alert
            let damageScale = 1.5; // reduce dmg for each new target to limit total AOE damage
            for (let i = 0, len = mob.length; i < len; ++i) {
                if (mob[i].alive && !mob[i].isShielded) {
                    sub = Vector.sub(where, mob[i].position);
                    dist = Vector.magnitude(sub) - mob[i].radius;
                    if (dist < radius) {
                        if (mob[i].shield) dmg *= 2.5 //balancing explosion dmg to shields
                        if (Matter.Query.ray(map, mob[i].position, where).length > 0) dmg *= 0.5 //reduce damage if a wall is in the way
                        mob[i].damage(dmg * damageScale * m.dmgScale);
                        mob[i].locatePlayer();
                        knock = Vector.mult(Vector.normalise(sub), (-Math.sqrt(dmg * damageScale) * mob[i].mass) * 0.01);
                        mob[i].force.x += knock.x;
                        mob[i].force.y += knock.y;
                        if (tech.isExplosionStun) mobs.statusStun(mob[i], 120)
                        radius *= 0.95 //reduced range for each additional explosion target
                        damageScale *= 0.87 //reduced damage for each additional explosion target
                    } else if (!mob[i].seePlayer.recall && dist < alertRange) {
                        mob[i].locatePlayer();
                        knock = Vector.mult(Vector.normalise(sub), (-Math.sqrt(dmg * damageScale) * mob[i].mass) * 0.006);
                        mob[i].force.x += knock.x;
                        mob[i].force.y += knock.y;
                        if (tech.isExplosionStun) mobs.statusStun(mob[i], 60)
                    }
                }
            }
        }
        
        // ignite hydrogen
        for (let i=0;i<bullet.length;i++) {
            if (bullet[i].isHydrogenGas && bullet[i].endCycle != -1) {
                sub = Vector.sub(where, bullet[i].position);
                dist = Vector.magnitude(sub) - bullet[i].radius
                if (dist < 100 + radius * 2) {
                    bullet[i].endCycle = -1
                    b.explosion(bullet[i].position, bullet[i].radius*1.8)
                }
            }
        }
    },
    pulse(charge, angle = m.angle, where = m.pos) {
        let best;
        let explosionRadius = 5.5 * charge
        let range = 5000
        const path = [{
                x: where.x + 20 * Math.cos(angle),
                y: where.y + 20 * Math.sin(angle)
            },
            {
                x: where.x + range * Math.cos(angle),
                y: where.y + range * Math.sin(angle)
            }
        ];
        const vertexCollision = function(v1, v1End, domain) {
            for (let i = 0; i < domain.length; ++i) {
                let vertices = domain[i].vertices;
                const len = vertices.length - 1;
                for (let j = 0; j < len; j++) {
                    results = simulation.checkLineIntersection(v1, v1End, vertices[j], vertices[j + 1]);
                    if (results.onLine1 && results.onLine2) {
                        const dx = v1.x - results.x;
                        const dy = v1.y - results.y;
                        const dist2 = dx * dx + dy * dy;
                        if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
                            best = {
                                x: results.x,
                                y: results.y,
                                dist2: dist2,
                                who: domain[i],
                                v1: vertices[j],
                                v2: vertices[j + 1]
                            };
                        }
                    }
                }
                results = simulation.checkLineIntersection(v1, v1End, vertices[0], vertices[len]);
                if (results.onLine1 && results.onLine2) {
                    const dx = v1.x - results.x;
                    const dy = v1.y - results.y;
                    const dist2 = dx * dx + dy * dy;
                    if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
                        best = {
                            x: results.x,
                            y: results.y,
                            dist2: dist2,
                            who: domain[i],
                            v1: vertices[0],
                            v2: vertices[len]
                        };
                    }
                }
            }
        };
        //check for collisions
        best = {
            x: null,
            y: null,
            dist2: Infinity,
            who: null,
            v1: null,
            v2: null
        };
        if (tech.isPulseAim) { //find mobs in line of sight
            let dist = 2200
            for (let i = 0, len = mob.length; i < len; i++) {
                const newDist = Vector.magnitude(Vector.sub(path[0], mob[i].position))
                if (
                    explosionRadius < newDist &&
                    newDist < dist &&
                    !mob[i].isBadTarget &&
                    Matter.Query.ray(map, path[0], mob[i].position).length === 0 &&
                    Matter.Query.ray(body, path[0], mob[i].position).length === 0
                ) {
                    dist = newDist
                    best.who = mob[i]
                    path[path.length - 1] = mob[i].position
                }
            }
        }
        if (!best.who) {
            vertexCollision(path[0], path[1], mob);
            vertexCollision(path[0], path[1], map);
            vertexCollision(path[0], path[1], body);
            if (best.dist2 != Infinity) { //if hitting something
                path[path.length - 1] = {
                    x: best.x,
                    y: best.y
                };
            }
        }
        if (best.who) {
            b.explosion(path[1], explosionRadius)
            const off = explosionRadius * 1.2
            b.explosion({ x: path[1].x + off * (Math.random() - 0.5), y: path[1].y + off * (Math.random() - 0.5) }, explosionRadius)
            b.explosion({ x: path[1].x + off * (Math.random() - 0.5), y: path[1].y + off * (Math.random() - 0.5) }, explosionRadius)
        }
        //draw laser beam
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        ctx.lineTo(path[1].x, path[1].y);
        if (charge > 50) {
            ctx.strokeStyle = "rgba(255,0,0,0.10)"
            ctx.lineWidth = 70
            ctx.stroke();
        }
        ctx.strokeStyle = "rgba(255,0,0,0.25)"
        ctx.lineWidth = 20
        ctx.stroke();
        ctx.strokeStyle = "#f00";
        ctx.lineWidth = 4
        ctx.stroke();

        //draw little dots along the laser path
        const sub = Vector.sub(path[1], path[0])
        const mag = Vector.magnitude(sub)
        for (let i = 0, len = Math.floor(mag * 0.0005 * charge); i < len; i++) {
            const dist = Math.random()
            simulation.drawList.push({
                x: path[0].x + sub.x * dist + 10 * (Math.random() - 0.5),
                y: path[0].y + sub.y * dist + 10 * (Math.random() - 0.5),
                radius: 1.5 + 5 * Math.random(),
                color: "rgba(255,0,0,0.5)",
                time: Math.floor(9 + 25 * Math.random() * Math.random())
            });
        }
    },
    // photon(where, angle = m.angle) {
    //     let best;
    //     const path = [{
    //             x: m.pos.x + 20 * Math.cos(angle),
    //             y: m.pos.y + 20 * Math.sin(angle)
    //         },
    //         {
    //             x: m.pos.x + range * Math.cos(angle),
    //             y: m.pos.y + range * Math.sin(angle)
    //         }
    //     ];
    //     const vertexCollision = function(v1, v1End, domain) {
    //         for (let i = 0; i < domain.length; ++i) {
    //             let vertices = domain[i].vertices;
    //             const len = vertices.length - 1;
    //             for (let j = 0; j < len; j++) {
    //                 results = simulation.checkLineIntersection(v1, v1End, vertices[j], vertices[j + 1]);
    //                 if (results.onLine1 && results.onLine2) {
    //                     const dx = v1.x - results.x;
    //                     const dy = v1.y - results.y;
    //                     const dist2 = dx * dx + dy * dy;
    //                     if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
    //                         best = {
    //                             x: results.x,
    //                             y: results.y,
    //                             dist2: dist2,
    //                             who: domain[i],
    //                             v1: vertices[j],
    //                             v2: vertices[j + 1]
    //                         };
    //                     }
    //                 }
    //             }
    //             results = simulation.checkLineIntersection(v1, v1End, vertices[0], vertices[len]);
    //             if (results.onLine1 && results.onLine2) {
    //                 const dx = v1.x - results.x;
    //                 const dy = v1.y - results.y;
    //                 const dist2 = dx * dx + dy * dy;
    //                 if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
    //                     best = {
    //                         x: results.x,
    //                         y: results.y,
    //                         dist2: dist2,
    //                         who: domain[i],
    //                         v1: vertices[0],
    //                         v2: vertices[len]
    //                     };
    //                 }
    //             }
    //         }
    //     };
    //     //check for collisions
    //     best = {
    //         x: null,
    //         y: null,
    //         dist2: Infinity,
    //         who: null,
    //         v1: null,
    //         v2: null
    //     };
    //     if (tech.isPulseAim) { //find mobs in line of sight
    //         let dist = 2200
    //         for (let i = 0, len = mob.length; i < len; i++) {
    //             const newDist = Vector.magnitude(Vector.sub(path[0], mob[i].position))
    //             if (explosionRadius < newDist &&
    //                 newDist < dist &&
    //                 Matter.Query.ray(map, path[0], mob[i].position).length === 0 &&
    //                 Matter.Query.ray(body, path[0], mob[i].position).length === 0) {
    //                 dist = newDist
    //                 best.who = mob[i]
    //                 path[path.length - 1] = mob[i].position
    //             }
    //         }
    //     }
    //     if (!best.who) {
    //         vertexCollision(path[0], path[1], mob);
    //         vertexCollision(path[0], path[1], map);
    //         vertexCollision(path[0], path[1], body);
    //         if (best.dist2 != Infinity) { //if hitting something
    //             path[path.length - 1] = {
    //                 x: best.x,
    //                 y: best.y
    //             };
    //         }
    //     }
    //     if (best.who) b.explosion(path[1], explosionRadius)

    //     //draw laser beam
    //     ctx.beginPath();
    //     ctx.moveTo(path[0].x, path[0].y);
    //     ctx.lineTo(path[1].x, path[1].y);
    //     ctx.strokeStyle = "rgba(255,0,0,0.13)"
    //     ctx.lineWidth = 60 * energy / 0.2
    //     ctx.stroke();
    //     ctx.strokeStyle = "rgba(255,0,0,0.2)"
    //     ctx.lineWidth = 18
    //     ctx.stroke();
    //     ctx.strokeStyle = "#f00";
    //     ctx.lineWidth = 4
    //     ctx.stroke();

    //     //draw little dots along the laser path
    //     const sub = Vector.sub(path[1], path[0])
    //     const mag = Vector.magnitude(sub)
    //     for (let i = 0, len = Math.floor(mag * 0.03 * energy / 0.2); i < len; i++) {
    //         const dist = Math.random()
    //         simulation.drawList.push({
    //             x: path[0].x + sub.x * dist + 13 * (Math.random() - 0.5),
    //             y: path[0].y + sub.y * dist + 13 * (Math.random() - 0.5),
    //             radius: 1 + 4 * Math.random(),
    //             color: "rgba(255,0,0,0.5)",
    //             time: Math.floor(2 + 33 * Math.random() * Math.random())
    //         });
    //     }
    // },
    grenade() {

    },
    setGrenadeMode() {
        grenadeDefault = function(where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }, angle = m.angle, size = 1) {
            const me = bullet.length;
            bullet[me] = Bodies.circle(where.x, where.y, 15, b.fireAttributes(angle, false));
            Matter.Body.setDensity(bullet[me], 0.0003);
            bullet[me].explodeRad = 300 * size;
            bullet[me].onEnd = function() {
                b.explosion(this.position, this.explodeRad); //makes bullet do explosive damage at end
                if (tech.fragments) b.targetedNail(this.position, tech.fragments * Math.floor(2 + 1.5 * Math.random()))
            }
            bullet[me].minDmgSpeed = 1;
            bullet[me].beforeDmg = function() {
                this.endCycle = 0; //bullet ends cycle after doing damage  //this also triggers explosion
            };
            speed = input.down ? 43 : 32
            Matter.Body.setVelocity(bullet[me], {
                x: m.Vx / 2 + speed * Math.cos(angle),
                y: m.Vy / 2 + speed * Math.sin(angle)
            });
            bullet[me].endCycle = simulation.cycle + Math.floor(input.down ? 120 : 80);
            bullet[me].restitution = 0.4;
            bullet[me].do = function() {
                this.force.y += this.mass * 0.0025; //extra gravity for harder arcs
            };
            Composite.add(engine.world, bullet[me]); //add bullet to world
        }
        grenadeRPG = function(where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }, angle = m.angle, size = 1) {
            const me = bullet.length;
            bullet[me] = Bodies.circle(where.x, where.y, 15, b.fireAttributes(angle, false));
            Matter.Body.setDensity(bullet[me], 0.0003);
            bullet[me].explodeRad = 305 * size;
            bullet[me].onEnd = function() {
                b.explosion(this.position, this.explodeRad); //makes bullet do explosive damage at end
                if (tech.fragments) b.targetedNail(this.position, tech.fragments * Math.floor(2 + 1.5 * Math.random()))
            }
            bullet[me].minDmgSpeed = 1;
            bullet[me].beforeDmg = function() {
                this.endCycle = 0; //bullet ends cycle after doing damage  //this also triggers explosion
            };
            speed = input.down ? 46 : 32
            Matter.Body.setVelocity(bullet[me], {
                x: m.Vx / 2 + speed * Math.cos(angle),
                y: m.Vy / 2 + speed * Math.sin(angle)
            });
            Composite.add(engine.world, bullet[me]); //add bullet to world

            bullet[me].endCycle = simulation.cycle + 70;
            bullet[me].frictionAir = 0.07;
            const MAG = 0.015
            bullet[me].thrust = {
                x: bullet[me].mass * MAG * Math.cos(angle),
                y: bullet[me].mass * MAG * Math.sin(angle)
            }
            bullet[me].do = function() {
                this.force.x += this.thrust.x;
                this.force.y += this.thrust.y;
                if (Matter.Query.collides(this, map).length || Matter.Query.collides(this, body).length) {
                    this.endCycle = 0; //explode if touching map or blocks
                }
            };
        }
        grenadeRPGVacuum = function(where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }, angle = m.angle, size = 1) {
            const me = bullet.length;
            bullet[me] = Bodies.circle(where.x, where.y, 15, b.fireAttributes(angle, false));
            Matter.Body.setDensity(bullet[me], 0.0003);
            bullet[me].explodeRad = 350 * size + Math.floor(Math.random() * 50) + tech.isBlockExplode * 110
            bullet[me].onEnd = function() {
                b.explosion(this.position, this.explodeRad); //makes bullet do explosive damage at end
                if (tech.fragments) b.targetedNail(this.position, tech.fragments * Math.floor(2 + 1.5 * Math.random()))
            }
            bullet[me].minDmgSpeed = 1;
            bullet[me].beforeDmg = function() {
                this.endCycle = 0; //bullet ends cycle after doing damage  //this also triggers explosion
            };
            speed = input.down ? 46 : 32

            Matter.Body.setVelocity(bullet[me], {
                x: m.Vx / 2 + speed * Math.cos(angle),
                y: m.Vy / 2 + speed * Math.sin(angle)
            });
            Composite.add(engine.world, bullet[me]); //add bullet to world

            bullet[me].endCycle = simulation.cycle + 70;
            bullet[me].frictionAir = 0.07;
            const MAG = 0.015
            bullet[me].thrust = {
                x: bullet[me].mass * MAG * Math.cos(angle),
                y: bullet[me].mass * MAG * Math.sin(angle)
            }
            bullet[me].do = function() {
                const suckCycles = 40
                if (simulation.cycle > this.endCycle - suckCycles || Matter.Query.collides(this, map).length || Matter.Query.collides(this, body).length) { //suck
                    const that = this

                    function suck(who, radius = that.explodeRad * 3.2) {
                        for (i = 0, len = who.length; i < len; i++) {
                            const sub = Vector.sub(that.position, who[i].position);
                            const dist = Vector.magnitude(sub);
                            if (dist < radius && dist > 150) {
                                knock = Vector.mult(Vector.normalise(sub), mag * who[i].mass / Math.sqrt(dist));
                                who[i].force.x += knock.x;
                                who[i].force.y += knock.y;
                            }
                        }
                    }
                    let mag = 0.1
                    if (simulation.cycle > this.endCycle - 5) {
                        mag = -0.22
                        suck(mob, this.explodeRad * 3)
                        suck(body, this.explodeRad * 2)
                        suck(powerUp, this.explodeRad * 1.5)
                        suck(bullet, this.explodeRad * 1.5)
                        suck([player], this.explodeRad * 1.3)
                    } else {
                        mag = 0.11
                        suck(mob, this.explodeRad * 3)
                        suck(body, this.explodeRad * 2)
                        suck(powerUp, this.explodeRad * 1.5)
                        suck(bullet, this.explodeRad * 1.5)
                        suck([player], this.explodeRad * 1.3)
                    }
                    //keep bomb in place
                    Matter.Body.setVelocity(this, {
                        x: 0,
                        y: 0
                    });
                    //draw suck
                    const radius = 2.75 * this.explodeRad * (this.endCycle - simulation.cycle) / suckCycles
                    ctx.fillStyle = "rgba(0,0,0,0.1)";
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                } else {
                    this.force.x += this.thrust.x;
                    this.force.y += this.thrust.y;
                }
            };
        }
        grenadeVacuum = function(where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }, angle = m.angle, size = 1) {
            const me = bullet.length;
            bullet[me] = Bodies.circle(where.x, where.y, 20, b.fireAttributes(angle, false));
            Matter.Body.setDensity(bullet[me], 0.0002);
            bullet[me].explodeRad = 350 * size + Math.floor(Math.random() * 50) + tech.isBlockExplode * 100
            bullet[me].onEnd = function() {
                b.explosion(this.position, this.explodeRad); //makes bullet do explosive damage at end
                if (tech.fragments) b.targetedNail(this.position, tech.fragments * Math.floor(2 + 1.5 * Math.random()))
            }
            bullet[me].beforeDmg = function() {
                this.endCycle = 0; //bullet ends cycle after doing damage  //this also triggers explosion
            };
            bullet[me].restitution = 0.4;
            bullet[me].do = function() {
                this.force.y += this.mass * 0.0025; //extra gravity for harder arcs

                const suckCycles = 40
                if (simulation.cycle > this.endCycle - suckCycles) { //suck
                    const that = this

                    function suck(who, radius = that.explodeRad * 3.2) {
                        for (i = 0, len = who.length; i < len; i++) {
                            const sub = Vector.sub(that.position, who[i].position);
                            const dist = Vector.magnitude(sub);
                            if (dist < radius && dist > 150) {
                                knock = Vector.mult(Vector.normalise(sub), mag * who[i].mass / Math.sqrt(dist));
                                who[i].force.x += knock.x;
                                who[i].force.y += knock.y;
                            }
                        }
                    }
                    let mag = 0.1
                    if (simulation.cycle > this.endCycle - 5) {
                        mag = -0.22
                        suck(mob, this.explodeRad * 3)
                        suck(body, this.explodeRad * 2)
                        suck(powerUp, this.explodeRad * 1.5)
                        suck(bullet, this.explodeRad * 1.5)
                        suck([player], this.explodeRad * 1.3)
                    } else {
                        mag = 0.11
                        suck(mob, this.explodeRad * 3)
                        suck(body, this.explodeRad * 2)
                        suck(powerUp, this.explodeRad * 1.5)
                        suck(bullet, this.explodeRad * 1.5)
                        suck([player], this.explodeRad * 1.3)
                    }
                    //keep bomb in place
                    Matter.Body.setVelocity(this, {
                        x: 0,
                        y: 0
                    });
                    //draw suck
                    const radius = 2.75 * this.explodeRad * (this.endCycle - simulation.cycle) / suckCycles
                    ctx.fillStyle = "rgba(0,0,0,0.1)";
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                }
            };
            speed = 35
            // speed = input.down ? 43 : 32

            bullet[me].endCycle = simulation.cycle + 70;
            if (input.down) {
                speed += 9
                bullet[me].endCycle += 20;
            }
            Matter.Body.setVelocity(bullet[me], {
                x: m.Vx / 2 + speed * Math.cos(angle),
                y: m.Vy / 2 + speed * Math.sin(angle)
            });
            Composite.add(engine.world, bullet[me]); //add bullet to world
        }

        grenadeNeutron = function(where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }, angle = m.angle, size = 1) {
            const me = bullet.length;
            bullet[me] = Bodies.polygon(where.x, where.y, 10, 4, b.fireAttributes(angle, false));
            b.fireProps((input.down ? 45 : 25) / Math.pow(0.92, tech.missileCount), input.down ? 35 : 20, angle, me); //cd , speed
            Matter.Body.setDensity(bullet[me], 0.000001);
            bullet[me].endCycle = Infinity;
            bullet[me].frictionAir = 0;
            bullet[me].friction = 1;
            bullet[me].frictionStatic = 1;
            bullet[me].restitution = 0;
            bullet[me].minDmgSpeed = 0;
            bullet[me].damageRadius = 100;
            bullet[me].maxDamageRadius = 450 * size + 130 * tech.isNeutronSlow //+ 150 * Math.random()
            bullet[me].radiusDecay = (0.81 + 0.15 * tech.isNeutronSlow) / tech.isBulletsLastLonger
            bullet[me].stuckTo = null;
            bullet[me].stuckToRelativePosition = null;
            if (tech.isRPG) {
                const SCALE = 2
                Matter.Body.scale(bullet[me], SCALE, SCALE);

                speed = input.down ? 25 : 15
                // speed = input.down ? 43 : 32

                Matter.Body.setVelocity(bullet[me], {
                    x: m.Vx / 2 + speed * Math.cos(angle),
                    y: m.Vy / 2 + speed * Math.sin(angle)
                });

                const MAG = 0.005
                bullet[me].thrust = {
                    x: bullet[me].mass * MAG * Math.cos(angle),
                    y: bullet[me].mass * MAG * Math.sin(angle)
                }
            }

            bullet[me].beforeDmg = function() {};
            bullet[me].stuck = function() {};
            bullet[me].do = function() {
                const onCollide = () => {
                    this.collisionFilter.mask = 0; //non collide with everything
                    Matter.Body.setVelocity(this, { x: 0, y: 0 });
                    if (tech.isRPG) this.thrust = { x: 0, y: 0 }
                    this.do = this.radiationMode;
                }

                const mobCollisions = Matter.Query.collides(this, mob)
                if (mobCollisions.length) {
                    onCollide()
                    this.stuckTo = mobCollisions[0].bodyA
                    mobs.statusDoT(this.stuckTo, 0.5, 360) //apply radiation damage status effect on direct hits

                    if (this.stuckTo.isVerticesChange) {
                        this.stuckToRelativePosition = {
                            x: 0,
                            y: 0
                        }
                    } else {
                        //find the relative position for when the mob is at angle zero by undoing the mobs rotation
                        this.stuckToRelativePosition = Vector.rotate(Vector.sub(this.position, this.stuckTo.position), -this.stuckTo.angle)
                    }
                    this.stuck = function() {
                        if (this.stuckTo && this.stuckTo.alive) {
                            const rotate = Vector.rotate(this.stuckToRelativePosition, this.stuckTo.angle) //add in the mob's new angle to the relative position vector
                            Matter.Body.setPosition(this, Vector.add(Vector.add(rotate, this.stuckTo.velocity), this.stuckTo.position))
                            Matter.Body.setVelocity(this, this.stuckTo.velocity); //so that it will move properly if it gets unstuck
                        } else {
                            this.collisionFilter.mask = cat.map | cat.body | cat.player | cat.mob; //non collide with everything but map
                            this.stuck = function() {
                                this.force.y += this.mass * 0.001;
                            }
                        }
                    }
                } else {
                    const bodyCollisions = Matter.Query.collides(this, body)
                    if (bodyCollisions.length) {
                        if (!bodyCollisions[0].bodyA.isNotHoldable) {
                            onCollide()
                            this.stuckTo = bodyCollisions[0].bodyA
                            //find the relative position for when the mob is at angle zero by undoing the mobs rotation
                            this.stuckToRelativePosition = Vector.rotate(Vector.sub(this.position, this.stuckTo.position), -this.stuckTo.angle)
                        } else {
                            this.do = this.radiationMode;
                        }
                        this.stuck = function() {
                            if (this.stuckTo) {
                                const rotate = Vector.rotate(this.stuckToRelativePosition, this.stuckTo.angle) //add in the mob's new angle to the relative position vector
                                Matter.Body.setPosition(this, Vector.add(Vector.add(rotate, this.stuckTo.velocity), this.stuckTo.position))
                                // Matter.Body.setVelocity(this, this.stuckTo.velocity); //so that it will move properly if it gets unstuck
                            } else {
                                this.force.y += this.mass * 0.001;
                            }
                        }
                    } else {
                        if (Matter.Query.collides(this, map).length) {
                            onCollide()
                        } else if (tech.isRPG) { //if colliding with nothing
                            this.force.x += this.thrust.x;
                            this.force.y += this.thrust.y;
                        } else {
                            this.force.y += this.mass * 0.001;
                        }
                    }
                }
            }
            bullet[me].radiationMode = function() { //the do code after the bullet is stuck on something,  projects a damaging radiation field
                this.stuck(); //runs different code based on what the bullet is stuck to
                this.damageRadius = this.damageRadius * 0.85 + 0.15 * this.maxDamageRadius //smooth radius towards max
                this.maxDamageRadius -= this.radiusDecay
                if (this.damageRadius < 15) {
                    this.endCycle = 0;
                } else {
                    //aoe damage to player
                    if (Vector.magnitude(Vector.sub(player.position, this.position)) < this.damageRadius) {
                        const DRAIN = tech.isRadioactiveResistance ? 0.0025 * 0.25 : 0.0025
                        if (m.energy > DRAIN) {
                            if (m.immuneCycle < m.cycle) m.energy -= DRAIN
                        } else {
                            m.energy = 0;
                            if (simulation.dmgScale) m.damage(tech.isRadioactiveResistance ? 0.00016 * 0.25 : 0.00016) //0.00015
                        }
                    }
                    //aoe damage to mobs
                    for (let i = 0, len = mob.length; i < len; i++) {
                        if (Vector.magnitude(Vector.sub(mob[i].position, this.position)) < this.damageRadius + mob[i].radius) {
                            let dmg = m.dmgScale * 0.11
                            if (Matter.Query.ray(map, mob[i].position, this.position).length > 0) dmg *= 0.25 //reduce damage if a wall is in the way
                            if (mob[i].shield) dmg *= 3 //to make up for the /5 that shields normally take
                            mob[i].damage(dmg);
                            mob[i].locatePlayer();
                            if (tech.isNeutronSlow && mob[i].speed > 4) {
                                Matter.Body.setVelocity(mob[i], {
                                    x: mob[i].velocity.x * 0.97,
                                    y: mob[i].velocity.y * 0.97
                                });
                            }
                        }
                    }
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, this.damageRadius, 0, 2 * Math.PI);
                    ctx.globalCompositeOperation = "lighter"
                    ctx.fillStyle = `rgba(25,139,170,${0.2+0.06*Math.random()})`;
                    ctx.fill();
                    ctx.globalCompositeOperation = "source-over"
                    if (tech.isNeutronSlow) {

                        let slow = (who, radius = this.explodeRad * 3.2) => {
                            for (i = 0, len = who.length; i < len; i++) {
                                const sub = Vector.sub(this.position, who[i].position);
                                const dist = Vector.magnitude(sub);
                                if (dist < radius) {
                                    Matter.Body.setVelocity(who[i], {
                                        x: who[i].velocity.x * 0.975,
                                        y: who[i].velocity.y * 0.975
                                    });
                                }
                            }
                        }
                        slow(body, this.damageRadius)
                        slow([player], this.damageRadius)
                    }
                }
            }
        }
        let gunIndex = null
        for (let i = 0, len = b.guns.length; i < len; i++) {
            if (b.guns[i].name === "grenades") {
                gunIndex = i
            }
        }


        if (tech.isNeutronBomb) {
            b.grenade = grenadeNeutron
            if (tech.isRPG) {
                b.guns[gunIndex].do = function() {}
            } else {
                if (gunIndex) b.guns[gunIndex].do = function() {
                    if (!input.field && input.down) {
                        const cycles = 80
                        const speed = input.down ? 35 : 20 //input.down ? 43 : 32
                        const g = input.down ? 0.137 : 0.135
                        const v = { x: speed * Math.cos(m.angle), y: speed * Math.sin(m.angle) }
                        ctx.strokeStyle = "rgba(68, 68, 68, 0.2)" //color.map
                        ctx.lineWidth = 2
                        ctx.beginPath()
                        for (let i = 1, len = 19; i < len + 1; i++) {
                            const time = cycles * i / len
                            ctx.lineTo(m.pos.x + time * v.x, m.pos.y + time * v.y + g * time * time)
                        }
                        ctx.stroke()
                    }
                }
            }
        } else if (tech.isRPG) {
            b.guns[gunIndex].do = function() {}
            if (tech.isVacuumBomb) {
                b.grenade = grenadeRPGVacuum
            } else {
                b.grenade = grenadeRPG
            }
        } else if (tech.isVacuumBomb) {
            b.grenade = grenadeVacuum
            if (gunIndex) b.guns[gunIndex].do = function() {
                if (!input.field && input.down) {
                    const cycles = Math.floor(input.down ? 50 : 30) //30
                    const speed = input.down ? 44 : 35
                    const v = { x: speed * Math.cos(m.angle), y: speed * Math.sin(m.angle) }
                    ctx.strokeStyle = "rgba(68, 68, 68, 0.2)" //color.map
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    for (let i = 1.6, len = 19; i < len + 1; i++) {
                        const time = cycles * i / len
                        ctx.lineTo(m.pos.x + time * v.x, m.pos.y + time * v.y + 0.34 * time * time)
                    }
                    ctx.stroke()
                }
            }
        } else {
            b.grenade = grenadeDefault
            if (gunIndex) b.guns[gunIndex].do = function() {
                if (!input.field && input.down) {
                    const cycles = Math.floor(input.down ? 120 : 80) //30
                    const speed = input.down ? 43 : 32
                    const v = { x: speed * Math.cos(m.angle), y: speed * Math.sin(m.angle) } //m.Vy / 2 + removed to make the path less jerky
                    ctx.strokeStyle = "rgba(68, 68, 68, 0.2)" //color.map
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    for (let i = 0.5, len = 19; i < len + 1; i++) {
                        const time = cycles * i / len
                        ctx.lineTo(m.pos.x + time * v.x, m.pos.y + time * v.y + 0.34 * time * time)
                    }
                    ctx.stroke()
                }
            }
        }
    },
    dart(where, angle = m.angle, size = 0.8) {
        //find a target
        const closest = {
            score: 10000,
            position: null
        }
        for (let i = 0, len = mob.length; i < len; ++i) {
            if (mob[i].alive && !mob[i].isBadTarget && Matter.Query.ray(map, where, mob[i].position).length === 0) {
                const dot = Vector.dot({ x: Math.cos(angle), y: Math.sin(angle) }, Vector.normalise(Vector.sub(mob[i].position, where))) //the dot product of diff and dir will return how much over lap between the vectors
                const dist = Vector.magnitude(Vector.sub(where, mob[i].position))
                // if (dist < closest.score && ((dist > 500 && dot > 0) || (dot > 0.9))) { //target closest mob that player is looking at and isn't too close to target
                if (dist < closest.score && dot > 0.9 - 0.0004 * dist) { //target closest mob that player is looking at and isn't too close to target
                    closest.score = dist
                    closest.position = mob[i].position
                }
            }
        }
        if (!closest.position) {
            // const unit = Vector.mult(sub(simulation.mouseInGame, where), 10000)
            closest.position = Vector.mult(Vector.sub(simulation.mouseInGame, where), 10000)
        }
        const me = bullet.length;
        bullet[me] = Bodies.fromVertices(where.x, where.y, [{ x: -20 * size, y: 2 * size, index: 0, isInternal: false }, { x: -20 * size, y: -2 * size, index: 1, isInternal: false }, { x: 5 * size, y: -2 * size, index: 4, isInternal: false }, { x: 20 * size, y: 0, index: 3, isInternal: false }, { x: 5 * size, y: 2 * size, index: 4, isInternal: false }], {
            cycle: 0,
            angle: angle,
            friction: 1,
            frictionAir: 0.15,
            thrustMag: 0.03,
            turnRate: 0.15, //0.015
            drawStringControlMagnitude: 3000 + 5000 * Math.random(),
            drawStringFlip: (Math.round(Math.random()) ? 1 : -1),
            dmg: 7, //damage done in addition to the damage from momentum
            classType: "bullet",
            endCycle: simulation.cycle + 120,
            collisionFilter: {
                category: cat.bullet,
                mask: tech.isShieldPierce ? cat.body | cat.mob | cat.mobBullet : cat.body | cat.mob | cat.mobBullet | cat.mobShield,
            },
            minDmgSpeed: 0,
            lookFrequency: Math.floor(7 + Math.random() * 3),
            density: 0.001, //0.001 is normal for blocks,  0.008 is normal for harpoon,  0.008*6 when buffed
            beforeDmg(who) {
                if (tech.isShieldPierce && who.isShielded) { //disable shields
                    who.isShielded = false
                    requestAnimationFrame(() => { who.isShielded = true });
                }
                if (tech.fragments) {
                    b.targetedNail(this.vertices[2], tech.fragments * Math.floor(2 + 1.5 * Math.random()))
                    this.endCycle = 0;
                }
                if (!who.isBadTarget) {
                    this.frictionAir = 0.01
                    this.do = this.doNoTargeting
                }
            },
            onEnd() {},
            doNoTargeting: function() {
                // this.force.y += this.mass * 0.001;
                if (Matter.Query.collides(this, map).length) { //stick in walls
                    this.collisionFilter.mask = 0;
                    Matter.Body.setAngularVelocity(this, 0)
                    Matter.Body.setVelocity(this, {
                        x: 0,
                        y: 0
                    });
                    this.do = () => {
                        // if (!Matter.Query.collides(this, map).length) this.force.y += this.mass * 0.001;
                    }
                }
            },
            do() {
                this.cycle++
                // if (this.cycle > 40) {
                //     this.frictionAir = 0.003
                //     this.do = this.doNoTargeting
                // }
                // if (closest.target) { //rotate towards the target
                const face = { x: Math.cos(this.angle), y: Math.sin(this.angle) };
                const vectorGoal = Vector.normalise(Vector.sub(this.position, closest.position));
                const cross = Vector.cross(vectorGoal, face)
                if (cross > 0.01) {
                    Matter.Body.rotate(this, this.turnRate * Math.sqrt(cross));
                } else if (cross < 0.01) {
                    Matter.Body.rotate(this, -this.turnRate * Math.sqrt(Math.abs(cross)));
                }
                this.force.x += this.thrustMag * this.mass * Math.cos(this.angle);
                this.force.y += this.thrustMag * this.mass * Math.sin(this.angle);
                // }
                if (Matter.Query.collides(this, map).length) { //stick in walls
                    this.collisionFilter.mask = 0;
                    Matter.Body.setAngularVelocity(this, 0)
                    Matter.Body.setVelocity(this, {
                        x: 0,
                        y: 0
                    });
                    this.do = this.doNoTargeting
                }
                // else if (!(this.cycle % 2)) { //look for a target if you don't have one
                //     simulation.drawList.push({ //add dmg to draw queue
                //         x: this.position.x,
                //         y: this.position.y,
                //         radius: 10,
                //         color: simulation.mobDmgColor,
                //         time: simulation.drawTime
                //     });
                //     let closest = {
                //         distance: 2000,
                //         target: null
                //     }
                //     const dir = Vector.normalise(this.velocity) //make a vector for direction of length 1
                //     for (let i = 0, len = mob.length; i < len; ++i) {
                //         if (
                //             mob[i].alive && !mob[i].isBadTarget &&
                //             Matter.Query.ray(map, this.position, mob[i].position).length === 0 && //check for map in Line of sight
                //             Vector.dot(dir, Vector.normalise(Vector.sub(mob[i].position, this.position))) > 0.55 //the dot product of diff and dir will return how much over lap between the vectors
                //         ) {
                //             const dist = Vector.magnitude(Vector.sub(this.position, mob[i].position))
                //             if (dist < closest.distance) {
                //                 closest.distance = dist
                //                 closest.target = mob[i]
                //             }
                //         }
                //     }
                //     if (closest.target) {
                //         target = closest.target
                //         this.turnRate = 0.05
                //         this.frictionAir = 0.8
                //     }
                // }
            },
        });
        Matter.Body.setVelocity(bullet[me], {
            x: m.Vx / 2 + 40 * Math.cos(bullet[me].angle),
            y: m.Vy / 2 + 40 * Math.sin(bullet[me].angle)
        });
        // if (!closest.target) {
        //     bullet[me].frictionAir = 0.002
        //     bullet[me].do = bullet[me].doNoTargeting
        // }
        Composite.add(engine.world, bullet[me]); //add bullet to world

    },
    grapple(where, angle = m.angle, harpoonSize = 1) {
        const me = bullet.length;
        const returnRadius = 100 * Math.sqrt(harpoonSize)
        bullet[me] = Bodies.fromVertices(where.x, where.y, [{ x: -50 * harpoonSize, y: 2 * harpoonSize, index: 0, isInternal: false }, { x: -50 * harpoonSize, y: -2 * harpoonSize, index: 1, isInternal: false }, { x: 45 * harpoonSize, y: -3 * harpoonSize, index: 2, isInternal: false }, { x: 50 * harpoonSize, y: 0, index: 3, isInternal: false }, { x: 45 * harpoonSize, y: 3 * harpoonSize, index: 4, isInternal: false }], {
            angle: angle,
            friction: 1,
            frictionAir: 0.4,
            thrustMag: 0.1,
            dmg: 6, //damage done in addition to the damage from momentum
            classType: "bullet",
            endCycle: simulation.cycle + 70,
            collisionFilter: {
                category: cat.bullet,
                mask: tech.isShieldPierce ? cat.body | cat.mob | cat.mobBullet : cat.body | cat.mob | cat.mobBullet | cat.mobShield,
            },
            minDmgSpeed: 4,
            lookFrequency: Math.floor(7 + Math.random() * 3),
            density: tech.harpoonDensity, //0.001 is normal for blocks,  0.005 is normal for harpoon,  0.005*6 when buffed
            drain: 0.004,
            beforeDmg(who) {
                if (tech.isShieldPierce && who.isShielded) { //disable shields
                    who.isShielded = false
                    requestAnimationFrame(() => { who.isShielded = true });
                }
                if (tech.fragments) {
                    b.targetedNail(this.vertices[2], tech.fragments * Math.floor(2 + Math.random()))
                }
                // if (!who.isBadTarget) {
                //     this.do = this.returnToPlayer
                // }
            },
            caughtPowerUp: null,
            dropCaughtPowerUp() {
                if (this.caughtPowerUp) {
                    this.caughtPowerUp.collisionFilter.category = cat.powerUp
                    this.caughtPowerUp.collisionFilter.mask = cat.map | cat.powerUp
                    this.caughtPowerUp = null
                }
            },
            onEnd() {
                if (this.caughtPowerUp && !simulation.isChoosing && (this.caughtPowerUp.name !== "heal" || m.health !== m.maxHealth || tech.isOverHeal)) {
                    let index = null //find index
                    for (let i = 0, len = powerUp.length; i < len; ++i) {
                        if (powerUp[i] === this.caughtPowerUp) index = i
                    }
                    if (index !== null) {
                        powerUps.onPickUp(this.caughtPowerUp);
                        this.caughtPowerUp.effect();
                        Matter.Composite.remove(engine.world, this.caughtPowerUp);
                        powerUp.splice(index, 1);
                        if (tech.isHarpoonPowerUp) tech.harpoonDensity = 0.005 * 6 //0.005 is normal
                    } else {
                        this.dropCaughtPowerUp()
                    }
                } else {
                    this.dropCaughtPowerUp()
                }
            },
            draw() {
                const where = {
                    x: m.pos.x + 30 * Math.cos(m.angle),
                    y: m.pos.y + 30 * Math.sin(m.angle)
                }
                const sub = Vector.sub(where, this.vertices[0])
                const controlPoint = Vector.add(where, Vector.mult(sub, -0.5))
                ctx.strokeStyle = "#000" // "#0ce"
                ctx.lineWidth = 0.5
                ctx.beginPath();
                ctx.moveTo(where.x, where.y);
                ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, this.vertices[0].x, this.vertices[0].y)
                // ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
                ctx.stroke();
                //draw harpoon spikes
                const spikeLength = 2
                ctx.beginPath();
                const spike1 = Vector.add(this.vertices[1], Vector.mult(Vector.sub(this.vertices[1], this.vertices[2]), spikeLength))
                ctx.moveTo(this.vertices[2].x, this.vertices[2].y);
                ctx.lineTo(spike1.x, spike1.y);
                ctx.lineTo(this.vertices[3].x, this.vertices[3].y);

                const spike2 = Vector.add(this.vertices[3], Vector.mult(Vector.sub(this.vertices[3], this.vertices[2]), spikeLength))
                ctx.moveTo(this.vertices[2].x, this.vertices[2].y);
                ctx.lineTo(spike2.x, spike2.y);
                ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
                ctx.fillStyle = '#000'
                ctx.fill();
            },
            returnToPlayer() {
                if (Vector.magnitude(Vector.sub(this.position, m.pos)) < returnRadius) { //near player
                    this.endCycle = 0;
                    if (m.cycle + 25 * b.fireCDscale < m.fireCDcycle) m.fireCDcycle = m.cycle + 35 * b.fireCDscale //lower cd to 25 if it is above 25
                    //recoil on catching
                    const momentum = Vector.mult(Vector.sub(this.velocity, player.velocity), (input.down ? 0.00015 : 0.0003))
                    player.force.x += momentum.x
                    player.force.y += momentum.y
                    // refund ammo
                    for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                        if (b.guns[i].name === "harpoon") {
                            b.guns[i].ammo++;
                            simulation.updateGunHUD();
                            break;
                        }
                    }
                } else {
                    if (!tech.isRailEnergyGain && m.energy > 0.005) m.energy -= 0.005
                    const sub = Vector.sub(this.position, m.pos)
                    const rangeScale = 1 + 0.000001 * Vector.magnitude(sub) * Vector.magnitude(sub) //return faster when far from player
                    const returnForce = Vector.mult(Vector.normalise(sub), rangeScale * this.thrustMag * this.mass)
                    this.force.x -= returnForce.x
                    this.force.y -= returnForce.y
                    this.grabPowerUp()
                }
                this.draw();
            },
            grabPowerUp() { //grab power ups near the tip of the harpoon
                if (this.caughtPowerUp) {
                    Matter.Body.setPosition(this.caughtPowerUp, Vector.add(this.vertices[2], this.velocity))
                    Matter.Body.setVelocity(this.caughtPowerUp, { x: 0, y: 0 })
                } else { //&& simulation.cycle % 2 
                    for (let i = 0, len = powerUp.length; i < len; ++i) {
                        const radius = powerUp[i].circleRadius + 50
                        if (Vector.magnitudeSquared(Vector.sub(this.vertices[2], powerUp[i].position)) < radius * radius) {
                            if (powerUp[i].name !== "heal" || m.health !== m.maxHealth || tech.isOverHeal) {
                                this.caughtPowerUp = powerUp[i]
                                Matter.Body.setVelocity(powerUp[i], { x: 0, y: 0 })
                                Matter.Body.setPosition(powerUp[i], this.vertices[2])
                                powerUp[i].collisionFilter.category = 0
                                powerUp[i].collisionFilter.mask = 0
                                this.thrustMag *= 0.6
                                this.endCycle += 0.5 //it pulls back slower, so this prevents it from ending early
                                break //just pull 1 power up if possible
                            }
                        }
                    }
                }
            },
            do() {
                if (input.fire) { //&& !Matter.Query.collides(this, body).length
                    this.grabPowerUp()
                    if (this.endCycle < simulation.cycle + 1) { //if at end of lifespan, but player is holding down fire, force retraction
                        this.endCycle = simulation.cycle + 60
                        m.fireCDcycle = m.cycle + 20 // cool down
                        this.do = this.returnToPlayer
                        Matter.Body.setDensity(this, 0.0005); //reduce density on return
                        if (this.angularSpeed < 0.5) this.torque += this.inertia * 0.001 * (Math.random() - 0.5) //(Math.round(Math.random()) ? 1 : -1)
                        this.collisionFilter.mask = cat.map | cat.mob | cat.mobBullet | cat.mobShield // | cat.body
                    }
                } else {
                    //snap rope if not enough energy
                    if (m.energy < 0.05) {
                        const returnForce = Vector.mult(Vector.normalise(Vector.sub(this.position, m.pos)), 3 * this.thrustMag * this.mass)
                        this.force.x -= returnForce.x
                        this.force.y -= returnForce.y
                        this.frictionAir = 0.002
                        this.do = () => {
                            if (this.speed < 20) this.force.y += 0.0005 * this.mass;
                        }
                        this.dropCaughtPowerUp()
                    } else {
                        //return to player
                        this.do = this.returnToPlayer
                        this.endCycle = simulation.cycle + 60
                        Matter.Body.setDensity(this, 0.0005); //reduce density on return
                        if (this.angularSpeed < 0.5) this.torque += this.inertia * 0.001 * (Math.random() - 0.5) //(Math.round(Math.random()) ? 1 : -1)
                        this.collisionFilter.mask = cat.map | cat.mob | cat.mobBullet | cat.mobShield // | cat.body
                    }
                }
                //grappling hook
                if (input.fire && Matter.Query.collides(this, map).length) {
                    Matter.Body.setPosition(this, Vector.add(this.position, { x: 20 * Math.cos(this.angle), y: 20 * Math.sin(this.angle) }))
                    if (Matter.Query.collides(this, map).length) {
                        Matter.Body.setVelocity(this, { x: 0, y: 0 });
                        Matter.Sleeping.set(this, true)
                        this.endCycle = simulation.cycle + 5
                        this.dropCaughtPowerUp()
                        this.do = () => {
                            //between player nose and the grapple
                            const sub = Vector.sub(this.vertices[0], {
                                x: m.pos.x + 30 * Math.cos(m.angle),
                                y: m.pos.y + 30 * Math.sin(m.angle)
                            })
                            let dist = Vector.magnitude(sub)
                            if (input.fire) {
                                m.fireCDcycle = m.cycle + 30; // cool down if out of energy
                                this.endCycle = simulation.cycle + 10
                                if (input.down) { //down
                                    dist = 0
                                    player.force.y += 5 * player.mass * simulation.g;
                                }
                                if (m.energy > this.drain || tech.isRailEnergyGain) {
                                    Matter.Body.setVelocity(player, { x: player.velocity.x * 0.8, y: player.velocity.y * 0.8 });
                                    const pull = Vector.mult(Vector.normalise(sub), 0.0008 * Math.min(Math.max(15, dist), 200))
                                    player.force.x += pull.x
                                    player.force.y += pull.y

                                    if (!tech.isRailEnergyGain && dist > 500) {
                                        m.energy -= this.drain
                                        if (m.energy < 0) {
                                            this.endCycle = 0;
                                            if (m.cycle + 50 < m.fireCDcycle) m.fireCDcycle = m.cycle + 50
                                            // refund ammo
                                            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                                                if (b.guns[i].name === "harpoon") {
                                                    b.guns[i].ammo++;
                                                    simulation.updateGunHUD();
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (tech.isImmuneGrapple && m.immuneCycle < m.cycle + 10) {
                                    m.immuneCycle = m.cycle + 10;
                                    if (m.energy > 0.001) {
                                        m.energy -= 0.001
                                    } else {
                                        Matter.Sleeping.set(this, false)
                                        this.collisionFilter.category = 0
                                        this.collisionFilter.mask = 0
                                        this.do = this.returnToPlayer
                                        this.endCycle = simulation.cycle + 60
                                    }
                                }
                            } else {
                                Matter.Sleeping.set(this, false)
                                this.collisionFilter.category = 0
                                this.collisionFilter.mask = 0
                                this.do = this.returnToPlayer
                                this.endCycle = simulation.cycle + 60
                            }
                            this.draw();
                        }
                    }
                }
                this.force.x += this.thrustMag * this.mass * Math.cos(this.angle);
                this.force.y += this.thrustMag * this.mass * Math.sin(this.angle);
                this.draw()
            },
        });
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    harpoon(where, target, angle = m.angle, harpoonSize = 1, isReturn = false, totalCycles = 35, isReturnAmmo = true) {
        const me = bullet.length;
        const returnRadius = 100 * Math.sqrt(harpoonSize)
        bullet[me] = Bodies.fromVertices(where.x, where.y, [{ x: -40 * harpoonSize, y: 2 * harpoonSize, index: 0, isInternal: false }, { x: -40 * harpoonSize, y: -2 * harpoonSize, index: 1, isInternal: false }, { x: 50 * harpoonSize, y: -3 * harpoonSize, index: 3, isInternal: false }, { x: 30 * harpoonSize, y: 2 * harpoonSize, index: 4, isInternal: false }], {
            cycle: 0,
            angle: angle,
            friction: 1,
            frictionAir: 0.4,
            thrustMag: 0.1,
            turnRate: isReturn ? 0.1 : 0.03, //0.015
            drawStringControlMagnitude: 3000 + 5000 * Math.random(),
            drawStringFlip: (Math.round(Math.random()) ? 1 : -1),
            dmg: 6, //damage done in addition to the damage from momentum
            classType: "bullet",
            endCycle: simulation.cycle + totalCycles * 2.5 + 15,
            collisionFilter: {
                category: cat.bullet,
                mask: tech.isShieldPierce ? cat.map | cat.body | cat.mob | cat.mobBullet : cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield,
            },
            minDmgSpeed: 4,
            lookFrequency: Math.floor(7 + Math.random() * 3),
            density: tech.harpoonDensity, //0.001 is normal for blocks,  0.005 is normal for harpoon,  0.005*6 when buffed
            beforeDmg(who) {
                if (tech.isShieldPierce && who.isShielded) { //disable shields
                    who.isShielded = false
                    requestAnimationFrame(() => { who.isShielded = true });
                }
                if (tech.fragments) {
                    b.targetedNail(this.vertices[2], tech.fragments * Math.floor(2 + Math.random()))
                    if (!isReturn) this.endCycle = 0;
                }
                if (!who.isBadTarget) {
                    if (isReturn) {
                        this.do = this.returnToPlayer
                    } else {
                        this.frictionAir = 0.01
                        this.do = () => {
                            this.force.y += this.mass * 0.003; //gravity
                            this.draw();
                        }
                    }

                }
            },
            caughtPowerUp: null,
            dropCaughtPowerUp() {
                if (this.caughtPowerUp) {
                    this.caughtPowerUp.collisionFilter.category = cat.powerUp
                    this.caughtPowerUp.collisionFilter.mask = cat.map | cat.powerUp
                    this.caughtPowerUp = null
                }
            },
            onEnd() {
                if (this.caughtPowerUp && !simulation.isChoosing && (this.caughtPowerUp.name !== "heal" || m.health !== m.maxHealth || tech.isOverHeal)) {
                    let index = null //find index
                    for (let i = 0, len = powerUp.length; i < len; ++i) {
                        if (powerUp[i] === this.caughtPowerUp) index = i
                    }
                    if (index !== null) {
                        powerUps.onPickUp(this.caughtPowerUp);
                        this.caughtPowerUp.effect();
                        Matter.Composite.remove(engine.world, this.caughtPowerUp);
                        powerUp.splice(index, 1);
                        if (tech.isHarpoonPowerUp) tech.harpoonDensity = 0.005 * 6 //0.006 is normal
                    } else {
                        this.dropCaughtPowerUp()
                    }
                } else {
                    this.dropCaughtPowerUp()
                }
            },
            drawToggleHarpoon() {
                ctx.beginPath();
                ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
                for (let j = 1, len = this.vertices.length; j < len; j += 1) ctx.lineTo(this.vertices[j].x, this.vertices[j].y);
                ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
                ctx.lineJoin = "miter"
                ctx.miterLimit = 100;
                ctx.lineWidth = 60;
                ctx.strokeStyle = "rgba(0,255,255,0.25)";
                ctx.stroke();
                ctx.lineWidth = 20;
                ctx.strokeStyle = "rgb(0,255,255)";
                ctx.stroke();
                ctx.lineJoin = "round"
                ctx.miterLimit = 10
                ctx.sillStyle = "#000"
                ctx.fill();
            },
            drawString() {
                const where = {
                    x: m.pos.x + 30 * Math.cos(m.angle),
                    y: m.pos.y + 30 * Math.sin(m.angle)
                }
                const sub = Vector.sub(where, this.vertices[0])
                const perpendicular = Vector.mult(Vector.normalise(Vector.perp(sub)), this.drawStringFlip * Math.min(80, 10 + this.drawStringControlMagnitude / (10 + Vector.magnitude(sub))))
                const controlPoint = Vector.add(Vector.add(where, Vector.mult(sub, -0.5)), perpendicular)
                ctx.strokeStyle = "#000" // "#0ce"
                ctx.lineWidth = 0.5
                ctx.beginPath();
                ctx.moveTo(where.x, where.y);
                ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, this.vertices[0].x, this.vertices[0].y)
                // ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
                ctx.stroke();
            },
            draw() {},
            returnToPlayer() {
                if (Vector.magnitude(Vector.sub(this.position, m.pos)) < returnRadius) { //near player
                    this.endCycle = 0;
                    if (m.cycle + 25 * b.fireCDscale < m.fireCDcycle) m.fireCDcycle = m.cycle + 35 * b.fireCDscale //lower cd to 25 if it is above 25
                    //recoil on catching
                    const momentum = Vector.mult(Vector.sub(this.velocity, player.velocity), (input.down ? 0.00015 : 0.0003))
                    player.force.x += momentum.x
                    player.force.y += momentum.y
                    // refund ammo
                    if (isReturnAmmo) {
                        for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                            if (b.guns[i].name === "harpoon") {
                                b.guns[i].ammo++;
                                simulation.updateGunHUD();
                                break;
                            }
                        }
                    }
                } else {
                    if (!tech.isRailEnergyGain && m.energy > 0.005) m.energy -= 0.005
                    const sub = Vector.sub(this.position, m.pos)
                    const rangeScale = 1 + 0.000001 * Vector.magnitude(sub) * Vector.magnitude(sub) //return faster when far from player
                    const returnForce = Vector.mult(Vector.normalise(sub), rangeScale * this.thrustMag * this.mass)
                    this.force.x -= returnForce.x
                    this.force.y -= returnForce.y
                    this.grabPowerUp()
                }
                this.draw();
            },
            grabPowerUp() { //grab power ups near the tip of the harpoon
                if (this.caughtPowerUp) {
                    Matter.Body.setPosition(this.caughtPowerUp, Vector.add(this.vertices[2], this.velocity))
                    Matter.Body.setVelocity(this.caughtPowerUp, { x: 0, y: 0 })
                } else { //&& simulation.cycle % 2 
                    for (let i = 0, len = powerUp.length; i < len; ++i) {
                        const radius = powerUp[i].circleRadius + 50
                        if (Vector.magnitudeSquared(Vector.sub(this.vertices[2], powerUp[i].position)) < radius * radius) {
                            if (powerUp[i].name !== "heal" || m.health !== m.maxHealth || tech.isOverHeal) {
                                this.caughtPowerUp = powerUp[i]
                                Matter.Body.setVelocity(powerUp[i], { x: 0, y: 0 })
                                Matter.Body.setPosition(powerUp[i], this.vertices[2])
                                powerUp[i].collisionFilter.category = 0
                                powerUp[i].collisionFilter.mask = 0
                                this.thrustMag *= 0.6
                                this.endCycle += 0.5 //it pulls back slower, so this prevents it from ending early
                                break //just pull 1 power up if possible
                            }
                        }
                    }
                }
            },
            do() {
                this.cycle++
                if (isReturn || target) {
                    if (isReturn) {
                        if (this.cycle > totalCycles) {
                            //snap rope if not enough energy
                            if (m.energy < 0.05) {
                                const returnForce = Vector.mult(Vector.normalise(Vector.sub(this.position, m.pos)), 3 * this.thrustMag * this.mass)
                                this.force.x -= returnForce.x
                                this.force.y -= returnForce.y
                                this.frictionAir = 0.002
                                this.do = () => {
                                    if (this.speed < 20) this.force.y += 0.0005 * this.mass;
                                }
                                this.dropCaughtPowerUp()
                            } else {
                                //return to player
                                this.do = this.returnToPlayer
                                Matter.Body.setDensity(this, 0.0005); //reduce density on return
                                if (this.angularSpeed < 0.5) this.torque += this.inertia * 0.001 * (Math.random() - 0.5) //(Math.round(Math.random()) ? 1 : -1)
                                this.collisionFilter.mask = cat.map | cat.mob | cat.mobBullet | cat.mobShield // | cat.body
                            }
                        } else {
                            this.grabPowerUp()
                        }
                    }

                    if (target) { //rotate towards the target
                        const face = {
                            x: Math.cos(this.angle),
                            y: Math.sin(this.angle)
                        };
                        const vectorGoal = Vector.normalise(Vector.sub(this.position, target.position));
                        if (Vector.cross(vectorGoal, face) > 0) {
                            Matter.Body.rotate(this, this.turnRate);
                        } else {
                            Matter.Body.rotate(this, -this.turnRate);
                        }
                    }
                    //grappling hook
                    // if (input.fire && !input.down && Matter.Query.collides(this, map).length) {
                    //     const pull = Vector.mult(Vector.normalise(Vector.sub(this.position, m.pos)), 0.1)
                    //     player.force.x += pull.x
                    //     player.force.y += pull.y - player.mass * 0.02
                    //     Matter.Body.setStatic(this, true)
                    //     this.endCycle = simulation.cycle + 5
                    //     this.dropCaughtPowerUp()
                    //     this.do = () => {
                    //         const sub = Vector.sub(this.position, m.pos)
                    //         const dist = Vector.magnitude(sub)
                    //         if (input.fire) {
                    //             m.fireCDcycle = m.cycle + 30; // cool down if out of energy
                    //             this.endCycle = simulation.cycle + 10
                    //             const pull = Vector.mult(Vector.normalise(sub), 0.001 * Math.min(Math.max(1, dist), 100))
                    //             player.force.x += pull.x
                    //             player.force.y += pull.y
                    //             Matter.Body.setVelocity(player, { x: player.velocity.x * 0.8, y: player.velocity.y * 0.8 });
                    //         } else { //if (Vector.magnitude(Vector.sub(this.position, m.pos)) < returnRadius + 200)
                    //             //automatically get ammo back
                    //             this.endCycle = 0;
                    //             if (m.cycle + 15 * b.fireCDscale < m.fireCDcycle) m.fireCDcycle = m.cycle + 15 * b.fireCDscale //lower cd to 15 if it is above 15
                    //             // refund ammo
                    //             for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    //                 if (b.guns[i].name === "harpoon") {
                    //                     b.guns[i].ammo++;
                    //                     simulation.updateGunHUD();
                    //                     break;
                    //                 }
                    //             }
                    //         }
                    //         if (dist > returnRadius) this.draw();
                    //     }
                    // }
                    this.force.x += this.thrustMag * this.mass * Math.cos(this.angle);
                    this.force.y += this.thrustMag * this.mass * Math.sin(this.angle);
                }
                // else if (!(this.cycle % 2)) { //look for a target if you don't have one
                //     simulation.drawList.push({ //add dmg to draw queue
                //         x: this.position.x,
                //         y: this.position.y,
                //         radius: 10,
                //         color: simulation.mobDmgColor,
                //         time: simulation.drawTime
                //     });
                //     let closest = {
                //         distance: 2000,
                //         target: null
                //     }
                //     const dir = Vector.normalise(this.velocity) //make a vector for direction of length 1
                //     for (let i = 0, len = mob.length; i < len; ++i) {
                //         if (
                //             mob[i].alive && !mob[i].isBadTarget &&
                //             Matter.Query.ray(map, this.position, mob[i].position).length === 0 && //check for map in Line of sight
                //             Vector.dot(dir, Vector.normalise(Vector.sub(mob[i].position, this.position))) > 0.55 //the dot product of diff and dir will return how much over lap between the vectors
                //         ) {
                //             const dist = Vector.magnitude(Vector.sub(this.position, mob[i].position))
                //             if (dist < closest.distance) {
                //                 closest.distance = dist
                //                 closest.target = mob[i]
                //             }
                //         }
                //     }
                //     if (closest.target) {
                //         target = closest.target
                //         this.turnRate = 0.05
                //         this.frictionAir = 0.8
                //     }
                // }
                this.draw()
            },
        });
        if (!isReturn && !target) {
            Matter.Body.setVelocity(bullet[me], {
                x: m.Vx / 2 + 60 * Math.cos(bullet[me].angle),
                y: m.Vy / 2 + 60 * Math.sin(bullet[me].angle)
            });
            bullet[me].frictionAir = 0.002
            bullet[me].do = function() {
                if (this.speed < 20) this.force.y += 0.0005 * this.mass;
                this.draw();
            }
        }
        if (tech.isHarpoonPowerUp && bullet[me].density > 0.01) {
            if (isReturn) {
                bullet[me].draw = function() {
                    this.drawToggleHarpoon()
                    this.drawString()
                }
            } else {
                bullet[me].draw = function() {
                    this.drawToggleHarpoon()
                }
            }
        } else if (isReturn) {
            bullet[me].draw = function() {
                this.drawString()
            }
        }
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    missile(where, angle, speed, size = 1) {
        if (tech.isMissileBig) {
            size *= 1.55
            if (tech.isMissileBiggest) {
                size *= 2

            }
        }
        const me = bullet.length;
        bullet[me] = Bodies.rectangle(where.x, where.y, 30 * size, 4 * size, {
            angle: angle,
            friction: 0.5,
            frictionAir: 0.045,
            dmg: 0, //damage done in addition to the damage from momentum
            classType: "bullet",
            endCycle: simulation.cycle + Math.floor((230 + 40 * Math.random()) * tech.isBulletsLastLonger + 120 * tech.isMissileBiggest + 60 * tech.isMissileBig),
            collisionFilter: {
                category: cat.bullet,
                mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield
            },
            minDmgSpeed: 10,
            lookFrequency: Math.floor(10 + Math.random() * 3),
            explodeRad: (tech.isMissileBig ? 230 : 180) + 60 * Math.random(),
            density: 0.02, //0.001 is normal
            startCycle: m.cycle,
            beforeDmg() {
                Matter.Body.setDensity(this, 0.0001); //reduce density to normal
                this.tryToLockOn();
                this.endCycle = 0; //bullet ends cycle after doing damage  // also triggers explosion
            },
            onEnd() {
                b.explosion(this.position, this.explodeRad * size); //makes bullet do explosive damage at end
                if (tech.fragments) b.targetedNail(this.position, tech.fragments * Math.floor(2 + 1.5 * Math.random()))
            },
            lockedOn: null,
            tryToLockOn() {
                let closeDist = Infinity;
                const futurePos = Vector.add(this.position, Vector.mult(this.velocity, 30)) //look for closest target to where the missile will be in 30 cycles
                this.lockedOn = null;
                // const futurePos = this.lockedOn ? :Vector.add(this.position, Vector.mult(this.velocity, 50))
                for (let i = 0, len = mob.length; i < len; ++i) {
                    if (
                        mob[i].alive && !mob[i].isBadTarget &&
                        Matter.Query.ray(map, this.position, mob[i].position).length === 0
                        // && Matter.Query.ray(body, this.position, mob[i].position).length === 0
                    ) {
                        const futureDist = Vector.magnitude(Vector.sub(futurePos, mob[i].position));
                        if (futureDist < closeDist) {
                            closeDist = futureDist;
                            this.lockedOn = mob[i];
                            // this.frictionAir = 0.04; //extra friction once a target it locked
                        }
                        if (Vector.magnitude(Vector.sub(this.position, mob[i].position) < this.explodeRad)) {
                            this.endCycle = 0; //bullet ends cycle after doing damage  //also triggers explosion
                            mob[i].lockedOn.damage(m.dmgScale * 2 * size); //does extra damage to target
                        }
                    }
                }
                //explode when bullet is close enough to target
                if (this.lockedOn && Vector.magnitude(Vector.sub(this.position, this.lockedOn.position)) < this.explodeRad) {
                    this.endCycle = 0; //bullet ends cycle after doing damage  //also triggers explosion
                    this.lockedOn.damage(m.dmgScale * 4 * size); //does extra damage to target
                }
            },
            do() {
                if (!(m.cycle % this.lookFrequency)) this.tryToLockOn();
                if (this.lockedOn) { //rotate missile towards the target
                    const face = {
                        x: Math.cos(this.angle),
                        y: Math.sin(this.angle)
                    };
                    const target = Vector.normalise(Vector.sub(this.position, this.lockedOn.position));
                    const dot = Vector.dot(target, face)
                    const aim = Math.min(0.08, (1 + dot) * 1)
                    if (Vector.cross(target, face) > 0) {
                        Matter.Body.rotate(this, aim);
                    } else {
                        Matter.Body.rotate(this, -aim);
                    }
                    this.frictionAir = Math.min(0.1, Math.max(0.04, 1 + dot)) //0.08; //extra friction if turning
                }
                //accelerate in direction bullet is facing
                const dir = this.angle;
                this.force.x += thrust * Math.cos(dir);
                this.force.y += thrust * Math.sin(dir);
                
                if (tech.isHydrogenTrail && !(m.cycle % 7) && m.cycle > this.startCycle + 30) {
                    b.hydrogen(this.position, {x:0,y:0}, 27)
                }

                ctx.beginPath(); //draw rocket
                ctx.arc(this.position.x - Math.cos(this.angle) * (25 * size - 3) + (Math.random() - 0.5) * 4,
                    this.position.y - Math.sin(this.angle) * (25 * size - 3) + (Math.random() - 0.5) * 4,
                    11 * size, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(255,155,0,0.5)";
                ctx.fill();
            },
        });
        const thrust = 0.0066 * bullet[me].mass * (tech.isMissileBig ? (tech.isMissileBiggest ? 0.15 : 0.7) : 1);
        Matter.Body.setVelocity(bullet[me], {
            x: m.Vx / 2 + speed * Math.cos(angle),
            y: m.Vy / 2 + speed * Math.sin(angle)
        });
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    lastAngle: 0,
    wasExtruderOn: false,
    isExtruderOn: false,
    didExtruderDrain: false,
    canExtruderFire: true,
    extruder() {
        const DRAIN = 0.0012
        if (m.energy > DRAIN && b.canExtruderFire) {
            m.energy -= DRAIN
            if (m.energy < 0) {
                m.fieldCDcycle = m.cycle + 120;
                m.energy = 0;
            }
            b.isExtruderOn = true
            const SPEED = 8 + 12 * tech.isPlasmaRange
            const me = bullet.length;
            const where = Vector.add(m.pos, player.velocity)
            bullet[me] = Bodies.polygon(where.x + 20 * Math.cos(m.angle), where.y + 20 * Math.sin(m.angle), 4, 0.01, {
                cycle: -0.5,
                isWave: true,
                endCycle: simulation.cycle + 40, // + 30 * tech.isPlasmaRange,
                inertia: Infinity,
                frictionAir: 0,
                isInHole: true, //this keeps the bullet from entering wormholes
                minDmgSpeed: 0,
                dmg: m.dmgScale * 2.7, //damage also changes when you divide by mob.mass on in .do()
                classType: "bullet",
                isBranch: false,
                restitution: 0,
                collisionFilter: {
                    // category: 0,
                    // mask: 0, //cat.mob | cat.mobBullet | cat.mobShield
                    category: 0, //cat.bullet,
                    mask: 0, //cat.map, //cat.mob | cat.mobBullet | cat.mobShield
                },
                beforeDmg() {},
                onEnd() {},
                do() {
                    if (this.endCycle < simulation.cycle + 1) this.isWave = false
                    if (Matter.Query.point(map, this.position).length) { //check if inside map
                        this.isBranch = true;
                        this.do = () => { if (this.endCycle < simulation.cycle + 1) this.isWave = false }
                    } else { //check if inside a body
                        for (let i = 0, len = mob.length; i < len; i++) {
                            const dist = Vector.magnitudeSquared(Vector.sub(this.position, mob[i].position))
                            const radius = mob[i].radius + tech.extruderRange / 2
                            if (dist < radius * radius) {
                                if (mob[i].speed > 2) {
                                    if (mob[i].isBoss || mob[i].isShielded) {
                                        Matter.Body.setVelocity(mob[i], { x: mob[i].velocity.x * 0.95, y: mob[i].velocity.y * 0.95 });
                                    } else {
                                        Matter.Body.setVelocity(mob[i], { x: mob[i].velocity.x * 0.25, y: mob[i].velocity.y * 0.25 });
                                    }
                                }
                                // Matter.Body.setPosition(this, Vector.add(this.position, mob[i].velocity)) //move with the medium
                                let dmg = this.dmg / Math.min(10, mob[i].mass)
                                mob[i].damage(dmg);
                                if (mob[i].alive) mob[i].foundPlayer();
                            }
                        }
                    }
                    this.cycle++
                    const wiggleMag = (input.down ? 6 : 12) * Math.cos(simulation.cycle * 0.09)
                    const wiggle = Vector.mult(transverse, wiggleMag * Math.cos(this.cycle * 0.36)) //+ wiggleMag * Math.cos(simulation.cycle * 0.3))
                    const velocity = Vector.mult(player.velocity, 0.4) //move with player
                    Matter.Body.setPosition(this, Vector.add(velocity, Vector.add(this.position, wiggle)))
                }
            });
            Composite.add(engine.world, bullet[me]); //add bullet to world
            Matter.Body.setVelocity(bullet[me], {
                x: SPEED * Math.cos(m.angle),
                y: SPEED * Math.sin(m.angle)
            });
            const transverse = Vector.normalise(Vector.perp(bullet[me].velocity))
            if (180 - Math.abs(Math.abs(b.lastAngle - m.angle) - 180) > 0.13 || !b.wasExtruderOn) {
                bullet[me].isBranch = true; //don't draw stroke for this bullet
                bullet[me].do = function() { if (this.endCycle < simulation.cycle + 1) this.isWave = false }
            }
            b.lastAngle = m.angle //track last angle for the above angle difference calculation
        } else {
            b.canExtruderFire = false;
        }
    },
    plasma() {
        const DRAIN = 0.00075
        if (m.energy > DRAIN) {
            m.energy -= DRAIN;
            if (m.energy < 0) {
                m.fieldCDcycle = m.cycle + 120;
                m.energy = 0;
            }

            //calculate laser collision
            let best;
            let range = tech.isPlasmaRange * (120 + (input.down ? 400 : 300) * Math.sqrt(Math.random())) //+ 100 * Math.sin(m.cycle * 0.3);
            // const dir = m.angle // + 0.04 * (Math.random() - 0.5)
            const path = [{
                    x: m.pos.x + 20 * Math.cos(m.angle),
                    y: m.pos.y + 20 * Math.sin(m.angle)
                },
                {
                    x: m.pos.x + range * Math.cos(m.angle),
                    y: m.pos.y + range * Math.sin(m.angle)
                }
            ];
            const vertexCollision = function(v1, v1End, domain) {
                for (let i = 0; i < domain.length; ++i) {
                    let vertices = domain[i].vertices;
                    const len = vertices.length - 1;
                    for (let j = 0; j < len; j++) {
                        results = simulation.checkLineIntersection(v1, v1End, vertices[j], vertices[j + 1]);
                        if (results.onLine1 && results.onLine2) {
                            const dx = v1.x - results.x;
                            const dy = v1.y - results.y;
                            const dist2 = dx * dx + dy * dy;
                            if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
                                best = {
                                    x: results.x,
                                    y: results.y,
                                    dist2: dist2,
                                    who: domain[i],
                                    v1: vertices[j],
                                    v2: vertices[j + 1]
                                };
                            }
                        }
                    }
                    results = simulation.checkLineIntersection(v1, v1End, vertices[0], vertices[len]);
                    if (results.onLine1 && results.onLine2) {
                        const dx = v1.x - results.x;
                        const dy = v1.y - results.y;
                        const dist2 = dx * dx + dy * dy;
                        if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
                            best = {
                                x: results.x,
                                y: results.y,
                                dist2: dist2,
                                who: domain[i],
                                v1: vertices[0],
                                v2: vertices[len]
                            };
                        }
                    }
                }
            };

            //check for collisions
            best = {
                x: null,
                y: null,
                dist2: Infinity,
                who: null,
                v1: null,
                v2: null
            };
            vertexCollision(path[0], path[1], mob);
            vertexCollision(path[0], path[1], map);
            vertexCollision(path[0], path[1], body);
            if (best.dist2 != Infinity) { //if hitting something
                path[path.length - 1] = {
                    x: best.x,
                    y: best.y
                };
                if (best.who.alive) {
                    const dmg = 0.9 * m.dmgScale; //********** SCALE DAMAGE HERE *********************
                    best.who.damage(dmg);
                    best.who.locatePlayer();

                    //push mobs away
                    const force = Vector.mult(Vector.normalise(Vector.sub(m.pos, path[1])), -0.01 * Math.min(5, best.who.mass))
                    Matter.Body.applyForce(best.who, path[1], force)
                    if (best.who.speed > 4) {
                        Matter.Body.setVelocity(best.who, { //friction
                            x: best.who.velocity.x * 0.9,
                            y: best.who.velocity.y * 0.9
                        });
                    }
                    //draw mob damage circle
                    simulation.drawList.push({
                        x: path[1].x,
                        y: path[1].y,
                        radius: Math.sqrt(2000 * dmg * best.who.damageReduction),
                        color: "rgba(255,0,255,0.2)",
                        time: simulation.drawTime * 4
                    });
                } else if (!best.who.isStatic) {
                    //push blocks away
                    const force = Vector.mult(Vector.normalise(Vector.sub(m.pos, path[1])), -0.007 * Math.sqrt(Math.sqrt(best.who.mass)))
                    Matter.Body.applyForce(best.who, path[1], force)
                }
            }

            //draw blowtorch laser beam
            ctx.strokeStyle = "rgba(255,0,255,0.1)"
            ctx.lineWidth = 14
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            ctx.lineTo(path[1].x, path[1].y);
            ctx.stroke();
            ctx.strokeStyle = "#f0f";
            ctx.lineWidth = 2
            ctx.stroke();

            //draw electricity
            const Dx = Math.cos(m.angle);
            const Dy = Math.sin(m.angle);
            let x = m.pos.x + 20 * Dx;
            let y = m.pos.y + 20 * Dy;
            ctx.beginPath();
            ctx.moveTo(x, y);
            const step = Vector.magnitude(Vector.sub(path[0], path[1])) / 10
            for (let i = 0; i < 8; i++) {
                x += step * (Dx + 1.5 * (Math.random() - 0.5))
                y += step * (Dy + 1.5 * (Math.random() - 0.5))
                ctx.lineTo(x, y);
            }
            ctx.lineWidth = 2 * Math.random();
            ctx.stroke();
        }
    },
    laser(where = {
        x: m.pos.x + 20 * Math.cos(m.angle),
        y: m.pos.y + 20 * Math.sin(m.angle)
    }, whereEnd = {
        x: where.x + 3000 * Math.cos(m.angle),
        y: where.y + 3000 * Math.sin(m.angle)
    }, dmg = tech.laserDamage, reflections = tech.laserReflections, isThickBeam = false, push = 1) {
        const reflectivity = 1 - 1 / (reflections * 1.5)
        let damage = m.dmgScale * dmg
        let best = {
            x: 1,
            y: 1,
            dist2: Infinity,
            who: null,
            v1: 1,
            v2: 1
        };
        const path = [{
                x: where.x,
                y: where.y
            },
            {
                x: whereEnd.x,
                y: whereEnd.y
            }
        ];
        const vertexCollision = function(v1, v1End, domain) {
            for (let i = 0; i < domain.length; ++i) {
                let vertices = domain[i].vertices;
                const len = vertices.length - 1;
                for (let j = 0; j < len; j++) {
                    results = simulation.checkLineIntersection(v1, v1End, vertices[j], vertices[j + 1]);
                    if (results.onLine1 && results.onLine2) {
                        const dx = v1.x - results.x;
                        const dy = v1.y - results.y;
                        const dist2 = dx * dx + dy * dy;
                        if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
                            best = {
                                x: results.x,
                                y: results.y,
                                dist2: dist2,
                                who: domain[i],
                                v1: vertices[j],
                                v2: vertices[j + 1]
                            };
                        }
                    }
                }
                results = simulation.checkLineIntersection(v1, v1End, vertices[0], vertices[len]);
                if (results.onLine1 && results.onLine2) {
                    const dx = v1.x - results.x;
                    const dy = v1.y - results.y;
                    const dist2 = dx * dx + dy * dy;
                    if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
                        best = {
                            x: results.x,
                            y: results.y,
                            dist2: dist2,
                            who: domain[i],
                            v1: vertices[0],
                            v2: vertices[len]
                        };
                    }
                }
            }
        };

        const checkForCollisions = function() {
            best = {
                x: 1,
                y: 1,
                dist2: Infinity,
                who: null,
                v1: 1,
                v2: 1
            };
            vertexCollision(path[path.length - 2], path[path.length - 1], mob);
            vertexCollision(path[path.length - 2], path[path.length - 1], map);
            vertexCollision(path[path.length - 2], path[path.length - 1], body);
        };
        const laserHitMob = function() {
            if (best.who.alive) {
                best.who.damage(damage);
                best.who.locatePlayer();
                if (best.who.damageReduction) {
                    simulation.drawList.push({ //add dmg to draw queue
                        x: path[path.length - 1].x,
                        y: path[path.length - 1].y,
                        // radius: Math.sqrt(damage) * 100 * mob[k].damageReduction,
                        // radius: 600 * damage * best.who.damageReduction,
                        radius: Math.sqrt(2000 * damage * best.who.damageReduction) + 2,
                        color: tech.laserColorAlpha,
                        time: simulation.drawTime
                    });
                }
                if (tech.isLaserPush) { //push mobs away
                    const index = path.length - 1
                    Matter.Body.setVelocity(best.who, { x: best.who.velocity.x * 0.94, y: best.who.velocity.y * 0.94 });
                    const force = Vector.mult(Vector.normalise(Vector.sub(path[index], path[Math.max(0, index - 1)])), 0.006 * push * Math.min(6, best.who.mass))
                    Matter.Body.applyForce(best.who, path[index], force)
                }
            } else if (tech.isLaserPush && best.who.classType === "body") {
                const index = path.length - 1
                Matter.Body.setVelocity(best.who, { x: best.who.velocity.x * 0.94, y: best.who.velocity.y * 0.94 });
                const force = Vector.mult(Vector.normalise(Vector.sub(path[index], path[Math.max(0, index - 1)])), 0.006 * push * Math.min(6, best.who.mass))
                Matter.Body.applyForce(best.who, path[index], force)
            }
        };
        const reflection = function() { // https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
            const n = Vector.perp(Vector.normalise(Vector.sub(best.v1, best.v2)));
            const d = Vector.sub(path[path.length - 1], path[path.length - 2]);
            const nn = Vector.mult(n, 2 * Vector.dot(d, n));
            const r = Vector.normalise(Vector.sub(d, nn));
            path[path.length] = Vector.add(Vector.mult(r, 3000), path[path.length - 1]);
        };

        checkForCollisions();
        let lastBestOdd
        let lastBestEven = best.who //used in hack below
        if (best.dist2 !== Infinity) { //if hitting something
            path[path.length - 1] = {
                x: best.x,
                y: best.y
            };
            laserHitMob();
            for (let i = 0; i < reflections; i++) {
                reflection();
                checkForCollisions();
                if (best.dist2 !== Infinity) { //if hitting something
                    lastReflection = best

                    path[path.length - 1] = {
                        x: best.x,
                        y: best.y
                    };
                    damage *= reflectivity
                    laserHitMob();
                    //I'm not clear on how this works, but it gets rid of a bug where the laser reflects inside a block, often vertically.
                    //I think it checks to see if the laser is reflecting off a different part of the same block, if it is "inside" a block
                    if (i % 2) {
                        if (lastBestOdd === best.who) break
                    } else {
                        lastBestOdd = best.who
                        if (lastBestEven === best.who) break
                    }
                } else {
                    break
                }
            }
        }
        if (isThickBeam) {
            for (let i = 1, len = path.length; i < len; ++i) {
                ctx.moveTo(path[i - 1].x, path[i - 1].y);
                ctx.lineTo(path[i].x, path[i].y);
            }
        } else {
            ctx.strokeStyle = tech.laserColor;
            ctx.lineWidth = 2
            ctx.lineDashOffset = 900 * Math.random()
            ctx.setLineDash([50 + 120 * Math.random(), 50 * Math.random()]);
            for (let i = 1, len = path.length; i < len; ++i) {
                ctx.beginPath();
                ctx.moveTo(path[i - 1].x, path[i - 1].y);
                ctx.lineTo(path[i].x, path[i].y);
                ctx.stroke();
                ctx.globalAlpha *= reflectivity; //reflections are less intense
            }
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }
    },
    AoEStunEffect(where, range, cycles = 90 + 60 * Math.random()) {
        for (let i = 0, len = mob.length; i < len; ++i) {
            if (mob[i].alive && !mob[i].isShielded && !mob[i].shield && !mob[i].isBadTarget) {
                if (Vector.magnitude(Vector.sub(where, mob[i].position)) - mob[i].radius < range) mobs.statusStun(mob[i], cycles)
            }
        }
        simulation.drawList.push({
            x: where.x,
            y: where.y,
            radius: range,
            color: "rgba(0,0,0,0.1)",
            time: 15
        });
    },
    laserMine(position, velocity = { x: 0, y: -8 }) {
        const me = bullet.length;
        bullet[me] = Bodies.polygon(position.x, position.y, 3, 25, {
            bulletType: "laser mine",
            angle: m.angle,
            friction: 0,
            frictionAir: 0.025,
            restitution: 0.5,
            dmg: 0, // 0.14   //damage done in addition to the damage from momentum
            minDmgSpeed: 2,
            lookFrequency: 67 + Math.floor(7 * Math.random()),
            drain: 0.7 * tech.isLaserDiode * tech.laserFieldDrain,
            isDetonated: false,
            torqueMagnitude: 0.000003 * (Math.round(Math.random()) ? 1 : -1),
            range: 1500,
            endCycle: Infinity,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield
            },
            beforeDmg() {},
            onEnd() {},
            do() {
                if (!(simulation.cycle % this.lookFrequency) && m.energy > this.drain) { //find mob targets
                    for (let i = 0, len = mob.length; i < len; ++i) {
                        if (
                            Vector.magnitude(Vector.sub(this.position, mob[i].position)) < 1300 &&
                            !mob[i].isBadTarget &&
                            Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                            Matter.Query.ray(body, this.position, mob[i].position).length === 0
                        ) {
                            if (tech.isExplosionStun) b.AoEStunEffect(this.position, 1300);
                            this.do = this.laserSpin
                            if (this.angularSpeed < 0.5) this.torque += this.inertia * this.torqueMagnitude * 200 //spin
                            this.endCycle = simulation.cycle + 360 + 120
                            // if (this.angularSpeed < 0.01) this.torque += this.inertia * this.torqueMagnitude * 5 //spin
                            this.isDetonated = true
                            break
                        }
                    }
                }
            },
            reflections: Math.max(0, tech.laserReflections - 2),
            laserSpin() {
                //drain energy
                if (m.energy > this.drain) {
                    m.energy -= this.drain
                    if (this.angularSpeed < 0.05) this.torque += this.inertia * this.torqueMagnitude //spin

                    //fire lasers
                    ctx.strokeStyle = tech.laserColor;
                    ctx.lineWidth = 1.5
                    // ctx.globalAlpha = 1;
                    ctx.beginPath();
                    for (let i = 0; i < 3; i++) {
                        const where = this.vertices[i]
                        const endPoint = Vector.add(where, Vector.mult(Vector.normalise(Vector.sub(where, this.position)), 2500))
                        b.laser(where, endPoint, tech.laserDamage * 13, this.reflections, true)
                    }
                    ctx.stroke();
                    // ctx.globalAlpha = 1;
                }
                if (this.endCycle - 60 < simulation.cycle) {
                    this.do = () => {} //no nothing, no laser, no spin
                }
            },
        })
        Matter.Body.setVelocity(bullet[me], velocity);
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    mine(where, velocity, angle = 0) {
        const bIndex = bullet.length;
        bullet[bIndex] = Bodies.rectangle(where.x, where.y, 45, 16, {
            angle: angle,
            friction: 1,
            frictionStatic: 1,
            frictionAir: 0,
            restitution: 0,
            dmg: 0, //damage done in addition to the damage from momentum
            classType: "bullet",
            bulletType: "mine",
            collisionFilter: {
                category: cat.bullet,
                mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield //  | cat.bullet   //doesn't collide with other bullets until it lands  (was crashing into bots)
            },
            minDmgSpeed: 5,
            stillCount: 0,
            isArmed: false,
            endCycle: Infinity,
            lookFrequency: 0,
            range: 700,
            beforeDmg() {},
            onEnd() {
                if (this.isArmed) b.targetedNail(this.position, tech.isMineSentry ? 7 : 22, 40 + 10 * Math.random(), 1200, true, 2.2) //targetedNail(position, num = 1, speed = 40 + 10 * Math.random(), range = 1200, isRandomAim = true, damage = 1.4) {
            },
            do() {
                this.force.y += this.mass * 0.002; //extra gravity
                let collide = Matter.Query.collides(this, map) //check if collides with map
                if (collide.length > 0) {
                    for (let i = 0; i < collide.length; i++) {
                        if (collide[i].bodyA.collisionFilter.category === cat.map) { // || collide[i].bodyB.collisionFilter.category === cat.map) {
                            const angle = Vector.angle(collide[i].normal, { x: 1, y: 0 })
                            Matter.Body.setAngle(this, Math.atan2(collide[i].tangent.y, collide[i].tangent.x))
                            //move until touching map again after rotation
                            for (let j = 0; j < 10; j++) {
                                if (Matter.Query.collides(this, map).length > 0) { //touching map
                                    if (angle > -0.2 || angle < -1.5) { //don't stick to level ground
                                        Matter.Body.setVelocity(this, { x: 0, y: 0 });
                                        Matter.Body.setStatic(this, true) //don't set to static if not touching map
                                        this.collisionFilter.category = 0
                                        this.collisionFilter.mask = 0 //cat.map | cat.bullet
                                    } else {
                                        Matter.Body.setVelocity(this, { x: 0, y: 0 });
                                        Matter.Body.setAngularVelocity(this, 0)
                                    }
                                    this.arm();

                                    //sometimes the mine can't attach to map and it just needs to be reset
                                    const that = this
                                    setTimeout(function() {
                                        if (Matter.Query.collides(that, map).length === 0 || Matter.Query.point(map, that.position).length > 0) {
                                            that.endCycle = 0 // if not touching map explode
                                            that.isArmed = false
                                            b.mine(that.position, that.velocity, that.angle)
                                        }
                                    }, 100, that);
                                    break
                                }
                                //move until you are touching the wall
                                Matter.Body.setPosition(this, Vector.add(this.position, Vector.mult(collide[i].normal, 2)))
                            }
                            break
                        }
                    }
                } else {
                    if (this.speed < 1 && this.angularSpeed < 0.01) this.stillCount++
                }
                if (this.stillCount > 25) this.arm();
            },
            arm() {
                this.collisionFilter.mask = cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield | cat.bullet //can now collide with other bullets
                this.lookFrequency = simulation.cycle + 60
                this.do = function() { //overwrite the do method for this bullet
                    this.force.y += this.mass * 0.002; //extra gravity
                    if (simulation.cycle > this.lookFrequency) {
                        this.isArmed = true
                        this.lookFrequency = 55 + Math.floor(22 * Math.random())
                        simulation.drawList.push({
                            x: this.position.x,
                            y: this.position.y,
                            radius: 10,
                            color: "#f00",
                            time: 4
                        });
                        this.do = function() { //overwrite the do method for this bullet
                            this.force.y += this.mass * 0.002; //extra gravity
                            if (!(simulation.cycle % this.lookFrequency)) { //find mob targets
                                const random = 300 * Math.random()
                                for (let i = 0, len = mob.length; i < len; ++i) {
                                    if (
                                        !mob[i].isBadTarget &&
                                        Vector.magnitude(Vector.sub(this.position, mob[i].position)) < 700 + mob[i].radius + random &&
                                        Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                                        Matter.Query.ray(body, this.position, mob[i].position).length === 0
                                    ) {
                                        if (tech.isExplosionStun) b.AoEStunEffect(this.position, 700 + mob[i].radius + random);
                                        if (tech.isMineSentry) {
                                            this.lookFrequency = 8 + Math.floor(3 * Math.random())
                                            this.endCycle = simulation.cycle + 1020
                                            this.do = function() { //overwrite the do method for this bullet
                                                this.force.y += this.mass * 0.002; //extra gravity
                                                if (!(simulation.cycle % this.lookFrequency)) { //find mob targets
                                                    b.targetedNail(this.position, 1, 45 + 5 * Math.random(), 1100, false, 2.3) //targetedNail(position, num = 1, speed = 40 + 10 * Math.random(), range = 1200, isRandomAim = true, damage = 1.4) {
                                                    if (!(simulation.cycle % (this.lookFrequency * 6))) {
                                                        simulation.drawList.push({
                                                            x: this.position.x,
                                                            y: this.position.y,
                                                            radius: 8,
                                                            color: "#fe0",
                                                            time: 4
                                                        });
                                                    }
                                                }
                                            }
                                            break
                                        } else {
                                            this.endCycle = 0 //end life if mob is near and visible
                                            break
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });
        bullet[bIndex].torque += bullet[bIndex].inertia * 0.0002 * (0.5 - Math.random())
        Matter.Body.setVelocity(bullet[bIndex], velocity);
        Composite.add(engine.world, bullet[bIndex]); //add bullet to world
    },
    worm(where, isFreeze = tech.isSporeFreeze) { //used with the tech upgrade in mob.death()
        const bIndex = bullet.length;
        const wormSize = 6 + tech.wormSize * 6 * Math.random()
        if (bIndex < 500) { //can't make over 500 spores
            bullet[bIndex] = Bodies.polygon(where.x, where.y, 3, 3, {
                inertia: Infinity,
                isFreeze: isFreeze,
                restitution: 0.5,
                // angle: Math.random() * 2 * Math.PI,
                friction: 0,
                frictionAir: 0.025,
                thrust: (tech.isFastSpores ? 0.001 : 0.0005) * (1 + 0.5 * (Math.random() - 0.5)),
                wormSize: wormSize,
                wormTail: 1 + Math.max(4, Math.min(wormSize - 2 * tech.wormSize, 30)),
                dmg: (tech.isMutualism ? 7 : 2.9) * wormSize, //bonus damage from tech.isMutualism //2.5 is extra damage as worm
                lookFrequency: 100 + Math.floor(37 * Math.random()),
                classType: "bullet",
                collisionFilter: {
                    category: cat.bullet,
                    mask: cat.map | cat.mob | cat.mobBullet | cat.mobShield //no collide with body
                },
                endCycle: simulation.cycle + Math.floor((600 + Math.floor(Math.random() * 420)) * tech.isBulletsLastLonger),
                minDmgSpeed: 0,
                playerOffPosition: { //used when moving towards player to keep spores separate
                    x: 100 * (Math.random() - 0.5),
                    y: 100 * (Math.random() - 0.5)
                },
                beforeDmg(who) {
                    if (tech.isSpawnBulletsOnDeath && who.alive && who.isDropPowerUp) {
                        setTimeout(() => {
                            if (!who.alive) {
                                for (let i = 0; i < 3; i++) { //spawn 3 more
                                    b.worm(this.position)
                                    bullet[bullet.length - 1].endCycle = Math.min(simulation.cycle + Math.floor(420 * tech.isBulletsLastLonger), this.endCycle + 180 + Math.floor(60 * Math.random())) //simulation.cycle + Math.floor(420 * tech.isBulletsLastLonger)
                                }
                            }
                            this.endCycle = 0; //bullet ends cycle after doing damage 
                        }, 1);
                    } else {
                        this.endCycle = 0; //bullet ends cycle after doing damage 
                    }
                    if (this.isFreeze) mobs.statusSlow(who, 90)
                },
                onEnd() {
                    if (tech.isMutualism && this.isMutualismActive && !tech.isEnergyHealth) {
                        m.health += 0.01
                        if (m.health > m.maxHealth) m.health = m.maxHealth;
                        m.displayHealth();
                    }
                },
                tailCycle: 6.28 * Math.random(),
                do() {
                    this.tailCycle += this.speed * 0.025
                    ctx.beginPath(); //draw nematode
                    ctx.moveTo(this.position.x, this.position.y);
                    // const dir = Vector.mult(Vector.normalise(this.velocity), -Math.min(100, this.wormTail * this.speed))
                    const speed = Math.min(7, this.speed)
                    const dir = Vector.mult(Vector.normalise(this.velocity), -0.6 * this.wormTail * speed)
                    const tail = Vector.add(this.position, dir)
                    const wiggle = Vector.add(Vector.add(tail, dir), Vector.rotate(dir, Math.sin(this.tailCycle)))
                    // const wiggle = Vector.add(tail, Vector.rotate(dir, Math.sin((m.cycle - this.endCycle) * 0.03 * this.speed)))
                    ctx.quadraticCurveTo(tail.x, tail.y, wiggle.x, wiggle.y) // ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, this.vertices[0].x, this.vertices[0].y)
                    // ctx.lineTo(tail.x, tail.y);
                    ctx.lineWidth = this.wormSize;
                    ctx.strokeStyle = "#000";
                    ctx.stroke();


                    if (this.lockedOn && this.lockedOn.alive) {
                        this.force = Vector.mult(Vector.normalise(Vector.sub(this.lockedOn.position, this.position)), this.mass * this.thrust)
                    } else {
                        if (!(simulation.cycle % this.lookFrequency)) { //find mob targets
                            this.closestTarget = null;
                            this.lockedOn = null;
                            let closeDist = Infinity;
                            for (let i = 0, len = mob.length; i < len; ++i) {
                                if (!mob[i].isBadTarget && Matter.Query.ray(map, this.position, mob[i].position).length === 0) {
                                    const targetVector = Vector.sub(this.position, mob[i].position)
                                    const dist = Vector.magnitude(targetVector) * (Math.random() + 0.5);
                                    if (dist < closeDist) {
                                        this.closestTarget = mob[i].position;
                                        closeDist = dist;
                                        this.lockedOn = mob[i]
                                        if (0.3 > Math.random()) break //doesn't always target the closest mob
                                    }
                                }
                            }
                        }
                        if (tech.isSporeFollow && this.lockedOn === null) { //move towards player //checking for null means that the spores don't go after the player until it has looked and not found a target
                            const dx = this.position.x - m.pos.x;
                            const dy = this.position.y - m.pos.y;
                            if (dx * dx + dy * dy > 10000) {
                                this.force = Vector.mult(Vector.normalise(Vector.sub(m.pos, Vector.add(this.playerOffPosition, this.position))), this.mass * this.thrust)
                            }
                        } else {
                            const unit = Vector.normalise(this.velocity)
                            const force = Vector.mult(Vector.rotate(unit, 0.005 * this.playerOffPosition.x), 0.000003)
                            this.force.x += force.x
                            this.force.y += force.y
                        }
                    }
                },
            });
            const SPEED = 2 + 1 * Math.random();
            const ANGLE = 2 * Math.PI * Math.random()
            Matter.Body.setVelocity(bullet[bIndex], {
                x: SPEED * Math.cos(ANGLE),
                y: SPEED * Math.sin(ANGLE)
            });
            Composite.add(engine.world, bullet[bIndex]); //add bullet to world
            if (tech.isMutualism && m.health > 0.02) {
                m.health -= 0.01
                m.displayHealth();
                bullet[bIndex].isMutualismActive = true
            }
        }
    },
    spore(where, isFreeze = tech.isSporeFreeze) { //used with the tech upgrade in mob.death()
        const bIndex = bullet.length;
        const size = 4
        if (bIndex < 500) { //can't make over 500 spores
            bullet[bIndex] = Bodies.polygon(where.x, where.y, size, size, {
                // density: 0.0015,			//frictionAir: 0.01,
                inertia: Infinity,
                isFreeze: isFreeze,
                restitution: 0.5,
                angle: Math.random() * 2 * Math.PI,
                friction: 0,
                frictionAir: 0.025,
                thrust: (tech.isFastSpores ? 0.0009 : 0.00045) * (1 + 0.3 * (Math.random() - 0.5)),
                dmg: tech.isMutualism ? 16.8 : 7, //bonus damage from tech.isMutualism
                lookFrequency: 100 + Math.floor(117 * Math.random()),
                classType: "bullet",
                isSpore: true,
                collisionFilter: {
                    category: cat.bullet,
                    mask: cat.map | cat.mob | cat.mobBullet | cat.mobShield //no collide with body
                },
                endCycle: simulation.cycle + Math.floor((540 + Math.floor(Math.random() * 420)) * tech.isBulletsLastLonger),
                minDmgSpeed: 0,
                playerOffPosition: { //used when moving towards player to keep spores separate
                    x: 100 * (Math.random() - 0.5),
                    y: 100 * (Math.random() - 0.5)
                },
                beforeDmg(who) {
                    this.endCycle = 0; //bullet ends cycle after doing damage 
                    if (this.isFreeze) mobs.statusSlow(who, 90)
                },
                onEnd() {
                    if (tech.isMutualism && this.isMutualismActive && !tech.isEnergyHealth) {
                        m.health += 0.005
                        if (m.health > m.maxHealth) m.health = m.maxHealth;
                        m.displayHealth();
                    }
                },
                do() {
                    if (this.lockedOn && this.lockedOn.alive) {
                        this.force = Vector.mult(Vector.normalise(Vector.sub(this.lockedOn.position, this.position)), this.mass * this.thrust)
                    } else {
                        if (!(simulation.cycle % this.lookFrequency)) { //find mob targets
                            this.closestTarget = null;
                            this.lockedOn = null;
                            let closeDist = Infinity;
                            for (let i = 0, len = mob.length; i < len; ++i) {
                                if (!mob[i].isBadTarget && Matter.Query.ray(map, this.position, mob[i].position).length === 0) {
                                    const targetVector = Vector.sub(this.position, mob[i].position)
                                    const dist = Vector.magnitude(targetVector) * (Math.random() + 0.5);
                                    if (dist < closeDist) {
                                        this.closestTarget = mob[i].position;
                                        closeDist = dist;
                                        this.lockedOn = mob[i]
                                        if (0.3 > Math.random()) break //doesn't always target the closest mob
                                    }
                                }
                            }
                        }
                        if (tech.isSporeFollow && this.lockedOn === null) { //move towards player
                            //checking for null means that the spores don't go after the player until it has looked and not found a target
                            const dx = this.position.x - m.pos.x;
                            const dy = this.position.y - m.pos.y;
                            if (dx * dx + dy * dy > 10000) {
                                this.force = Vector.mult(Vector.normalise(Vector.sub(m.pos, Vector.add(this.playerOffPosition, this.position))), this.mass * this.thrust)
                            }
                        } else {
                            this.force.y += this.mass * 0.0001; //gravity
                        }

                    }

                    // if (!this.lockedOn && !(simulation.cycle % this.lookFrequency)) { //find mob targets
                    //   this.closestTarget = null;
                    //   this.lockedOn = null;
                    //   let closeDist = Infinity;
                    //   for (let i = 0, len = mob.length; i < len; ++i) {
                    //     if (mob[i].isDropPowerUp && Matter.Query.ray(map, this.position, mob[i].position).length === 0) {
                    //       // Matter.Query.ray(body, this.position, mob[i].position).length === 0
                    //       const targetVector = Vector.sub(this.position, mob[i].position)
                    //       const dist = Vector.magnitude(targetVector);
                    //       if (dist < closeDist) {
                    //         this.closestTarget = mob[i].position;
                    //         closeDist = dist;
                    //         this.lockedOn = mob[i] //Vector.normalise(targetVector);
                    //         if (0.3 > Math.random()) break //doesn't always target the closest mob
                    //       }
                    //     }
                    //   }
                    // }
                    // if (this.lockedOn && this.lockedOn.alive) { //accelerate towards mobs
                    //   this.force = Vector.mult(Vector.normalise(Vector.sub(this.lockedOn.position, this.position)), this.mass * this.thrust)
                    // } else if (tech.isSporeFollow && this.lockedOn !== undefined) { //move towards player
                    //   //checking for undefined means that the spores don't go after the player until it has looked and not found a target
                    //   const dx = this.position.x - m.pos.x;
                    //   const dy = this.position.y - m.pos.y;
                    //   if (dx * dx + dy * dy > 10000) {
                    //     this.force = Vector.mult(Vector.normalise(Vector.sub(m.pos, Vector.add(this.playerOffPosition, this.position))), this.mass * this.thrust)
                    //   }
                    //   // this.force = Vector.mult(Vector.normalise(Vector.sub(m.pos, this.position)), this.mass * this.thrust)
                    // } else {
                    //   this.force.y += this.mass * 0.0001; //gravity
                    // }

                },
            });

            const SPEED = 4 + 8 * Math.random();
            const ANGLE = 2 * Math.PI * Math.random()
            Matter.Body.setVelocity(bullet[bIndex], {
                x: SPEED * Math.cos(ANGLE),
                y: SPEED * Math.sin(ANGLE)
            });
            Composite.add(engine.world, bullet[bIndex]); //add bullet to world

            if (tech.isMutualism && m.health > 0.01) {
                m.health -= 0.005
                m.displayHealth();
                bullet[bIndex].isMutualismActive = true
            }
        }
    },
    iceIX(speed = 0, dir = m.angle + Math.PI * 2 * Math.random(), where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }) {
        const me = bullet.length;
        const THRUST = 0.0009
        const RADIUS = 18
        const SCALE = 1 - 0.08 / tech.isBulletsLastLonger
        bullet[me] = Bodies.polygon(where.x, where.y, 3, RADIUS, {
            angle: dir - Math.PI,
            inertia: Infinity,
            friction: 0,
            frictionAir: 0.023,
            restitution: 0.9,
            dmg: 1, //damage done in addition to the damage from momentum
            lookFrequency: 14 + Math.floor(8 * Math.random()),
            endCycle: simulation.cycle + 100 * tech.isBulletsLastLonger + Math.floor(25 * Math.random()),
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield //self collide
            },
            minDmgSpeed: 0,
            lockedOn: null,
            beforeDmg(who) {
                mobs.statusSlow(who, 180)
                this.endCycle = simulation.cycle
                // if (tech.isHeavyWater) mobs.statusDoT(who, 0.15, 300)
                if (tech.iceEnergy && !who.shield && !who.isShielded && who.isDropPowerUp && who.alive && m.immuneCycle < m.cycle) {
                    setTimeout(() => { if (!who.alive) m.energy += tech.iceEnergy * 0.8 }, 10);
                }
            },
            onEnd() {},
            do() {
                // this.force.y += this.mass * 0.0002;
                //find mob targets
                if (!(simulation.cycle % this.lookFrequency)) {
                    Matter.Body.scale(this, SCALE, SCALE);
                    this.lockedOn = null;
                    let closeDist = Infinity;
                    for (let i = 0, len = mob.length; i < len; ++i) {
                        if (
                            !mob[i].isBadTarget &&
                            Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                            Matter.Query.ray(body, this.position, mob[i].position).length === 0
                        ) {
                            const TARGET_VECTOR = Vector.sub(this.position, mob[i].position)
                            const DIST = Vector.magnitude(TARGET_VECTOR);
                            if (DIST < closeDist) {
                                closeDist = DIST;
                                this.lockedOn = mob[i]
                            }
                        }
                    }
                }
                if (this.lockedOn) { //accelerate towards mobs
                    this.force = Vector.mult(Vector.normalise(Vector.sub(this.position, this.lockedOn.position)), -this.mass * THRUST)
                } else {
                    this.force = Vector.mult(Vector.normalise(this.velocity), this.mass * THRUST)
                }
            }
        })

        Composite.add(engine.world, bullet[me]); //add bullet to world
        // Matter.Body.setAngularVelocity(bullet[me], 2 * (0.5 - Math.random()))  //doesn't work due to high friction
        Matter.Body.setVelocity(bullet[me], {
            x: speed * Math.cos(dir),
            y: speed * Math.sin(dir)
        });
        // Matter.Body.setVelocity(bullet[me], {
        //   x: m.Vx / 2 + speed * Math.cos(dir),
        //   y: m.Vy / 2 + speed * Math.sin(dir)
        // });
    },
    drone(where = { x: m.pos.x + 30 * Math.cos(m.angle) + 20 * (Math.random() - 0.5), y: m.pos.y + 30 * Math.sin(m.angle) + 20 * (Math.random() - 0.5) }, speed = 1) {
        const me = bullet.length;
        const THRUST = 0.0015
        // const FRICTION = tech.isFastDrones ? 0.008 : 0.0005
        const dir = m.angle + 0.4 * (Math.random() - 0.5);
        const RADIUS = (4.5 + 3 * Math.random())
        bullet[me] = Bodies.polygon(where.x, where.y, 8, RADIUS, {
            angle: dir,
            inertia: Infinity,
            friction: 0.05,
            frictionAir: 0,
            restitution: 1,
            density: 0.0005, //  0.001 is normal density
            //total 0.24 + 0.3 average
            dmg: 0.34 + 0.12 * tech.isDroneTeleport + 0.15 * tech.isDroneFastLook, //damage done in addition to the damage from momentum
            lookFrequency: (tech.isDroneFastLook ? 20 : 70) + Math.floor(17 * Math.random()),
            endCycle: simulation.cycle + Math.floor((950 + 400 * Math.random()) * tech.isBulletsLastLonger * tech.droneCycleReduction) + 5 * RADIUS + Math.max(0, 150 - bullet.length),
            classType: "bullet",
            isDrone: true,
            collisionFilter: {
                category: cat.bullet,
                mask: cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield //self collide
            },
            minDmgSpeed: 0,
            lockedOn: null,
            deathCycles: 110 + RADIUS * 5,
            isImproved: false,
            beforeDmg(who) {
                if (tech.isIncendiary && simulation.cycle + this.deathCycles < this.endCycle && !tech.isForeverDrones) {
                    const max = Math.max(Math.min(this.endCycle - simulation.cycle - this.deathCycles, 1500), 0)
                    b.explosion(this.position, max * 0.1 + this.isImproved * 110 + 60 * Math.random()); //makes bullet do explosive damage at end
                    if (tech.isForeverDrones) {
                        this.endCycle = 0
                        b.drone({ x: m.pos.x + 30 * (Math.random() - 0.5), y: m.pos.y + 30 * (Math.random() - 0.5) }, 5)
                        bullet[bullet.length - 1].endCycle = Infinity
                    } else {
                        this.endCycle -= max
                    }
                } else {
                    //move away from target after hitting
                    const unit = Vector.mult(Vector.normalise(Vector.sub(this.position, who.position)), -20)
                    Matter.Body.setVelocity(this, {
                        x: unit.x,
                        y: unit.y
                    });
                    this.lockedOn = null
                    if (this.endCycle > simulation.cycle + this.deathCycles) {
                        this.endCycle -= 60
                        if (simulation.cycle + this.deathCycles > this.endCycle) this.endCycle = simulation.cycle + this.deathCycles
                    }
                }
            },
            onEnd() {
                if (tech.isDroneRespawn && b.inventory.length) {
                    const who = b.guns[b.activeGun]
                    if (who.name === "drones" && who.ammo > 0 && mob.length) {
                        b.drone({ x: this.position.x, y: this.position.y }, 0)
                        if (Math.random() < 0.2) {
                            b.guns[b.activeGun].ammo--;
                            simulation.updateGunHUD();
                        }
                    }
                }
            },
            do() {
                if (simulation.cycle + this.deathCycles > this.endCycle) { //fall shrink and die
                    this.force.y += this.mass * 0.0012;
                    this.restitution = 0.2;
                    const scale = 0.995;
                    Matter.Body.scale(this, scale, scale);
                } else {
                    this.force.y += this.mass * 0.0002;

                    if (!(simulation.cycle % this.lookFrequency)) {
                        //find mob targets
                        this.lockedOn = null;
                        let closeDist = Infinity;
                        for (let i = 0, len = mob.length; i < len; ++i) {
                            if (
                                !mob[i].isBadTarget &&
                                Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                                Matter.Query.ray(body, this.position, mob[i].position).length === 0
                            ) {
                                const TARGET_VECTOR = Vector.sub(this.position, mob[i].position)
                                const DIST = Vector.magnitude(TARGET_VECTOR);
                                if (DIST < closeDist) {
                                    closeDist = DIST;
                                    this.lockedOn = mob[i]
                                }
                            }
                        }
                        //blink towards mobs
                        if (tech.isDroneTeleport && this.lockedOn) {
                            const sub = Vector.sub(this.lockedOn.position, this.position);
                            const distMag = Vector.magnitude(sub);
                            const unit = Vector.normalise(sub)
                            Matter.Body.setVelocity(this, Vector.mult(unit, Math.max(20, this.speed * 1.5)));
                            ctx.beginPath();
                            ctx.moveTo(this.position.x, this.position.y);
                            Matter.Body.translate(this, Vector.mult(unit, Math.min(350, distMag - this.lockedOn.radius + 10)));
                            ctx.lineTo(this.position.x, this.position.y);
                            ctx.lineWidth = RADIUS * 2;
                            ctx.strokeStyle = "rgba(0,0,0,0.5)";
                            ctx.stroke();
                        }
                        //power ups
                        if (!this.isImproved && !simulation.isChoosing && !tech.isExtraMaxEnergy) {
                            if (this.lockedOn) {
                                for (let i = 0, len = powerUp.length; i < len; ++i) { //grab, but don't lock onto nearby power up
                                    if (
                                        Vector.magnitudeSquared(Vector.sub(this.position, powerUp[i].position)) < 20000 &&
                                        (powerUp[i].name !== "heal" || m.health < 0.94 * m.maxHealth || tech.isDroneGrab) &&
                                        (powerUp[i].name !== "field" || !tech.isSuperDeterminism)
                                        // &&(b.inventory.length > 1 || powerUp[i].name !== "ammo" || b.guns[b.activeGun].ammo !== Infinity || tech.isDroneGrab)
                                    ) {
                                        //draw pickup for a single cycle
                                        ctx.beginPath();
                                        ctx.moveTo(this.position.x, this.position.y);
                                        ctx.lineTo(powerUp[i].position.x, powerUp[i].position.y);
                                        ctx.strokeStyle = "#000"
                                        ctx.lineWidth = 4
                                        ctx.stroke();
                                        //pick up nearby power ups
                                        powerUps.onPickUp(powerUp[i]);
                                        powerUp[i].effect();
                                        Matter.Composite.remove(engine.world, powerUp[i]);
                                        powerUp.splice(i, 1);
                                        if (tech.isDroneGrab) {
                                            this.isImproved = true;
                                            const SCALE = 2.25
                                            Matter.Body.scale(this, SCALE, SCALE);
                                            this.lookFrequency = 30 + Math.floor(11 * Math.random());
                                            this.endCycle += 3000 * tech.droneCycleReduction * tech.isBulletsLastLonger
                                        }
                                        break;
                                    }
                                }
                            } else {
                                //look for power ups to lock onto
                                let closeDist = Infinity;
                                for (let i = 0, len = powerUp.length; i < len; ++i) {
                                    if (
                                        (powerUp[i].name !== "heal" || m.health < 0.94 * m.maxHealth || tech.isDroneGrab) &&
                                        (powerUp[i].name !== "field" || !tech.isSuperDeterminism)
                                        // &&(b.inventory.length > 1 || powerUp[i].name !== "ammo" || b.guns[b.activeGun].ammo !== Infinity || tech.isDroneGrab)
                                    ) {
                                        if (Vector.magnitudeSquared(Vector.sub(this.position, powerUp[i].position)) < 20000 && !simulation.isChoosing) {
                                            //draw pickup for a single cycle
                                            ctx.beginPath();
                                            ctx.moveTo(this.position.x, this.position.y);
                                            ctx.lineTo(powerUp[i].position.x, powerUp[i].position.y);
                                            ctx.strokeStyle = "#000"
                                            ctx.lineWidth = 4
                                            ctx.stroke();
                                            //pick up nearby power ups
                                            powerUps.onPickUp(powerUp[i]);
                                            powerUp[i].effect();
                                            Matter.Composite.remove(engine.world, powerUp[i]);
                                            powerUp.splice(i, 1);
                                            if (tech.isDroneGrab) {
                                                this.isImproved = true;
                                                const SCALE = 2.25
                                                Matter.Body.scale(this, SCALE, SCALE);
                                                this.lookFrequency = 30 + Math.floor(11 * Math.random());
                                                this.endCycle += 3000 * tech.droneCycleReduction * tech.isBulletsLastLonger
                                                // this.frictionAir = 0
                                            }
                                            break;
                                        }
                                        //look for power ups to lock onto
                                        if (
                                            Matter.Query.ray(map, this.position, powerUp[i].position).length === 0 &&
                                            Matter.Query.ray(body, this.position, powerUp[i].position).length === 0
                                        ) {
                                            const TARGET_VECTOR = Vector.sub(this.position, powerUp[i].position)
                                            const DIST = Vector.magnitude(TARGET_VECTOR);
                                            if (DIST < closeDist) {
                                                closeDist = DIST;
                                                this.lockedOn = powerUp[i]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (this.lockedOn) { //accelerate towards mobs
                        this.force = Vector.mult(Vector.normalise(Vector.sub(this.position, this.lockedOn.position)), -this.mass * THRUST)
                    } else { //accelerate towards mouse
                        this.force = Vector.mult(Vector.normalise(Vector.sub(this.position, simulation.mouseInGame)), -this.mass * THRUST)
                    }
                    // speed cap instead of friction to give more agility
                    if (this.speed > 6) {
                        Matter.Body.setVelocity(this, {
                            x: this.velocity.x * 0.97,
                            y: this.velocity.y * 0.97
                        });
                    }
                }
            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world
        Matter.Body.setVelocity(bullet[me], {
            x: speed * Math.cos(dir),
            y: speed * Math.sin(dir)
        });
    },
    droneRadioactive(where = { x: m.pos.x + 30 * Math.cos(m.angle) + 20 * (Math.random() - 0.5), y: m.pos.y + 30 * Math.sin(m.angle) + 20 * (Math.random() - 0.5) }, speed = 1) {
        const me = bullet.length;
        const THRUST = (tech.isFastDrones ? 0.003 : 0.0012) + 0.0005 * (Math.random() - 0.5)
        const dir = m.angle + 0.4 * (Math.random() - 0.5);
        const RADIUS = 3
        bullet[me] = Bodies.polygon(where.x, where.y, 8, RADIUS, {
            angle: dir,
            inertia: Infinity,
            friction: 0,
            frictionAir: 0,
            restitution: 0.4 + 0.199 * Math.random(),
            dmg: 0, //0.24   damage done in addition to the damage from momentum   and radiation
            lookFrequency: 120 + Math.floor(23 * Math.random()),
            endCycle: simulation.cycle + Math.floor((900 + 110 * Math.random()) * tech.isBulletsLastLonger / tech.droneRadioDamage) + 5 * RADIUS + Math.max(0, 150 - 2 * bullet.length),
            classType: "bullet",
            isDrone: true,
            collisionFilter: {
                category: cat.bullet,
                mask: cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield //self collide
            },
            minDmgSpeed: 0,
            speedCap: 5 + 2 * Math.random(), //6 is normal
            lockedOn: null,
            deathCycles: 110 + RADIUS * 5,
            isImproved: false,
            radioRadius: 0,
            maxRadioRadius: 300 + Math.floor(100 * Math.random()),
            beforeDmg() {
                // const unit = Vector.mult(Vector.normalise(Vector.sub(this.position, who.position)), -20) //move away from target after hitting
                // Matter.Body.setVelocity(this, {
                //     x: unit.x,
                //     y: unit.y
                // });
                // this.lockedOn = null

                // if (this.endCycle > simulation.cycle + this.deathCycles) {
                // this.endCycle -= 60
                // if (simulation.cycle + this.deathCycles > this.endCycle) this.endCycle = simulation.cycle + this.deathCycles
                // }
            },
            onEnd() {
                if (tech.isDroneRespawn && b.inventory.length) {
                    const who = b.guns[b.activeGun]
                    if (who.name === "drones" && who.ammo > 0 && mob.length) {
                        b.droneRadioactive({ x: this.position.x, y: this.position.y }, 0)
                        if (Math.random() < 0.2) {
                            b.guns[b.activeGun].ammo--;
                            simulation.updateGunHUD();
                        }
                    }
                }
            },
            do() {
                //radioactive zone
                this.radioRadius = this.radioRadius * 0.993 + 0.007 * this.maxRadioRadius //smooth radius towards max
                //aoe damage to player
                if (Vector.magnitude(Vector.sub(player.position, this.position)) < this.radioRadius) {
                    const DRAIN = tech.isRadioactiveResistance ? 0.002 * 0.25 : 0.002
                    if (m.energy > DRAIN) {
                        if (m.immuneCycle < m.cycle) m.energy -= DRAIN
                    } else {
                        m.energy = 0;
                        if (simulation.dmgScale) m.damage(tech.isRadioactiveResistance ? 0.00015 * 0.25 : 0.00015) //0.00015
                    }
                }
                //aoe damage to mobs
                for (let i = 0, len = mob.length; i < len; i++) {
                    if (Vector.magnitude(Vector.sub(mob[i].position, this.position)) < this.radioRadius + mob[i].radius) {
                        let dmg = (0.12 + 0.04 * tech.isFastDrones) * m.dmgScale * tech.droneRadioDamage //neutron bombs  dmg = 0.09
                        if (Matter.Query.ray(map, mob[i].position, this.position).length > 0) dmg *= 0.25 //reduce damage if a wall is in the way
                        if (mob[i].shield) dmg *= 3 // to make up for the /5 that shields normally take
                        mob[i].damage(dmg);
                        mob[i].locatePlayer();
                    }
                }
                //draw
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radioRadius, 0, 2 * Math.PI);
                ctx.globalCompositeOperation = "lighter"
                // ctx.fillStyle = `rgba(25,139,170,${0.15+0.05*Math.random()})`;
                // ctx.fillStyle = `rgba(36, 207, 255,${0.1+0.05*Math.random()})`;
                ctx.fillStyle = `rgba(28, 175, 217,${0.13+0.07*Math.random()})`;
                ctx.fill();
                ctx.globalCompositeOperation = "source-over"

                //normal drone actions
                if (simulation.cycle + this.deathCycles > this.endCycle) { //fall shrink and die
                    this.force.y += this.mass * 0.0012;
                    this.restitution = 0.2;
                    const scale = 0.995;
                    Matter.Body.scale(this, scale, scale);
                    this.maxRadioRadius = 0
                    this.radioRadius = this.radioRadius * 0.98 //let radioactivity decrease
                } else {
                    this.force.y += this.mass * 0.0002; //gravity

                    if (!(simulation.cycle % this.lookFrequency)) {
                        //find mob targets
                        this.lockedOn = null;
                        let closeDist = Infinity;
                        for (let i = 0, len = mob.length; i < len; ++i) {
                            if (
                                !mob[i].isBadTarget &&
                                Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                                Matter.Query.ray(body, this.position, mob[i].position).length === 0
                            ) {
                                const TARGET_VECTOR = Vector.sub(this.position, mob[i].position)
                                const DIST = Vector.magnitude(TARGET_VECTOR);
                                if (DIST < closeDist) {
                                    closeDist = DIST;
                                    this.lockedOn = mob[i]
                                }
                            }
                        }
                        //power ups
                        if (!this.isImproved && !simulation.isChoosing && !tech.isExtraMaxEnergy) {
                            if (this.lockedOn) {
                                //grab, but don't lock onto nearby power up
                                for (let i = 0, len = powerUp.length; i < len; ++i) {
                                    if (
                                        Vector.magnitudeSquared(Vector.sub(this.position, powerUp[i].position)) < 20000 &&
                                        (powerUp[i].name !== "heal" || m.health < 0.94 * m.maxHealth || tech.isDroneGrab) &&
                                        (powerUp[i].name !== "field" || !tech.isSuperDeterminism)
                                        // &&(powerUp[i].name !== "ammo" || b.guns[b.activeGun].ammo !== Infinity || tech.isDroneGrab)
                                    ) {
                                        //draw pickup for a single cycle
                                        ctx.beginPath();
                                        ctx.moveTo(this.position.x, this.position.y);
                                        ctx.lineTo(powerUp[i].position.x, powerUp[i].position.y);
                                        ctx.strokeStyle = "#000"
                                        ctx.lineWidth = 4
                                        ctx.stroke();
                                        //pick up nearby power ups
                                        powerUps.onPickUp(powerUp[i]);
                                        powerUp[i].effect();
                                        Matter.Composite.remove(engine.world, powerUp[i]);
                                        powerUp.splice(i, 1);
                                        if (tech.isDroneGrab) {
                                            this.isImproved = true;
                                            const SCALE = 2.25
                                            Matter.Body.scale(this, SCALE, SCALE);
                                            this.lookFrequency = 30 + Math.floor(11 * Math.random());
                                            this.endCycle += 1000 * tech.isBulletsLastLonger
                                            this.maxRadioRadius *= 1.25
                                        }
                                        break;
                                    }
                                }
                            } else {
                                //look for power ups to lock onto
                                let closeDist = Infinity;
                                for (let i = 0, len = powerUp.length; i < len; ++i) {
                                    if (
                                        (powerUp[i].name !== "heal" || m.health < 0.94 * m.maxHealth || tech.isDroneGrab) &&
                                        (powerUp[i].name !== "field" || !tech.isSuperDeterminism)
                                        // &&(powerUp[i].name !== "ammo" || b.guns[b.activeGun].ammo !== Infinity || tech.isDroneGrab)
                                    ) {
                                        if (Vector.magnitudeSquared(Vector.sub(this.position, powerUp[i].position)) < 20000 && !simulation.isChoosing) {
                                            //draw pickup for a single cycle
                                            ctx.beginPath();
                                            ctx.moveTo(this.position.x, this.position.y);
                                            ctx.lineTo(powerUp[i].position.x, powerUp[i].position.y);
                                            ctx.strokeStyle = "#000"
                                            ctx.lineWidth = 4
                                            ctx.stroke();
                                            //pick up nearby power ups
                                            powerUps.onPickUp(powerUp[i]);
                                            powerUp[i].effect();
                                            Matter.Composite.remove(engine.world, powerUp[i]);
                                            powerUp.splice(i, 1);
                                            if (tech.isDroneGrab) {
                                                this.isImproved = true;
                                                const SCALE = 2.25
                                                Matter.Body.scale(this, SCALE, SCALE);
                                                this.lookFrequency = 30 + Math.floor(11 * Math.random());
                                                this.endCycle += 1000 * tech.isBulletsLastLonger
                                                this.maxRadioRadius *= 1.25
                                            }
                                            break;
                                        }
                                        //look for power ups to lock onto
                                        if (
                                            Matter.Query.ray(map, this.position, powerUp[i].position).length === 0 &&
                                            Matter.Query.ray(body, this.position, powerUp[i].position).length === 0
                                        ) {
                                            const TARGET_VECTOR = Vector.sub(this.position, powerUp[i].position)
                                            const DIST = Vector.magnitude(TARGET_VECTOR);
                                            if (DIST < closeDist) {
                                                closeDist = DIST;
                                                this.lockedOn = powerUp[i]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (this.lockedOn) { //accelerate towards mobs
                        this.force = Vector.mult(Vector.normalise(Vector.sub(this.position, this.lockedOn.position)), -this.mass * THRUST)
                    } else { //accelerate towards mouse
                        this.force = Vector.mult(Vector.normalise(Vector.sub(this.position, simulation.mouseInGame)), -this.mass * THRUST)
                    }
                    // speed cap instead of friction to give more agility
                    if (this.speed > this.speedCap) {
                        Matter.Body.setVelocity(this, {
                            x: this.velocity.x * 0.97,
                            y: this.velocity.y * 0.97
                        });
                    }
                }
            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world
        Matter.Body.setVelocity(bullet[me], {
            x: speed * Math.cos(dir),
            y: speed * Math.sin(dir)
        });
    },
    // plasmaBall(position, velocity, radius) {
    //     // radius *= Math.sqrt(tech.bulletSize)
    //     const me = bullet.length;
    //     bullet[me] = Bodies.polygon(position.x, position.y, 20, radius, {
    //         density: 0.000001, //  0.001 is normal density
    //         inertia: Infinity,
    //         frictionAir: 0.003,
    //         dmg: 0, //damage on impact
    //         damage: 0, //damage done over time
    //         scale: 1 - 0.006 / tech.isBulletsLastLonger,
    //         classType: "bullet",
    //         collisionFilter: {
    //             category: cat.bullet,
    //             mask: 0 //cat.mob | cat.mobBullet // cat.map | cat.body | cat.mob | cat.mobShield
    //         },
    //         minDmgSpeed: 0,
    //         endCycle: Infinity,
    //         count: 0,
    //         radius: radius,
    //         portFrequency: 5 + Math.floor(5 * Math.random()),
    //         nextPortCycle: Infinity, //disabled unless you have the teleport tech
    //         beforeDmg(who) {
    //             if (!this.target && who.alive) {
    //                 this.target = who;
    //                 if (who.radius < 20) {
    //                     this.targetRelativePosition = {
    //                         x: 0,
    //                         y: 0
    //                     } //find relative position vector for zero mob rotation
    //                 } else if (Matter.Query.collides(this, [who]).length > 0) {
    //                     const normal = Matter.Query.collides(this, [who])[0].normal
    //                     this.targetRelativePosition = Vector.rotate(Vector.sub(Vector.sub(this.position, who.position), Vector.mult(normal, -this.radius)), -who.angle) //find relative position vector for zero mob rotation
    //                 } else {
    //                     this.targetRelativePosition = Vector.rotate(Vector.sub(this.position, who.position), -who.angle) //find relative position vector for zero mob rotation
    //                 }
    //                 this.collisionFilter.category = cat.body;
    //                 this.collisionFilter.mask = null;

    //                 let bestVertexDistance = Infinity
    //                 let bestVertex = null
    //                 for (let i = 0; i < this.target.vertices.length; i++) {
    //                     const dist = Vector.magnitude(Vector.sub(this.position, this.target.vertices[i]));
    //                     if (dist < bestVertexDistance) {
    //                         bestVertex = i
    //                         bestVertexDistance = dist
    //                     }
    //                 }
    //                 this.targetVertex = bestVertex
    //             }
    //         },
    //         onEnd() {},
    //         do() {
    //             if (this.count < 20) {
    //                 this.count++
    //                 //grow
    //                 const SCALE = 1.06
    //                 Matter.Body.scale(this, SCALE, SCALE);
    //                 this.radius *= SCALE;
    //             } else {
    //                 //shrink
    //                 Matter.Body.scale(this, this.scale, this.scale);
    //                 this.radius *= this.scale;
    //                 if (this.radius < 8) this.endCycle = 0;
    //             }
    //             if (this.target && this.target.alive) { //if stuck to a target
    //                 const rotate = Vector.rotate(this.targetRelativePosition, this.target.angle) //add in the mob's new angle to the relative position vector
    //                 if (this.target.isVerticesChange) {
    //                     Matter.Body.setPosition(this, this.target.vertices[this.targetVertex])
    //                 } else {
    //                     Matter.Body.setPosition(this, Vector.add(Vector.add(rotate, this.target.velocity), this.target.position))
    //                 }
    //                 if (this.target.isBoss) {
    //                     if (this.target.speed > 8) Matter.Body.setVelocity(this.target, Vector.mult(this.target.velocity, 0.98))
    //                 } else {
    //                     if (this.target.speed > 4) Matter.Body.setVelocity(this.target, Vector.mult(this.target.velocity, 0.95))
    //                 }

    //                 Matter.Body.setAngularVelocity(this.target, this.target.angularVelocity * 0.9);
    //                 // Matter.Body.setAngularVelocity(this.target, this.target.angularVelocity * 0.9)
    //                 if (this.target.isShielded) {
    //                     this.target.damage(m.dmgScale * this.damage, true); //shield damage bypass
    //                     const SCALE = 1 - 0.004 / tech.isBulletsLastLonger //shrink if mob is shielded
    //                     Matter.Body.scale(this, SCALE, SCALE);
    //                     this.radius *= SCALE;
    //                 } else {
    //                     this.target.damage(m.dmgScale * this.damage);
    //                 }
    //             } else if (this.target !== null) { //look for a new target
    //                 this.collisionFilter.category = cat.bullet;
    //                 this.collisionFilter.mask = cat.mob //| cat.mobShield //cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield
    //                 if (tech.isSpawnBulletsOnDeath && bullet.length < 180 && !this.target.isMobBullet) {
    //                     let targets = []
    //                     for (let i = 0, len = mob.length; i < len; i++) {
    //                         const dist = Vector.magnitudeSquared(Vector.sub(this.position, mob[i].position));
    //                         if (dist < 1000000) targets.push(mob[i])
    //                     }
    //                     const radius = Math.min(this.radius * 0.5, 9)
    //                     const len = bullet.length < 80 ? 2 : 1
    //                     for (let i = 0; i < len; i++) {
    //                         if (targets.length - i > 0) {
    //                             const index = Math.floor(Math.random() * targets.length)
    //                             const speed = 6 + 6 * Math.random()
    //                             const velocity = Vector.mult(Vector.normalise(Vector.sub(targets[index].position, this.position)), speed)
    //                             b.foam(this.position, Vector.rotate(velocity, 0.5 * (Math.random() - 0.5)), radius)
    //                         } else {
    //                             b.foam(this.position, Vector.rotate({
    //                                 x: 15 + 10 * Math.random(),
    //                                 y: 0
    //                             }, 2 * Math.PI * Math.random()), radius)
    //                         }
    //                     }
    //                 }
    //                 this.target = null
    //             } else if (Matter.Query.point(map, this.position).length > 0) { //slow when touching map or blocks
    //                 const slow = 0.85
    //                 Matter.Body.setVelocity(this, {
    //                     x: this.velocity.x * slow,
    //                     y: this.velocity.y * slow
    //                 });
    //                 const SCALE = 0.96
    //                 Matter.Body.scale(this, SCALE, SCALE);
    //                 this.radius *= SCALE;
    //                 // } else if (Matter.Query.collides(this, body).length > 0) {
    //             } else if (Matter.Query.point(body, this.position).length > 0) {
    //                 const slow = 0.9
    //                 Matter.Body.setVelocity(this, {
    //                     x: this.velocity.x * slow,
    //                     y: this.velocity.y * slow
    //                 });
    //                 const SCALE = 0.96
    //                 Matter.Body.scale(this, SCALE, SCALE);
    //                 this.radius *= SCALE;
    //             } else {
    //                 this.force.y += this.mass * tech.foamGravity; //gravity
    //                 if (tech.isFoamAttract) {
    //                     for (let i = 0, len = mob.length; i < len; i++) {
    //                         if (!mob[i].isBadTarget && Vector.magnitude(Vector.sub(mob[i].position, this.position)) < 375 && mob[i].alive && Matter.Query.ray(map, this.position, mob[i].position).length === 0) {
    //                             this.force = Vector.mult(Vector.normalise(Vector.sub(mob[i].position, this.position)), this.mass * 0.004)
    //                             const slow = 0.9
    //                             Matter.Body.setVelocity(this, {
    //                                 x: this.velocity.x * slow,
    //                                 y: this.velocity.y * slow
    //                             });
    //                             break
    //                         }
    //                     }
    //                 }
    //             }
    //             if (this.nextPortCycle < simulation.cycle) { //teleport around if you have tech.isBulletTeleport
    //                 this.nextPortCycle = simulation.cycle + this.portFrequency
    //                 const range = 15 * Math.sqrt(this.radius) * Math.random()
    //                 Matter.Body.setPosition(this, Vector.add(this.position, Vector.rotate({ x: range, y: 0 }, 2 * Math.PI * Math.random())))
    //             }
    //         }
    //     });
    //     if (tech.isBulletTeleport) bullet[me].nextPortCycle = simulation.cycle + bullet[me].portFrequency
    //     Composite.add(engine.world, bullet[me]); //add bullet to world
    //     Matter.Body.setVelocity(bullet[me], velocity);
    // },
    foam(position, velocity, radius) {
        // radius *= Math.sqrt(tech.bulletSize)
        const me = bullet.length;
        bullet[me] = Bodies.polygon(position.x, position.y, 20, radius, {
            density: 0.000001, //  0.001 is normal density
            inertia: Infinity,
            frictionAir: 0.003,
            dmg: 0, //damage on impact
            damage: (tech.isFastFoam ? 0.0275 : 0.011) * (tech.isBulletTeleport ? 1.43 : 1) * (tech.isFoamImpact ? 0.5 : 1) * (tech.isFoamChargeBuff ? tech.isFoamChargeBuff : 1), //damage done over time
            scale: 1 - 0.006 / tech.isBulletsLastLonger * (tech.isFastFoam ? 1.65 : 1),
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: cat.mob | cat.mobBullet // cat.map | cat.body | cat.mob | cat.mobShield
            },
            minDmgSpeed: 0,
            endCycle: Infinity,
            count: 0,
            radius: radius,
            target: null,
            targetVertex: null,
            targetRelativePosition: null,
            portFrequency: 5 + Math.floor(5 * Math.random()),
            nextPortCycle: Infinity, //disabled unless you have the teleport tech
            beforeDmg(who) {
                if (!this.target && who.alive) {
                    this.target = who;
                    if (tech.isFoamImpact) {
                        this.target.damage(m.dmgScale * this.damage*30, true)
                    }
                    if (who.radius < 20) {
                        this.targetRelativePosition = {
                            x: 0,
                            y: 0
                        } //find relative position vector for zero mob rotation
                    } else if (Matter.Query.collides(this, [who]).length > 0) {
                        const normal = Matter.Query.collides(this, [who])[0].normal
                        this.targetRelativePosition = Vector.rotate(Vector.sub(Vector.sub(this.position, who.position), Vector.mult(normal, -this.radius)), -who.angle) //find relative position vector for zero mob rotation
                    } else {
                        this.targetRelativePosition = Vector.rotate(Vector.sub(this.position, who.position), -who.angle) //find relative position vector for zero mob rotation
                    }
                    this.collisionFilter.category = cat.body;
                    this.collisionFilter.mask = null;

                    let bestVertexDistance = Infinity
                    let bestVertex = null
                    for (let i = 0; i < this.target.vertices.length; i++) {
                        const dist = Vector.magnitude(Vector.sub(this.position, this.target.vertices[i]));
                        if (dist < bestVertexDistance) {
                            bestVertex = i
                            bestVertexDistance = dist
                        }
                    }
                    this.targetVertex = bestVertex
                }
            },
            onEnd() {},
            do() {
                if (this.count < 20) {
                    this.count++
                    //grow
                    const SCALE = 1.06
                    Matter.Body.scale(this, SCALE, SCALE);
                    this.radius *= SCALE;
                } else {
                    //shrink
                    Matter.Body.scale(this, this.scale, this.scale);
                    this.radius *= this.scale;
                    if (this.radius < 8) this.endCycle = 0;
                }
                if (this.target && this.target.alive) { //if stuck to a target
                    const rotate = Vector.rotate(this.targetRelativePosition, this.target.angle) //add in the mob's new angle to the relative position vector
                    if (this.target.isVerticesChange) {
                        Matter.Body.setPosition(this, this.target.vertices[this.targetVertex])
                    } else {
                        Matter.Body.setPosition(this, Vector.add(Vector.add(rotate, this.target.velocity), this.target.position))
                    }
                    if (this.target.isBoss) {
                        if (this.target.speed > 8) Matter.Body.setVelocity(this.target, Vector.mult(this.target.velocity, 0.98))
                    } else {
                        if (this.target.speed > 4) Matter.Body.setVelocity(this.target, Vector.mult(this.target.velocity, 0.95))
                    }

                    Matter.Body.setAngularVelocity(this.target, this.target.angularVelocity * 0.9);
                    // Matter.Body.setAngularVelocity(this.target, this.target.angularVelocity * 0.9)
                    if (this.target.isShielded) {
                        this.target.damage(m.dmgScale * this.damage, true); //shield damage bypass
                        const SCALE = 1 - 0.004 / tech.isBulletsLastLonger //shrink if mob is shielded
                        Matter.Body.scale(this, SCALE, SCALE);
                        this.radius *= SCALE;
                    } else {
                        this.target.damage(m.dmgScale * this.damage);
                    }
                } else if (this.target !== null) { //look for a new target
                    this.collisionFilter.category = cat.bullet;
                    this.collisionFilter.mask = cat.mob //| cat.mobShield //cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield
                    if (tech.isSpawnBulletsOnDeath && bullet.length < 180 && !this.target.isMobBullet) {
                        let targets = []
                        for (let i = 0, len = mob.length; i < len; i++) {
                            const dist = Vector.magnitudeSquared(Vector.sub(this.position, mob[i].position));
                            if (dist < 1000000) targets.push(mob[i])
                        }
                        const radius = Math.min(this.radius * 0.5, 9)
                        const len = bullet.length < 80 ? 2 : 1
                        for (let i = 0; i < len; i++) {
                            if (targets.length - i > 0) {
                                const index = Math.floor(Math.random() * targets.length)
                                const speed = 6 + 6 * Math.random()
                                const velocity = Vector.mult(Vector.normalise(Vector.sub(targets[index].position, this.position)), speed)
                                b.foam(this.position, Vector.rotate(velocity, 0.5 * (Math.random() - 0.5)), radius)
                            } else {
                                b.foam(this.position, Vector.rotate({
                                    x: 15 + 10 * Math.random(),
                                    y: 0
                                }, 2 * Math.PI * Math.random()), radius)
                            }
                        }
                    }
                    this.target = null
                } else if (Matter.Query.point(map, this.position).length > 0) { //slow when touching map or blocks
                    const slow = 0.85
                    Matter.Body.setVelocity(this, {
                        x: this.velocity.x * slow,
                        y: this.velocity.y * slow
                    });
                    const SCALE = 0.96
                    Matter.Body.scale(this, SCALE, SCALE);
                    this.radius *= SCALE;
                    // } else if (Matter.Query.collides(this, body).length > 0) {
                } else if (Matter.Query.point(body, this.position).length > 0) {
                    const slow = 0.9
                    Matter.Body.setVelocity(this, {
                        x: this.velocity.x * slow,
                        y: this.velocity.y * slow
                    });
                    const SCALE = 0.96
                    Matter.Body.scale(this, SCALE, SCALE);
                    this.radius *= SCALE;
                } else {
                    this.force.y += this.mass * tech.foamGravity; //gravity
                    if (tech.isFoamAttract) {
                        for (let i = 0, len = mob.length; i < len; i++) {
                            if (!mob[i].isBadTarget && Vector.magnitude(Vector.sub(mob[i].position, this.position)) < 375 && mob[i].alive && Matter.Query.ray(map, this.position, mob[i].position).length === 0) {
                                this.force = Vector.mult(Vector.normalise(Vector.sub(mob[i].position, this.position)), this.mass * 0.004)
                                const slow = 0.9
                                Matter.Body.setVelocity(this, {
                                    x: this.velocity.x * slow,
                                    y: this.velocity.y * slow
                                });
                                break
                            }
                        }
                    }
                    if (tech.isFoamCloneWhileTravel && (!(m.cycle % 15)) && Math.random() < 0.166 && this.radius > 24 && !this.isSLES) {
                        b.foam(this.position, Vector.add(Vector.rotate({
                            x: 2 + 3 * Math.random(),
                            y: 0
                        }, 2 * Math.PI * Math.random()), this.velocity), this.radius-8)
                        bullet[bullet.length - 1].count = 20
                        bullet[bullet.length - 1].isSLES = true
                        this.isSLES = Math.random() < 0.2
                    }
                }
                if (this.nextPortCycle < simulation.cycle) { //teleport around if you have tech.isBulletTeleport
                    this.nextPortCycle = simulation.cycle + this.portFrequency
                    const range = 15 * Math.sqrt(this.radius) * Math.random()
                    Matter.Body.setPosition(this, Vector.add(this.position, Vector.rotate({ x: range, y: 0 }, 2 * Math.PI * Math.random())))
                }
            }
        });
        if (tech.isBulletTeleport) bullet[me].nextPortCycle = simulation.cycle + bullet[me].portFrequency
        Composite.add(engine.world, bullet[me]); //add bullet to world
        Matter.Body.setVelocity(bullet[me], velocity);
    },
    targetedBlock(who, isSpin = false, speed = 50 - Math.min(20, who.mass * 2), range = 1600) {
        let closestMob, dist
        for (let i = 0, len = mob.length; i < len; i++) {
            if (who !== mob[i]) {
                dist = Vector.magnitude(Vector.sub(who.position, mob[i].position));
                if (dist < range && Matter.Query.ray(map, who.position, mob[i].position).length === 0) { //&& Matter.Query.ray(body, position, mob[i].position).length === 0
                    closestMob = mob[i]
                    range = dist
                }
            }
        }
        if (closestMob) {
            const where = Vector.add(closestMob.position, Vector.mult(closestMob.velocity, dist / 60))
            const velocity = Vector.mult(Vector.normalise(Vector.sub(where, who.position)), speed)
            velocity.y -= Math.abs(who.position.x - closestMob.position.x) / 150; //gives an arc, but not a good one
            Matter.Body.setVelocity(who, velocity);
        }
    },
    targetedNail(position, num = 1, speed = 40 + 10 * Math.random(), range = 1200, isRandomAim = true, damage = 1.4) {
        const targets = [] //target nearby mobs
        for (let i = 0, len = mob.length; i < len; i++) {
            const dist = Vector.magnitude(Vector.sub(position, mob[i].position));
            if (
                dist < range + mob[i].radius &&
                (!mob[i].isBadTarget) && //|| mob[i].isMobBullet
                Matter.Query.ray(map, position, mob[i].position).length === 0 &&
                Matter.Query.ray(body, position, mob[i].position).length === 0
            ) {
                targets.push(Vector.add(mob[i].position, Vector.mult(mob[i].velocity, dist / 60))) //predict where the mob will be in a few cycles
            }
        }
        for (let i = 0; i < num; i++) {
            if (targets.length > 0) { // aim near a random target in array
                const index = Math.floor(Math.random() * targets.length)
                const SPREAD = 150 / targets.length
                const WHERE = {
                    x: targets[index].x + SPREAD * (Math.random() - 0.5),
                    y: targets[index].y + SPREAD * (Math.random() - 0.5)
                }
                b.nail(position, Vector.mult(Vector.normalise(Vector.sub(WHERE, position)), speed), damage)
            } else if (isRandomAim) { // aim in random direction
                const ANGLE = 2 * Math.PI * Math.random()
                b.nail(position, {
                    x: speed * Math.cos(ANGLE),
                    y: speed * Math.sin(ANGLE)
                }, damage)
            }
        }
    },
    nail(pos, velocity, dmg = 1) {
        dmg *= tech.bulletSize
        const me = bullet.length;
        bullet[me] = Bodies.rectangle(pos.x, pos.y, 25 * tech.bulletSize, 2 * tech.bulletSize, b.fireAttributes(Math.atan2(velocity.y, velocity.x)));
        Matter.Body.setVelocity(bullet[me], velocity);
        Composite.add(engine.world, bullet[me]); //add bullet to world
        bullet[me].endCycle = simulation.cycle + 60 + 18 * Math.random();
        bullet[me].dmg = tech.isNailRadiation ? 0 : dmg
        bullet[me].beforeDmg = function(who) { //beforeDmg is rewritten with ice crystal tech
            if (tech.isNailRadiation) mobs.statusDoT(who, dmg * (tech.isFastRadiation ? 1.3 : 0.44), tech.isSlowRadiation ? 360 : (tech.isFastRadiation ? 60 : 180)) // one tick every 30 cycles
            if (tech.isNailCrit && !who.shield && Vector.dot(Vector.normalise(Vector.sub(who.position, this.position)), Vector.normalise(this.velocity)) > 0.94) {
                b.explosion(this.position, 150 + 30 * Math.random()); //makes bullet do explosive damage at end
            }
        };
        bullet[me].do = function() {};
    },
    getDetonationRange() {
        let range = 500
        range += 500*(0.084/0.188)*(tech.isAcetylene-1)
        if (tech.isDeflagration) range += 250
        if (tech.isQuake && m.cycle > m.fireCDcycle + 120) range *= 2
        return range
    },
    getDetonationDamage() {
        let dmg = 2
        dmg *= tech.isAcetylene
        if (tech.isDeflagration) dmg *= 0.7
        if (tech.isBLEVE) dmg *= 3.5
        if (tech.isHeavyShell) dmg *= 1.22
        return dmg
    },
    detonation(pos, range = b.getDetonationRange(), dmg = b.getDetonationDamage(), color = (tech.isNitrogen17 ? "0,102,119" : "68,68,68")) {
        b.guns[12].activeDetonationEffects.push({
            x: pos.x,
            y: pos.y,
            color: color,
            targetRange: range,
            progress: 0,
        })
        for (let i = body.length - 1; i > -1; i--) {
            if (!body[i].isNotHoldable) {
                sub = Vector.sub(pos, body[i].position);
                dist = Vector.magnitude(sub);
                if (dist < range) {
                    knock = Vector.mult(Vector.normalise(sub), (-Math.sqrt(dmg) * body[i].mass) * 0.044);
                    body[i].force.x += knock.x;
                    body[i].force.y += knock.y;
                }
            }
        }
        //power up knock backs
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            sub = Vector.sub(pos, powerUp[i].position);
            dist = Vector.magnitude(sub);
            if (dist < range) {
                knock = Vector.mult(Vector.normalise(sub), (-Math.sqrt(dmg) * powerUp[i].mass) * 0.026);
                powerUp[i].force.x += knock.x;
                powerUp[i].force.y += knock.y;
            }
        }
        //mob damage and knock back with alert
        for (let i = 0, len = mob.length; i < len; ++i) {
            if (mob[i].alive && !mob[i].isShielded) {
                sub = Vector.sub(pos, mob[i].position);
                dist = Vector.magnitude(sub) - mob[i].radius;
                if (dist < range) {
                    if (mob[i].shield) dmg *= 2.5 //balancing explosion dmg to shields
                    if (Matter.Query.ray(map, mob[i].position, pos).length > 0) dmg *= 0.2 //significantly reduce damage if a wall is in the way
                    mob[i].damage(dmg * m.dmgScale);
                    mob[i].foundPlayer();
                    knock = Vector.mult(Vector.normalise(sub), (-Math.sqrt(dmg) * mob[i].mass) * 0.02 * (mob[i].isBoss ? 0.2 : 1));
                    mob[i].force.x += knock.x;
                    mob[i].force.y += knock.y;
                    if (tech.isNitrogen17) mobs.statusDoT(mob[i], dmg*0.17142857142, 240)
                    if ((Math.random() < 0.15 + (tech.isBlastWave ? 0.07*tech.isBlastWave : 0) + (tech.isHeavyShell ? 0.22 : 0)) || (tech.isQuake && m.cycle > m.fireCDcycle + 120) || mob[i].isHealBossSpecifically) {
                        mobs.statusStun(mob[i], 120 + (tech.isBlastWave ? 18*tech.isBlastWave : 0))
                        if (tech.isWhitePhosphorus) b.explosion(mob[i].position, 150)
                    }
                } else if (!mob[i].seePlayer.recall && dist < range*2) {
                    if (dist < range * 1.67 && tech.isCounterblast) {
                        knock = Vector.mult(Vector.normalise(sub), (Math.sqrt(dmg) * mob[i].mass) * 0.02 * (mob[i].isBoss ? 0.2 : 1));
                        mob[i].force.x += knock.x;
                        mob[i].force.y += knock.y;
                    }
                    mob[i].foundPlayer();
                }
            }
        }
        sub = Vector.sub(pos, player.position);
        dist = Vector.magnitude(sub);
        if (dist < range && tech.isBLEVE) m.damage(0.067 * simulation.dmgScale)
    },
    rebar(angle = m.angle) {
        const me = bullet.length;
        bullet[me] = Bodies.rectangle(m.pos.x, m.pos.y, 225, 20, b.fireAttributes(angle));
        Matter.Body.setDensity(bullet[me], 0.0001); //0.001 is normal
        bullet[me].immuneList = []
        bullet[me].dmg = 26
        bullet[me].endCycle = simulation.cycle + 300;
        bullet[me].collisionFilter.mask = tech.isRebarBlockNails ? 0 : cat.body
        bullet[me].do = function() {
            const whom = Matter.Query.collides(this, mob)
            const block = Matter.Query.collides(this, body)
            let globalImmune = false
            if (whom.length) { //if touching a mob 
                for (let i = 0, len = whom.length; i < len; i++) {
                    who = whom[i].bodyA
                    if (who && who.mob) {
                        let immune = false
                        for (let i = 0; i < this.immuneList.length; i++) { //check if this needle has hit this mob already
                            if (this.immuneList[i] === who.id) {
                                this.immuneList[i]
                                immune = true
                                if (this.grabTarget != who) globalImmune = true
                                break
                            }
                        }
                        if (!immune && who != this.grabTarget) {
                            this.immuneList.push(who.id) //remember that this needle has hit this mob once already
                            let dmg = this.dmg * m.dmgScale
                            if (tech.isRebarStun) who.rebarStunProtected = true
                            who.damage(dmg, true);
                            this.dmg /= 2
                            if (who.alive) who.foundPlayer();
                            if (tech.isRebarStun) {
                                mobs.statusStun(who, 60)
                                who.rebarStunProtected = false
                                if (!who.isBoss && this.grabTarget == null) { // dont grab bosses since that'd be stupid
                                    if (who.health < 0.05) who.health = 0.05
                                    this.grabTarget = who
                                    Matter.Body.setPosition(who, this.position)
                                    Matter.Body.setVelocity(who, this.velocity)
                                } else {
                                    if (who.health < 0.05) {
                                        who.death()
                                    }
                                }
                            }
                            if (who.damageReduction) {
                                simulation.drawList.push({ //add dmg to draw queue
                                    x: this.position.x,
                                    y: this.position.y,
                                    radius: Math.log(dmg + 1.1) * 40 * who.damageReduction + 3,
                                    color: simulation.playerDmgColor,
                                    time: simulation.drawTime
                                });
                            }
                        }
                    }
                }
            }
            if (
                (
                    Matter.Query.collides(this, map).length ||
                    (
                        block.length &&
                        block[0].bodyA.isStatic
                    )
                ) &&
                !Matter.Query.collides(this, [player]).length
            ) { //stick to walls
                let createdBody = body[body.length] = Matter.Bodies.fromVertices(this.position.x, this.position.y, this.vertices);
                createdBody.collisionFilter.category = cat.body;
                createdBody.collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet
                createdBody.classType = "body";
                createdBody.isStatic = true;
                Composite.add(engine.world, createdBody);
                setTimeout(()=>{
                    for (let i = 0; i < body.length; i++) {
                        if (body[i] === createdBody && body[i].isStatic) { // dont delete if it has been thrown
                            Matter.Composite.remove(engine.world, body[i]);
                            body.splice(i, 1);
                        }
                    }
                }, 18000)
                if (this.grabTarget) {
                    if (tech.isRebarStunBoost) {
                        if (Math.random() < 0.25) powerUps.spawn(this.position.x, this.position.y, "boost")
                        if (Math.random() < 0.2) powerUps.spawn(this.position.x, this.position.y, "ammo")
                    }
                    if (this.grabTarget.health == 0.05) { // kill grabbed mobs at the end of life
                        this.grabTarget.death()
                    }
                }
                this.endCycle = -1
            } else if (tech.isRebarBlockNails && block.length && !block[0].bodyA.isNotHoldable) { // convert blocks to nails
                for (let i=0;i<body.length;i++) {
                    if (block[0].bodyA === body[i]) {
                        Matter.Composite.remove(engine.world, body[i]);
                        body.splice(i, 1);
                        b.targetedNail(block[0].bodyA.position, Math.max(1, Math.floor(block[0].bodyA.area/3000)), 40 + 10 * Math.random(), 1200, true, 1.4)
                        break
                    }
                }
            }
            this.force.y += this.mass * simulation.g
            Matter.Body.setAngle(this, Math.atan2(this.velocity.y, this.velocity.x))
            if (this.grabTarget) {
                if (this.grabTarget.isStunned && this.grabTarget.alive) {
                    Matter.Body.setVelocity(this.grabTarget, this.velocity)
                    if (!(m.cycle % 15)) Matter.Body.setPosition(this.grabTarget, this.position)
                } else {
                    if (this.grabTarget.alive && this.grabTarget.health == 0.05) this.grabTarget.death()
                    this.grabTarget = null
                }
            }
            if (!globalImmune) this.immuneList = [] // since the rebars are affected by gravity, its possible for them to hit 1 mob twice via gravity
            if (tech.isRebarAttract) {
                let attractList = []
                for (let i=0;i<mob.length;i++) {
                    if (Vector.magnitude(Vector.sub(mob[i].position, this.position)) < 900 && !mob[i].isBadTarget && (!tech.isRebarAttractDamage || mob[i].damageReduction) && mob[i].alive) {
                        attractList.push(mob[i])
                    }
                }
                ctx.beginPath()
                for (let i=0;i<attractList.length;i++) {
                    let angle = Math.atan2(this.position.y-attractList[i].position.y, this.position.x-attractList[i].position.x)
                    Matter.Body.setVelocity(attractList[i], {x:attractList[i].velocity.x+Math.cos(angle)*Math.min(3/attractList[i].mass, 1.5),y:attractList[i].velocity.y+Math.sin(angle)*Math.min(3/attractList[i].mass, 1.5)})
                    if (tech.isRebarAttractDamage) {
                        attractList[i].damage(0.12*m.dmgScale, true)
                        if (!tech.isEnergyHealth) {
                            m.health -= 0.00015*simulation.dmgScale*m.harmReduction()
                        } else {
                            m.energy -= 0.00015*simulation.dmgScale
                        }
                    }
                    ctx.moveTo(this.position.x, this.position.y);
                    ctx.lineTo(attractList[i].position.x, attractList[i].position.y);
                }
                ctx.lineWidth = "12";
                ctx.strokeStyle = (tech.isRebarAttractDamage) ? "rgba(255,0,0,0.5)" : "rgba(0,0,0,0.5)"
                ctx.stroke()
                if (tech.isRebarAttractDamage) {
                    if (!tech.isEnergyHealth) m.displayHealth();
                    ctx.beginPath()
                    for (let i=0;i<attractList.length;i++) {
                        ctx.moveTo(player.position.x, player.position.y);
                        ctx.lineTo(attractList[i].position.x, attractList[i].position.y);
                    }
                    ctx.lineWidth = "12";
                    ctx.strokeStyle = "hsla(51,100%,71%,0.5)"
                    ctx.stroke()
                }
            }
            if (tech.isHydrogenTrail && !(m.cycle % 4)) {
                b.hydrogen(this.position, {x:0,y:0}, 30, 2)
            }
        };
        const SPEED = 30*(input.down?1.25:1)
        Matter.Body.setVelocity(bullet[me], {
            x: SPEED * Math.cos(angle),
            y: SPEED * Math.sin(angle)
        });
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    controlRod(where, velocity, angle = 0) {
        const bIndex = bullet.length;
        bullet[bIndex] = Bodies.rectangle(where.x, where.y, 57, 26, {
            angle: angle,
            friction: 1,
            frictionStatic: 1,
            frictionAir: 0,
            restitution: 0.5,
            dmg: 0, //damage done in addition to the damage from momentum
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield //  | cat.bullet   //doesn't collide with other bullets until it lands  (was crashing into bots)
            },
            endCycle: m.cycle+300,
            maxRadioRadius: 300 + Math.floor(100 * Math.random()),
            radioRadius: 0,
            onEnd() {},
            beforeDmg() {},
            do() {
                this.force.y += this.mass * simulation.g
                //radioactive zone
                this.radioRadius = this.radioRadius * 0.97 + 0.03 * this.maxRadioRadius //smooth radius towards max
                //aoe damage to player
                if (Vector.magnitude(Vector.sub(player.position, this.position)) < this.radioRadius) {
                    const DRAIN = tech.isRadioactiveResistance ? 0.002 * 0.25 : 0.002
                    if (m.energy > DRAIN) {
                        if (m.immuneCycle < m.cycle) m.energy -= DRAIN
                    } else {
                        m.energy = 0;
                        if (simulation.dmgScale) m.damage(tech.isRadioactiveResistance ? 0.00015 * 0.25 : 0.00015) //0.00015
                    }
                }
                //aoe damage to mobs
                for (let i = 0, len = mob.length; i < len; i++) {
                    if (Vector.magnitude(Vector.sub(mob[i].position, this.position)) < this.radioRadius + mob[i].radius) {
                        let dmg = 0.08 * m.dmgScale //neutron bombs  dmg = 0.09
                        if (Matter.Query.ray(map, mob[i].position, this.position).length > 0) dmg *= 0.25 //reduce damage if a wall is in the way
                        if (mob[i].shield) dmg *= 3 // to make up for the /5 that shields normally take
                        mob[i].damage(dmg);
                        mob[i].locatePlayer();
                    }
                }
                //draw
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radioRadius, 0, 2 * Math.PI);
                ctx.globalCompositeOperation = "lighter"
                // ctx.fillStyle = `rgba(25,139,170,${0.15+0.05*Math.random()})`;
                // ctx.fillStyle = `rgba(36, 207, 255,${0.1+0.05*Math.random()})`;
                ctx.fillStyle = `rgba(28, 175, 217,${0.13+0.07*Math.random()})`;
                ctx.fill();
                ctx.globalCompositeOperation = "source-over"
            },
        });
        Matter.Body.setVelocity(bullet[bIndex], velocity);
        Composite.add(engine.world, bullet[bIndex]); //add bullet to world
    },
    hydrogen(position, velocity, radius = 30, diffuse = 0.7) {
        // radius *= Math.sqrt(tech.bulletSize)
        const me = bullet.length;
        bullet[me] = Bodies.polygon(position.x, position.y, 20, 2, {
            density: 0.000001, //  0.001 is normal density
            frictionAir: 0,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: cat.map
            },
            count: 0,
            radius: radius,
            restitution: 0.5,
            period: 200*Math.random(),
            dontRender: true,
            endCycle: m.cycle+400-(bullet.length*2),
            isHydrogenGas: true,
            onEnd() {},
            do() {
                if (this.count < 10) {
                    this.count++
                    //grow
                    const SCALE = 1.12
                    this.radius *= SCALE;
                }
                let effectiveRadius = this.radius + (Math.sin((m.cycle+10000)/(50+this.period))*this.radius*0.2)
                let mult = 1 + tech.isHydrogenHeavy
                let nearest = [null, Infinity]
                for (let i=0;i<mob.length;i++) {
                    if (Vector.magnitude(Vector.sub(mob[i].position, this.position)) < effectiveRadius) {
                        Matter.Body.setVelocity(mob[i], {
                            x: mob[i].velocity.x * (0.97**mult),
                            y: mob[i].velocity.y * (0.97**mult)
                        })
                        if (tech.isHydrogenRegression) mob[i].damageReduction *= 1 + (0.00081350011 * (mob[i].isBoss ? 0.25 : 1) * mult)
                        if (tech.isHydrogenRadioactive) mob[i].damage(0.1*m.dmgScale*mult)
                    }
                    if (tech.isHydrogenCondense && Vector.magnitude(Vector.sub(mob[i].position, this.position)) < nearest[1]) {
                        nearest = [mob[i], Vector.magnitude(Vector.sub(mob[i].position, this.position))]
                    }
                }
                if (tech.isHydrogenCondense && nearest[0] != null && nearest[1] < effectiveRadius * 7) {
                    const sub = Vector.sub(nearest[0].position, this.position)
                    const force = Vector.mult(Vector.normalise(sub), 0.000000003)
                    this.force.x += force.x
                    this.force.y += force.y
                }
                if (tech.isHydrogenHeavy) {
                    this.force.y += this.mass * simulation.g * 0.025
                }
                ctx.beginPath()
                ctx.fillStyle = (tech.isHydrogenRadioactive) ? "rgba(0,102,119,0.4)" : "rgba(240,215,217,0.4)"
                ctx.arc(this.position.x, this.position.y, effectiveRadius, 0, 2*Math.PI)
                ctx.fill()
            }
        });
        Composite.add(engine.world, bullet[me]); //add bullet to world
        let effectivevelocity = {
            x:velocity.x + ((Math.random()-0.5) * diffuse * 2),
            y:velocity.y + ((Math.random()-0.5) * diffuse * 2),
        }
        Matter.Body.setVelocity(bullet[me], effectivevelocity);
    },
    flankOrb(mirror, angle = m.angle) {
        const me = bullet.length;
        const position = {
            x: m.pos.x+(Math.cos(m.angle)*20),
            y: m.pos.y+(Math.sin(m.angle)*20)
        }
        const velocity = {
            x: Math.cos(m.angle+((Math.PI*mirror)/6))*12,
            y: Math.sin(m.angle+((Math.PI*mirror)/6))*12,
        }
        bullet[me] = Bodies.polygon(position.x, position.y, 30, 11, {
            density: 0.00001, //  0.001 is normal density
            frictionAir: 0,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: 0
            },
            endCycle: simulation.cycle+11,
            onEnd() {
                b.flankBullet(this.position,angle,1)
                b.flankBullet(this.position,angle+Math.PI,1.5)
                if (tech.isFlankExtraBack) {
                    b.flankBullet(this.position,angle+Math.PI+((Math.random()-0.5)*0.25),1.6)
                }
            },
            do() {
                const whom = Matter.Query.collides(this, mob)
                if (whom.length) {
                    this.endCycle -= 2
                    if (tech.isFlankOrbEnergy) {
                        m.energy += 0.027
                        simulation.drawList.push({
                            x: this.position.x,
                            y: this.position.y,
                            radius: Math.log(1.34) * 40 * 1 + 3,
                            color: "#0cf",
                            time: simulation.drawTime
                        });
                    }
                }
            }
        });
        Composite.add(engine.world, bullet[me]); //add bullet to world
        Matter.Body.setVelocity(bullet[me], velocity);
    },
    flankBullet(pos, angle, dmg = 1) {
        dmg *= (tech.isFlankOrbEnergy ? 0.67 : 1)
        const me = bullet.length;
        bullet[me] = Bodies.rectangle(pos.x, pos.y, 35, 10, b.fireAttributes(Math.atan2(Math.sin(angle), Math.cos(angle))));
        Matter.Body.setVelocity(bullet[me], {x:Math.cos(angle)*52,y:Math.sin(angle)*52});
        Composite.add(engine.world, bullet[me]); //add bullet to world
        bullet[me].endCycle = simulation.cycle + 60
        bullet[me].dmg = dmg
        bullet[me].collisionFilter.mask = 0
        bullet[me].beforeDmg = function(who) {};
        bullet[me].do = function() {
            const mapHit = Matter.Query.collides(this, map)
            const blockHit = Matter.Query.collides(this, body)
            if (mapHit.length || blockHit.length) {
                if (!tech.isFlankPierce) {
                    this.endCycle = -1
                } else {
                    this.endCycle -= 6
                }
            }
            const whom = Matter.Query.collides(this, mob)
            if (whom.length && this.endCycle != -1) {
                who = whom[0].bodyA
                if (who && who.mob && this.immune != who.id) {
                    if (this.immune != null || !tech.isFlankPierce) {
                        this.endCycle = -1
                    } else {
                        this.immune = who.id
                    }
                    who.damage(this.dmg, false);
                    if (who.alive) who.foundPlayer();
                    if (who.damageReduction) {
                        simulation.drawList.push({ //add dmg to draw queue
                            x: this.position.x,
                            y: this.position.y,
                            radius: Math.log(dmg + 1.1) * 40 * who.damageReduction + 3,
                            color: simulation.playerDmgColor,
                            time: simulation.drawTime
                        });
                    }
                }
            }
        };
    },
    flankObliterator(angle) {
        const me = bullet.length;
        const velocity = {
            x: Math.cos(angle)*34,
            y: Math.sin(angle)*34,
        }
        bullet[me] = Bodies.polygon(m.pos.x, m.pos.y, 30, 45, {
            density: 0.00001, //  0.001 is normal density
            frictionAir: 0,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: 0
            },
            endCycle: simulation.cycle+90,
            dontRender: true,
            ignore: [],
            history: [],
            ignoreBosses: false,
            onEnd() {},
            do() {
                let nearest = [null, Infinity]
                for (let victim of mob) {
                    if (!victim.isBadTarget && Vector.magnitude(Vector.sub(m.pos, victim.position)) < level.defaultZoom*1.3 && !Matter.Query.ray(map,m.pos,victim.position).length && victim.damageReduction && !this.ignore.includes(victim.id)) {
                        let distance = Vector.magnitude(Vector.sub(this.position, victim.position))
                        if (victim.isBoss) distance *= this.ignoreBosses ? Infinity : 0.333
                        if (!victim.isDropPowerUp) distance *= 2
                        if (distance < nearest[1]) nearest = [victim, distance]
                    }
                }
                if (nearest[0] != null) {
                    const sub = Vector.sub(nearest[0].position, this.position)
                    const angle2 = Math.atan2(this.velocity.y,this.velocity.x)
                    const targetAngle = angle2+Math.max(Math.min(this.angleDifference(angle2, Math.atan2(sub.y,sub.x)),0.2),-0.2)
                    Matter.Body.setVelocity(this, {x:Math.cos(targetAngle)*34,y:Math.sin(targetAngle)*34})
                }
                
                const whom = Matter.Query.collides(this, mob)
                if (whom.length) {
                    who = whom[0].bodyA
                    if (who && who.mob && !this.ignore.includes(who.id) && (who.isBoss ? !this.ignoreBosses : true) && who.damageReduction) {
                        if (who.isBoss) this.ignoreBosses = true
                        who.damage(45, true);
                        this.ignore.push(who.id)
                        this.endCycle += 10
                    }
                }
                // visuals
                this.history.push({x:this.position.x,y:this.position.y})
                for (let i=0;i<16;i++) {
                    if (this.history[this.history.length-(2+i)] != null) {
                        ctx.beginPath()
                        ctx.moveTo(this.history[this.history.length-(1+i)].x,this.history[this.history.length-(1+i)].y)
                        ctx.lineTo(this.history[this.history.length-(2+i)].x,this.history[this.history.length-(2+i)].y)
                        ctx.lineWidth = (66-(i*4))
                        ctx.strokeStyle = "rgba(127,0,255,1)"
                        ctx.stroke()
                    }
                }
                for (let i=0;i<8;i++) {
                    if (this.history[this.history.length-(2+i)] != null) {
                        ctx.beginPath()
                        ctx.moveTo(this.history[this.history.length-(1+i)].x,this.history[this.history.length-(1+i)].y)
                        ctx.lineTo(this.history[this.history.length-(2+i)].x,this.history[this.history.length-(2+i)].y)
                        ctx.lineWidth = (33-(i*4))
                        ctx.strokeStyle = "rgba(255,255,255,1)"
                        ctx.stroke()
                    }
                }
            },
            angleDifference(sourceA, targetA) {
                let mod = function(a, n) {
                    return (a % n + n) % n;
                };
                let a = targetA - sourceA;
                return mod(a + Math.PI, 2*Math.PI) - Math.PI;
            }
        });
        Composite.add(engine.world, bullet[me]); //add bullet to world
        Matter.Body.setVelocity(bullet[me], velocity);
    },
    needle(angle = m.angle) {
        const me = bullet.length;
        bullet[me] = Bodies.rectangle(m.pos.x + 40 * Math.cos(m.angle), m.pos.y + 40 * Math.sin(m.angle), 75 * tech.bulletSize, 0.75 * tech.bulletSize, b.fireAttributes(angle));
        Matter.Body.setDensity(bullet[me], 0.00001); //0.001 is normal
        bullet[me].immuneList = []
        bullet[me].dmg = 6
        if (tech.needleTunnel) {
            bullet[me].dmg *= 1.2
            bullet[me].endCycle = simulation.cycle + 300;
            bullet[me].collisionFilter.mask = tech.isShieldPierce ? 0 : cat.mobShield
            // bullet[me].turnRate = 0.005 * (Math.random() - 0.5)
            bullet[me].isInMap = false
            bullet[me].do = function() {
                const whom = Matter.Query.collides(this, mob)
                if (whom.length && this.speed > 20) { //if touching a mob 
                    for (let i = 0, len = whom.length; i < len; i++) {
                        who = whom[i].bodyA
                        if (who && who.mob) {
                            let immune = false
                            for (let i = 0; i < this.immuneList.length; i++) { //check if this needle has hit this mob already
                                if (this.immuneList[i] === who.id) {
                                    immune = true
                                    break
                                }
                            }
                            if (!immune) {
                                if (tech.isNailCrit && !who.shield && Vector.dot(Vector.normalise(Vector.sub(who.position, this.position)), Vector.normalise(this.velocity)) > 0.94) {
                                    b.explosion(this.position, 220 * tech.bulletSize + 50 * Math.random()); //makes bullet do explosive damage at end
                                }
                                this.immuneList.push(who.id) //remember that this needle has hit this mob once already
                                let dmg = this.dmg * tech.bulletSize * m.dmgScale
                                if (tech.isNailRadiation) {
                                    mobs.statusDoT(who, (tech.isFastRadiation ? 6 : 2) * tech.bulletSize, tech.isSlowRadiation ? 360 : (tech.isFastRadiation ? 60 : 180)) // one tick every 30 cycles
                                    dmg *= 0.25
                                }
                                if (tech.isCrit && who.isStunned) dmg *= 4
                                who.damage(dmg, tech.isShieldPierce);
                                if (who.alive) who.foundPlayer();
                                if (who.damageReduction) {
                                    simulation.drawList.push({ //add dmg to draw queue
                                        x: this.position.x,
                                        y: this.position.y,
                                        radius: Math.log(dmg + 1.1) * 40 * who.damageReduction + 3,
                                        color: simulation.playerDmgColor,
                                        time: simulation.drawTime
                                    });
                                }
                            }
                        }
                    }
                } else if (Matter.Query.collides(this, map).length) { //penetrate walls
                    if (!this.isInMap) { //turn after entering the map, but only turn once
                        this.isInMap = true
                        Matter.Body.setVelocity(this, Vector.rotate(this.velocity, 0.25 * (Math.random() - 0.5)));
                        Matter.Body.setAngle(this, Math.atan2(this.velocity.y, this.velocity.x))
                    }
                    Matter.Body.setPosition(this, Vector.add(this.position, Vector.mult(this.velocity, -0.98))) //move back 1/2 your velocity = moving at 1/2 speed
                } else if (Matter.Query.collides(this, body).length) { //penetrate blocks
                    Matter.Body.setAngularVelocity(this, 0)
                    Matter.Body.setPosition(this, Vector.add(this.position, Vector.mult(this.velocity, -0.94))) //move back 1/2 your velocity = moving at 1/2 speed
                } else if (this.speed < 30) {
                    this.force.y += this.mass * 0.001; //no gravity until it slows down to improve aiming
                }
            };
        } else {
            bullet[me].endCycle = simulation.cycle + 100;
            bullet[me].collisionFilter.mask = tech.isShieldPierce ? cat.body : cat.body | cat.mobShield
            bullet[me].do = function() {
                const whom = Matter.Query.collides(this, mob)
                if (whom.length && this.speed > 20) { //if touching a mob 
                    for (let i = 0, len = whom.length; i < len; i++) {
                        who = whom[i].bodyA
                        if (who && who.mob) {
                            let immune = false
                            for (let i = 0; i < this.immuneList.length; i++) { //check if this needle has hit this mob already
                                if (this.immuneList[i] === who.id) {
                                    immune = true
                                    break
                                }
                            }
                            if (!immune) {
                                if (tech.isNailCrit && !who.shield && Vector.dot(Vector.normalise(Vector.sub(who.position, this.position)), Vector.normalise(this.velocity)) > 0.94) {
                                    b.explosion(this.position, 220 * tech.bulletSize + 50 * Math.random()); //makes bullet do explosive damage at end
                                }
                                this.immuneList.push(who.id) //remember that this needle has hit this mob once already
                                let dmg = this.dmg * tech.bulletSize * m.dmgScale
                                if (tech.isNailRadiation) {
                                    mobs.statusDoT(who, (tech.isFastRadiation ? 6 : 2) * tech.bulletSize, tech.isSlowRadiation ? 360 : (tech.isFastRadiation ? 60 : 180)) // one tick every 30 cycles
                                    dmg *= 0.25
                                }
                                if (tech.isCrit && who.isStunned) dmg *= 4
                                who.damage(dmg, tech.isShieldPierce);
                                if (who.alive) who.foundPlayer();
                                if (who.damageReduction) {
                                    simulation.drawList.push({ //add dmg to draw queue
                                        x: this.position.x,
                                        y: this.position.y,
                                        radius: Math.log(dmg + 1.1) * 40 * who.damageReduction + 3,
                                        color: simulation.playerDmgColor,
                                        time: simulation.drawTime
                                    });
                                }
                            }
                        }
                    }
                } else if (Matter.Query.collides(this, map).length) { //stick in walls
                    this.collisionFilter.mask = 0;
                    Matter.Body.setAngularVelocity(this, 0)
                    Matter.Body.setVelocity(this, {
                        x: 0,
                        y: 0
                    });
                    this.do = function() {
                        if (!Matter.Query.collides(this, map).length) this.force.y += this.mass * 0.001;
                    }
                    if (tech.isNeedleIce) {
                        b.iceIX(5 + 5 * Math.random(), 2 * Math.PI * Math.random(), this.position) // iceIX(speed = 0, dir = m.angle + Math.PI * 2 * Math.random(), where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }) {
                        if (0.5 < Math.random()) b.iceIX(5 + 5 * Math.random(), 2 * Math.PI * Math.random(), this.position)
                    }
                } else if (this.speed < 30) {
                    this.force.y += this.mass * 0.001; //no gravity until it slows down to improve aiming
                }
            };
        }
        const SPEED = 90
        Matter.Body.setVelocity(bullet[me], {
            x: m.Vx / 2 + SPEED * Math.cos(angle),
            y: m.Vy / 2 + SPEED * Math.sin(angle)
        });
        // Matter.Body.setDensity(bullet[me], 0.00001);
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    // **************************************************************************************************
    // **************************************************************************************************
    // ********************************         Bots        *********************************************
    // **************************************************************************************************
    // **************************************************************************************************
    totalBots() {
        return tech.dynamoBotCount + tech.foamBotCount + tech.nailBotCount + tech.laserBotCount + tech.boomBotCount + tech.orbitBotCount + tech.plasmaBotCount + tech.missileBotCount
    },
    hasBotUpgrade() {
        return tech.isNailBotUpgrade + tech.isFoamBotUpgrade + tech.isBoomBotUpgrade + tech.isLaserBotUpgrade + tech.isOrbitBotUpgrade + tech.isDynamoBotUpgrade
    },
    convertBotsTo(type) { //type can be a string like "dynamoBotCount"
        const totalPermanentBots = b.totalBots()
        //remove all bots techs and convert them to the new type so that tech refunds work correctly
        let totalTechToConvert = 0 //count how many tech need to be converted
        for (let i = 0; i < tech.tech.length; i++) {
            if (tech.tech[i].count && tech.tech[i].isBot) {
                totalTechToConvert += tech.tech[i].count
                tech.removeTech(i)
            }
        }
        //remove all bots
        b.zeroBotCount()
        b.clearPermanentBots()
        for (let i = 0; i < totalTechToConvert; i++) tech.giveTech(type) //spawn tech for the correct bot type

        //find index of new bot type tech effect
        let index = null
        for (let i = 0; i < tech.tech.length; i++) {
            if (tech.tech[i].name === type) {
                index = i
                break
            }
        }
        for (let i = 0, len = totalPermanentBots - totalTechToConvert; i < len; i++) tech.tech[index].effect(); //also convert any permanent bots that didn't come from a tech
        //in experiment mode set the unselect color for bot tech that was converted
        // if (build.isExperimentSelection) {        }
    },
    clearPermanentBots() {
        for (let i = 0; i < bullet.length; i++) {
            if (bullet[i].botType && bullet[i].endCycle === Infinity) bullet[i].endCycle = 0 //remove active bots, but don't remove temp bots
        }
    },
    removeBot() {
        if (tech.nailBotCount > 1) {
            tech.nailBotCount--
            return
        }
        if (tech.laserBotCount > 1) {
            tech.laserBotCount--
            return
        }
        if (tech.foamBotCount > 1) {
            tech.foamBotCount--
            return
        }
        if (tech.boomBotCount > 1) {
            tech.boomBotCount--
            return
        }
        if (tech.orbitBotCount > 1) {
            tech.orbitBotCount--
            return
        }
        if (tech.dynamoBotCount > 1) {
            tech.dynamoBotCount--
            return
        }
        if (tech.soundBotCount > 1) {
            tech.soundBotCount--
            return
        }
        if (tech.missileBotCount > 1) {
            tech.missileBotCount--
            return
        }
        if (tech.plasmaBotCount > 1) {
            tech.plasmaBotCount--
            return
        }
    },
    zeroBotCount() { //remove all bots
        tech.dynamoBotCount = 0
        tech.laserBotCount = 0
        tech.nailBotCount = 0
        tech.foamBotCount = 0
        tech.boomBotCount = 0
        tech.orbitBotCount = 0
        tech.missileBotCount = 0
        tech.soundBotCount = 0
    },
    respawnBots() {
        for (let i = 0; i < tech.dynamoBotCount; i++) b.dynamoBot({ x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, false)
        for (let i = 0; i < tech.laserBotCount; i++) b.laserBot({ x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, false)
        for (let i = 0; i < tech.nailBotCount; i++) b.nailBot({ x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, false)
        for (let i = 0; i < tech.foamBotCount; i++) b.foamBot({ x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, false)
        for (let i = 0; i < tech.boomBotCount; i++) b.boomBot({ x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, false)
        for (let i = 0; i < tech.orbitBotCount; i++) b.orbitBot({ x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, false)
        for (let i = 0; i < tech.plasmaBotCount; i++) b.plasmaBot({ x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, false)
        for (let i = 0; i < tech.missileBotCount; i++) b.missileBot({ x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, false)
        for (let i = 0; i < tech.soundBotCount; i++) b.soundBot({ x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, false)
        if (tech.isIntangible && m.isCloak) {
            for (let i = 0; i < bullet.length; i++) {
                if (bullet[i].botType) bullet[i].collisionFilter.mask = cat.map | cat.bullet | cat.mobBullet | cat.mobShield
            }
        }
    },
    randomBot(where = player.position, isKeep = true, isLaser = true) {
        if (Math.random() < 0.5) { //chance to match scrap bot to your upgrade
            if (tech.isNailBotUpgrade) { //check for upgrades first
                b.nailBot(where, isKeep)
                if (isKeep) tech.nailBotCount++;
            } else if (tech.isFoamBotUpgrade) {
                b.foamBot(where, isKeep)
                if (isKeep) tech.foamBotCount++;
            } else if (tech.isBoomBotUpgrade) {
                b.boomBot(where, isKeep)
                if (isKeep) tech.boomBotCount++;
            } else if (tech.isLaserBotUpgrade) {
                b.laserBot(where, isKeep)
                if (isKeep) tech.laserBotCount++;
            } else if (tech.isOrbitBotUpgrade) {
                b.orbitBot(where, isKeep);
                if (isKeep) tech.orbitBotCount++;
            } else if (tech.isDynamoBotUpgrade) {
                b.dynamoBot(where, isKeep)
                if (isKeep) tech.dynamoBotCount++;
            } else if (tech.isSoundBotUpgrade && false) {
                b.soundBot(where, isKeep)
                if (isKeep) tech.soundBotCount++;
            } else if (Math.random() < /*0.142*/ 0.166 && isLaser) { //random
                b.laserBot(where, isKeep)
                if (isKeep) tech.laserBotCount++;
            } else if (Math.random() < 0.166 && false) { //random
                b.soundBot(where, isKeep)
                if (isKeep) tech.soundBotCount++;
            } else if (Math.random() < 0.2) {
                b.dynamoBot(where, isKeep)
                if (isKeep) tech.dynamoBotCount++;
            } else if (Math.random() < 0.25) {
                b.orbitBot(where, isKeep);
                if (isKeep) tech.orbitBotCount++;
            } else if (Math.random() < 0.33) {
                b.nailBot(where, isKeep)
                if (isKeep) tech.nailBotCount++;
            } else if (Math.random() < 0.5) {
                b.foamBot(where, isKeep)
                if (isKeep) tech.foamBotCount++;
            } else {
                b.boomBot(where, isKeep)
                if (isKeep) tech.boomBotCount++;
            }
        } else { //else don't match scrap bot to upgrade
            if (Math.random() < /*0.142*/ 0.166 && isLaser) { //random
                b.laserBot(where, isKeep)
                if (isKeep) tech.laserBotCount++;
            } else if (Math.random() < 0.166 && false) {
                b.soundBot(where, isKeep)
                if (isKeep) tech.soundBotCount++;
            }  else if (Math.random() < 0.2) {
                b.dynamoBot(where, isKeep)
                if (isKeep) tech.dynamoBotCount++;
            } else if (Math.random() < 0.25) {
                b.orbitBot(where, isKeep);
                if (isKeep) tech.orbitBotCount++;
            } else if (Math.random() < 0.33) {
                b.nailBot(where, isKeep)
                if (isKeep) tech.nailBotCount++;
            } else if (Math.random() < 0.5) {
                b.foamBot(where, isKeep)
                if (isKeep) tech.foamBotCount++;
            } else {
                b.boomBot(where, isKeep)
                if (isKeep) tech.boomBotCount++;
            }
        }

    },
    setDynamoBotDelay() {
        //reorder orbital bot positions around a circle
        let total = 0
        for (let i = 0; i < bullet.length; i++) {
            if (bullet[i].botType === 'dynamo') total++
        }
        let count = 0
        for (let i = 0; i < bullet.length; i++) {
            if (bullet[i].botType === 'dynamo') {
                count++
                const step = Math.max(60 - 3 * total, 20)
                bullet[i].followDelay = (step * count) % 600
            }
        }
    },
    dynamoBot(position = player.position, isConsole = true) {
        if (isConsole) simulation.makeTextLog(`<span class='color-var'>b</span>.dynamoBot()`);
        const me = bullet.length;
        bullet[me] = Bodies.polygon(position.x, position.y, 5, 10, {
            isUpgraded: tech.isDynamoBotUpgrade,
            botType: "dynamo",
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0.02,
            spin: 0.07 * (Math.random() < 0.5 ? -1 : 1),
            // isStatic: true,  
            isSensor: true,
            restitution: 0,
            dmg: 0, // 0.14   //damage done in addition to the damage from momentum
            minDmgSpeed: 0,
            endCycle: Infinity,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: 0 //cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield
            },
            beforeDmg() {},
            onEnd() {
                b.setDynamoBotDelay()
            },
            followDelay: 0,
            phase: Math.floor(60 * Math.random()),
            do() {
                // if (Vector.magnitude(Vector.sub(this.position, player.position)) < 150) {
                //     ctx.fillStyle = "rgba(0,0,0,0.06)";
                //     ctx.beginPath();
                //     ctx.arc(this.position.x, this.position.y, 150, 0, 2 * Math.PI);
                //     ctx.fill();
                // }

                //check for damage 
                if (m.immuneCycle < m.cycle && !((m.cycle + this.phase) % 30)) { //twice a second
                    if (Vector.magnitude(Vector.sub(this.position, player.position)) < 250 && m.immuneCycle < m.cycle) { //give energy
                        Matter.Body.setAngularVelocity(this, this.spin)
                        if (this.isUpgraded) {
                            m.energy += 0.115
                            simulation.drawList.push({ //add dmg to draw queue
                                x: this.position.x,
                                y: this.position.y,
                                radius: 10,
                                color: m.fieldMeterColor,
                                time: simulation.drawTime
                            });
                        } else {
                            m.energy += 0.035
                            simulation.drawList.push({ //add dmg to draw queue
                                x: this.position.x,
                                y: this.position.y,
                                radius: 5,
                                color: m.fieldMeterColor,
                                time: simulation.drawTime
                            });
                        }
                    }
                }

                if (!m.isCloak) { //if time dilation isn't active
                    const size = 33
                    q = Matter.Query.region(mob, {
                        min: {
                            x: this.position.x - size,
                            y: this.position.y - size
                        },
                        max: {
                            x: this.position.x + size,
                            y: this.position.y + size
                        }
                    })
                    for (let i = 0; i < q.length; i++) {
                        if (!q[i].isShielded) {
                            Matter.Body.setAngularVelocity(this, this.spin)
                            // mobs.statusStun(q[i], 180)
                            // const dmg = 0.5 * m.dmgScale * (this.isUpgraded ? 2.5 : 1)
                            const dmg = 0.5 * m.dmgScale
                            q[i].damage(dmg);
                            if (q[i].alive) q[i].foundPlayer();
                            if (q[i].damageReduction) {
                                simulation.drawList.push({ //add dmg to draw queue
                                    x: this.position.x,
                                    y: this.position.y,
                                    // radius: 600 * dmg * q[i].damageReduction,
                                    radius: Math.sqrt(2000 * dmg * q[i].damageReduction) + 2,
                                    color: 'rgba(0,0,0,0.4)',
                                    time: simulation.drawTime
                                });
                            }
                        }
                    }
                }
                let history = m.history[(m.cycle - this.followDelay) % 600]
                Matter.Body.setPosition(this, { x: history.position.x, y: history.position.y - history.yOff + 24.2859 }) //bullets move with player
            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world
        b.setDynamoBotDelay()
    },
    nailBot(position = { x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, isConsole = true) {
        if (isConsole) simulation.makeTextLog(`<span class='color-var'>b</span>.nailBot()`);
        const me = bullet.length;
        const dir = m.angle;
        const RADIUS = (12 + 4 * Math.random())
        bullet[me] = Bodies.polygon(position.x, position.y, 4, RADIUS, {
            isUpgraded: tech.isNailBotUpgrade,
            botType: "nail",
            angle: dir,
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0.05,
            restitution: 0.6 * (1 + 0.5 * Math.random()),
            dmg: 0, // 0.14   //damage done in addition to the damage from momentum
            minDmgSpeed: 2,
            // lookFrequency: 56 + Math.floor(17 * Math.random()) - isUpgraded * 20,
            lastLookCycle: simulation.cycle + 60 * Math.random(),
            delay: Math.floor((tech.isNailBotUpgrade ? 21 : 110) * b.fireCDscale),
            acceleration: 0.005 * (1 + 0.5 * Math.random()),
            range: 60 * (1 + 0.3 * Math.random()) + 3 * b.totalBots(),
            endCycle: Infinity,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: b.totalBots() < 50 ? cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield : cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield //if over 50 bots, they no longer collide with each other
            },
            beforeDmg() {},
            onEnd() {},
            do() {
                const distanceToPlayer = Vector.magnitude(Vector.sub(this.position, m.pos))
                if (distanceToPlayer > this.range) { //if far away move towards player
                    this.force = Vector.mult(Vector.normalise(Vector.sub(m.pos, this.position)), this.mass * this.acceleration)
                } else { //close to player
                    Matter.Body.setVelocity(this, Vector.add(Vector.mult(this.velocity, 0.90), Vector.mult(player.velocity, 0.17))); //add player's velocity
                    if (this.lastLookCycle < simulation.cycle && !m.isCloak) {
                        this.lastLookCycle = simulation.cycle + this.delay
                        for (let i = 0, len = mob.length; i < len; i++) {
                            const dist = Vector.magnitudeSquared(Vector.sub(this.position, mob[i].position));
                            if (
                                !mob[i].isBadTarget &&
                                dist < 3000000 &&
                                Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                                Matter.Query.ray(body, this.position, mob[i].position).length === 0 &&
                                !mob[i].isShielded
                            ) {
                                const unit = Vector.normalise(Vector.sub(Vector.add(mob[i].position, Vector.mult(mob[i].velocity, Math.sqrt(dist) / 60)), this.position))
                                if (this.isUpgraded) {
                                    const SPEED = 50
                                    b.nail(this.position, Vector.mult(unit, SPEED))
                                    this.force = Vector.mult(unit, -0.018 * this.mass)
                                } else {
                                    const SPEED = 35
                                    b.nail(this.position, Vector.mult(unit, SPEED))
                                    this.force = Vector.mult(unit, -0.01 * this.mass)
                                }
                                break;
                            }
                        }
                    }
                }
            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    missileBot(position = { x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, isConsole = true) {
        if (isConsole) simulation.makeTextLog(`<span class='color-var'>b</span>.missileBot()`);
        const me = bullet.length;
        bullet[me] = Bodies.rectangle(position.x, position.y, 28, 11, {
            botType: "missile",
            angle: m.angle,
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0.04,
            restitution: 0.7,
            dmg: 0, // 0.14   //damage done in addition to the damage from momentum
            minDmgSpeed: 2,
            lookFrequency: 27 + Math.ceil(6 * Math.random()),
            cd: 0,
            delay: Math.floor(65 * b.fireCDscale),
            range: 70 + 3 * b.totalBots(),
            endCycle: Infinity,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: b.totalBots() < 50 ? (cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield) : (cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield) //if over 50 bots, they no longer collide with each other
            },
            beforeDmg() {},
            onEnd() {},
            do() {
                const distanceToPlayer = Vector.magnitude(Vector.sub(this.position, m.pos))
                if (distanceToPlayer > this.range) { //if far away move towards player
                    this.force = Vector.mult(Vector.normalise(Vector.sub(m.pos, this.position)), this.mass * 0.006)
                } else { //close to player
                    Matter.Body.setVelocity(this, Vector.add(Vector.mult(this.velocity, 0.90), Vector.mult(player.velocity, 0.17))); //add player's velocity
                    if (this.cd < simulation.cycle && !(simulation.cycle % this.lookFrequency) && !m.isCloak) {
                        for (let i = 0, len = mob.length; i < len; i++) {
                            const dist2 = Vector.magnitudeSquared(Vector.sub(this.position, mob[i].position));
                            if (
                                mob[i].alive &&
                                !mob[i].isBadTarget &&
                                dist2 > 40000 &&
                                Matter.Query.ray(map, this.position, mob[i].position).length === 0
                            ) {
                                this.cd = simulation.cycle + this.delay;
                                const angle = Vector.angle(this.position, mob[i].position)
                                Matter.Body.setAngle(this, angle)
                                // Matter.Body.setAngularVelocity(this, 0.025)
                                this.torque += this.inertia * 0.00004 * (Math.round(Math.random()) ? 1 : -1)
                                this.force = Vector.mult(Vector.normalise(Vector.sub(this.position, mob[i].position)), this.mass * 0.02)

                                if (tech.missileCount > 1) {
                                    const countReduction = Math.pow(0.85, tech.missileCount)
                                    const size = 0.9 * Math.sqrt(countReduction)
                                    const direction = {
                                        x: Math.cos(angle),
                                        y: Math.sin(angle)
                                    }
                                    const push = Vector.mult(Vector.perp(direction), 0.015 * countReduction / Math.sqrt(tech.missileCount))
                                    for (let i = 0; i < tech.missileCount; i++) {
                                        setTimeout(() => {
                                            b.missile(this.position, angle, -8, size)
                                            bullet[bullet.length - 1].force.x += push.x * (i - (tech.missileCount - 1) / 2);
                                            bullet[bullet.length - 1].force.y += push.y * (i - (tech.missileCount - 1) / 2);
                                        }, 40 * tech.missileCount * Math.random());
                                    }
                                } else {
                                    b.missile(this.position, angle, -8, 0.9)
                                }
                                break;
                            }
                        }
                    }
                }
            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    foamBot(position = { x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, isConsole = true) {
        if (isConsole) simulation.makeTextLog(`<span class='color-var'>b</span>.foamBot()`);
        const me = bullet.length;
        const dir = m.angle;
        const RADIUS = (10 + 5 * Math.random())
        bullet[me] = Bodies.polygon(position.x, position.y, 6, RADIUS, {
            isUpgraded: tech.isFoamBotUpgrade,
            botType: "foam",
            angle: dir,
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0.05,
            restitution: 0.6 * (1 + 0.5 * Math.random()),
            dmg: 0, // 0.14   //damage done in addition to the damage from momentum
            minDmgSpeed: 2,
            lookFrequency: 60 + Math.floor(17 * Math.random()) - 40 * tech.isFoamBotUpgrade,
            cd: 0,
            delay: Math.floor(105 * b.fireCDscale),
            acceleration: 0.005 * (1 + 0.5 * Math.random()),
            range: 60 * (1 + 0.3 * Math.random()) + 3 * b.totalBots(),
            endCycle: Infinity,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: b.totalBots() < 50 ? cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield : cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield //if over 50 bots, they no longer collide with each other
            },
            beforeDmg() {},
            onEnd() {},
            do() {
                const distanceToPlayer = Vector.magnitude(Vector.sub(this.position, m.pos))
                if (distanceToPlayer > this.range) { //if far away move towards player
                    this.force = Vector.mult(Vector.normalise(Vector.sub(m.pos, this.position)), this.mass * this.acceleration)
                } else { //close to player
                    Matter.Body.setVelocity(this, Vector.add(Vector.mult(this.velocity, 0.90), Vector.mult(player.velocity, 0.17))); //add player's velocity

                    if (this.cd < simulation.cycle && !(simulation.cycle % this.lookFrequency) && !m.isCloak) {
                        let target
                        for (let i = 0, len = mob.length; i < len; i++) {
                            const dist2 = Vector.magnitudeSquared(Vector.sub(this.position, mob[i].position));
                            if (dist2 < 1000000 && !mob[i].isBadTarget && Matter.Query.ray(map, this.position, mob[i].position).length === 0) {
                                this.cd = simulation.cycle + this.delay;
                                target = Vector.add(mob[i].position, Vector.mult(mob[i].velocity, Math.sqrt(dist2) / 60))
                                const radius = 6 + 7 * Math.random()
                                const SPEED = 29 - radius * 0.4; //(input.down ? 32 : 20) - radius * 0.7;
                                const velocity = Vector.mult(Vector.normalise(Vector.sub(target, this.position)), SPEED)
                                b.foam(this.position, velocity, radius + 7 * this.isUpgraded)
                                break;
                            }
                        }
                    }
                }
            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    laserBot(position = { x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, isConsole = true) {
        if (isConsole) simulation.makeTextLog(`<span class='color-var'>b</span>.laserBot()`);
        const me = bullet.length;
        const dir = m.angle;
        const RADIUS = (14 + 6 * Math.random())
        bullet[me] = Bodies.polygon(position.x, position.y, 3, RADIUS, {
            isUpgraded: tech.isLaserBotUpgrade,
            botType: "laser",
            angle: dir,
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0.008 * (1 + 0.3 * Math.random()),
            restitution: 0.5 * (1 + 0.5 * Math.random()),
            acceleration: 0.0015 * (1 + 0.3 * Math.random()),
            playerRange: 140 + Math.floor(30 * Math.random()) + 2 * b.totalBots(),
            offPlayer: {
                x: 0,
                y: 0,
            },
            dmg: 0, //damage done in addition to the damage from momentum
            minDmgSpeed: 2,
            lookFrequency: 40 + Math.floor(7 * Math.random()) - 10 * tech.isLaserBotUpgrade,
            range: (700 + 450 * tech.isLaserBotUpgrade) * (1 + 0.1 * Math.random()),
            drainThreshold: tech.isEnergyHealth ? 0.6 : 0.4,
            drain: (0.5 - 0.43 * tech.isLaserBotUpgrade) * tech.laserFieldDrain * tech.isLaserDiode,
            laserDamage: 0.85 + 0.7 * tech.isLaserBotUpgrade,
            endCycle: Infinity,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: b.totalBots() < 50 ? cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield : cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield //if over 50 bots, they no longer collide with each other
            },
            lockedOn: null,
            beforeDmg() {
                this.lockedOn = null
            },
            onEnd() {},
            do() {
                const playerPos = Vector.add(Vector.add(this.offPlayer, m.pos), Vector.mult(player.velocity, 20)) //also include an offset unique to this bot to keep many bots spread out
                const farAway = Math.max(0, (Vector.magnitude(Vector.sub(this.position, playerPos))) / this.playerRange) //linear bounding well 
                const mag = Math.min(farAway, 4) * this.mass * this.acceleration
                this.force = Vector.mult(Vector.normalise(Vector.sub(playerPos, this.position)), mag)
                //manual friction to not lose rotational velocity
                Matter.Body.setVelocity(this, {
                    x: this.velocity.x * 0.95,
                    y: this.velocity.y * 0.95
                });
                //find targets
                if (!(simulation.cycle % this.lookFrequency)) {
                    this.lockedOn = null;
                    if (!m.isCloak) {
                        let closeDist = this.range;
                        for (let i = 0, len = mob.length; i < len; ++i) {
                            const DIST = Vector.magnitude(Vector.sub(this.vertices[0], mob[i].position));
                            if (DIST - mob[i].radius < closeDist &&
                                !mob[i].isShielded &&
                                (!mob[i].isBadTarget || mob[i].isMobBullet) &&
                                Matter.Query.ray(map, this.vertices[0], mob[i].position).length === 0 &&
                                Matter.Query.ray(body, this.vertices[0], mob[i].position).length === 0) {
                                closeDist = DIST;
                                this.lockedOn = mob[i]
                            }
                        }
                    }
                    //randomize position relative to player
                    if (Math.random() < 0.15) {
                        const range = 110 + 4 * b.totalBots()
                        this.offPlayer = {
                            x: range * (Math.random() - 0.5),
                            y: range * (Math.random() - 0.5) - 20,
                        }
                    }
                }
                //hit target with laser
                if (this.lockedOn && this.lockedOn.alive && m.energy > this.drainThreshold) {
                    m.energy -= this.drain
                    b.laser(this.vertices[0], this.lockedOn.position, m.dmgScale * this.laserDamage * tech.laserDamage, tech.laserReflections, false, 0.4) //tech.laserDamage = 0.16
                    // laser(where = {
                    //     x: m.pos.x + 20 * Math.cos(m.angle),
                    //     y: m.pos.y + 20 * Math.sin(m.angle)
                    // }, whereEnd = {
                    //     x: where.x + 3000 * Math.cos(m.angle),
                    //     y: where.y + 3000 * Math.sin(m.angle)
                    // }, dmg = tech.laserDamage, reflections = tech.laserReflections, isThickBeam = false, push = 1) {
                }
            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world

        //laser mobs that fire with the player
        // if (true) {
        //     bullet[me].do = function() {
        //         if (!(simulation.cycle % this.lookFrequency)) {
        //             if (Math.random() < 0.15) {
        //                 const range = 170 + 3 * b.totalBots()
        //                 this.offPlayer = {
        //                     x: range * (Math.random() - 0.5),
        //                     y: range * (Math.random() - 0.5) - 20,
        //                 }
        //             }
        //         }
        //         const playerPos = Vector.add(Vector.add(this.offPlayer, m.pos), Vector.mult(player.velocity, 20)) //also include an offset unique to this bot to keep many bots spread out
        //         const farAway = Math.max(0, (Vector.magnitude(Vector.sub(this.position, playerPos))) / this.playerRange) //linear bounding well 
        //         const mag = Math.min(farAway, 4) * this.mass * this.acceleration
        //         this.force = Vector.mult(Vector.normalise(Vector.sub(playerPos, this.position)), mag)
        //         //manual friction to not lose rotational velocity
        //         Matter.Body.setVelocity(this, { x: this.velocity.x * 0.95, y: this.velocity.y * 0.95 });
        //         //hit target with laser
        //         if (input.fire && m.energy > this.drain) {
        //             m.energy -= this.drain
        //             const unit = Vector.sub(simulation.mouseInGame, this.vertices[0])
        //             b.laser(this.vertices[0], Vector.mult(unit, 1000), m.dmgScale * this.laserDamage * tech.laserDamage, tech.laserReflections, false, 0.4) //tech.laserDamage = 0.16
        //         }
        //     }
        // }
    },
    boomBot(position = { x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, isConsole = true) {
        if (isConsole) simulation.makeTextLog(`<span class='color-var'>b</span>.boomBot()`);
        const me = bullet.length;
        const dir = m.angle;
        const RADIUS = (7 + 2 * Math.random())
        bullet[me] = Bodies.polygon(position.x, position.y, 4, RADIUS, {
            isUpgraded: tech.isBoomBotUpgrade,
            botType: "boom",
            angle: dir,
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0.05,
            restitution: 1,
            dmg: 0,
            minDmgSpeed: 0,
            lookFrequency: 43 + Math.floor(7 * Math.random()) - 10 * tech.isBoomBotUpgrade,
            acceleration: 0.005 * (1 + 0.5 * Math.random()),
            attackAcceleration: 0.012 + 0.005 * tech.isBoomBotUpgrade,
            range: 500 * (1 + 0.1 * Math.random()) + 320 * tech.isBoomBotUpgrade,
            endCycle: Infinity,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: b.totalBots() < 50 ? cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield : cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield //if over 50 bots, they no longer collide with each other
            },
            lockedOn: null,
            explode: 0,
            beforeDmg() {
                if (this.lockedOn) {
                    const explosionRadius = Math.min(136 + 200 * this.isUpgraded, Vector.magnitude(Vector.sub(this.position, m.pos)) - 30)
                    if (explosionRadius > 60) {
                        this.explode = explosionRadius
                        // 
                        //push away from player, because normal explosion knock doesn't do much
                        // const sub = Vector.sub(this.lockedOn.position, m.pos)
                        // mag = Math.min(35, 20 / Math.sqrt(this.lockedOn.mass))
                        // Matter.Body.setVelocity(this.lockedOn, Vector.mult(Vector.normalise(sub), mag))
                    }
                    this.lockedOn = null //lose target so bot returns to player
                }
            },
            onEnd() {},
            do() {
                const distanceToPlayer = Vector.magnitude(Vector.sub(this.position, player.position))
                if (distanceToPlayer > 100) { //if far away move towards player
                    if (this.explode) {
                        if (tech.isImmuneExplosion && m.energy > 1.43) {
                            b.explosion(this.position, this.explode);
                        } else {
                            b.explosion(this.position, Math.max(0, Math.min(this.explode, (distanceToPlayer - 70) / b.explosionRange())));
                        }
                        this.explode = 0;
                    }
                    this.force = Vector.mult(Vector.normalise(Vector.sub(player.position, this.position)), this.mass * this.acceleration)
                } else if (distanceToPlayer < 250) { //close to player
                    Matter.Body.setVelocity(this, Vector.add(Vector.mult(this.velocity, 0.90), Vector.mult(player.velocity, 0.17))); //add player's velocity
                    //find targets
                    if (!(simulation.cycle % this.lookFrequency) && !m.isCloak) {
                        this.lockedOn = null;
                        let closeDist = this.range;
                        for (let i = 0, len = mob.length; i < len; ++i) {
                            const DIST = Vector.magnitude(Vector.sub(this.position, mob[i].position)) - mob[i].radius;
                            if (DIST < closeDist &&
                                !mob[i].isBadTarget &&
                                Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                                Matter.Query.ray(body, this.position, mob[i].position).length === 0) {
                                closeDist = DIST;
                                this.lockedOn = mob[i]
                            }
                        }
                    }
                }
                //punch target
                if (this.lockedOn && this.lockedOn.alive && !m.isCloak) {
                    const DIST = Vector.magnitude(Vector.sub(this.vertices[0], this.lockedOn.position));
                    if (DIST - this.lockedOn.radius < this.range &&
                        Matter.Query.ray(map, this.position, this.lockedOn.position).length === 0) {
                        //move towards the target
                        this.force = Vector.add(this.force, Vector.mult(Vector.normalise(Vector.sub(this.lockedOn.position, this.position)), this.attackAcceleration * this.mass))
                    }
                }
            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    plasmaBot(position = { x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, isConsole = true) {
        if (isConsole) simulation.makeTextLog(`<span class='color-var'>b</span>.plasmaBot()`);
        const me = bullet.length;
        const dir = m.angle;
        const RADIUS = 21
        bullet[me] = Bodies.polygon(position.x, position.y, 5, RADIUS, {
            botType: "plasma",
            angle: dir,
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0.05,
            restitution: 1,
            dmg: 0, // 0.14   //damage done in addition to the damage from momentum
            minDmgSpeed: 2,
            lookFrequency: 25,
            cd: 0,
            acceleration: 0.009,
            endCycle: Infinity,
            drainThreshold: tech.isEnergyHealth ? 0.5 : 0.05,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: b.totalBots() < 50 ? cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield : cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield //if over 50 bots, they no longer collide with each other
            },
            lockedOn: null,
            beforeDmg() {
                this.lockedOn = null
            },
            onEnd() {},
            do() {
                const distanceToPlayer = Vector.magnitude(Vector.sub(this.position, m.pos))
                if (distanceToPlayer > 150) this.force = Vector.mult(Vector.normalise(Vector.sub(m.pos, this.position)), this.mass * this.acceleration) //if far away move towards player
                Matter.Body.setVelocity(this, Vector.add(Vector.mult(this.velocity, 0.90), Vector.mult(player.velocity, 0.17))); //add player's velocity

                if (!(simulation.cycle % this.lookFrequency)) { //find closest
                    this.lockedOn = null;
                    if (!m.isCloak) {
                        let closeDist = tech.isPlasmaRange * 1000;
                        for (let i = 0, len = mob.length; i < len; ++i) {
                            const DIST = Vector.magnitude(Vector.sub(this.position, mob[i].position)) - mob[i].radius;
                            if (DIST < closeDist &&
                                (!mob[i].isBadTarget || mob[i].isMobBullet) &&
                                Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                                Matter.Query.ray(body, this.position, mob[i].position).length === 0) {
                                closeDist = DIST;
                                this.lockedOn = mob[i]
                            }
                        }
                    }
                }
                //fire plasma at target
                if (this.lockedOn && this.lockedOn.alive && m.fieldCDcycle < m.cycle) {
                    const sub = Vector.sub(this.lockedOn.position, this.position)
                    const DIST = Vector.magnitude(sub);
                    const unit = Vector.normalise(sub)
                    if (DIST < tech.isPlasmaRange * 450 && m.energy > this.drainThreshold) {
                        m.energy -= 0.00035 + m.fieldRegen //0.004; //normal plasma field is 0.00008 + m.fieldRegen = 0.00108
                        // if (m.energy < 0) {
                        //     m.fieldCDcycle = m.cycle + 120;
                        //     m.energy = 0;
                        // }
                        //calculate laser collision
                        let best;
                        let range = tech.isPlasmaRange * (120 + 300 * Math.sqrt(Math.random()))
                        const path = [{
                                x: this.position.x,
                                y: this.position.y
                            },
                            {
                                x: this.position.x + range * unit.x,
                                y: this.position.y + range * unit.y
                            }
                        ];
                        const vertexCollision = function(v1, v1End, domain) {
                            for (let i = 0; i < domain.length; ++i) {
                                let vertices = domain[i].vertices;
                                const len = vertices.length - 1;
                                for (let j = 0; j < len; j++) {
                                    results = simulation.checkLineIntersection(v1, v1End, vertices[j], vertices[j + 1]);
                                    if (results.onLine1 && results.onLine2) {
                                        const dx = v1.x - results.x;
                                        const dy = v1.y - results.y;
                                        const dist2 = dx * dx + dy * dy;
                                        if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
                                            best = {
                                                x: results.x,
                                                y: results.y,
                                                dist2: dist2,
                                                who: domain[i],
                                                v1: vertices[j],
                                                v2: vertices[j + 1]
                                            };
                                        }
                                    }
                                }
                                results = simulation.checkLineIntersection(v1, v1End, vertices[0], vertices[len]);
                                if (results.onLine1 && results.onLine2) {
                                    const dx = v1.x - results.x;
                                    const dy = v1.y - results.y;
                                    const dist2 = dx * dx + dy * dy;
                                    if (dist2 < best.dist2 && (!domain[i].mob || domain[i].alive)) {
                                        best = {
                                            x: results.x,
                                            y: results.y,
                                            dist2: dist2,
                                            who: domain[i],
                                            v1: vertices[0],
                                            v2: vertices[len]
                                        };
                                    }
                                }
                            }
                        };
                        //check for collisions
                        best = {
                            x: null,
                            y: null,
                            dist2: Infinity,
                            who: null,
                            v1: null,
                            v2: null
                        };
                        vertexCollision(path[0], path[1], mob);
                        vertexCollision(path[0], path[1], map);
                        vertexCollision(path[0], path[1], body);
                        if (best.dist2 != Infinity) { //if hitting something
                            path[path.length - 1] = {
                                x: best.x,
                                y: best.y
                            };
                            if (best.who.alive) {
                                const dmg = 0.6 * m.dmgScale; //********** SCALE DAMAGE HERE *********************
                                best.who.damage(dmg);
                                best.who.locatePlayer();
                                //push mobs away
                                const force = Vector.mult(Vector.normalise(Vector.sub(m.pos, path[1])), -0.01 * Math.min(5, best.who.mass))
                                Matter.Body.applyForce(best.who, path[1], force)
                                if (best.who.speed > 3) {
                                    Matter.Body.setVelocity(best.who, { //friction
                                        x: best.who.velocity.x * 0.7,
                                        y: best.who.velocity.y * 0.7
                                    });
                                }
                                //draw mob damage circle
                                if (best.who.damageReduction) {
                                    simulation.drawList.push({
                                        x: path[1].x,
                                        y: path[1].y,
                                        // radius: Math.sqrt(dmg) * 50 * mob[k].damageReduction,
                                        // radius: 600 * dmg * best.who.damageReduction,
                                        radius: Math.sqrt(2000 * dmg * best.who.damageReduction) + 2,
                                        color: "rgba(255,0,255,0.2)",
                                        time: simulation.drawTime * 4
                                    });
                                }
                            } else if (!best.who.isStatic) {
                                //push blocks away
                                const force = Vector.mult(Vector.normalise(Vector.sub(m.pos, path[1])), -0.007 * Math.sqrt(Math.sqrt(best.who.mass)))
                                Matter.Body.applyForce(best.who, path[1], force)
                            }
                        }
                        //draw blowtorch laser beam
                        ctx.beginPath();
                        ctx.moveTo(path[0].x, path[0].y);
                        ctx.lineTo(path[1].x, path[1].y);
                        ctx.strokeStyle = "rgba(255,0,255,0.1)"
                        ctx.lineWidth = 14
                        ctx.stroke();
                        ctx.strokeStyle = "#f0f";
                        ctx.lineWidth = 2
                        ctx.stroke();
                        //draw electricity
                        let x = this.position.x + 20 * unit.x;
                        let y = this.position.y + 20 * unit.y;
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        const step = Vector.magnitude(Vector.sub(path[0], path[1])) / 5
                        for (let i = 0; i < 4; i++) {
                            x += step * (unit.x + 1.5 * (Math.random() - 0.5))
                            y += step * (unit.y + 1.5 * (Math.random() - 0.5))
                            ctx.lineTo(x, y);
                        }
                        ctx.lineWidth = 2 * Math.random();
                        ctx.stroke();
                    }
                }
            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    orbitBot(position = player.position, isConsole = true) {
        if (isConsole) simulation.makeTextLog(`<span class='color-var'>b</span>.orbitBot()`);
        const me = bullet.length;
        bullet[me] = Bodies.polygon(position.x, position.y, 9, 12, {
            isUpgraded: tech.isOrbitBotUpgrade,
            botType: "orbit",
            friction: 0,
            frictionStatic: 0,
            frictionAir: 1,
            isStatic: true,
            isSensor: true,
            restitution: 0,
            dmg: 0, // 0.14   //damage done in addition to the damage from momentum
            minDmgSpeed: 0,
            endCycle: Infinity,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: 0 //cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield
            },
            beforeDmg() {},
            onEnd() {
                //reorder orbital bot positions around a circle
                let totalOrbitalBots = 0
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType === 'orbit' && bullet[i] !== this) totalOrbitalBots++
                }
                let index = 0
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType === 'orbit' && bullet[i] !== this) {
                        bullet[i].phase = (index / totalOrbitalBots) * 2 * Math.PI
                        index++
                    }
                }
            },
            range: 190 + 120 * tech.isOrbitBotUpgrade, //range is set in bot upgrade too!
            orbitalSpeed: 0,
            phase: 2 * Math.PI * Math.random(),
            do() {
                if (!m.isCloak) { //if time dilation isn't active
                    const size = 33
                    q = Matter.Query.region(mob, {
                        min: { x: this.position.x - size, y: this.position.y - size },
                        max: { x: this.position.x + size, y: this.position.y + size }
                    })
                    for (let i = 0; i < q.length; i++) {
                        if (!q[i].isShielded) {
                            mobs.statusStun(q[i], 180)
                            const dmg = 0.4 * m.dmgScale * (this.isUpgraded ? 4 : 1) * (tech.isCrit ? 4 : 1)
                            q[i].damage(dmg);
                            if (q[i].alive) q[i].foundPlayer();
                            if (q[i].damageReduction) {
                                simulation.drawList.push({ //add dmg to draw queue
                                    x: this.position.x,
                                    y: this.position.y,
                                    // radius: 600 * dmg * q[i].damageReduction,
                                    radius: Math.sqrt(2000 * dmg * q[i].damageReduction) + 2,
                                    color: 'rgba(0,0,0,0.4)',
                                    time: simulation.drawTime
                                });
                            }
                        }
                    }
                }
                //orbit player
                const time = simulation.cycle * this.orbitalSpeed + this.phase
                const orbit = {
                    x: Math.cos(time),
                    y: Math.sin(time) //*1.1
                }
                Matter.Body.setPosition(this, Vector.add(m.pos, Vector.mult(orbit, this.range))) //bullets move with player
            }
        })
        // bullet[me].orbitalSpeed = Math.sqrt(0.7 / bullet[me].range)
        bullet[me].orbitalSpeed = Math.sqrt(0.25 / bullet[me].range) //also set in bot upgrade too!
        // bullet[me].phase = (index / tech.orbitBotCount) * 2 * Math.PI
        Composite.add(engine.world, bullet[me]); //add bullet to world

        //reorder orbital bot positions around a circle
        let totalOrbitalBots = 0
        for (let i = 0; i < bullet.length; i++) {
            if (bullet[i].botType === 'orbit') totalOrbitalBots++
        }
        let index = 0
        for (let i = 0; i < bullet.length; i++) {
            if (bullet[i].botType === 'orbit') {
                bullet[i].phase = (index / totalOrbitalBots) * 2 * Math.PI
                index++
            }
        }
    },
    soundBot(position = { x: player.position.x + 50 * (Math.random() - 0.5), y: player.position.y + 50 * (Math.random() - 0.5) }, isKeep = true) {
        const me = bullet.length;
        const dir = m.angle;
        bullet[me] = Bodies.rectangle(position.x, position.y, 12, 30, {
            isUpgraded: tech.isSoundBotUpgrade,
            botType: "sound",
            angle: dir,
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0.05,
            restitution: 0.6 * (1 + 0.5 * Math.random()),
            dmg: 0, // 0.14   //damage done in addition to the damage from momentum
            minDmgSpeed: 2,
            lookFrequency: 17 + Math.floor(7 * Math.random()) - 3 * tech.isSoundBotUpgrade,
            cd: 0,
            fireCount: 0,
            fireLimit: 5 - isKeep,
            delay: Math.floor(140),// + 30 - 20 * tech.isFoamBotUpgrade,//20 + Math.floor(85 * b.fireCDscale) - 20 * tech.isFoamBotUpgrade,
            acceleration: (isKeep ? 0.005 : 0.001) * (1 + 0.5 * Math.random()),
            range: 60 * (1 + 0.3 * Math.random()) + 3 * b.totalBots() + !isKeep * 100, //how far from the player the bot will move
            endCycle: Infinity,
            classType: "bullet",
            collisionFilter: {
                category: cat.bullet,
                mask: b.totalBots() < 50 ? cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet | cat.mobShield : cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield //if over 50 bots, they no longer collide with each other
            },
            beforeDmg() { },
            onEnd() { },
            fireTarget: { x: 0, y: 0 },
            waves: [],
            phononWaveCD: 0,
            addWave(where, angle) {
                const halfArc = 0.2 * (tech.isBulletTeleport ? 0.66 + (Math.random() - 0.5) : 1) + 0.04 * tech.isSoundBotUpgrade //6.28 is a full circle, but these arcs needs to stay small because we are using small angle linear approximation, for collisions
                this.waves.push({
                    position: where,
                    angle: angle - halfArc, //used in drawing ctx.arc
                    unit1: { x: Math.cos(angle - halfArc), y: Math.sin(angle - halfArc) }, //used for collision
                    unit2: { x: Math.cos(angle + halfArc), y: Math.sin(angle + halfArc) }, //used for collision
                    arc: halfArc * 2,
                    radius: 25,
                    resonanceCount: 0,
                    dmg: (tech.isUpgraded ? 9 : 1.5) * m.dmgScale * tech.wavePacketDamage * tech.waveBeamDamage * (tech.isBulletTeleport ? 1.5 : 1),
                })
            },
            fire() {
                if (!(simulation.cycle % 6)) {
                    this.fireCount++
                    if (this.fireCount > this.fireLimit) {
                        this.fireCount = 0
                        this.cd = simulation.cycle + this.delay;
                    }
                    this.addWave({ x: this.position.x, y: this.position.y }, Math.atan2(this.fireTarget.y - this.position.y, this.fireTarget.x - this.position.x) + tech.isBulletTeleport * 0.3 * (Math.random() - 0.5)) //add wave to waves array
                    //face target
                    Matter.Body.setAngle(this, Vector.angle(this.position, this.fireTarget));
                }
            },
            do() {
                if (this.fireCount === 0) { //passive mode: look for targets and following player
                    const distanceToPlayer = Vector.magnitude(Vector.sub(this.position, m.pos))
                    if (distanceToPlayer > this.range) { //if far away move towards player
                        this.force = Vector.mult(Vector.normalise(Vector.sub(m.pos, this.position)), this.mass * this.acceleration)
                    } else { //close to player
                        Matter.Body.setVelocity(this, Vector.add(Vector.mult(this.velocity, 0.90), Vector.mult(player.velocity, 0.17))); //add player's velocity
                    }
                    if (this.cd < simulation.cycle && !m.isCloak && !(simulation.cycle % this.lookFrequency)) {
                        for (let i = 0, len = mob.length; i < len; i++) {
                            const dist2 = Vector.magnitudeSquared(Vector.sub(this.position, mob[i].position));
                            if (dist2 < 1300000 && !mob[i].isBadTarget && (Matter.Query.ray(map, this.position, mob[i].position).length === 0 || dist2 < 300000) && !mob[i].isInvulnerable) {
                                this.fireTarget = Vector.add(mob[i].position, Vector.mult(mob[i].velocity, Math.sqrt(dist2) / 60)) //set target to where the mob will be in 1 second
                                this.fire()
                                break;
                            }
                        }
                    }
                } else { //fire mode: quickly fire at targets and doesn't follow player
                    this.fire()
                }
                if (!m.isBodiesAsleep) { //update current waves
                    ctx.strokeStyle = "rgba(0,0,0,0.6)" //"000";
                    ctx.lineWidth = 2 * tech.wavePacketDamage
                    ctx.beginPath();
                    const end = 1200 * Math.sqrt(tech.bulletsLastLonger)
                    //this does less damage than the player phonon waves  2.3 -> 2
                    for (let i = this.waves.length - 1; i > -1; i--) {
                        const v1 = Vector.add(this.waves[i].position, Vector.mult(this.waves[i].unit1, this.waves[i].radius))
                        const v2 = Vector.add(this.waves[i].position, Vector.mult(this.waves[i].unit2, this.waves[i].radius))
                        //draw wave
                        ctx.moveTo(v1.x, v1.y)
                        ctx.arc(this.waves[i].position.x, this.waves[i].position.y, this.waves[i].radius, this.waves[i].angle, this.waves[i].angle + this.waves[i].arc);
                        //using small angle linear approximation of circle arc, this will not work if the arc gets large   // https://stackoverflow.com/questions/13652518/efficiently-find-points-inside-a-circle-sector
                        let hits = Matter.Query.ray(mob, v1, v2, 50)
                        for (let j = 0; j < hits.length; j++) {
                            const who = hits[j].body
                            if (!who.isShielded) {
                                who.force.x += 0.01 * (Math.random() - 0.5) * who.mass
                                who.force.y += 0.01 * (Math.random() - 0.5) * who.mass
                                Matter.Body.setVelocity(who, { x: who.velocity.x * 0.98, y: who.velocity.y * 0.98 });
                                let vertices = who.vertices;
                                const vibe = 50 + who.radius * 0.15
                                ctx.moveTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                                for (let j = 1; j < vertices.length; j++) ctx.lineTo(vertices[j].x + vibe * (Math.random() - 0.5), vertices[j].y + vibe * (Math.random() - 0.5));
                                ctx.lineTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                                who.locatePlayer();
                                who.damage(this.waves[i].dmg / Math.pow(who.radius, 0.33));


                                if (tech.isPhononWave && this.phononWaveCD < m.cycle) {
                                    this.phononWaveCD = m.cycle + 10 * (1 + this.waves[i].resonanceCount)
                                    let closestMob, dist
                                    let range = end - 30 * this.waves[i].resonanceCount
                                    for (let i = 0, len = mob.length; i < len; i++) {
                                        if (who !== mob[i] && !mob[i].isBadTarget && !mob[i].isInvulnerable) {
                                            dist = Vector.magnitude(Vector.sub(who.position, mob[i].position));
                                            if (dist < range) {
                                                closestMob = mob[i]
                                                range = dist
                                            }
                                        }
                                    }
                                    if (closestMob) { //add wave to waves array
                                        this.addWave(who.position, Math.atan2(closestMob.position.y - who.position.y, closestMob.position.x - who.position.x) + tech.isBulletTeleport * 0.3 * (Math.random() - 0.5))
                                    } else {
                                        this.addWave(who.position, Math.random() * Math.PI)
                                    }
                                    this.waves[this.waves.length - 1].resonanceCount = this.waves[i].resonanceCount + 1
                                    break
                                }
                            }
                        }

                        hits = Matter.Query.ray(body, v1, v2, 50) //Matter.Query.ray(bodies, startPoint, endPoint, [rayWidth])
                        for (let j = 0, len = Math.min(30, hits.length); j < len; j++) {
                            const who = hits[j].body
                            //make them shake around
                            who.force.x += 0.005 * (Math.random() - 0.5) * who.mass
                            who.force.y += (0.005 * (Math.random() - 0.5) - simulation.g * 0.1) * who.mass //remove force of gravity
                            let vertices = who.vertices;
                            const vibe = 25
                            ctx.moveTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                            for (let j = 1; j < vertices.length; j++) {
                                ctx.lineTo(vertices[j].x + vibe * (Math.random() - 0.5), vertices[j].y + vibe * (Math.random() - 0.5));
                            }
                            ctx.lineTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));

                            if (tech.isPhononBlock && !who.isNotHoldable && who.speed < 5 && who.angularSpeed < 0.1) {
                                if (Math.random() < 0.5) b.targetedBlock(who, 50 - Math.min(25, who.mass * 3)) //    targetedBlock(who, speed = 50 - Math.min(20, who.mass * 2), range = 1600) {
                                // Matter.Body.setAngularVelocity(who, (0.25 + 0.12 * Math.random()) * (Math.random() < 0.5 ? -1 : 1));
                                who.torque += who.inertia * 0.001 * (Math.random() - 0.5)
                            }
                        }

                        this.waves[i].radius += tech.waveBeamSpeed * 2
                        if (this.waves[i].radius > end - 30 * this.waves[i].resonanceCount) {
                            this.waves.splice(i, 1) //end
                        }
                    }
                    ctx.stroke();
                }



            }
        })
        Composite.add(engine.world, bullet[me]); //add bullet to world
    },
    // **************************************************************************************************
    // **************************************************************************************************
    // ********************************         Guns        *********************************************
    // **************************************************************************************************
    // **************************************************************************************************
    guns: [{
            name: "nail gun",
            description: "use compressed air to fire a stream of <strong>nails</strong><br><strong><em>delay</em></strong> after firing <strong>decreases</strong> as you shoot",
            ammo: 0,
            ammoPack: 45,
            defaultAmmoPack: 45,
            recordedAmmo: 0,
            have: false,
            nextFireCycle: 0, //use to remember how longs its been since last fire, used to reset count
            startingHoldCycle: 0,
            chooseFireMethod() { //set in simulation.startGame
                if (tech.nailRecoil) {
                    if (tech.isRivets) {
                        this.fire = this.fireRecoilRivets
                    } else {
                        this.fire = this.fireRecoilNails
                    }
                } else if (tech.isRivets) {
                    this.fire = this.fireRivets
                } else if (tech.isDarts) {
                    this.fire = this.fireDarts
                } else if (tech.isNeedles) {
                    this.fire = this.fireNeedles
                } else if (tech.nailInstantFireRate) {
                    this.fire = this.fireInstantFireRate
                    // } else if (tech.nailFireRate) {
                    // this.fire = this.fireNailFireRate
                } else {
                    this.fire = this.fireNormal
                }
            },
            do() {},
            fire() {},
            // for (let i = 0; i < 5; i++) {
            //     b.dart(where, m.angle + 0.1 * i)
            //     b.dart(where, m.angle - 0.1 * i)
            // }
            fireDarts() {
                const where = {
                    x: m.pos.x + 30 * Math.cos(m.angle),
                    y: m.pos.y + 30 * Math.sin(m.angle)
                }
                m.fireCDcycle = m.cycle + 10 * b.fireCDscale; // cool down
                b.dart(where, m.angle) //+ 0.6 * (Math.random() - 0.5)
                // const spread = 0.5
                // b.dart(where, m.angle + spread)
                // b.dart(where, m.angle)
                // b.dart(where, m.angle - spread)
            },
            fireRecoilNails() {
                if (this.nextFireCycle + 1 < m.cycle) this.startingHoldCycle = m.cycle //reset if not constantly firing
                const CD = Math.max(11 - 0.08 * (m.cycle - this.startingHoldCycle), 1) //CD scales with cycles fire is held down
                this.nextFireCycle = m.cycle + CD * b.fireCDscale //predict next fire cycle if the fire button is held down

                m.fireCDcycle = m.cycle + Math.floor(CD * b.fireCDscale); // cool down
                this.baseFire(m.angle + (Math.random() - 0.5) * (input.down ? 0.1 : 0.13) / CD, 45 + 6 * Math.random())
                //very complex recoil system
                if (m.onGround) {
                    if (input.down) {
                        const KNOCK = 0.006
                        player.force.x -= KNOCK * Math.cos(m.angle)
                        player.force.y -= KNOCK * Math.sin(m.angle) //reduce knock back in vertical direction to stop super jumps
                        Matter.Body.setVelocity(player, {
                            x: player.velocity.x * 0.5,
                            y: player.velocity.y * 0.5
                        });
                    } else {
                        const KNOCK = 0.03
                        player.force.x -= KNOCK * Math.cos(m.angle)
                        player.force.y -= KNOCK * Math.sin(m.angle) //reduce knock back in vertical direction to stop super jumps
                        Matter.Body.setVelocity(player, {
                            x: player.velocity.x * 0.8,
                            y: player.velocity.y * 0.8
                        });
                    }
                } else {
                    player.force.x -= 0.06 * Math.cos(m.angle) * Math.min(1, 3 / (0.1 + Math.abs(player.velocity.x)))
                    player.force.y -= 0.006 * Math.sin(m.angle) //reduce knock back in vertical direction to stop super jumps
                }
            },
            fireNormal() {
                if (this.nextFireCycle + 1 < m.cycle) this.startingHoldCycle = m.cycle //reset if not constantly firing
                const CD = Math.max(11 - 0.06 * (m.cycle - this.startingHoldCycle), 2) //CD scales with cycles fire is held down
                this.nextFireCycle = m.cycle + CD * b.fireCDscale //predict next fire cycle if the fire button is held down

                m.fireCDcycle = m.cycle + Math.floor(CD * b.fireCDscale); // cool down
                this.baseFire(m.angle + (Math.random() - 0.5) * (Math.random() - 0.5) * (input.down ? 1.35 : 3.2) / CD)
            },
            fireNeedles() {
                if (input.down) {
                    m.fireCDcycle = m.cycle + 38 * b.fireCDscale; // cool down
                    b.needle()

                    function cycle() {
                        if (simulation.paused || m.isBodiesAsleep) { requestAnimationFrame(cycle) } else {
                            count++
                            if (count % 2) b.needle()
                            if (count < 5 && m.alive) requestAnimationFrame(cycle);
                        }
                    }
                    let count = -1
                    requestAnimationFrame(cycle);
                } else {
                    m.fireCDcycle = m.cycle + 28 * b.fireCDscale; // cool down
                    b.needle()

                    function cycle() {
                        if (simulation.paused || m.isBodiesAsleep) { requestAnimationFrame(cycle) } else {
                            count++
                            if (count % 2) b.needle()
                            if (count < 3 && m.alive) requestAnimationFrame(cycle);
                        }
                    }
                    let count = -1
                    requestAnimationFrame(cycle);
                }
            },
            fireRivets() {
                m.fireCDcycle = m.cycle + Math.floor((input.down ? 25 : 17) * b.fireCDscale); // cool down

                const me = bullet.length;
                const size = tech.bulletSize * 8
                bullet[me] = Bodies.rectangle(m.pos.x + 35 * Math.cos(m.angle), m.pos.y + 35 * Math.sin(m.angle), 5 * size, size, b.fireAttributes(m.angle));
                bullet[me].dmg = tech.isNailRadiation ? 0 : 2.75
                Matter.Body.setDensity(bullet[me], 0.002);
                Composite.add(engine.world, bullet[me]); //add bullet to world
                const SPEED = input.down ? 55 : 44
                Matter.Body.setVelocity(bullet[me], {
                    x: SPEED * Math.cos(m.angle),
                    y: SPEED * Math.sin(m.angle)
                });
                bullet[me].endCycle = simulation.cycle + 180

                bullet[me].beforeDmg = function(who) { //beforeDmg is rewritten with ice crystal tech
                    if (tech.isIncendiary) {
                        this.endCycle = 0; //bullet ends cycle after hitting a mob and triggers explosion
                        b.explosion(this.position, 100 + (Math.random() - 0.5) * 20); //makes bullet do explosive damage at end
                    }
                    if (tech.isNailCrit && !who.shield && Vector.dot(Vector.normalise(Vector.sub(who.position, this.position)), Vector.normalise(this.velocity)) > 0.94) {
                        b.explosion(this.position, 300 + 30 * Math.random()); //makes bullet do explosive damage at end
                    }
                    if (tech.isNailRadiation) mobs.statusDoT(who, 7 * (tech.isFastRadiation ? 0.7 : 0.24), tech.isSlowRadiation ? 360 : (tech.isFastRadiation ? 60 : 180)) // one tick every 30 cycles
                    if (this.speed > 4 && tech.fragments) {
                        b.targetedNail(this.position, 1.25 * tech.fragments * tech.bulletSize)
                        this.endCycle = 0 //triggers despawn
                    }
                };

                bullet[me].minDmgSpeed = 10
                bullet[me].frictionAir = 0.006;
                bullet[me].do = function() {
                    this.force.y += this.mass * 0.0008

                    //rotates bullet to face current velocity?
                    if (this.speed > 7) {
                        const facing = {
                            x: Math.cos(this.angle),
                            y: Math.sin(this.angle)
                        }
                        const mag = 0.002 * this.mass
                        if (Vector.cross(Vector.normalise(this.velocity), facing) < 0) {
                            this.torque += mag
                        } else {
                            this.torque -= mag
                        }
                    }
                };
                b.muzzleFlash(30);
                //very complex recoil system
                if (m.onGround) {
                    if (input.down) {
                        const KNOCK = 0.01
                        player.force.x -= KNOCK * Math.cos(m.angle)
                        player.force.y -= KNOCK * Math.sin(m.angle) //reduce knock back in vertical direction to stop super jumps
                    } else {
                        const KNOCK = 0.02
                        player.force.x -= KNOCK * Math.cos(m.angle)
                        player.force.y -= KNOCK * Math.sin(m.angle) //reduce knock back in vertical direction to stop super jumps
                    }
                } else {
                    const KNOCK = 0.01
                    player.force.x -= KNOCK * Math.cos(m.angle)
                    player.force.y -= KNOCK * Math.sin(m.angle) * 0.5 //reduce knock back in vertical direction to stop super jumps    
                }
            },
            fireRecoilRivets() {
                // m.fireCDcycle = m.cycle + Math.floor((input.down ? 25 : 17) * b.fireCDscale); // cool down
                if (this.nextFireCycle + 1 < m.cycle) this.startingHoldCycle = m.cycle //reset if not constantly firing
                const CD = Math.max(25 - 0.14 * (m.cycle - this.startingHoldCycle), 6) //CD scales with cycles fire is held down
                this.nextFireCycle = m.cycle + CD * b.fireCDscale //predict next fire cycle if the fire button is held down
                m.fireCDcycle = m.cycle + Math.floor(CD * b.fireCDscale); // cool down

                const me = bullet.length;
                const size = tech.bulletSize * 8
                bullet[me] = Bodies.rectangle(m.pos.x + 35 * Math.cos(m.angle), m.pos.y + 35 * Math.sin(m.angle), 5 * size, size, b.fireAttributes(m.angle));
                bullet[me].dmg = tech.isNailRadiation ? 0 : 2.75
                Matter.Body.setDensity(bullet[me], 0.002);
                Composite.add(engine.world, bullet[me]); //add bullet to world
                const SPEED = input.down ? 60 : 50
                Matter.Body.setVelocity(bullet[me], {
                    x: SPEED * Math.cos(m.angle),
                    y: SPEED * Math.sin(m.angle)
                });
                bullet[me].endCycle = simulation.cycle + 180
                bullet[me].beforeDmg = function(who) { //beforeDmg is rewritten with ice crystal tech
                    if (tech.isIncendiary) {
                        this.endCycle = 0; //bullet ends cycle after hitting a mob and triggers explosion
                        b.explosion(this.position, 100 + (Math.random() - 0.5) * 20); //makes bullet do explosive damage at end
                    }
                    if (tech.isNailCrit && !who.shield && Vector.dot(Vector.normalise(Vector.sub(who.position, this.position)), Vector.normalise(this.velocity)) > 0.94) {
                        b.explosion(this.position, 300 + 30 * Math.random()); //makes bullet do explosive damage at end
                    }
                    if (tech.isNailRadiation) mobs.statusDoT(who, 7 * (tech.isFastRadiation ? 0.7 : 0.24), tech.isSlowRadiation ? 360 : (tech.isFastRadiation ? 60 : 180)) // one tick every 30 cycles
                    if (this.speed > 4 && tech.fragments) {
                        b.targetedNail(this.position, 1.25 * tech.fragments * tech.bulletSize)
                        this.endCycle = 0 //triggers despawn
                    }
                };

                bullet[me].minDmgSpeed = 10
                bullet[me].frictionAir = 0.006;
                bullet[me].do = function() {
                    this.force.y += this.mass * 0.0008

                    //rotates bullet to face current velocity?
                    if (this.speed > 7) {
                        const facing = {
                            x: Math.cos(this.angle),
                            y: Math.sin(this.angle)
                        }
                        const mag = 0.002 * this.mass
                        if (Vector.cross(Vector.normalise(this.velocity), facing) < 0) {
                            this.torque += mag
                        } else {
                            this.torque -= mag
                        }
                    }
                };
                b.muzzleFlash(30);
                //very complex recoil system
                if (m.onGround) {
                    if (input.down) {
                        const KNOCK = 0.03
                        player.force.x -= KNOCK * Math.cos(m.angle)
                        player.force.y -= KNOCK * Math.sin(m.angle) //reduce knock back in vertical direction to stop super jumps
                        Matter.Body.setVelocity(player, {
                            x: player.velocity.x * 0.4,
                            y: player.velocity.y * 0.4
                        });
                    } else {
                        const KNOCK = 0.1
                        player.force.x -= KNOCK * Math.cos(m.angle)
                        player.force.y -= KNOCK * Math.sin(m.angle) //reduce knock back in vertical direction to stop super jumps
                        Matter.Body.setVelocity(player, {
                            x: player.velocity.x * 0.7,
                            y: player.velocity.y * 0.7
                        });
                    }
                } else {
                    player.force.x -= 0.2 * Math.cos(m.angle) * Math.min(1, 3 / (0.1 + Math.abs(player.velocity.x)))
                    // player.force.x -= 0.06 * Math.cos(m.angle) * Math.min(1, 3 / (0.1 + Math.abs(player.velocity.x)))

                    player.force.y -= 0.02 * Math.sin(m.angle) //reduce knock back in vertical direction to stop super jumps
                }
            },
            fireInstantFireRate() {
                m.fireCDcycle = m.cycle + Math.floor(2 * b.fireCDscale); // cool down
                this.baseFire(m.angle + (Math.random() - 0.5) * (Math.random() - 0.5) * (input.down ? 1.35 : 3.2) / 2)
            },
            baseFire(angle, speed = 30 + 6 * Math.random()) {
                b.nail({
                    x: m.pos.x + 30 * Math.cos(m.angle),
                    y: m.pos.y + 30 * Math.sin(m.angle)
                }, {
                    x: m.Vx / 2 + speed * Math.cos(angle),
                    y: m.Vy / 2 + speed * Math.sin(angle)
                }) //position, velocity, damage
                if (tech.isIceCrystals) {
                    bullet[bullet.length - 1].beforeDmg = function(who) {
                        mobs.statusSlow(who, 60)
                        if (tech.isNailRadiation) mobs.statusDoT(who, 1 * (tech.isFastRadiation ? 1.3 : 0.44), tech.isSlowRadiation ? 360 : (tech.isFastRadiation ? 60 : 180)) // one tick every 30 cycles
                        if (tech.isNailCrit && !who.shield && Vector.dot(Vector.normalise(Vector.sub(who.position, this.position)), Vector.normalise(this.velocity)) > 0.94) {
                            b.explosion(this.position, 150 + 30 * Math.random()); //makes bullet do explosive damage at end
                        }
                    };
                    if (m.energy < 0.01) {
                        m.fireCDcycle = m.cycle + 60; // cool down
                    } else {
                        m.energy -= m.fieldRegen + 0.008
                    }
                }
            },
        },
        {
            name: "shotgun",
            description: "fire a wide <strong>burst</strong> of short range <strong> bullets</strong>",
            ammo: 0,
            ammoPack: 3.8,
            defaultAmmoPack: 3.8,
            have: false,
            do() {
                if (tech.isShotgunHeat && tech.isShotgunHeat <= 1.85 && m.fireCDcycle < m.cycle && !input.fire) tech.isShotgunHeat += 0.005
            },
            fire() {
                let knock, spread
                if (input.down) {
                    spread = 0.65
                    m.fireCDcycle = m.cycle + Math.floor(60 * b.fireCDscale) // cool down
                    if (tech.isShotgunImmune && m.immuneCycle < m.cycle + Math.floor(60 * b.fireCDscale)) m.immuneCycle = m.cycle + Math.floor(60 * b.fireCDscale); //player is immune to damage for 30 cycles
                    knock = 0.01
                } else {
                    m.fireCDcycle = m.cycle + Math.floor(47 * b.fireCDscale) // cool down
                    if (tech.isShotgunImmune && m.immuneCycle < m.cycle + Math.floor(47 * b.fireCDscale)) m.immuneCycle = m.cycle + Math.floor(47 * b.fireCDscale); //player is immune to damage for 30 cycles
                    spread = 1.3
                    knock = 0.1
                }
                if (tech.isShotgunFlak) spread *= 0.25

                if (tech.isShotgunReversed) {
                    player.force.x += 4 * knock * Math.cos(m.angle)
                    player.force.y += 4 * knock * Math.sin(m.angle) - 6 * player.mass * simulation.g
                } else if (tech.isShotgunRecoil) {
                    m.fireCDcycle -= 0.66 * (45 * b.fireCDscale)
                    player.force.x -= 2 * knock * Math.cos(m.angle)
                    player.force.y -= 2 * knock * Math.sin(m.angle)
                } else if (tech.isShotgunFlak) {
                    m.fireCDcycle -= (!tech.isRivets ? 0.8 : 0.4) * (45 * b.fireCDscale)
                    player.force.x -= 0.3 * knock * Math.cos(m.angle)
                    player.force.y -= 0.3 * knock * Math.sin(m.angle)
                } else {
                    player.force.x -= knock * Math.cos(m.angle)
                    player.force.y -= knock * Math.sin(m.angle) * 0.5 //reduce knock back in vertical direction to stop super jumps
                }

                b.muzzleFlash(35);

                if (tech.isRivets || (tech.isShotgunFireEverything && tech.isShotgunFireEverythingCycle == 7)) {
                    const me = bullet.length;
                    // const dir = m.angle + 0.02 * (Math.random() - 0.5)
                    bullet[me] = Bodies.rectangle(m.pos.x + 35 * Math.cos(m.angle), m.pos.y + 35 * Math.sin(m.angle), 60 * tech.bulletSize, 27 * tech.bulletSize, b.fireAttributes(m.angle));

                    Matter.Body.setDensity(bullet[me], 0.007 * (tech.isShotgunReversed ? 1.6 : 1));
                    Composite.add(engine.world, bullet[me]); //add bullet to world
                    const SPEED = (input.down ? 50 : 37)
                    Matter.Body.setVelocity(bullet[me], {
                        x: SPEED * Math.cos(m.angle),
                        y: SPEED * Math.sin(m.angle)
                    });
                    if (tech.isIncendiary) {
                        bullet[me].endCycle = simulation.cycle + 60
                        bullet[me].onEnd = function() {
                            b.explosion(this.position, 300 + (Math.random() - 0.5) * 60); //makes bullet do explosive damage at end
                        }
                        bullet[me].beforeDmg = function() {
                            this.endCycle = 0; //bullet ends cycle after hitting a mob and triggers explosion
                        };
                    } else {
                        bullet[me].endCycle = simulation.cycle + 180
                    }
                    bullet[me].minDmgSpeed = 7
                    // bullet[me].restitution = 0.4
                    bullet[me].frictionAir = 0.006;
                    bullet[me].turnMag = 0.04 * Math.pow(tech.bulletSize, 3.75)
                    bullet[me].do = function() {
                        this.force.y += this.mass * 0.0022
                        if (this.speed > 6) { //rotates bullet to face current velocity?
                            const facing = { x: Math.cos(this.angle), y: Math.sin(this.angle) }
                            if (Vector.cross(Vector.normalise(this.velocity), facing) < 0) {
                                this.torque += this.turnMag
                            } else {
                                this.torque -= this.turnMag
                            }
                        }
                    };
                    if (tech.fragments) {
                        bullet[me].beforeDmg = function() {
                            if (this.speed > 4) {
                                b.targetedNail(this.position, 6 * tech.fragments * tech.bulletSize)
                                this.endCycle = 0 //triggers despawn
                            }
                        }
                    }
                } else if (tech.isIncendiary || (tech.isShotgunFireEverything && tech.isShotgunFireEverythingCycle == 6)) {
                    spread *= 0.15
                    const END = Math.floor(input.down ? 10 : 7);
                    const totalBullets = 10 * (tech.isShotgunFlak ? 0.5 : 1)
                    const angleStep = ((input.down ? 0.4 : 1.3) / totalBullets) * (tech.isShotgunFlak ? 0.25 : 1)
                    let dir = m.angle - angleStep * totalBullets / 2;
                    for (let i = 0; i < totalBullets; i++) { //5 -> 7
                        dir += angleStep
                        const me = bullet.length;
                        bullet[me] = Bodies.rectangle(m.pos.x + 50 * Math.cos(m.angle), m.pos.y + 50 * Math.sin(m.angle), 17, 4, b.fireAttributes(dir));
                        const end = END + Math.random() * 4
                        bullet[me].endCycle = 2 * end + simulation.cycle
                        const speed = (25 * end / END) * (tech.isShotgunFlak && input.down ? 1.4 : 1)
                        const dirOff = dir + (Math.random() - 0.5) * spread
                        Matter.Body.setVelocity(bullet[me], {
                            x: speed * Math.cos(dirOff),
                            y: speed * Math.sin(dirOff)
                        });
                        bullet[me].onEnd = function() {
                            b.explosion(this.position, 150 * (tech.isShotgunReversed ? 1.5 : 1) + (Math.random() - 0.5) * 40); //makes bullet do explosive damage at end
                        }
                        bullet[me].beforeDmg = function() {
                            this.endCycle = 0; //bullet ends cycle after hitting a mob and triggers explosion
                        };
                        bullet[me].do = function() {}
                        Composite.add(engine.world, bullet[me]); //add bullet to world
                    }
                } else if (tech.isNailShot || (tech.isShotgunFireEverything && tech.isShotgunFireEverythingCycle == 5)) {
                    spread *= 0.65
                    const dmg = 2 * (tech.isShotgunReversed ? 1.6 : 1)
                    if (input.down) {
                        for (let i = 0; i < 17 * (tech.isShotgunFlak ? 0.5 : 1); i++) {
                            speed = 38 + 15 * Math.random()
                            const dir = m.angle + (Math.random() - 0.5) * spread
                            const pos = {
                                x: m.pos.x + 35 * Math.cos(m.angle) + 15 * (Math.random() - 0.5),
                                y: m.pos.y + 35 * Math.sin(m.angle) + 15 * (Math.random() - 0.5)
                            }
                            b.nail(pos, {
                                x: speed * Math.cos(dir),
                                y: speed * Math.sin(dir)
                            }, dmg)
                        }
                    } else {
                        for (let i = 0; i < 17 * (tech.isShotgunFlak ? 0.5 : 1); i++) {
                            speed = 38 + 15 * Math.random()
                            const dir = m.angle + (Math.random() - 0.5) * spread
                            const pos = {
                                x: m.pos.x + 35 * Math.cos(m.angle) + 15 * (Math.random() - 0.5),
                                y: m.pos.y + 35 * Math.sin(m.angle) + 15 * (Math.random() - 0.5)
                            }
                            b.nail(pos, {
                                x: speed * Math.cos(dir),
                                y: speed * Math.sin(dir)
                            }, dmg)
                        }
                    }
                } else if (tech.isSporeWorm || (tech.isShotgunFireEverything && tech.isShotgunFireEverythingCycle == 4)) {
                    const where = { x: m.pos.x + 35 * Math.cos(m.angle), y: m.pos.y + 35 * Math.sin(m.angle) }
                    const spread = (input.down ? 0.02 : 0.07)
                    const number = 3 * (tech.isShotgunReversed ? 1.6 : 1) * (tech.isShotgunFlak ? 0.333 : 1) + Math.random()
                    let angle = m.angle - (number - 1) * spread * 0.5
                    for (let i = 0; i < number; i++) {
                        b.worm(where)
                        const SPEED = (8 + 10 * input.down) * (1 + 0.15 * Math.random())
                        Matter.Body.setVelocity(bullet[bullet.length - 1], {
                            x: player.velocity.x * 0.5 + SPEED * Math.cos(angle),
                            y: player.velocity.y * 0.5 + SPEED * Math.sin(angle)
                        });
                        angle += spread
                    }
                } else if (tech.isIceShot || (tech.isShotgunFireEverything && tech.isShotgunFireEverythingCycle == 3)) {
                    const spread = (input.down ? 0.7 : 1.2)
                    for (let i = 0, len = 16 * (tech.isShotgunReversed ? 1.6 : 1) * (tech.isShotgunFlak ? 0.5 : 1); i < len; i++) {
                        //     iceIX(speed = 0, dir = m.angle + Math.PI * 2 * Math.random(), where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }) {
                        b.iceIX(25 + 20 * Math.random(), m.angle + spread * (Math.random() - 0.5))
                    }
                } else if (tech.isFoamShot || (tech.isShotgunFireEverything && tech.isShotgunFireEverythingCycle == 2)) {
                    const spread = (input.down ? 0.35 : 0.7)
                    const where = {
                        x: m.pos.x + 25 * Math.cos(m.angle),
                        y: m.pos.y + 25 * Math.sin(m.angle)
                    }
                    const number = 13 * (tech.isShotgunReversed ? 1.6 : 1) * (tech.isShotgunFlak ? 0.5 : 1)
                    for (let i = 0; i < number; i++) {
                        const SPEED = 25 + 12 * Math.random();
                        const angle = m.angle + spread * (Math.random() - 0.5)
                        b.foam(where, { x: SPEED * Math.cos(angle), y: SPEED * Math.sin(angle) }, 5 + 8 * Math.random())
                    }
                } else if (tech.isNeedles || (tech.isShotgunFireEverything && tech.isShotgunFireEverythingCycle == 1)) {
                    const number = Math.ceil(9 * (tech.isShotgunReversed ? 1.6 : 1) * (tech.isShotgunFlak ? 0.5 : 1))
                    const spread = (input.down ? 0.03 : 0.05)
                    let angle = m.angle - (number - 1) * spread * 0.5
                    for (let i = 0; i < number; i++) {
                        b.needle(angle)
                        angle += spread
                    }
                } else {
                    const side = 22
                    for (let i = 0; i < 17 * (tech.isShotgunFlak ? 0.5 : 1); i++) {
                        const me = bullet.length;
                        const dir = m.angle + (Math.random() - 0.5) * spread
                        bullet[me] = Bodies.rectangle(m.pos.x + 35 * Math.cos(m.angle) + 15 * (Math.random() - 0.5), m.pos.y + 35 * Math.sin(m.angle) + 15 * (Math.random() - 0.5), side, side, b.fireAttributes(dir));
                        Composite.add(engine.world, bullet[me]); //add bullet to world
                        const SPEED = (52 + Math.random() * 8) * (tech.isShotgunFlak && input.down ? 1.4 : 1)
                        Matter.Body.setVelocity(bullet[me], {
                            x: SPEED * Math.cos(dir),
                            y: SPEED * Math.sin(dir)
                        });
                        bullet[me].endCycle = simulation.cycle + 40
                        bullet[me].minDmgSpeed = 15
                        if (tech.isShotgunReversed) Matter.Body.setDensity(bullet[me], 0.0016)
                        // bullet[me].restitution = 0.4
                        bullet[me].frictionAir = 0.034;
                        bullet[me].startMass = bullet[me].mass
                        bullet[me].do = function() {
                            const scale = 1 - 0.034 / tech.isBulletsLastLonger
                            Matter.Body.scale(this, scale, scale);
                        };
                        bullet[me].beforeDmg = function(who) {
                            if (tech.isShotgunBounce) {
                                let target = [null,Infinity]
                                for (let i=0;i<mob.length;i++) {
                                    if (
                                        !mob[i].isBadTarget &&
                                        Vector.magnitude(Vector.sub(this.position, mob[i].position)) < target[1] &&
                                        Matter.Query.ray(map, this.position, mob[i].position).length === 0 &&
                                        Matter.Query.ray(mob, this.position, mob[i].position).length === 1 &&
                                        Matter.Query.ray(body, this.position, mob[i].position).length === 0 &&
                                        mob[i] != who
                                    ) {
                                        target = [mob[i], Vector.magnitude(Vector.sub(this.position, mob[i].position))]
                                    }
                                }
                                if (target[0] != null) {
                                    let angle = Vector.normalise(Vector.sub(Vector.add(target[0].position, Vector.mult(target[0].velocity, target[1] / 60)), this.position))
                                    Matter.Body.setVelocity(this, Vector.mult(angle, 42))
                                    Matter.Body.setPosition(this, {x:this.position.x+(this.velocity.x*3),y:this.position.y+(this.velocity.y*3)})
                                    if (this.mass < this.startMass) Matter.Body.scale(this, 2, 2)
                                    this.isSensor = true
                                    this.endCycle = simulation.cycle + 40
                                }
                            }
                        };
                    }
                    if (tech.isBlastHydrogen) {
                        for (let i=0;i<10;i++) {
                            b.hydrogen(m.pos, {x:Math.cos(m.angle)*7,y:Math.sin(m.angle)*7}, 30, 2)
                        }
                    }
                }
                if (tech.isShotgunFireEverything) tech.isShotgunFireEverythingCycle = (tech.isShotgunFireEverythingCycle + 1) % 8
            }
        }, {
            name: "super balls",
            description: "fire <strong>3</strong> balls in a wide arc<br>balls <strong>bounce</strong> with no momentum loss",
            ammo: 0,
            ammoPack: 10,
            defaultAmmoPack: 10,
            have: false,
            // num: 5,
            do() {},
            fireOne() {
                const SPEED = input.down ? 43 : 36
                m.fireCDcycle = m.cycle + Math.floor((input.down ? 23 : 15) * b.fireCDscale); // cool down
                let dir = m.angle
                const me = bullet.length;
                bullet[me] = Bodies.polygon(m.pos.x + 30 * Math.cos(m.angle), m.pos.y + 30 * Math.sin(m.angle), 12, 21 * tech.bulletSize, b.fireAttributes(dir, false));
                Composite.add(engine.world, bullet[me]); //add bullet to world
                Matter.Body.setVelocity(bullet[me], {
                    x: SPEED * Math.cos(dir),
                    y: SPEED * Math.sin(dir)
                });
                // Matter.Body.setDensity(bullet[me], 0.0001);
                bullet[me].endCycle = simulation.cycle + Math.floor(300 + 90 * Math.random());
                bullet[me].minDmgSpeed = 0;
                bullet[me].restitution = 1;
                bullet[me].friction = 0;
                bullet[me].do = function() {
                    this.force.y += this.mass * 0.0012;
                };
                bullet[me].beforeDmg = function(who) {
                    mobs.statusStun(who, 180) // (2.3) * 2 / 14 ticks (2x damage over 7 seconds)
                    if (tech.isIncendiary) {
                        b.explosion(this.position, this.mass * 280); //makes bullet do explosive damage at end
                        this.endCycle = 0
                    }
                };
            },
            fireMulti() {
                const SPEED = input.down ? 43 : 36
                m.fireCDcycle = m.cycle + Math.floor((input.down ? 23 : 15) * b.fireCDscale); // cool down
                const SPREAD = input.down ? 0.08 : 0.13
                const num = 3 + Math.floor(tech.extraSuperBalls * Math.random())
                const radius = 11 * tech.bulletSize
                let dir = m.angle - SPREAD * (num - 1) / 2;
                for (let i = 0; i < num; i++) {
                    const me = bullet.length;
                    bullet[me] = Bodies.polygon(m.pos.x + 30 * Math.cos(m.angle), m.pos.y + 30 * Math.sin(m.angle), 12, radius, b.fireAttributes(dir, false));
                    Composite.add(engine.world, bullet[me]); //add bullet to world
                    Matter.Body.setVelocity(bullet[me], {
                        x: SPEED * Math.cos(dir),
                        y: SPEED * Math.sin(dir)
                    });
                    // Matter.Body.setDensity(bullet[me], 0.0001);
                    bullet[me].endCycle = simulation.cycle + Math.floor((300 + 90 * Math.random()) * tech.isBulletsLastLonger);
                    bullet[me].minDmgSpeed = 0;
                    bullet[me].restitution = 0.99;
                    bullet[me].friction = 0;
                    bullet[me].do = function() {
                        this.force.y += this.mass * 0.001;
                    };
                    bullet[me].beforeDmg = function() {
                        if (tech.isIncendiary) {
                            b.explosion(this.position, this.mass * 320 + 70 * Math.random()); //makes bullet do explosive damage at end
                            this.endCycle = 0
                        }
                    };
                    dir += SPREAD;
                }
            },
            fireQueue() {
                const SPEED = input.down ? 43 : 36
                const dir = m.angle
                const x = m.pos.x
                const y = m.pos.y
                const num = 3 + Math.floor(tech.extraSuperBalls * Math.random())
                const delay = Math.floor((input.down ? 18 : 12) * b.fireCDscale)
                m.fireCDcycle = m.cycle + delay; // cool down

                const fireBall = () => {
                    const me = bullet.length;
                    bullet[me] = Bodies.polygon(x, y, 12, 11 * tech.bulletSize, b.fireAttributes(dir, false));
                    Composite.add(engine.world, bullet[me]); //add bullet to world
                    Matter.Body.setVelocity(bullet[me], {
                        x: SPEED * Math.cos(dir),
                        y: SPEED * Math.sin(dir)
                    });
                    bullet[me].endCycle = simulation.cycle + Math.floor(330 * tech.isBulletsLastLonger);
                    bullet[me].minDmgSpeed = 0;
                    bullet[me].restitution = 0.99;
                    bullet[me].friction = 0;
                    bullet[me].do = function() {
                        this.force.y += this.mass * 0.001;
                    };
                    bullet[me].beforeDmg = function() {
                        if (tech.isIncendiary) {
                            b.explosion(this.position, this.mass * 320 + 70 * Math.random()); //makes bullet do explosive damage at end
                            this.endCycle = 0
                        }
                    };
                    m.fireCDcycle = m.cycle + delay; // cool down
                }

                function cycle() {
                    if (simulation.paused || m.isBodiesAsleep) { requestAnimationFrame(cycle) } else {
                        count++
                        if (count % 2) fireBall()
                        if (count < num * 2 && m.alive) requestAnimationFrame(cycle);
                    }
                }
                let count = 0
                requestAnimationFrame(cycle);
                // fireBall();
            },
            chooseFireMethod() { //set in simulation.startGame
                if (tech.oneSuperBall) {
                    this.fire = this.fireOne
                } else if (tech.superBallDelay) {
                    this.fire = this.fireQueue
                } else {
                    this.fire = this.fireMulti
                }
            },
            fire() {}
        },
        {
            name: "matter wave",
            description: "emit a <strong>wave packet</strong> of oscillating particles<br>that propagates through <strong>solids</strong>",
            ammo: 0,
            ammoPack: 120,
            defaultAmmoPack: 120,
            have: false,
            wavePacketCycle: 0,
            delay: 40,
            propagationRate: 20,
            waves: [], //used in longitudinal mode
            chooseFireMethod() { //set in simulation.startGame
                tech.is360Longitudinal = false
                this.waves = [];
                if (tech.isLongitudinal) {
                    if (tech.is360Longitudinal) {
                        this.fire = this.fire360Longitudinal
                        this.do = this.do360Longitudinal
                    } else {
                        this.fire = this.fireLongitudinal
                        this.do = this.doLongitudinal
                    }
                } else {
                    this.fire = this.fireTransverse
                    this.do = this.doTransverse
                }
            },
            do() {},
            do360Longitudinal() {
                ctx.strokeStyle = "rgba(0,0,0,0.6)" //"000";
                ctx.lineWidth = 2 * tech.wavePacketDamage
                ctx.beginPath();
                const end = 700 * Math.sqrt(tech.isBulletsLastLonger) / Math.sqrt(tech.waveReflections * 0.5) //should equal about 1060
                const damage = 2 * m.dmgScale * tech.wavePacketDamage * tech.waveBeamDamage * (tech.isBulletTeleport ? 1.43 : 1) //damage is lower for large radius mobs, since they feel the waves longer

                for (let i = this.waves.length - 1; i > -1; i--) {
                    //draw wave
                    ctx.moveTo(this.waves[i].position.x + this.waves[i].radius, this.waves[i].position.y)
                    ctx.arc(this.waves[i].position.x, this.waves[i].position.y, this.waves[i].radius, 0, 2 * Math.PI);
                    // collisions
                    if (tech.isBulletTeleport && Math.random() < 0.04) {
                        const scale = 400 * Math.random()
                        this.waves[i].position = Vector.add(this.waves[i].position, { x: scale * (Math.random() - 0.5), y: scale * (Math.random() - 0.5) })
                    }
                    for (let j = 0, len = mob.length; j < len; j++) {
                        const dist = Vector.magnitude(Vector.sub(this.waves[i].position, mob[j].position))
                        const r = mob[j].radius + 30
                        if (dist + r > this.waves[i].radius && dist - r < this.waves[i].radius) {
                            //make them shake around
                            if (!mob[j].isBadTarget) {
                                mob[j].force.x += 0.01 * (Math.random() - 0.5) * mob[j].mass
                                mob[j].force.y += 0.01 * (Math.random() - 0.5) * mob[j].mass
                            }
                            if (!mob[j].isShielded) {
                                Matter.Body.setVelocity(mob[j], { //friction
                                    x: mob[j].velocity.x * 0.95,
                                    y: mob[j].velocity.y * 0.95
                                });
                                //draw vibes
                                let vertices = mob[j].vertices;
                                const vibe = 50 + mob[j].radius * 0.15
                                ctx.moveTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                                for (let k = 1; k < vertices.length; k++) {
                                    ctx.lineTo(vertices[k].x + vibe * (Math.random() - 0.5), vertices[k].y + vibe * (Math.random() - 0.5));
                                }
                                ctx.lineTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                                //damage
                                mob[j].locatePlayer();
                                mob[j].damage(damage / Math.sqrt(mob[j].radius));
                            }
                        }
                    }
                    for (let j = 0, len = body.length; j < len; j++) {
                        const dist = Vector.magnitude(Vector.sub(this.waves[i].position, body[j].position))
                        const r = 20
                        if (dist + r > this.waves[i].radius && dist - r < this.waves[i].radius) {
                            //make them shake around
                            body[j].force.x += 0.01 * (Math.random() - 0.5) * body[j].mass
                            body[j].force.y += (0.01 * (Math.random() - 0.5) - simulation.g * 0.25) * body[j].mass //remove force of gravity
                            //draw vibes
                            let vertices = body[j].vertices;
                            const vibe = 25
                            ctx.moveTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                            for (let k = 1; k < vertices.length; k++) {
                                ctx.lineTo(vertices[k].x + vibe * (Math.random() - 0.5), vertices[k].y + vibe * (Math.random() - 0.5));
                            }
                            ctx.lineTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                        }
                    }
                    this.waves[i].radius += tech.waveBeamSpeed * this.waves[i].expanding //expand / move
                    // if (this.waves[i].radius > end) this.waves.splice(i, 1) //end
                    if (this.waves[i].radius > end) {
                        this.waves[i].expanding = -1
                        this.waves[i].reflection--
                        if (this.waves[i].reflection < 1) this.waves.splice(i, 1) //end
                    } else if (this.waves[i].radius < 25) {
                        this.waves[i].expanding = 1
                        this.waves[i].reflection--
                        if (this.waves[i].reflection < 1) this.waves.splice(i, 1) //end
                    }
                }
                ctx.stroke();
            },
            fire360Longitudinal() {
                m.fireCDcycle = m.cycle + Math.floor((input.down ? 3 : 8) * b.fireCDscale); // cool down
                this.waves.push({
                    position: { x: m.pos.x, y: m.pos.y, },
                    radius: 25,
                    reflection: tech.waveReflections,
                    expanding: true
                })
            },
            doLongitudinal() {
                ctx.strokeStyle = "rgba(0,0,0,0.6)" //"000";
                ctx.lineWidth = 2 * tech.wavePacketDamage
                ctx.beginPath();
                const end = 1100 * tech.isBulletsLastLonger / Math.sqrt(tech.waveReflections * 0.5) //should equal about  1767
                const damage = 2 * m.dmgScale * tech.wavePacketDamage * tech.waveBeamDamage * (tech.isBulletTeleport ? 1.43 : 1) //damage is lower for large radius mobs, since they feel the waves longer

                for (let i = this.waves.length - 1; i > -1; i--) {
                    const v1 = Vector.add(this.waves[i].position, Vector.mult(this.waves[i].unit1, this.waves[i].radius))
                    const v2 = Vector.add(this.waves[i].position, Vector.mult(this.waves[i].unit2, this.waves[i].radius))
                    //draw wave
                    ctx.moveTo(v1.x, v1.y)
                    ctx.arc(this.waves[i].position.x, this.waves[i].position.y, this.waves[i].radius, this.waves[i].angle, this.waves[i].angle + this.waves[i].arc);
                    // collisions
                    //using small angle linear approximation of circle arc, this will not work if the arc gets large   // https://stackoverflow.com/questions/13652518/efficiently-find-points-inside-a-circle-sector
                    if (tech.isBulletTeleport && Math.random() < 0.05) {
                        if (Math.random() < 0.5) {
                            // const scale = 500 * Math.random()
                            // this.waves[i].position = Vector.add(this.waves[i].position, { x: scale * (Math.random() - 0.5), y: scale * (Math.random() - 0.5) })
                        } else {
                            this.waves[i].arc *= 1 + 1 * (Math.random() - 0.5)
                            const halfArc = this.waves[i].arc / 2
                            const angle = m.angle + 0.5 * (Math.random() - 0.5)
                            this.waves[i].angle = angle - halfArc
                            this.waves[i].unit1 = { x: Math.cos(angle - halfArc), y: Math.sin(angle - halfArc) }
                            this.waves[i].unit2 = { x: Math.cos(angle + halfArc), y: Math.sin(angle + halfArc) }
                        }
                    }
                    let hits = Matter.Query.ray(mob, v1, v2, 50) //Matter.Query.ray(bodies, startPoint, endPoint, [rayWidth])
                    for (let j = 0; j < hits.length; j++) {
                        const who = hits[j].body
                        //make them shake around
                        if (!who.isBadTarget) {
                            who.force.x += 0.01 * (Math.random() - 0.5) * who.mass
                            who.force.y += 0.01 * (Math.random() - 0.5) * who.mass
                        }
                        if (!who.isShielded) {
                            Matter.Body.setVelocity(who, { //friction
                                x: who.velocity.x * 0.95,
                                y: who.velocity.y * 0.95
                            });
                            let vertices = who.vertices;
                            const vibe = 50 + who.radius * 0.15
                            ctx.moveTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                            for (let j = 1; j < vertices.length; j++) {
                                ctx.lineTo(vertices[j].x + vibe * (Math.random() - 0.5), vertices[j].y + vibe * (Math.random() - 0.5));
                            }
                            ctx.lineTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                            who.locatePlayer();
                            who.damage(damage / Math.sqrt(who.radius));
                        }
                    }

                    hits = Matter.Query.ray(body, v1, v2, 50) //Matter.Query.ray(bodies, startPoint, endPoint, [rayWidth])
                    for (let j = 0; j < hits.length; j++) {
                        const who = hits[j].body
                        //make them shake around
                        who.force.x += 0.01 * (Math.random() - 0.5) * who.mass
                        who.force.y += (0.01 * (Math.random() - 0.5) - simulation.g * 0.25) * who.mass //remove force of gravity

                        let vertices = who.vertices;
                        const vibe = 25
                        ctx.moveTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                        for (let j = 1; j < vertices.length; j++) {
                            ctx.lineTo(vertices[j].x + vibe * (Math.random() - 0.5), vertices[j].y + vibe * (Math.random() - 0.5));
                        }
                        ctx.lineTo(vertices[0].x + vibe * (Math.random() - 0.5), vertices[0].y + vibe * (Math.random() - 0.5));
                    }
                    // ctx.stroke(); //draw vibes

                    this.waves[i].radius += tech.waveBeamSpeed * 2 * this.waves[i].expanding //expand / move
                    if (this.waves[i].radius > end) {
                        this.waves[i].expanding = -1
                        this.waves[i].reflection--
                        if (this.waves[i].reflection < 1) this.waves.splice(i, 1) //end
                    } else if (this.waves[i].radius < 25) {
                        this.waves[i].expanding = 1
                        this.waves[i].reflection--
                        if (this.waves[i].reflection < 1) this.waves.splice(i, 1) //end
                    }
                }
                ctx.stroke();
            },
            fireLongitudinal() {
                m.fireCDcycle = m.cycle + Math.floor((input.down ? 3 : 8) * b.fireCDscale); // cool down
                const halfArc = input.down ? 0.0785 : 0.275 //6.28 is a full circle, but these arcs needs to stay small because we are using small angle linear approximation, for collisions
                this.waves.push({
                    position: {
                        x: m.pos.x + 25 * Math.cos(m.angle),
                        y: m.pos.y + 25 * Math.sin(m.angle),
                    },
                    angle: m.angle - halfArc, //used in drawing ctx.arc
                    unit1: { x: Math.cos(m.angle - halfArc), y: Math.sin(m.angle - halfArc) }, //used for collision
                    unit2: { x: Math.cos(m.angle + halfArc), y: Math.sin(m.angle + halfArc) }, //used for collision
                    arc: halfArc * 2,
                    radius: 25,
                    reflection: tech.waveReflections,
                    expanding: 1
                })
            },
            doTransverse() {
                if (this.wavePacketCycle && !input.fire) {
                    this.wavePacketCycle = 0;
                    m.fireCDcycle = m.cycle + Math.floor(this.delay * b.fireCDscale); // cool down
                }
            },
            fireTransverse() {
                totalCycles = Math.floor(4.3 * 35 * tech.waveReflections * tech.isBulletsLastLonger / Math.sqrt(tech.waveReflections * 0.5))
                const me = bullet.length;
                bullet[me] = Bodies.polygon(m.pos.x + 25 * Math.cos(m.angle), m.pos.y + 25 * Math.sin(m.angle), 5, 4, {
                    angle: m.angle,
                    cycle: -0.5,
                    endCycle: simulation.cycle + totalCycles,
                    inertia: Infinity,
                    frictionAir: 0,
                    slow: 0,
                    amplitude: (input.down ? 5 : 10) * ((this.wavePacketCycle % 2) ? -1 : 1) * Math.sin((this.wavePacketCycle + 1) * 0.088), //0.0968 //0.1012 //0.11 //0.088 //shorten wave packet
                    minDmgSpeed: 0,
                    dmg: m.dmgScale * tech.waveBeamDamage * tech.wavePacketDamage * (tech.isBulletTeleport ? 1.43 : 1), //also control damage when you divide by mob.mass 
                    classType: "bullet",
                    collisionFilter: {
                        category: 0,
                        mask: 0, //cat.mob | cat.mobBullet | cat.mobShield
                    },
                    beforeDmg() {},
                    onEnd() {},
                    do() {},
                    query() {
                        let slowCheck = 1
                        if (Matter.Query.point(map, this.position).length) { //check if inside map                                    
                            slowCheck = waveSpeedMap
                        } else { //check if inside a body
                            let q = Matter.Query.point(body, this.position)
                            if (q.length) {
                                slowCheck = waveSpeedBody
                                Matter.Body.setPosition(this, Vector.add(this.position, q[0].velocity)) //move with the medium
                            }
                        }
                        if (slowCheck !== this.slow) { //toggle velocity based on inside and outside status change
                            this.slow = slowCheck
                            Matter.Body.setVelocity(this, Vector.mult(Vector.normalise(this.velocity), tech.waveBeamSpeed * slowCheck));
                        }
                        q = Matter.Query.point(mob, this.position) // check if inside a mob
                        for (let i = 0; i < q.length; i++) {
                            let dmg = this.dmg // / Math.min(10, q[i].mass)
                            q[i].damage(dmg);
                            if (q[i].alive) q[i].foundPlayer();
                            Matter.Body.setVelocity(q[i], Vector.mult(q[i].velocity, 0.9))

                            this.endCycle = 0; //bullet ends cycle after doing damage
                            if (q[i].damageReduction) {
                                simulation.drawList.push({ //add dmg to draw queue
                                    x: this.position.x,
                                    y: this.position.y,
                                    radius: Math.log(dmg + 1.1) * 40 * q[i].damageReduction + 3,
                                    color: 'rgba(0,0,0,0.4)',
                                    time: simulation.drawTime
                                });
                            }
                        }
                    },
                    wiggle() {
                        this.cycle++
                        const where = Vector.mult(transverse, this.amplitude * Math.cos(this.cycle * tech.waveFrequency))
                        Matter.Body.setPosition(this, Vector.add(this.position, where))
                    }
                });
                if (tech.isBulletTeleport) {
                    bullet[me].wiggle = function() {
                        this.cycle++
                        const where = Vector.mult(transverse, this.amplitude * Math.cos(this.cycle * tech.waveFrequency))
                        if (Math.random() < 0.005) {
                            if (Math.random() < 0.33) { //randomize position
                                const scale = 500 * Math.random()
                                Matter.Body.setPosition(this, Vector.add({ x: scale * (Math.random() - 0.5), y: scale * (Math.random() - 0.5) }, Vector.add(this.position, where)))
                            } else { //randomize position in velocity direction
                                const velocityScale = Vector.mult(this.velocity, 50 * (Math.random() - 0.5))
                                Matter.Body.setPosition(this, Vector.add(velocityScale, Vector.add(this.position, where)))
                            }

                        } else {
                            Matter.Body.setPosition(this, Vector.add(this.position, where))
                        }
                    }
                }
                let waveSpeedMap = 0.1
                let waveSpeedBody = 0.25
                if (tech.isPhaseVelocity) {
                    waveSpeedMap = 3
                    waveSpeedBody = 1.9
                    bullet[me].dmg *= 1.15
                }
                if (tech.waveReflections) {
                    bullet[me].reflectCycle = totalCycles / tech.waveReflections //tech.waveLengthRange
                    bullet[me].do = function() {
                        this.query()
                        if (this.cycle > this.reflectCycle) {
                            this.reflectCycle += totalCycles / tech.waveReflections
                            Matter.Body.setVelocity(this, Vector.mult(this.velocity, -1));
                            // if (this.reflectCycle > tech.waveLengthRange * (1 + tech.waveReflections)) this.endCycle = 0;
                        }
                        this.wiggle()
                    }
                } else {
                    bullet[me].do = function() {
                        this.query()
                        this.wiggle();
                    }
                }
                Composite.add(engine.world, bullet[me]); //add bullet to world
                Matter.Body.setVelocity(bullet[me], {
                    x: tech.waveBeamSpeed * Math.cos(m.angle),
                    y: tech.waveBeamSpeed * Math.sin(m.angle)
                });
                const transverse = Vector.normalise(Vector.perp(bullet[me].velocity))
                //fire a packet of bullets then delay for a while
                this.wavePacketCycle++
                if (this.wavePacketCycle > 35) {
                    m.fireCDcycle = m.cycle + Math.floor(this.delay * b.fireCDscale); // cool down
                    this.wavePacketCycle = 0;
                }
            },
            fire() {}
        },
        {
            name: "missiles",
            description: "launch <strong>homing</strong> missiles that <strong class='color-e'>explode</strong>",
            ammo: 0,
            ammoPack: 5,
            defaultAmmoPack: 5,
            have: false,
            fireCycle: 0,
            do() {},
            fire() {
                const countReduction = Math.pow(0.9, tech.missileCount)
                // if (input.down) {
                //     m.fireCDcycle = m.cycle + tech.missileFireCD * b.fireCDscale / countReduction; // cool down
                //     // for (let i = 0; i < tech.missileCount; i++) {
                //     //     b.missile(where, -Math.PI / 2 + 0.2 * (Math.random() - 0.5) * Math.sqrt(tech.missileCount), -2, Math.sqrt(countReduction))
                //     //     bullet[bullet.length - 1].force.x += 0.004 * countReduction * (i - (tech.missileCount - 1) / 2);
                //     // }

                //     if (tech.missileCount > 1) {
                //         for (let i = 0; i < tech.missileCount; i++) {
                //             setTimeout(() => {
                //                 const where = { x: m.pos.x, y: m.pos.y - 40 }
                //                 b.missile(where, -Math.PI / 2 + 0.2 * (Math.random() - 0.5) * Math.sqrt(tech.missileCount), -2, Math.sqrt(countReduction))
                //                 bullet[bullet.length - 1].force.x += 0.025 * countReduction * (i - (tech.missileCount - 1) / 2);
                //             }, 20 * tech.missileCount * Math.random());
                //         }
                //     } else {
                //         const where = {
                //             x: m.pos.x,
                //             y: m.pos.y - 40
                //         }
                //         b.missile(where, -Math.PI / 2 + 0.2 * (Math.random() - 0.5), -2)
                //     }
                // } else {
                m.fireCDcycle = m.cycle + tech.missileFireCD * b.fireCDscale / countReduction; // cool down
                const direction = {
                    x: Math.cos(m.angle),
                    y: Math.sin(m.angle)
                }
                // const where = {
                //     x: m.pos.x + 30 * direction.x,
                //     y: m.pos.y + 30 * direction.y
                // }
                if (tech.missileCount > 1) {
                    const push = Vector.mult(Vector.perp(direction), 0.2 * countReduction / Math.sqrt(tech.missileCount))
                    const sqrtCountReduction = Math.sqrt(countReduction)
                    // for (let i = 0; i < tech.missileCount; i++) {
                    //     setTimeout(() => {
                    //         if (input.down) {
                    //             b.missile(where, m.angle, 20, sqrtCountReduction)
                    //             // bullet[bullet.length - 1].force.x += 0.7 * push.x * (i - (tech.missileCount - 1) / 2);
                    //             // bullet[bullet.length - 1].force.y += 0.7 * push.y * (i - (tech.missileCount - 1) / 2);
                    //         } else {
                    //             b.missile(where, m.angle, -10, sqrtCountReduction)
                    //             bullet[bullet.length - 1].force.x += push.x * (i - (tech.missileCount - 1) / 2);
                    //             bullet[bullet.length - 1].force.y += 0.005 + push.y * (i - (tech.missileCount - 1) / 2);
                    //         }

                    //     }, 1 + i * 10 * tech.missileCount);
                    // }
                    const launchDelay = 4
                    let count = 0
                    const fireMissile = () => {
                        if (input.down) {
                            b.missile({ x: m.pos.x + 30 * direction.x, y: m.pos.y + 30 * direction.y }, m.angle, 20, sqrtCountReduction)
                            bullet[bullet.length - 1].force.x += 0.5 * push.x * (Math.random() - 0.5)
                            bullet[bullet.length - 1].force.y += 0.004 + 0.5 * push.y * (Math.random() - 0.5)
                        } else {
                            b.missile({ x: m.pos.x + 30 * direction.x, y: m.pos.y + 30 * direction.y }, m.angle, -15, sqrtCountReduction)
                            bullet[bullet.length - 1].force.x += push.x * (Math.random() - 0.5)
                            bullet[bullet.length - 1].force.y += 0.005 + push.y * (Math.random() - 0.5)
                        }
                    }
                    const cycle = () => {
                        if ((simulation.paused || m.isBodiesAsleep) && m.alive) {
                            requestAnimationFrame(cycle)
                        } else {
                            count++
                            if (!(count % launchDelay)) {
                                fireMissile()
                            }
                            if (count < tech.missileCount * launchDelay && m.alive) requestAnimationFrame(cycle);
                        }
                    }
                    requestAnimationFrame(cycle);
                } else {
                    if (input.down) {
                        b.missile({ x: m.pos.x + 40 * direction.x, y: m.pos.y + 40 * direction.y }, m.angle, 25)
                    } else {
                        b.missile({ x: m.pos.x + 40 * direction.x, y: m.pos.y + 40 * direction.y }, m.angle, -12)
                        bullet[bullet.length - 1].force.y += 0.04 * (Math.random() - 0.2)
                    }
                }
            }
        }, {
            name: "grenades",
            description: "lob a single <strong>bouncy</strong> projectile<br><strong class='color-e'>explodes</strong> on <strong>contact</strong> or after one second",
            ammo: 0,
            ammoPack: 5,
            defaultAmmoPack: 5,
            have: false,
            do() {}, //do is set in b.setGrenadeMode()
            fire() {
                const countReduction = Math.pow(0.86, tech.missileCount)
                m.fireCDcycle = m.cycle + Math.floor((input.down ? 35 : 27) * b.fireCDscale / countReduction); // cool down
                const where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }
                const SPREAD = input.down ? 0.12 : 0.2
                let angle = m.angle - SPREAD * (tech.missileCount - 1) / 2;
                for (let i = 0; i < tech.missileCount; i++) {
                    b.grenade(where, angle, countReduction) //function(where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }, angle = m.angle, size = 1)
                    angle += SPREAD
                }
            },
        }, {
            name: "spores",
            description: "fire a <strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> that discharges <strong class='color-p' style='letter-spacing: 2px;'>spores</strong><br><strong class='color-p' style='letter-spacing: 2px;'>spores</strong> seek out nearby mobs",
            ammo: 0,
            ammoPack: 2.3,
            defaultAmmoPack: 2.3,
            have: false,
            do() {},
            fire() {
                const me = bullet.length;
                const dir = m.angle;
                bullet[me] = Bodies.polygon(m.pos.x + 30 * Math.cos(m.angle), m.pos.y + 30 * Math.sin(m.angle), 20, 4.5, b.fireAttributes(dir, false));
                b.fireProps(input.down ? 45 : 25, input.down ? 30 : 16, dir, me); //cd , speed
                Matter.Body.setDensity(bullet[me], 0.000001);
                bullet[me].endCycle = simulation.cycle + 480 + Math.max(0, 120 - 2 * bullet.length);
                bullet[me].frictionAir = 0;
                bullet[me].friction = 0.5;
                bullet[me].radius = 4.5;
                bullet[me].maxRadius = 30;
                bullet[me].restitution = 0.3;
                bullet[me].minDmgSpeed = 0;
                bullet[me].totalSpores = 8 + 2 * tech.isFastSpores + 2 * tech.isSporeFreeze * (tech.isSporeWorm ? 0.5 : 1)
                bullet[me].stuck = function() {};
                bullet[me].beforeDmg = function() {};
                bullet[me].do = function() {
                    function onCollide(that) {
                        that.collisionFilter.mask = 0; //non collide with everything
                        Matter.Body.setVelocity(that, {
                            x: 0,
                            y: 0
                        });
                        that.do = that.grow;
                    }

                    const mobCollisions = Matter.Query.collides(this, mob)
                    if (mobCollisions.length) {
                        onCollide(this)
                        this.stuckTo = mobCollisions[0].bodyA

                        if (this.stuckTo.isVerticesChange) {
                            this.stuckToRelativePosition = {
                                x: 0,
                                y: 0
                            }
                        } else {
                            //find the relative position for when the mob is at angle zero by undoing the mobs rotation
                            this.stuckToRelativePosition = Vector.rotate(Vector.sub(this.position, this.stuckTo.position), -this.stuckTo.angle)
                        }
                        this.stuck = function() {
                            if (this.stuckTo && this.stuckTo.alive) {
                                const rotate = Vector.rotate(this.stuckToRelativePosition, this.stuckTo.angle) //add in the mob's new angle to the relative position vector
                                Matter.Body.setPosition(this, Vector.add(Vector.add(rotate, this.stuckTo.velocity), this.stuckTo.position))
                                Matter.Body.setVelocity(this, this.stuckTo.velocity); //so that it will move properly if it gets unstuck
                            } else {
                                this.collisionFilter.mask = cat.map; //non collide with everything but map
                                this.stuck = function() {
                                    this.force.y += this.mass * 0.0006;
                                }
                            }
                        }
                    } else {
                        const bodyCollisions = Matter.Query.collides(this, body)
                        if (bodyCollisions.length) {
                            if (!bodyCollisions[0].bodyA.isNonStick) {
                                onCollide(this)
                                this.stuckTo = bodyCollisions[0].bodyA
                                //find the relative position for when the mob is at angle zero by undoing the mobs rotation
                                this.stuckToRelativePosition = Vector.rotate(Vector.sub(this.position, this.stuckTo.position), -this.stuckTo.angle)
                            } else {
                                this.do = this.grow;
                            }
                            this.stuck = function() {
                                if (this.stuckTo) {
                                    const rotate = Vector.rotate(this.stuckToRelativePosition, this.stuckTo.angle) //add in the mob's new angle to the relative position vector
                                    Matter.Body.setPosition(this, Vector.add(Vector.add(rotate, this.stuckTo.velocity), this.stuckTo.position))
                                    // Matter.Body.setVelocity(this, this.stuckTo.velocity); //so that it will move properly if it gets unstuck
                                } else {
                                    this.force.y += this.mass * 0.0006;
                                }
                            }
                        } else {
                            if (Matter.Query.collides(this, map).length) {
                                onCollide(this)
                            } else { //if colliding with nothing just fall
                                this.force.y += this.mass * 0.0006;
                            }
                        }
                    }
                    //draw green glow
                    ctx.fillStyle = "rgba(0,200,125,0.16)";
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, this.maxRadius, 0, 2 * Math.PI);
                    ctx.fill();
                }
                bullet[me].grow = function() {
                    this.stuck(); //runs different code based on what the bullet is stuck to
                    let scale = 1.01
                    if (tech.isSporeGrowth && !(simulation.cycle % 40)) { //release a spore
                        if (tech.isSporeWorm) {
                            if (!(simulation.cycle % 80)) b.worm(this.position)
                        } else {
                            b.spore(this.position)
                        }
                        // this.totalSpores--
                        scale = 0.96
                        if (this.stuckTo && this.stuckTo.alive) scale = 0.9
                        Matter.Body.scale(this, scale, scale);
                        this.radius *= scale
                    } else {
                        if (this.stuckTo && this.stuckTo.alive) scale = 1.03
                        Matter.Body.scale(this, scale, scale);
                        this.radius *= scale
                        if (this.radius > this.maxRadius) this.endCycle = 0;
                    }
                    // this.force.y += this.mass * 0.00045;

                    //draw green glow
                    ctx.fillStyle = "rgba(0,200,125,0.16)";
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, this.maxRadius, 0, 2 * Math.PI);
                    ctx.fill();
                };

                //spawn bullets on end
                bullet[me].onEnd = function() {
                    if (tech.isSporeWorm) {
                        for (let i = 0, len = this.totalSpores * 0.5; i < len; i++) b.worm(this.position)
                    } else {
                        for (let i = 0; i < this.totalSpores; i++) b.spore(this.position)
                    }
                }
            }
        }, {
            name: "drones",
            description: "deploy drones that <strong>crash</strong> into mobs<br>crashes reduce their <strong>lifespan</strong> by 1 second",
            ammo: 0,
            ammoPack: 16,
            defaultAmmoPack: 16,
            have: false,
            do() {},
            fire() {
                if (tech.isDroneRadioactive) {
                    if (input.down) {
                        b.droneRadioactive({ x: m.pos.x + 30 * Math.cos(m.angle) + 10 * (Math.random() - 0.5), y: m.pos.y + 30 * Math.sin(m.angle) + 10 * (Math.random() - 0.5) }, 45)
                        m.fireCDcycle = m.cycle + Math.floor(50 * b.fireCDscale); // cool down
                    } else {
                        b.droneRadioactive({ x: m.pos.x + 30 * Math.cos(m.angle) + 10 * (Math.random() - 0.5), y: m.pos.y + 30 * Math.sin(m.angle) + 10 * (Math.random() - 0.5) }, 10)
                        m.fireCDcycle = m.cycle + Math.floor(25 * b.fireCDscale); // cool down
                    }
                } else {
                    if (input.down) {
                        b.drone({ x: m.pos.x + 30 * Math.cos(m.angle) + 10 * (Math.random() - 0.5), y: m.pos.y + 30 * Math.sin(m.angle) + 10 * (Math.random() - 0.5) }, 55)
                        m.fireCDcycle = m.cycle + Math.floor(10 * b.fireCDscale); // cool down
                    } else {
                        b.drone({ x: m.pos.x + 30 * Math.cos(m.angle) + 10 * (Math.random() - 0.5), y: m.pos.y + 30 * Math.sin(m.angle) + 10 * (Math.random() - 0.5) }, 20)
                        m.fireCDcycle = m.cycle + Math.floor(5 * b.fireCDscale); // cool down
                    }
                }
            }
        },
        {
            name: "foam",
            description: "spray bubbly foam that <strong>sticks</strong> to mobs<br><strong class='color-s'>slows</strong> mobs and does <strong class='color-d'>damage</strong> over time",
            ammo: 0,
            ammoPack: 36,
            defaultAmmoPack: 36,
            have: false,
            charge: 0,
            isDischarge: false,
            chooseFireMethod() {
                if (tech.isCapacitor) {
                    this.do = this.doStream
                    this.fire = this.fireStream
                } else {
                    this.do = this.doCharges // () => {}
                    this.fire = this.fireCharges
                }
            },
            doStream() {},
            fireStream() {
                const spread = (input.down ? 0.04 : 0.3) * (Math.random() - 0.5)
                const radius = 5 + 8 * Math.random() + (tech.isAmmoFoamSize && this.ammo < 300) * 12
                const SPEED = Math.max(2, 14 - radius * 0.25)
                const dir = m.angle + 0.15 * (Math.random() - 0.5)
                const velocity = {
                    x: SPEED * Math.cos(dir),
                    y: SPEED * Math.sin(dir)
                }
                const position = {
                    x: m.pos.x + 30 * Math.cos(m.angle),
                    y: m.pos.y + 30 * Math.sin(m.angle)
                }
                if (tech.foamFutureFire) {
                    simulation.drawList.push({ //add dmg to draw queue
                        x: position.x,
                        y: position.y,
                        radius: 5,
                        color: "rgba(0,50,50,0.3)",
                        time: 15 * tech.foamFutureFire
                    });
                    setTimeout(() => {
                        if (!simulation.paused) {
                            b.foam(position, Vector.rotate(velocity, spread), radius)
                            bullet[bullet.length - 1].damage *= (1 + 0.7 * tech.foamFutureFire)
                        }
                    }, 210 * tech.foamFutureFire);
                } else {
                    b.foam(position, Vector.rotate(velocity, spread), radius)
                }
                m.fireCDcycle = m.cycle + Math.floor(1.5 * b.fireCDscale);
            },
            doCharges() {
                if (this.charge > 0) {
                    //draw charge level
                    ctx.fillStyle = "rgba(0,50,50,0.3)";
                    ctx.beginPath();
                    const radius = 10 * Math.sqrt(this.charge)
                    const mag = 11 + radius
                    ctx.arc(m.pos.x + mag * Math.cos(m.angle), m.pos.y + mag * Math.sin(m.angle), radius, 0, 2 * Math.PI);
                    ctx.fill();

                    if (this.isDischarge) {
                        this.charge--
                        const spread = (input.down ? 0.04 : 0.5) * (Math.random() - 0.5)
                        const radius = 5 + 8 * Math.random() + (tech.isAmmoFoamSize && this.ammo < 300) * 12
                        const SPEED = 18 - radius * 0.4;
                        const dir = m.angle + 0.15 * (Math.random() - 0.5)
                        const velocity = {
                            x: SPEED * Math.cos(dir),
                            y: SPEED * Math.sin(dir)
                        }
                        const position = {
                            x: m.pos.x + 30 * Math.cos(m.angle),
                            y: m.pos.y + 30 * Math.sin(m.angle)
                        }
                        if (tech.foamFutureFire) {
                            let chargeBuff = tech.isFoamChargeBuff
                            simulation.drawList.push({ //add dmg to draw queue
                                x: position.x,
                                y: position.y,
                                radius: 5,
                                color: "rgba(0,50,50,0.3)",
                                time: 15 * tech.foamFutureFire
                            });
                            setTimeout(() => {
                                if (!simulation.paused) {
                                    b.foam(position, Vector.rotate(velocity, spread), radius)
                                    // (tech.isFastFoam ? 0.044 : 0.011) * (tech.isBulletTeleport ? 1.60 : 1)
                                    bullet[bullet.length - 1].damage *= (1 + 0.7 * tech.foamFutureFire * (tech.isFoamChargeBuff ? chargeBuff : 1))
                                }
                            }, 250 * tech.foamFutureFire);
                        } else {
                            b.foam(position, Vector.rotate(velocity, spread), radius)
                        }
                        m.fireCDcycle = m.cycle + 1; //disable firing and adding more charge
                    } else if (!input.fire) {
                        this.isDischarge = true;
                    }
                } else {
                    if (this.isDischarge) {
                        m.fireCDcycle = m.cycle + Math.floor(25 * b.fireCDscale);
                        tech.isFoamChargeBuff = 1
                    }
                    this.isDischarge = false
                }
            },
            fireCharges() {
                const capacity = 20
                if (tech.isCapacitor && this.charge === 0 && b.guns[b.activeGun].ammo > capacity) {
                    this.charge = capacity
                    b.guns[b.activeGun].ammo -= capacity
                    simulation.updateGunHUD();
                }
                this.charge++
                if (tech.isFoamChargeBuff) tech.isFoamChargeBuff += 0.07
                m.fireCDcycle = m.cycle + Math.floor(1 + 0.3 * this.charge);
            },
            fire() {},
            do() {},
        },
        {
            name: "harpoon",
            description: "fire a <strong>self-steering</strong> harpoon that uses <strong class='color-f'>energy</strong><br>to <strong>retract</strong> and refund its <strong class='color-ammo'>ammo</strong> cost",
            ammo: 0,
            ammoPack: 0.6, //update this in railgun tech
            defaultAmmoPack: 0.6,
            have: false,
            fire() {},
            do() {},
            chooseFireMethod() {
                if (tech.isRailGun) {
                    this.do = this.railDo
                    this.fire = this.railFire
                } else if (tech.isGrapple) {
                    this.do = () => {}
                    this.fire = this.grappleFire
                } else {
                    this.do = () => {}
                    this.fire = this.harpoonFire
                }
            },
            charge: 0,
            railDo() {
                if (this.charge > 0) {
                    //exit railgun charging without firing
                    if (m.energy < 0.005 && !tech.isRailEnergyGain) {
                        m.energy += 0.025 + this.charge * 0.11
                        m.fireCDcycle = m.cycle + 120; // cool down if out of energy
                        this.endCycle = 0;
                        this.charge = 0
                        b.refundAmmo()
                        return
                    }
                    //fire
                    if ((!input.fire && this.charge > 0.6)) {
                        tech.harpoonDensity = 0.008 //0.001 is normal for blocks,  0.005 is normal for harpoon,  0.005*6 when buffed
                        const where = {
                            x: m.pos.x + 30 * Math.cos(m.angle),
                            y: m.pos.y + 30 * Math.sin(m.angle)
                        }
                        const closest = {
                            distance: 10000,
                            target: null
                        }
                        //push away blocks and mobs
                        const range = 1200 * this.charge
                        for (let i = 0, len = mob.length; i < len; ++i) { //push away mobs when firing
                            const SUB = Vector.sub(mob[i].position, m.pos)
                            const DISTANCE = Vector.magnitude(SUB)
                            if (DISTANCE < range + mob[i].radius) {
                                const DEPTH = 100 + Math.min(range - DISTANCE + mob[i].radius, 1500)
                                const FORCE = Vector.mult(Vector.normalise(SUB), 0.0015 * Math.sqrt(DEPTH) * mob[i].mass)
                                mob[i].force.x += FORCE.x;
                                mob[i].force.y += FORCE.y;

                                let dmg = m.dmgScale * (mob[i].isDropPowerUp ? 0.1 : 0.4)
                                simulation.drawList.push({ //add dmg to draw queue
                                    x: mob[i].position.x,
                                    y: mob[i].position.y,
                                    radius: Math.log(dmg + 1.1) * 40 * mob[i].damageReduction + 3,
                                    color: 'rgba(100, 0, 200, 0.2)',
                                    time: 15
                                });
                                mob[i].damage(dmg);
                            }
                        }
                        for (let i = 0, len = body.length; i < len; ++i) { //push away blocks when firing
                            const SUB = Vector.sub(body[i].position, m.pos)
                            const DISTANCE = Vector.magnitude(SUB)
                            if (DISTANCE < range) {
                                const DEPTH = Math.min(range - DISTANCE, 500)
                                const FORCE = Vector.mult(Vector.normalise(SUB), 0.003 * Math.sqrt(DEPTH) * body[i].mass)
                                body[i].force.x += FORCE.x;
                                body[i].force.y += FORCE.y - body[i].mass * simulation.g * 1.5; //kick up a bit to give them some arc
                            }
                        }
                        for (let i = 0, len = powerUp.length; i < len; ++i) { //push away blocks when firing
                            const SUB = Vector.sub(powerUp[i].position, m.pos)
                            const DISTANCE = Vector.magnitude(SUB)
                            if (DISTANCE < range) {
                                const DEPTH = Math.min(range - DISTANCE, 500)
                                const FORCE = Vector.mult(Vector.normalise(SUB), 0.002 * Math.sqrt(DEPTH) * powerUp[i].mass)
                                powerUp[i].force.x += FORCE.x;
                                powerUp[i].force.y += FORCE.y - powerUp[i].mass * simulation.g * 1.5; //kick up a bit to give them some arc
                            }
                        }

                        const recoil = Vector.mult(Vector.normalise(Vector.sub(where, m.pos)), input.down ? 0.03 : 0.06)
                        player.force.x -= recoil.x
                        player.force.y -= recoil.y
                        tech.harpoonDensity = 0.008 //0.001 is normal for blocks,  0.005 is normal for harpoon,  0.005*6 when buffed

                        const harpoonSize = tech.isLargeHarpoon ? 1 + 0.1 * Math.sqrt(this.ammo) : 1
                        if (tech.extraHarpoons) {
                            let targetCount = 0
                            const SPREAD = 0.06 + 0.05 * (!input.down)
                            let angle = m.angle - SPREAD * tech.extraHarpoons / 2;
                            const dir = { x: Math.cos(angle), y: Math.sin(angle) }; //make a vector for the player's direction of length 1; used in dot product

                            for (let i = 0, len = mob.length; i < len; ++i) {
                                if (mob[i].alive && !mob[i].isBadTarget && !mob[i].shield && Matter.Query.ray(map, m.pos, mob[i].position).length === 0) {
                                    const dot = Vector.dot(dir, Vector.normalise(Vector.sub(mob[i].position, m.pos))) //the dot product of diff and dir will return how much over lap between the vectors
                                    const dist = Vector.magnitude(Vector.sub(where, mob[i].position))
                                    // console.log(dot, 0.95 - Math.min(dist * 0.00015, 0.3))
                                    if (dot > 0.95 - Math.min(dist * 0.00015, 0.3)) { //lower dot product threshold for targeting then if you only have one harpoon //target closest mob that player is looking at and isn't too close to target
                                        //if (this.ammo > -1) {
                                            this.ammo--
                                            b.harpoon(where, input.down ? mob[i] : null, angle, harpoonSize, false) //Vector.angle(Vector.sub(where, mob[i].position), { x: 0, y: 0 })
                                            angle += SPREAD
                                            targetCount++
                                            if (targetCount > tech.extraHarpoons) break
                                        //}
                                    }
                                }
                            }
                            //if more harpoons and no targets left
                            if (targetCount < tech.extraHarpoons + 1) {
                                const num = tech.extraHarpoons + 1 - targetCount
                                for (let i = 0; i < num; i++) {
                                    //if (this.ammo > -1) {
                                    //    this.ammo--
                                        b.harpoon(where, null, angle, harpoonSize, false)
                                        angle += SPREAD
                                    //}
                                }
                            }
                            //this.ammo++ //make up for the ammo used up in fire()
                            simulation.updateGunHUD();
                        } else {
                            //look for closest mob in player's LoS
                            const dir = { x: Math.cos(m.angle), y: Math.sin(m.angle) }; //make a vector for the player's direction of length 1; used in dot product
                            for (let i = 0, len = mob.length; i < len; ++i) {
                                if (mob[i].alive && !mob[i].isBadTarget && Matter.Query.ray(map, m.pos, mob[i].position).length === 0) {
                                    const dot = Vector.dot(dir, Vector.normalise(Vector.sub(mob[i].position, m.pos))) //the dot product of diff and dir will return how much over lap between the vectors
                                    const dist = Vector.magnitude(Vector.sub(where, mob[i].position))
                                    if (dist < closest.distance && dot > 0.98 - Math.min(dist * 0.00014, 0.3)) { //target closest mob that player is looking at and isn't too close to target
                                        closest.distance = dist
                                        closest.target = mob[i]
                                    }
                                }
                            }
                            b.harpoon(where, input.down ? closest.target : null, m.angle, harpoonSize, false)
                        }

                        this.charge = 0;
                    } else { //charging
                        if (tech.isFireMoveLock) {
                            Matter.Body.setVelocity(player, {
                                x: 0,
                                y: -55 * player.mass * simulation.g //undo gravity before it is added
                            });
                            player.force.x = 0
                            player.force.y = 0
                        }
                        m.fireCDcycle = m.cycle + 10 //can't fire until mouse is released
                        const previousCharge = this.charge
                        //small b.fireCDscale = faster shots, b.fireCDscale=1 = normal shot,  big b.fireCDscale = slower chot
                        let smoothRate = tech.isCapacitor ? 0.85 : Math.min(0.998, 0.985 * (0.98 + 0.02 * b.fireCDscale))
                        if (input.down) smoothRate *= 0.995

                        this.charge = this.charge * smoothRate + 1 - smoothRate
                        m.energy += (this.charge - previousCharge) * ((tech.isRailEnergyGain ? 0.5 : -0.3)) //energy drain is proportional to charge gained, but doesn't stop normal m.fieldRegen

                        //draw magnetic field
                        const X = m.pos.x
                        const Y = m.pos.y
                        const unitVector = { x: Math.cos(m.angle), y: Math.sin(m.angle) }
                        const unitVectorPerp = Vector.perp(unitVector)

                        function magField(mag, arc) {
                            ctx.moveTo(X, Y);
                            ctx.bezierCurveTo(
                                X + unitVector.x * mag, Y + unitVector.y * mag,
                                X + unitVector.x * mag + unitVectorPerp.x * arc, Y + unitVector.y * mag + unitVectorPerp.y * arc,
                                X + unitVectorPerp.x * arc, Y + unitVectorPerp.y * arc)
                            ctx.bezierCurveTo(
                                X - unitVector.x * mag + unitVectorPerp.x * arc, Y - unitVector.y * mag + unitVectorPerp.y * arc,
                                X - unitVector.x * mag, Y - unitVector.y * mag,
                                X, Y)
                        }
                        ctx.fillStyle = `rgba(50,0,100,0.05)`;
                        for (let i = 3; i < 7; i++) {
                            const MAG = 8 * i * i * this.charge * (0.93 + 0.07 * Math.random())
                            const ARC = 6 * i * i * this.charge * (0.93 + 0.07 * Math.random())
                            ctx.beginPath();
                            magField(MAG, ARC)
                            magField(MAG, -ARC)
                            ctx.fill();
                        }
                    }
                }
            },
            railFire() {
                m.fireCDcycle = m.cycle + 10 //can't fire until mouse is released
                this.charge += 0.00001
            },
            grappleFire() {
                const harpoonSize = (tech.isLargeHarpoon ? 1 + 0.1 * Math.sqrt(this.ammo) : 1) //* (input.down ? 0.7 : 1)
                const where = {
                    x: m.pos.x + harpoonSize * 40 * Math.cos(m.angle),
                    y: m.pos.y + harpoonSize * 40 * Math.sin(m.angle)
                }
                if (tech.extraHarpoons && !input.down) { //multiple harpoons
                    const SPREAD = 0.06
                    const len = tech.extraHarpoons + 1
                    let angle = m.angle - SPREAD * len / 2;
                    for (let i = 0; i < len; i++) {
                        if (this.ammo > 0) {
                            this.ammo--
                            b.grapple(where, angle, true, harpoonSize)
                            angle += SPREAD
                        }
                    }
                    this.ammo++ //make up for the ammo used up in fire()
                    simulation.updateGunHUD();
                    m.fireCDcycle = m.cycle + Math.floor(75 * b.fireCDscale) // cool down
                    // } else if (input.down) {
                    //     b.harpoon(where, null, m.angle, harpoonSize, false, 70)
                } else {
                    if (tech.crouchAmmoCount) tech.crouchAmmoCount = 1
                    b.grapple(where, m.angle, harpoonSize)
                }
                m.fireCDcycle = m.cycle + Math.floor(75 * b.fireCDscale) // cool down
            },
            harpoonFire() {
                const where = {
                    x: m.pos.x + 30 * Math.cos(m.angle),
                    y: m.pos.y + 30 * Math.sin(m.angle)
                }
                const closest = {
                    distance: 10000,
                    target: null
                }
                //look for closest mob in player's LoS
                const harpoonSize = (tech.isLargeHarpoon ? 1 + 0.1 * Math.sqrt(this.ammo) : 1) //* (input.down ? 0.7 : 1)
                const totalCycles = 6 * (tech.isFilament ? 1 + 0.01 * Math.min(110, this.ammo) : 1) * Math.sqrt(harpoonSize)

                if (tech.extraHarpoons && !input.down) { //multiple harpoons
                    const SPREAD = 0.1
                    let angle = m.angle - SPREAD * tech.extraHarpoons / 2;
                    const dir = { x: Math.cos(angle), y: Math.sin(angle) }; //make a vector for the player's direction of length 1; used in dot product
                    const range = 450 * (tech.isFilament ? 1 + 0.005 * Math.min(110, this.ammo) : 1)
                    let targetCount = 0
                    for (let i = 0, len = mob.length; i < len; ++i) {
                        if (mob[i].alive && !mob[i].isBadTarget && !mob[i].shield && Matter.Query.ray(map, m.pos, mob[i].position).length === 0) {
                            const dot = Vector.dot(dir, Vector.normalise(Vector.sub(mob[i].position, m.pos))) //the dot product of diff and dir will return how much over lap between the vectors
                            const dist = Vector.magnitude(Vector.sub(where, mob[i].position))
                            if (dist < range && dot > 0.9) { //lower dot product threshold for targeting then if you only have one harpoon //target closest mob that player is looking at and isn't too close to target
                                if (this.ammo > 0) {
                                    this.ammo--
                                    b.harpoon(where, mob[i], angle, harpoonSize, true, totalCycles) //Vector.angle(Vector.sub(where, mob[i].position), { x: 0, y: 0 })
                                    angle += SPREAD
                                    targetCount++
                                    if (targetCount > tech.extraHarpoons) break
                                }
                            }
                        }
                    }
                    //if more harpoons and no targets left
                    if (targetCount < tech.extraHarpoons + 1) {
                        const num = tech.extraHarpoons + 1 - targetCount
                        for (let i = 0; i < num; i++) {
                            if (this.ammo > 0) {
                                this.ammo--
                                b.harpoon(where, null, angle, harpoonSize, true, totalCycles) //Vector.angle(Vector.sub(where, mob[i].position), { x: 0, y: 0 })
                                angle += SPREAD
                            }
                        }
                    }
                    this.ammo++ //make up for the ammo used up in fire()
                    simulation.updateGunHUD();
                    m.fireCDcycle = m.cycle + 90 // cool down
                } else {
                    //single harpoon
                    const dir = { x: Math.cos(m.angle), y: Math.sin(m.angle) }; //make a vector for the player's direction of length 1; used in dot product
                    for (let i = 0, len = mob.length; i < len; ++i) {
                        if (mob[i].alive && !mob[i].isBadTarget && Matter.Query.ray(map, m.pos, mob[i].position).length === 0) {
                            const dot = Vector.dot(dir, Vector.normalise(Vector.sub(mob[i].position, m.pos))) //the dot product of diff and dir will return how much over lap between the vectors
                            const dist = Vector.magnitude(Vector.sub(where, mob[i].position))
                            if (dist < closest.distance && dot > 0.98 - Math.min(dist * 0.00014, 0.3)) { //target closest mob that player is looking at and isn't too close to target
                                closest.distance = dist
                                closest.target = mob[i]
                            }
                        }
                    }
                    if (input.down) {
                        b.harpoon(where, null, m.angle, harpoonSize, true, 1.5 * totalCycles, (input.down && tech.crouchAmmoCount && (tech.crouchAmmoCount - 1) % 2) ? false : true)
                    } else {
                        b.harpoon(where, closest.target, m.angle, harpoonSize, true, totalCycles)
                    }
                    m.fireCDcycle = m.cycle + 45 // cool down
                }
                const recoil = Vector.mult(Vector.normalise(Vector.sub(where, m.pos)), input.down ? 0.015 : 0.035)
                player.force.x -= recoil.x
                player.force.y -= recoil.y
                tech.harpoonDensity = 0.005 //0.001 is normal for blocks,  0.005 is normal for harpoon,  0.005*6 when buffed
            },
            // railGun2() {
            //     const where = {
            //         x: m.pos.x + 30 * Math.cos(m.angle),
            //         y: m.pos.y + 30 * Math.sin(m.angle)
            //     }
            //     const closest = {
            //         distance: 10000,
            //         target: null
            //     }
            //     //look for closest mob in player's LoS
            //     const dir = { x: Math.cos(m.angle), y: Math.sin(m.angle) }; //make a vector for the player's direction of length 1; used in dot product
            //     const harpoonSize = tech.isLargeHarpoon ? 1 + 0.1 * Math.sqrt(this.ammo) : 1
            //     const totalCycles = 7 * (tech.isFilament ? 1 + 0.01 * Math.min(110, this.ammo) : 1) * Math.sqrt(harpoonSize)

            //     function pushAway(range) { //push away blocks when firing
            //         for (let i = 0, len = mob.length; i < len; ++i) {
            //             const SUB = Vector.sub(mob[i].position, m.pos)
            //             const DISTANCE = Vector.magnitude(SUB)
            //             if (DISTANCE < range) {
            //                 const DEPTH = Math.min(range - DISTANCE, 1500)
            //                 const FORCE = Vector.mult(Vector.normalise(SUB), 0.001 * Math.sqrt(DEPTH) * mob[i].mass)
            //                 mob[i].force.x += FORCE.x;
            //                 mob[i].force.y += FORCE.y;
            //             }
            //         }
            //         for (let i = 0, len = body.length; i < len; ++i) {
            //             const SUB = Vector.sub(body[i].position, m.pos)
            //             const DISTANCE = Vector.magnitude(SUB)
            //             if (DISTANCE < range) {
            //                 const DEPTH = Math.min(range - DISTANCE, 500)
            //                 const FORCE = Vector.mult(Vector.normalise(SUB), 0.002 * Math.sqrt(DEPTH) * body[i].mass)
            //                 body[i].force.x += FORCE.x;
            //                 body[i].force.y += FORCE.y - body[i].mass * simulation.g * 1.5; //kick up a bit to give them some arc
            //             }
            //         }
            //     }

            //     const me = bullet.length;
            //     bullet[me] = Bodies.rectangle(0, 0, 0.015, 0.0015, { //start as a small shape that can't even be seen
            //         vertexGoal: [{ x: -40 * harpoonSize, y: 2 * harpoonSize, index: 0, isInternal: false }, { x: -40 * harpoonSize, y: -2 * harpoonSize, index: 1, isInternal: false }, { x: 50 * harpoonSize, y: -3 * harpoonSize, index: 3, isInternal: false }, { x: 30 * harpoonSize, y: 2 * harpoonSize, index: 4, isInternal: false }],
            //         density: 0.03, //0.001 is normal
            //         restitution: 0,
            //         frictionAir: 0,
            //         dmg: 0, //damage done in addition to the damage from momentum
            //         classType: "bullet",
            //         collisionFilter: {
            //             category: 0,
            //             mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield
            //         },
            //         minDmgSpeed: 5,
            //         beforeDmg(who) {
            //             if (tech.isShieldPierce && who.isShielded) { //disable shields
            //                 who.isShielded = false
            //                 requestAnimationFrame(() => { who.isShielded = true });
            //             }
            //             if (who.shield && !tech.isShieldPierce) {
            //                 for (let i = 0, len = mob.length; i < len; i++) {
            //                     if (mob[i].id === who.shieldTargetID) { //apply some knock back to shield mob before shield breaks
            //                         Matter.Body.setVelocity(mob[i], Vector.mult(Vector.normalise(this.velocity), 10));
            //                         break
            //                     }
            //                 }
            //                 Matter.Body.setVelocity(this, { x: -0.4 * this.velocity.x, y: -0.4 * this.velocity.y });
            //             } else {
            //                 if (tech.fragments && this.speed > 10) {
            //                     b.targetedNail(this.position, tech.fragments * 13)
            //                     this.endCycle = 0 //triggers despawn
            //                 }
            //             }
            //         },
            //         onEnd() {}
            //     });
            //     m.fireCDcycle = Infinity; // cool down
            //     Composite.add(engine.world, bullet[me]); //add bullet to world
            //     bullet[me].endCycle = Infinity
            //     bullet[me].charge = 0;
            //     bullet[me].do = function() {
            //         if ((m.energy < 0.005 && !tech.isRailEnergyGain) || (!input.down && !tech.isRailGun)) {
            //             m.energy += 0.05 + this.charge * 0.2
            //             m.fireCDcycle = m.cycle + 120; // cool down if out of energy
            //             this.endCycle = 0;
            //             b.refundAmmo()
            //             return
            //         }

            //         if ((!input.fire && this.charge > 0.6)) { //fire on mouse release or on low energy
            //             Matter.Body.setVertices(this, this.vertexGoal) //take on harpoon shape
            //             m.fireCDcycle = m.cycle + 2; // set fire cool down
            //             //normal bullet behavior occurs after firing, overwrites this function
            //             this.endCycle = simulation.cycle + 140
            //             this.collisionFilter.category = cat.bullet
            //             Matter.Body.setPosition(this, { x: m.pos.x, y: m.pos.y })
            //             Matter.Body.setAngle(this, m.angle)
            //             const speed = 120
            //             Matter.Body.setVelocity(this, {
            //                 x: m.Vx / 2 + speed * this.charge * Math.cos(m.angle),
            //                 y: m.Vy / 2 + speed * this.charge * Math.sin(m.angle)
            //             });
            //             this.do = function() {
            //                 this.force.y += this.mass * 0.0003 / this.charge; // low gravity that scales with charge
            //             }
            //             const KNOCK = ((input.down) ? 0.1 : 0.5) * this.charge * this.charge
            //             player.force.x -= KNOCK * Math.cos(m.angle)
            //             player.force.y -= KNOCK * Math.sin(m.angle) * 0.35 //reduce knock back in vertical direction to stop super jumps
            //             pushAway(1200 * this.charge)
            //         } else { // charging on mouse down
            //             if (tech.isFireMoveLock) {
            //                 Matter.Body.setVelocity(player, {
            //                     x: 0,
            //                     y: -55 * player.mass * simulation.g //undo gravity before it is added
            //                 });
            //                 player.force.x = 0
            //                 player.force.y = 0
            //             }

            //             m.fireCDcycle = Infinity //can't fire until mouse is released
            //             const previousCharge = this.charge
            //             //small b.fireCDscale = faster shots, b.fireCDscale=1 = normal shot,  big b.fireCDscale = slower chot
            //             let smoothRate = tech.isCapacitor ? 0.85 : Math.min(0.998, 0.985 * (0.98 + 0.02 * b.fireCDscale))

            //             this.charge = this.charge * smoothRate + 1 - smoothRate
            //             m.energy += (this.charge - previousCharge) * (tech.isRailEnergyGain ? 1 : -0.25) //energy drain is proportional to charge gained, but doesn't stop normal m.fieldRegen
            //             //draw targeting
            //             let best;
            //             let range = 3000
            //             const dir = m.angle
            //             const path = [{
            //                     x: m.pos.x + 20 * Math.cos(dir),
            //                     y: m.pos.y + 20 * Math.sin(dir)
            //                 },
            //                 {
            //                     x: m.pos.x + range * Math.cos(dir),
            //                     y: m.pos.y + range * Math.sin(dir)
            //                 }
            //             ];
            //             const vertexCollision = function(v1, v1End, domain) {
            //                 for (let i = 0; i < domain.length; ++i) {
            //                     let vertices = domain[i].vertices;
            //                     const len = vertices.length - 1;
            //                     for (let j = 0; j < len; j++) {
            //                         results = simulation.checkLineIntersection(v1, v1End, vertices[j], vertices[j + 1]);
            //                         if (results.onLine1 && results.onLine2) {
            //                             const dx = v1.x - results.x;
            //                             const dy = v1.y - results.y;
            //                             const dist2 = dx * dx + dy * dy;
            //                             if (dist2 < best.dist2) {
            //                                 best = {
            //                                     x: results.x,
            //                                     y: results.y,
            //                                     dist2: dist2,
            //                                     who: domain[i],
            //                                     v1: vertices[j],
            //                                     v2: vertices[j + 1]
            //                                 };
            //                             }
            //                         }
            //                     }
            //                     results = simulation.checkLineIntersection(v1, v1End, vertices[0], vertices[len]);
            //                     if (results.onLine1 && results.onLine2) {
            //                         const dx = v1.x - results.x;
            //                         const dy = v1.y - results.y;
            //                         const dist2 = dx * dx + dy * dy;
            //                         if (dist2 < best.dist2) {
            //                             best = {
            //                                 x: results.x,
            //                                 y: results.y,
            //                                 dist2: dist2,
            //                                 who: domain[i],
            //                                 v1: vertices[0],
            //                                 v2: vertices[len]
            //                             };
            //                         }
            //                     }
            //                 }
            //             };

            //             //check for collisions
            //             best = { x: null, y: null, dist2: Infinity, who: null, v1: null, v2: null };
            //             vertexCollision(path[0], path[1], mob);
            //             vertexCollision(path[0], path[1], map);
            //             vertexCollision(path[0], path[1], body);
            //             if (best.dist2 != Infinity) path[path.length - 1] = { x: best.x, y: best.y }; //if hitting something
            //             //draw beam
            //             ctx.beginPath();
            //             ctx.moveTo(path[0].x, path[0].y);
            //             ctx.lineTo(path[1].x, path[1].y);
            //             ctx.strokeStyle = `rgba(100,0,180,0.7)`;
            //             ctx.lineWidth = this.charge * 1
            //             ctx.setLineDash([10, 20]);
            //             ctx.stroke();
            //             ctx.setLineDash([]);
            //             //draw magnetic field
            //             const X = m.pos.x
            //             const Y = m.pos.y
            //             const unitVector = { x: Math.cos(m.angle), y: Math.sin(m.angle) }
            //             const unitVectorPerp = Vector.perp(unitVector)

            //             function magField(mag, arc) {
            //                 ctx.moveTo(X, Y);
            //                 ctx.bezierCurveTo(
            //                     X + unitVector.x * mag, Y + unitVector.y * mag,
            //                     X + unitVector.x * mag + unitVectorPerp.x * arc, Y + unitVector.y * mag + unitVectorPerp.y * arc,
            //                     X + unitVectorPerp.x * arc, Y + unitVectorPerp.y * arc)
            //                 ctx.bezierCurveTo(
            //                     X - unitVector.x * mag + unitVectorPerp.x * arc, Y - unitVector.y * mag + unitVectorPerp.y * arc,
            //                     X - unitVector.x * mag, Y - unitVector.y * mag,
            //                     X, Y)
            //             }
            //             ctx.fillStyle = `rgba(50,0,100,0.05)`;
            //             for (let i = 3; i < 7; i++) {
            //                 const MAG = 8 * i * i * this.charge * (0.93 + 0.07 * Math.random())
            //                 const ARC = 6 * i * i * this.charge * (0.93 + 0.07 * Math.random())
            //                 ctx.beginPath();
            //                 magField(MAG, ARC)
            //                 magField(MAG, -ARC)
            //                 ctx.fill();
            //             }
            //         }
            //     }
            // },
        }, {
            name: "mine",
            description: "toss a <strong>proximity</strong> mine that <strong>sticks</strong> to walls<br>refund <strong>undetonated</strong> mines on <strong>exiting</strong> a level", //fires <strong>nails</strong> at mobs within range
            ammo: 0,
            ammoPack: 1.25,
            defaultAmmoPack: 1.25,
            have: false,
            do() {
                if (!input.field && input.down && !tech.isLaserMine) {
                    const cycles = 60 //30
                    const speed = 40
                    const v = { x: speed * Math.cos(m.angle), y: speed * Math.sin(m.angle) } //m.Vy / 2 + removed to make the path less jerky
                    ctx.strokeStyle = "rgba(68, 68, 68, 0.2)" //color.map
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    for (let i = 1.5, len = 19; i < len + 1; i++) {
                        const time = cycles * i / len
                        ctx.lineTo(m.pos.x + time * v.x, m.pos.y + time * v.y + 0.34 * time * time)
                    }
                    ctx.stroke()
                }
            },
            fire() {
                if (input.down) {
                    if (tech.isLaserMine) {
                        const speed = 30
                        const velocity = { x: speed * Math.cos(m.angle), y: speed * Math.sin(m.angle) }
                        b.laserMine(m.pos, velocity)
                        m.fireCDcycle = m.cycle + Math.floor(65 * b.fireCDscale); // cool down
                    } else {
                        const pos = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }
                        let speed = 36
                        if (Matter.Query.point(map, pos).length > 0) speed = -2 //don't launch if mine will spawn inside map
                        b.mine(pos, { x: speed * Math.cos(m.angle), y: speed * Math.sin(m.angle) }, 0)
                        m.fireCDcycle = m.cycle + Math.floor(55 * b.fireCDscale); // cool down
                    }
                } else {
                    const pos = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }
                    let speed = 23
                    if (Matter.Query.point(map, pos).length > 0) speed = -2 //don't launch if mine will spawn inside map
                    b.mine(pos, { x: speed * Math.cos(m.angle), y: speed * Math.sin(m.angle) }, 0)
                    m.fireCDcycle = m.cycle + Math.floor(35 * b.fireCDscale); // cool down
                }
            }
        },
        // {
        //     name: "railgun",
        //     description: "use <strong class='color-f'>energy</strong> to launch a high-speed <strong>dense</strong> rod<br><strong>hold</strong> left mouse to charge, <strong>release</strong> to fire",
        //     ammo: 0,
        //     ammoPack: 3.8,
        //     have: false,
        //     do() {},
        //     fire() {
        //         function pushAway(range) { //push away blocks when firing
        //             for (let i = 0, len = mob.length; i < len; ++i) {
        //                 const SUB = Vector.sub(mob[i].position, m.pos)
        //                 const DISTANCE = Vector.magnitude(SUB)
        //                 if (DISTANCE < range) {
        //                     const DEPTH = Math.min(range - DISTANCE, 1500)
        //                     const FORCE = Vector.mult(Vector.normalise(SUB), 0.001 * Math.sqrt(DEPTH) * mob[i].mass)
        //                     mob[i].force.x += FORCE.x;
        //                     mob[i].force.y += FORCE.y;
        //                 }
        //             }
        //             for (let i = 0, len = body.length; i < len; ++i) {
        //                 const SUB = Vector.sub(body[i].position, m.pos)
        //                 const DISTANCE = Vector.magnitude(SUB)
        //                 if (DISTANCE < range) {
        //                     const DEPTH = Math.min(range - DISTANCE, 500)
        //                     const FORCE = Vector.mult(Vector.normalise(SUB), 0.002 * Math.sqrt(DEPTH) * body[i].mass)
        //                     body[i].force.x += FORCE.x;
        //                     body[i].force.y += FORCE.y - body[i].mass * simulation.g * 1.5; //kick up a bit to give them some arc
        //                 }
        //             }
        //         }

        //         if (tech.isCapacitor) {
        //             if ((m.energy > 0.16 || tech.isRailEnergyGain)) { //&& m.immuneCycle < m.cycle
        //                 m.energy += 0.16 * (tech.isRailEnergyGain ? 2.5 : -1)
        //                 m.fireCDcycle = m.cycle + Math.floor(40 * b.fireCDscale);
        //                 const me = bullet.length;
        //                 bullet[me] = Bodies.rectangle(m.pos.x + 50 * Math.cos(m.angle), m.pos.y + 50 * Math.sin(m.angle), 60, 14, {
        //                     density: 0.005, //0.001 is normal
        //                     restitution: 0,
        //                     frictionAir: 0,
        //                     angle: m.angle,
        //                     dmg: 0, //damage done in addition to the damage from momentum
        //                     classType: "bullet",
        //                     collisionFilter: {
        //                         category: cat.bullet,
        //                         mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield
        //                     },
        //                     minDmgSpeed: 5,
        //                     endCycle: simulation.cycle + 140,
        //                     beforeDmg(who) {
        //                         if (who.shield) {
        //                             for (let i = 0, len = mob.length; i < len; i++) {
        //                                 if (mob[i].id === who.shieldTargetID) { //apply some knock back to shield mob before shield breaks
        //                                     Matter.Body.setVelocity(mob[i], Vector.mult(Vector.normalise(this.velocity), 10));
        //                                     break
        //                                 }
        //                             }
        //                             Matter.Body.setVelocity(this, {
        //                                 x: -0.5 * this.velocity.x,
        //                                 y: -0.5 * this.velocity.y
        //                             });
        //                             // Matter.Body.setDensity(this, 0.001);
        //                         }
        //                         if (tech.fragments && this.speed > 10) {
        //                             b.targetedNail(this.position, tech.fragments * 13)
        //                             this.endCycle = 0 //triggers despawn
        //                         }
        //                     },
        //                     onEnd() {},
        //                     drawCycle: Math.floor(10 * b.fireCDscale),
        //                     do() {
        //                         this.force.y += this.mass * 0.0003; // low gravity that scales with charge
        //                         if (this.drawCycle > 0) {
        //                             this.drawCycle--
        //                             //draw magnetic field
        //                             const X = m.pos.x
        //                             const Y = m.pos.y
        //                             // const unitVector = Vector.normalise(Vector.sub(simulation.mouseInGame, m.pos))
        //                             const unitVector = { x: Math.cos(m.angle), y: Math.sin(m.angle) }
        //                             const unitVectorPerp = Vector.perp(unitVector)

        //                             function magField(mag, arc) {
        //                                 ctx.moveTo(X, Y);
        //                                 ctx.bezierCurveTo(
        //                                     X + unitVector.x * mag, Y + unitVector.y * mag,
        //                                     X + unitVector.x * mag + unitVectorPerp.x * arc, Y + unitVector.y * mag + unitVectorPerp.y * arc,
        //                                     X + unitVectorPerp.x * arc, Y + unitVectorPerp.y * arc)
        //                                 ctx.bezierCurveTo(
        //                                     X - unitVector.x * mag + unitVectorPerp.x * arc, Y - unitVector.y * mag + unitVectorPerp.y * arc,
        //                                     X - unitVector.x * mag, Y - unitVector.y * mag,
        //                                     X, Y)
        //                             }
        //                             ctx.fillStyle = `rgba(50,0,100,0.05)`;
        //                             for (let i = 3; i < 7; i++) {
        //                                 const MAG = 8 * i * i * (0.93 + 0.07 * Math.random()) * (0.95 + 0.1 * Math.random())
        //                                 const ARC = 6 * i * i * (0.93 + 0.07 * Math.random()) * (0.95 + 0.1 * Math.random())
        //                                 ctx.beginPath();
        //                                 magField(MAG, ARC)
        //                                 magField(MAG, -ARC)
        //                                 ctx.fill();
        //                             }
        //                         }
        //                     }
        //                 });
        //                 Composite.add(engine.world, bullet[me]); //add bullet to world

        //                 const speed = 67
        //                 Matter.Body.setVelocity(bullet[me], {
        //                     x: m.Vx / 2 + speed * Math.cos(m.angle),
        //                     y: m.Vy / 2 + speed * Math.sin(m.angle)
        //                 });

        //                 //knock back
        //                 const KNOCK = (input.down ? 0.08 : 0.34)
        //                 player.force.x -= KNOCK * Math.cos(m.angle)
        //                 player.force.y -= KNOCK * Math.sin(m.angle) * 0.35 //reduce knock back in vertical direction to stop super jumps
        //                 pushAway(800)
        //             } else {
        //                 b.refundAmmo()
        //                 m.fireCDcycle = m.cycle + Math.floor(120);
        //             }
        //         } else {
        //             const me = bullet.length;
        //             bullet[me] = Bodies.rectangle(0, 0, 0.015, 0.0015, {
        //                 density: 0.008, //0.001 is normal
        //                 restitution: 0,
        //                 frictionAir: 0,
        //                 dmg: 0, //damage done in addition to the damage from momentum
        //                 classType: "bullet",
        //                 collisionFilter: {
        //                     category: 0,
        //                     mask: cat.map | cat.body | cat.mob | cat.mobBullet | cat.mobShield
        //                 },
        //                 minDmgSpeed: 5,
        //                 beforeDmg(who) {
        //                     if (who.shield) {
        //                         for (let i = 0, len = mob.length; i < len; i++) {
        //                             if (mob[i].id === who.shieldTargetID) { //apply some knock back to shield mob before shield breaks
        //                                 Matter.Body.setVelocity(mob[i], Vector.mult(Vector.normalise(this.velocity), 10));
        //                                 break
        //                             }
        //                         }
        //                         Matter.Body.setVelocity(this, {
        //                             x: -0.5 * this.velocity.x,
        //                             y: -0.5 * this.velocity.y
        //                         });
        //                     }
        //                     if (tech.fragments && this.speed > 10) {
        //                         b.targetedNail(this.position, tech.fragments * 17)
        //                         this.endCycle = 0 //triggers despawn
        //                     }
        //                 },
        //                 onEnd() {}
        //             });
        //             m.fireCDcycle = Infinity; // cool down
        //             Composite.add(engine.world, bullet[me]); //add bullet to world
        //             bullet[me].endCycle = Infinity
        //             bullet[me].charge = 0;
        //             bullet[me].do = function() {
        //                 if (m.energy < 0.005 && !tech.isRailEnergyGain) {
        //                     m.energy += 0.05 + this.charge * 0.2
        //                     m.fireCDcycle = m.cycle + 120; // cool down if out of energy
        //                     this.endCycle = 0;
        //                     b.refundAmmo()
        //                     return
        //                 }

        //                 if ((!input.fire && this.charge > 0.6)) { //fire on mouse release or on low energy
        //                     m.fireCDcycle = m.cycle + 2; // set fire cool down
        //                     //normal bullet behavior occurs after firing, overwrites this function
        //                     Matter.Body.scale(this, 8000, 8000) // show the bullet by scaling it up  (don't judge me...  I know this is a bad way to do it)
        //                     this.endCycle = simulation.cycle + 140
        //                     this.collisionFilter.category = cat.bullet
        //                     Matter.Body.setPosition(this, {
        //                         x: m.pos.x,
        //                         y: m.pos.y
        //                     })
        //                     Matter.Body.setAngle(this, m.angle)
        //                     const speed = 90
        //                     Matter.Body.setVelocity(this, {
        //                         x: m.Vx / 2 + speed * this.charge * Math.cos(m.angle),
        //                         y: m.Vy / 2 + speed * this.charge * Math.sin(m.angle)
        //                     });

        //                     if (tech.isRodAreaDamage) {
        //                         this.auraRadius = 800
        //                         this.semiMinor = 0.5
        //                         this.where = { x: m.pos.x, y: m.pos.y }
        //                         this.velocityAura = { x: this.velocity.x, y: this.velocity.y }
        //                         this.angleAura = this.angle
        //                         this.do = function() {
        //                             this.force.y += this.mass * 0.0003 / this.charge; // low gravity that scales with charge
        //                             this.velocityAura.y += 0.085 / this.charge;
        //                             this.where = Vector.add(this.where, this.velocityAura)

        //                             //draw damage aura
        //                             this.semiMinor = this.semiMinor * 0.99
        //                             this.auraRadius = this.auraRadius * 0.99
        //                             let where = Vector.add(Vector.mult(this.velocityAura, -0.5), this.where)
        //                             ctx.beginPath();
        //                             ctx.ellipse(where.x, where.y, this.auraRadius * 0.25, this.auraRadius * 0.15 * this.semiMinor, this.angleAura, 0, 2 * Math.PI)
        //                             ctx.fillStyle = "rgba(255,100,0,0.75)";
        //                             ctx.fill();
        //                             where = Vector.add(Vector.mult(this.velocity, -1), where)
        //                             ctx.beginPath();
        //                             ctx.ellipse(where.x, where.y, this.auraRadius * 0.5, this.auraRadius * 0.5 * this.semiMinor, this.angleAura, 0, 2 * Math.PI)
        //                             ctx.fillStyle = "rgba(255,50,0,0.35)";
        //                             ctx.fill();
        //                             where = Vector.add(Vector.mult(this.velocity, -1), where)
        //                             ctx.beginPath();
        //                             ctx.ellipse(where.x, where.y, this.auraRadius * 0.75, this.auraRadius * 0.7 * this.semiMinor, this.angleAura, 0, 2 * Math.PI)
        //                             ctx.fillStyle = "rgba(255,0,0,0.15)";
        //                             ctx.fill();
        //                             where = Vector.add(Vector.mult(this.velocity, -1), where)
        //                             ctx.beginPath();
        //                             ctx.ellipse(where.x, where.y, this.auraRadius, this.auraRadius * this.semiMinor, this.angleAura, 0, 2 * Math.PI)
        //                             ctx.fillStyle = "rgba(255,0,0,0.03)";
        //                             ctx.fill();
        //                             //damage mobs in a circle based on this.semiMinor radius
        //                             if (this.auraRadius > 200) {
        //                                 for (let i = 0, len = mob.length; i < len; ++i) {
        //                                     const dist = Vector.magnitude(Vector.sub(mob[i].position, where))
        //                                     if (dist < mob[i].radius + this.auraRadius) {
        //                                         //push mob in direction of bullet
        //                                         const mag = 0.0001
        //                                         mob[i].force.x += mag * this.velocity.x;
        //                                         mob[i].force.y += mag * this.velocity.y;
        //                                         //damage mob
        //                                         const damage = m.dmgScale * 0.002 * dist
        //                                         mob[i].damage(damage);
        //                                         mob[i].locatePlayer();
        //                                         simulation.drawList.push({ //add dmg to draw queue
        //                                             x: mob[i].position.x,
        //                                             y: mob[i].position.y,
        //                                             radius: Math.log(2 * damage + 1.1) * 40,
        //                                             color: "rgba(255,0,0,0.25)",
        //                                             time: simulation.drawTime
        //                                         });
        //                                     }
        //                                 }
        //                             }
        //                             //push blocks power ups and mobs to the direction the rod is moving

        //                         }
        //                     } else {
        //                         this.do = function() {
        //                             this.force.y += this.mass * 0.0003 / this.charge; // low gravity that scales with charge
        //                         }
        //                     }

        //                     //knock back
        //                     const KNOCK = ((input.down) ? 0.1 : 0.5) * this.charge * this.charge
        //                     player.force.x -= KNOCK * Math.cos(m.angle)
        //                     player.force.y -= KNOCK * Math.sin(m.angle) * 0.35 //reduce knock back in vertical direction to stop super jumps
        //                     pushAway(1200 * this.charge)
        //                 } else { // charging on mouse down
        //                     if (tech.isFireMoveLock) {
        //                         Matter.Body.setVelocity(player, {
        //                             x: 0,
        //                             y: -55 * player.mass * simulation.g //undo gravity before it is added
        //                         });
        //                         player.force.x = 0
        //                         player.force.y = 0
        //                     }

        //                     m.fireCDcycle = Infinity //can't fire until mouse is released
        //                     const previousCharge = this.charge
        //                     let smoothRate = Math.min(0.998, (input.down ? 0.98 : 0.985) * (0.98 + 0.02 * b.fireCDscale)) //small b.fireCDscale = faster shots, b.fireCDscale=1 = normal shot,  big b.fireCDscale = slower chot
        //                     this.charge = this.charge * smoothRate + 1 - smoothRate
        //                     m.energy += (this.charge - previousCharge) * (tech.isRailEnergyGain ? 1 : -0.33) //energy drain is proportional to charge gained, but doesn't stop normal m.fieldRegen
        //                     //draw targeting
        //                     let best;
        //                     let range = 3000
        //                     const dir = m.angle
        //                     const path = [{
        //                             x: m.pos.x + 20 * Math.cos(dir),
        //                             y: m.pos.y + 20 * Math.sin(dir)
        //                         },
        //                         {
        //                             x: m.pos.x + range * Math.cos(dir),
        //                             y: m.pos.y + range * Math.sin(dir)
        //                         }
        //                     ];
        //                     const vertexCollision = function(v1, v1End, domain) {
        //                         for (let i = 0; i < domain.length; ++i) {
        //                             let vertices = domain[i].vertices;
        //                             const len = vertices.length - 1;
        //                             for (let j = 0; j < len; j++) {
        //                                 results = simulation.checkLineIntersection(v1, v1End, vertices[j], vertices[j + 1]);
        //                                 if (results.onLine1 && results.onLine2) {
        //                                     const dx = v1.x - results.x;
        //                                     const dy = v1.y - results.y;
        //                                     const dist2 = dx * dx + dy * dy;
        //                                     if (dist2 < best.dist2) {
        //                                         best = {
        //                                             x: results.x,
        //                                             y: results.y,
        //                                             dist2: dist2,
        //                                             who: domain[i],
        //                                             v1: vertices[j],
        //                                             v2: vertices[j + 1]
        //                                         };
        //                                     }
        //                                 }
        //                             }
        //                             results = simulation.checkLineIntersection(v1, v1End, vertices[0], vertices[len]);
        //                             if (results.onLine1 && results.onLine2) {
        //                                 const dx = v1.x - results.x;
        //                                 const dy = v1.y - results.y;
        //                                 const dist2 = dx * dx + dy * dy;
        //                                 if (dist2 < best.dist2) {
        //                                     best = {
        //                                         x: results.x,
        //                                         y: results.y,
        //                                         dist2: dist2,
        //                                         who: domain[i],
        //                                         v1: vertices[0],
        //                                         v2: vertices[len]
        //                                     };
        //                                 }
        //                             }
        //                         }
        //                     };

        //                     //check for collisions
        //                     best = {
        //                         x: null,
        //                         y: null,
        //                         dist2: Infinity,
        //                         who: null,
        //                         v1: null,
        //                         v2: null
        //                     };
        //                     vertexCollision(path[0], path[1], mob);
        //                     vertexCollision(path[0], path[1], map);
        //                     vertexCollision(path[0], path[1], body);
        //                     if (best.dist2 != Infinity) { //if hitting something
        //                         path[path.length - 1] = {
        //                             x: best.x,
        //                             y: best.y
        //                         };
        //                     }

        //                     //draw beam
        //                     ctx.beginPath();
        //                     ctx.moveTo(path[0].x, path[0].y);
        //                     ctx.lineTo(path[1].x, path[1].y);
        //                     ctx.strokeStyle = `rgba(100,0,180,0.7)`;
        //                     ctx.lineWidth = this.charge * 1
        //                     ctx.setLineDash([10, 20]);
        //                     ctx.stroke();
        //                     ctx.setLineDash([]);

        //                     //draw magnetic field
        //                     const X = m.pos.x
        //                     const Y = m.pos.y
        //                     const unitVector = { x: Math.cos(m.angle), y: Math.sin(m.angle) }
        //                     //Vector.normalise(Vector.sub(simulation.mouseInGame, m.pos))
        //                     const unitVectorPerp = Vector.perp(unitVector)

        //                     function magField(mag, arc) {
        //                         ctx.moveTo(X, Y);
        //                         ctx.bezierCurveTo(
        //                             X + unitVector.x * mag, Y + unitVector.y * mag,
        //                             X + unitVector.x * mag + unitVectorPerp.x * arc, Y + unitVector.y * mag + unitVectorPerp.y * arc,
        //                             X + unitVectorPerp.x * arc, Y + unitVectorPerp.y * arc)
        //                         ctx.bezierCurveTo(
        //                             X - unitVector.x * mag + unitVectorPerp.x * arc, Y - unitVector.y * mag + unitVectorPerp.y * arc,
        //                             X - unitVector.x * mag, Y - unitVector.y * mag,
        //                             X, Y)
        //                     }
        //                     ctx.fillStyle = `rgba(50,0,100,0.05)`;
        //                     for (let i = 3; i < 7; i++) {
        //                         const MAG = 8 * i * i * this.charge * (0.93 + 0.07 * Math.random())
        //                         const ARC = 6 * i * i * this.charge * (0.93 + 0.07 * Math.random())
        //                         ctx.beginPath();
        //                         magField(MAG, ARC)
        //                         magField(MAG, -ARC)
        //                         ctx.fill();
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }, 
        {
            name: "laser",
            description: "emit a <strong>beam</strong> of collimated coherent <strong class='color-laser'>light</strong><br>drains <strong class='color-f'>energy</strong> instead of ammunition",
            ammo: 0,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            charge: 0,
            isStuckOn: false,
            do() {},
            fire() {},
            chooseFireMethod() {
                this.do = () => {
                    if (tech.isStuckOn) {
                        if (this.isStuckOn) {
                            if (!input.fire) this.fire();
                            if (m.energy < tech.laserFieldDrain * tech.isLaserDiode) this.isStuckOn = false
                        } else if (input.fire) {
                            this.isStuckOn = true
                        }
                    }
                };
                if (tech.isPulseLaser) {
                    this.fire = () => {
                        const drain = 0.01 * tech.isLaserDiode * (tech.isCapacitor ? 10 : 1)
                        if (m.energy > drain) {
                            // m.energy -= m.fieldRegen
                            if (this.charge < 50 * m.maxEnergy) {
                                m.energy -= drain
                                this.charge += drain * 100
                            }
                        }
                    }
                    if (tech.historyLaser) {
                        const len = 1 + tech.historyLaser
                        const spacing = Math.ceil(30 - 2 * tech.historyLaser)
                        this.do = () => {
                            if (this.charge > 0) {
                                //draw charge level
                                const mag = 4.1 * Math.sqrt(this.charge)
                                ctx.beginPath();
                                for (let i = 0; i < len; i++) {
                                    const history = m.history[(m.cycle - i * spacing) % 600]
                                    const off = history.yOff - 24.2859
                                    ctx.moveTo(history.position.x, history.position.y - off);
                                    ctx.ellipse(history.position.x, history.position.y - off, mag, mag * 0.65, history.angle, 0, 2 * Math.PI)
                                }
                                ctx.fillStyle = tech.isLaserDiode === 1 ? `rgba(255,0,0,${0.09 * Math.sqrt(this.charge)})` : `rgba(0,0,255,${0.09 * Math.sqrt(this.charge)})`;
                                ctx.fill();
                                //fire
                                if (!input.fire) {
                                    if (this.charge > 5) {
                                        m.fireCDcycle = m.cycle + Math.floor(35 * b.fireCDscale); // cool down
                                        for (let i = 0; i < len; i++) {
                                            const history = m.history[(m.cycle - i * spacing) % 600]
                                            const off = history.yOff - 24.2859
                                            b.pulse(1.65 * this.charge, history.angle, { x: history.position.x, y: history.position.y - off })
                                        }
                                    }
                                    this.charge = 0;
                                }
                            }
                        };
                    } else {
                        this.do = () => {
                            if (this.charge > 0) {
                                //draw charge level
                                ctx.beginPath();
                                ctx.arc(m.pos.x, m.pos.y, 4.2 * Math.sqrt(this.charge), 0, 2 * Math.PI);
                                // ctx.fillStyle = `rgba(255,0,0,${0.09 * Math.sqrt(this.charge)})`;
                                ctx.fillStyle = tech.isLaserDiode === 1 ? `rgba(255,0,0,${0.09 * Math.sqrt(this.charge)})` : `rgba(0,0,255,${0.09 * Math.sqrt(this.charge)})`;
                                ctx.fill();
                                //fire  
                                if (!input.fire) {
                                    if (this.charge > 5) {
                                        m.fireCDcycle = m.cycle + Math.floor(35 * b.fireCDscale); // cool down
                                        if (tech.beamSplitter) {
                                            const divergence = input.down ? 0.15 : 0.35
                                            const angle = m.angle - tech.beamSplitter * divergence / 2
                                            for (let i = 0; i < 1 + tech.beamSplitter; i++) b.pulse(this.charge, angle + i * divergence)
                                        } else {
                                            b.pulse(1.8 * this.charge, m.angle)
                                        }
                                    }
                                    this.charge = 0;
                                }
                            }
                        };
                    }

                } else if (tech.beamSplitter) {
                    this.fire = this.fireSplit
                } else if (tech.historyLaser) {
                    this.fire = this.fireHistory
                } else if (tech.isWideLaser) {
                    this.fire = this.fireWideBeam
                } else {
                    this.fire = this.fireLaser
                }
                // this.fire = this.firePhoton
            },
            // firePhoton() {
            //     m.fireCDcycle = m.cycle + Math.floor((tech.isPulseAim ? 25 : 50) * b.fireCDscale); // cool down
            //     b.photon({ x: m.pos.x + 23 * Math.cos(m.angle), y: m.pos.y + 23 * Math.sin(m.angle) }, m.angle)
            // },
            fireLaser() {
                if (m.energy < tech.laserFieldDrain) {
                    m.fireCDcycle = m.cycle + 100; // cool down if out of energy
                } else {
                    m.fireCDcycle = m.cycle
                    m.energy -= m.fieldRegen + tech.laserFieldDrain * tech.isLaserDiode
                    b.laser();
                }
            },
            firePulse() {

            },
            fireSplit() {
                if (m.energy < tech.laserFieldDrain) {
                    m.fireCDcycle = m.cycle + 100; // cool down if out of energy
                } else {
                    m.fireCDcycle = m.cycle
                    m.energy -= m.fieldRegen + tech.laserFieldDrain * tech.isLaserDiode
                    // const divergence = input.down ? 0.15 : 0.2
                    // const scale = Math.pow(0.9, tech.beamSplitter)
                    // const pushScale = scale * scale
                    let dmg = tech.laserDamage // * scale //Math.pow(0.9, tech.laserDamage)
                    const where = {
                        x: m.pos.x + 20 * Math.cos(m.angle),
                        y: m.pos.y + 20 * Math.sin(m.angle)
                    }
                    const divergence = input.down ? 0.15 : 0.35
                    const angle = m.angle - tech.beamSplitter * divergence / 2
                    for (let i = 0; i < 1 + tech.beamSplitter; i++) {
                        b.laser(where, {
                            x: where.x + 3000 * Math.cos(angle + i * divergence),
                            y: where.y + 3000 * Math.sin(angle + i * divergence)
                        }, dmg, tech.laserReflections, false)
                    }
                }
            },
            fireWideBeam() {
                if (m.energy < tech.laserFieldDrain) {
                    m.fireCDcycle = m.cycle + 100; // cool down if out of energy
                } else {
                    m.fireCDcycle = m.cycle
                    m.energy -= m.fieldRegen + tech.laserFieldDrain * tech.isLaserDiode
                    const range = {
                        x: 5000 * Math.cos(m.angle),
                        y: 5000 * Math.sin(m.angle)
                    }
                    const rangeOffPlus = {
                        x: 7.5 * Math.cos(m.angle + Math.PI / 2),
                        y: 7.5 * Math.sin(m.angle + Math.PI / 2)
                    }
                    const rangeOffMinus = {
                        x: 7.5 * Math.cos(m.angle - Math.PI / 2),
                        y: 7.5 * Math.sin(m.angle - Math.PI / 2)
                    }
                    const dmg = 0.66 * tech.laserDamage //  3.5 * 0.55 = 200% more damage
                    const where = { x: m.pos.x + 30 * Math.cos(m.angle), y: m.pos.y + 30 * Math.sin(m.angle) }
                    const eye = {
                        x: m.pos.x + 15 * Math.cos(m.angle),
                        y: m.pos.y + 15 * Math.sin(m.angle)
                    }
                    ctx.strokeStyle = tech.laserColor;
                    ctx.lineWidth = 8
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath();
                    if (Matter.Query.ray(map, eye, where).length === 0 && Matter.Query.ray(body, eye, where).length === 0) {
                        b.laser(eye, {
                            x: eye.x + range.x,
                            y: eye.y + range.y
                        }, dmg, 0, true, 0.3)
                    }
                    for (let i = 1; i < tech.wideLaser; i++) {
                        let whereOff = Vector.add(where, {
                            x: i * rangeOffPlus.x,
                            y: i * rangeOffPlus.y
                        })
                        if (Matter.Query.ray(map, eye, whereOff).length === 0 && Matter.Query.ray(body, eye, whereOff).length === 0) {
                            ctx.moveTo(eye.x, eye.y)
                            ctx.lineTo(whereOff.x, whereOff.y)
                            b.laser(whereOff, {
                                x: whereOff.x + range.x,
                                y: whereOff.y + range.y
                            }, dmg, 0, true, 0.3)
                        }
                        whereOff = Vector.add(where, {
                            x: i * rangeOffMinus.x,
                            y: i * rangeOffMinus.y
                        })
                        if (Matter.Query.ray(map, eye, whereOff).length === 0 && Matter.Query.ray(body, eye, whereOff).length === 0) {
                            ctx.moveTo(eye.x, eye.y)
                            ctx.lineTo(whereOff.x, whereOff.y)
                            b.laser(whereOff, {
                                x: whereOff.x + range.x,
                                y: whereOff.y + range.y
                            }, dmg, 0, true, 0.3)
                        }
                    }
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            },
            fireHistory() {
                if (m.energy < tech.laserFieldDrain) {
                    m.fireCDcycle = m.cycle + 100; // cool down if out of energy
                } else {
                    m.fireCDcycle = m.cycle
                    m.energy -= m.fieldRegen + tech.laserFieldDrain * tech.isLaserDiode
                    const dmg = 0.4 * tech.laserDamage //  3.5 * 0.55 = 200% more damage
                    const spacing = Math.ceil(4 - 0.3 * tech.historyLaser)
                    ctx.beginPath();
                    b.laser({
                        x: m.pos.x + 20 * Math.cos(m.angle),
                        y: m.pos.y + 20 * Math.sin(m.angle)
                    }, {
                        x: m.pos.x + 3000 * Math.cos(m.angle),
                        y: m.pos.y + 3000 * Math.sin(m.angle)
                    }, dmg, 0, true, 0.2);
                    for (let i = 1, len = 5 + tech.historyLaser * 5; i < len; i++) {
                        const history = m.history[(m.cycle - i * spacing) % 600]
                        const off = history.yOff - 24.2859
                        b.laser({
                            x: history.position.x + 20 * Math.cos(history.angle),
                            y: history.position.y + 20 * Math.sin(history.angle) - off
                        }, {
                            x: history.position.x + 3000 * Math.cos(history.angle),
                            y: history.position.y + 3000 * Math.sin(history.angle) - off
                        }, dmg, 0, true, 0.2);
                    }
                    ctx.strokeStyle = tech.laserColor;
                    ctx.lineWidth = 1
                    ctx.stroke();
                }
            },
            // firePulse() {
            //     m.fireCDcycle = m.cycle + Math.floor((tech.isPulseAim ? 25 : 50) * b.fireCDscale); // cool down
            //     let energy = 0.3 * Math.min(m.energy, 1.5)
            //     m.energy -= energy * tech.isLaserDiode
            //     if (tech.beamSplitter) {
            //         // energy *= Math.pow(0.9, tech.beamSplitter)
            //         // b.pulse(energy, m.angle)
            //         // for (let i = 1; i < 1 + tech.beamSplitter; i++) {
            //         //     b.pulse(energy, m.angle - i * 0.27)
            //         //     b.pulse(energy, m.angle + i * 0.27)
            //         // }
            //         const divergence = input.down ? 0.2 : 0.5
            //         const angle = m.angle - tech.beamSplitter * divergence / 2
            //         for (let i = 0; i < 1 + tech.beamSplitter; i++) {
            //             b.pulse(energy, angle + i * divergence)
            //         }

            //     } else {
            //         b.pulse(energy, m.angle)
            //     }
            // },
        }, {
            name: "blast",
            description: "accumulate and release air in a <strong class='color-blast'>self-detonation</strong><br>that <strong class='color-stun'>stuns</strong> and pushes away nearby <strong>mobs</strong>", //fires <strong>nails</strong> at mobs within range
            ammo: 0,
            ammoPack: 28,
            defaultAmmoPack: 28,
            have: false,
            activeDetonationEffects: [], // shockwave effect handling
            do() {
                if (!input.field && input.down) {
                    ctx.strokeStyle = "rgba(68, 68, 68, 0.2)" //color.map
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.arc(player.position.x, player.position.y, b.getDetonationRange(), 0, 2*Math.PI)
                    ctx.stroke()
                    if (tech.isCounterblast) {
                        ctx.strokeStyle = "rgba(68, 68, 68, 0.1)" //color.map
                        ctx.beginPath()
                        ctx.arc(player.position.x, player.position.y, b.getDetonationRange()*1.67, 0, 2*Math.PI)
                        ctx.stroke()
                    }
                }
            },
            fire() {
                b.detonation(player.position, b.getDetonationRange(), b.getDetonationDamage())
                if (tech.isBlastHydrogen) {
                    for (let i=0;i<10;i++) {
                        b.hydrogen(m.pos, {x:Math.cos(2*Math.PI*(i/10))*7,y:Math.sin(2*Math.PI*(i/10))*7}, 30, 4)
                    }
                }
                m.fireCDcycle = m.cycle + Math.floor(15 * b.fireCDscale * (tech.isHeavyShell ? 1.22 : 1)); // cool down
            }
        }, {
            name: "rebar",
            description: "fire a rod of <strong>rebar</strong> that <strong>pierces</strong> mobs<br>but <strong>transforms</strong> into a <strong class='color-block'>block</strong> on <strong>wall</strong> impact", //fires <strong>nails</strong> at mobs within range
            ammo: 0,
            ammoPack: 11.4,
            defaultAmmoPack: 11.4,
            have: false,
            do() {
                const cycles = 90*(input.down?1.25:1) //30
                const speed = 30*(input.down?1.25:1)
                const v = { x: speed * Math.cos(m.angle), y: speed * Math.sin(m.angle) } //m.Vy / 2 + removed to make the path less jerky
                ctx.strokeStyle = "rgba(68, 68, 68, 0.2)" //color.map
                ctx.lineWidth = 2
                ctx.beginPath()
                for (let i = 1.5/(input.down?1.25:1), len = 19; i < len + 1; i++) {
                    const time = cycles * i / len
                    ctx.lineTo(m.pos.x + time * v.x, m.pos.y + time * v.y + 0.34 * time * time)
                }
                ctx.stroke()
            },
            fire() {
                if (!tech.isRebarEnergy || (tech.isRebarEnergy && m.energy > 0.2)) {
                    b.rebar(m.angle)
                    if (tech.isRebarEnergy) m.energy -= 0.2
                    if (tech.isRebarControlRod) {
                        let speed = 20 * (input.down?1.5:1)
                        for (let i=0;i<(tech.isRebarControlRodSpam?tech.rebarControlRodSpamCount:2);i++) b.controlRod(player.position, {x:player.velocity.x+(Math.cos(m.angle+((Math.random()-0.5)*1))*speed),y:player.velocity.y+(Math.sin(m.angle+((Math.random()-0.5)*1))*speed)},Math.random()*Math.PI*2)
                    }
                    tech.rebarControlRodSpamCount = 0
                    m.fireCDcycle = m.cycle + Math.floor(60 * b.fireCDscale * (input.down?1.5:1) * (tech.isRebarEnergy?0.4:1)); // cool down
                }
                
            }
        }, {
            name: "flank", // https://youtu.be/QIE3PROsn-o?&t=2631
            description: "use <strong class='color-f'>energy</strong> to generate orbs that <strong>split</strong><br>into <strong>bullets</strong> going forwards and backwards",
            ammo: 0,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            do() {
                if (this.performingTheFunny) {
                    ctx.beginPath()
                    ctx.moveTo(m.pos.x, m.pos.y);
                    let depth = 700
                    for (let i=0;i<14;i++) {
                        if (!Matter.Query.ray(map,m.pos,{x:m.pos.x,y:m.pos.y+(700-(i*50))}).length) {
                            depth = Math.min(700-((i-1)*50),700)
                            break
                        }
                    }
                    ctx.lineTo(m.pos.x, m.pos.y+depth);
                    ctx.lineWidth = "2";
                    ctx.strokeStyle = "rgba(255,0,0,0.75)"
                    ctx.stroke()
                    if (m.fireCDcycle <= m.cycle+5) {
                        this.performingTheFunny = false
                    } else if (Matter.Query.ray(mob,m.pos,{x:m.pos.x,y:m.pos.y+depth}).length) {
                        this.performingTheFunny = false
                        m.fireCDcycle = -1
                        simulation.ephemera.push({
                            name: "Flank Immediate Fucking Obliteration" + m.cycle,
                            time: 0,
                            do() {
                                this.time++
                                switch (this.time) {
                                    case 1:
                                        b.flankObliterator(Math.PI/2)
                                        break
                                    case 9:
                                        b.flankObliterator((Math.PI/2)+(Math.PI/4))
                                        break
                                    case 17:
                                        b.flankObliterator((Math.PI/2)-(Math.PI/4))
                                        break
                                }
                                if (this.time >= 17) {
                                    simulation.removeEphemera(this.name);
                                }
                            },
                        })
                    }
                }
            },
            performingTheFunny: false,
            fire() {
                let energyUsage = 0.02 * (tech.isFlank3Orb?1.3:1) * (tech.isFlankExtraBack?1.5:1)
                if (m.energy > energyUsage+0.005) {
                    if (!tech.isFlankCambriaSwordWeaponSevenChargeShot || !(input.down && m.energy > m.maxEnergy*0.8)) {
                        let crouch = tech.isFlankCambriaSwordWeaponSevenChargeShot ? 0 : input.down 
                        b.flankOrb(-1 + (crouch*0.667))
                        b.flankOrb(1 - (crouch*0.667))
                        if (tech.isFlank3Orb) b.flankOrb(0)
                        m.fireCDcycle = m.cycle + Math.floor((7+(crouch*3)) * b.fireCDscale); // cool down
                        m.energy -= energyUsage
                    } else {
                        this.performingTheFunny = true
                        if (m.energy > m.maxEnergy*1.6) m.energy -= m.energy*0.75
                        m.energy -= m.maxEnergy*0.75
                        m.fireCDcycle = m.cycle + 240
                    }
                }
            }
        },
    ],
    // gunRewind: { //this gun is added with a tech
    //     name: "CPT gun",
    //     description: "use <strong class='color-f'>energy</strong> to <strong>rewind</strong> your <strong class='color-h'>health</strong>, <strong>velocity</strong>,<br> and <strong>position</strong> up to <strong>10</strong> seconds",
    //     ammo: 0,
    //     ammoPack: Infinity,
    //     have: false,
    //     isRewinding: false,
    //     lastFireCycle: 0,
    //     holdCount: 0,
    //     activeGunIndex: null,
    //     do() {},
    //     fire() {
    //         if (this.lastFireCycle === m.cycle - 1) { //button has been held down
    //             this.rewindCount += 8;
    //             const DRAIN = 0.01
    //             let history = m.history[(m.cycle - this.rewindCount) % 600]
    //             if (this.rewindCount > 599 || m.energy < DRAIN || history.activeGun !== this.activeGunIndex) {
    //                 this.rewindCount = 0;
    //                 m.resetHistory();
    //                 m.fireCDcycle = m.cycle + Math.floor(120 * b.fireCDscale); // cool down
    //             } else {
    //                 m.energy -= DRAIN
    //                 if (m.immuneCycle < m.cycle + 30) m.immuneCycle = m.cycle + 30; //player is immune to damage for 5 cycles
    //                 Matter.Body.setPosition(player, history.position);
    //                 Matter.Body.setVelocity(player, { x: history.velocity.x, y: history.velocity.y });
    //                 if (m.health !== history.health) {
    //                     m.health = history.health
    //                     m.displayHealth();
    //                 }
    //                 m.yOff = history.yOff
    //                 if (m.yOff < 48) {
    //                     m.doCrouch()
    //                 } else {
    //                     m.undoCrouch()
    //                 }
    //             }
    //         } else { //button is held the first time
    //             this.rewindCount = 0;
    //             this.activeGunIndex = b.activeGun
    //         }
    //         this.lastFireCycle = m.cycle;
    //     }
    // }
};