# Interior mockup system

Master interior photographs + programmatic compositing. One small library of scenes
serves the whole catalogue, however large it grows.

```
mockups/scenes/*.jpg     master interiors (committed, never served to the browser)
mockups/scenes.json      geometry, lighting and matching rules per scene
mockups/manifest.json    build cache — what has already been composited
public/mockups/*.jpg     the composited output (this is what the site serves)
```

## Pipeline

```
master interior  ─┐
                  ├─►  match-scenes.py   → picks a scene per artwork, writes src/data/mockups.ts
artwork + size   ─┘
                       composite-mockups.py → renders only what changed → public/mockups/
```

Run after adding an artwork or a scene:

```bash
python3 scripts/match-scenes.py        # assign scenes, regenerate mockup records
python3 scripts/composite-mockups.py   # render (skips anything unchanged)
```

Both are idempotent. Adding one artwork regenerates one image.

## How scale works

Every scene declares a **wall quad**: four points in the photograph marking the corners of a
real rectangle on the wall, plus that rectangle's true size in centimetres. Those eight numbers
define a homography from wall-plane centimetres to image pixels.

An artwork is placed in wall-plane coordinates at its true recorded size, then warped through
that homography. A 180 cm painting therefore covers 180 cm of that wall, foreshortened correctly
if the wall is at an angle. Nothing is expressed as a percentage of the image.

## Calibrating a new scene

1. Drop the photograph in `mockups/scenes/`. Run `python3 scripts/ingest-scenes.py` to
   normalise it to 2400 px and strip EXIF.
2. Find a rectangle on the wall whose real size you can estimate. Best references, in order:
   a standard door (2040 × 820 mm), a light switch (86 mm), floor-to-ceiling (usually 2400 or
   2700 mm), a sofa (a three-seater is close to 2100 mm), a dining chair seat (450 mm high).
3. Record its four corners as `wall.quad` in `scenes.json`, in the order top-left, top-right,
   bottom-right, bottom-left, with `wall.widthCm` and `wall.heightCm`.
4. Set `hang` — where the centre of a painting should sit, in centimetres from the quad's
   top-left, measured along the wall. Gallery convention puts the centre 145–150 cm above the
   floor.
5. Set `usable` — the largest artwork the wall can take without crowding architecture or
   furniture.
6. Set `light.from` to the side the room's light comes from; shadows are cast the other way.
7. Run `python3 scripts/composite-mockups.py --scene <id> --check` to render a calibration
   overlay showing the quad, the hang point and a 100 cm ruler on the wall. Adjust until the
   ruler looks right against the furniture.

## Scene fields

| Field | Meaning |
|---|---|
| `id` | Slug used in mockup URLs |
| `name` | Human label, e.g. "Coastal living room" |
| `room` | Category shown on the site |
| `file` | Filename inside `mockups/scenes/` |
| `wall.quad` | Four `[x, y]` image points of a known rectangle on the wall |
| `wall.widthCm` / `wall.heightCm` | That rectangle's real size |
| `hang.xCm` / `hang.yCm` | Centre of the hung artwork, in wall coordinates from the quad's top-left |
| `usable.maxWidthCm` / `maxHeightCm` | Largest artwork this wall takes gracefully |
| `usable.minWidthCm` | Below this the work looks lost — the matcher avoids it |
| `light.from` | `left` or `right` — drives shadow direction |
| `light.strength` | Cast shadow opacity, 0–1 |
| `light.softness` | Shadow blur radius in wall centimetres |
| `match.orientations` | Which artwork shapes suit this wall |
| `match.palettes` | `warm`, `cool`, `neutral`, `vivid` — the room's affinity |
| `match.styles` | Artwork categories that suit the room |
| `credit` | Photographer, source and licence — required by Unsplash |

## Licence

Scene photographs are Unsplash-licensed: free for commercial use, no permission needed,
attribution appreciated and displayed on each mockup page. Credit lives in `scenes.json`
and flows into `src/data/mockups.ts` automatically.
