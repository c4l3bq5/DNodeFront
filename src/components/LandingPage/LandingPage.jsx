import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, Play, Pause, Menu, X } from 'lucide-react'
import NetworkBackground from '../NetworkBackground/NetworkBackground'
import './LandingPage.css'

const CONTACT = 'contacto@dentalnode.app' // ← cambiar por el correo real
const PRICE = '$XX' // ← cambiar por el precio real
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const onScroll = (fn) => {
  fn(); addEventListener('scroll', fn, { passive: true }); addEventListener('resize', fn)
  return () => { removeEventListener('scroll', fn); removeEventListener('resize', fn) }
}

const NAV = [['#como', 'Cómo funciona'], ['#funciones', 'Funciones'], ['#sistema', 'Sistema'], ['#planes', 'Planes'], ['#faq', 'FAQ']]
const FLOATS = [
  [{ top: '24%', left: '6%' }, 'Cita confirmada', 'Agenda vinculada a Google Calendar'],
  [{ top: '30%', right: '6%' }, 'Expediente clínico', 'Fichas digitales y tratamientos'],
  [{ bottom: '27%', left: '9%' }, 'Stock bajo', 'Resina A2 · quedan 3 unidades'],
  [{ bottom: '22%', right: '8%' }, 'Cobro registrado', 'Factura enviada al paciente'],
]
const STATS = [['100% online', 'sin descargas'], ['14 días', 'de prueba gratis'], ['Gmail', 'recordatorios a pacientes']]
const STEPS = [
  ['Organiza tu agenda', 'Sincronizada con Google Calendar, sin cruces de horarios.',
    <><div className="ch"><u>Lun<br />12</u><u className="on">Mar<br />13</u><u>Mié<br />14</u><u>Jue<br />15</u></div><div className="ch"><u>9:00</u><u className="on">9:30</u><u>10:00</u></div></>],
  ['Presupuesta y cobra', 'Cada tratamiento con su presupuesto, su cobro y su factura.',
    <>{[['Limpieza dental', 'Pagado'], ['Resina · pieza 14', 'Pendiente'], ['Ortodoncia · cuota 3', 'Pendiente']].map(([a, b]) => <div className="rw" key={a}>{a}<b>{b}</b></div>)}</>],
  ['Controla tu inventario', 'Kárdex de egresos por doctor y alertas antes de quedarte sin material.',
    <>{[['Resina A2', '72%'], ['Anestesia', '45%'], ['Guantes', '16%']].map(([a, w]) => <div className="rw" key={a}>{a}<s style={{ '--w': w }} /></div>)}</>],
]
const MODULES = [
  ['Agenda', ['Sincronizada con Google Calendar', 'Recordatorios automáticos por correo', 'Sin cruces de horarios']],
  ['Fichas clínicas', ['Expediente digital del paciente', 'Tratamientos registrados', 'Historial en un solo lugar']],
  ['Presupuestos y cobros', ['Presupuesto por paciente', 'Seguimiento de cobros', 'Pagos a tiempo']],
  ['Inventario y kárdex', ['Kárdex de egresos', 'Egresos de materiales por doctor', 'Control de stock']],
  ['Facturas', ['Facturas de tus tratamientos', 'Ligadas al paciente y al cobro', 'Todo registrado una sola vez']],
  ['IA de apoyo', ['Te ayuda a detectar a tiempo', 'Hallazgos para que los revises', 'La decisión clínica sigue siendo tuya']],
]
const CYCLE = [
  ['Agendar', 'Tu agenda, sincronizada', 'Citas en Google Calendar y recordatorios automáticos por correo, sin cruces de horarios.'],
  ['Atender', 'Cada paciente, en su ficha', 'Expediente digital con tratamientos e historial, listo en el consultorio.'],
  ['Cobrar', 'Presupuestos y cobros a tiempo', 'Del presupuesto al cobro y a la factura, sin perder el hilo.'],
  ['Reponer', 'Inventario bajo control', 'Kárdex de egresos por doctor y alertas antes de quedarte sin material.'],
]
const HUB = [
  ['Agenda', 100, 60, 'Cita confirmada', ['Google Calendar', 'Recordatorio por correo', 'Ficha del paciente']],
  ['Fichas', 420, 60, 'Tratamiento registrado', ['Presupuesto', 'Historial clínico', 'Apoyo de IA']],
  ['Facturas', 100, 300, 'Cobro registrado', ['Factura', 'Saldo del paciente', 'Reporte de ingresos']],
  ['Inventario', 420, 300, 'Material usado', ['Egreso por doctor', 'Costo del tratamiento', 'Alerta de stock']],
]
const PLAN = ['Agenda sincronizada con Google Calendar', 'Recordatorios automáticos por correo', 'Fichas clínicas de pacientes', 'Presupuestos y cobros', 'Facturas', 'Inventario con kárdex de egresos', 'IA de apoyo a la detección', 'Soporte técnico']
const FAQS = [
  ['¿Qué incluye el plan Consultorio y para quién está pensado?', 'El plan Consultorio está diseñado para odontólogos independientes o consultorios pequeños de 1 a 3 doctores. Incluye gestión digital de pacientes, agenda vinculada a Google Calendar, fichas clínicas, presupuestos, contratos digitales, control de cobros e inventario básico. Todo lo que necesitas para digitalizar tu práctica sin complejidad.'],
  ['¿Qué ventajas ofrece el plan Clínica?', 'El plan Clínica está pensado para centros odontológicos en crecimiento. Permite administrar múltiples sucursales y sillones con odontólogos ilimitados. Incluye roles de acceso avanzados (Director, Odontólogo, Recepción), alertas automáticas de stock mínimo, reportes detallados de productividad e ingresos por doctor, recordatorios automáticos por correo Gmail y soporte técnico prioritario.'],
  ['¿Cómo funciona la sincronización con Google Calendar?', 'Tu agenda queda vinculada a Google Calendar en tiempo real, con vista por médico y consultorio. Las citas se ven en ambos lugares sin cruces de horarios ni duplicidades, y puedes consultar tu jornada desde la app que ya usas.'],
  ['¿Cómo me ayuda el módulo de Inventario y Kárdex?', 'El módulo te da control total de tus materiales. Supervisa el stock disponible con alertas de stock mínimo para evitar desabastecimientos. El Kárdex de egresos registra cada salida de material vinculada al odontólogo con fecha exacta, facilitando la auditoría de materiales utilizados por profesional.'],
  ['¿Cómo funcionan los recordatorios por correo Gmail?', 'El sistema envía notificaciones automáticas por correo electrónico a los pacientes antes de su consulta, confirmando la fecha y hora. Esto ayuda a reducir las ausencias y retrasos sin que tengas que hacer nada manualmente.'],
  ['¿Los datos de mis pacientes están protegidos y respaldados?', 'Totalmente. Empleamos encriptación segura SSL/TLS, autenticación JWT y servidores seguros de alta disponibilidad con copias de seguridad automáticas diarias. Solo tu clínica tiene acceso exclusivo a tu información.'],
  ['¿Puedo probar el sistema antes de pagar?', '¡Por supuesto! Cuentas con 14 días de prueba gratuita con acceso a todas las funcionalidades principales, sin necesidad de ingresar una tarjeta de crédito ni adquirir compromisos forzosos.'],
  ['¿Funciona desde mi celular, tablet o laptop?', 'Sí. DentalNode es una plataforma 100% online que funciona en cualquier dispositivo a través del navegador web, ya sean computadoras, laptops, tablets o teléfonos celulares, sin necesidad de descargas ni instalaciones.'],
  ['¿Qué tipo de soporte técnico ofrecen?', 'Ofrecemos soporte técnico instantáneo vía WhatsApp y correo electrónico para ayudarte con la configuración inicial, la resolución de dudas y la puesta en marcha de la plataforma.'],
]

const Logo = ({ className = '', style }) => <i className={`lg ${className}`} style={style} role="img" aria-label="DentalNode" />

function Navbar({ theme, toggle }) {
  const [open, setOpen] = useState(false)
  const dark = theme === 'dark'
  return (
    <nav className={open ? 'open' : ''}>
      <a href="#" aria-label="DentalNode" onClick={() => setOpen(false)}><Logo /></a>
      <div className="nl">{NAV.map(([h, t]) => <a key={h} href={h}>{t}</a>)}</div>
      <div className="nr">
        <button className="tb" onClick={toggle} aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <a className="btn b2 nav-login" href="https://app.dentalnode.com">Iniciar sesión</a>
        <a className="btn b1 nav-cta" href="#planes">Probar gratis</a>
        <button
          className="tb nav-menu"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open && (
        <div className="nm">
          {NAV.map(([h, t]) => <a key={h} href={h} onClick={() => setOpen(false)}>{t}</a>)}
          <a href="https://app.dentalnode.com" onClick={() => setOpen(false)}>Iniciar sesión</a>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  const ref = useRef(null)
  useEffect(() => onScroll(() => {
    const el = ref.current
    el.style.setProperty('--p', clamp(scrollY / (el.offsetHeight - innerHeight)))
  }), [])
  return (
    <header className="hw" ref={ref}>
      <div className="hs"><div className="hc">
        <NetworkBackground />
        {FLOATS.map(([pos, t, d]) => <div className="fc up" style={pos} key={t}><b>{t}</b><span>{d}</span></div>)}
        <div className="hi up">
          <h1>Llena tu agenda, cobra a tiempo y digitaliza tu clínica dental</h1>
          <p>Agenda, fichas, presupuestos, cobros e inventario en un solo lugar. Con IA que te ayuda a detectar a tiempo.</p>
          <a className="btn b1" href="#planes">Probar 14 días gratis</a>
          <a className="btn b2" href="#contacto">Agendar una demo</a>
        </div>
        <div className="st">{STATS.map(([b, t]) => <div key={b}><b>{b}</b>{t}</div>)}</div>
      </div></div>
    </header>
  )
}

const Steps = () => (
  <section className="s" id="como"><div className="w c">
    <h2>Empezar es fácil</h2><p>Tu clínica funcionando en tres pasos.</p>
    <div className="g3">{STEPS.map(([t, d, il], i) => (
      <div className="cd" key={t}><i>{i + 1}</i><h3>{t}</h3><p>{d}</p><div className="il">{il}</div></div>
    ))}</div>
  </div></section>
)

const Modules = () => (
  <section className="s" id="funciones"><div className="w">
    <div className="c"><h2>Lo que tu clínica necesita, en un solo sistema</h2><p>Pensado para odontólogos, desde la primera cita hasta el último material.</p></div>
    <div className="mg">{MODULES.map(([t, li]) => <div key={t}><h3>{t}</h3><ul>{li.map((x) => <li key={x}>{x}</li>)}</ul></div>)}</div>
  </div></section>
)

function Cycle() {
  const ref = useRef(null), arc = useRef(null), dot = useRef(null)
  const [s, setS] = useState(0)
  useEffect(() => onScroll(() => {
    const el = ref.current
    const p = clamp(-el.getBoundingClientRect().top / (el.offsetHeight - innerHeight))
    const a = ((-90 + p * 270) * Math.PI) / 180
    arc.current.style.strokeDashoffset = 1445 * (1 - p * 0.75)
    dot.current.setAttribute('cx', 260 + 230 * Math.cos(a))
    dot.current.setAttribute('cy', 260 + 230 * Math.sin(a))
    setS(Math.round(p * 3))
  }), [])
  return (
    <div className="cw" id="ciclo" ref={ref}><div className="cs"><div className="rg">
      <svg viewBox="0 0 520 520">
        <circle cx="260" cy="260" r="230" fill="none" stroke="var(--ln)" strokeWidth="1.5" />
        <circle ref={arc} cx="260" cy="260" r="230" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="1445" strokeDashoffset="1445" transform="rotate(-90 260 260)" />
        <circle ref={dot} cx="260" cy="30" r="9" fill="var(--btn)" />
      </svg>
      {CYCLE.map(([l], i) => <span key={l} className={`lb lb-${i}${i === s ? ' on' : ''}`}>{l}</span>)}
      <div className="ct" key={s}><h3>{CYCLE[s][1]}</h3><p>{CYCLE[s][2]}</p></div>
    </div></div></div>
  )
}

const Trust = () => (
  <section className="s" id="confianza"><div className="w">
    <div className="c"><h2>Así se vive en una clínica</h2></div>
    <div className="tg">
      <div className="q">
        <p>“La sincronización de la agenda con Google Calendar y el envío de recordatorios automáticos por correo nos ayudaron a organizar las consultas sin cruces de horarios. Ahora tenemos un control claro de las citas, los egresos de materiales de cada doctor y los presupuestos de los pacientes en un solo lugar.”</p>
        <small>Clínica dental usuaria de DentalNode</small>
      </div>
      <div><b>14 días</b><span>de prueba gratis</span></div>
      <div><b>100%</b><span>online, sin instalar nada</span></div>
      <div><b>Google</b><span>Calendar sincronizado</span></div>
      <div className="d">Aquí va el logo<br />de tu clínica</div>
    </div>
  </div></section>
)

function Hub() {
  const [a, setA] = useState(0), [paused, setPaused] = useState(reduce), dot = useRef(null)
  useEffect(() => {
    let raf; const t0 = performance.now()
    const tick = (n) => {
      const k = clamp((n - t0) / 1000), e = 1 - (1 - k) ** 3
      dot.current.setAttribute('cx', 260 + (HUB[a][1] - 260) * e)
      dot.current.setAttribute('cy', 180 + (HUB[a][2] - 180) * e)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [a])
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setA((x) => (x + 1) % 4), 3400)
    return () => clearInterval(id)
  }, [paused, a])
  const [, , , title, chips] = HUB[a]
  return (
    <section className="s" id="sistema" style={{ background: 'var(--sand)' }}><div className="w hg">
      <div>
        <h2>Un dato, todo el sistema</h2>
        <p style={{ marginTop: 18 }}>Registras una vez y DentalNode lo lleva a donde corresponde. Toca un módulo para ver qué se actualiza.</p>
        <ul><li>Nada se captura dos veces</li><li>Agenda, ficha, cobro e inventario siempre coinciden</li><li>Cada doctor ve lo suyo</li></ul>
        <a className="btn b1" href="#planes">Probar 14 días gratis</a>
      </div>
      <div className="hb">
        <svg viewBox="0 0 520 360" role="img" aria-label="Diagrama: Agenda, Fichas, Facturas e Inventario conectados al centro de DentalNode">
          <g className="ln"><path d="M260 180L100 60M260 180L420 60M260 180L100 300M260 180L420 300" /></g>
          <circle cx="260" cy="180" r="46" fill="var(--sf)" stroke="var(--ln)" strokeWidth="1.5" />
          <circle cx="260" cy="180" r="22" fill="none" stroke="var(--tl)" strokeWidth="7" />
          <circle cx="260" cy="180" r="7" fill="var(--ink)" />
          {HUB.map(([n, x, y], i) => (
            <g key={n} className={'pk' + (i === a ? ' on' : '')} onClick={() => setA(i)}>
              <rect x={x - 60} y={y - 22} width="120" height="44" rx="22" /><text x={x} y={y + 5}>{n}</text>
            </g>
          ))}
          <circle ref={dot} cx="260" cy="180" r="7" fill="var(--btn)" />
        </svg>
        <div className="cp">{title} actualiza: {chips.map((c) => <em key={c}>✓ {c}</em>)}
          <button onClick={() => setPaused(!paused)} aria-label={paused ? 'Reanudar' : 'Pausar'}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
        </div>
      </div>
    </div></section>
  )
}

const Pricing = () => (
  <section className="s" id="planes"><div className="w">
    <div className="c"><h2>¿Cuánto cuesta?</h2><p>Un plan simple para tu clínica. Pruébalo 14 días sin pagar.</p></div>
    <div className="pl">
      <div>
        <div><h3>Plan DentalNode</h3><strong>{PRICE}<small> /mes</small></strong><p>14 días de prueba gratis</p><a className="btn b1" href="https://app.dentalnode.com">Comenzar prueba gratis</a></div>
        <div><ul>{PLAN.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
      <div className="f"><div><b>¿Varios doctores o sedes?</b><p>Cuéntanos tu caso y armamos un plan a tu medida.</p></div><a className="btn b2" href="#contacto">Escribirnos</a></div>
    </div>
  </div></section>
)

function Contact() {
  const [f, setF] = useState({ n: '', k: '', e: '', m: '' })
  const on = (k) => (ev) => setF({ ...f, [k]: ev.target.value })
  const send = (ev) => {
    ev.preventDefault()
    const body = `Hola, soy ${f.n}${f.k ? ' de ' + f.k : ''}.\n\n${f.m}\n\nMi correo: ${f.e}`
    location.href = `mailto:${CONTACT}?subject=${encodeURIComponent('Quiero una demo de DentalNode')}&body=${encodeURIComponent(body)}`
  }
  return (
    <section className="s" id="contacto" style={{ background: 'var(--sand)' }}><div className="w cg">
      <div><h2>Cuéntanos de tu clínica</h2><p style={{ marginTop: 18 }}>Redacta tu mensaje y se abrirá tu correo con todo listo para enviar. Te respondemos para agendar tu demo.</p></div>
      <form onSubmit={send}>
        <input placeholder="Tu nombre" required autoComplete="name" value={f.n} onChange={on('n')} />
        <input placeholder="Nombre de tu clínica" value={f.k} onChange={on('k')} />
        <input type="email" placeholder="Tu correo" required autoComplete="email" value={f.e} onChange={on('e')} />
        <textarea placeholder="¿Qué te gustaría resolver? Agenda, cobros, inventario…" value={f.m} onChange={on('m')} />
        <button className="btn b1" type="submit">Redactar correo</button>
      </form>
    </div></section>
  )
}

const Faq = () => (
  <section className="s" id="faq"><div className="w">
    <div className="c"><h2>Preguntas frecuentes</h2></div>
    <div className="fq">{FAQS.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
  </div></section>
)

const Footer = () => (
  <footer>
    <div className="t"><div className="w">
      <div className="r"><Logo style={{ width: 96, height: 84 }} /><a className="btn b1" href="#planes">Probar 14 días gratis</a></div>
      <div className="fl">
        <h3>Una clínica dental completamente digital</h3>
        <ul><h4>Producto</h4><li><a href="#como">Cómo funciona</a></li><li><a href="#funciones">Funciones</a></li><li><a href="#planes">Planes</a></li></ul>
        <ul><h4>Ayuda</h4><li><a href="#faq">Preguntas frecuentes</a></li><li><a href="#contacto">Contacto</a></li><li><a href="https://app.dentalnode.com">Iniciar sesión</a></li></ul>
        <ul><h4>Legal</h4><li><a href="#">Privacidad</a></li><li><a href="#">Términos de servicio</a></li></ul>
      </div>
    </div></div>
    <div className="bt"><Logo /><div className="w"><span>© 2026 DentalNode</span><span>Español</span></div></div>
  </footer>
)

export default function LandingPage() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try { localStorage.setItem('dn-theme', next) } catch { /* sin almacenamiento */ }
  }
  return (
    <>
      <Navbar theme={theme} toggle={toggle} />
      <Hero /><Steps /><Modules /><Cycle /><Trust /><Hub /><Pricing /><Contact /><Faq /><Footer />
    </>
  )
}