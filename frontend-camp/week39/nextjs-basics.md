# Next.js Basics

Week 39 — from plain React (Vite) to Next.js **Format:** 3-hour
lecture/workshop, App Router, TypeScript

## Agenda (180 min)

| Time      | Block                                               |
|-----------|-----------------------------------------------------|
| 0:00–0:15 | 1. What is Next.js, and why                         |
| 0:15–0:35 | 2. Project setup & structure                        |
| 0:35–1:00 | 3. File-based routing                               |
| 1:00–1:20 | 4. Layouts, templates, special files                |
| 1:20–1:30 | ☕ Break                                            |
| 1:30–2:00 | 5. Server vs. Client Components                     |
| 2:00–2:25 | 6. Data fetching & caching                          |
| 2:25–2:45 | 7. Forms & Server Actions                           |
| 2:45–3:00 | 8. Styling, metadata, deployment + wrap-up exercise |

Each section below has talking points, code, and a short checkpoint you can run
live or have students try.

---

## 1. What is Next.js, and why? (15 min)

Next.js is a **React framework**. So far you've built apps with Vite: React
handles the UI, Vite bundles and serves it, and everything runs in the browser.
That's a fine setup, but it leaves gaps:

- No routing — you had to add `react-router` yourself.
- No server rendering — the browser downloads a blank HTML shell, then JS builds
  the page.
- No backend — a "real" app needs one somewhere else.
- No built-in optimization for images, fonts, scripts.

Next.js fills these in, as one integrated framework rather than a pile of
separate libraries:

- **File-based routing** — folders and files define your URLs.
- **Rendering on the server** — pages can be built as HTML before they reach the
  browser (better SEO, faster first paint).
- **API routes** — write backend endpoints in the same project.
- **Built-in optimizations** — images, fonts, scripts, bundling.

### Who's behind it, and where it runs

- Maintained by **Vercel**
  (also a hosting platform, though Next.js apps can run anywhere Node runs —
  Docker, self-hosted, other clouds).
- Used by companies like Netflix, TikTok, Twitch, Notion for production sites.

### Two routers — pick one and say why

Next.js currently ships two routing systems:

- **App Router** (`app/` directory) — current default, introduced in Next.js 13,
  supports Server Components, layouts, streaming. **This is what we teach
  today.**
- **Pages Router** (`pages/` directory) — the original router. Still supported,
  still shows up in older codebases and tutorials. Worth recognizing, not worth
  building new projects with.

**Talking point for class:** if a Stack Overflow answer or blog post looks weird
or outdated, check whether it's Pages Router — the two are different enough to
cause real confusion.

### Checkpoint

Ask: "What problem from your week 36–38 apps would file-based routing or
built-in API routes have solved?" (cart app's routing, poker game's routes,
etc.) Collect 2–3 answers before moving on.

---

## 2. Project setup & structure (20 min)

### Scaffolding

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

The CLI asks several questions. For this course:

- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: your call (covered briefly in section 8)
- `src/` directory: optional — either works, be consistent
- App Router: **Yes**
- Turbopack: default is fine (Next's newer, faster bundler)
- Import alias (`@/*`): keep default

Dev server runs at [http://localhost:3000](http://localhost:3000).

### Folder anatomy

```
my-app/
├── app/
│   ├── layout.tsx        # root layout — wraps every page
│   ├── page.tsx           # route: /
│   ├── globals.css
│   └── about/
│       └── page.tsx       # route: /about
├── public/                 # static files served at /
│   └── logo.png            # → /logo.png
├── next.config.ts
├── tsconfig.json
└── package.json
```

Compare this to the Vite apps from weeks 36–38: there, `index.html` was the
single entry point and everything else was client JS. Here, `app/` *is* the
routing table.

### Scripts

```jsonc
// package.json
{
  "scripts": {
    "dev": "next dev",        // dev server with hot reload
    "build": "next build",    // production build
    "start": "next start",    // run the production build
    "lint": "eslint"
  }
}
```

Run `npm run build` once during class and look at the output — it reports each
route's size and whether it's static (○) or dynamic (λ). This is a good moment
to demystify what "build" actually produces.

### Checkpoint

Have everyone scaffold a project now, run `npm run dev`, and confirm they see
the default page at `localhost:3000` before continuing — this avoids setup
problems eating into later sections.

---

## 3. File-based routing (25 min)

### The core rule

A folder under `app/` becomes a URL segment. A `page.tsx` file inside a folder
makes that folder's route visitable.

| File path            | URL      |
|----------------------|----------|
| `app/page.tsx`       | `/`      |
| `app/about/page.tsx` | `/about` |
| `app/blog/page.tsx`  | `/blog`  |

Folders *without* a `page.tsx` don't become routes — they're just organizational
(useful once we get to layouts).

### Dynamic segments

Square brackets create a dynamic route parameter:

```
app/blog/[slug]/page.tsx   →   /blog/hello-world, /blog/anything
```

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({
                                           params,
                                       }: {
    params: Promise<{ slug: string }>
}) {
    const {slug} = await params
    return <h1>Post: {slug}</h1>
}
```

`params` is a `Promise` in current Next.js versions — this trips people up
coming from tutorials written before that change, so call it out explicitly.

### Catch-all segments

```
app/docs/[...slug]/page.tsx
```

Matches `/docs/a`, `/docs/a/b`, `/docs/a/b/c` — `slug` arrives as an array:
`['a', 'b', 'c']`.

Add a second pair of brackets — `[[...slug]]` — to also match `/docs` itself
(optional catch-all).

### Route groups

Parentheses group routes *without* affecting the URL — useful for organizing
without adding a path segment:

```
app/(marketing)/about/page.tsx    →   /about   (not /marketing/about)
app/(shop)/cart/page.tsx          →   /cart
```

Common use: giving `(marketing)` and `(shop)` each their own layout while
keeping URLs flat.

### Navigating between routes

Use `<Link>`, not `<a>` — it enables client-side navigation (no full page
reload) and prefetches linked pages:

```tsx
import Link from 'next/link'

export default function Nav() {
    return (
        <nav>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </nav>
    )
}
```

Programmatic navigation (from a Client Component — see section 5):

```tsx
'use client'
import {useRouter} from 'next/navigation'

export default function GoHomeButton() {
    const router = useRouter()
    return <button onClick={() => router.push('/')}>Go home</button>
}
```

Reading the current route or query string, also from a Client Component:

```tsx
'use client'
import {usePathname, useSearchParams} from 'next/navigation'

export default function Debug() {
    const pathname = usePathname()          // "/blog/hello-world"
    const searchParams = useSearchParams()   // URLSearchParams
    return <p>{pathname}?{searchParams.toString()}</p>
}
```

### Live-coding exercise (10 min)

Build a tiny 3-page site together: `/`, `/about`, `/blog/[slug]`, linked with
`<Link>`. This becomes the base project the rest of the lecture builds on.

---

## 4. Layouts, templates & special files (20 min)

### Layouts

`layout.tsx` wraps every page below it in the folder tree and — critically —
**persists across navigation**: it doesn't re-mount when you click between
sibling pages, so state inside it (e.g. an open mobile nav) survives.

Every app needs a root layout:

```tsx
// app/layout.tsx
import './globals.css'

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <header>My Site</header>
        {children}
        <footer>© 2026</footer>
        </body>
        </html>
    )
}
```

Layouts nest: a layout inside `app/blog/layout.tsx` wraps only routes under
`/blog`, inside the root layout.

```
app/
├── layout.tsx           # wraps everything
└── blog/
    ├── layout.tsx        # wraps everything under /blog
    └── [slug]/
        └── page.tsx
```

### Templates

`template.tsx` looks like a layout but *does* re-mount on every navigation —
useful for enter/exit animations or resetting state per page. Reach for a layout
by default; use a template only when you specifically need that reset.

### Special files reference

Next.js gives special meaning to certain filenames inside a route folder:

| File            | Purpose                                                     |
|-----------------|-------------------------------------------------------------|
| `page.tsx`      | the UI for a route, makes it public                         |
| `layout.tsx`    | shared UI wrapping child routes, persists                   |
| `template.tsx`  | like layout, but remounts on navigation                     |
| `loading.tsx`   | loading UI, shown instantly via React Suspense              |
| `error.tsx`     | error boundary UI for that route segment                    |
| `not-found.tsx` | UI shown when `notFound()` is called or route doesn't match |
| `route.ts`      | an API endpoint (no UI) — see section 6                     |

### `loading.tsx`

```tsx
// app/blog/loading.tsx
export default function Loading() {
    return <p>Loading posts…</p>
}
```

Next automatically wraps the page in a `<Suspense>` boundary using this as the
fallback — shown while the async Server Component below it is fetching data. No
manual `isLoading` state needed.

### `error.tsx`

```tsx
// app/blog/error.tsx
'use client' // error boundaries must be Client Components

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error
    reset: () => void
}) {
    return (
        <div>
            <p>Something went wrong: {error.message}</p>
            <button onClick={() => reset()}>Try again</button>
        </div>
    )
}
```

### `not-found.tsx`

```tsx
// app/blog/[slug]/not-found.tsx
export default function NotFound() {
    return <p>That post doesn't exist.</p>
}
```

Trigger it manually from a Server Component:

```tsx
import {notFound} from 'next/navigation'

export default async function BlogPost({params}: {
    params: Promise<{ slug: string }>
}) {
    const {slug} = await params
    const post = await getPost(slug)
    if (!post) notFound()
    return <article>{post.title}</article>
}
```

### Checkpoint

Add a `loading.tsx` to the exercise project from section 3, and an artificial
`await new Promise(r => setTimeout(r, 1000))` in a page's data fetch, so
students can *see* the loading state actually trigger.

---

## ☕ Break (10 min)

---

## 5. Server vs. Client Components (30 min)

This is the single biggest mental shift coming from Vite + React, so give it
real time.

### The default: Server Components

**Every component under `app/` is a Server Component unless you say otherwise.**
It:

- Renders on the server (or at build time). The browser receives HTML, not the
  component's JS.
- Can be `async` and `await` data directly — no `useEffect`, no loading state
  boilerplate.
- Can safely use secrets, database clients, filesystem access — none of that
  code ships to the browser.
- **Cannot** use `useState`, `useEffect`, or any hook, and cannot attach event
  handlers (`onClick`, etc.) — there's no browser runtime for them to run in.

```tsx
// Server Component — the default, no directive needed
async function getPosts() {
    const res = await fetch('https://api.example.com/posts')
    return res.json()
}

export default async function BlogPage() {
    const posts = await getPosts()
    return (
        <ul>
            {posts.map((p: { id: string; title: string }) => (
                <li key={p.id}>{p.title}</li>
            ))}
        </ul>
    )
}
```

### Opting into the client: `"use client"`

Add the directive at the very top of a file to make that component (and
everything it imports) a **Client Component**:

```tsx
// app/components/Counter.tsx
'use client'

import {useState} from 'react'

export default function Counter() {
    const [count, setCount] = useState(0)
    return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

Use a Client Component when you need:

- State or effects (`useState`, `useEffect`, `useReducer`, ...)
- Event handlers
- Browser-only APIs (`window`, `localStorage`, `navigator`)
- Third-party libraries that themselves rely on hooks or effects (many
  chart/animation libs)

### Composing the two

The common — and recommended — pattern: **Server Components fetch data and pass
it down; Client Components handle interactivity at the leaves.**

```tsx
// app/blog/page.tsx (Server Component)
import LikeButton from './LikeButton'

export default async function BlogPage() {
    const posts = await getPosts()
    return (
        <ul>
            {posts.map((p: { id: string; title: string }) => (
                <li key={p.id}>
                    {p.title}
                    <LikeButton postId={p.id}/>
                </li>
            ))}
        </ul>
    )
}
```

```tsx
// app/blog/LikeButton.tsx (Client Component)
'use client'
import {useState} from 'react'

export default function LikeButton({postId}: { postId: string }) {
    const [liked, setLiked] = useState(false)
    return <button onClick={() => setLiked(!liked)}>{liked ? '♥' : '♡'}</button>
}
```

**A Server Component can render a Client Component — but not the reverse.** A
Client Component cannot `import` and directly render a Server Component (it can
still receive one via `children` — worth a mention, not a deep dive today).

### The rule of thumb

> Keep components server-rendered by default. Push `"use client"` as far down
> the tree as possible — mark only the interactive leaf, not the whole page.

### Whiteboard exercise (10 min)

Draw the component tree of the cart app from week 37. As a group, decide which
components would be Server vs. Client under the App Router (product list →
server; add-to-cart button → client; cart badge with local state → client; page
layout → server).

---

## 6. Data fetching & caching (25 min)

### Fetching in Server Components

Because Server Components can be `async`, data fetching is just `await`:

```tsx
async function getData() {
    const res = await fetch('https://api.example.com/data')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
}

export default async function Page() {
    const data = await getData()
    return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

No `useEffect`, no `isLoading` state, no request waterfall from the client — the
HTML that reaches the browser already contains the data.

### Caching behavior

Next.js extends the native `fetch` with caching controls:

```tsx
// cached indefinitely (default for many cases) — good for data that rarely changes
fetch(url)

// never cache — always fetch fresh (good for user-specific or frequently changing data)
fetch(url, {cache: 'no-store'})

// revalidate (re-fetch) at most every 60 seconds — "ISR" for data
fetch(url, {next: {revalidate: 60}})
```

**Talking point:** this replaces a lot of what you'd otherwise reach for
`react-query`/`SWR` for in a client-only app — though those libraries still have
a place for client-side, user-triggered fetching.

### Parallel vs. sequential fetching

Sequential (slow — each `await` blocks the next):

```tsx
const user = await getUser(id)
const posts = await getPosts(user.id) // waits for getUser first
```

Parallel (fast — independent requests run together):

```tsx
const [user, posts] = await Promise.all([getUser(id), getPosts(id)])
```

Point out: this is the exact same JS concept from earlier in the course, it's
just newly relevant because Server Components make `await` this easy.

### Streaming with `Suspense`

Wrap a slow part of the page in `<Suspense>` so the rest of the page can render
immediately while it loads:

```tsx
import {Suspense} from 'react'

export default function Page() {
    return (
        <div>
            <h1>Dashboard</h1>
            <Suspense fallback={<p>Loading stats…</p>}>
                <Stats/> {/* async Server Component */}
            </Suspense>
        </div>
    )
}
```

This is the same mechanism behind `loading.tsx` from section 4 — that file is
just a convention that wraps the whole page automatically.

### Static vs. dynamic rendering

- **Static** (default when possible): the page is rendered once (at build time)
  and reused for every request — fastest, cheapest, cacheable on a CDN.
- **Dynamic**: rendered per-request — needed when a page reads cookies, headers,
  search params, or uses `fetch(..., { cache: 'no-store' })`.

Next.js decides this automatically based on what a page does; you can also force
it:

```tsx
export const dynamic = 'force-dynamic' // opt out of static rendering
```

### Checkpoint / live demo

Fetch a public API (e.g. `https://jsonplaceholder.typicode.com/posts`) from a
Server Component, render the list, then convert one item's "like" interaction
into a Client Component — tying together sections 5 and 6.

---

## 7. Forms & Server Actions (20 min)

Server Actions let a form submit straight to a server-side function — no
manually-written API route, no client-side `fetch` + `onSubmit` handler required
(though both still work if you'd rather).

### A basic Server Action

```tsx
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
    const title = formData.get('title') as string
    // e.g. await db.posts.create({ title })
    console.log('New post:', title)
}
```

```tsx
// app/new-post/page.tsx (Server Component)
import {createPost} from '../actions'

export default function NewPostPage() {
    return (
        <form action={createPost}>
            <input name="title" placeholder="Post title"/>
            <button type="submit">Create</button>
        </form>
    )
}
```

No `onSubmit`, no `preventDefault`, no client JS required for the form to work
at all — this is a good moment to contrast with the controlled-form patterns
used in the week 37 cart/poker apps.

### Adding client-side pending/error state

For UX feedback (disable button while submitting, show validation errors), pair
a Server Action with `useActionState`:

```tsx
// app/new-post/Form.tsx
'use client'
import {useActionState} from 'react'
import {createPost} from '../actions'

const initialState = {error: ''}

export default function Form() {
    const [state, formAction, isPending] = useActionState(createPost, initialState)
    return (
        <form action={formAction}>
            <input name="title" placeholder="Post title"/>
            <button type="submit" disabled={isPending}>
                {isPending ? 'Creating…' : 'Create'}
            </button>
            {state.error && <p>{state.error}</p>}
        </form>
    )
}
```

The action's signature changes slightly to accept the previous state as its
first argument — worth showing but not necessary to memorize today.

### Revalidating data after a mutation

After a Server Action changes data, tell Next.js to refresh any cached data that
depended on it:

```tsx
'use server'
import {revalidatePath} from 'next/cache'

export async function createPost(formData: FormData) {
    const title = formData.get('title') as string
    // ... save it
    revalidatePath('/blog') // refetch/rerender /blog next time it's visited
}
```

### Checkpoint

Add a "new post" form to the exercise blog using a Server Action, then call
`revalidatePath` so the new post shows up on `/blog` without a manual refresh.

---

## 8. Styling, metadata, and deployment (15 min)

Lighter-touch section — cover for awareness, not mastery.

### Styling options

Next.js doesn't force one approach. Common choices:

- **Global CSS** — `app/globals.css`, imported once in the root layout.
- **CSS Modules** — `Component.module.css`, scoped automatically:

  ```tsx
  import styles from './Button.module.css'
  export default function Button() {
    return <button className={styles.primary}>Click</button>
  }
  ```

- **Tailwind CSS** — offered directly in `create-next-app`; utility classes, no
  separate CSS files. Most common choice in current Next.js projects.

### Metadata (SEO)

Export a `metadata` object (or a `generateMetadata` function for dynamic values)
from any `page.tsx` or `layout.tsx`:

```tsx
import type {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'My Blog',
    description: 'Thoughts on frontend development',
}
```

Dynamic version, per blog post:

```tsx
export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const {slug} = await params
    const post = await getPost(slug)
    return {title: post.title, description: post.excerpt}
}
```

This replaces manually managing `<title>`/`<meta>` tags with something like
`react-helmet` in a client-only app.

### Images and fonts

```tsx
import Image from 'next/image'

<
Image
src = "/logo.png"
alt = "Logo"
width = {200}
height = {100}
/>
```

`next/image` handles resizing, lazy loading, and serving modern formats
automatically. `next/font` does the equivalent for web fonts (no separate
`<link>` tag, no layout shift while a font loads).

### Environment variables

```
# .env.local
DATABASE_URL=postgres://...
NEXT_PUBLIC_API_URL=https://api.example.com
```

- Plain names (`DATABASE_URL`) are server-only — never sent to the browser. Safe
  for secrets.
- Prefixed with `NEXT_PUBLIC_` — bundled into client JS. Use only for values
  that are fine to expose.

### Deployment

```bash
npm run build
npm run start   # or deploy the .next/ output to a host
```

- **Vercel** (made by the Next.js team) is the path of least resistance —
  connect a GitHub repo, push, done.
- Also runs on any Node host, Docker, or platforms like Netlify/AWS/Cloudflare
  with the right adapter. Static-only projects can even export fully static HTML
  with `next export`-style config, though that gives up server features.

---

## Vite vs. Next.js — quick reference

|               | Vite + React                   | Next.js                                                |
|---------------|--------------------------------|--------------------------------------------------------|
| Routing       | Manual (`react-router`)        | File-based (`app/`)                                    |
| Rendering     | Client-only                    | Server + client                                        |
| Data fetching | `useEffect` + fetch            | `await fetch` in Server Components                     |
| Forms         | Controlled inputs + `onSubmit` | Server Actions (or controlled inputs, still available) |
| Backend       | Separate project               | Built-in API routes / Server Actions                   |
| SEO/metadata  | Manual (`react-helmet` etc.)   | `metadata` export                                      |
| Config        | `vite.config.ts`               | `next.config.ts`                                       |

---

## Final exercise (wrap-up, ~15 min if time allows, otherwise take-home)

Extend the project built through the lecture into a small blog:

1. `/` — list of posts, fetched in a Server Component.
2. `/blog/[slug]` — a single post page with dynamic `metadata`.
3. A `LikeButton` Client Component on each post.
4. A `loading.tsx` and a `not-found.tsx` for the blog section.
5. `/blog/new` — a form using a Server Action that adds a post and
   `revalidatePath('/')`.
6. Deploy it (Vercel is fastest for a first deploy).

## API routes, for reference

Not covered live if time runs short, but useful when a Server Action isn't the
right shape (e.g. an endpoint called by something other than your own forms):

```tsx
// app/api/hello/route.ts
export async function GET() {
    return Response.json({message: 'Hello!'})
}

export async function POST(request: Request) {
    const body = await request.json()
    return Response.json({received: body})
}
```

Visiting or `fetch`-ing `/api/hello` hits this handler.

## Further reading

- [Next.js docs](https://nextjs.org/docs)
- [Learn Next.js (official tutorial)](https://nextjs.org/learn)
- [React Server Components explainer (react.dev)](https://react.dev/reference/rsc/server-components)
