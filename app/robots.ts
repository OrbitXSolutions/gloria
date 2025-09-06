import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/',
                    '/checkout',
                    '/cart',
                    '/profile',
                    '/orders',
                    '/welcome'
                ]
            }
        ],
        sitemap: 'https://www.glorianaturals.ae/sitemap.ts'
    }
}
