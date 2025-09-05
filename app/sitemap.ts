import { MetadataRoute } from 'next'
import { createSsrClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/types/database.types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = 'https://eleva-boutique.net'
    const supabase = await createSsrClient()
    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at, slug_ar')
        .eq('is_deleted', false)
        .limit(1000)

    const now = new Date().toISOString()

    const staticPages: MetadataRoute.Sitemap = [
        { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
        { url: `${base}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${base}/about`, lastModified: now },
        { url: `${base}/contact`, lastModified: now },
        { url: `${base}/shipping`, lastModified: now },
        { url: `${base}/returns`, lastModified: now },
        { url: `${base}/faq`, lastModified: now }
    ]

    type ProductLite = Pick<Tables<'products'>, 'slug' | 'slug_ar' | 'updated_at'>
    const productPages: MetadataRoute.Sitemap = (products as ProductLite[] | null || []).flatMap((p) => {
        const list: MetadataRoute.Sitemap = []
        if (p.slug) {
            list.push({
                url: `${base}/products/${p.slug}`,
                lastModified: p.updated_at || now,
                changeFrequency: 'weekly',
                priority: 0.7
            })
        }
        if (p.slug_ar) {
            list.push({
                url: `${base}/products/${p.slug_ar}?lang=ar`,
                lastModified: p.updated_at || now,
                changeFrequency: 'weekly',
                priority: 0.7
            })
        }
        return list
    })

    return [...staticPages, ...productPages]
}
