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
        // components: "" TODO: Hero component
    }
}