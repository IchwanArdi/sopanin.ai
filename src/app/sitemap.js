export default function sitemap() {
  return [
    {
      url: 'https://sopanin.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // If you have other static pages like /about or /terms, add them here:
    /*
    {
      url: 'https://sopanin.ai/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    */
  ]
}
