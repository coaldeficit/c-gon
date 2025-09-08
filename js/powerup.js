let powerUp = [];

const powerUps = {
    ejectGraphic(color = "68, 102, 119") {
        simulation.drawList.push({
            x: m.pos.x,
            y: m.pos.y,
            radius: 100,
            color: `rgba(${color}, 0.8)`,
            time: 4
        });
        simulation.drawList.push({
            x: m.pos.x,
            y: m.pos.y,
            radius: 75,
            color: `rgba(${color}, 0.6)`,
            time: 8
        });
        simulation.drawList.push({
            x: m.pos.x,
            y: m.pos.y,
            radius: 50,
            color: `rgba(${color}, 0.3)`,
            time: 12
        });
        simulation.drawList.push({
            x: m.pos.x,
            y: m.pos.y,
            radius: 25,
            color: `rgba(${color}, 0.15)`,
            time: 16
        });
    },
    orb: {
        research(num = 1) {
            switch (num) {
                case 1:
                    return `<div class="research-circle"></div> `
                case 2:
                    return `<span style="position:relative;">
                    <div class="research-circle" style="position:absolute; top:0; left:0;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:7px;"></div>
                    </span> &nbsp; &nbsp; &nbsp; &nbsp;`
                case 3:
                    return `<span style="position:relative;">
                    <div class="research-circle" style="position:absolute; top:0; left:0;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:8px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:16px;"></div>
                    </span> &nbsp; &nbsp; &nbsp; &nbsp; &thinsp; `
                case 4:
                    return `<span style="position:relative;">
                    <div class="research-circle" style="position:absolute; top:0; left:0;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:8px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:16px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:24px;"></div>
                    </span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; `
                case 5:
                    return `<span style="position:relative;">
                    <div class="research-circle" style="position:absolute; top:0; left:0;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:8px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:16px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:24px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:32px;"></div>
                    </span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; `
                case 6:
                    return `<span style="position:relative;">
                    <div class="research-circle" style="position:absolute; top:0; left:0;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:8px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:16px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:24px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:32px;"></div>
                    <div class="research-circle" style="position:absolute; top:0; left:40px;"></div>
                    </span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; `
            }
            let text = '<span style="position:relative;">'
            for (let i = 0; i < num; i++) {
                text += `<div class="research-circle" style="position:absolute; top:0; left:${i*8}px;"></div>`
            }
            text += '</span> &nbsp; &nbsp; '
            for (let i = 0; i < num; i++) {
                text += '&nbsp; '
            }
            return text
        },
        ammo(num = 1) {
            switch (num) {
                case 1:
                    return `<div class="ammo-circle"></div>`
            }
            let text = '<span style="position:relative;">'
            for (let i = 0; i < num; i++) {
                text += `<div class="ammo-circle" style="position:absolute; top:1.5px; left:${i*8}px;"></div>`
            }
            text += '</span> &nbsp; &nbsp; '
            for (let i = 0; i < num; i++) {
                text += '&nbsp; '
            }
            return text
        },
        heal(num = 1) {
            switch (num) {
                case 1:
                    return `<div class="heal-circle"></div>`
            }
            let text = '<span style="position:relative;">'
            for (let i = 0; i < num; i++) {
                text += `<div class="heal-circle" style="position:absolute; top:1px; left:${i*10}px;"></div>`
            }
            text += '</span> &nbsp; &nbsp; '
            for (let i = 0; i < num; i++) {
                text += '&nbsp; '
            }
            return text
        },
        energyHeal(num = 1) {
            switch (num) {
                case 1:
                    return `<div class="energy-heal-circle"></div>`
            }
            let text = '<span style="position:relative;">'
            for (let i = 0; i < num; i++) {
                text += `<div class="energy-heal-circle" style="position:absolute; top:1px; left:${i*10}px;"></div>`
            }
            text += '</span> &nbsp; &nbsp; '
            for (let i = 0; i < num; i++) {
                text += '&nbsp; '
            }
            return text
        },
        tech(num = 1) {
            return `<div class="tech-circle"></div>`
        },
        boost(num = 1) {
            switch (num) {
                case 1:
                    return `<div class="boost-circle"></div>`
            }
            let text = '<span style="position:relative;">'
            for (let i = 0; i < num; i++) {
                text += `<div class="boost-circle" style="position:absolute; top:1.5px; left:${i * 8}px;"></div>`
            }
            text += '</span> &nbsp; &nbsp; '
            for (let i = 0; i < num; i++) {
                text += '&nbsp; '
            }
            return text
        },
    },
    totalPowerUps: 0, //used for tech that count power ups at the end of a level
    lastTechIndex: null,
    do() {},
    setDupChance() {
        if (tech.duplicationChance() > 0 || tech.isAnthropicTech) {
            if (tech.isPowerUpsVanish) {
                powerUps.do = powerUps.doDuplicatesVanish
            } else if (tech.isPowerUpsAttract) {
                powerUps.do = powerUps.doAttractDuplicates
            } else {
                powerUps.do = powerUps.doDuplicates
            }
            tech.maxDuplicationEvent() //check to see if hitting 100% duplication
        } else if (tech.isPowerUpsAttract) {
            powerUps.do = powerUps.doAttract
        } else {
            powerUps.do = powerUps.doDefault
        }
    },
    attractHeal() {
        for (let i = 0; i < powerUp.length; i++) { //attract heal power ups to player
            if (powerUp[i].name === "heal") {
                let attract = Vector.mult(Vector.normalise(Vector.sub(m.pos, powerUp[i].position)), 0.015 * powerUp[i].mass)
                powerUp[i].force.x += attract.x;
                powerUp[i].force.y += attract.y - powerUp[i].mass * simulation.g; //negate gravity
                Matter.Body.setVelocity(powerUp[i], Vector.mult(powerUp[i].velocity, 0.7));
            }
        }
    },
    doDefault() {
        //draw power ups
        ctx.globalAlpha = 0.4 * Math.sin(m.cycle * 0.15) + 0.6;
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            ctx.beginPath();
            ctx.arc(powerUp[i].position.x, powerUp[i].position.y, powerUp[i].size, 0, 2 * Math.PI);
            ctx.fillStyle = powerUp[i].color;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },
    doAttract() {
        powerUps.doDefault();
        //pull in 
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            const force = Vector.mult(Vector.normalise(Vector.sub(m.pos, powerUp[i].position)), 0.0015 * powerUp[i].mass)
            powerUp[i].force.x += force.x
            powerUp[i].force.y = force.y - simulation.g
        }
    },
    doAttractDuplicates() {
        powerUps.doDuplicates();
        //pull in 
    },
    doDuplicates() { //draw power ups but give duplicates some electricity
        ctx.globalAlpha = 0.4 * Math.sin(m.cycle * 0.15) + 0.6;
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            ctx.beginPath();
            ctx.arc(powerUp[i].position.x, powerUp[i].position.y, powerUp[i].size, 0, 2 * Math.PI);
            ctx.fillStyle = powerUp[i].color;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            if (powerUp[i].isDuplicated && Math.random() < 0.1) {
                //draw electricity
                const mag = 5 + powerUp[i].size / 5
                let unit = Vector.rotate({
                    x: mag,
                    y: mag
                }, 2 * Math.PI * Math.random())
                let path = {
                    x: powerUp[i].position.x + unit.x,
                    y: powerUp[i].position.y + unit.y
                }
                ctx.beginPath();
                ctx.moveTo(path.x, path.y);
                for (let i = 0; i < 6; i++) {
                    unit = Vector.rotate(unit, 3 * (Math.random() - 0.5))
                    path = Vector.add(path, unit)
                    ctx.lineTo(path.x, path.y);
                }
                ctx.lineWidth = 0.5 + 2 * Math.random();
                ctx.strokeStyle = "#000"
                ctx.stroke();
            }
        }
    },
    doDuplicatesVanish() { //draw power ups but give duplicates some electricity
        //remove power ups after 3 seconds
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            if (powerUp[i].isDuplicated && Math.random() < 0.00230782347298) { //  (1-0.004)^300 = chance to be removed after 5 seconds
                b.explosion(powerUp[i].position, 150 + (10 + 3 * Math.random()) * powerUp[i].size);
                Matter.Composite.remove(engine.world, powerUp[i]);
                powerUp.splice(i, 1);
                break
            }
        }
        ctx.globalAlpha = 0.4 * Math.sin(m.cycle * 0.25) + 0.6
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            ctx.beginPath();
            ctx.arc(powerUp[i].position.x, powerUp[i].position.y, powerUp[i].size, 0, 2 * Math.PI);
            ctx.fillStyle = powerUp[i].color;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        for (let i = 0, len = powerUp.length; i < len; ++i) {
            if (powerUp[i].isDuplicated && Math.random() < 0.3) {
                //draw electricity
                const mag = 5 + powerUp[i].size / 5
                let unit = Vector.rotate({
                    x: mag,
                    y: mag
                }, 2 * Math.PI * Math.random())
                let path = {
                    x: powerUp[i].position.x + unit.x,
                    y: powerUp[i].position.y + unit.y
                }
                ctx.beginPath();
                ctx.moveTo(path.x, path.y);
                for (let i = 0; i < 6; i++) {
                    unit = Vector.rotate(unit, 3 * (Math.random() - 0.5))
                    path = Vector.add(path, unit)
                    ctx.lineTo(path.x, path.y);
                }
                ctx.lineWidth = 0.5 + 2 * Math.random();
                ctx.strokeStyle = "#000"
                ctx.stroke();
            }
        }
    },
    choose(type, index) {
        if (type === "gun") {
            b.giveGuns(index)
            let text = `b.giveGuns("<span class='color-text'>${b.guns[index].name}</span>")`
            if (b.inventory.length === 1) text += `<br>input.key.gun<span class='color-symbol'>:</span> ["<span class='color-text'>MouseLeft</span>"]`
            if (b.inventory.length === 2) {
                text += `
            <br>input.key.nextGun<span class='color-symbol'>:</span> ["<span class='color-text'>${input.key.nextGun}</span>","<span class='color-text'>MouseWheel</span>"]
            <br>input.key.previousGun<span class='color-symbol'>:</span> ["<span class='color-text'>${input.key.previousGun}</span>","<span class='color-text'>MouseWheel</span>"]`
                document.getElementById("mobileHideOnOneGun").style.display = "";
            }
            simulation.makeTextLog(text);
        } else if (type === "field") {
            m.setField(index)
        } else if (type === "tech") {
            setTimeout(() => {
                powerUps.lastTechIndex = index
            }, 10);
            simulation.makeTextLog(`<span class='color-var'>tech</span>.giveTech("<span class='color-text'>${tech.tech[index].name}</span>")`);
            tech.giveTech(index)
        }
        document.getElementById("mobileHideOnPowerup").style.display = "";
        powerUps.endDraft(type);
    },
    showDraft() {
        document.getElementById("mobileHideOnPowerup").style.display = "none";
        // document.getElementById("choose-grid").style.gridTemplateColumns = "repeat(2, minmax(370px, 1fr))"
        // document.getElementById("choose-background").style.display = "inline"
        // document.getElementById("choose-background").style.visibility = "visible"
        // document.getElementById("choose-background").style.opacity = "0.6"
        // document.getElementById("choose-grid").style.display = "grid"
        document.getElementById("choose-grid").style.transitionDuration = "0.25s";
        document.getElementById("choose-grid").style.visibility = "visible"
        document.getElementById("choose-grid").style.opacity = "1"
        //disable clicking for 1/2 a second to prevent mistake clicks
        document.getElementById("choose-grid").style.pointerEvents = "none";
        document.body.style.cursor = "none";
        setTimeout(() => {
            document.getElementById("choose-grid").style.pointerEvents = "auto";
            document.getElementById("choose-grid").style.transitionDuration = "0s";
            document.body.style.cursor = "auto";
        }, 500);

        // if (tech.isExtraChoice) {
        //     document.body.style.overflowY = "scroll";
        //     document.body.style.overflowX = "hidden";
        // }
        simulation.isChoosing = true; //stops p from un pausing on key down
        if (!simulation.paused) {
            if (tech.isNoDraftPause) {
                powerUps.spawn(m.pos.x, m.pos.y, "ammo");
                document.getElementById("choose-grid").style.opacity = "0.7"
            } else {
                simulation.paused = true;
                document.getElementById("choose-grid").style.opacity = "1"
            }
            document.getElementById("choose-grid").style.transitionDuration = "0.25s";
            document.getElementById("choose-grid").style.visibility = "visible"

            requestAnimationFrame(() => {
                ctx.fillStyle = `rgba(221,221,221,0.6)`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            });
            document.getElementById("pause-grid-right").style.opacity = "0.3"
            document.getElementById("pause-grid-left").style.opacity = "0.3"
        }
        build.pauseGrid()
    },
    endDraft(type, isCanceled = false) {
        if (isCanceled) {
            if (tech.isCancelTech && Math.random() < 0.9) {
                // powerUps.research.use('tech')
                powerUps[type].effect();
                return
            }
            if (tech.isCancelDuplication) {
                tech.cancelCount++
                tech.maxDuplicationEvent()
                simulation.makeTextLog(`tech.duplicationChance() <span class='color-symbol'>+=</span> ${0.043}`)
                simulation.circleFlare(0.02);
            }
            if (tech.isCancelRerolls) {
                for (let i = 0, len = 5 + 5 * Math.random(); i < len; i++) {
                    let spawnType = ((m.health < 0.25 && !tech.isEnergyHealth) || tech.isEnergyNoAmmo) ? "heal" : "ammo"
                    if (Math.random() < 0.36) {
                        spawnType = "heal"
                    } else if (Math.random() < 0.4 && !tech.isSuperDeterminism) {
                        spawnType = "research"
                    }
                    powerUps.spawn(m.pos.x + 40 * (Math.random() - 0.5), m.pos.y + 40 * (Math.random() - 0.5), spawnType, false);
                }
            }
            if (tech.isBanish && type === 'tech') { // banish researched tech by adding them to the list of banished tech
                const banishLength = tech.isDeterminism ? 1 : 3 + tech.isExtraChoice * 2
                for (let i = 0; i < banishLength; i++) {
                    const index = powerUps.tech.choiceLog.length - i - 1
                    if (powerUps.tech.choiceLog[index] && tech.tech[powerUps.tech.choiceLog[index]]) {
                        tech.tech[powerUps.tech.choiceLog[index]].isBanished = true
                    }
                }
                simulation.makeTextLog(`powerUps.tech.length: ${Math.max(0,powerUps.tech.lastTotalChoices - banishLength)}`)
            }
        }
        if (tech.isAnsatz && powerUps.research.count === 0) {
            for (let i = 0; i < 3; i++) powerUps.spawn(m.pos.x + 40 * (Math.random() - 0.5), m.pos.y + 40 * (Math.random() - 0.5), "research", false);
        }
        // document.getElementById("choose-grid").style.display = "none"
        document.getElementById("choose-grid").style.visibility = "hidden"
        document.getElementById("choose-grid").style.opacity = "0"
        // document.getElementById("choose-background").style.display = "none"
        document.getElementById("choose-background").style.visibility = "hidden"
        document.getElementById("choose-background").style.opacity = "0"

        document.body.style.cursor = "none";
        // document.body.style.overflow = "hidden"
        // if (m.alive){}
        if (simulation.paused) requestAnimationFrame(cycle);
        simulation.paused = false;
        simulation.isChoosing = false; //stops p from un pausing on key down
        build.unPauseGrid()
        if (m.immuneCycle < m.cycle + 15) m.immuneCycle = m.cycle + 15; //player is immune to damage for 30 cycles
        if (m.holdingTarget) m.drop();
    },
    research: {
        count: 0,
        name: "research",
        color: "#f7b",
        size() {
            return 20;
        },
        effect() {
            powerUps.research.changeRerolls(1)
        },
        changeRerolls(amount) {
            if (amount !== 0) {
                powerUps.research.count += amount
                if (powerUps.research.count < 0) {
                    powerUps.research.count = 0
                }
                // else {
                //     simulation.makeTextLog(`powerUps.research.count <span class='color-symbol'>+=</span> ${amount}`) // <br>${powerUps.research.count}
                // }
            }
            if (tech.isRerollBots) {
                let delay = 0
                for (const cost = 3 + Math.floor(0.5 * b.totalBots()); powerUps.research.count > cost - 1; powerUps.research.count -= cost) {
                    delay += 500
                    setTimeout(() => {
                        b.randomBot()
                        if (tech.renormalization) {
                            for (let i = 0; i < cost; i++) {
                                if (Math.random() < 0.4) {
                                    m.fieldCDcycle = m.cycle + 20;
                                    powerUps.spawn(m.pos.x + 100 * (Math.random() - 0.5), m.pos.y + 100 * (Math.random() - 0.5), "research");
                                }
                            }
                        }
                        if (tech.isPeerReview && amount < 0) {
                            for (let i = 0, len = -amount; i < len; i++) tech.peerReviewDamage++
                        }
                        if (tech.isClinicalPeerReview && amount < 0) {
                            for (let i = 0, len = -amount; i < len; i++) powerUps.spawn(m.pos.x, m.pos.y, "heal");
                        }
                    }, delay);
                }
                // for (let i = 0, len = tech.tech.length; i < len; i++) {
                //     if (tech.tech[i].name === "bot fabrication") tech.tech[i].description = `if you collect ${powerUps.orb.research(2 + Math.floor(0.2 * b.totalBots()))}use them to build a<br>random <strong class='color-bot'>bot</strong>  <em>(+1 cost every 5 bots)</em>`
                // }
            }
            if (tech.isDeathAvoid && document.getElementById("tech-anthropic")) {
                document.getElementById("tech-anthropic").innerHTML = `-${powerUps.research.count}`
            }
            if (tech.renormalization && Math.random() < 0.4 && amount < 0) {
                for (let i = 0, len = -amount; i < len; i++) powerUps.spawn(m.pos.x, m.pos.y, "research");
            }
            if (tech.isPeerReview && amount < 0) {
                for (let i = 0, len = -amount; i < len; i++) tech.peerReviewDamage++
            }
            if (tech.isClinicalPeerReview && amount < 0) {
                for (let i = 0, len = -amount; i < len; i++) powerUps.spawn(m.pos.x, m.pos.y, "heal");
            }
            if (tech.isRerollHaste) {
                if (powerUps.research.count === 0) {
                    tech.researchHaste = 0.66;
                    b.setFireCD();
                } else {
                    tech.researchHaste = 1;
                    b.setFireCD();
                }
            }
        },
        currentRerollCount: 0,
        use(type) { //runs when you actually research a list of selections, type can be field, gun, or tech
            if (tech.isJunkResearch && powerUps.research.currentRerollCount < 3) {
                tech.addJunkTechToPool(tech.junkResearchNumber * 0.01)
            } else {
                powerUps.research.changeRerolls(-1)
            }
            powerUps.research.currentRerollCount++
            if (tech.isBanish && type === 'tech') { // banish researched tech
                const banishLength = tech.isDeterminism ? 1 : 3 + tech.isExtraChoice * 2
                for (let i = 0; i < banishLength; i++) {
                    const index = powerUps.tech.choiceLog.length - i - 1
                    if (powerUps.tech.choiceLog[index] && tech.tech[powerUps.tech.choiceLog[index]]) tech.tech[powerUps.tech.choiceLog[index]].isBanished = true
                }
                simulation.makeTextLog(`powerUps.tech.length: ${Math.max(0,powerUps.tech.lastTotalChoices - banishLength)}`)
            }
            if (tech.isResearchReality) {
                m.switchWorlds()
                simulation.trails()
                simulation.makeTextLog(`simulation.amplitude <span class='color-symbol'>=</span> ${Math.random()}`);
            }
            powerUps[type].effect();
        },
    },
    heal: {
        name: "heal",
        color: "#0eb",
        size() {
            return 40 * (simulation.healScale ** 0.25) * Math.sqrt(tech.largerHeals) * Math.sqrt(0.1 + Math.random() * 0.5); //(simulation.healScale ** 0.25)  gives a smaller radius as heal scale goes down
        },
        calculateHeal(size) {
            return tech.largerHeals * (size / 40 / Math.sqrt(tech.largerHeals) / (simulation.healScale ** 0.25)) ** 2 //heal scale is undone here because heal scale is properly affected on m.addHealth()
        },
        effect() {
            // if (!tech.isEnergyHealth && m.alive) {
            //     const heal = powerUps.heal.calculateHeal(this.size)
            //     if (heal > 0) {
            //         if (tech.isOverHeal && m.health === m.maxHealth) { //tech quenching
            //             m.damage(heal * simulation.healScale);
            //             //draw damage
            //             simulation.drawList.push({ //add dmg to draw queue
            //                 x: m.pos.x,
            //                 y: m.pos.y,
            //                 radius: heal * 500 * simulation.healScale,
            //                 color: simulation.mobDmgColor,
            //                 time: simulation.drawTime
            //             });
            //             tech.extraMaxHealth += heal * simulation.healScale //increase max health
            //             m.setMaxHealth();
            //         } else {
            //             const healOutput = Math.min(m.maxHealth - m.health, heal) * simulation.healScale
            //             m.addHealth(heal);
            //             simulation.makeTextLog(`<span class='color-var'>m</span>.health <span class='color-symbol'>+=</span> ${(healOutput).toFixed(3)}`) // <br>${m.health.toFixed(3)}
            //         }
            //     }
            // }
            if (!tech.isEnergyHealth && m.alive) {
                const heal = powerUps.heal.calculateHeal(this.size) * (tech.isNoHeals ? 0.5 : 1) * (tech.isHealAttract ? 0.5 : 1) * (tech.isClinicalPeerReview ? 0.85 : 1)
                if (heal > 0) {
                    const overHeal = m.health + heal * simulation.healScale - m.maxHealth //used with tech.isOverHeal

                    const healOutput = Math.min(m.maxHealth - m.health, heal) * simulation.healScale
                    m.addHealth(heal);
                    simulation.makeTextLog(`<span class='color-var'>m</span>.health <span class='color-symbol'>+=</span> ${(healOutput).toFixed(3)}`) // <br>${m.health.toFixed(3)}

                    if (tech.isOverHeal && overHeal > 0) { //tech quenching
                        const scaledOverHeal = overHeal * 0.7
                        m.damage(scaledOverHeal);
                        simulation.makeTextLog(`<span class='color-var'>m</span>.health <span class='color-symbol'>-=</span> ${(scaledOverHeal).toFixed(3)}`) // <br>${m.health.toFixed(3)}
                        //draw damage
                        simulation.drawList.push({ //add dmg to draw queue
                            x: m.pos.x,
                            y: m.pos.y,
                            radius: scaledOverHeal * 500 * simulation.healScale,
                            color: simulation.mobDmgColor,
                            time: simulation.drawTime
                        });
                        tech.extraMaxHealth += scaledOverHeal * simulation.healScale //increase max health
                        m.setMaxHealth();
                    }
                    if (tech.isHealBrake) { // induction brake
                        const totalTime = 420
                        //check if you already have this effect
                        let foundActiveEffect = false
                        for (let i = 0; i < simulation.ephemera.length; i++) {
                            if (simulation.ephemera[i].name === "healPush") {
                                foundActiveEffect = true
                                simulation.ephemera[i].count = 0.5 * simulation.ephemera[i].count + totalTime //add time
                                simulation.ephemera[i].scale = 0.5 * (simulation.ephemera[i].scale + Math.min(Math.max(0.6, heal * 6), 2.3)) //take average of scale
                            }
                        }
                        if (!foundActiveEffect) {
                            simulation.ephemera.push({
                                name: "healPush",
                                count: totalTime, //cycles before it self removes
                                range: 0,
                                scale: Math.min(Math.max(0.7, heal * 4), 2.2), //typically heal is 0.35
                                do() {
                                    this.count--
                                    if (this.count < 0) simulation.removeEphemera(this.name)
                                    this.range = this.range * 0.99 + 0.01 * (300 * this.scale + 100 * Math.sin(m.cycle * 0.022))
                                    if (this.count < 120) this.range -= 5 * this.scale
                                    this.range = Math.max(this.range, 1) //don't go negative
                                    // const range = 300 + 100 * Math.sin(m.cycle * 0.022)
                                    for (let i = 0; i < mob.length; i++) {
                                        const distance = Vector.magnitude(Vector.sub(m.pos, mob[i].position))
                                        if (distance < this.range) {
                                            const cap = mob[i].isShielded ? 3 : 1
                                            if (mob[i].speed > cap && Vector.dot(mob[i].velocity, Vector.sub(m.pos, mob[i].position)) > 0) { // if velocity is directed towards player
                                                Matter.Body.setVelocity(mob[i], Vector.mult(Vector.normalise(mob[i].velocity), cap)); //set velocity to cap, but keep the direction
                                            }
                                        }
                                    }
                                    ctx.beginPath();
                                    ctx.arc(m.pos.x, m.pos.y, this.range, 0, 2 * Math.PI);
                                    ctx.fillStyle = "hsla(200,50%,61%,0.18)";
                                    ctx.fill();
                                },
                            })
                        }
                    }
                }
            }

            if (tech.healGiveMaxEnergy) {
                tech.healMaxEnergyBonus += 0.12
                m.setMaxEnergy();
            }
            //if (tech.isIonizationEnergy) {
            //  tech.ionizationEnergyRegenTime = 12
            //  tech.ionizationEnergyBoost += 0.02
            //}
        },
        spawn(x, y, size) { //used to spawn a heal with a specific size / heal amount, not normally used
            powerUps.directSpawn(x, y, "heal", false, null, size)
            if (Math.random() < tech.duplicationChance()) {
                powerUps.directSpawn(x, y, "heal", false, null, size)
                powerUp[powerUp.length - 1].isDuplicated = true
            }
        }
    },
    ammo: {
        name: "ammo",
        color: "#467",
        size() {
            return 17;
        },
        effect() {
            if (b.inventory.length > 0) {
                if (tech.isAmmoForGun && b.activeGun) { //give extra ammo to one gun only with tech logistics
                    const target = b.guns[b.activeGun]
                    if (target.ammo !== Infinity) {
                        if (tech.ammoCap) {
                            const ammoAdded = Math.ceil(target.ammoPack * 0.7 * tech.ammoCap * Math.max(1,(Math.log(simulation.difficultyMode+4)+1)-Math.log(6)) * ((tech.isMarginalUtility && i==len-1) ? 2 : 1)) //0.7 is average
                            target.ammo = ammoAdded
                            // simulation.makeTextLog(`${target.name}.<span class='color-g'>ammo</span> <span class='color-symbol'>=</span> ${ammoAdded}`)
                        } else {
                            const ammoAdded = Math.ceil((0.7 * Math.random() + 0.7 * Math.random()) * target.ammoPack * Math.max(1,(Math.log(simulation.difficultyMode+4)+1)-Math.log(6)) * ((tech.isMarginalUtility && i==len-1) ? 2 : 1))
                            target.ammo += ammoAdded
                            // simulation.makeTextLog(`${target.name}.<span class='color-g'>ammo</span> <span class='color-symbol'>+=</span> ${ammoAdded}`)
                        }
                    }
                } else { //give ammo to all guns in inventory
                    // let textLog = ""
                    for (let i = 0, len = b.inventory.length; i < len; i++) {
                        const target = b.guns[b.inventory[i]]
                        if (target.ammo !== Infinity) {
                            if (tech.ammoCap) {
                                const ammoAdded = Math.ceil(target.ammoPack * 0.45 * tech.ammoCap * Math.max(1,(Math.log(simulation.difficultyMode+4)+1)-Math.log(6)) * ((tech.isMarginalUtility && i==len-1) ? 2 : 1)) //0.45 is average
                                target.ammo = ammoAdded
                                // textLog += `${target.name}.<span class='color-g'>ammo</span> <span class='color-symbol'>=</span> ${ammoAdded}<br>`
                            } else {
                                const ammoAdded = Math.ceil((0.45 * Math.random() + 0.45 * Math.random()) * target.ammoPack * Math.max(1,(Math.log(simulation.difficultyMode+4)+1)-Math.log(6)) * ((tech.isMarginalUtility && i==len-1) ? 2 : 1)) //Math.ceil(Math.random() * target.ammoPack)
                                target.ammo += ammoAdded
                                // textLog += `${target.name}.<span class='color-g'>ammo</span> <span class='color-symbol'>+=</span> ${ammoAdded}<br>`
                            }
                        }
                    }
                    // simulation.makeTextLog(textLog)
                }
                // } else { //give ammo to all guns in inventory
                //     for (let i = 0, len = b.inventory.length; i < len; i++) {
                //         const target = b.guns[b.inventory[i]]
                //         if (target.ammo !== Infinity) {
                //             if (tech.ammoCap) {
                //                 const ammoAdded = Math.ceil(target.ammoPack * 0.45 * tech.ammoCap) //0.45 is average
                //                 target.ammo = ammoAdded
                //                 simulation.makeTextLog(`${target.name}.<span class='color-g'>ammo</span> <span class='color-symbol'>=</span> ${ammoAdded}`)
                //             } else {
                //                 const ammoAdded = Math.ceil((0.45 * Math.random() + 0.45 * Math.random()) * target.ammoPack) //Math.ceil(Math.random() * target.ammoPack)
                //                 target.ammo += ammoAdded
                //                 simulation.makeTextLog(`${target.name}.<span class='color-g'>ammo</span> <span class='color-symbol'>+=</span> ${ammoAdded}`)
                //             }
                //         }
                //     }
                // }
                simulation.updateGunHUD();
            }
        }
    },
    field: {
        name: "field",
        color: "#0cf",
        size() {
            return 45;
        },
        pick(who, skip1 = -1, skip2 = -1, skip3 = -1, skip4 = -1) {
            let options = [];
            for (let i = 1; i < who.length; i++) {
                if (i !== m.fieldMode && i !== skip1 && i !== skip2 && i !== skip3 && i !== skip4) options.push(i);
            }
            //remove repeats from last selection
            const totalChoices = tech.isDeterminism ? 1 : 3 + tech.isExtraChoice * 2
            if (powerUps.field.choiceLog.length > totalChoices || powerUps.field.choiceLog.length === totalChoices) { //make sure this isn't the first time getting a power up and there are previous choices to remove
                for (let i = 0; i < totalChoices; i++) { //repeat for each choice from the last selection
                    if (options.length > totalChoices) {
                        for (let j = 0, len = options.length; j < len; j++) {
                            if (powerUps.field.choiceLog[powerUps.field.choiceLog.length - 1 - i] === options[j]) {
                                options.splice(j, 1) //remove previous choice from option pool
                                break
                            }
                        }
                    }
                }
            }
            if (options.length > 0) {
                // return options[Math.floor(Math.random() * options.length)]
                return options[Math.floor(Math.seededRandom(0, options.length))]
            }
        },
        choiceLog: [], //records all previous choice options
        effect() {
            let choice1 = powerUps.field.pick(m.fieldUpgrades)
            let choice2 = -1
            let choice3 = -1
            if (choice1 > -1) {
                let text = ""
                if (!tech.isSuperDeterminism) text += `<div class='cancel' onclick='powerUps.endDraft("field",true)'>${tech.isCancelTech ? "?":"✕"}</div>`
                text += `<h3 style = 'color:#fff; text-align:left; margin: 0px;'>field</h3>`
                text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice1})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${m.fieldUpgrades[choice1].name}</div> ${m.fieldUpgrades[choice1].description}</div>`
                powerUps.field.choiceLog.push(choice1)
                if (!tech.isDeterminism) {
                    choice2 = powerUps.field.pick(m.fieldUpgrades, choice1)
                    if (choice2 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice2})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${m.fieldUpgrades[choice2].name}</div> ${m.fieldUpgrades[choice2].description}</div>`
                    choice3 = powerUps.field.pick(m.fieldUpgrades, choice1, choice2)
                    if (choice3 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice3})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${m.fieldUpgrades[choice3].name}</div> ${m.fieldUpgrades[choice3].description}</div>`
                    powerUps.field.choiceLog.push(choice2)
                    powerUps.field.choiceLog.push(choice3)
                }
                if (tech.isExtraChoice) {
                    let choice4 = powerUps.field.pick(m.fieldUpgrades, choice1, choice2, choice3)
                    if (choice4 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice4})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${m.fieldUpgrades[choice4].name}</div> ${m.fieldUpgrades[choice4].description}</div>`
                    let choice5 = powerUps.field.pick(m.fieldUpgrades, choice1, choice2, choice3, choice4)
                    if (choice5 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice5})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${m.fieldUpgrades[choice5].name}</div> ${m.fieldUpgrades[choice5].description}</div>`
                    powerUps.field.choiceLog.push(choice4)
                    powerUps.field.choiceLog.push(choice5)
                }

                if (tech.isJunkResearch && powerUps.research.currentRerollCount < 3) {
                    tech.junkResearchNumber = Math.floor(5 * Math.random())
                    text += `<div class="choose-grid-module" onclick="powerUps.research.use('field')"><div class="grid-title"> <span style="position:relative;">`
                    for (let i = 0; i < tech.junkResearchNumber; i++) text += `<div class="circle-grid junk" style="position:absolute; top:0; left:${15*i}px ;opacity:0.8; border: 1px #fff solid;"></div>`
                    text += `</span>&nbsp; <span class='research-select'>pseudoscience</span></div></div>`
                } else if (powerUps.research.count) {
                    text += `<div class="choose-grid-module" onclick="powerUps.research.use('field')"><div class="grid-title"> <span style="position:relative;">`
                    for (let i = 0, len = Math.min(powerUps.research.count, 30); i < len; i++) text += `<div class="circle-grid research" style="position:absolute; top:0; left:${(18 - len*0.3)*i}px ;opacity:0.8; border: 1px #fff solid;"></div>`
                    // text += `</span>&nbsp; <span class='research-select'>research</span></div></div>`
                    text += `</span>&nbsp; <span class='research-select'>${tech.isResearchReality?"<span class='alt'>alternate reality</span>": "research"}</span></div></div>`
                }
                //(${powerUps.research.count})
                // text += `<div style = 'color:#fff'>${simulation.SVGrightMouse} activate the shield with the right mouse<br>fields shield you from damage <br>and let you pick up and throw blocks</div>`
                document.getElementById("choose-grid").innerHTML = text
                powerUps.showDraft();
            }
        }
    },
    tech: {
        name: "tech",
        color: "hsl(246,100%,77%)", //"#a8f",
        size() {
            return 42;
        },
        choiceLog: [], //records all previous choice options
        lastTotalChoices: 0, //tracks how many tech were available for random selection last time a tech was picked up
        // banishLog: [], //records all tech permanently removed from the selection pool
        effect() {
            if (m.alive) {
                function pick(skip1 = null, skip2 = null, skip3 = null, skip4 = null) {
                    let options = [];
                    for (let i = 0; i < tech.tech.length; i++) {
                        if (tech.tech[i].count < tech.tech[i].maxCount && i !== skip1 && i !== skip2 && i !== skip3 && i !== skip4 && tech.tech[i].allowed() && !tech.tech[i].isBanished) {
                            for (let j = 0, len = tech.tech[i].frequency; j < len; j++) options.push(i);
                        }
                    }
                    powerUps.tech.lastTotalChoices = options.length //this is recorded so that banish can know how many tech were available

                    const totalChoices = tech.isDeterminism ? 1 : 3 + tech.isExtraChoice * 2
                    if (powerUps.tech.choiceLog.length > totalChoices || powerUps.tech.choiceLog.length === totalChoices) { //make sure this isn't the first time getting a power up and there are previous choices to remove
                        for (let i = 0; i < totalChoices; i++) { //repeat for each choice from the last selection
                            if (options.length > totalChoices) {
                                for (let j = 0, len = options.length; j < len; j++) {
                                    if (powerUps.tech.choiceLog[powerUps.tech.choiceLog.length - 1 - i] === options[j]) {
                                        options.splice(j, 1) //remove previous choice from option pool
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (options.length > 0) {
                        // const choose = options[Math.floor(Math.random() * options.length)]
                        const choose = options[Math.floor(Math.seededRandom(0, options.length))]
                        const isCount = tech.tech[choose].count > 0 ? `(${tech.tech[choose].count+1}x)` : "";

                        if (tech.tech[choose].isFieldTech) {
                            text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choose})"><div class="grid-title">
                                                    <span style="position:relative;">
                                                        <div class="circle-grid tech" style="position:absolute; top:0; left:0;opacity:0.8;"></div>
                                                        <div class="circle-grid field" style="position:absolute; top:0; left:10px;opacity:0.65;"></div>
                                                    </span>
                                                    &nbsp; &nbsp; &nbsp; &nbsp; ${tech.tech[choose].name} ${isCount}</div>${tech.tech[choose].descriptionFunction ? tech.tech[choose].descriptionFunction() :tech.tech[choose].description}</div></div>`
                        } else if (tech.tech[choose].isGunTech) {
                            text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choose})"><div class="grid-title">
                                                    <span style="position:relative;">
                                                        <div class="circle-grid tech" style="position:absolute; top:0; left:0;opacity:0.8;"></div>
                                                        <div class="circle-grid gun" style="position:absolute; top:0; left:10px; opacity:0.65;"></div>
                                                    </span>
                                                    &nbsp; &nbsp; &nbsp; &nbsp; ${tech.tech[choose].name} ${isCount}</div>${tech.tech[choose].descriptionFunction ? tech.tech[choose].descriptionFunction() :tech.tech[choose].description}</div></div>`
                        } else if (tech.tech[choose].isLore) {
                            text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choose})"><div class="grid-title lore-text"><div class="circle-grid lore"></div> &nbsp; ${tech.tech[choose].name} ${isCount}</div>${tech.tech[choose].descriptionFunction ? tech.tech[choose].descriptionFunction() : tech.tech[choose].description}</div>`
                        } else if (tech.tech[choose].isJunk) {
                            text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choose})"><div class="grid-title"><div class="circle-grid junk"></div> &nbsp; ${tech.tech[choose].name} ${isCount}</div>${tech.tech[choose].descriptionFunction ? tech.tech[choose].descriptionFunction() : tech.tech[choose].description}</div>`
                        } else {
                            text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choose})"><div class="grid-title"><div class="circle-grid tech"></div> &nbsp; ${tech.tech[choose].name} ${isCount}</div>${tech.tech[choose].descriptionFunction ? tech.tech[choose].descriptionFunction() : tech.tech[choose].description}</div>`
                        }

                        // text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choose})"><div class="grid-title"><div class="circle-grid tech"></div> &nbsp; ${tech.tech[choose].name}</div> ${tech.tech[choose].description}</div>`
                        return choose
                    } else if (tech.isBanish) { //if no tech options available eject banish tech
                        for (let i = 0, len = tech.tech.length; i < len; i++) {
                            if (tech.tech[i].name === "decoherence") powerUps.ejectTech(i)
                        }
                    }
                }

                let text = ""
                if (!tech.isSuperDeterminism) text += `<div class='cancel' onclick='powerUps.endDraft("tech",true)'>${tech.isCancelTech ? "?":"✕"}</div>`
                text += `<h3 style = 'color:#fff; text-align:left; margin: 0px;'>tech</h3>`
                let choice1 = pick()
                // console.log(choice1)
                let choice2 = null
                let choice3 = null
                if (choice1 !== null) {
                    powerUps.tech.choiceLog.push(choice1)
                    if (!tech.isDeterminism) {
                        choice2 = pick(choice1)
                        // if (choice2 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choice2})"><div class="grid-title"><div class="circle-grid tech"></div> &nbsp; ${tech.tech[choice2].name}</div> ${tech.tech[choice2].description}</div>`
                        choice3 = pick(choice1, choice2)
                        // if (choice3 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choice3})"><div class="grid-title"><div class="circle-grid tech"></div> &nbsp; ${tech.tech[choice3].name}</div> ${tech.tech[choice3].description}</div>`
                        powerUps.tech.choiceLog.push(choice2)
                        powerUps.tech.choiceLog.push(choice3)
                    }
                    if (tech.isExtraChoice) {
                        let choice4 = pick(choice1, choice2, choice3)
                        // if (choice4 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choice4})"><div class="grid-title"><div class="circle-grid tech"></div> &nbsp; ${tech.tech[choice4].name}</div> ${tech.tech[choice4].description}</div>`
                        let choice5 = pick(choice1, choice2, choice3, choice4)
                        // if (choice5 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('tech',${choice5})"><div class="grid-title"><div class="circle-grid tech"></div> &nbsp; ${tech.tech[choice5].name}</div> ${tech.tech[choice5].description}</div>`
                        powerUps.tech.choiceLog.push(choice4)
                        powerUps.tech.choiceLog.push(choice5)
                    }
                    // if (powerUps.research.count) text += `<div class="choose-grid-module" onclick="powerUps.research.use('tech')"><div class="grid-title"><div class="circle-grid research"></div> &nbsp; research <span class="research-select">${powerUps.research.count}</span></div></div>`

                    if (tech.isExtraGunField) {
                        if (Math.random() > 0.5 && b.inventory.length < b.guns.length) {
                            //bonus gun in tech menu
                            let choiceGun = powerUps.gun.pick(b.guns)
                            powerUps.gun.choiceLog.push(choiceGun)
                            text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choiceGun})"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choiceGun].name}</div> ${b.guns[choiceGun].description}</div>`
                        } else {
                            //bonus field in tech menu
                            let choiceField = powerUps.field.pick(m.fieldUpgrades)
                            powerUps.field.choiceLog.push(choiceField)
                            text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choiceField})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${m.fieldUpgrades[choiceField].name}</div> ${m.fieldUpgrades[choiceField].description}</div>`
                        }
                    }
                    if (tech.isExtraBotOption) {
                        const botTech = [] //make an array of bot options
                        for (let i = 0, len = tech.tech.length; i < len; i++) {
                            if (tech.tech[i].isBotTech && !tech.tech[i].isJunk && tech.tech[i].count < tech.tech[i].maxCount && tech.tech[i].allowed()) botTech.push(i)
                        }
                        if (botTech.length > 0) { //pick random bot tech
                            const choose = botTech[Math.floor(Math.random() * botTech.length)];
                            const techCountText = tech.tech[choose].count > 0 ? `(${tech.tech[choose].count + 1}x)` : "";
                            const style = "font-size: 150%;font-family: 'Courier New', monospace;"
                            text += `<div class="choose-grid-module card-background" onclick="powerUps.choose('tech',${choose})" ${style}>
                                    <div class="card-text">
                                    <div class="grid-title"><span  style = "font-size: 150%;font-family: 'Courier New', monospace;">⭓▸●■</span> &nbsp; ${tech.tech[choose].name} ${techCountText}</div>
                                    ${tech.tech[choose].descriptionFunction ? tech.tech[choose].descriptionFunction() : tech.tech[choose].description}</div></div>`
                        }
                    }

                    if (tech.isBrainstorm && !tech.isBrainstormActive && !simulation.isChoosing) {
                        tech.isBrainstormActive = true
                        let count = 0
                        requestAnimationFrame(cycle);

                        function cycle() {
                            count++
                            if (count < tech.brainStormDelay * 5 && simulation.isChoosing) {
                                if (!(count % tech.brainStormDelay)) {
                                    powerUps.tech.effect();
                                    document.getElementById("choose-grid").style.pointerEvents = "auto"; //turn off the normal 500ms delay
                                    document.body.style.cursor = "auto";
                                    document.getElementById("choose-grid").style.transitionDuration = "0s";
                                }
                                requestAnimationFrame(cycle);
                            } else {
                                tech.isBrainstormActive = false
                            }
                        }
                    }

                    //add in research button or pseudoscience button
                    if (tech.isJunkResearch && powerUps.research.currentRerollCount < 3) {
                        tech.junkResearchNumber = Math.floor(5 * Math.random())
                        text += `<div class="choose-grid-module" onclick="powerUps.research.use('tech')"><div class="grid-title"> <span style="position:relative;">`
                        for (let i = 0; i < tech.junkResearchNumber; i++) text += `<div class="circle-grid junk" style="position:absolute; top:0; left:${15*i}px ;opacity:0.8; border: 1px #fff solid;"></div>`
                        text += `</span>&nbsp; <span class='research-select'>pseudoscience</span></div></div>`
                    } else if (powerUps.research.count) {
                        text += `<div class="choose-grid-module" onclick="powerUps.research.use('tech')"><div class="grid-title"> <span style="position:relative;">`
                        for (let i = 0, len = Math.min(powerUps.research.count, 30); i < len; i++) text += `<div class="circle-grid research" style="position:absolute; top:0; left:${(18 - len*0.3)*i}px;opacity:0.8; border: 1px #fff solid;"></div>`
                        // text += `</span>&nbsp; <span class='research-select'>research</span></div></div>`
                        text += `</span>&nbsp; <span class='research-select'>${tech.isResearchReality?"<span class='alt'>alternate reality</span>": "research"}</span></div></div>`
                    }

                    // if (tech.isBrainstorm && tech.isBrainstormActive < 4) {
                    //     setTimeout(() => {
                    //         if (simulation.isChoosing) {
                    //             tech.isBrainstormActive++
                    //             powerUps.tech.effect();
                    //             //turn off the normal 500ms delay
                    //             document.getElementById("choose-grid").style.pointerEvents = "auto";
                    //             document.body.style.cursor = "auto";
                    //             document.getElementById("choose-grid").style.transitionDuration = "0s";
                    //         } else {
                    //             tech.isBrainstormActive = 0;
                    //         }
                    //     }, 1000);
                    // } else {
                    //     tech.isBrainstormActive = 0;
                    // }

                    document.getElementById("choose-grid").innerHTML = text
                    powerUps.showDraft();

                }
            }
        }
    },
    gun: {
        name: "gun",
        color: "#26a",
        size() {
            return 35;
        },
        pick(who, skip1 = -1, skip2 = -1, skip3 = -1, skip4 = -1) {
            let options = [];
            for (let i = 0; i < who.length; i++) {
                if (!who[i].have && i !== skip1 && i !== skip2 && i !== skip3 && i !== skip4) {
                    options.push(i);
                }
            }

            //remove repeats from last selection
            const totalChoices = tech.isDeterminism ? 1 : 3 + tech.isExtraChoice * 2
            if (powerUps.gun.choiceLog.length > totalChoices || powerUps.gun.choiceLog.length === totalChoices) { //make sure this isn't the first time getting a power up and there are previous choices to remove
                for (let i = 0; i < totalChoices; i++) { //repeat for each choice from the last selection
                    if (options.length > totalChoices) {
                        for (let j = 0, len = options.length; j < len; j++) {
                            if (powerUps.gun.choiceLog[powerUps.gun.choiceLog.length - 1 - i] === options[j]) {
                                options.splice(j, 1) //remove previous choice from option pool
                                break
                            }
                        }
                    }
                }
            }
            if (options.length > 0) {
                // console.log(`random: ${Math.seededRandom(0, options.length)}`)

                return options[Math.floor(Math.seededRandom(0, options.length))]
                // return options[Math.floor(Math.random() * options.length)]
            }
        },
        choiceLog: [], //records all previous choice options
        effect() {
            let choice1 = powerUps.gun.pick(b.guns)
            let choice2 = -1
            let choice3 = -1
            if (choice1 > -1) {
                let text = ""
                if (!tech.isSuperDeterminism) text += `<div class='cancel' onclick='powerUps.endDraft("gun",true)'>${tech.isCancelTech ? "?":"✕"}</div>`
                text += `<h3 style = 'color:#fff; text-align:left; margin: 0px;'>gun</h3>`
                text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice1})"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice1].name}</div> ${b.guns[choice1].description}</div>`
                if (!tech.isDeterminism) {
                    choice2 = powerUps.gun.pick(b.guns, choice1)
                    if (choice2 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice2})"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice2].name}</div> ${b.guns[choice2].description}</div>`
                    choice3 = powerUps.gun.pick(b.guns, choice1, choice2)
                    if (choice3 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice3})"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice3].name}</div> ${b.guns[choice3].description}</div>`
                }
                if (tech.isExtraChoice) {
                    let choice4 = powerUps.gun.pick(b.guns, choice1, choice2, choice3)
                    if (choice4 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice4})"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice4].name}</div> ${b.guns[choice4].description}</div>`
                    let choice5 = powerUps.gun.pick(b.guns, choice1, choice2, choice3, choice4)
                    if (choice5 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice5})">
          <div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice5].name}</div> ${b.guns[choice5].description}</div>`
                    powerUps.gun.choiceLog.push(choice4)
                    powerUps.gun.choiceLog.push(choice5)
                }
                powerUps.gun.choiceLog.push(choice1)
                powerUps.gun.choiceLog.push(choice2)
                powerUps.gun.choiceLog.push(choice3)
                // if (powerUps.research.count) text += `<div class="choose-grid-module" onclick="powerUps.research.use('gun')"><div class="grid-title"><div class="circle-grid research"></div> &nbsp; research <span class="research-select">${powerUps.research.count}</span></div></div>`

                if (tech.isJunkResearch && powerUps.research.currentRerollCount < 3) {
                    tech.junkResearchNumber = Math.floor(5 * Math.random())
                    text += `<div class="choose-grid-module" onclick="powerUps.research.use('gun')"><div class="grid-title"> <span style="position:relative;">`
                    for (let i = 0; i < tech.junkResearchNumber; i++) text += `<div class="circle-grid junk" style="position:absolute; top:0; left:${15*i}px ;opacity:0.8; border: 1px #fff solid;"></div>`
                    text += `</span>&nbsp; <span class='research-select'>pseudoscience</span></div></div>`
                } else if (powerUps.research.count) {
                    text += `<div class="choose-grid-module" onclick="powerUps.research.use('gun')"><div class="grid-title"> <span style="position:relative;">`
                    for (let i = 0, len = Math.min(powerUps.research.count, 30); i < len; i++) text += `<div class="circle-grid research" style="position:absolute; top:0; left:${(18 - len*0.3)*i}px ;opacity:0.8; border: 1px #fff solid;"></div>`
                    text += `</span>&nbsp; <span class='research-select'>${tech.isResearchReality?"<span class='alt'>alternate reality</span>": "research"}</span></div></div>`
                }
                if (tech.isOneGun && b.inventory.length > 0) text += `<div style = "color: #f24">replaces your current gun</div>`
                document.getElementById("choose-grid").innerHTML = text
                powerUps.showDraft();
            }
        }
    },
    exoticPartsMaxHP: {
        count: 0,
        name: "max health",
        color: "#4b6",
        size() {
            return 20;
        },
        effect() {
            tech.extraMaxHealth += 0.12
            m.setMaxHealth();
        },
    },
    exoticPartsMaxE: {
        count: 0,
        name: "max energy",
        color: "#0ae",
        size() {
            return 20;
        },
        effect() {
            tech.healMaxEnergyBonus += 0.12
            m.setMaxEnergy();
        },
    },
    boost: {
        name: "boost",
        color: "#f55", //"#0cf",
        size() {
            return 11;
        },
        endCycle: 0,
        duration: 600,
        damage: 1.25,
        isDefense: false,
        effect() {
            powerUps.boost.endCycle = simulation.cycle + Math.floor(Math.max(0, powerUps.boost.endCycle - simulation.cycle) * 0.6) + powerUps.boost.duration //duration+seconds plus 2/3 of current time left
        },
        draw() {
            // console.log(this.endCycle)
            // if (powerUps.boost.endCycle > m.cycle) {
            //     ctx.strokeStyle = "rgba(255,0,0,0.8)" //m.fieldMeterColor; //"rgba(255,255,0,0.2)" //ctx.strokeStyle = `rgba(0,0,255,${0.5+0.5*Math.random()})`
            //     ctx.beginPath();
            //     const arc = (powerUps.boost.endCycle - m.cycle) / powerUps.boost.duration
            //     ctx.arc(m.pos.x, m.pos.y, 28, m.angle - Math.PI * arc, m.angle + Math.PI * arc); //- Math.PI / 2
            //     ctx.lineWidth = 4
            //     ctx.stroke();
            // }

            if (powerUps.boost.endCycle > simulation.cycle) {
                //gel that acts as if the wind is blowing it when player moves
                ctx.save();
                ctx.translate(m.pos.x, m.pos.y);
                m.velocitySmooth = Vector.add(Vector.mult(m.velocitySmooth, 0.8), Vector.mult(player.velocity, 0.2))
                ctx.rotate(Math.atan2(m.velocitySmooth.y, m.velocitySmooth.x))
                ctx.beginPath();
                const radius = 40
                const mag = 8 * Vector.magnitude(m.velocitySmooth) + radius
                ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2);
                ctx.bezierCurveTo(-radius, radius, -radius, 0, -mag, 0); // bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
                ctx.bezierCurveTo(-radius, 0, -radius, -radius, 0, -radius);
                const time = Math.min(0.5, (powerUps.boost.endCycle - simulation.cycle) / powerUps.boost.duration)
                ctx.fillStyle = `rgba(255,0,200,${time})`
                ctx.fill()
                ctx.strokeStyle = "#f09"
                ctx.lineWidth = 0.3 + 4 * time
                ctx.stroke();
                ctx.restore();
            }
        },
    },
    onPickUp(who) {
        powerUps.research.currentRerollCount = 0
        if (tech.isTechDamage && who.name === "tech") m.damage(0.11)
        if (tech.isMassEnergy) m.energy += 2;
        if (tech.isMineDrop && bullet.length < 150 && Math.random() < 0.6) {
            if (tech.isLaserMine && input.down) {
                b.laserMine(who.position)
            } else {
                b.mine(who.position, { x: 0, y: 0 }, 0)
            }
        }
        if (tech.isRelay) {
            if (tech.isFlipFlopOn) {
                tech.isFlipFlopOn = false
                if (document.getElementById("tech-switch")) document.getElementById("tech-switch").innerHTML = ` = <strong>OFF</strong>`
                m.eyeFillColor = 'transparent'
            } else {
                tech.isFlipFlopOn = true //immune to damage this hit, lose immunity for next hit
                if (document.getElementById("tech-switch")) document.getElementById("tech-switch").innerHTML = ` = <strong>ON</strong>`
                m.eyeFillColor = m.fieldMeterColor //'#0cf'
            }
            if (tech.isRelayEnergy) m.setMaxEnergy();
        }
    },
    // giveRandomAmmo() {
    //     const ammoTarget = Math.floor(Math.random() * (b.guns.length));
    //     const ammo = Math.ceil(b.guns[ammoTarget].ammoPack * 6);
    //     if (ammo !== Infinity) {
    //         b.guns[ammoTarget].ammo += ammo;
    //         simulation.updateGunHUD();
    //         simulation.makeTextLog(`${b.guns[ammoTarget].name}.<span class='color-g'>ammo</span> <span class='color-symbol'>+=</span> ${ammo}`);
    //     }
    // },
    spawnRandomPowerUp(x, y) { //mostly used after mob dies,  doesn't always return a power up
        if (!tech.isTreasure) {
          if ((Math.random() * Math.random() - 0.3 > Math.sqrt(m.health) && !tech.isEnergyHealth) || Math.random() < (0.04+(0.01*tech.isLooting))*(tech.isExoticParts ? 0.6 : 1)) { //spawn heal chance is higher at low health
            powerUps.spawn(x, y, "heal");
            return;
          }
          if (Math.random() < 0.15+(0.05*tech.isLooting)*(tech.isExoticParts ? 0.6 : 1) && b.inventory.length > 0) {
            powerUps.spawn(x, y, "ammo");
            return;
          }
          if (Math.random() < 0.0007*(tech.isExoticParts ? 0.6 : 1) * (3 - b.inventory.length)) { //a new gun has a low chance for each not acquired gun up to 3
            powerUps.spawn(x, y, "gun");
            return;
          }
          // if (Math.random() < 0.0027 * (22 - tech.totalCount)) { //a new tech has a low chance for each not acquired tech up to 25
          if (Math.random() < 0.005*(tech.isExoticParts ? 0.6 : 1) * 10-level.levelsCleared) { //a new tech has a low chance that decreases in later levels
            powerUps.spawn(x, y, "tech");
            return;
          }
          if (Math.random() < 0.0015*(tech.isExoticParts ? 0.6 : 1)) {
            powerUps.spawn(x, y, "field");
            return;
          }
          if (Math.random() < 0.02*(tech.isExoticParts ? 0.6 : 1) && tech.isLooting) {
            powerUps.spawn(x, y, "research");
            return;
          }
          if (Math.random() < 0.06 && tech.isExoticParts) {
            powerUps.spawn(x, y, "exoticPartsMaxHP");
            return;
          }
          if (Math.random() < 0.06 && tech.isExoticParts) {
            powerUps.spawn(x, y, "exoticPartsMaxE");
            return;
          }
          if (Math.random() < (0.02+(tech.isBoostPowerUps?0.14:0))*(tech.isExoticParts ? 0.6 : 1)) {
            powerUps.spawn(x, y, "boost");
            return;
          }
        } else {
          if (Math.random() < 0.1+(tech.isBoostPowerUps?0.14:0)) {
            powerUps.spawn(x, y, "boost");
            return;
          }
          if (Math.random() < 0.1) {
            powerUps.spawn(x, y, "research");
            return;
          }
        }
    },
    randomPowerUpCounter: 0,
    spawnBossPowerUp(x, y) { //boss spawns field and gun tech upgrades
        if (level.levels[level.onLevel] !== "final") {
            if (m.fieldMode === 0) {
                powerUps.spawn(x, y, "field")
            } else {
                powerUps.randomPowerUpCounter++;
                powerUpChance(Math.max(level.levelsCleared, 10) * 0.1)
            }
            powerUps.randomPowerUpCounter += 0.6;
            powerUpChance(Math.max(level.levelsCleared, 6) * 0.1)
            if (simulation.specialMode) {powerUps.spawn(x, y, "tech");powerUps.spawn(x, y, "tech");}
            function powerUpChance(chanceToFail) {
                if (Math.random() * chanceToFail < powerUps.randomPowerUpCounter) {
                    powerUps.randomPowerUpCounter = 0;
                    if (Math.random() < 0.97) {
                        powerUps.spawn(x, y, "tech")
                    } else {
                        powerUps.spawn(x, y, "gun")
                    }
                } else {
                    if (m.health < 0.65 && !tech.isEnergyHealth) {
                        powerUps.spawn(x, y, "heal");
                        powerUps.spawn(x, y, "heal");
                    } else {
                        powerUps.spawn(x, y, "ammo");
                        powerUps.spawn(x, y, "ammo");
                    }
                }
            }
        }
    },
    chooseRandomPowerUp(x, y) { //100% chance to drop a random power up    //used in spawn.debris
        if (Math.random() < 0.5) {
            powerUps.spawn(x, y, "heal", false);
        } else {
            powerUps.spawn(x, y, "ammo", false);
        }
    },
    addResearchToLevel() { //add a random power up to a location that has a mob,  mostly used to give each level one randomly placed research
        if (mob.length && Math.random() < 0.8) { // 80% chance
            const index = Math.floor(Math.random() * mob.length)
            powerUps.spawn(mob[index].position.x, mob[index].position.y, "research");
        }
    },
    spawnStartingPowerUps(x, y) { //used for map specific power ups, mostly to give player a starting gun
        if (level.levelsCleared < 4) { //runs 4 times on all difficulty levels
            if (level.levelsCleared > 1) powerUps.spawn(x, y, "tech")
            if (b.inventory.length === 0) {
                powerUps.spawn(x, y, "gun", false); //first gun
            } else if (tech.totalCount === 0) { //first tech
                powerUps.spawn(x, y, "tech", false);
            } else if (b.inventory.length === 1) { //second gun or extra ammo
                if (Math.random() < 0.4) {
                    powerUps.spawn(x, y, "gun", false);
                } else {
                    for (let i = 0; i < 5; i++) powerUps.spawn(x, y, "ammo", false);
                }
            } else {
                for (let i = 0; i < 4; i++) powerUps.spawnRandomPowerUp(x, y);
            }
        } else {
            for (let i = 0; i < 3; i++) powerUps.spawnRandomPowerUp(x, y);
        }
    },
    ejectTech(choose = 'random') {
        if (!simulation.isChoosing)


            //find which tech you have
            if (choose === 'random') {
                const have = []
                for (let i = 0; i < tech.tech.length; i++) {
                    if (tech.tech[i].count > 0 && !tech.tech[i].isNonRefundable) have.push(i)
                }
                if (have.length === 0) {
                    for (let i = 0; i < tech.tech.length; i++) {
                        if (tech.tech[i].count > 0) have.push(i)
                    }
                }

                if (have.length) {
                    choose = have[Math.floor(Math.random() * have.length)]
                    // simulation.makeTextLog(`<div class='circle tech'></div> &nbsp; <strong>${tech.tech[choose].name}</strong> was ejected`, 600) //message about what tech was lost
                    simulation.makeTextLog(`<span class='color-var'>tech</span>.remove("<span class='color-text'>${tech.tech[choose].name}</span>")`)

                    for (let i = 0; i < tech.tech[choose].count; i++) {
                        powerUps.directSpawn(m.pos.x, m.pos.y, "tech");
                        // powerUp[powerUp.length - 1].isDuplicated = true
                    }
                    // remove a random tech from the list of tech you have
                    tech.tech[choose].remove();
                    tech.tech[choose].count = 0;
                    tech.tech[choose].isLost = true;
                    simulation.updateTechHUD();
                    m.fieldCDcycle = m.cycle + 30; //disable field so you can't pick up the ejected tech
                    return true
                } else {
                    return false
                }
            } else if (tech.tech[choose].count) {
            // simulation.makeTextLog(`<div class='circle tech'></div> &nbsp; <strong>${tech.tech[choose].name}</strong> was ejected`, 600) //message about what tech was lost
            simulation.makeTextLog(`<span class='color-var'>tech</span>.remove("<span class='color-text'>${tech.tech[choose].name}</span>")`)

            for (let i = 0; i < tech.tech[choose].count; i++) {
                powerUps.directSpawn(m.pos.x, m.pos.y, "tech");
                powerUp[powerUp.length - 1].isDuplicated = true
            }
            // remove a random tech from the list of tech you have
            tech.tech[choose].remove();
            tech.tech[choose].count = 0;
            tech.tech[choose].isLost = true;
            simulation.updateTechHUD();
            m.fieldCDcycle = m.cycle + 30; //disable field so you can't pick up the ejected tech
            return true
        } else {
            return false
        }
    },
    pauseEjectTech(index) {
        if ((tech.isPauseEjectTech || simulation.testing) && !simulation.isChoosing) {
            if (Math.random() < 0.1 || tech.tech[index].isFromAppliedScience) {
                tech.removeTech(index)
                powerUps.spawn(m.pos.x + 40 * (Math.random() - 0.5), m.pos.y + 40 * (Math.random() - 0.5), "research", false);
            } else {
                powerUps.ejectTech(index)
            }
            document.getElementById(`${index}-pause-tech`).style.textDecoration = "line-through"
            document.getElementById(`${index}-pause-tech`).style.animation = ""
            document.getElementById(`${index}-pause-tech`).onclick = null
        }
    },
    // removeRandomTech() {
    //     const have = [] //find which tech you have
    //     for (let i = 0; i < tech.tech.length; i++) {
    //         if (tech.tech[i].count > 0) have.push(i)
    //     }
    //     if (have.length) {
    //         const choose = have[Math.floor(Math.random() * have.length)]
    //         simulation.makeTextLog(`<span class='color-var'>tech</span>.removeTech("<span class='color-text'>${tech.tech[choose].name}</span>")`)
    //         const totalRemoved = tech.tech[choose].count
    //         tech.tech[choose].count = 0;
    //         tech.tech[choose].remove(); // remove a random tech form the list of tech you have
    //         tech.tech[choose].isLost = true
    //         simulation.updateTechHUD();
    //         return totalRemoved
    //     }
    //     return 0
    // },
    directSpawn(x, y, target, moving = true, mode = null, size = powerUps[target].size()) {
        let index = powerUp.length;
        target = powerUps[target];
        powerUp[index] = Matter.Bodies.polygon(x, y, 0, size, {
            density: 0.001,
            frictionAir: 0.03,
            restitution: 0.85,
            inertia: Infinity, //prevents rotation
            collisionFilter: {
                group: 0,
                category: cat.powerUp,
                mask: cat.map | cat.powerUp
            },
            color: target.color,
            effect: target.effect,
            name: target.name,
            size: size
        });
        if (mode) powerUp[index].mode = mode
        if (moving) {
            Matter.Body.setVelocity(powerUp[index], {
                x: (Math.random() - 0.5) * 15,
                y: Math.random() * -9 - 3
            });
        }
        Composite.add(engine.world, powerUp[index]); //add to world
    },
    randomize(where) { //makes a random power up convert into a random different power up
        //put 10 power ups close together
        const len = Math.min(10, powerUp.length)
        for (let i = 0; i < len; i++) { //collide the first 10 power ups
            const unit = Vector.rotate({ x: 1, y: 0 }, 6.28 * Math.random())
            Matter.Body.setPosition(powerUp[i], Vector.add(where, Vector.mult(unit, 20 + 25 * Math.random())));
            Matter.Body.setVelocity(powerUp[i], Vector.mult(unit, 20));
        }

        //count big power ups and small power ups
        let options = ["heal", "research", "ammo", "boost"]
        let bigIndexes = []
        let smallIndexes = []
        for (let i = 0; i < powerUp.length; i++) {
            if (powerUp[i].name === "tech" || powerUp[i].name === "gun" || powerUp[i].name === "field") {
                bigIndexes.push(i)
            } else {
                smallIndexes.push(i)
            }
        }


        if (smallIndexes.length > 2 && Math.random() < 0.66) {             // console.log("no big, at least 3 small can combine")
            for (let j = 0; j < 3; j++) {
                for (let i = 0; i < powerUp.length; i++) {
                    if (powerUp[i].name === "heal" || powerUp[i].name === "research" || powerUp[i].name === "ammo" || powerUp[i].name === "coupling" || powerUp[i].name === "boost") {
                        Matter.Composite.remove(engine.world, powerUp[i]);
                        powerUp.splice(i, 1);
                        break
                    }
                }
            }

            options = ["tech", "tech", "tech", "gun", "gun", "field"]
            powerUps.directSpawn(where.x, where.y, options[Math.floor(Math.random() * options.length)], false)
        } else if (bigIndexes.length > 0 && Math.random() < 0.5) { // console.log("at least 1 big can spilt")
            const index = bigIndexes[Math.floor(Math.random() * bigIndexes.length)]
            for (let i = 0; i < 3; i++) powerUps.directSpawn(where.x, where.y, options[Math.floor(Math.random() * options.length)], false)

            Matter.Composite.remove(engine.world, powerUp[index]);
            powerUp.splice(index, 1);
        } else if (smallIndexes.length > 0) { // console.log("no big, at least 1 small will swap flavors")
            const index = Math.floor(Math.random() * powerUp.length)
            options = options.filter(e => e !== powerUp[index].name); //don't repeat the current power up type
            powerUps.directSpawn(where.x, where.y, options[Math.floor(Math.random() * options.length)], false)
            Matter.Composite.remove(engine.world, powerUp[index]);
            powerUp.splice(index, 1);
        }
    },
    spawn(x, y, target, moving = true, mode = null, size = powerUps[target].size()) {
        if (
            (!tech.isSuperDeterminism || (target !== 'research')) &&
            !(tech.isEnergyNoAmmo && target === 'ammo') &&
            !(b.inventory.length >= b.guns.length && target === 'gun') &&
            (!simulation.isNoPowerUps)
        ) {
            powerUps.directSpawn(x, y, target, moving, mode, size)
            if (Math.random() < tech.duplicationChance()) {
                powerUps.directSpawn(x, y, target, moving, mode, size)
                powerUp[powerUp.length - 1].isDuplicated = true
                // if (tech.isPowerUpsVanish) powerUp[powerUp.length - 1].endCycle = simulation.cycle + 300
                if (tech.isDupEnergy) m.energy *= 2
                if (tech.isDupEnergy && m.energy > m.maxEnergy) m.energy = m.maxEnergy
            }
        } else if (b.inventory.length >= b.guns.length && target === 'gun') {
            for (let i=0;i<3;i++) powerUps.spawn(x,y,"ammo")
        }
    },
};
