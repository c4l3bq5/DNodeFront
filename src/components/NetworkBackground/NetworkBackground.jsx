import { useEffect, useRef } from 'react'

// Nodos y partículas conectadas (HTML5 Canvas). color = "r,g,b"
export default function NetworkBackground({ color = '83,150,134', linkDist = 150 }) {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W, H, nodes = [], raf

    const init = () => {
      W = cv.width = cv.offsetWidth
      H = cv.height = cv.offsetHeight
      nodes = Array.from({ length: Math.round((W * H) / 20000) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      if (!still) nodes.forEach((n) => { n.x = (n.x + n.vx + W) % W; n.y = (n.y + n.vy + H) % H })
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
          if (d < linkDist) {
            ctx.strokeStyle = `rgba(${color},${0.4 * (1 - d / linkDist)})`
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke()
          }
        }
        ctx.fillStyle = `rgba(${color},.7)`
        ctx.beginPath(); ctx.arc(nodes[i].x, nodes[i].y, 2.4, 0, 7); ctx.fill()
      }
      if (!still) raf = requestAnimationFrame(draw)
    }

    const onResize = () => { init(); if (still) draw() }
    init(); draw()
    addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize) }
  }, [color, linkDist])

  return <canvas ref={ref} aria-hidden="true" />
}