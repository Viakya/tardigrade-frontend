<template>
  <div class="login-page reduced-motion">
    <!-- Aurora background -->
    <div class="aurora">
      <div class="aurora__band aurora__band--1"></div>
      <div class="aurora__band aurora__band--2"></div>
      <div class="aurora__band aurora__band--3"></div>
    </div>
    <div class="noise"></div>

    <!-- Stars -->
    <div class="stars">
      <span v-for="i in 28" :key="i" class="star" :style="{
        '--x': (Math.random() * 100) + '%',
        '--y': (Math.random() * 100) + '%',
        '--size': (1 + Math.random() * 2.5) + 'px',
        '--dur': (5 + Math.random() * 5) + 's',
        '--delay': (Math.random() * 4) + 's',
        '--brightness': (0.3 + Math.random() * 0.7)
      }"></span>
    </div>

    <!-- Main card -->
    <div
      class="login-shell"
      ref="shellRef"
    >
      <div class="shell__glow-border"></div>
      <div class="shell__inner">
        <!-- ── Left: Hero panel ── -->
        <aside class="hero-panel">
          <div class="hero-content">
            <!-- Centered logo + title -->
            <div class="brand-center">
              <div class="logo-area">
                <div class="logo-core">
                  <span class="logo-emoji">🐻‍❄️</span>
                </div>
                <div class="logo-pulse logo-pulse--1"></div>
                <div class="logo-pulse logo-pulse--2"></div>
                <div class="logo-pulse logo-pulse--3"></div>
              </div>
              <h1 class="hero-title anim-up" style="--d:0.1s">Tardigrade</h1>
              <p class="hero-subtitle anim-up" style="--d:0.2s">COACHING PLATFORM</p>
            </div>

            <!-- 3D Animated Book Scene -->
            <div class="book-scene anim-up" style="--d:0.35s">
              <div class="book-3d">
                <div class="book-spine"></div>
                <div class="book-cover book-cover--front">
                  <div class="book-cover__inner">
                    <span class="book-icon">📖</span>
                    <span class="book-label">Knowledge</span>
                  </div>
                </div>
                <div class="book-cover book-cover--back"></div>
                <!-- Animated pages -->
                <div class="book-page book-page--1"></div>
                <div class="book-page book-page--2"></div>
                <div class="book-page book-page--3"></div>
              </div>
              <!-- Floating elements around book -->
              <div class="float-el float-el--1">💡</div>
              <div class="float-el float-el--2">⭐</div>
              <div class="float-el float-el--3">🎯</div>
              <div class="float-el float-el--4">✨</div>
              <div class="float-el float-el--5">🧠</div>
              <!-- Light rays from book -->
              <div class="book-rays">
                <div class="ray ray--1"></div>
                <div class="ray ray--2"></div>
                <div class="ray ray--3"></div>
              </div>
            </div>

            <!-- Animated tagline -->
            <p class="hero-tagline anim-up" style="--d:0.5s">
              <span class="tagline-glow">Where learning comes alive</span>
            </p>

            <!-- Trust row -->
            <div class="trust-row anim-up" style="--d:0.6s">
              <div class="trust-pill" v-for="t in trustItems" :key="t.text">
                <span>{{ t.icon }}</span>
                <span>{{ t.text }}</span>
              </div>
            </div>
          </div>

          <!-- Floating orbiting particles -->
          <div class="hero-particles">
            <span v-for="i in 5" :key="i" class="h-particle" :style="{
              '--angle': (i * 72) + 'deg',
              '--dist': (70 + Math.random() * 40) + 'px',
              '--speed': (18 + Math.random() * 8) + 's',
              '--size': (3 + Math.random() * 4) + 'px',
              '--hue': (220 + Math.random() * 80)
            }"></span>
          </div>
        </aside>

        <!-- ── Right: Form panel ── -->
        <div class="form-panel">
          <div class="form-content">
            <div class="form-header anim-up" style="--d:0.15s">
              <h2>Welcome back</h2>
              <p>Sign in to continue to your dashboard</p>
            </div>

            <div v-if="authStore.error" class="error-alert">
              <span>⚠️</span>
              <span>{{ authStore.error }}</span>
            </div>

            <form @submit.prevent="handleSubmit" class="login-form">
              <div class="field anim-up" style="--d:0.25s">
                <label for="email">Email address</label>
                <div class="input-wrap" :class="{ focused: emailFocused }">
                  <span class="input-icon">✉️</span>
                  <input
                    id="email"
                    v-model="credentials.email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    :disabled="authStore.isLoading"
                    autocomplete="email"
                    @focus="emailFocused = true"
                    @blur="emailFocused = false"
                  />
                  <div class="input-glow"></div>
                </div>
              </div>

              <div class="field anim-up" style="--d:0.35s">
                <label for="password">Password</label>
                <div class="input-wrap" :class="{ focused: passFocused }">
                  <span class="input-icon">🔒</span>
                  <input
                    id="password"
                    v-model="credentials.password"
                    :type="showPass ? 'text' : 'password'"
                    required
                    placeholder="Enter your password"
                    :disabled="authStore.isLoading"
                    autocomplete="current-password"
                    @focus="passFocused = true"
                    @blur="passFocused = false"
                  />
                  <button type="button" class="eye-btn" @click="showPass = !showPass">
                    {{ showPass ? '🙈' : '👁️' }}
                  </button>
                  <div class="input-glow"></div>
                </div>
              </div>

              <button type="submit" class="btn-login anim-up" style="--d:0.45s" :disabled="authStore.isLoading">
                <span v-if="authStore.isLoading" class="spinner"></span>
                <span>{{ authStore.isLoading ? 'Signing in…' : 'Sign In' }}</span>
                <span class="btn-arrow">→</span>
                <div class="btn-shimmer"></div>
              </button>
            </form>

            <div v-if="isGoogleEnabled" class="divider anim-up" style="--d:0.5s">
              <span>or continue with</span>
            </div>

            <div v-if="isGoogleEnabled" class="google-wrap anim-up" style="--d:0.55s">
              <div ref="googleButtonRef" class="google-button"></div>
              <p v-if="googleError" class="google-error">{{ googleError }}</p>
            </div>

            <div class="role-section anim-up" style="--d:0.55s">
              <p class="role-label">Select your role</p>
              <div class="role-grid">
                <button
                  v-for="r in roles"
                  :key="r.key"
                  :class="['role-chip', { active: currentRole === r.key }]"
                  @click="switchRole(r.key)"
                  :disabled="authStore.isLoading"
                >
                  <span class="role-chip__icon">{{ r.icon }}</span>
                  <span class="role-chip__name">{{ r.key }}</span>
                  <div class="role-chip__glow"></div>
                </button>
              </div>
            </div>

            <div class="form-footer anim-up" style="--d:0.6s">
              <RouterLink to="/" class="back-link">← Back to home</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, reactive } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials, UserRole } from '@/types'
import { wakeupBackend } from '@/services/health'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showPass = ref(false)
const emailFocused = ref(false)
const passFocused = ref(false)
const googleButtonRef = ref<HTMLDivElement | null>(null)
const shellRef = ref<HTMLDivElement | null>(null)
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const isGoogleEnabled = computed(() => !!googleClientId && googleClientId.trim().length > 0)
const googleError = ref('')
let googleRenderAttempted = false
const GOOGLE_SCRIPT_ID = 'google-identity-script'

/* ── Data ── */
const roles = [
  { key: 'admin' as UserRole, icon: '👑' },
  { key: 'director' as UserRole, icon: '🏢' },
  { key: 'manager' as UserRole, icon: '📋' },
  { key: 'coach' as UserRole, icon: '🎓' },
  { key: 'student' as UserRole, icon: '📚' },
  { key: 'parent' as UserRole, icon: '👨‍👩‍👧' },
]

const trustItems = [
  { icon: '🔒', text: 'Secure' },
  { icon: '⚡', text: 'Instant' },
  { icon: '💎', text: '500+ users' },
]

const currentRole = ref<UserRole>((route.params.role as UserRole) || 'admin')
const credentials = ref<LoginCredentials>({ email: '', password: '' })

const switchRole = (role: UserRole) => {
  currentRole.value = role
  credentials.value = { email: '', password: '' }
  authStore.error = null
  router.replace(`/login/${role}`)
}

const redirectByRole = () => {
  const role = authStore.userRole
  const map: Record<string, string> = {
    admin: '/admin/dashboard',
    director: '/operations/dashboard',
    manager: '/operations/dashboard',
    coach: '/coach/dashboard',
    student: '/student/dashboard',
    parent: '/parent/dashboard',
  }
  router.push(map[role ?? ''] ?? '/dashboard')
}

const handleSubmit = async () => {
  try {
    const success = await authStore.login(credentials.value)
    if (success) redirectByRole()
  } catch { /* error in store */ }
}

const handleGoogleCredential = async (response: { credential: string }) => {
  if (!response?.credential) return
  try {
    const success = await authStore.loginWithGoogle(response.credential)
    if (success) redirectByRole()
  } catch { /* error in store */ }
}

async function ensureGoogleScript() {
  if (typeof window === 'undefined') return
  const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    if ((window as any).google?.accounts?.id) return
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google script failed to load')), { once: true })
    })
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google script failed to load'))
    document.head.appendChild(script)
  })
}

async function renderGoogleButton() {
  if (!isGoogleEnabled.value || !googleButtonRef.value || googleRenderAttempted) return
  googleRenderAttempted = true
  googleError.value = ''
  try {
    await ensureGoogleScript()
    const google = (window as any).google
    if (!google?.accounts?.id) {
      throw new Error('Google Identity Services unavailable')
    }
    google.accounts.id.initialize({ client_id: googleClientId, callback: handleGoogleCredential })
    const buttonWidth = Math.min(360, googleButtonRef.value.clientWidth || 360)
    google.accounts.id.renderButton(googleButtonRef.value, { theme: 'outline', size: 'large', width: buttonWidth })
    google.accounts.id.prompt()
  } catch (err) {
    console.error('Failed to render Google sign-in button:', err)
    googleError.value = 'Google Sign-In is temporarily unavailable. Please try again.'
    googleRenderAttempted = false
  }
}

onMounted(() => {
  void wakeupBackend()
  void renderGoogleButton()
})

onUnmounted(() => {
  googleRenderAttempted = false
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ━━ Base ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.login-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #020617;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  padding: 20px;
  cursor: auto;
}

/* ━━ Torch / flashlight cursor ━━━━━━━━━━━━━━━━━━━━ */
.torch {
  position: fixed;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.18) 0%,
    rgba(56, 189, 248, 0.08) 25%,
    rgba(168, 85, 247, 0.04) 45%,
    transparent 65%
  );
  transform: translate(-50%, -50%);
  left: var(--tx);
  top: var(--ty);
  pointer-events: none;
  z-index: 1;
  transition: left 0.16s ease-out, top 0.16s ease-out;
  mix-blend-mode: screen;
  opacity: 0.75;
}

/* ━━ Aurora ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  filter: blur(90px) saturate(1.6);
  opacity: 0.55;
}

.aurora__band { position: absolute; border-radius: 50%; }

.aurora__band--1 {
  width: 140%;
  height: 50%;
  top: -25%;
  left: -20%;
  background: radial-gradient(ellipse, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
  animation: aurora-1 28s ease-in-out infinite;
}

.aurora__band--2 {
  width: 120%;
  height: 45%;
  bottom: -15%;
  right: -15%;
  background: radial-gradient(ellipse, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
  animation: aurora-2 32s ease-in-out infinite;
}

.aurora__band--3 {
  width: 80%;
  height: 35%;
  top: 25%;
  left: 15%;
  background: radial-gradient(ellipse, rgba(168, 85, 247, 0.25) 0%, transparent 70%);
  animation: aurora-3 36s ease-in-out infinite;
}

@keyframes aurora-1 {
  0%, 100% { transform: translateX(0) translateY(0) scale(1); }
  33% { transform: translateX(2%) translateY(-2%) scale(1.03); }
  66% { transform: translateX(-2%) translateY(2%) scale(0.99); }
}

@keyframes aurora-2 {
  0%, 100% { transform: translateX(0) translateY(0) scale(1); }
  50% { transform: translateX(-2%) translateY(-2%) scale(1.04); }
}

@keyframes aurora-3 {
  0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
  50% { transform: translateX(3%) translateY(2%) rotate(2deg); }
}

.noise {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}

.stars { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.star {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: white;
  border-radius: 50%;
  left: var(--x);
  top: var(--y);
  opacity: var(--brightness);
  animation: star-twinkle var(--dur) var(--delay) infinite ease-in-out;
}

@keyframes star-twinkle {
  0%, 100% { opacity: calc(var(--brightness) * 0.35); transform: scale(0.9); }
  50% { opacity: var(--brightness); transform: scale(1.08); }
}

/* ━━ Login shell — STRONGER tilt ━━━━━━━━━━━━━━━━━━ */
.login-shell {
  position: relative;
  z-index: 2;
  width: min(1100px, 100%);
  border-radius: 24px;
  padding: 1px;
  --mx: 50%;
  --my: 50%;
  --rx: 0deg;
  --ry: 0deg;
  transform: perspective(800px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform 0.2s ease-out;
  animation: shell-enter 1s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: auto;
}

@keyframes shell-enter {
  from { opacity: 0; transform: perspective(800px) translateY(50px) scale(0.94) rotateX(4deg); }
  to { opacity: 1; transform: perspective(800px) translateY(0) scale(1) rotateX(0deg); }
}

/* Mouse-tracking glow — more torch-like, tighter radius */
.shell__glow-border {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: radial-gradient(
    350px circle at var(--mx) var(--my),
    rgba(99, 102, 241, 0.45),
    rgba(56, 189, 248, 0.2) 30%,
    rgba(168, 85, 247, 0.08) 50%,
    transparent 65%
  );
  z-index: 0;
  pointer-events: none;
}

/* Animated gradient border */
.shell__glow-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 1.5px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.5),
    rgba(6, 182, 212, 0.4),
    rgba(168, 85, 247, 0.4),
    rgba(244, 114, 182, 0.3),
    rgba(99, 102, 241, 0.5)
  );
  background-size: 400% 400%;
  animation: border-shift 5s ease infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

@keyframes border-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.shell__inner {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 640px;
  border-radius: 23px;
  overflow: hidden;
  background: rgba(6, 10, 28, 0.88);
  backdrop-filter: blur(40px) saturate(180%);
  box-shadow:
    0 50px 100px -25px rgba(0, 0, 0, 0.8),
    0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

/* ━━ Hero panel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.hero-panel {
  position: relative;
  padding: 44px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(160deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.06);
  overflow: hidden;
}

.hero-content { position: relative; z-index: 1; }

/* ── Centered brand ── */
.brand-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
}

.logo-area {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.logo-core {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  display: grid;
  place-items: center;
  position: relative;
  z-index: 2;
  box-shadow:
    0 8px 30px rgba(99, 102, 241, 0.5),
    0 0 60px rgba(99, 102, 241, 0.15);
  animation: logo-float 7s ease-in-out infinite;
}

@keyframes logo-float {
  0%, 100% { transform: translateY(0); box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.15); }
  50% { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(99, 102, 241, 0.55), 0 0 72px rgba(99, 102, 241, 0.18); }
}

.logo-emoji { font-size: 38px; line-height: 1; }

.logo-pulse {
  position: absolute;
  border-radius: 26px;
  border: 1.5px solid rgba(99, 102, 241, 0.25);
  animation: pulse-ring 3s ease-in-out infinite;
  z-index: 1;
}

.logo-pulse--1 { inset: -10px; }
.logo-pulse--2 { inset: -22px; border-radius: 30px; animation-delay: 1s; }
.logo-pulse--3 { inset: -34px; border-radius: 34px; animation-delay: 2s; }

@keyframes pulse-ring {
  0%, 100% { opacity: 0; transform: scale(0.92); }
  50% { opacity: 0.8; transform: scale(1.04); }
}

.hero-title {
  font-size: 38px;
  font-weight: 900;
  letter-spacing: -1.5px;
  background: linear-gradient(135deg, #f8fafc 20%, #a5b4fc 60%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.hero-subtitle {
  font-size: 12px;
  font-weight: 700;
  color: #818cf8;
  letter-spacing: 4px;
  margin: 6px 0 0;
}

/* ━━ 3D Animated Book ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.book-scene {
  position: relative;
  width: 220px;
  height: 160px;
  margin: 0 auto 20px;
  perspective: 600px;
}

.book-3d {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100px;
  height: 130px;
  transform-style: preserve-3d;
  transform: translate(-50%, -50%) rotateY(-25deg) rotateX(8deg);
  animation: book-hover 8s ease-in-out infinite;
}

@keyframes book-hover {
  0%, 100% { transform: translate(-50%, -50%) rotateY(-25deg) rotateX(8deg) translateY(0); }
  50% { transform: translate(-50%, -50%) rotateY(-20deg) rotateX(6deg) translateY(-4px); }
}

.book-spine {
  position: absolute;
  left: 0;
  top: 0;
  width: 14px;
  height: 100%;
  background: linear-gradient(180deg, #4338ca, #3730a3);
  transform: rotateY(90deg) translateZ(0px);
  transform-origin: left center;
  border-radius: 2px 0 0 2px;
}

.book-cover {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 0 6px 6px 0;
  backface-visibility: hidden;
}

.book-cover--front {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  transform: translateZ(7px);
  box-shadow: 4px 4px 20px rgba(99, 102, 241, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.book-icon { font-size: 32px; }

.book-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
}

.book-cover--back {
  background: linear-gradient(135deg, #3730a3, #312e81);
  transform: translateZ(-7px);
}

/* Animated page turns */
.book-page {
  position: absolute;
  width: 96%;
  height: 96%;
  top: 2%;
  left: 2%;
  background: linear-gradient(135deg, #e0e7ff, #f1f5f9);
  border-radius: 0 4px 4px 0;
  transform-origin: left center;
  backface-visibility: hidden;
}

.book-page--1 {
  transform: translateZ(5px);
  animation: page-turn-1 6s ease-in-out infinite;
}

.book-page--2 {
  transform: translateZ(3px);
  animation: page-turn-2 6s ease-in-out infinite 1.5s;
}

.book-page--3 {
  transform: translateZ(1px);
  animation: page-turn-3 6s ease-in-out infinite 3s;
}

@keyframes page-turn-1 {
  0%, 15% { transform: translateZ(5px) rotateY(0deg); }
  25%, 75% { transform: translateZ(5px) rotateY(-160deg); }
  85%, 100% { transform: translateZ(5px) rotateY(0deg); }
}

@keyframes page-turn-2 {
  0%, 20% { transform: translateZ(3px) rotateY(0deg); }
  30%, 70% { transform: translateZ(3px) rotateY(-155deg); }
  80%, 100% { transform: translateZ(3px) rotateY(0deg); }
}

@keyframes page-turn-3 {
  0%, 25% { transform: translateZ(1px) rotateY(0deg); }
  35%, 65% { transform: translateZ(1px) rotateY(-150deg); }
  75%, 100% { transform: translateZ(1px) rotateY(0deg); }
}

/* Floating elements around book */
.float-el {
  position: absolute;
  font-size: 18px;
  opacity: 0.7;
  animation: float-orbit var(--speed, 8s) ease-in-out infinite;
}

.float-el--1 { top: 5%; left: 15%; --speed: 12s; animation-delay: 0s; }
.float-el--2 { top: 0%; right: 20%; --speed: 13s; animation-delay: 1s; }
.float-el--3 { bottom: 10%; right: 10%; --speed: 11s; animation-delay: 2s; }
.float-el--4 { bottom: 5%; left: 20%; --speed: 15s; animation-delay: 0.5s; }
.float-el--5 { top: 40%; right: 5%; --speed: 12s; animation-delay: 3s; }

@keyframes float-orbit {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-5px) rotate(2deg) scale(1.04); }
  50% { transform: translateY(-3px) rotate(-2deg) scale(0.98); }
  75% { transform: translateY(-6px) rotate(1deg) scale(1.02); }
}

/* Light rays from book */
.book-rays {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ray {
  position: absolute;
  width: 2px;
  background: linear-gradient(transparent, rgba(99, 102, 241, 0.3), transparent);
  animation: ray-pulse 3s ease-in-out infinite;
}

.ray--1 { height: 80px; left: -20px; top: -50px; transform: rotate(-15deg); animation-delay: 0s; }
.ray--2 { height: 100px; left: 5px; top: -60px; transform: rotate(0deg); animation-delay: 0.5s; }
.ray--3 { height: 70px; left: 30px; top: -45px; transform: rotate(15deg); animation-delay: 1s; }

@keyframes ray-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}

/* Tagline */
.hero-tagline {
  margin: 0 0 20px;
  font-size: 14px;
}

.tagline-glow {
  background: linear-gradient(90deg, #94a3b8, #c7d2fe, #94a3b8);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: text-shine 4s ease-in-out infinite;
  font-weight: 500;
}

@keyframes text-shine {
  0% { background-position: 100% 50%; }
  100% { background-position: -100% 50%; }
}

/* Trust pills */
.trust-row {
  display: flex;
  gap: 10px;
}

.trust-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  font-size: 11px;
  font-weight: 600;
  color: #a5b4fc;
}

/* Orbiting particles */
.hero-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.h-particle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: hsla(var(--hue), 70%, 65%, 0.6);
  box-shadow: 0 0 8px hsla(var(--hue), 70%, 65%, 0.3);
  animation: orbit-particle var(--speed) linear infinite;
  transform-origin: 0 0;
}

@keyframes orbit-particle {
  from { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(calc(-1 * var(--angle))); }
  to { transform: rotate(calc(var(--angle) + 360deg)) translateX(var(--dist)) rotate(calc(-1 * var(--angle) - 360deg)); }
}

/* ━━ Form panel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44px 36px;
}

.form-content { width: 100%; max-width: 400px; }

.form-header { margin-bottom: 24px; }

.form-header h2 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #f8fafc;
  margin: 0;
}

.form-header p { color: #64748b; font-size: 14px; margin: 6px 0 0; }

.error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 12px;
  padding: 12px 16px;
  color: #fca5a5;
  font-size: 13px;
  margin-bottom: 18px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}

.login-form { display: flex; flex-direction: column; gap: 18px; }

.field label {
  display: block;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 52px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.5);
  transition: all 0.3s;
  overflow: hidden;
}

.input-wrap.focused {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 0 24px rgba(99, 102, 241, 0.06);
  background: rgba(15, 23, 42, 0.7);
}

.input-glow {
  position: absolute;

.google-error {
  margin: 0;
  font-size: 12px;
  color: #fca5a5;
  text-align: center;
}

.login-page.reduced-motion .aurora__band,
.login-page.reduced-motion .star,
.login-page.reduced-motion .shell__glow-border::before,
.login-page.reduced-motion .logo-core,
.login-page.reduced-motion .logo-pulse,
.login-page.reduced-motion .book-3d,
.login-page.reduced-motion .book-page,
.login-page.reduced-motion .float-el,
.login-page.reduced-motion .ray,
.login-page.reduced-motion .hero-particles,
.login-page.reduced-motion .h-particle,
.login-page.reduced-motion .btn-shimmer,
.login-page.reduced-motion .spinner,
.login-page.reduced-motion .anim-up {
  animation: none !important;
  transform: none !important;
}

.login-page.reduced-motion * {
  transition: none !important;
}

.login-page.reduced-motion .shell__glow-border {
  background: radial-gradient(350px circle at 50% 50%, rgba(99, 102, 241, 0.25), transparent 60%);
}
  inset: 0;
  background: radial-gradient(circle at 50% 120%, rgba(99, 102, 241, 0.1), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.input-wrap.focused .input-glow { opacity: 1; }

.input-icon { position: absolute; left: 16px; font-size: 16px; z-index: 1; pointer-events: none; }

.input-wrap input {
  width: 100%;
  padding: 15px 16px 15px 48px;
  border: none;
  background: transparent;
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  outline: none;
}

.input-wrap input::placeholder { color: #64748b; font-size: 14px; font-weight: 500; }

.eye-btn {
  position: absolute;
  right: 10px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  z-index: 1;
}

.eye-btn:hover { background: rgba(99, 102, 241, 0.12); border-color: rgba(99, 102, 241, 0.3); }

.btn-login {
  position: relative;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.35);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  margin-top: 4px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.005);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.45);
}

.btn-login:active:not(:disabled) { transform: translateY(0) scale(0.99); }
.btn-login:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-arrow { transition: transform 0.3s; font-size: 16px; }
.btn-login:hover .btn-arrow { transform: translateX(3px); }

.btn-shimmer {
  position: absolute;
  top: 0;
  left: -120%;
  width: 80%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.18), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer { 0% { left: -120%; } 100% { left: 220%; } }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 18px 0;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.12), transparent);
}

.google-wrap { display: flex; justify-content: center; margin-bottom: 6px; }
.google-button { width: 100%; display: flex; justify-content: center; }

/* Role chips */
.role-section {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
}

.role-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  text-align: center;
}

.role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }

.role-chip {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 6px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  background: rgba(15, 23, 42, 0.35);
  color: #94a3b8;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.role-chip__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.15), transparent 70%);
  opacity: 0;
  transition: opacity 0.35s;
}

.role-chip:hover {
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
  color: #c7d2fe;
}

.role-chip:hover .role-chip__glow { opacity: 1; }

.role-chip.active {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2), inset 0 0 0 1px rgba(99, 102, 241, 0.1);
  transform: translateY(-1px);
}

.role-chip.active .role-chip__glow { opacity: 1; }

.role-chip__icon { font-size: 20px; z-index: 1; }
.role-chip__name { font-size: 10px; font-weight: 700; text-transform: capitalize; letter-spacing: 0.5px; z-index: 1; }
.role-chip:disabled { opacity: 0.4; cursor: not-allowed; }

.form-footer { margin-top: 18px; text-align: center; }

.back-link {
  color: #475569;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.back-link:hover { color: #a5b4fc; }

/* ━━ Entrance ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.anim-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) var(--d) forwards;
}

@keyframes fade-up {
  to { opacity: 1; transform: translateY(0); }
}

/* ━━ Responsive ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
@media (max-width: 1100px) {
  .login-shell { max-width: 920px; }
  .hero-panel { padding: 32px 28px; }
  .form-panel { padding: 32px 28px; }
  .book-scene { width: 220px; height: 160px; }
}

@media (max-width: 900px) {
  .shell__inner { grid-template-columns: 1fr; }
  .hero-panel { padding: 28px 24px; border-right: none; border-bottom: 1px solid rgba(148, 163, 184, 0.06); }
  .hero-title { font-size: 28px; }
  .form-panel { padding: 28px 24px; }
  .login-shell { max-width: 460px; transform: none !important; }
  .hero-particles { display: none; }
  .book-scene { width: 180px; height: 130px; }
}

@media (max-width: 700px) {
  .login-page { padding: 16px; }
  .login-shell { max-width: 100%; }
  .hero-panel { text-align: center; }
  .trust-row { justify-content: center; }
  .form-header h2 { font-size: 22px; }
  .role-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .login-page { padding: 8px; cursor: auto; }
  .torch { display: none; }
  .hero-panel, .form-panel { padding: 20px 18px; }
  .trust-row { flex-wrap: wrap; gap: 6px; }
  .role-grid { grid-template-columns: 1fr; }
  .btn-login { font-size: 14px; }
  .input-wrap input { font-size: 15px; }
}
</style>
