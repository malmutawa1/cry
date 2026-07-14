import { Fragment, useMemo, type ElementType } from 'react'

interface RevealProps {
  /** Short heading text — reserved for headlines, not long paragraphs. */
  text: string
  /** Element to render (h1, h2, div, span…). */
  as?: ElementType
  className?: string
  /** ms before the first word appears */
  start?: number
  /** ms between each word (keep small: 30–55ms) */
  step?: number
}

/**
 * Word-by-word entrance for short headings.
 * Follows the motion guidelines: transform + opacity only, ease-out, small
 * per-word stagger, and disabled under prefers-reduced-motion (see styles.css).
 */
export default function Reveal({ text, as: Tag = 'span', className, start = 80, step = 52 }: RevealProps) {
  const words = useMemo(() => text.split(' ').filter(Boolean), [text])
  return (
    // key on text so switching language replays the reveal
    <Tag className={`reveal ${className ?? ''}`} key={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="reveal-w" style={{ '--d': `${start + i * step}ms` } as React.CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </Tag>
  )
}
