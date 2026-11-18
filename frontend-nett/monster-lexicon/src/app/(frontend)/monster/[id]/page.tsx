import {getPayload} from "payload";
import config from "@payload-config"
import {notFound} from "next/navigation";
import Link from "next/link";

export default async function MonsterPage({params}: { params: Promise<{ id: string }>}) {
    const payload = await getPayload({config})
    const {id } = await params

    const monster = await payload.findByID({
        collection: "monster",
        id: id,
        depth: 1
    })

    if (!monster) return notFound()

    const artist = typeof monster.artist === 'object' ? monster.artist : null

    return (
        <main>
            <h1>{monster.name}</h1>
            <p>Origin: {monster.origin}</p>
            {/* desc, image etc    */}

            {artist && (
                <p>
                    Created by:
                    <Link href={`/artist/${artist.id}`}>
                        {artist.name}
                    </Link>
                </p>
            )}

        </main>
    )
}