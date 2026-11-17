import type {Block} from "payload"

export const Hero: Block = {
    slug: "hero",
    interfaceName: "HeroBlock",
    labels: {
        singular: "Hero",
        plural: "heroes",
    },
    admin: {
        group: "layout",
        components: {
            Label: "/components/admin/HeroLabel#HeroLabel"
        }
    },
    fields: [
        {
            name: "heading",
            type: "text",
            required: true
        },
        {
            name: "subheading",
            type: "text",
        },
        {
            name: "image",
            type: "upload",
            relationTo: "media"
        }
    ]
}