<template>
  <div class="login-page">
    <div class="login-shell">
      <aside class="login-hero">
        <div class="hero-content">
          <div class="brand-mark">TG</div>
          <h1>Tardigrade Coaching</h1>
          <p>Focused learning, visible progress.</p>
          <ul class="hero-points">
            <li><span>●</span> Coach-led plans</li>
            <li><span>●</span> Parent visibility</li>
            <li><span>●</span> Simple reporting</li>
          </ul>
        </div>
        <img
          class="hero-image"
          src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop"
          alt="Students learning"
          loading="lazy"
        />
        <div class="hero-glow"></div>
      </aside>

      <div class="login-card">
        <div class="form-header">
          <h2>Sign in</h2>
          <p>Continue to your dashboard</p>
        </div>

      <div v-if="authStore.error" class="error-alert">
        ⚠️ {{ authStore.error }}
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="credentials.email"
            type="email"
            required
            placeholder="you@example.com"
            :disabled="authStore.isLoading"
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <div class="password-wrap">
            <input
              id="password"
              v-model="credentials.password"
              :type="showPass ? 'text' : 'password'"
              required
              placeholder="Enter your password"
              :disabled="authStore.isLoading"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="eye-btn"
              @click="showPass = !showPass"
              :aria-label="showPass ? 'Hide password' : 'Show password'"
            >
              {{ showPass ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn-login"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading" class="spinner"></span>
          {{ authStore.isLoading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>

      <div v-if="isGoogleEnabled" class="divider">
        <span>or</span>
      </div>

      <div v-if="isGoogleEnabled" class="google-wrap">
        <div ref="googleButtonRef" class="google-button"></div>
      </div>

      <div class="switch-role">
        <span>Role:</span>
        <button
          v-for="r in roles"
          :key="r"
          :class="['pill', { active: currentRole === r }]"
          @click="switchRole(r)"
          :disabled="authStore.isLoading"
        >
          {{ r }}
        </button>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials, UserRole } from '@/types'
import { wakeupBackend } from '@/services/health'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showPass = ref(false)
const googleButtonRef = ref<HTMLDivElement | null>(null)
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const isGoogleEnabled = computed(() => !!googleClientId)

const roles: UserRole[] = ['admin', 'director', 'manager', 'coach', 'student', 'parent']

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
    if (success) {
      redirectByRole()
    }
  } catch {
    // error already set in store
  }
}

const handleGoogleCredential = async (response: { credential: string }) => {
  if (!response?.credential) return
  try {
    const success = await authStore.loginWithGoogle(response.credential)
    if (success) {
      redirectByRole()
    }
  } catch {
    // error already set in store
  }
}

onMounted(() => {
  void wakeupBackend()

  if (!isGoogleEnabled.value || !googleButtonRef.value) return
  const google = (window as any).google
  if (!google?.accounts?.id) return

  google.accounts.id.initialize({
    client_id: googleClientId,
    callback: handleGoogleCredential,
  })

  const buttonWidth = Math.min(360, googleButtonRef.value.clientWidth || 360)

  google.accounts.id.renderButton(googleButtonRef.value, {
    theme: 'outline',
    size: 'large',
    width: buttonWidth,
  })
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-lg);
  background: radial-gradient(circle at top, rgba(79, 70, 229, 0.08), transparent 55%);
}

.login-shell {
  width: min(980px, 100%);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.login-hero {
  position: relative;
  padding: var(--space-2xl);
  background: linear-gradient(160deg, rgba(79, 70, 229, 0.95), rgba(49, 46, 129, 0.95));
  color: var(--text-inverse);
  display: grid;
  gap: var(--space-lg);
  overflow: hidden;
}

.hero-content h1 {
  margin: var(--space-sm) 0;
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
}

.hero-content p {
  color: rgba(255, 255, 255, 0.82);
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.16);
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: 1px;
}

.hero-points {
  list-style: none;
  display: grid;
  gap: var(--space-sm);
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--font-size-sm);
}

.hero-points span {
  margin-right: 8px;
  color: rgba(255, 255, 255, 0.6);
}

.hero-image {
  width: 100%;
  border-radius: var(--radius-lg);
  object-fit: cover;
  aspect-ratio: 4 / 3;
  box-shadow: var(--shadow-lg);
  animation: float 6s ease-in-out infinite;
  z-index: 1;
}

.hero-glow {
  position: absolute;
  width: 260px;
  height: 260px;
  background: rgba(255, 255, 255, 0.2);
  filter: blur(60px);
  border-radius: 50%;
  bottom: -40px;
  right: -60px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  justify-self: center;
  padding: var(--space-2xl);
}

.form-header {
  margin-bottom: var(--space-lg);
}

.form-header h2 {
  margin: 0;
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
}

.form-header p {
  margin: var(--space-xs) 0 0;
  color: var(--text-muted);
}

.error-alert {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border: 1px solid #fecaca;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-md);
}

.field {
  margin-bottom: var(--space-md);
}

.field label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.field input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-input);
  color: var(--text-primary);
}

.field input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.password-wrap {
  position: relative;
}

.password-wrap input {
  padding-right: 64px;
}

.eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid var(--border-default);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: var(--font-size-xs);
  cursor: pointer;
}

.btn-login {
  width: 100%;
  border: none;
  border-radius: var(--radius-md);
  padding: 12px;
  background: var(--brand-gradient);
  color: var(--text-inverse);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.btn-login:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-login:disabled,
.pill:disabled,
.eye-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.switch-role {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--space-sm) 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.divider::before,
.divider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: var(--border-light);
}

.divider span {
  padding: 0 10px;
}

.google-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.google-button {
  width: 100%;
  display: flex;
  justify-content: center;
}

.switch-role > span {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.pill {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  text-transform: capitalize;
  padding: 6px 10px;
  cursor: pointer;
}

.pill.active {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  background: rgba(79, 70, 229, 0.1);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

@media (max-width: 900px) {
  .login-hero {
    order: 2;
  }

  .login-card {
    max-width: none;
  }
}
</style>
