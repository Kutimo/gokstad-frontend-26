import Image from 'next/image'
import type { HeroBlock } from '@/payload-types'
import styles from './Hero.module.css'

export default function Hero({ heading, subheading, image }: HeroBlock) {
  // image is a Media object when depth >= 1, otherwise just an id
  const media = typeof image === 'object' ? image : null

  return (
    <section className={styles.hero}>
      {media?.url && (
        <Image
          className={styles.image}
          src={media.url}
          alt={media.alt}
          width={media.width ?? 1200}
          height={media.height ?? 600}
        />
      )}
      <div className={styles.content}>
        <h1>{heading}</h1>
        {subheading && <p>{subheading}</p>}
      </div>
    </section>
  )
}
