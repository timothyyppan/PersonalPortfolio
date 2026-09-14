# Golf-Themed Personal Portfolio — Design

## Purpose

Personal portfolio site for Timothy Pan (Computer Engineering, University of Waterloo). Highlights identity, engineering experience, and personal projects, with a golf-inspired visual theme. Each project gets a deep-dive write-up (design, plan, learnings, troubles) rather than just a one-line description. Site is designed for content to be added/edited over time via a local admin interface, not by hand-editing files for every change.

## Visual design

- **Palette**: cream/paper background (`#f4efe1`), ink-green primary (`#0f4d2e` / `#16311f`), gold accent (`#b8973f`), muted text (`#5a5344`).
- **Typography**: serif headlines (Georgia), uppercase letter-spaced labels for nav/eyebrow text.
- **Layout motif**: Augusta-style hero — nameplate top-left, nav top-right, thin gold rule under nameplate, large serif headline, short intro copy, bordered "VIEW PROJECTS" button. A thin inset border frames the hero section.
- Palette and typography are shared across all pages via Tailwind theme tokens (not redefined per-page).

## Site structure

Next.js App Router, multi-page:

| Route | Purpose |
|---|---|
| `/` | Hero + short intro + 2-3 featured project cards + links (LinkedIn, GitHub, resume PDF download, email) |
| `/projects` | Grid of all project cards (title, tags, one-line hook, thumbnail placeholder) |
| `/projects/[slug]` | Deep-dive page: Overview, Design, Plan, What I Learned, Troubles/Debugging, `<DemoEmbed />` slot (empty placeholder) |
| `/about` | Golf + engineering identity, background/bio, resume link |
| `/admin` | Dev-only project editor (see below) |

## Project content model

- Each project lives at `content/projects/<slug>/index.mdx`.
- Frontmatter: `title`, `slug`, `tags[]`, `startDate`, `endDate` (optional), `status` (`in-progress` / `complete`), `hook` (one-liner for cards).
- Body is fixed-shape MDX with headings for: Overview, Design, Plan, What I Learned, Troubles/Debugging.
- Launch content: 3 projects from resume — Product Defect Classifier, ASIC Math Accelerator Unit, League of Legends Win Rate Predictor — each scaffolded with placeholder text in every section for the user to fill in later.
- A shared MDX template (`content/projects/_template.mdx`) defines the fixed section shape; new projects (via admin UI) are generated from it.

## Admin UI (`/admin`)

- Available only when `NODE_ENV === 'development'` (route renders a 404/redirect in production builds) — no auth needed since it's never reachable outside a local `next dev` session on the owner's machine.
- **List view**: all projects, with Edit / Delete actions.
- **Edit/Create form**: title, tags, dates, status, hook, plus one text area per fixed section (Overview/Design/Plan/Learned/Troubles). Markdown input, no live WYSIWYG needed for v1.
- **New Project**: scaffolds a new `content/projects/<slug>/index.mdx` from `_template.mdx`.
- **Save**: local Next.js API route (`/api/admin/projects/...`) writes the MDX file to disk via Node `fs`. This route must also be dev-only (guard at the top of the handler), so it has no effect if the site is ever deployed with the admin page reachable.
- No database. Git is the version history / backup for content changes.

## Demo embed slot

Every project detail page renders a `<DemoEmbed slug={slug} />` component. For now it renders nothing (or a "demo coming soon" placeholder) unless a project explicitly provides one. This keeps the door open to add a real interactive embed (e.g., the LoL win-rate predictor) later without changing the page template.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- MDX content via a file-based loader (e.g. Contentlayer or `next-mdx-remote`, decided during implementation)
- Deployed to Vercel, git-push-to-deploy
- No external services, no database, no auth system

## Out of scope (for now)

- Live interactive project demos (placeholder slot only)
- Hosted CMS / external content service
- Auth system for the admin UI (relies on it being dev-only/unreachable in prod)
- "About" content beyond golf + engineering (other hobbies/interests)
