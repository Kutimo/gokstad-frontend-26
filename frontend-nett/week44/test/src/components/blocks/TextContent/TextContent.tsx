import type { TextBlock } from '@/payload-types'
import styles from './TextContent.module.css'

export default function TextContent({ heading, body }: TextBlock) {
  return (
    <section className={styles.text}>
      {heading && <h2>{heading}</h2>}
      <p>{body}</p>
    </section>
  )
}
