import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
    const t = await getTranslations('notFound')
    return (
        <div className="min-h-[60vh] grid place-items-center px-6 py-24 sm:py-32">
            <div className="text-center">
                <p className="text-base font-semibold text-primary">404</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    {t('title')}
                </h1>
                <p className="mt-6 text-base leading-7 text-gray-600">{t('description')}</p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        href="/"
                        className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                    >
                        {t('goHome')}
                    </Link>
                </div>
            </div>
        </div>
    )
}


