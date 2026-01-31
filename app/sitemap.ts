import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://optinodeiq.com'
  const oiPages = [
    '/oi',
    '/oi/what-is-optimized-intelligence',
    '/oi/optimized-intelligence-vs-ai',
    '/oi/how-optimized-intelligence-works',
    '/oi/building-nodes-with-optimized-intelligence',
    '/oi/oi-for-health-decisions',
    '/oi/oi-for-business-decisions',
    '/oi/oi-for-market-decisions',
    '/oi/oi-for-parenting-decisions',
    '/oi/oi-for-home-improvement-decisions',
    '/oi/oi-for-tradeshow-leads',
    '/oi/oi-framework-checklist',
    '/oi/oi-verification-rules',
    '/oi/oi-decision-flows',
    '/oi/oi-playbooks'
  ]

  return oiPages.map(url => ({
    url: base + url,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7
  }))
}
