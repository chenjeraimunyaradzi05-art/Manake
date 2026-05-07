import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties, ReactNode } from 'react'
import { getSectionPage, mediaGallery, mediaVideos, sectionPages, type SectionCard } from '../../src/sectionPages'
import { getSessionFromCookies } from '../../src/lib/auth-session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type SectionRouteProps = {
  params: {
    section: string
  }
}

export function generateStaticParams() {
  return sectionPages.map((page) => ({
    section: page.slug,
  }))
}

export function generateMetadata({ params }: SectionRouteProps): Metadata {
  const page = getSectionPage(params.section)

  if (!page) {
    return {
      title: 'Page not found | Manake Rehabilitation Center',
    }
  }

  return {
    title: `${page.title} | Manake Rehabilitation Center`,
    description: page.intro,
    openGraph: {
      title: page.title,
      description: page.intro,
      images: page.image ? [page.image] : ['/images/manake/center-exterior.jpg'],
    },
  }
}

function isExternalHref(href: string) {
  return href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
}

function PageLink({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className: string
}) {
  const external = isExternalHref(href)

  return (
    <a className={className} href={href} target={external && href.startsWith('http') ? '_blank' : undefined} rel={external && href.startsWith('http') ? 'noreferrer' : undefined}>
      {children}
    </a>
  )
}

function CardGrid({ cards, isMedia = false }: { cards: SectionCard[]; isMedia?: boolean }) {
  return (
    <div className={isMedia ? 'section-media-grid' : 'section-detail-grid'}>
      {cards.map((card) => (
        <article className={isMedia ? 'section-media-card' : 'section-detail-card'} key={`${card.title}-${card.image || card.meta || card.copy}`}>
          {card.image ? (
            <div className="media-frame">
              <img
                src={card.image}
                alt={card.title}
                style={card.imagePosition ? ({ '--media-pos': card.imagePosition } as CSSProperties) : undefined}
              />
            </div>
          ) : null}
          <div className="section-detail-body">
            {card.meta ? <span>{card.meta}</span> : null}
            <h2>{card.title}</h2>
            <p>{card.copy}</p>
            {card.href ? (
              <a className="text-link" href={card.href}>
                Open page
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}

export default function SectionRoute({ params }: SectionRouteProps) {
  const page = getSectionPage(params.section)

  if (!page) {
    notFound()
  }

  const session = getSessionFromCookies()
  const relatedPages = sectionPages.filter((item) => item.slug !== page.slug).slice(0, 6)

  return (
    <div className="app-shell">
      <header className="site-header simple-header">
        <a className="brand" href="/" aria-label="Manake home">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>
            <strong>Manake</strong>
            <small>Rehabilitation Center</small>
          </span>
        </a>
        <nav className="nav-links" aria-label="Section navigation">
          <a href="/stories">Stories</a>
          <a href="/programs">Programs</a>
          <a href="/media">Media</a>
          <a href="/get-help">Get Help</a>
          <a href="/contact">Contact</a>
        </nav>
        <div className="header-actions">
          {session ? (
            <>
              <a className="quiet-link" href="/dashboard">
                Dashboard
              </a>
              <a className="quiet-link" href="/profile">
                Profile
              </a>
              <span className="member-chip" aria-label={`Signed in as ${session.name}`}>
                {session.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <a className="quiet-link" href="/auth/login">
              Login
            </a>
          )}
          <a className="button button-primary button-small" href="/donate">
            Donate
          </a>
        </div>
      </header>

      <main id="main-content" className="section-page-main">
        <section className="section section-page-hero">
          <div className="section-page-copy">
            <a className="section-back-link" href="/">
              Back to homepage
            </a>
            <p className="eyebrow">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            <div className="hero-actions">
              {page.ctaHref && page.ctaLabel ? (
                <PageLink className="button button-primary" href={page.ctaHref}>
                  {page.ctaLabel}
                </PageLink>
              ) : null}
              {page.secondaryHref && page.secondaryLabel ? (
                <PageLink className="button button-secondary" href={page.secondaryHref}>
                  {page.secondaryLabel}
                </PageLink>
              ) : null}
            </div>
          </div>

          {page.image ? (
            <figure className="section-page-image">
              <img
                src={page.image}
                alt={page.title}
                style={page.imagePosition ? ({ '--media-pos': page.imagePosition } as CSSProperties) : undefined}
              />
            </figure>
          ) : null}
        </section>

        {page.stats ? (
          <section className="section section-stat-band" aria-label={`${page.navLabel} highlights`}>
            {page.stats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </section>
        ) : null}

        {page.slug === 'media' ? (
          <>
            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Videos</p>
                  <h2>Supplied Manake videos</h2>
                </div>
              </div>
              <div className="section-video-grid">
                {mediaVideos.map((video) => (
                  <article className="section-video-card" key={video.title}>
                    <video controls preload="metadata" poster="/images/manake/center-exterior.jpg">
                      <source src={video.image} type="video/mp4" />
                    </video>
                    <div>
                      <strong>{video.title}</strong>
                      <p>{video.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Photo library</p>
                  <h2>All supplied photos</h2>
                </div>
              </div>
              <CardGrid cards={mediaGallery} isMedia />
            </section>
          </>
        ) : null}

        {page.cards && page.slug !== 'media' ? (
          <section className="section">
            <CardGrid cards={page.cards} />
          </section>
        ) : null}

        {page.faqs ? (
          <section className="section">
            <div className="faq-grid">
              {page.faqs.map((faq) => (
                <details key={faq.q}>
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section section-related-pages">
          <div className="section-heading">
            <div>
              <p className="eyebrow">More Manake pages</p>
              <h2>Keep exploring</h2>
            </div>
          </div>
          <div className="related-page-grid">
            {relatedPages.map((item) => (
              <a href={`/${item.slug}`} key={item.slug}>
                <strong>{item.navLabel}</strong>
                <span>{item.title}</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
