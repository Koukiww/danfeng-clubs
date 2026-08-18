import { useCallback, useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './ScrollExpand.css'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smoothstep = (from: number, to: number, value: number) => {
  const progress = clamp((value - from) / (to - from || 1e-6), 0, 1)
  return progress * progress * (3 - 2 * progress)
}

type Props = {
  src: string
  alt?: string
  title?: ReactNode
  scrollHint?: string
  startWidth?: number
  startHeight?: number
  mediaZoom?: number
  scrollDistance?: number
  holdDistance?: number
  overlayScrim?: number
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export default function ScrollExpand({
  src,
  alt = '',
  title,
  scrollHint = '',
  startWidth = 58,
  startHeight = 66,
  mediaZoom = 1.2,
  scrollDistance = .85,
  holdDistance = .12,
  overlayScrim = .52,
  children,
  className = '',
  style,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLImageElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  const applyProgress = useCallback((progress: number) => {
    const frame = frameRef.current
    const media = mediaRef.current
    if (!frame || !media) return
    const eased = smoothstep(0, 1, progress)
    const width = startWidth + (100 - startWidth) * eased
    const height = startHeight + (100 - startHeight) * eased
    frame.style.clipPath = `inset(${(100 - height) / 2}% ${(100 - width) / 2}% round ${24 * (1 - eased)}px)`
    media.style.transform = `scale(${mediaZoom + (1 - mediaZoom) * eased})`
    if (scrimRef.current) scrimRef.current.style.opacity = `${overlayScrim * eased}`
    if (titleRef.current) {
      const fade = smoothstep(.34, .78, progress)
      titleRef.current.style.opacity = `${1 - fade}`
      titleRef.current.style.transform = `translate3d(0, ${-30 * fade}px, 0) scale(${1 + .04 * fade})`
    }
    if (hintRef.current) {
      const fade = smoothstep(0, .12, progress)
      hintRef.current.style.opacity = `${1 - fade}`
    }
    if (overlayRef.current) {
      const reveal = smoothstep(.66, 1, progress)
      overlayRef.current.style.opacity = `${reveal}`
      overlayRef.current.style.transform = `translate3d(0, ${70 * (1 - reveal)}px, 0)`
    }
  }, [mediaZoom, overlayScrim, startHeight, startWidth])

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    const stage = stageRef.current
    if (!root || !track || !stage) return
    let frame = 0
    let current = 0
    let target = 0
    let stageHeight = window.innerHeight
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const measure = () => {
      stageHeight = window.innerHeight
      stage.style.height = `${stageHeight}px`
      track.style.height = `${stageHeight * (1 + scrollDistance + holdDistance)}px`
      target = clamp(-track.getBoundingClientRect().top / (stageHeight * scrollDistance), 0, 1)
      if (reduceMotion) current = target
      applyProgress(current)
    }
    const animate = () => {
      current += (target - current) * .13
      applyProgress(current)
      if (Math.abs(target - current) > .0005) frame = requestAnimationFrame(animate)
      else frame = 0
    }
    const onScroll = () => {
      target = clamp(-track.getBoundingClientRect().top / (stageHeight * scrollDistance), 0, 1)
      if (reduceMotion) { current = target; applyProgress(current) }
      else if (!frame) frame = requestAnimationFrame(animate)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [applyProgress, holdDistance, scrollDistance])

  return <div ref={rootRef} className={`scroll-expand ${className}`} style={style}>
    <div ref={trackRef} className="scroll-expand__track">
      <div ref={stageRef} className="scroll-expand__stage">
        <div ref={frameRef} className="scroll-expand__frame">
          <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false}/>
          <div ref={scrimRef} className="scroll-expand__scrim"/>
          <div ref={overlayRef} className="scroll-expand__overlay">{children}</div>
        </div>
        {title && <div ref={titleRef} className="scroll-expand__title">{title}</div>}
        {scrollHint && <div ref={hintRef} className="scroll-expand__hint"><span/>{scrollHint}<span/></div>}
      </div>
    </div>
  </div>
}
