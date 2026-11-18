import type {  Page } from "@/payload-types"

import Hero from "./Hero/Hero"

type Props = {
    blocks: Page["layout"]
}

export default function RenderBlocks({blocks}: Props) {
    return (
        <>
            {blocks?.map((block) => {
                switch (block.blockType) {
                    case "hero":
                        return <Hero key={block.id} {...block} />
                    default:
                        return null
                }
            })}
        </>
    );
}