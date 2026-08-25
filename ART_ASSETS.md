# DRY — modular pixel-art assets

The playable world is split into independent layers so visual changes do not
reintroduce fragile collision boxes.

- `public/world/terrain/world-base.png`: continuous 5920×1024 terrain layer.
- `public/world/structures/*.png`: ten independent transparent landmarks.
- `public/world/scenery/*.png`: independent tree, purple tree, shrub, flowers,
  rocks, fence, sign and lamp assets.
- `public/dry-spritesheet-v2.png`: Dry's movement sprite sheet.

The player is restricted only to the straight road band. Landmarks and scenery
sit outside that band and therefore do not need gameplay collision rectangles.

## Final terrain prompt

> Create one original, crisp top-down pixel-art terrain module with a calm green
> meadow and a single perfectly straight horizontal warm dirt road. Use an
> authentic hand-placed 16-bit look, visible square pixel clusters, a limited
> mature natural palette and restrained grass/dirt detail. Make the left and
> right edges repeat cleanly. Terrain only: no buildings, trees, characters,
> text, UI, perspective, branches, blur, painterly texture or copied assets.

## Final scenery prompt

> Create a coherent 4×2 sprite atlas containing exactly eight separated,
> original top-down 16-bit pixel-art objects: leafy tree, indigo-violet tree,
> rounded shrub, flower patch, rock cluster, wooden fence, blank wooden sign and
> short fantasy-tech lamp. Use one consistent pixel density, daylight direction
> and restrained cozy fantasy-tech palette. Place the objects on a perfectly
> flat chroma background with wide gutters; no overlap, text, people, animals,
> cast shadows, blur, painterly rendering, copied assets or watermark.

The generated sources were cleaned, separated and exported as transparent PNGs
before integration.
