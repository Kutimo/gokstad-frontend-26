import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'text',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
  ],
}
