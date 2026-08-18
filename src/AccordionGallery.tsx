import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { gsap } from 'gsap'
import './AccordionGallery.css'

export type AccordionGalleryItem = { image: string; alt?: string }
type Props = { items: AccordionGalleryItem[]; defaultIndex?: number; height?: number; gap?: number; radius?: number; expandRatio?: number; accentColor?: string }

export default function AccordionGallery({ items, defaultIndex = 0, height = 380, gap = 8, radius = 2, expandRatio = .58, accentColor = '#fff' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const panels = useRef<(HTMLButtonElement|null)[]>([])
  const media = useRef<(HTMLSpanElement|null)[]>([])
  const timeline = useRef<gsap.core.Timeline|null>(null)
  const [active, setActive] = useState(Math.min(defaultIndex, Math.max(0, items.length - 1)))
  const count = items.length

  const layout = useCallback((animate = true) => {
    const ratio = Math.min(.9, Math.max(.2, expandRatio))
    const grow = count > 1 ? ratio * (count - 1) / (1 - ratio) : 1
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches || !animate ? 0 : .6
    timeline.current?.kill()
    const next = gsap.timeline()
    panels.current.forEach((panel, index) => {
      if (!panel) return
      const open = index === active
      next.to(panel, { flexGrow: open ? grow : 1, rotateY: open ? 0 : index < active ? 4 : -4, duration, ease:'power3.out' }, 0)
      if (media.current[index]) next.to(media.current[index], { xPercent:-50, yPercent:-50, x:open ? 0 : (active-index)*9, filter:`grayscale(${open ? 0 : .72}) brightness(${open ? 1 : .7})`, duration, ease:'power3.out' }, 0)
    })
    timeline.current = next
  }, [active, count, expandRatio])

  useEffect(() => { setActive(current => Math.min(current, Math.max(0, count - 1))) }, [count])
  useEffect(() => { layout(false) }, [layout])
  useEffect(() => () => { timeline.current?.kill() }, [])

  const keys = (index: number, event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); setActive((index + 1) % count) }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); setActive((index - 1 + count) % count) }
  }
  const style = { '--ag-gap':`${gap}px`, '--ag-radius':`${radius}px`, '--ag-accent':accentColor, height:`${height}px` } as CSSProperties
  if (!count) return null
  return <div ref={rootRef} className="accordion-gallery" style={style} role="list" aria-label="社团活动照片">
    {items.map((item, index) => <button key={`${item.image.slice(-18)}${index}`} ref={node => { panels.current[index] = node }} className={`ag-panel${index === active ? ' ag-panel--active' : ''}`} onMouseEnter={() => setActive(index)} onClick={() => setActive(index)} onFocus={() => setActive(index)} onKeyDown={event => keys(index,event)} role="listitem" aria-label={item.alt || `社团照片 ${index + 1}`}>
      <span className="ag-panel__frame"><span ref={node => { media.current[index] = node }} className="ag-panel__media"><img src={item.image} alt={item.alt || ''} draggable={false}/></span><span className="ag-panel__overlay"/></span>
    </button>)}
  </div>
}
