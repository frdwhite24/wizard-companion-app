import type { RequestHandler } from './$types'

export const prerender = true

export const GET: RequestHandler = async () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://d3cfpk4ju180uf.cloudfront.net</loc>
        <lastmod>2025-02-18</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
    </urlset>`.trim()

  return new Response(sitemap)
}
