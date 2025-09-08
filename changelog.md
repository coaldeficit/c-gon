# porting R (2025/09/08)
- ported furnace and superstructure
- - furnace has been made much less epileptic than in vanilla
- ported quantum Zeno effect, quantum Darwinism, interest, peer review, clinical peer review, aerostat, remineralization and demineralization tech
- - quantum Zeno effect allows survival under 0 health for 8 seconds instead of its vanilla effect
- nerfed Zeno's paradox harm reduction from 85% to 70%
- nerfed neutronium harm reduction from 90% to 75%
- Zeno's paradox and neutronium are now mutually exclusive
- nerfed induction brake duration from 17 seconds to 7 seconds
# unleash chernobyl (2025/02/26)
- added 1 new tech:
- - nuclear reactor meltdown: rebar shoots 2 less control rods + 1 extra control rod for each mob killed with rebar active before firing with it
- higher explosion radius from techs now logarithmically decreases explosion damage
- duplication chance now caps at 111%
- nerfed futures exchange from 3% duplication chance per cancel to 2%
- buffed stimulated emission from 15% duplication chance to 30% duplication chance
- metastability changes:
- - buffed duplication chance from 12% to 25%
- - buffed duplicated powerup half life from 3 seconds to 5 seconds
- born rule no longer deducts tech for having determinism and superdeterminism prior to picking it
- determinism and superdeterminism now give 8 tech instead of 5
- meta-analysis changes:
- - now gives 4 research instead of 3
- - now properly states how much research it gives in its description
- Newton-Raphson method changes:
- - projectiles now last 0.5 seconds shorter, but last an extra 0.1666 seconds longer for every enemy they hit
- - projectiles are now worse at turning
- - projectiles now ignore and dont collide with invulnerable enemies
- - projectiles now prioritize mobs that drop powerups over those that dont
- - projectiles now have a 50% larger hitbox and deal 50% more damage
# im being forced to learn kotlin help (2025/02/25)
- fixed hydrogen guntech not being selectable with blast or shotgun with compressed gas
- fixed level count in map settings not actually doing anything and just always being set to 15 at the start of every run
# oops its busted (2025/01/27)
- Newton–Raphson method changes:
- - removes 75% of current energy alongside 75% of max energy on activation if above 160% energy
- - reduced projectile homing range
- - projectiles can now only home in on mobs you have a direct line of sight to
- - detection line can no longer go through map geometry and is far shorter
# play cambria sword right this instant (2025/01/26)
- added a new gun: flank: uses energy to shoot 2 orbs at an angle that split into bullets going forwards and backwards
- added 5 new tech:
- - vector direction: flank shoots a 3rd orb forwards, but uses 30% more energy per shot
- - antiparallel vector: flank orbs shoot an additional bullet going backwards, but flank uses 50% more energy per shot
- - energy flux: flank orbs generate energy in contact with mobs, but flank's bullets deal less damage
- - intersection: flank bullets can pierce through walls and mobs
- - Newton–Raphson method: flank's crouch fire is replaced with a downwards tripwire that uses 75% energy and creates 3 powerful homing projectiles on contact with mobs
- moved corridor to gimmick maps due to being unoptimized for c-gon
- added unchartedCave to gimmick maps for the same reason as corridor after being left unused for basically as long as c-gon existed
- WIMPs tech now gives 4 research per stack instead of 5, and WIMP particles now speed up with distance
# agonizing realities (2025/01/25)
- getting standing wave in an alternate reality from non-unitary operator is now far rarer
- fixed being able to get NAND gate and transistor via alternate reality with qubit
- - ever since its addition qubit made it so NAND gate and transistor dont get taken away in reality changes if you have it
- - because of this, every alternate reality run with qubit would eventually converge into eventually having those 2 techs even if you didnt select them on your own
# happy new year (2025/01/01)
- ported corridor
# porting Q (2024/11/13)
- ported substructure and downpour update
- - downpour has sounds muted by default
- nerfed futures exchange from 4.5% duplication chance per cancel to 3%
- slimeFinalBoss changes:
- - now has an indicator for the bullet spam in its beam attack
- - now comes from farther from the spawn room after finishing the beam attack
# block-assisted mob battery (2024/11/11)
- added 3 new tech:
- - de Broglie-Bohm theory: pilot wave shrinks significantly slower when out of sight. suggested by garfunkel
- - empty Ψ(t): pilot wave can transfer and increase the mass of up to 8 blocks between levels
- - Zeeman effect: blocks do triple damage but slowly shrink and lose mass inside pilot wave
- added 1 new junk tech:
- - leash: get constrained to your current position
- removed duplicate bot prototypes tech
- fork bomb now floods the ingame console
- fixed working mass carrying over between runs
- removed springBoss from the boss pool until i can make it less insufferable
- fixed newer vanilla bosses being unaffected by parthenogenesis boss health increase
- laserLayerBoss changes:
- - removed invulnerability at each 1/4th of its health
- - previous lasers now go away when the indicators for the next ones appear
- - buffed laser damage by 33.(3)%
- increased base bot fabrication cost to 3 research per bot and made it increase in cost by 1 research every 2 bots
# porting P (2024/11/09)
- ported Halbach array, additive manufacturing and working mass tech
- dark matter is now unaffected by damage to hopefully make it not despawn in certain situations where the player deals ridiculous damage
- fixed dark matter despawning on subway
- Bohr magneton now makes electron magnetic moment not affect mobs that are invulnerable
- started work on porting constraints
- - note: constraints are only <span style="font-style:italic;">PARTIALLY</span> in the game right now. they only exist in a non-functional state in the code and are inaccessible during normal gameplay
# simulatory edge (2024/10/31)
- added 1 new tech:
- - fourth dimension: inserts a special, difficult level into the level list with a unique boss that may grant 6 tech on completion
- - please tell me if i went overboard with the difficulty
- special reduction can no longer be obtained as a random tech
- annihilation now uses 33 energy instead of 33% of your max energy
- added link to n-gon-upgraded in the settings
# bird-oid object (2024/10/30)
- added 1 new mob:
- - boid: spawns in flocks that attack collectively
- - boids can be found on levels 6 and 7 on seed 39977 with main, modern main and c-gon maps plus classic and modern intermission maps as of this update
- constraintBoss changes:
- - now does harm every 2 seconds instead of 1 second
- - harm timer now uses time since it has attached instead of global cycle timer
- tripwireBoss no longer spots you on taking damage, but is now invulnerable when you're not in the range of its lasers
- gun powerups spawned when you have all guns available are now converted into 3 ammo powerups
- fixed depolarization skin not turning blue
- factory can now spawn slasher2, slasher3 and drifter from block to mob conversion
# c-gon in class (2024/10/26)
- added bifurcate, a new c-gon exclusive map
- added mobile support
- - the control scheme might not be the best so feedback and suggestions on how to improve it are highly appreciated
- flak now makes shotgun fire in an even narrower arc as suggested by Desboot
- fixed induction braking still being selectable even if you have quenching
- fixed pigeonhole principle not actually boosting damage
# buffs (2024/10/24)
- added 2 new tech:
- - cloud condensation nuclei: hydrogen is attracted to nearby mobs
- - deuterium: doubles all hydrogen effects, but hydrogen slowly sinks
- fixed hydrogen embrittlement making bosses unkillable
- Bohr magneton now deals 25% less harm
- tritium now does 122% more damage
- BLEVE now deals 33% less harm
# long metal rod (2024/10/24)
- added a new gun: rebar: fires a large, piercing projectile that becomes an immobile block on contact with walls. suggested by Cornbread 2100 and Masbird
- added 11 new tech:
- - electron magnetic moment: rebars attract nearby mobs. suggested by garfunkel
- - Bohr magneton: mobs attracted by rebars take damage but cause you harm in return
- - Coulomb's law: rebar shoots faster but uses energy to shoot instead of ammo. suggested by Masbirb
- - control rod ejection: rebar shoots radioactive control rods alongside rebars
- - oxide jacking: rebars convert blocks to nails that are aimed at nearby mobs
- - pinning points: rebars stun and grab mobs for abit. suggested by garfunkel
- - exciton-polariton: rebars convert grabbed mobs into boosts or ammo upon hitting a wall
- - contrail: rebars and missiles leave behind a trail of explosive hydrogen gas that slows mobs and explodes on contact with explosions
- - hydrogen embrittlement: hydrogen gas decreases damage resistance of mobs caught inside it by 5% per second
- - tritium: hydrogen gas is radioactive
- - compressed gas: shotgun and blast guns release hydrogen gas while firing
- bremsstrahlung now uses energy
- - energy usage increases logarithmically with stacks, not linearly
- names in the credits are now larger to make them stand out from the various suggestions ive received
- stun now has a special css text style
- - let me know if the flashing is too fast
- healBoss no longer heals stunned mobs
# 53 level special difficulty marathon challenge run when (2024/10/21)
- map settings changes:
- - intermission maps are now their own category with 3 checkboxes for setting what intermission maps you want to play
- - extended levels option has been replaced by a direct level count
- added a section to the menu to credit those who have in some form contributed to c-gon
- buffed integrated armament's damage increase from 25% to 50%
- added 1 new tech:
- - alternating munitions: shotgun cycles between all possible things it can shoot. suggested by Masbirb
- renamed gravityObservatory and gravityInterferometer to gravitron and interferometer respectively
# shotfoamgun (2024/10/20)
- added 5 new tech:
- - syntactic foam: makes foam do impact damage
- - Plateau's laws: makes foam do more damage the longer you keep it charged up before firing
- - sodium laureth sulfate: makes foam self-replicate as it travels unattached to mobs
- - ricochet: shotgun projectiles bounce off towards other mobs upon hitting a mob
- - heat pipe: having shotgun equipped and not firing with it slowly increases your fire rate, while not doing that slowly decreases it
- spin-statistics now reduces shotgun ammo by 40% instead of 50%
# slimeFinalBoss (2024/10/20)
- added slimeFinalBoss, an alternative final boss that has a 50% chance to show up on final instead of the usual one
- - can be found at the end of seed 57153 if you want to mess around with it
- - feedback is highly appreciated
- reworded spin-statistics description
- spin-statistics now counts for abelian group requirement
- fixed boosts persisting between runs
# porting O (2024/10/14)
- added 2 new tech:
- - flak: makes shotgun shoot faster in a narrower arc. suggested by desboot
- - photodisintegration: increases max health by 150, but causes harm when not under low ceilings
- renamed MACHO to dark matter
- ported dark energy, MACHO, entropic gravity, dark star, fermion, abelian group, stability, instability, control theory, homeostasis, induction brake, accretion and accretion disk tech
- renamed liquid cooling to refrigerant, refrigerant no longer requires clock gating
- defragment junk tech is now 9x stackable
- fixed rainer ai breaking after starting to shoot
- anyon now instantly removes all excess energy
- max health increase techs are now classified as heal techs internally
- added 4 new junk tech:
- - discord moderator: increases max health by 900 but instantly kills you when you're exposed to the sky
- - Die: Die
- - fork bomb: gives you itself twice
- - complete fuck up: shuffles everything tech related, and i do mean everything
- axion can no longer decrease your damage from harm increases
- negative feedback is now more frequent
- ansatz now spawns 3 research instead of 2
- ergodicity now makes heals have half effectiveness instead of doing completely nothing
- fixed gravityObservatory announcing mob types twice
# porting N (2024/10/09)
- ported open source and bot prototypes tech
- ported extra labs boss rooms
- - ported hopMotherBoss
- fixed subway station blocks sometimes getting added to the world several times giving them sun gravity and weird semi-persistance into final
- rainers now have a line of sight check and try to avoid going into ceilings at all costs
- - the latter includes refusing to move if the ceiling above m has no room for them to go into
- - even if they get stuck inside solid collision somehow, they will try to move out of it towards m after they're done spamming projectiles
- gauntlet now always spawns a boss when its not the pre-final level
- descent changes:
- - snakeBoss and beetleBoss no longer spawn on it
- - the slime drains after the bosses are defeated
# porting M (2024/10/07)
- ported gravityObservatory
- - shows up as a modern main map
- ported (most) testChamber2 changes:
- - renamed to gravityInterferometer
- - now can replace reservoir or factory in runs if intermission maps are set to modern or modern only and gimmick maps are enabled
# porting L (2024/10/05)
- ported mechatronics, exciton, band gap, polariton, collider, cascading failure, topological defect and anyon tech
- increased frequency of looting subtechs
- removed isotropic radiator tech
# more blast guntech (2024/10/05)
- blast tech changes:
- - deflagration and acetylene now stack additively with eachother, not multiplicatively
- - deflagration is no longer stackable and instead increases detonation radius by 50% but reduces damage by 30%
- - acetylene range increase nerfed from 18.8% to 8.4%
- - white phosphorus base explosion radius increased from 90 to 150
- added 5 tech:
- - nitrogen-17: makes detonations radioactive
- - counterblast: detonations pull in mobs that are slightly outside of your detonation radius. suggested by garfunkel
- - BLEVE: detonations do significantly more damage but cause harm. suggested by Pcat
- - blast wave: stackable stun chance and duration increase
- - heavy shell: increases blast firing delay but increases damage and stun chance by the same amount
# infinitode (2024/10/04)
- added a new gun: blast: creates a short range damaging, stunning shockwave centered on you
- added 5 tech:
- - quake: after not using blast for 2 seconds, your next detonation has doubled radius and guaranteed stun
- - acetylene: stackable detonation damage and radius increase
- - deflagration: stackable detonation radius increase but detonation damage decrease
- - car bomb: after not using blast for 2 seconds, move faster and take less harm
- - white phosphorus: mobs stunned by blast explode
- decreased rainer detection range
- historyBoss and sneakBoss can no longer spawn on split
- springBoss, mantisBoss and launcherBoss can no longer spawn on descent
- halved tripwireBoss density but doubled its damage reduction
- fixed WKB approximation screen warp amount not being reset alongside the screen warp itself
- healBoss no longer heals while stunned, and also now heals slower
# enemy variety (2024/10/03)
- added 2 new bosses:
- - tripwireBoss: can only see you if you damage it or pass through its lasers
- - springBoss: spawns groups of enemies attached to it with springs that make it invulnerable while they're alive
- added 2 new mobs:
- - drifter: unpredictably floats and moves around you
- - rainer: flies above you and rains down bullets
- stingers are now slightly less common
# porting K (2024/10/02)
- Hilbert space alternate reality tech count now properly resets on death
- fixed typo in Verlet integration description
- ported ternary, pigeonhole principle, marginal utility and Pareto efficiency tech
- renamed exciton to non-renewables and buffed damage increase from 88% -> 100%
- fixed mantisBoss dark pentagons not properly becoming invincible
# mildly deranged realities (2024/10/01)
- added 7 tech:
- - Hilbert space: reduces harm by 6% per alternate reality tech you own
- - antiunitary transformation: permanently increases damage by 4% when entering alternate realities
- - quantum jump: spawns 3 boosts when entering alternate realities
- - qubit: flips on/off when entering alternate realities
- - quantum tunneling: when qubit is ON, skips every 5th second and increases damage by 200% during skipped time
- - eastin-knill theorem: when qubit is ON, bosses drop 1 extra tech. otherwise, replace a random tech with another once per 2 seconds
- - WKB approximation: when qubit is ON, killing mobs distorts the screen. when qubit is set to OFF, resets screen distortion and permanently increases harm reduction by 0.5% for every mob killed while qubit was ON
- fixed Verlet integration graphical issues
- doubled armored configuration harm reduction regeneration rate
- non-unitary operator now decreases difficulty by 2 levels instead of 3
# porting J (2024/09/30)
- ported boost powerups
- brought back and reworked j-gon treasure tech: now significantly boosts boost and research drops rates, but mobs cant drop anything else
- exotic particles powerup drop rate reduction increased from 30% to 40%
- foam now gains 50% more ammo from ammo powerups
- ported nitinol, Verlet integration, aperture, diaphragm, depolarization and repolarization tech
- sneakBoss no longer spawns on descent
- the following tech now change m's appearance:
- - non-unitary operator
- - CPT symmetry
- - mass energy equivalence
- - tungsten carbide
- - Higgs mechanism
- non-unitary operator now decreases difficulty by 3 levels instead of 2
# LaunchSite fix (2024/09/29)
- fixed the LaunchSite elevator and added LaunchSite to modern community level rotation
- fixed smaller elevator on flocculation
- you can no longer shoot with guns while choosing techs/guns/fields with eternalism
# changelog (2024/09/29)
- theres now a changelog
# porting I - 21.5/22 community maps (2024/09/29)
- ported LaunchSite, shipwreck, dojo, flappyGon, rings and trial community maps
- excluded the following maps:
- - LaunchSite: code has been ported but does not show up in level rotation because of bugged elevator
- - unchartedCave: performance issues
- - arena: non-existent functions in matter.js
- - soft: soft-body objects dont despawn properly on level exit, causing buildup and performance issues if level is repeated
- began work on an actual ingame changelog, expect to see it relatively soon
# porting H - 16/22 community maps (2024/09/28)
- ported buttonbutton, downpour, superNgonBros, underpass, cantilever, tlinat and ruins maps
- ace and crimsonTowers have been excluded:
- - ace causes errors in base n-gon
- - crimsonTowers causes major performance issues and will probably cause copyright issues eventually
# porting G - 9/22 community maps (2024/09/27)
- testChamber2 fixes
- ported temple, biohazard, stereoMadness, yingYang, staircase, fortress, commandeer and clock maps
# porting F (2024/09/26)
- ported testChamber2 and dripp
- ported internal ephemera system
# porting E (2024/09/25)
- quenching now increases combat difficulty by 3 levels
- changed 1st ionization energy description
- fixed split not having a random research powerup
- ported snakeBoss
- ported shooterBoss changes
- ported historyBoss's fun graphical effects
# porting D (2024/09/24)
- ported timeSkipBoss, sneakBoss and laserLayerBoss
- mantisBoss's movement is now way more aggressive and it can now spawn in normal gameplay
- healBoss changes:
- - healing now respects reaction inhibitor tech
- - healing speed decreased
- constraintBoss changes:
- - invulnerable until it has attached to you
- - requires line of sight to attach
- - health increased, damage decreased but now scales with difficulty
# porting C (2024/09/23)
- ported snakeSpitBoss rework
- - this also fixes snakeSpitBoss crashing the game on death
# porting B (2024/09/23)
- ported the following enemies:
- - hopMother
- - slasher2
- - slasher3
- - flutter
- - stinger
- - laserLayer
- ported the following bosses:
- - beetleBoss
- - dragonFlyBoss
- ported tetherBoss changes
- snakeBoss has been renamed to snakeBossOld and now only appears in warehouse
# porting A (2024/09/22)
- added split, a new c-gon exclusive map
- added map settings for easy control over which maps you get to experience
- ported lock, towers, flocculation, factory and subway from base n-gon
# looting nerf (2024/09/20)
- looting now doesnt stack and instead slightly increases the drop rates of ammo and heals alongside making research rarely drop from mobs
- removed treasure tech
# armored config nerf (2024/09/19)
- armored configuration no longer increases damage, but is instead capped at 100% reduction, loses more reduction on hit and reduction regenerates slower
# j-gon updates unavailable
