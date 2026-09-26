import { Button, ThemeIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconBarbell, IconApple, IconChartLine, IconBrain, IconTarget, IconTrendingUp, IconBolt, IconShieldCheck } from '@tabler/icons-react';
import '../styles/Landing.css';

/**
 * Guest landing page, mobile-first (design-system/fitai/pages/dashboard.md,
 * "Guest"). Phones get a full-bleed hero, a swipeable feature rail and a
 * sticky "Get started" bar; the two-column hero and 3-up grid arrive at `md`.
 * Styling lives in Landing.css — this used to be ~120 inline style objects,
 * none of which could respond to width.
 */
export function LandingHero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: <IconBarbell size={24} stroke={1.5} />, title: t('landing.featTrainingTitle'), description: t('landing.featTrainingDesc'), color: 'indigo' },
    { icon: <IconApple size={24} stroke={1.5} />, title: t('landing.featNutritionTitle'), description: t('landing.featNutritionDesc'), color: 'green' },
    { icon: <IconChartLine size={24} stroke={1.5} />, title: t('landing.featProgressTitle'), description: t('landing.featProgressDesc'), color: 'blue' },
    { icon: <IconBrain size={24} stroke={1.5} />, title: t('landing.featAiTitle'), description: t('landing.featAiDesc'), color: 'violet' },
    { icon: <IconTarget size={24} stroke={1.5} />, title: t('landing.featGoalsTitle'), description: t('landing.featGoalsDesc'), color: 'orange' },
    { icon: <IconTrendingUp size={24} stroke={1.5} />, title: t('landing.featAnalyticsTitle'), description: t('landing.featAnalyticsDesc'), color: 'cyan' },
  ];

  const stats = [
    { value: '50K+', label: t('landing.statAthletes') },
    { value: '98%', label: t('landing.statSatisfaction') },
    { value: '+14.2%', label: t('landing.statGain') },
  ];

  const mockRows = [
    { label: t('landing.mockTrainingPlans'), value: t('landing.mockTrainingValue'), tone: 'primary' },
    { label: t('landing.mockWorkouts'), value: t('landing.mockWorkoutsValue'), tone: 'success' },
    { label: t('landing.mockCalories'), value: t('landing.mockCaloriesValue'), tone: 'warning' },
    { label: t('landing.mockInsights'), value: t('landing.mockInsightsValue'), tone: 'tertiary' },
  ];

  const metrics = [
    { label: t('landing.metricLabTitle'), desc: t('landing.metricLabDesc'), icon: <IconChartLine size={18} /> },
    { label: t('landing.metricAiTitle'), desc: t('landing.metricAiDesc'), icon: <IconBrain size={18} /> },
    { label: t('landing.metricOverloadTitle'), desc: t('landing.metricOverloadDesc'), icon: <IconBarbell size={18} /> },
  ];

  const footerCols = [
    { title: t('landing.footerProduct'), links: [t('landing.footerWorkouts'), t('landing.footerNutrition'), t('landing.footerAiEngine')] },
    { title: t('landing.footerCompany'), links: [t('landing.footerAbout'), t('landing.footerScience'), t('landing.footerCareers')] },
    { title: t('landing.footerSupport'), links: [t('landing.footerPrivacy'), t('landing.footerTerms'), t('landing.footerContact')] },
  ];

  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero__glow landing-hero__glow--a" aria-hidden="true" />
        <div className="landing-hero__glow landing-hero__glow--b" aria-hidden="true" />

        <div className="landing-wrap landing-hero__grid">
          <div className="landing-hero__copy">
            <span className="landing-badge">
              <IconBolt size={14} aria-hidden="true" />
              {t('landing.badge')}
            </span>

            <h1 className="landing-hero__title">
              {t('landing.heroTitle1')}{' '}
              <span className="landing-hero__accent">{t('landing.heroTitle2')}</span>
            </h1>

            <p className="landing-hero__subtitle">{t('landing.heroSubtitle')}</p>

            <div className="landing-hero__ctas">
              <Button size="lg" color="indigo" onClick={() => navigate('/register')} className="landing-cta-primary">
                {t('auth.registerTitle')}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="landing-cta-ghost">
                {t('auth.signIn')}
              </Button>
            </div>

            <dl className="landing-stats">
              {stats.map((s) => (
                <div key={s.label} className="landing-stat">
                  <dt className="landing-stat__label">{s.label}</dt>
                  <dd className="landing-stat__value stat-number">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Dashboard preview mock — decorative, so hidden from AT */}
          <div className="landing-mock" aria-hidden="true">
            <div className="landing-mock__bar">
              <span className="landing-mock__dots"><i /><i /><i /></span>
              <span className="landing-mock__title">{t('landing.mockTitle')}</span>
            </div>
            <div className="landing-mock__rows">
              {mockRows.map((row) => (
                <div key={row.label} className="landing-mock__row">
                  <span>{row.label}</span>
                  <strong data-tone={row.tone}>{row.value}</strong>
                </div>
              ))}
            </div>
            <div className="landing-mock__gain">
              <IconBolt size={16} />
              <span>{t('landing.performanceGain')}</span>
              <strong className="num">+14.2%</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <div className="landing-wrap">
          <header className="landing-section__head">
            <p className="landing-kicker">{t('landing.featuresKicker')}</p>
            <h2 className="landing-section__title">{t('landing.featuresTitle')}</h2>
            <p className="landing-section__lead">{t('landing.featuresSubtitle')}</p>
          </header>

          <ul className="landing-features">
            {features.map((f) => (
              <li key={f.title} className="landing-feature">
                <ThemeIcon size={48} radius="md" variant="light" color={f.color} aria-hidden="true">
                  {f.icon}
                </ThemeIcon>
                <h3 className="landing-feature__title">{f.title}</h3>
                <p className="landing-feature__desc">{f.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Science */}
      <section className="landing-section landing-section--alt">
        <div className="landing-wrap landing-science">
          <div className="landing-science__copy">
            <h2 className="landing-section__title">{t('landing.scienceTitle')}</h2>
            <p className="landing-section__lead landing-section__lead--start">{t('landing.scienceText')}</p>
            <div className="landing-science__facts">
              <div>
                <p className="landing-fact__title"><IconBolt size={16} aria-hidden="true" />{t('landing.dailyLoad')}</p>
                <p className="landing-fact__value">{t('landing.dailyLoadValue')}</p>
              </div>
              <div>
                <p className="landing-fact__title"><IconShieldCheck size={16} aria-hidden="true" />{t('landing.recovery')}</p>
                <p className="landing-fact__value">{t('landing.recoveryValue')}</p>
              </div>
            </div>
          </div>
          <ul className="landing-metrics">
            {metrics.map((m) => (
              <li key={m.label} className="landing-metric">
                <ThemeIcon variant="light" color="indigo" size="lg" radius="md" aria-hidden="true">{m.icon}</ThemeIcon>
                <div>
                  <p className="landing-metric__title">{m.label}</p>
                  <p className="landing-metric__desc">{m.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-wrap landing-cta__inner">
          <h2 className="landing-cta__title">{t('landing.ctaTitle')}</h2>
          <p className="landing-cta__text">{t('landing.ctaText')}</p>
          <Button size="lg" variant="white" color="violet" onClick={() => navigate('/register')} className="landing-cta-primary">
            {t('landing.getStarted')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-wrap">
          <div className="landing-footer__grid">
            <div className="landing-footer__brand">
              <p className="landing-footer__logo">FitAi</p>
              <p className="landing-footer__tagline">{t('landing.footerTagline')}</p>
            </div>
            {footerCols.map((col) => (
              <div key={col.title}>
                <p className="landing-footer__heading">{col.title}</p>
                <ul className="landing-footer__links">
                  {col.links.map((l) => <li key={l}>{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="landing-footer__copy">{t('landing.footerCopyright')}</p>
        </div>
      </footer>

      {/* Phones: the primary action stays under the thumb while scrolling. */}
      <div className="landing-sticky-cta">
        <Button fullWidth size="lg" color="indigo" onClick={() => navigate('/register')}>
          {t('landing.getStarted')}
        </Button>
      </div>
    </div>
  );
}
