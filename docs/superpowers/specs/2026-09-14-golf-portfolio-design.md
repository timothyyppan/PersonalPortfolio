# Golf-Themed Personal Portfolio — Design

_Revised 2026-09-14 after an architecture re-audit. Changes from the first draft are listed at the bottom._

## Purpose

Personal portfolio for Timothy Pan (Computer Engineering, University of Waterloo). It highlights who he is, his work experience, and his personal projects — with deep-dive write-ups rather than one-line summaries. The visual identity is built on a golf scorecard. Content is added and edited through a local admin interface, not by hand-editing files.

## Visual identity

The scorecard is the site's spine. It is not decoration — it is the index of the site, and every column on it renders real data from the content files. Boldness is concentrated there; everything around it stays quiet.

**Palette**

| Token | Hex | Role |
|---|---|---|
| `card` | `#EFE9D8` | Page background — scorecard stock, cooler and greener than generic cream |
| `cardRaised` | `#F3EEDF` | The card surface itself, slightly lifted off the page |
| `rule` | `#C3BA9C` | Printed rule lines and borders |
| `ink` | `#14301E` | Primary text — dark green printing ink, not black |
| `inkSoft` | `#55604F` | Secondary text, column headers |
| `flag` | `#B8973F` | Gold accent — the nameplate rule, focus rings. Used sparingly |
| `mark` | `#A8443A` | Scorecard red — only the "complete" circle mark |

**Typography**

- **Fraunces** (variable serif) — display and body prose. Loaded via `next/font/google`.
- **IBM Plex Mono** — scorecard data, numerals, column headers.

Two families, clearly distinct in role. Body prose sits under 80 characters per line with generous line-height for a serif.

**Deliberate exclusions.** These are documented so they don't creep back in:

- No tracked-out all-caps eyebrow labels above headings. All-caps appears *only* in the scorecard's column header row, where it is authentic to a printed scorecard.
- No `A · B · C` middot meta strings. Tags render as discrete elements.
- No single-word color accents inside headlines.
- Numbered markers appear only on holes, which are a genuine sequence. Nowhere else.
- No fade-and-slide-up entrance animations. Motion only answers user actions, and respects `prefers-reduced-motion`.

## Content architecture

Two collections share one pipeline. A collection is defined by a key, a label, and its own list of write-up sections.

| Collection | Directory | Sections |
|---|---|---|
| `projects` | `content/projects/<slug>/index.mdx` | Overview, Design, Plan, What I Learned, Troubles / Debugging |
| `experience` | `content/experience/<slug>/index.mdx` | Overview, What I Built, What I Learned, Highlights |

Experience gets its own section list because "Design / Plan / Troubles" doesn't describe a job. Everything else — the loader, the MDX parsing, the admin UI, the detail page template — is shared and collection-agnostic.

**Entry frontmatter**: `title`, `tags[]`, `startDate`, `endDate?`, `status` (`in-progress` | `complete`), `hook`. Experience entries additionally carry `org`, `role`, and `location`.

Projects are the **OUT** nine; experience is the **IN** nine. That is the one place the golf metaphor does structural work for free.

## Routes

| Route | Purpose |
|---|---|
| `/` | Hero, then the scorecard as a live index of featured work |
| `/projects` | Full projects scorecard (OUT) |
| `/projects/[slug]` | Project deep-dive: hole number, dates, MDX sections, demo slot |
| `/experience` | Full experience scorecard (IN) |
| `/experience/[slug]` | Role deep-dive, same template |
| `/about` | Who he is, what he's into, resume download |
| `/admin` | Dev-only editor for both collections |

Supporting files: `app/not-found.tsx`, `app/icon.svg`, `app/opengraph-image.tsx`, `app/sitemap.ts`.

Every detail page implements `generateMetadata` so a shared link previews with the entry's own title and hook rather than the site default.

## Scorecard component

A single `Scorecard` component renders any collection as a ruled table:

```
HOLE  PROJECT                     CLUBS            PLAYED  CARD
01    ASIC Math Accelerator Unit  SystemVerilog    2024     ○
02    Product Defect Classifier   Python, spaCy    2025     ○
03    LoL Win Rate Predictor      Python, ML       2024     □
```

Every column is real frontmatter — no invented metrics. `HOLE` is the sort index, `CLUBS` is tags, `PLAYED` is the date range, `CARD` is status in golf notation (○ complete, □ in progress). A legend below the card explains the notation. On narrow viewports the table collapses to stacked rows rather than scrolling horizontally.

## Admin UI (`/admin`)

- Renders only when `NODE_ENV === 'development'`; returns 404 otherwise. Same guard at the top of every admin API route handler.
- Dashboard lists both collections with Edit / Delete, and a create field per collection.
- The edit form renders one textarea per section for that entry's collection, plus frontmatter fields — including `endDate`, and `org`/`role`/`location` for experience entries.
- Saving writes the MDX file through a local API route using Node `fs`.
- **The `collection` and `slug` URL parameters are whitelisted against known collections and a strict slug pattern before touching the filesystem.** Without this, a crafted request performs path traversal. Dev-only is not a reason to skip it.
- Editing an entry's title does **not** rename its folder. Slugs stay stable so published links don't break. The admin UI states this next to the title field.

No database. Git is the version history for content.

## Demo embed

Every detail page renders a `DemoEmbed` slot. It renders nothing unless an entry opts in, keeping the door open for a real interactive demo later without changing the page template.

## Stack

Next.js 14 (App Router), TypeScript, Tailwind, `next-mdx-remote/rsc`, `gray-matter`, `@tailwindcss/typography`, `next/font`. Tests in Vitest + Testing Library. Deployed on Vercel.

**Content is committed to git**, so publishing new work is a commit and a deploy — the admin UI is a local authoring tool, not a live CMS.

## Testing scope

Automated tests cover logic: the collection registry, content loader, entry CRUD, the dev guard, the path-parameter validation, the `Scorecard` rendering, and the two interactive admin components. Presentational server components and page shells are verified by `npm run build` plus the manual walkthrough in the final task. App Router async server components don't render meaningfully under jsdom, so unit-testing them would be theatre.

## Out of scope

- Live interactive demos (slot only)
- Hosted CMS or external content service
- Auth on the admin UI — it relies on being unreachable outside local dev
- Interests beyond golf and engineering

## Changes from the first draft

1. **Added the experience collection.** The original request asked to highlight "my experiences and personal projects"; the first spec dropped work experience entirely, leaving the Apple and Waterloo roles visible only inside a PDF.
2. **Made the golf theme structural.** It was previously a palette and the word "Golfer". The scorecard now carries the site.
3. **Shifted the palette and typography off known generated-design defaults** (warm cream + system serif, all-caps eyebrows, middot meta strings).
4. **Rendered the dates.** `startDate`/`endDate` were stored and sorted on but never displayed anywhere.
5. **Added per-entry metadata, 404, favicon, OG image, and sitemap**, none of which existed.
6. **Added path-parameter whitelisting** on admin routes.
7. **Documented slug stability** on title edits.
