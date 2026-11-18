# Authentication in Payload CMS: a beginner's guide

In this guide you will add **registration, login, logout,
protected pages and per-user data** to a Payload + Next.js
project, and see every step working in the browser.

## What you will build

| Page        | Who can see it      | What it shows                     |
|-------------|---------------------|-----------------------------------|
| `/register` | Logged-out visitors | Create an account                 |
| `/login`    | Logged-out visitors | Log in                            |
| `/account`  | Logged-in users     | Your email, name and role         |
| `/notes`    | Logged-in users     | **Your own** notes (add / delete) |
| `/admin`    | Admins only         | The Payload admin panel           |

The header changes depending on whether you are logged in.

## Prerequisites

* The starter project running (`docker compose up -d`, a
  filled-in `.env`, `npm install`).
* Basic React / Next.js knowledge.

---

## 1. The big ideas (read this first)

**Authentication** = *who are you?* **Authorization**(access
control) = *what are you allowed to do?*

1. In Payload, any collection can become a "user" collection
   by adding `auth: true`. Payload then gives you, for free:
   password hashing, login/logout endpoints, and a session
   cookie.
2. When you log in, Payload sets an **HTTP-only cookie**
   called `payload-token` (a JWT). JavaScript in the browser
   cannot read it, which protects it from XSS theft. The
   browser sends it automatically with every request to the
   same site.
3. On the server, Payload reads that cookie and tells you
   who the user is (`payload.auth()` or `req.user`).
4. **Access control functions** decide what each user may
   do. They return `true`, `false`, or a *query* (like
   `{ owner: { equals: user.id } }`) that filters which
   documents the user can touch.

Built-in endpoints you will use (the REST API lives under
`/api`):

| Endpoint                 | Purpose                    |
|--------------------------|----------------------------|
| `POST /api/users`        | Create a user (register)   |
| `POST /api/users/login`  | Log in, sets the cookie    |
| `POST /api/users/logout` | Log out, clears the cookie |
| `GET /api/users/me`      | Who am I?                  |

> **Important:** the *Local API* (`payload.find(...)` in
> server code) **ignores access control by default**. We will
> show how to turn it on in step 7. This is the number one
> beginner security mistake.

---

## 2. Upgrade the `Users` collection

Our users need a **name** and a **role** (`admin` or`user`).
We also write the access rules:

* Anyone can register.
* A user can read/update/delete only themselves; admins can
  do it for everyone.
* Only admins can change the `role` field. Otherwise someone
  could register with `"role": "admin"` and make themselves
  an admin!
* The first user to register becomes admin (so you get into
  the admin panel).
* Only admins may open `/admin`.

Replace `src/collections/Users.ts`:

```ts
import type {
    Access,
    CollectionConfig,
    FieldAccess
} from 'payload'

// Access functions return true/false, or a "where" query that filters rows.
const isAdmin = (user?: {
    role?: string | null
} | null) => user?.role === 'admin'

// Admins can touch every user, everybody else only themselves.
const adminOrSelf: Access = ({req: {user}}) => {
    if (!user) return false
    if (isAdmin(user)) return true
    return {id: {equals: user.id}}
}

// Field-level access: only admins may set/change the role.
const adminOnlyField: FieldAccess = ({req: {user}}) => isAdmin(user)

export const Users: CollectionConfig = {
    slug: 'users',
    admin: {
        useAsTitle: 'email',
    },
    auth: true, // <- this one line gives us login, logout, me, cookies, hashing...
    access: {
        create: () => true, // anyone can register
        read: adminOrSelf,
        update: adminOrSelf,
        delete: adminOrSelf,
        // Only admins may open the /admin panel
        admin: ({req: {user}}) => isAdmin(user),
    },
    hooks: {
        beforeChange: [
            async ({data, operation, req}) => {
                // The very first user that registers becomes admin.
                if (operation === 'create') {
                    const {totalDocs} = await req.payload.count({collection: 'users'})
                    if (totalDocs === 0) data.role = 'admin'
                }
                return data
            },
        ],
    },
    fields: [
        {name: 'name', type: 'text'},
        {
            name: 'role',
            type: 'select',
            options: ['admin', 'user'],
            defaultValue: 'user',
            required: true,
            saveToJWT: true, // role is available in req.user without a DB lookup
            access: {
                create: adminOnlyField,
                update: adminOnlyField,
            },
        },
    ],
}
```

Things to notice:

* `access` on the collection = who can do what with
  *documents*. `access` inside a field = who can read/write
  *that field*.
* `saveToJWT: true` puts the role in the token, so
  `req.user.role` is available without a database lookup.
* `adminOrSelf` returns a **query** for normal users.
  Payload adds it to the database query, so other people's
  documents simply never appear.

## 3. Add a `Notes` collection (private data)

We need something to protect. Every note belongs to one
user, and users only see their own notes.

Create `src/collections/Notes.ts`:

```ts
import type {Access, CollectionConfig} from 'payload'

// Logged-in users only see/edit their own notes. Admins see everything.
const ownNotes: Access = ({req: {user}}) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return {owner: {equals: user.id}}
}

export const Notes: CollectionConfig = {
    slug: 'notes',
    admin: {useAsTitle: 'title'},
    access: {
        create: ({req: {user}}) => Boolean(user),
        read: ownNotes,
        update: ownNotes,
        delete: ownNotes,
    },
    hooks: {
        beforeChange: [
            ({data, operation, req}) => {
                // Never trust the client: the owner is always the logged-in user.
                if (operation === 'create' && req.user) data.owner = req.user.id
                return data
            },
        ],
    },
    fields: [
        {name: 'title', type: 'text', required: true},
        {name: 'content', type: 'textarea'},
        {
            name: 'owner',
            type: 'relationship',
            relationTo: 'users',
            admin: {readOnly: true},
            access: {update: () => false},
        },
    ],
}
```

The `beforeChange` hook sets `owner` on the server. Even if
a malicious client sends `"owner": 1`, we overwrite it.
**Never trust data from the client.**

## 4. Register the collection

In `src/payload.config.ts` add the import and add `Notes` to
the `collections` array:

```ts
import {Notes} from './collections/Notes';

const collections: CollectionConfig[] = [
    Users,
    Media,
    Notes,
];
```

## 5. Update the database

Regenerate the TypeScript types and create a migration (this
project uses migrations):

```bash
npm run generate:types
npm run migrate:create -- add_auth_roles_and_notes
npm run migrate
```

> **Heads up:** if you have been running `npm run dev`,
> Payload may already have pushed the schema straight to your
> database ("dev mode push"). Then `npm run migrate` warns
> that data may be lost and asks to continue. On a throw-away
> local database that is fine; just answer `y`. Do **not** do
> this against a database with data you care about.

## 6. A server helper: who is the current user?

Create `src/lib/auth.ts`. Server components (pages, the
header) will use it:

```ts
import {headers} from 'next/headers'
import {redirect} from 'next/navigation'
import {getPayload} from 'payload'
import config from '@payload-config'

/** Returns the Payload instance (Local API) for use in server components. */
export const getPayloadClient = () => getPayload({config})

/** Returns the logged-in user (or null) by reading the payload-token cookie. */
export async function getCurrentUser() {
    const payload = await getPayloadClient()
    const {user} = await payload.auth({headers: await headers()})
    return user
}

/** Use at the top of a protected page: sends visitors to /login. */
export async function requireUser() {
    const user = await getCurrentUser()
    if (!user) redirect('/login')
    return user
}
```

* `payload.auth({ headers })` reads the `payload-token`
  cookie from the incoming request and returns the user, or
  `null`.
* `requireUser()` is our "guard": put it on top of any page
  that needs login.

## 7. Frontend components

### 7.1 Login and register form (client component)

One form component serves both pages. It is a client
component because it handles events and calls `fetch`.

`src/components/auth/AuthForm.tsx`:

```tsx
'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'

type Props = { mode: 'login' | 'register' }

export default function AuthForm({mode}: Props) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)
        const form = new FormData(e.currentTarget)
        const body = Object.fromEntries(form) as Record<string, string>

        try {
            // Registering = creating a user. Payload does not log you in automatically.
            if (mode === 'register') {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body),
                })
                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.errors?.[0]?.message ?? 'Could not register')
                }
            }

            // Login sets the HTTP-only "payload-token" cookie for us.
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: body.email,
                    password: body.password
                }),
                credentials: 'include',
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.errors?.[0]?.message ?? 'Login failed')
            }

            router.push('/account')
            router.refresh() // re-run server components so the Header sees the new cookie
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="form">
            {mode === 'register' && (
                <label>
                    Name
                    <input name="name" type="text"
                           autoComplete="name"/>
                </label>
            )}
            <label>
                Email
                <input name="email" type="email" required
                       autoComplete="email"/>
            </label>
            <label>
                Password
                <input
                    name="password"
                    type="password"
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
            </label>
            {error && <p className="error"
                         role="alert">{error}</p>}
            <button
                disabled={loading}>{mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
    )
}
```

How it works:

1. Register: `POST /api/users`. Payload does *not* log you
   in after creating a user.
2. Login: `POST /api/users/login`. The response contains
   `Set-Cookie: payload-token=...`.
3. `router.refresh()` makes Next.js re-run server components
   so the header notices you are now logged in.

### 7.2 Logout button

`src/components/auth/LogoutButton.tsx`:

```tsx
'use client'

import {useRouter} from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    async function logout() {
        await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include'
        })
        router.push('/')
        router.refresh()
    }

    return <button onClick={logout}>Log out</button>
}
```

### 7.3 Header that reacts to login state

Replace `src/components/Header/Header.tsx`. It is an `async`
server component, so it can call `getCurrentUser()`directly:

```tsx
import "./Header.css";
import Link from "next/link";
import {getCurrentUser} from "@/lib/auth";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function Header() {
    const user = await getCurrentUser();

    return (
        <header className="header">
            <Link href="/">Home</Link>
            <nav>
                {user ? (
                    <>
                        <Link href="/notes">My notes</Link>
                        <Link
                            href="/account">{user.name || user.email}</Link>
                        <LogoutButton/>
                    </>
                ) : (
                    <>
                        <Link href="/login">Log in</Link>
                        <Link
                            href="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
```

> Because the header reads cookies, every page becomes
> *dynamic* (rendered per request). That is exactly what we
> want for pages that depend on who is looking.

### 7.4 Notes components

`src/components/notes/NoteForm.tsx`:

```tsx
'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'

export default function NoteForm() {
    const router = useRouter()
    const [error, setError] = useState('')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formEl = e.currentTarget
        const body = Object.fromEntries(new FormData(formEl))
        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
            credentials: 'include',
        })
        if (!res.ok) return setError('Could not save note')
        setError('')
        formEl.reset()
        router.refresh()
    }

    return (
        <form onSubmit={onSubmit} className="form">
            <label>
                Title
                <input name="title" required/>
            </label>
            <label>
                Content
                <textarea name="content" rows={3}/>
            </label>
            {error && <p className="error">{error}</p>}
            <button>Add note</button>
        </form>
    )
}
```

`src/components/notes/DeleteNoteButton.tsx`:

```tsx
'use client'

import {useRouter} from 'next/navigation'

export default function DeleteNoteButton({id}: {
    id: number
}) {
    const router = useRouter()

    async function remove() {
        await fetch(`/api/notes/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        router.refresh()
    }

    return <button onClick={remove}>Delete</button>
}
```

## 8. Pages

`src/app/(frontend)/login/page.tsx`: logged-in users are
bounced to `/account`:

```tsx
import {redirect} from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import {getCurrentUser} from '@/lib/auth'

export default async function LoginPage() {
    if (await getCurrentUser()) redirect('/account')
    return (
        <>
            <h1>Log in</h1>
            <AuthForm mode="login"/>
        </>
    )
}
```

`src/app/(frontend)/register/page.tsx`:

```tsx
import {redirect} from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import {getCurrentUser} from '@/lib/auth'

export default async function RegisterPage() {
    if (await getCurrentUser()) redirect('/account')
    return (
        <>
            <h1>Create account</h1>
            <AuthForm mode="register"/>
        </>
    )
}
```

`src/app/(frontend)/account/page.tsx`: protected with
`requireUser()`:

```tsx
import {requireUser} from '@/lib/auth'

export default async function AccountPage() {
    const user = await requireUser() // not logged in -> redirected to /login

    return (
        <>
            <h1>Your account</h1>
            <ul>
                <li>Email: {user.email}</li>
                <li>Name: {user.name || '(not set)'}</li>
                <li>Role: {user.role}</li>
            </ul>
            {user.role === 'admin' &&
                <p><a href="/admin">Open the admin panel</a>
                </p>}
        </>
    )
}
```

`src/app/(frontend)/notes/page.tsx`: protected, and reads
notes through the **Local API with access control switched
on**:

```tsx
import {getPayloadClient, requireUser} from '@/lib/auth'
import NoteForm from '@/components/notes/NoteForm'
import DeleteNoteButton
    from '@/components/notes/DeleteNoteButton'

export default async function NotesPage() {
    const user = await requireUser()
    const payload = await getPayloadClient()

    // The Local API skips access control by default!
    // overrideAccess: false + user makes it obey our access rules.
    const {docs: notes} = await payload.find({
        collection: 'notes',
        user,
        overrideAccess: false,
        sort: '-createdAt',
    })

    return (
        <>
            <h1>My notes</h1>
            <NoteForm/>
            {notes.length === 0 && <p>No notes yet.</p>}
            <ul className="notes">
                {notes.map((note) => (
                    <li key={note.id}>
                        <strong>{note.title}</strong>
                        <p>{note.content}</p>
                        <DeleteNoteButton id={note.id}/>
                    </li>
                ))}
            </ul>
        </>
    )
}
```

Look closely at `overrideAccess: false` and `user`. Without
them, `payload.find` would return **everyone's** notes.

## 9. Styling

Append to `src/app/(frontend)/styles.css`:

```css
.form {
    display: grid;
    gap: 0.75rem;
    max-inline-size: 24rem;

    label {
        display: grid;
        gap: 0.25rem;
    }
}

.error {
    color: crimson;
}

.notes {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 1rem;

    li {
        border: 1px solid lightgray;
        padding: 0.75rem;
    }
}
```

## 10. Try it

```bash
docker compose up -d
npm run dev
```

1. Open <http://localhost:3000/notes>. You are redirected to
   `/login` (guard works).
2. Go to **Register**, create an account. **The first
   account becomes `admin`**; check `/account`.
3. Add a few notes at `/notes`. Delete one.
4. Click **Log out**. The header switches back to *Log in /
   Register*.
5. Register a **second** account. It has role `user`, sees
   **none** of the first user's notes, and `/admin`redirects
   away.
6. Log in as the first user again: the admin can open
   `/admin` and sees all notes in the `Notes` collection.

### Poke the API like an attacker

With the dev server running (use a browser's DevTools
console while logged in, or `curl`):

```bash
# not logged in -> 403
curl -i http://localhost:3000/api/notes

# try to register as admin -> the role is ignored, you become "user"
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"evil@example.com","password":"secret123","role":"admin"}'

# log in and keep the cookie
curl -c jar.txt -X POST http://localhost:3000/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"evil@example.com","password":"secret123"}'

# who am I?
curl -b jar.txt http://localhost:3000/api/users/me
```

## 11. Build and run for production

```bash
npm run build
npm run start
```

Both the build and the full flow above were tested against a
freshly migrated database.

## 12. How the pieces fit together

```
Browser form ──fetch POST /api/users/login──▶ Payload checks password
                                              ◀── Set-Cookie: payload-token (HTTP-only)

Browser requests /notes (cookie sent automatically)
   └▶ Next.js server component ─ requireUser() ─ payload.auth({headers}) ─▶ user or redirect('/login')
         └▶ payload.find({ user, overrideAccess:false }) ─▶ access fn adds  where owner = user.id
```

## 13. Common mistakes

| Mistake                                                   | Fix                                                     |
|-----------------------------------------------------------|---------------------------------------------------------|
| Using `payload.find` in a page and seeing everyone's data | Pass `user` and `overrideAccess: false`                 |
| Letting users set their own `role`                        | Field-level `access` on `role`                          |
| Forgetting `router.refresh()` after login/logout          | Header will show stale state                            |
| `credentials: 'include'` missing on cross-origin fetches  | Cookie is not sent; same-origin works by default        |
| Storing the token in `localStorage`                       | Don't. The HTTP-only cookie is safer                    |
| Only hiding a button in the UI                            | UI hiding is not security; the **access functions** are |
| Weak `PAYLOAD_SECRET` in production                       | Use a long random string                                |

## 14. Exercises

1. Add a `bio` textarea to `Users` and show it on`/account`.
2. Add an "Edit note" feature using `PATCH /api/notes/:id`.
3. Add a `/admin-only` page that shows a message only if
   `user.role === 'admin'`, otherwise `redirect('/')`.
4. Add a `public` checkbox on notes; change the `read`access
   to return `true` for public notes.
5. Add a "forgot password" flow (see Payload docs:
   `forgotPassword` and `resetPassword`; you will need an
   email adapter).

## 15. Summary of all changes

| File                                                                   | Change                                                           |
|------------------------------------------------------------------------|------------------------------------------------------------------|
| `src/collections/Users.ts`                                             | **Modified**: name, role, access rules, first-user-is-admin hook |
| `src/collections/Notes.ts`                                             | **New**                                                          |
| `src/payload.config.ts`                                                | **Modified**: register `Notes`                                   |
| `src/payload-types.ts`                                                 | **Regenerated**                                                  |
| `src/migrations/*_add_auth_roles_and_notes.*`                          | **Generated** + `index.ts` updated                               |
| `src/lib/auth.ts`                                                      | **New**                                                          |
| `src/components/auth/AuthForm.tsx`, `LogoutButton.tsx`                 | **New**                                                          |
| `src/components/notes/NoteForm.tsx`, `DeleteNoteButton.tsx`            | **New**                                                          |
| `src/components/Header/Header.tsx`                                     | **Modified**                                                     |
| `src/app/(frontend)/login`, `register`, `account`, `notes` `/page.tsx` | **New**                                                          |
| `src/app/(frontend)/styles.css`                                        | **Modified**                                                     |
