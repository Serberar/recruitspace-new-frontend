import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  // Twitter
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  // Additional
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: string;
  author?: string;
  // Structured data
  structuredData?: object;
}

/**
 * SEO Component for React 19
 * Uses native DOM manipulation since react-helmet-async doesn't support React 19 yet
 */
export function SEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  noindex = false,
  nofollow = false,
  keywords,
  author,
  structuredData,
}: SEOProps) {
  const { t } = useTranslation('common');

  const DEFAULT_TITLE = t('app.name');
  const DEFAULT_DESCRIPTION = t('app.name');

  const actualDescription = description || DEFAULT_DESCRIPTION;
  const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to set/update meta tag
    const setMeta = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;

      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to remove meta tag
    const removeMeta = (name: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      const meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (meta) meta.remove();
    };

    // Basic meta tags
    setMeta('description', actualDescription);

    // Robots
    const robotsContent = [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow',
    ].join(', ');
    setMeta('robots', robotsContent);

    // Keywords
    if (keywords) {
      setMeta('keywords', keywords);
    } else {
      removeMeta('keywords');
    }

    // Author
    if (author) {
      setMeta('author', author);
    }

    // Open Graph
    setMeta('og:title', ogTitle || fullTitle, true);
    setMeta('og:description', ogDescription || actualDescription, true);
    setMeta('og:type', ogType, true);

    if (ogUrl) {
      setMeta('og:url', ogUrl, true);
    } else {
      setMeta('og:url', window.location.href, true);
    }

    if (ogImage) {
      setMeta('og:image', ogImage, true);
    } else {
      removeMeta('og:image', true);
    }

    // Twitter Card
    setMeta('twitter:card', twitterCard);
    setMeta('twitter:title', twitterTitle || ogTitle || fullTitle);
    setMeta('twitter:description', twitterDescription || ogDescription || actualDescription);

    if (twitterImage || ogImage) {
      setMeta('twitter:image', twitterImage || ogImage || '');
    } else {
      removeMeta('twitter:image');
    }

    // Canonical URL
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    } else if (link) {
      link.remove();
    }

    // Structured Data (JSON-LD)
    const existingScript = document.querySelector('script[data-seo-structured]');
    if (structuredData) {
      if (existingScript) {
        existingScript.textContent = JSON.stringify(structuredData);
      } else {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-structured', 'true');
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    } else if (existingScript) {
      existingScript.remove();
    }

    // Cleanup function - restore defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [
    fullTitle,
    actualDescription,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    noindex,
    nofollow,
    keywords,
    author,
    structuredData,
    DEFAULT_TITLE,
  ]);

  return null;
}

// Preset for job offer pages
export interface JobOfferSEOProps {
  title: string;
  description: string;
  location?: string;
  salary?: string;
  company: string;
  companyLogo?: string;
  datePosted?: string;
  validThrough?: string;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN';
  url?: string;
}

export function JobOfferSEO({
  title,
  description,
  location,
  salary,
  company,
  companyLogo,
  datePosted,
  validThrough,
  employmentType = 'FULL_TIME',
  url,
}: JobOfferSEOProps) {
  const { t } = useTranslation('common');

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title,
    description,
    identifier: {
      '@type': 'PropertyValue',
      name: company,
      value: url || window.location.href,
    },
    hiringOrganization: {
      '@type': 'Organization',
      name: company,
      ...(companyLogo && { logo: companyLogo }),
    },
    ...(datePosted && { datePosted }),
    ...(validThrough && { validThrough }),
    employmentType,
    ...(location && {
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: location,
        },
      },
    }),
    ...(salary && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'EUR',
        value: {
          '@type': 'QuantitativeValue',
          value: salary,
        },
      },
    }),
  };

  return (
    <SEO
      title={t('seo.jobOffer.title', { job: title, company })}
      description={`${description.substring(0, 150)}...`}
      ogType="article"
      ogTitle={`${title} - ${company}`}
      ogDescription={description.substring(0, 200)}
      ogImage={companyLogo}
      structuredData={structuredData}
    />
  );
}

// Preset for organization pages
export interface OrganizationSEOProps {
  name: string;
  description?: string;
  logo?: string;
  url?: string;
}

export function OrganizationSEO({
  name,
  description,
  logo,
  url,
}: OrganizationSEOProps) {
  const { t } = useTranslation('common');

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    name,
    ...(description && { description }),
    ...(logo && { logo }),
    ...(url && { url }),
  };

  return (
    <SEO
      title={`${t('public.jobsList.title')} ${name}`}
      description={description || `${t('public.jobsList.title')} ${name}. ${t('public.jobsList.subtitle')}.`}
      ogTitle={`${t('public.jobsList.title')} ${name}`}
      ogDescription={description}
      ogImage={logo}
      structuredData={structuredData}
    />
  );
}

export default SEO;
