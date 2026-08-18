import { useEffect, useRef } from 'react'
import type { CSSProperties, ElementType, PointerEvent as ReactPointerEvent } from 'react'
import { gsap } from 'gsap'
import './MaskedHeading.css'

type Props = { text: string; src: string; tag?: ElementType; reveal?: 'rise'|'wipe'|'fade'|'none'; parallax?: number; drift?: number; className?: string; style?: CSSProperties }

export default function MaskedHeading({ text, src, tag: Tag = 'h2', reveal = 'rise', parallax = 18, drift = 8, className = '', style }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const fill = fillRef.current
    if (!fill || reveal === 'none' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const from = reveal === 'wipe' ? { clipPath: 'inset(0 100% 0 0)' } : reveal === 'fade' ? { opacity: 0 } : { yPercent: 115, opacity: 0 }
    const tween = gsap.fromTo(fill, from, { clipPath:'inset(0 0% 0 0)', yPercent:0, opacity:1, duration:1.05, ease:'power4.out' })
    return () => { tween.kill() }
  }, [reveal])
  useEffect(() => {
    const fill = fillRef.current
    if (!fill || !drift || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.to(fill, { backgroundPosition:`calc(50% + ${drift}px) calc(50% - ${drift/2}px)`, duration:4.2, repeat:-1, yoyo:true, ease:'sine.inOut' })
    return () => { tween.kill() }
  }, [drift])
  const move = (event: ReactPointerEvent<HTMLElement>) => {
    const fill = fillRef.current, root = rootRef.current
    if (!fill || !root || !parallax) return
    const rect = root.getBoundingClientRect(), x = ((event.clientX-rect.left)/rect.width-.5)*parallax, y = ((event.clientY-rect.top)/rect.height-.5)*parallax
    gsap.to(fill, { backgroundPosition:`calc(50% + ${-x}px) calc(50% + ${-y}px)`, duration:.45, overwrite:'auto' })
  }
  return <Tag ref={rootRef} className={`masked-heading ${className}`} style={style} onPointerMove={move} onPointerLeave={() => fillRef.current && gsap.to(fillRef.current,{backgroundPosition:'50% 50%',duration:.6})}>
    <span className="masked-heading__shadow" aria-hidden>{text}</span>
    <span ref={fillRef} className="masked-heading__fill" style={{backgroundImage:`url(${src})`}} aria-hidden>{text}</span>
    <span className="sr-only">{text}</span>
  </Tag>
}
