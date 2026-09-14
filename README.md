# Timothy Pan — Portfolio

A personal portfolio built on Next.js. Its work index presents projects and roles with their tools, dates, and status, all sourced from the content files.

## Running it

```bash
npm install
npm run dev
```

## Adding or editing work

Start the dev server and open `/admin`. Enter a title under Projects or Experience and choose Create — you land on a form with one field per write-up section. Saving writes directly to `content/<collection>/<slug>/index.mdx`.

Commit that file to publish it. The admin UI is a local authoring tool, not a live CMS: it only renders when `NODE_ENV === 'development'`, and its API routes return 404 in production.

Renaming an entry does not change its web address. Slugs are fixed at creation so published links keep working.

## Content shape

| Collection | Sections |
|---|---|
| `projects` | Overview, Design, Plan, What I Learned, Troubles / Debugging |
| `experience` | Overview, What I Built, What I Learned, Highlights |

To add a collection or change its sections, edit `lib/collections.ts` — the loader, admin UI, and page templates all read from it.

## Testing

```bash
npm run test
npm run lint
npm run typecheck
```

## Deploying

Push to the connected Vercel project. Set the real domain in `app/layout.tsx` (`metadataBase`) and `app/sitemap.ts` (`BASE_URL`) so shared links and the sitemap use absolute URLs.
