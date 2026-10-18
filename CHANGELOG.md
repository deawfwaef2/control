# Changelog

## M11 — Grand 3D On-Board Theater, 18 Dynamic Mecha-Girls, 15 Sub-Stages & Procedural Story Variations (2026-10-18)

- **Expanded Roster to 18 2D Anime Mecha-Girls**: Added 6 brand-new mecha-girls (`astra` 星枢, `kuro` 玄羽, `celia` 圣歌, `nyx` 绯夜, `echo` 回音, `sola` 阳炎) with 6 new distinct chess-variant movements (`lancer`, `phantom`, `paladin`, `valkyrie`, `quantum`, `striker`), bringing the full roster to 18 characters (`42` embedded WebP art assets).
- **Darkened Infected Silhouette + High-Glow Chest-Center Spider**: Updated `neon_art.py` and live shaders so controlled/infected characters are markedly darkened while the chest-center mechanical spider device and glowing red eyes radiate intense crimson light (`36/36` eye emission checks pass).
- **60FPS Live2D-Style Dynamic Character Engine (`LiveRig`)**: Added real-time 60FPS 2.5D skeletal mesh breathing, head/hair sway, blinking, and animated chest-spider leg twitching & core pulsing across Cinema, Dossier, Archive, and Board Tokens.
- **On-Board 3D Theater & Large Main-Story Typography**: Overhauled `#cinema` so story cutscenes play directly over the live 3D tactical board and 3D orbital space panorama with camera tilt/focus spotlights, on-board 3D VFX (`laser-sweep`, `spider-pulse`, `railgun-strike`, `holo-scan`), and enlarged high-contrast movie subtitles (`clamp(22px, 2.15vw, 30px)`).
- **3D Sci-Fi Tactical Board Terrain**: Replaced flat cells with sculpted 3D armored deck plating, 3D extruded blast walls, deep-space chasms, holographic relay beacons, airlock extraction pads, and pulsing plasma hazard grates across 6 sector themes.
- **15 Playable Sub-Stages & 3 Branching Routes + Procedural Story Director**: Added `SUB_OPERATIONS` (`OP 1-1` through `OP 5-2`), an interactive Star-Map modal (`#starmap-btn`), rich persona dossiers (`PERSONA`), and randomized run-to-run story variations (`#random-story-btn`).

## M10 — Upper-Chest Device Calibration & 3D Board Token Framing (2026-10-18)

- Calibrated upper-chest `device_quad` placement and 3D wargame token framing across all 12 initial portraits.

## M9 — 2D Anime Mecha-Girl Overhaul & Sci-Fi Spider Virus Storyline (2026-10-18)

- Generated 12 2D Japanese anime mecha-girl portraits and rewrote the campaign around the Aegis Line vs. Crimson Hive spider virus conflict.
