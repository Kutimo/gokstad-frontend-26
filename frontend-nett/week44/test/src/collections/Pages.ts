import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used in the URL, e.g. "about". The front page must be "home".',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [],
      blockReferences: ['hero', 'text', 'cta'],
    },
  ],
}
