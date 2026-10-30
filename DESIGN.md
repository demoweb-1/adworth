# Design System: AdWorth

## 1. Visual Theme & Atmosphere
Quiet, editorial and tactile, in the spirit of an Apple product page. Generous whitespace, one large idea per screen, and motion that follows the scroll rather than decorating it. The brand's rising arrow is the only recurring motif: it appears as the logo, as the hero object and as the growth line that draws itself through the services. Surfaces are warm stone neutrals with a fine film grain. Glass is used for floating controls only (navigation, dock, captions over media), never for ordinary content.

## 2. Color Palette & Roles
- Warm Bone (#F6F5F3): light page background.
- Soft Charcoal (#0D0D0C): dark page background. Pure black is avoided.
- Ink (#1A1917 light, #F1EFEB dark): headlines and body.
- Stone Grey (#66645F light, #A09D96 dark): secondary text and labels.
- Hairline (#E3E1DC light, #2A2927 dark): dividers and borders.
- AdWorth Rose (#CF1F56 fills, #C2184F text on light, #F0709A text on dark): the single accent, taken from the logo's pink and slightly desaturated. Used for the primary button, status dot, counters and the growth line.
- The logo mark keeps its original pink-to-purple gradient. That gradient appears nowhere else.

## 3. Typography Rules
Geist for everything readable, Geist Mono for small uppercase labels, counters and numbers. Headlines are semi-bold with tight tracking (about -0.045em) and capped at a controlled size so hierarchy comes from weight and colour. Body text stays in stone grey at a comfortable line length.

## 4. Component Stylings
* **Buttons:** Pill-shaped. Primary is solid rose with white text; secondary is glass. Desktop buttons lean slightly toward the cursor, and pressing scales them down.
* **Glass (Liquid Glass):** Translucent fill, strong blur and saturation, a 1px gradient edge highlight and a soft inner highlight. Used on the floating nav, mobile dock, hero controls, work captions and forms.
* **Cards/Containers:** Large 26-30px corners, no heavy shadows. Shadows are tinted to the warm background.
* **Inputs/Forms:** Labels above, hairline borders, 44px minimum height, inline error text below each field.

## 5. Layout Principles
Asymmetric hero with text left and the mark bleeding off the right edge. A pinned scroll story for services. Work is a horizontal snap rail with mixed aspect ratios and staggered offsets rather than an equal grid. On phones everything collapses to one column with a floating glass dock at the bottom, respecting safe areas. Motion respects reduced-motion settings.
