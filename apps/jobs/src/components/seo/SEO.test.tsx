import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { SEO, JobOfferSEO, OrganizationSEO } from './SEO'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'app.name': 'RecruitSpace',
        'seo.jobOffer.title': `${params?.job} en ${params?.company}`,
        'public.jobsList.title': 'Empleos en',
        'public.jobsList.subtitle': 'Encuentra tu empleo ideal',
      }
      return translations[key] || key
    },
  }),
}))

describe('SEO', () => {
  let originalTitle: string

  beforeEach(() => {
    originalTitle = document.title
    // Clean up meta tags
    document.querySelectorAll('meta').forEach((meta) => {
      if (meta.name !== 'viewport' && !meta.getAttribute('charset')) {
        meta.remove()
      }
    })
    document.querySelectorAll('link[rel="canonical"]').forEach((link) => link.remove())
    document.querySelectorAll('script[data-seo-structured]').forEach((script) => script.remove())
  })

  afterEach(() => {
    document.title = originalTitle
  })

  describe('title', () => {
    it('sets document title with page title', () => {
      render(<SEO title="Dashboard" />)

      expect(document.title).toBe('Dashboard | RecruitSpace')
    })

    it('uses default title when no title provided', () => {
      render(<SEO />)

      expect(document.title).toBe('RecruitSpace')
    })

    it('restores default title on unmount', () => {
      const { unmount } = render(<SEO title="Test Page" />)

      expect(document.title).toBe('Test Page | RecruitSpace')

      unmount()

      expect(document.title).toBe('RecruitSpace')
    })
  })

  describe('meta description', () => {
    it('sets description meta tag', () => {
      render(<SEO description="Page description" />)

      const meta = document.querySelector('meta[name="description"]')
      expect(meta).toHaveAttribute('content', 'Page description')
    })

    it('uses default description when not provided', () => {
      render(<SEO />)

      const meta = document.querySelector('meta[name="description"]')
      expect(meta).toHaveAttribute('content', 'RecruitSpace')
    })
  })

  describe('robots meta', () => {
    it('sets index, follow by default', () => {
      render(<SEO />)

      const meta = document.querySelector('meta[name="robots"]')
      expect(meta).toHaveAttribute('content', 'index, follow')
    })

    it('sets noindex when specified', () => {
      render(<SEO noindex />)

      const meta = document.querySelector('meta[name="robots"]')
      expect(meta?.getAttribute('content')).toContain('noindex')
    })

    it('sets nofollow when specified', () => {
      render(<SEO nofollow />)

      const meta = document.querySelector('meta[name="robots"]')
      expect(meta?.getAttribute('content')).toContain('nofollow')
    })

    it('sets both noindex and nofollow', () => {
      render(<SEO noindex nofollow />)

      const meta = document.querySelector('meta[name="robots"]')
      expect(meta).toHaveAttribute('content', 'noindex, nofollow')
    })
  })

  describe('keywords', () => {
    it('sets keywords meta tag when provided', () => {
      render(<SEO keywords="react, typescript, testing" />)

      const meta = document.querySelector('meta[name="keywords"]')
      expect(meta).toHaveAttribute('content', 'react, typescript, testing')
    })

    it('removes keywords meta tag when not provided', () => {
      // First render with keywords
      const { rerender } = render(<SEO keywords="test" />)
      expect(document.querySelector('meta[name="keywords"]')).toBeInTheDocument()

      // Then render without
      rerender(<SEO />)
      expect(document.querySelector('meta[name="keywords"]')).not.toBeInTheDocument()
    })
  })

  describe('author', () => {
    it('sets author meta tag when provided', () => {
      render(<SEO author="John Doe" />)

      const meta = document.querySelector('meta[name="author"]')
      expect(meta).toHaveAttribute('content', 'John Doe')
    })
  })

  describe('Open Graph', () => {
    it('sets og:title', () => {
      render(<SEO ogTitle="OG Title" />)

      const meta = document.querySelector('meta[property="og:title"]')
      expect(meta).toHaveAttribute('content', 'OG Title')
    })

    it('uses full title as og:title default', () => {
      render(<SEO title="Page" />)

      const meta = document.querySelector('meta[property="og:title"]')
      expect(meta).toHaveAttribute('content', 'Page | RecruitSpace')
    })

    it('sets og:description', () => {
      render(<SEO ogDescription="OG Description" />)

      const meta = document.querySelector('meta[property="og:description"]')
      expect(meta).toHaveAttribute('content', 'OG Description')
    })

    it('sets og:type', () => {
      render(<SEO ogType="article" />)

      const meta = document.querySelector('meta[property="og:type"]')
      expect(meta).toHaveAttribute('content', 'article')
    })

    it('defaults og:type to website', () => {
      render(<SEO />)

      const meta = document.querySelector('meta[property="og:type"]')
      expect(meta).toHaveAttribute('content', 'website')
    })

    it('sets og:url', () => {
      render(<SEO ogUrl="https://example.com/page" />)

      const meta = document.querySelector('meta[property="og:url"]')
      expect(meta).toHaveAttribute('content', 'https://example.com/page')
    })

    it('sets og:image when provided', () => {
      render(<SEO ogImage="https://example.com/image.jpg" />)

      const meta = document.querySelector('meta[property="og:image"]')
      expect(meta).toHaveAttribute('content', 'https://example.com/image.jpg')
    })
  })

  describe('Twitter Card', () => {
    it('sets twitter:card', () => {
      render(<SEO twitterCard="summary" />)

      const meta = document.querySelector('meta[name="twitter:card"]')
      expect(meta).toHaveAttribute('content', 'summary')
    })

    it('defaults twitter:card to summary_large_image', () => {
      render(<SEO />)

      const meta = document.querySelector('meta[name="twitter:card"]')
      expect(meta).toHaveAttribute('content', 'summary_large_image')
    })

    it('sets twitter:title', () => {
      render(<SEO twitterTitle="Twitter Title" />)

      const meta = document.querySelector('meta[name="twitter:title"]')
      expect(meta).toHaveAttribute('content', 'Twitter Title')
    })

    it('sets twitter:description', () => {
      render(<SEO twitterDescription="Twitter Description" />)

      const meta = document.querySelector('meta[name="twitter:description"]')
      expect(meta).toHaveAttribute('content', 'Twitter Description')
    })

    it('sets twitter:image', () => {
      render(<SEO twitterImage="https://example.com/twitter.jpg" />)

      const meta = document.querySelector('meta[name="twitter:image"]')
      expect(meta).toHaveAttribute('content', 'https://example.com/twitter.jpg')
    })
  })

  describe('canonical URL', () => {
    it('sets canonical link when provided', () => {
      render(<SEO canonical="https://example.com/canonical" />)

      const link = document.querySelector('link[rel="canonical"]')
      expect(link).toHaveAttribute('href', 'https://example.com/canonical')
    })

    it('removes canonical link when not provided', () => {
      const { rerender } = render(<SEO canonical="https://example.com" />)
      expect(document.querySelector('link[rel="canonical"]')).toBeInTheDocument()

      rerender(<SEO />)
      expect(document.querySelector('link[rel="canonical"]')).not.toBeInTheDocument()
    })
  })

  describe('structured data', () => {
    it('adds JSON-LD script when structuredData is provided', () => {
      const data = { '@type': 'WebSite', name: 'Test' }
      render(<SEO structuredData={data} />)

      const script = document.querySelector('script[data-seo-structured]')
      expect(script).toBeInTheDocument()
      expect(script).toHaveAttribute('type', 'application/ld+json')
      expect(script?.textContent).toBe(JSON.stringify(data))
    })

    it('removes JSON-LD script when structuredData is removed', () => {
      const { rerender } = render(<SEO structuredData={{ test: true }} />)
      expect(document.querySelector('script[data-seo-structured]')).toBeInTheDocument()

      rerender(<SEO />)
      expect(document.querySelector('script[data-seo-structured]')).not.toBeInTheDocument()
    })
  })

  describe('render behavior', () => {
    it('returns null (no DOM output)', () => {
      const { container } = render(<SEO />)

      expect(container.firstChild).toBeNull()
    })
  })
})

describe('JobOfferSEO', () => {
  beforeEach(() => {
    document.querySelectorAll('meta').forEach((meta) => {
      if (meta.name !== 'viewport' && !meta.getAttribute('charset')) {
        meta.remove()
      }
    })
    document.querySelectorAll('script[data-seo-structured]').forEach((script) => script.remove())
  })

  it('sets appropriate title', () => {
    render(
      <JobOfferSEO
        title="Frontend Developer"
        description="Job description"
        company="Tech Corp"
      />
    )

    expect(document.title).toContain('Frontend Developer')
  })

  it('creates JobPosting structured data', () => {
    render(
      <JobOfferSEO
        title="Frontend Developer"
        description="Job description"
        company="Tech Corp"
        location="Madrid"
        employmentType="FULL_TIME"
      />
    )

    const script = document.querySelector('script[data-seo-structured]')
    const data = JSON.parse(script?.textContent || '{}')

    expect(data['@type']).toBe('JobPosting')
    expect(data.title).toBe('Frontend Developer')
    expect(data.hiringOrganization.name).toBe('Tech Corp')
    expect(data.employmentType).toBe('FULL_TIME')
  })
})

describe('OrganizationSEO', () => {
  beforeEach(() => {
    document.querySelectorAll('meta').forEach((meta) => {
      if (meta.name !== 'viewport' && !meta.getAttribute('charset')) {
        meta.remove()
      }
    })
    document.querySelectorAll('script[data-seo-structured]').forEach((script) => script.remove())
  })

  it('sets appropriate title', () => {
    render(<OrganizationSEO name="Tech Corp" />)

    expect(document.title).toContain('Tech Corp')
  })

  it('creates Organization structured data', () => {
    render(
      <OrganizationSEO
        name="Tech Corp"
        description="A tech company"
        logo="https://example.com/logo.png"
        url="https://techcorp.com"
      />
    )

    const script = document.querySelector('script[data-seo-structured]')
    const data = JSON.parse(script?.textContent || '{}')

    expect(data['@type']).toBe('Organization')
    expect(data.name).toBe('Tech Corp')
    expect(data.description).toBe('A tech company')
    expect(data.logo).toBe('https://example.com/logo.png')
  })
})
