import type { Access, CollectionConfig } from 'payload'

// Logged-in users only see/edit their own notes. Admins see everything.
const ownNotes: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { owner: { equals: user.id } }
}

export const Notes: CollectionConfig = {
  slug: 'notes',
  admin: { useAsTitle: 'title' },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ownNotes,
    update: ownNotes,
    delete: ownNotes,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Never trust the client: the owner is always the logged-in user.
        if (operation === 'create' && req.user) data.owner = req.user.id
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'textarea' },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
      access: { update: () => false },
    },
  ],
}
