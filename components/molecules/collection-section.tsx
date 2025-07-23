'use client';

import { useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, TrendingUp, Clock } from 'lucide-react';

interface Props {
    className?: string;
}

export default function CollectionSection({ className }: Props) {
    const locale = useLocale();
    const isAr = locale === 'ar';

    return (
        <section className={`relative py-8 px-4 overflow-hidden ${className} bg-primary-100`} style={{ minHeight: '220px' }}>


            <div className="relative max-w-7xl mx-auto z-10">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Sparkles className="w-6 h-6 text-amber-500 drop-shadow" />
                        <Badge variant="secondary" className="text-sm font-medium bg-secondary-400 backdrop-blur border border-secondary shadow">
                            {isAr ? 'مجموعة حصرية' : 'Exclusive Collection'}
                        </Badge>
                        <Sparkles className="w-6 h-6 text-amber-500 drop-shadow" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary  drop-shadow">
                        {isAr ? 'منتجاتنا' : 'Our Collection'}
                    </h2>
                    <p className="text-primary md:text-lg max-w-2xl mx-auto leading-relaxed">
                        {isAr
                            ? 'اكتشف مجموعتنا الحصرية من العطور – صُممت بعناية لتجسّد الأناقة والفخامة والتفرّد.'
                            : 'Discover our exclusive range of perfumes – each crafted to express elegance, luxury, and individuality.'}
                    </p>
                    <p className="text-sm text-primary mt-2 max-w-xl mx-auto">
                        {isAr
                            ? 'تصفّح أفضل العطور مبيعًا، واختيارات الموسم، والكلاسيكيات التي لا تفقد رونقها'
                            : 'Explore bestsellers, seasonal favorites, and timeless classics designed for every moment.'}
                    </p>
                </div>
                {/* Features Grid */}
                <div className="flex justify-center gap-6 mb-8">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center shadow group-hover:bg-amber-200 transition-colors">
                            <Star className="w-7 h-7 text-amber-600" />
                        </div>
                        <span className="mt-2 text-xs font-semibold text-primary">
                            {isAr ? 'الأكثر مبيعًا' : 'Bestsellers'}
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center shadow group-hover:bg-rose-200 transition-colors">
                            <TrendingUp className="w-7 h-7 text-rose-600" />
                        </div>
                        <span className="mt-2 text-xs font-semibold text-primary">
                            {isAr ? 'الموسم' : 'Seasonal'}
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center shadow group-hover:bg-purple-200 transition-colors">
                            <Clock className="w-7 h-7 text-purple-600" />
                        </div>
                        <span className="mt-2 text-xs font-semibold text-primary">
                            {isAr ? 'كلاسيكي' : 'Classic'}
                        </span>
                    </div>
                </div>
                {/* CTA Section */}
                {/* <div className="text-center">
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
                    >
                        {isAr ? 'استكشف المجموعة' : 'Explore Collection'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                        {isAr ? 'شحن مجاني للطلبات فوق 500 ريال' : 'Free shipping on orders over $100'}
                    </p>
                </div> */}
            </div>
        </section>
    );
} 