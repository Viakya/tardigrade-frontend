<script setup lang="ts">
import { RouterLink } from 'vue-router'

const highlights = [
  {
    title: 'Personalized coaching',
    description: 'Tailored plans for every learner.'
  },
  {
    title: 'Live mentoring',
    description: 'Sessions with expert guidance.'
  },
  {
    title: 'Clear progress',
    description: 'Simple, consistent reporting.'
  }
]
</script>

<template>
  <div class="landing">
    <header class="landing__header">
      <div class="brand">
        <div class="brand__mark">TG</div>
        <div>
          <p class="brand__name">Tardigrade Coaching</p>
          <p class="brand__tag">Precision learning for every learner.</p>
        </div>
      </div>
      <nav class="nav">
        <a href="#approach">Approach</a>
        <RouterLink to="/login" class="nav__cta">Login</RouterLink>
      </nav>
    </header>

    <section class="hero">
      <div class="hero__content">
        <p class="hero__eyebrow">Modern coaching</p>
        <h1>Coaching that stays focused.</h1>
        <p class="hero__body">
          A calm, structured space for students and parents to stay aligned with coaches.
        </p>
        <div class="hero__actions">
          <RouterLink to="/login" class="btn btn--primary">Login</RouterLink>
          <a href="#approach" class="btn btn--ghost">Learn more</a>
        </div>
      </div>
      <div class="hero__visual">
        <img
          class="hero__image"
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
          alt="Coaching session"
          loading="lazy"
        />
      </div>
    </section>

    <section id="approach" class="section">
      <div class="section__header">
        <p class="section__eyebrow">Our approach</p>
        <h2>Simple, consistent, measurable.</h2>
        <p>We keep the focus on steady growth with a clear plan for each learner.</p>
      </div>
      <div class="card-grid">
        <article v-for="item in highlights" :key="item.title" class="card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="cta">
      <div>
        <h2>Ready to begin?</h2>
        <p>Log in to continue.</p>
      </div>
      <RouterLink to="/login" class="btn btn--primary">Login</RouterLink>
    </section>

    <footer class="footer">
      <p class="footer__title">Tardigrade Coaching</p>
      <p class="footer__tag">Focused learning. Visible progress.</p>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
  padding: var(--space-xl) var(--space-2xl) var(--space-2xl);
  background: radial-gradient(circle at top, rgba(79, 70, 229, 0.08), transparent 55%);
  min-height: 100vh;
}

.landing__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-xl);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.brand__mark {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--brand-gradient);
  color: var(--text-inverse);
  font-weight: 700;
  display: grid;
  place-items: center;
  letter-spacing: 0.5px;
}

.brand__name {
  font-weight: 700;
  font-size: var(--font-size-lg);
}

.brand__tag {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  font-weight: 500;
  color: var(--text-secondary);
}

.nav__cta {
  padding: 8px 18px;
  border-radius: var(--radius-full);
  background: var(--brand-gradient);
  color: var(--text-inverse);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-2xl);
  align-items: center;
}

.hero__content h1 {
  font-size: clamp(2.2rem, 4vw, 3rem);
  line-height: 1.1;
  margin: var(--space-sm) 0 var(--space-md);
}

.hero__eyebrow {
  font-weight: 600;
  color: var(--brand-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: var(--font-size-xs);
}

.hero__body {
  color: var(--text-secondary);
  font-size: var(--font-size-md);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin: var(--space-lg) 0;
}

.hero__visual {
  position: relative;
  display: grid;
  place-items: center;
}

.hero__image {
  width: min(420px, 100%);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  object-fit: cover;
  aspect-ratio: 4 / 5;
}

.section {
  display: grid;
  gap: var(--space-xl);
}

.section__header {
  max-width: 700px;
}

.section__eyebrow {
  text-transform: uppercase;
  font-size: var(--font-size-xs);
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 600;
}

.section__header h2 {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  margin: var(--space-sm) 0;
}

.section__header p {
  color: var(--text-secondary);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-lg);
}

.card {
  background: var(--bg-card);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.card h3 {
  margin-bottom: var(--space-sm);
}

.card p {
  color: var(--text-secondary);
}

.cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  background: var(--brand-gradient);
  color: var(--text-inverse);
  padding: var(--space-2xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  color: var(--text-secondary);
  padding-bottom: var(--space-lg);
  border-top: 1px solid var(--border-light);
  padding-top: var(--space-lg);
}

.footer__title {
  font-weight: 700;
  margin-bottom: var(--space-xs);
}


.footer__tag {
  color: var(--text-muted);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.btn--primary {
  background: var(--brand-gradient);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn--secondary {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.btn--ghost {
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  background: transparent;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 900px) {
  .landing {
    padding: var(--space-lg);
  }

  .landing__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav {
    flex-wrap: wrap;
  }

  .cta {
    text-align: left;
  }
}

@media (max-width: 600px) {
  .hero__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .footer {
    flex-direction: column;
  }
}
</style>
