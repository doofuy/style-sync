# StyleSync PRD

<!-- Paste your PRD markdown content here -->
# StyleSync — Redesign PRD (Editorial / Sézane-Inspired Theme)

**Doc owner:** Roger
**Product:** StyleSync (Next.js 15 + React + Tailwind v4 + ShadCN)
**Scope:** Global color theme, typography, navbar, and the `/wardrobe` page — plus a new reusable "Category Grid" pattern for adding clothing categories.
**Reference site:** sezane.com (screenshots + live site reviewed)

---

## 1. Why this redesign

StyleSync currently uses a ChatGPT-inspired dark theme (near-black background, violet accents, rounded ShadCN defaults). This reads as a "dev tool," not a fashion product. The goal is to move StyleSync toward an **editorial, boutique fashion-catalog feel** — closer to how Sézane presents collections: warm neutral backgrounds, serif wordmark, restrained uppercase navigation, and dense image grids with **zero gutters** between photos so the imagery itself does the talking.

This PRD does **not** change app functionality (drag-drop, AI upload, outfit recommender all stay). It changes the visual system and introduces one new layout pattern (edge-to-edge category grid).

---

## 2. Reference Analysis — what we're borrowing from Sézane

From the two supplied screenshots (homepage grid + footer):

| Element | Sézane pattern | Why it works |
|---|---|---|
| **Background** | Warm ivory/cream (`~#F5F1E8`), not pure white | Feels warm, boutique, paper-like — not clinical |
| **Wordmark/Logo** | Tall, wide-tracked serif caps ("SÉZANE") | Signals fashion/editorial, not SaaS |
| **Nav links** | Small-caps or uppercase sans, generous letter-spacing, no pills/buttons, just text | Quiet, confident navigation — content leads |
| **Nav bar chrome** | Flat, no border/shadow, icons (search/account/bag) minimal and right-aligned | Keeps focus on hero grid |
| **Category grid** | Full-bleed photo tiles in a strict row, **touching with no gutter**, each tile labeled with a single centered uppercase word overlaid on the image ("NEW IN," "KNITWEAR," "SHOES") | This is the core pattern to copy for StyleSync's category rows |
| **Image treatment** | Consistent aspect ratio per row, muted/desaturated color grading across photos so the grid feels curated as one set | Prevents a "mismatched stock photo" look |
| **Footer** | Centered wordmark, 4-column link groups, uppercase small headers, generous whitespace, serif accents on section titles | Calm, editorial close to the page |
| **Color accents** | Neutral earth tones (olive, burgundy, tan, black) appear *in the product photography*, not as UI paint — the UI itself stays near-monochrome | UI should recede; let clothing provide color |

**Key takeaway for StyleSync:** the wardrobe page should stop looking like a SaaS dashboard (cards, badges, violet buttons everywhere) and start looking like a personal lookbook — warm neutral canvas, serif display type for headings, quiet uppercase micro-labels, and edge-to-edge imagery wherever multiple items of the same type are shown together.

---

## 3. New Color Theme

We keep CSS variable architecture (`globals.css`, oklch tokens) so ShadCN components don't need rewiring — only values change. Violet is retired as the primary UI accent; it's replaced with a near-black "ink" primary plus a warm neutral canvas. A single muted terracotta accent replaces violet for the few moments that need emphasis (selected state, primary CTA, AI features).

### Light mode (this iteration's only target)

| Token | Value | Notes |
|---|---|---|
| `--background` | `oklch(0.97 0.01 85)` | Warm ivory `#F6F2EA`-equivalent |
| `--foreground` | `oklch(0.18 0 0)` | Near-black ink, not pure `#000` |
| `--card` | `oklch(0.99 0.005 85)` | Slightly lighter than background, subtle lift |
| `--muted` | `oklch(0.93 0.01 85)` | Sand — for empty states, dashed zones |
| `--muted-foreground` | `oklch(0.45 0 0)` | Warm grey for secondary text |
| `--border` | `oklch(0.85 0.01 85)` | Hairline, barely-there |
| `--primary` | `oklch(0.22 0 0)` | Ink black — main buttons, nav active state |
| `--primary-foreground` | `oklch(0.98 0 0)` | Off-white text on primary |
| `--accent` (new) | `oklch(0.55 0.09 45)` | Muted terracotta/clay — replaces violet for selection rings, AI badges, wand icon |
| `--destructive` | `oklch(0.55 0.18 25)` | Unchanged red family, slightly desaturated to match palette |
| `--radius` | reduce scale (see §5) | Sharper, less "app-like" corners |

**Dark mode:** out of scope for this pass. The existing dark theme tokens stay untouched in the codebase for now (theme toggle keeps working), and get revisited in a future iteration once the light theme has shipped.

**Rule going forward:** violet (`violet-600` and any `bg-violet-*` / `border-violet-*` / `ring-violet-*` Tailwind utility) is removed from the codebase and replaced with the `accent` token (`bg-accent`, `ring-accent`, etc.), or `primary` for anything that was violet purely for "brand" reasons (logo wordmark, primary CTAs).

---

## 4. Typography

Sézane's wordmark and headings use a bespoke/licensed condensed serif — not something we can pull 1:1 off Google Fonts. The closest freely-available match to that tall, elegant, fashion-house caps lettering is **`Italiana`** (Google Font), which is designed specifically for this kind of editorial/fashion branding and reads almost identically for logo-scale, all-caps use. Since `Italiana` is a caps-only display face (not built for long lowercase paragraphs or large headline blocks), it's paired with **`Cormorant Garamond`** for any serif moment that needs mixed-case/body-length text (e.g. a longer `h1` or editorial blurb) — same family of feel, more legible at length. StyleSync's body/UI font (Inter) is fine and stays — only the **display/heading layer** and **nav treatment** change.

| Use | Current | New |
|---|---|---|
| Wordmark ("StyleSync") | Sans, two-tone (foreground + violet) | `Italiana`, wide letter-spacing, single ink color, all-caps: **STYLESYNC** — directly mirrors the SÉZANE wordmark treatment |
| Page titles (`h1`, e.g. "My Wardrobe") | Sans, bold, default tracking | `Cormorant Garamond`, `font-normal` (not bold — serif carries the weight), larger size (e.g. `text-4xl`/`text-5xl`), normal case |
| Section headers (collection names, "AI Upload," "Outfit Recommendation") | Sans bold | Sans, **uppercase, letter-spacing wide, smaller size**, acting like Sézane's tile labels ("NEW IN," "KNITWEAR") — this is the connective visual thread across the redesign |
| Nav links | Sans, default case, medium weight | Sans, **uppercase**, `text-xs`–`text-sm`, `tracking-widest`, regular weight, generous horizontal spacing |
| Body/labels/buttons | Inter | Inter, unchanged |

Load both serif fonts via `next/font/google` alongside Inter, expose them as `--font-display` (`Italiana`, logo/wordmark only) and `--font-serif` (`Cormorant Garamond`, headings/editorial text) CSS variables so they're available to both Tailwind utilities and ShadCN components.

---

## 5. Global Layout & Shape Language

- **Radius:** reduce all radius tokens by roughly one step (e.g. current `xl`→ becomes new `lg`, etc.) — Sézane's UI has almost no rounded corners except pill-shaped tags. Wardrobe cards go from heavily rounded to a subtle `rounded-sm`/`rounded-md`.
- **Shadows:** replace soft colorful glow shadows (the violet glow on selected `WardrobeCard`) with **flat borders / ring only**, no blur-heavy drop shadows. Editorial UI is flat, not skeuomorphic.
- **Container width:** keep `max-w-6xl`, but reduce inner padding on the collection rows so images can span closer to true edge-to-edge within their row (see §7).
- **Grid gaps:** this is the headline change — any place StyleSync shows a **set of same-type images side by side** (a collection row's items, or a new category tile row) uses `gap-0` with a shared thin divider border between tiles instead of gutter spacing, mirroring the Sézane homepage grid.

---

## 6. Navbar (Global) — Redesign Spec

**Current:** blurred sticky bar, two-tone logo, plain nav links, Clerk button + theme toggle on the right.

**New:**
- Background: solid `bg-background` (drop the blur/opacity trick — Sézane's bar is flat, not glassy), hairline `border-b border-border` only, no shadow.
- Logo: `STYLESYNC` in `font-display` (`Italiana`), uppercase, `tracking-[0.15em]`, single ink color (no split coloring).
- Nav links (`Home / Upload / Explore / Wardrobe`): uppercase, `text-xs tracking-widest`, spaced with `gap-8`–`gap-10` instead of tight spacing; active link gets an underline (`accent` color, 1–2px) rather than a background pill.
- Right side: keep Clerk `UserButton` and the theme toggle, but reduce their visual weight (smaller icon buttons, no border box around them) so they don't compete with the wordmark.
- Height: increase slightly (e.g. `h-20` vs current) — Sézane's bar has generous vertical breathing room.

---

## 7. Wardrobe Page — Section-by-Section Spec

### 7.1 Page Header
- `h1` "My Wardrobe" → serif display, large, normal weight, normal case (not forced caps — this is the one big serif moment on the page, like Sézane's "OUR STORY").
- `+ Create Collection` button: replace violet-outline button with **ink-outline button** (`border-primary text-primary`, fills `bg-primary text-primary-foreground` on hover). Button label goes uppercase, `tracking-wide`, small text — matches the new micro-label language used everywhere else.

### 7.2 Current Outfit Panel
- Same flush, gap-0 treatment as the collection rows (§7.3) — the selected-outfit strip is itself a small "grid of images," so it follows the same no-gutter rule for visual consistency across the page: `flex gap-0`, thin `border-r border-border` between preview cards instead of individually spaced/shadowed cards.
- Drop the drop-shadow-on-hover glow; use a simple `scale-[1.02]` (clipped, image-only) + border-color shift on hover.
- Collection-name badge: switch from a dark pill to a small uppercase text label with no background, positioned top-left with a subtle text-shadow or a thin gradient scrim behind it for legibility over photos (Sézane overlays labels directly on image with a soft dark gradient at the bottom/edge, not a pill).
- Empty state text: "No items selected yet" — set in `muted-foreground`, small caps.

### 7.3 Collection Rows — *primary change, this is the Sézane pattern*
This is where the "no gap between images" instruction applies directly.

- **Row header:** collection name becomes an uppercase micro-label (`text-sm tracking-widest font-medium`), sitting directly above its image row — exactly like "KNITWEAR" / "SHOES" sit above/on Sézane's tiles. `+ Add Item` and `Delete` shrink to plain text-links (no button chrome), right-aligned, uppercase, small.
- **Items gallery:** change from individually-rounded, individually-shadowed cards with gaps to a **flush row**: `flex gap-0`, each `WardrobeCard` gets a `border-r border-border` (last child: none) instead of its own shadow box, so the row reads as one continuous strip of images, like the Sézane hero grid. Image itself keeps `object-cover`, aspect ratio standardized per row (e.g. all `aspect-[3/4]`) so the strip looks intentional even with different source photos.
- **Selection state:** the violet border/ring/glow is replaced by: a thin **2px `accent`-colored bottom border** appearing under the selected item + a small uppercase "Selected" label fading in on the image bottom-edge (scrim + text), no scale/glow.
- **Hover overlay ("Edit Image"):** keep the camera-icon hover interaction, restyle icon/text to ink/white depending on mode, drop the tinted overlay color to a neutral black/40 scrim (currently likely uses violet-tinted overlay).
- **Empty collection placeholder:** dashed border in `border-muted-foreground/40`, no violet accent, small uppercase "Add your first item" label.

### 7.4 Add Item Modal / 7.5 Edit Image Modal
- Modal chrome: swap rounded-2xl/heavy shadow for a flatter modal (`rounded-md`, `shadow-md` only, `border border-border`).
- `Take Photo` button: from violet-filled to **ink-filled** (`bg-primary`) — reserve the terracotta `accent` color specifically for AI-related actions (see 7.8/7.9) so it reads as "the smart feature color," not a generic brand color.
- Inputs: current ShadCN input styling stays, just inherits new border/background tokens automatically via the CSS variable swap.

### 7.6 Delete Collection Confirmation Modal
- No visual change beyond token inheritance (red destructive stays, now slightly desaturated per §3).

### 7.7 AI Upload Section
- Card background: `bg-card` (now warm off-white, not dark grey).
- Title icon/text: 🤖 + "AI Upload" — recolor icon accent to the new `accent` terracotta (this section is one of two places accent color is allowed to appear prominently, signaling "AI-powered").
- Dashed drop-zone: neutral `border-muted-foreground/40`, hover state switches border to `accent` (not violet).
- `Upload & Organize` button: full-width, `bg-accent text-accent-foreground` — this is intentionally the one saturated button color on the page, so AI actions feel distinct from standard ink CTAs.

### 7.8 Outfit Recommendation Section
- Same card/background treatment as 7.7.
- Occasion dropdown: restyle trigger to flat bordered button (no rounded-pill), icon + label, uppercase label text for the occasion names to match the micro-label language.
- `Recommend Outfit` button: `bg-accent`, matching the AI Upload button — reinforces "accent = AI feature" association.
- Result grid (Topwear/Bottomwear/Footwear): change from 3 separate padded ShadCN Cards with gaps to a **flush 3-column strip** (`gap-0`, dividing borders between columns) — same "no gap" language as the collection rows, so the recommended outfit reads like a mini Sézane-style grid. Each column keeps its image, item name, and article-type badge, but the badge becomes a small uppercase label instead of a colored pill.
- Empty slot state: dashed neutral placeholder, "No [slot] found" in muted small caps.

### 7.9 Camera Modal
- Overlay: keep full-screen dark scrim.
- Shutter button: from violet-filled to **ink-filled** circular button with a thin `accent`-colored ring (keeps a touch of brand color without repainting the whole modal).
- Flip-camera icon button: neutral white/ink, no color change needed.

### 7.10 Toast Notifications
- Restyle from default ShadCN dark toast to match new palette: `bg-card`, `border-border`, `text-foreground`; success state uses the `accent` terracotta instead of green, error keeps the desaturated red, matching the rest of the palette instead of introducing new hues.

---

## 8. New Pattern: Edge-to-Edge Category Grid

Since Roger has already selected images for categories, this is a **new reusable component** (not in the original 11 sections) modeled directly on the Sézane homepage tile grid, for use anywhere StyleSync wants to present categories as an entry point (e.g. an "Explore by Category" block, or a future landing/dashboard section).

**Spec:**
- Layout: **CSS grid, not a fixed-count row** — the grid is designed to grow as categories/images are added over time, the same way Sézane's own grid isn't a fixed 5 tiles but keeps extending (their live homepage currently runs 11 tiles: New In, Leather Goods, Knitwear, Shoes, Tops, Pants, Scarves & Shawls, Skirts & Shorts, Jewelry, Jackets, plus campaign tiles). Use `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` (or a fixed N-per-row count at each breakpoint, e.g. 5-up desktop / 3-up tablet / 2-up mobile) with **`gap: 0`** throughout — tiles always touch edge-to-edge no matter how many rows accumulate.
- Each tile: fixed aspect ratio (match Sézane's ~`4:5`), `object-fit: cover` background image, category name centered vertically and horizontally on the image in uppercase serif-adjacent or wide-tracked sans, white or ink text depending on image contrast, with a subtle dark gradient scrim (`linear-gradient(to bottom, transparent 60%, rgba(0,0,0,.35))`) behind the label for legibility — no boxed pill background.
- Hover: subtle zoom on the image only (`scale-105` on the `<img>`, clipped by `overflow-hidden` on the tile), label stays static — matches Sézane's restrained hover behavior.
- Responsive: column count steps down at each breakpoint (desktop → tablet → mobile), still `gap-0`; row count is unbounded — the grid simply wraps to a new row as more categories exist, no pagination or "view more" needed for v1.
- New category creation flow: when a user adds a new wardrobe collection/category, they're prompted to also assign/confirm a representative image for this tile (already covered by "Add Item" image upload flow) — the same image used as the first/cover item photo auto-populates this tile, with manual override. The grid re-renders immediately with the new tile appended, so it visibly "fills in" as the wardrobe grows — this ongoing growth is the intended behavior, not an edge case to guard against.

This component is separate from the existing `CollectionRow` (which stays a horizontal scroll gallery of individual items). The Category Grid is a higher-level, browse/entry-point pattern that scales with the number of categories in the wardrobe.

---

## 9. Animation & Interaction Notes

- Replace all glow/blur-heavy shadow transitions with **border-color and underline transitions** (150–200ms ease) — consistent with a flatter, editorial feel.
- Image hover zooms: `scale-105`, `duration-300`, applied to the image element with `overflow-hidden` on its container (never scale the whole card + its border/shadow together).
- Selection state changes (wardrobe item selected, occasion selected) animate via a thin bottom-border draw-in or fade-in label, not scale+glow.
- Keep existing spinner components for AI Upload / Recommend Outfit loading states, recolor spinner stroke to `accent`.
- Page/section headers can fade-up slightly on scroll-into-view (subtle, optional — matches editorial sites' restrained scroll reveals) — treat as a nice-to-have, not required for v1.

---

## 10. Implementation Notes — Files to Touch

| File | Changes |
|---|---|
| `globals.css` | Replace all color tokens per §3; add `--font-display` variable; reduce radius scale per §5; remove violet utility usage |
| `layout.tsx` (or wherever fonts are loaded) | Add serif display font via `next/font/google`, expose as CSS variable alongside Inter |
| `Navbar` component | Flatten background (remove blur), restyle logo to serif/uppercase, restyle nav links per §6, reduce visual weight of right-side controls |
| `wardrobeClient.tsx` | Update page header (`h1` → serif), `+ Create Collection` button restyle |
| `currentOutfit.tsx` | Update preview card styling (labels, hover, empty state) per §7.2 |
| `collectionRow.tsx` | Core layout change: switch item gallery from gapped cards to flush/gap-0 strip with dividing borders; restyle row header to micro-label + text-link actions per §7.3 |
| `WardrobeCard.tsx` | Remove rounded corners/glow shadow; add `border-r` divider logic; restyle selection state (bottom border + label) and hover overlay scrim per §7.3 |
| Add Item / Edit Image / Delete Collection modal components | Flatten modal chrome, swap CTA colors from violet to ink/accent per §7.4–§7.6 |
| AI Upload section component | Recolor to `accent`, restyle drop-zone border states per §7.7 |
| Outfit Recommendation section component | Recolor CTA to `accent`, convert result grid to flush 3-column strip per §7.8 |
| Camera Modal component | Restyle shutter button (ink fill + accent ring) per §7.9 |
| Toast provider/config | Update toast theme tokens per §7.10 |
| New: `CategoryGrid.tsx` | Build new component per §8; integrate into `wardrobeClient.tsx` as a new "Explore by Category" section (confirmed placement — Wardrobe page, not Explore/landing) |

---

## 11. Out of Scope

- No changes to backend logic, ML classification, MongoDB schema, or Cloudinary upload flow.
- No changes to Clerk auth flow.
- Mobile camera capture behavior unchanged (styling only).
- **Dark mode:** deferred entirely for this iteration. Current dark theme tokens and the theme toggle stay functional as-is; the ivory/light redesign in this PRD does not touch them. Revisit in a future pass.

## 12. Resolved Decisions

1. **CategoryGrid placement:** confirmed — lives on the **Wardrobe page**, as a new "Explore by Category" section. Not the Explore page, not a separate landing page.
2. **Font pairing:** confirmed — `Italiana` (wordmark) + `Cormorant Garamond` (headings) locked in as final, no further type test needed.
3. **Dark mode:** confirmed skipped for this iteration (already reflected in §11).
4. **Current Outfit panel:** confirmed gap-0, same flush treatment as collection rows (already reflected in §7.2).