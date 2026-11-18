import type { Page } from '@/payload-types'
import Hero from './Hero/Hero'
import TextContent from './TextContent/TextContent'
import CallToAction from './CallToAction/CallToAction'

type Props = {
  blocks: Page['layout']
}

export default function RenderBlocks({ blocks }: Props) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block) => {
        switch (block.blockType) {
          case 'hero':
            return <Hero key={block.id} {...block} />
          case 'text':
            return <TextContent key={block.id} {...block} />
          case 'cta':
            return <CallToAction key={block.id} {...block} />
          default:
            return null
        }
      })}
    </>
  )
}
