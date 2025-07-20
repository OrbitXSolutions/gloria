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
        <section className={`py-16 px-4 ${className}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                        <Badge variant="secondary" className="text-sm font-medium">
                            {isAr ? 'مجموعة حصرية' : 'Exclusive Collection'}
                        </Badge>
                        <Sparkles className="w-6 h-6 text-amber-500" />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
                        {isAr ? 'منتجاتنا' : 'Our Collection'}
                    </h2>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        {isAr
                            ? 'اكتشف مجموعتنا الحصرية من العطور – صُممت بعناية لتجسّد الأناقة والفخامة والتفرّد.'
                            : 'Discover our exclusive range of perfumes – each crafted to express elegance, luxury, and individuality.'
                        }
                    </p>

                    <p className="text-base text-muted-foreground mt-4 max-w-2xl mx-auto">
                        {isAr
                            ? 'تصفّح أفضل العطور مبيعًا، واختيارات الموسم، والكلاسيكيات التي لا تفقد رونقها'
                            : 'Explore bestsellers, seasonal favorites, and timeless classics designed for every moment.'
                        }
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <Card className="group hover:shadow-lg transition-all duration-300 border-amber-100 hover:border-amber-200">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                                <Star className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {isAr ? 'أفضل العطور مبيعًا' : 'Bestsellers'}
                            </h3>
                            <p className="text-muted-foreground">
                                {isAr
                                    ? 'اكتشف العطور الأكثر طلبًا من عملائنا'
                                    : 'Discover our most loved fragrances'
                                }
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all duration-300 border-rose-100 hover:border-rose-200">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-200 transition-colors">
                                <TrendingUp className="w-6 h-6 text-rose-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {isAr ? 'اختيارات الموسم' : 'Seasonal Favorites'}
                            </h3>
                            <p className="text-muted-foreground">
                                {isAr
                                    ? 'عطور تناسب كل فصل من فصول السنة'
                                    : 'Fragrances perfect for every season'
                                }
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all duration-300 border-purple-100 hover:border-purple-200">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {isAr ? 'كلاسيكيات خالدة' : 'Timeless Classics'}
                            </h3>
                            <p className="text-muted-foreground">
                                {isAr
                                    ? 'عطور كلاسيكية لا تفقد رونقها مع الزمن'
                                    : 'Classic fragrances that never go out of style'
                                }
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {isAr ? 'استكشف المجموعة' : 'Explore Collection'}
                    </Button>

                    <p className="text-sm text-muted-foreground mt-4">
                        {isAr
                            ? 'شحن مجاني للطلبات فوق 500 ريال'
                            : 'Free shipping on orders over $100'
                        }
                    </p>
                </div>
            </div>
        </section>
    );
} 