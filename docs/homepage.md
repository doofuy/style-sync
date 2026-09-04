# StyleSync — Homepage PRD (Editorial / Sézane-Inspired Theme)

**Doc owner:** Roger
**Product:** StyleSync (Next.js 15 + React + Tailwind v4 + ShadCN)
**Scope:** New public/landing homepage (`/`) — hero, category entry point, core feature showcase, footer.
**Depends on:** `stylesync_redesign_prd.md` — this doc inherits the color tokens (§3), typography (§4), shape language (§5), and the `CategoryGrid.tsx` component (§8) defined there rather than redefining them.
**Reference site:** sezane.com (live homepage reviewed)

---

## 1. Why a homepage

StyleSync currently sends users straight into the app shell (`/wardrobe`) — there's no public-facing page that explains the product, sets the editorial tone established in the main redesign, or gives a first-time visitor a reason to sign up. Sézane's homepage does three things well: it opens with a full-bleed mood shot, gets people into the catalog fast via the category strip, then spends the rest of the scroll on brand storytelling. StyleSync's homepage should follow the same rhythm but center on the product's actual differentiator — AI-assisted outfit styling — rather than a product catalog, since StyleSync isn't selling clothes.

This is a **new page**, not a restyle of an existing one. It reuses components/tokens from the main redesign wherever possible (`CategoryGrid`, ink/ivory palette, serif type system) instead of introducing new visual language.

---

## 2. Reference Analysis — homepage-specific patterns from Sézane

| Element | Sézane pattern | StyleSync adaptation |
|---|---|---|
| **Hero** | Full-bleed autoplay video, single serif headline, one text-link CTA ("Discover") | Full-bleed hero (image or short video) of a styled outfit; ink wordmark lockup; one primary CTA into the product |
| **Category strip** | Edge-to-edge tile grid directly under hero, no heading, just goes straight into browsing | Reuse `CategoryGrid.tsx` as-is (§8 of main PRD) directly under the hero — no new grid component needed |
| **Editorial banners** | Full-bleed single-image sections, minimal copy, one CTA each ("FALL 2026 CAMPAIGN," "LOOKBOOK," "ACCESSORIES") | One banner repurposed to showcase the AI outfit feature instead of a product campaign — this is the section that doesn't exist on Sézane because they don't have an equivalent feature |
| **Brand story banner** | Full-bleed video/image, one line of copy, "Découvrir" link | Adapted to a "How it works" moment — StyleSync needs to explain a workflow, Sézane doesn't |
| **Footer** | Centered wordmark, 4-column link groups, newsletter capture, social icons | Same structural pattern, restyled to ink/ivory tokens from §3 of main PRD; newsletter copy changes to product updates instead of "Collections" |

**Key takeaway:** borrow the *rhythm* (hero → browse → feature/story beats → footer) and the *restraint* (large images, minimal copy, no boxed UI chrome) from Sézane, but the middle content beats are StyleSync's own — there's no product catalog to showcase, there's a workflow to explain.

---

## 3. Page Structure (top to bottom)

| # | Section | Purpose | Height/treatment |
|---|---|---|---|
| 1 | Hero | First impression, brand tone, primary CTA | Full-bleed, ~90vh |
| 2 | Category strip | Fast entry into the app via `CategoryGrid` | Edge-to-edge, height driven by grid content |
| 3 | "Today's Outfit" showcase | Demonstrate the core AI feature visually | Full-bleed editorial banner, ~80vh |
| 4 | How it works | Explain the 3-step workflow | Contained width, generous vertical padding |
| 5 | Editorial/mood banner | Pure brand feel, low copy | Full-bleed, ~70vh |
| 6 | Footer | Newsletter, links, social | Full width, standard footer height |

No sidebar, no sticky secondary nav — single-column scroll, same as Sézane.

---

## 4. Section Specs

### 4.1 Hero
- Full-bleed background: image or short looping video (muted, autoplay, no controls) of a styled outfit/flat-lay — sourced from existing wardrobe photography style, not stock.
- Wordmark lockup centered or left-aligned over the image: `Italiana`, wide tracking, ink or off-white depending on image contrast (match Sézane's white-on-video treatment).
- Headline: one line, `Cormorant Garamond`, normal weight, e.g. "Your Wardrobe, Styled Daily" (copy TBD with Roger).
- CTA: single text-link style button (not a filled pill) — "Get Started" or "Style My Wardrobe" — routes to sign-up/`/wardrobe`, `bg-primary` if a filled treatment is preferred, but default to Sézane's understated text-link + underline pattern.
- No nav overlay change needed — reuses the restyled `Navbar` from the main PRD, sitting transparent/flat over the hero image.

### 4.2 Category Strip
- Direct reuse of `CategoryGrid.tsx` from §8 of the main redesign PRD — no new component.
- No section heading above it (Sézane goes straight from hero into the grid); if a label is wanted, use the same uppercase micro-label convention ("EXPLORE BY CATEGORY") kept small and left-aligned, not a big `h2`.
- Same categories/images as the Wardrobe page instance — single source of truth, not a duplicated data set.

### 4.3 "Today's Outfit" Showcase
- Full-bleed single image or screenshot-style visual of the Outfit Recommendation panel in use (real product UI, not a stock photo — this section's whole point is proving the feature is real).
- Headline + one line of supporting copy, `Cormorant Garamond`.
- CTA uses the `accent` terracotta token (per main PRD §3/§7.7 rule: accent = AI-powered actions only) — this is the one place on the homepage terracotta appears, keeping it a deliberate signal rather than decoration.

### 4.4 How It Works
- Three-step horizontal strip (stacks vertically on mobile): **Upload your wardrobe → Get daily outfit picks → Save your favorites.**
- Each step: number or small icon, uppercase micro-label title (matches nav/tile-label typography), one short supporting line.
- Contained width (`max-w-6xl`), unlike the full-bleed sections around it — this is the one "explain, don't just show" moment on the page, so it gets normal padding and breathing room instead of edge-to-edge treatment.

### 4.5 Editorial/Mood Banner
- Single full-bleed image, minimal copy (one line max) — pure tone-setting, same as Sézane's "OUR STORY" banner.
- Optional CTA link ("Learn more" → About/story content, if StyleSync has or plans an About page — otherwise omit the CTA entirely and let the image carry the section).

### 4.6 Footer
- Structural port of Sézane's footer: centered wordmark, 4-column link groups (Product, Help, About, Legal — naming TBD), newsletter email capture, social icons.
- Newsletter copy: product updates/styling tips angle instead of "Collections."
- All values pull from the ink/ivory tokens in §3 of the main PRD — no new colors introduced.

---

## 5. Typography & Color

No new tokens. This page consumes exactly what's defined in the main redesign PRD:
- Wordmark: `Italiana` (§4)
- Headlines: `Cormorant Garamond` (§4)
- Micro-labels/nav: uppercase sans, wide tracking (§4)
- Palette: ivory canvas, ink primary, single terracotta accent reserved for the AI showcase CTA only (§3)

---

## 6. Animation & Interaction

Inherits §9 of the main PRD:
- Image hover zooms (`scale-105`, `duration-300`) on any interactive tile (category grid tiles).
- Section fade-up on scroll-into-view — treated as expected here (not just nice-to-have) since a long single-column marketing scroll is exactly where this pattern earns its keep.
- Hero video/image: no zoom or parallax — stays static like Sézane's hero, motion lives in the video content itself if a video is used.

---

## 7. Implementation Notes — Files to Touch

| File | Changes |
|---|---|
| New: `app/page.tsx` (or equivalent homepage route) | Build new homepage per §3–4, composing sections below |
| New: `HomeHero.tsx` | Section 4.1 |
| Reuse: `CategoryGrid.tsx` | Section 4.2 — same component/data source as Wardrobe page instance |
| New: `OutfitShowcase.tsx` | Section 4.3 |
| New: `HowItWorks.tsx` | Section 4.4 |
| New: `EditorialBanner.tsx` | Section 4.5 — reusable, could also power future campaign-style sections |
| New: `HomeFooter.tsx` (or extend shared `Footer.tsx` if one exists) | Section 4.6 |
| `Navbar` component | Confirm transparent/overlay variant works when homepage hero sits behind it (no separate navbar needed, but verify contrast logic against hero image) |

---

## 8. Out of Scope

- No changes to sign-up/auth flow itself — CTAs route to existing flows.
- No CMS/dynamic content management for homepage copy in v1 — content is hardcoded, editable in code.
- No A/B testing or analytics instrumentation for this page in v1.
- Dark mode: deferred, same as main PRD §11.

## 9. Open Questions for Roger

1. Hero: static image or looping video? (Sézane uses video — worth confirming StyleSync has/can produce suitable footage, otherwise a strong static image is a fine fallback.)
2. Exact copy for hero headline, CTA labels, and "How it works" step descriptions — placeholders above, needs final wording.
3. Does an About/story page exist or is planned, to justify the CTA in §4.5? If not, that section ships image-only with no link.