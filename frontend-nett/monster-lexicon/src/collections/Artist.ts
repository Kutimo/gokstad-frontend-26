import {CollectionConfig} from "payload";


export const Artist: CollectionConfig = {
    slug: 'artist',
    admin: {
        useAsTitle: "name"
    },
    access: {
        read: () => true,
    },
    fields: [
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
            name: "nationality",
            type: "text"
        },
        {
            name: "biography",
            type: "textarea"
        }
    ]
}