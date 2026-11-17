import {Block} from "payload";


export const Text: Block = {
    slug: "text",
    interfaceName: "Text",
    labels: {
        singular: "Text",
        plural: "Texts"
    },
    admin: {
        group: "Content"
    },
    fields: [
        {
            name: "heading",
            type: "text"
        },
        {
            name: "body",
            type: "textarea",
            required: true
        }
    ]
}