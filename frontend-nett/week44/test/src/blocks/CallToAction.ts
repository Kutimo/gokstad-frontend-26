import type { Block } from 'payload'

export const CallToAction: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  labels: {
    singular: 'Call to action',
    plural: 'Calls to action',
  },
  admin: {
    group: 'Content',
    disableBlockName: true,
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
    },
  ],
}
