import {CollectionConfig} from "payload";


export const Monster: CollectionConfig = {
    slug: "monster",
    admin: {
        useAsTitle: "name"
    },
    access: {
        read: () => true
    },
    fields:  [
        {
            name: "name",
            type: "text",
            required: true
        },
        {
            name: "picture",
            type: "upload",
            relationTo: "media"
        },
        {
            name: "origin",
            type: "select",
            options: ["Movies", "other", "literary", "folk lore"]
        },
        {
            name: "description",
            type: "textarea"
        },
        {
            name: "artist",
            type: "relationship",
            relationTo: "artist",
            required: true,
        }
    ]
}