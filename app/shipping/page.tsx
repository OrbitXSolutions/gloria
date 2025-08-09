import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Truck,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Information - Eleva",
  description:
    "Learn about our shipping options, delivery times, and policies for Eleva fragrance orders.",
  keywords: [
    "shipping",
    "delivery",
    "UAE shipping",
    "free shipping",
    "express delivery",
  ],
};

export default async function ShippingPage() {
  const t = await getTranslations('shippingPage')
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
            {/* Free Shipping Banner */}
            <Alert className="border-green-200 bg-green-50">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Free Shipping:</strong> Enjoy complimentary standard
                shipping on all orders within the UAE. No minimum purchase
                required!
              </AlertDescription>
            </Alert>

            {/* Shipping Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-purple-600" />
                  Shipping Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Standard Shipping
                        </h3>
                        <p className="text-sm text-gray-600">
                          Free for all orders
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        FREE
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">2-3 business days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Available across UAE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          Signature required upon delivery
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Express Shipping
                        </h3>
                        <p className="text-sm text-gray-600">
                          Next-day delivery
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-purple-200 text-purple-700"
                      >
                        AED 25
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Next business day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          Available in Dubai, Abu Dhabi, Sharjah
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          Priority handling and tracking
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Delivery Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Standard Delivery (2-3 days)
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• Dubai</p>
                      <p>• Abu Dhabi</p>
                      <p>• Sharjah</p>
                      <p>• Ajman</p>
                      <p>• Ras Al Khaimah</p>
                      <p>• Fujairah</p>
                      <p>• Umm Al Quwain</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Express Delivery (Next day)
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>• Dubai (all areas)</p>
                      <p>• Abu Dhabi (city center)</p>
                      <p>• Sharjah (main areas)</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Express delivery may not be available in remote areas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Order Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">
                        1
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order Confirmation
                      </h3>
                      <p className="text-sm text-gray-600">
                        You'll receive an email confirmation immediately after
                        placing your order.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">
                        2
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Processing (24-48 hours)
                      </h3>
                      <p className="text-sm text-gray-600">
                        We carefully pick, pack, and prepare your order for
                        shipment.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">
                        3
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Dispatch Notification
                      </h3>
                      <p className="text-sm text-gray-600">
                        You'll receive tracking information once your order
                        ships.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">
                        4
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Delivery</h3>
                      <p className="text-sm text-gray-600">
                        Your order arrives at your doorstep within the estimated
                        timeframe.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Considerations */}
            <Card>
              <CardHeader>
                <CardTitle>Important Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Weekend Deliveries:</strong> Orders placed on
                      Friday after 2 PM or during weekends will be processed on
                      the next business day.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Delivery Requirements:
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • Someone must be available to receive the package
                      </li>
                      <li>• Valid ID required for age verification (18+)</li>
                      <li>• Signature required upon delivery</li>
                      <li>• If unavailable, delivery will be rescheduled</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Packaging:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • All items are securely packaged to prevent damage
                      </li>
                      <li>• Fragile items receive extra protection</li>
                      <li>• Discreet packaging available upon request</li>
                      <li>• Eco-friendly packaging materials used</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Shipping Guarantee */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <ShieldCheck className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-purple-900 mb-2">
                      Shipping Guarantee
                    </h3>
                    <p className="text-sm text-purple-700">
                      If your order doesn't arrive within the estimated delivery
                      time, contact us for a full refund or replacement.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Track Your Order */}
              <Card>
                <CardHeader>
                  <CardTitle>Track Your Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Once your order ships, you'll receive a tracking number to
                    monitor your package's progress.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <span>Real-time tracking updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span>Estimated delivery time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span>Delivery location updates</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Payment Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>• Credit/Debit Cards</p>
                    <p>• Cash on Delivery (COD)</p>
                    <p>• Bank Transfer</p>
                    <p className="text-xs text-gray-500 mt-3">
                      All payments are processed securely with SSL encryption.
                    </p>
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
