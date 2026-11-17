import Link from 'next/link'
import type { CallToActionBlock } from '@/payload-types'
import styles from './CallToAction.module.css'

export default function CallToAction({ text, buttonLabel, page }: CallToActionBlock) {
  // page is a Page object when depth >= 1, otherwise just an id
  if (typeof page !== 'object') return null

  const href = page.slug === 'home' ? '/' : `/${page.slug}`

  return (
    <section className={styles.cta}>
      <p>{text}</p>
      <Link className={styles.button} href={href}>
        {buttonLabel}
      </Link>
    </section>
  )
}
