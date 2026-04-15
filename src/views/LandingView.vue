<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

/* ── Typed headline animation ── */
const headlines = [
  'Coaching that stays focused.',
  'Learning that never stops.',
  'Growth you can measure.',
  'Results you can see.'
]
const activeHeadline = ref(0)
const typed = ref('')
const showCursor = ref(true)
let typeTimer: number | undefined

function typeLoop() {
  const text = headlines[activeHeadline.value] ?? ''
  let i = 0
  const typeSpeed = 55
  const deleteSpeed = 30
  const hold = 2200

  function typeChar() {
    if (i <= text.length) {
      typed.value = text.slice(0, i)
      i++
      typeTimer = window.setTimeout(typeChar, typeSpeed)
    } else {
      typeTimer = window.setTimeout(deleteChar, hold)
    }
  }

  function deleteChar() {
    if (i > 0) {
      i--
      typed.value = text.slice(0, i)
      typeTimer = window.setTimeout(deleteChar, deleteSpeed)
    } else {
      activeHeadline.value = (activeHeadline.value + 1) % headlines.length
      typeTimer = window.setTimeout(typeLoop, 400)
    }
  }

  typeChar()
}

/* ── Floating orbs ── */
interface Orb { x: number; y: number; size: number; dx: number; dy: number; hue: number }
const orbs = ref<Orb[]>([])
let animFrame: number | undefined
let canvas: HTMLCanvasElement | null = null

function initOrbs() {
  canvas = document.getElementById('orb-canvas') as HTMLCanvasElement
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  function resize() {
    if (!canvas) return
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    ctx!.scale(dpr, dpr)
  }
  resize()
  window.addEventListener('resize', resize)

  const orbData: Orb[] = Array.from({ length: 6 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 180 + Math.random() * 280,
    dx: (Math.random() - 0.5) * 0.35,
    dy: (Math.random() - 0.5) * 0.35,
    hue: 200 + Math.random() * 80
  }))

  function draw() {
    if (!canvas || !ctx) return
    const w = window.innerWidth
    const h = window.innerHeight
    ctx.clearRect(0, 0, w, h)

    for (const o of orbData) {
      o.x += o.dx
      o.y += o.dy
      if (o.x < -o.size) o.x = w + o.size
      if (o.x > w + o.size) o.x = -o.size
      if (o.y < -o.size) o.y = h + o.size
      if (o.y > h + o.size) o.y = -o.size

      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.size)
      g.addColorStop(0, `hsla(${o.hue}, 80%, 60%, 0.18)`)
      g.addColorStop(0.5, `hsla(${o.hue}, 70%, 50%, 0.06)`)
      g.addColorStop(1, `hsla(${o.hue}, 60%, 40%, 0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2)
      ctx.fill()
    }

    animFrame = requestAnimationFrame(draw)
  }

  draw()
}

/* ── Scroll reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal')
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          observer.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  els.forEach((el) => observer.observe(el))
}

/* ── Counter animation ── */
const stats = ref([
  { label: 'Students', value: 0, target: 500, suffix: '+' },
  { label: 'Batches', value: 0, target: 50, suffix: '+' },
  { label: 'Success Rate', value: 0, target: 98, suffix: '%' },
  { label: 'Years', value: 0, target: 5, suffix: '+' }
])

function animateCounters() {
  stats.value.forEach((s) => {
    let start = 0
    const step = Math.max(1, Math.floor(s.target / 60))
    function tick() {
      start += step
      if (start >= s.target) {
        s.value = s.target
        return
      }
      s.value = start
      requestAnimationFrame(tick)
    }
    tick()
  })
}

const highlights = [
  {
    icon: '🎯',
    title: 'Personalized Coaching',
    description: 'Tailored learning paths designed for every individual student\'s unique needs and pace.'
  },
  {
    icon: '🧠',
    title: 'AI-Powered Insights',
    description: 'Smart analytics that track progress and identify areas of improvement automatically.'
  },
  {
    icon: '📊',
    title: 'Real-Time Progress',
    description: 'Crystal clear reporting dashboards that keep everyone aligned and informed.'
  },
  {
    icon: '🤝',
    title: 'Connected Ecosystem',
    description: 'Seamlessly link students, parents, and coaches in one unified platform.'
  }
]

const testimonials = [
  { name: 'Priya Sharma', role: 'Parent', quote: 'My child\'s confidence has grown immensely since joining. The personalized attention is remarkable.' },
  { name: 'Rahul Verma', role: 'Student', quote: 'The tracking system keeps me motivated. I can see exactly where I\'m improving.' },
  { name: 'Dr. Anita Gupta', role: 'Coach', quote: 'Managing batches and students has never been this streamlined. Truly a game-changer.' }
]

onMounted(() => {
  typeLoop()
  initOrbs()
  initScrollReveal()
  setTimeout(animateCounters, 800)
})

onUnmounted(() => {
  if (typeTimer) clearTimeout(typeTimer)
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div class="landing">
    <!-- Background canvas for floating orbs -->
    <canvas id="orb-canvas" class="orb-canvas"></canvas>

    <!-- ── Navbar ── -->
    <header class="navbar">
      <div class="navbar__inner">
        <div class="brand">
          <div class="brand__mark">
            <span class="brand__icon">🐻‍❄️</span>
          </div>
          <div>
            <p class="brand__name">Tardigrade</p>
            <p class="brand__tag">Coaching Platform</p>
          </div>
        </div>
        <nav class="nav">
          <a href="#features" class="nav__link">Features</a>
          <a href="#stats" class="nav__link">Impact</a>
          <a href="#testimonials" class="nav__link">Stories</a>
          <RouterLink to="/login" class="nav__cta">
            <span>Get Started</span>
            <span class="nav__cta-arrow">→</span>
          </RouterLink>
        </nav>
      </div>
    </header>

    <!-- ── Hero ── -->
    <section class="hero">
      <div class="hero__particles">
        <span v-for="i in 20" :key="i" class="particle" :style="{
          '--delay': (Math.random() * 6) + 's',
          '--x': (Math.random() * 100) + '%',
          '--size': (3 + Math.random() * 5) + 'px',
          '--dur': (8 + Math.random() * 12) + 's'
        }"></span>
      </div>
      <div class="hero__content reveal">
        <div class="hero__badge">
          <span class="pulse-dot"></span>
          <span>Now enrolling for 2026 batches</span>
        </div>
        <h1 class="hero__title">
          <span class="hero__typed">{{ typed }}<span class="cursor" :class="{ blink: showCursor }">|</span></span>
        </h1>
        <p class="hero__body">
          A modern, structured coaching platform that connects students, parents, and coaches
          in one seamless ecosystem. Built for the way learning works today.
        </p>
        <div class="hero__actions">
          <RouterLink to="/login" class="btn btn--primary btn--glow">
            <span>Start Learning</span>
            <span class="btn__shimmer"></span>
          </RouterLink>
          <a href="#features" class="btn btn--glass">
            <span>Explore Features</span>
            <span>↓</span>
          </a>
        </div>
      </div>
      <div class="hero__visual reveal">
        <div class="hero__card-stack">
          <div class="float-card float-card--1">
            <div class="float-card__icon">📈</div>
            <div>
              <p class="float-card__label">Student Progress</p>
              <p class="float-card__value">+23% this month</p>
            </div>
          </div>
          <div class="float-card float-card--2">
            <div class="float-card__icon">✅</div>
            <div>
              <p class="float-card__label">Assignments</p>
              <p class="float-card__value">12/12 Complete</p>
            </div>
          </div>
          <div class="float-card float-card--3">
            <div class="float-card__icon">🏆</div>
            <div>
              <p class="float-card__label">Class Rank</p>
              <p class="float-card__value">#2 of 45</p>
            </div>
          </div>
          <div class="hero__orbit">
            <div class="orbit-ring orbit-ring--1"></div>
            <div class="orbit-ring orbit-ring--2"></div>
            <div class="orbit-ring orbit-ring--3"></div>
            <div class="orbit-dot orbit-dot--1"></div>
            <div class="orbit-dot orbit-dot--2"></div>
            <div class="orbit-dot orbit-dot--3"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Stats counter ── -->
    <section id="stats" class="stats-section reveal">
      <div class="stats-row">
        <div v-for="s in stats" :key="s.label" class="stat-block">
          <p class="stat-block__number">{{ s.value }}{{ s.suffix }}</p>
          <p class="stat-block__label">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- ── Features ── -->
    <section id="features" class="features-section">
      <div class="section__header reveal">
        <p class="section__eyebrow">Why Tardigrade?</p>
        <h2>Everything you need to<br /><span class="gradient-text">supercharge learning.</span></h2>
        <p class="section__sub">A platform designed with care, built for results.</p>
      </div>
      <div class="feature-grid">
        <article v-for="(item, idx) in highlights" :key="item.title" class="feature-card reveal" :style="{ '--delay': (idx * 120) + 'ms' }">
          <div class="feature-card__glow"></div>
          <div class="feature-card__icon">{{ item.icon }}</div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <!-- ── Testimonials ── -->
    <section id="testimonials" class="testimonials-section">
      <div class="section__header reveal">
        <p class="section__eyebrow">Real stories</p>
        <h2>Loved by students,<br /><span class="gradient-text">parents & coaches.</span></h2>
      </div>
      <div class="testimonial-grid">
        <div v-for="(t, idx) in testimonials" :key="t.name" class="testimonial-card reveal" :style="{ '--delay': (idx * 150) + 'ms' }">
          <p class="testimonial-card__quote">"{{ t.quote }}"</p>
          <div class="testimonial-card__author">
            <div class="testimonial-card__avatar">{{ t.name.charAt(0) }}</div>
            <div>
              <p class="testimonial-card__name">{{ t.name }}</p>
              <p class="testimonial-card__role">{{ t.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA ── -->
    <section class="cta-section reveal">
      <div class="cta-glow cta-glow--1"></div>
      <div class="cta-glow cta-glow--2"></div>
      <div class="cta-content">
        <h2>Ready to transform learning?</h2>
        <p>Join hundreds of students already thriving on Tardigrade.</p>
        <RouterLink to="/login" class="btn btn--primary btn--glow btn--lg">
          <span>Get Started — It's Free</span>
          <span class="btn__shimmer"></span>
        </RouterLink>
      </div>
    </section>

    <!-- ── Footer ── -->
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <div class="brand__mark brand__mark--sm">🐻‍❄️</div>
          <p class="footer__title">Tardigrade Coaching</p>
        </div>
        <p class="footer__tag">Focused learning. Visible progress. Beautiful results.</p>
        <p class="footer__copy">© 2026 Tardigrade. Crafted with ❤️</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── Base ─────────────────────────────────────────── */
.landing {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #060918;
  color: #e2e8f0;
  font-family: 'Inter', 'Manrope', sans-serif;
  overflow-x: hidden;
}

.orb-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* ── Scroll reveal ── */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--delay, 0ms);
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ── Gradient text ── */
.gradient-text {
  background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Navbar ───────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(6, 9, 24, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.navbar__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
}

.brand__mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  display: grid;
  place-items: center;
  font-size: 22px;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.brand__mark--sm {
  width: 32px;
  height: 32px;
  font-size: 16px;
  border-radius: 8px;
}

.brand__icon { line-height: 1; }

.brand__name {
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.3px;
  color: #f8fafc;
}

.brand__tag {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav {
  display: flex;
  align-items: center;
  gap: 28px;
  z-index: 1;
  flex-wrap: wrap;
}

.nav__link {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
  text-decoration: none;
}

.nav__link:hover { color: #f8fafc; }

.nav__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 4px 18px rgba(99, 102, 241, 0.35);
  transition: all 0.3s;
}

.nav__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(99, 102, 241, 0.5);
}

.nav__cta-arrow {
  transition: transform 0.3s;
}

.nav__cta:hover .nav__cta-arrow {
  transform: translateX(4px);
}

/* ── Hero ─────────────────────────────────────────── */
.hero {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 100px 32px 80px;
  z-index: 1;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 18px 6px 12px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  font-size: 13px;
  font-weight: 500;
  color: #a5b4fc;
  margin-bottom: 24px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
  70%  { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.hero__title {
  font-size: clamp(2.8rem, 5vw, 4.2rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -1.5px;
  color: #f8fafc;
  min-height: 2.4em;
}

.hero__typed {
  background: linear-gradient(135deg, #f8fafc 40%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cursor {
  -webkit-text-fill-color: #60a5fa;
  font-weight: 300;
}

.cursor.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.hero__body {
  margin-top: 20px;
  font-size: 17px;
  line-height: 1.7;
  color: #94a3b8;
  max-width: 500px;
}

.hero__actions {
  display: flex;
  gap: 16px;
  margin-top: 36px;
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 15px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.btn--primary {
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: #fff;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
}

.btn--glow::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(135deg, #6366f1, #06b6d4, #f472b6, #6366f1);
  background-size: 300% 300%;
  animation: glow-rotate 3s ease infinite;
  z-index: -1;
  filter: blur(12px);
  opacity: 0.5;
}

@keyframes glow-rotate {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.btn__shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { left: -100%; }
  100% { left: 200%; }
}

.btn--glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  backdrop-filter: blur(10px);
}

.btn--glass:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn--lg {
  padding: 18px 40px;
  font-size: 17px;
}

/* ── Hero visual — floating cards ── */
.hero__visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.hero__card-stack {
  position: relative;
  width: 100%;
  height: 400px;
}

.float-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.float-card__icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.12);
}

.float-card__label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.float-card__value {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
}

.float-card--1 {
  top: 20px;
  right: 10%;
  animation: float-1 6s ease-in-out infinite;
}

.float-card--2 {
  top: 45%;
  left: 5%;
  animation: float-2 7s ease-in-out infinite;
}

.float-card--3 {
  bottom: 30px;
  right: 15%;
  animation: float-3 8s ease-in-out infinite;
}

@keyframes float-1 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(1deg); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(-1.5deg); }
}

@keyframes float-3 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(1deg); }
}

/* ── Orbit rings ── */
.hero__orbit {
  position: absolute;
  inset: -20px;
  z-index: 0;
}

.orbit-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(99, 102, 241, 0.08);
}

.orbit-ring--1 {
  inset: 10%;
  animation: orbit-spin 25s linear infinite;
}

.orbit-ring--2 {
  inset: 25%;
  animation: orbit-spin 20s linear infinite reverse;
}

.orbit-ring--3 {
  inset: 40%;
  animation: orbit-spin 30s linear infinite;
}

@keyframes orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.orbit-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #818cf8;
  box-shadow: 0 0 10px rgba(129, 140, 248, 0.5);
}

.orbit-dot--1 {
  top: 10%;
  left: 50%;
  animation: orbit-dot-1 25s linear infinite;
  transform-origin: 0 180px;
}

.orbit-dot--2 {
  top: 25%;
  right: 25%;
  animation: orbit-dot-2 20s linear infinite reverse;
  transform-origin: -60px 100px;
}

.orbit-dot--3 {
  bottom: 40%;
  left: 40%;
  animation: orbit-dot-3 30s linear infinite;
  transform-origin: 40px -80px;
}

@keyframes orbit-dot-1 {
  from { transform: rotate(0deg) translateX(40px); }
  to { transform: rotate(360deg) translateX(40px); }
}

@keyframes orbit-dot-2 {
  from { transform: rotate(0deg) translateX(30px); }
  to { transform: rotate(360deg) translateX(30px); }
}

@keyframes orbit-dot-3 {
  from { transform: rotate(0deg) translateX(35px); }
  to { transform: rotate(360deg) translateX(35px); }
}

/* ── Particles ── */
.hero__particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: rgba(99, 102, 241, 0.4);
  border-radius: 50%;
  left: var(--x);
  bottom: -10px;
  animation: rise var(--dur) var(--delay) infinite linear;
}

@keyframes rise {
  0%   { transform: translateY(0) scale(1); opacity: 0; }
  10%  { opacity: 0.6; }
  90%  { opacity: 0.1; }
  100% { transform: translateY(-110vh) scale(0.3); opacity: 0; }
}

/* ── Stats counter ─────────────────────────────────── */
.stats-section {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 32px 60px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  padding: 40px;
}

.stat-block {
  text-align: center;
}

.stat-block__number {
  font-size: 42px;
  font-weight: 900;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-block__label {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 6px;
}

/* ── Features ─────────────────────────────────────── */
.features-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 32px;
}

.section__header {
  max-width: 600px;
  margin-bottom: 56px;
}

.section__eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 2px;
  color: #818cf8;
  font-weight: 700;
  margin-bottom: 12px;
}

.section__header h2 {
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.8px;
  color: #f8fafc;
}

.section__sub {
  margin-top: 14px;
  color: #94a3b8;
  font-size: 16px;
  line-height: 1.6;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.feature-card {
  position: relative;
  padding: 32px 28px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-6px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 20px 50px rgba(99, 102, 241, 0.12);
}

.feature-card__glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(99, 102, 241, 0.06), transparent 50%);
  opacity: 0;
  transition: opacity 0.4s;
}

.feature-card:hover .feature-card__glow {
  opacity: 1;
}

.feature-card__icon {
  font-size: 36px;
  margin-bottom: 18px;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #f1f5f9;
}

.feature-card p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
}

/* ── Testimonials ─────────────────────────────────── */
.testimonials-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px 80px;
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.testimonial-card {
  padding: 32px 28px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.4s;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  border-color: rgba(148, 163, 184, 0.18);
}

.testimonial-card__quote {
  font-size: 15px;
  line-height: 1.7;
  color: #cbd5e1;
  font-style: italic;
  margin-bottom: 22px;
}

.testimonial-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.testimonial-card__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
}

.testimonial-card__name {
  font-weight: 600;
  font-size: 14px;
  color: #f1f5f9;
}

.testimonial-card__role {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* ── CTA ──────────────────────────────────────────── */
.cta-section {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto 70px;
  padding: 72px 40px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(16px);
  text-align: center;
  overflow: hidden;
}

.cta-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
}

.cta-glow--1 {
  top: -200px;
  left: -100px;
  background: #6366f1;
}

.cta-glow--2 {
  bottom: -200px;
  right: -100px;
  background: #06b6d4;
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-content h2 {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #f8fafc;
  margin-bottom: 14px;
}

.cta-content p {
  color: #94a3b8;
  font-size: 16px;
  margin-bottom: 28px;
}

/* ── Footer ───────────────────────────────────────── */
.footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  padding: 40px 32px;
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.footer__title {
  font-weight: 700;
  font-size: 16px;
  color: #e2e8f0;
}

.footer__tag {
  color: #64748b;
  font-size: 13px;
}

.footer__copy {
  color: #475569;
  font-size: 12px;
  margin-top: 4px;
}

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 1024px) {
  .hero {
    gap: 40px;
    padding: 80px 28px 60px;
  }

  .hero__body {
    max-width: 100%;
  }

  .hero__visual {
    min-height: 360px;
  }

  .stats-section,
  .features-section,
  .testimonials-section {
    padding-left: 28px;
    padding-right: 28px;
  }
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 60px 20px 40px;
    gap: 40px;
  }

  .navbar__inner {
    padding: 14px 20px;
  }

  .nav__link { display: none; }

  .nav {
    gap: 16px;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-section,
  .testimonials-section {
    padding-left: 20px;
    padding-right: 20px;
  }

  .cta-section {
    margin-left: 20px;
    margin-right: 20px;
    padding: 50px 24px;
  }
}

@media (max-width: 600px) {
  .navbar__inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .nav {
    width: 100%;
    justify-content: space-between;
  }

  .nav__cta {
    width: 100%;
    justify-content: center;
  }

  .hero__title {
    font-size: 2rem;
  }

  .hero__actions {
    flex-direction: column;
  }

  .hero__actions .btn {
    width: 100%;
  }

  .hero__card-stack {
    height: auto;
    min-height: 260px;
  }

  .float-card {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    margin-bottom: 16px;
    animation: none;
  }

  .float-card {
    padding: 14px 16px;
  }

  .float-card__icon {
    font-size: 22px;
    width: 40px;
    height: 40px;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    padding: 24px;
    gap: 20px;
  }

  .stat-block__number {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .feature-grid,
  .testimonial-grid {
    grid-template-columns: 1fr;
  }

  .cta-section {
    padding: 42px 20px;
  }
}
</style>
