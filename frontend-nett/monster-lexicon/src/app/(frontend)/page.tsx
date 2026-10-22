import {getPayload} from "payload";
import config from "@payload-config"
import Link from "next/link";

export default async function HomePage() {
    const payload = await getPayload({config})
    const {docs: monster} = await payload.find({collection: "monster"})

    return (
        <main>
            <h1>Monster-Lexicon</h1>
            <ul>
                {monster.map((monster) => (
                    <li key={monster.id}>
                        <Link href={`/monster/${monster.id}`}>
                            {monster.name}
                        </Link>
                    </li>
                ))}
            </ul>

        </main>
    )
}
