import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Droplets,
  Clock,
  Thermometer,
  Wind,
  Sun,
  Moon,
  Heart,
  Zap,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fragrance Guide - Eleva",
  description:
    "Learn about fragrance concentrations, longevity, and how to choose the perfect scent strength for your preferences.",
  keywords: [
    "fragrance guide",
    "perfume concentration",
    "EDT",
    "EDP",
    "parfum",
    "scent strength",
  ],
};

const fragranceTypes = [
  {
    name: "Parfum (Extrait de Parfum)",
    concentration: "20-30%",
    longevity: "6-8 hours",
    sillage: "Moderate to Strong",
    price: "Highest",
    description:
      "The most concentrated and luxurious form of fragrance. Rich, complex, and long-lasting.",
    icon: <Droplets className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    name: "Eau de Parfum (EDP)",
    concentration: "15-20%",
    longevity: "4-6 hours",
    sillage: "Moderate",
    price: "High",
    description:
      "Perfect balance of intensity and wearability. Ideal for evening wear and special occasions.",
    icon: <Heart className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
  {
    name: "Eau de Toilette (EDT)",
    concentration: "5-15%",
    longevity: "2-4 hours",
    sillage: "Light to Moderate",
    price: "Moderate",
    description:
      "Fresh and light, perfect for daily wear and warmer climates. Great for beginners.",
    icon: <Wind className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    name: "Eau de Cologne (EDC)",
    concentration: "2-5%",
    longevity: "1-2 hours",
    sillage: "Light",
    price: "Lower",
    description:
      "Light and refreshing, perfect for a quick refresh or layering with other scents.",
    icon: <Sun className="h-5 w-5" />,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
];

const applicationTips = [
  {
    title: "Pulse Points",
    description:
      "Apply to wrists, neck, behind ears, and inner elbows where blood flow is closest to skin surface.",
    icon: <Heart className="h-4 w-4 text-red-500" />,
  },
  {
    title: "Distance Matters",
    description:
      "Hold bottle 3-6 inches away from skin for even application without over-concentration.",
    icon: <Zap className="h-4 w-4 text-yellow-500" />,
  },
  {
    title: "Don't Rub",
    description:
      "Let the fragrance dry naturally. Rubbing can break down the scent molecules.",
    icon: <Info className="h-4 w-4 text-blue-500" />,
  },
  {
    title: "Layer Wisely",
    description:
      "Start with lighter concentrations and build up. Less is often more with quality fragrances.",
    icon: <Droplets className="h-4 w-4 text-purple-500" />,
  },
];

export default async function Page() {
  const t = await getTranslations('sizeGuide')
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
            <p className="text-xl text-gray-600">{t('description')}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Fragrance Types */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Fragrance Concentrations
              </h2>

              {fragranceTypes.map((type, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{type.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {type.concentration} fragrance oils
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{type.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Longevity</p>
                        <p className="text-sm font-medium">{type.longevity}</p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Wind className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Sillage</p>
                        <p className="text-sm font-medium">{type.sillage}</p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Droplets className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Concentration</p>
                        <p className="text-sm font-medium">
                          {type.concentration}
                        </p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Thermometer className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Price Range</p>
                        <p className="text-sm font-medium">{type.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Choosing the Right Concentration */}
            <Card>
              <CardHeader>
                <CardTitle>How to Choose the Right Concentration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Sun className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">
                          For Daytime
                        </h3>
                      </div>
                      <p className="text-sm text-blue-800 mb-2">
                        Choose lighter concentrations that won't be overwhelming
                        in close quarters.
                      </p>
                      <div className="text-xs text-blue-700">
                        <strong>Recommended:</strong> EDT, Light EDP
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Moon className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-purple-900">
                          For Evening
                        </h3>
                      </div>
                      <p className="text-sm text-purple-800 mb-2">
                        Richer concentrations work well for dinner, events, and
                        romantic occasions.
                      </p>
                      <div className="text-xs text-purple-700">
                        <strong>Recommended:</strong> EDP, Parfum
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Thermometer className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-900">
                          Hot Weather
                        </h3>
                      </div>
                      <p className="text-sm text-yellow-800 mb-2">
                        Heat amplifies fragrance, so lighter concentrations work
                        best in warm climates.
                      </p>
                      <div className="text-xs text-yellow-700">
                        <strong>Recommended:</strong> EDT, Light EDP
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Wind className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          Cool Weather
                        </h3>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">
                        Cold weather mutes fragrance, so stronger concentrations
                        perform better.
                      </p>
                      <div className="text-xs text-gray-700">
                        <strong>Recommended:</strong> EDP, Parfum
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Application Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applicationTips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">{tip.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {tip.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fragrance Longevity Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Factors Affecting Longevity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Remember:</strong> Fragrance performance varies
                      based on individual skin chemistry, climate, and
                      application method.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          1
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Skin Type
                        </h3>
                        <p className="text-sm text-gray-600">
                          Oily skin holds fragrance longer than dry skin.
                          Moisturized skin also helps retention.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          2
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Climate</h3>
                        <p className="text-sm text-gray-600">
                          Humidity and temperature affect how fragrance develops
                          and lasts on your skin.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          3
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Fragrance Family
                        </h3>
                        <p className="text-sm text-gray-600">
                          Orientals and woody scents typically last longer than
                          fresh citrus or green fragrances.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Reference */}
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900">
                    Quick Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Parfum:</span>
                      <span className="font-medium text-purple-900">
                        6-8 hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">EDP:</span>
                      <span className="font-medium text-purple-900">
                        4-6 hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">EDT:</span>
                      <span className="font-medium text-purple-900">
                        2-4 hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">EDC:</span>
                      <span className="font-medium text-purple-900">
                        1-2 hours
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Beginner's Tip */}
              <Card>
                <CardHeader>
                  <CardTitle>Beginner's Tip</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    New to fragrances? Start with an EDT in a scent family you
                    enjoy. It's lighter, more affordable, and perfect for
                    learning your preferences.
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Start with EDT
                  </Badge>
                </CardContent>
              </Card>

              {/* Seasonal Guide */}
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        Spring/Summer
                      </h3>
                      <p className="text-gray-600">EDT, Light EDP</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        Fall/Winter
                      </h3>
                      <p className="text-gray-600">EDP, Parfum</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
