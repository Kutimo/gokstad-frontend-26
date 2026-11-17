import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import RenderBlocks from '@/components/blocks/RenderBlocks'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
        collection: 'pages',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
    })

    const page = docs[0]
    if (!page) return notFound()

    return <RenderBlocks blocks={page.layout} />
}