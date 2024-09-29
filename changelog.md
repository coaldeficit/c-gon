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