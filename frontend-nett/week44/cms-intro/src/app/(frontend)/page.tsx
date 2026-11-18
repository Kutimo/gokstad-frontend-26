import {getPayload} from "payload";
import config from "@payload-config"
import RenderBlocks from "@/components/blocks/RenderBlocks";
import {notFound} from "next/navigation";

export default async function HomePage() {

    const payload = await getPayload({config})

    const { docs } = await payload.find({
        collection: "pages",
        where: { slug: { equals: "home"}},
        limit: 1, 
        depth: 1
    })

    const page = docs[0]

    if (!page) return notFound()
    
  return <RenderBlocks blocks={page.layout} />
}
