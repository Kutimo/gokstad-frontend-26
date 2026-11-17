import type { Access, CollectionConfig, FieldAccess } from 'payload'

// Access functions return true/false, or a "where" query that filters rows.
const isAdmin = (user?: { role?: string | null } | null) => user?.role === 'admin'

// Admins can touch every user, everybody else only themselves.
const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return { id: { equals: user.id } }
}

// Field-level access: only admins may set/change the role.
const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdmin(user)

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
    admin: ({ req: { user } }) => isAdmin(user),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // The very first user that registers becomes admin.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users' })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
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
