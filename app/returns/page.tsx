import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RotateCcw,
  Clock,
  ShieldCheck,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Refunds - Eleva",
  description:
    "Learn about our return policy, how to return products, and get refunds for your Eleva fragrance purchases.",
  keywords: [
    "returns",
    "refunds",
    "return policy",
    "exchange",
    "money back guarantee",
  ],
};

export default async function Page() {
  const t = await getTranslations('returnsPage')
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
            {/* Return Policy Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                  Our Return Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription>
                    <strong>14-Day Return Window:</strong> You have 14 days from
                    the delivery date to return eligible items.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    What Can Be Returned:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Unopened fragrances in original packaging
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Defective or damaged products
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Wrong item received</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    What Cannot Be Returned:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">
                        Opened or used fragrances (due to hygiene reasons)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Items damaged by misuse</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">
                        Products without original packaging
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Return */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  How to Return Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">
                        1
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Contact Customer Service
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Email us at <strong>returns@eleva.com</strong> or call{" "}
                        <strong>+971 4 123 4567</strong> with your order number
                        and reason for return.
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
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Get Return Authorization
                      </h3>
                      <p className="text-gray-600 text-sm">
                        We'll provide you with a Return Authorization Number
                        (RAN) and prepaid return shipping label within 24 hours.
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
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Pack Your Items
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Securely pack the item in its original packaging.
                        Include the RAN and any accessories that came with the
                        product.
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
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Ship Your Return
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Attach the prepaid return label and drop off at any
                        Emirates Post office or schedule a pickup.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">
                        5
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Get Your Refund
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Once we receive and inspect your return, we'll process
                        your refund within 5-7 business days to your original
                        payment method.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Refund Processing Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Credit/Debit Cards
                      </h3>
                      <p className="text-sm text-gray-600">
                        5-7 business days after processing
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Cash on Delivery
                      </h3>
                      <p className="text-sm text-gray-600">
                        Bank transfer within 3-5 business days
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Note:</strong> Refund processing times may vary
                      depending on your bank or payment provider. Original
                      shipping costs are non-refundable unless the return is due
                      to our error.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Exchanges */}
            <Card>
              <CardHeader>
                <CardTitle>Exchanges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We currently don't offer direct exchanges. If you'd like a
                  different product, please return your original item for a
                  refund and place a new order for the desired item.
                </p>
                <p className="text-sm text-gray-500">
                  This ensures you get the fastest service and can take
                  advantage of any current promotions on your new purchase.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Need to Return Something?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/contact">Start Return Process</Link>
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      or contact us directly:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 justify-center">
                        <Mail className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">returns@eleva.com</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <Phone className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">+971 4 123 4567</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Return Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Track Your Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Already initiated a return? Track its status with your
                    Return Authorization Number.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/orders">Track Return Status</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Satisfaction Guarantee */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <ShieldCheck className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-purple-900 mb-2">
                      100% Satisfaction Guarantee
                    </h3>
                    <p className="text-sm text-purple-700">
                      Your satisfaction is our priority. We're committed to
                      making every purchase right.
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
