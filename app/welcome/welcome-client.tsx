"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Sparkles,
  Gift,
  Crown,
  ArrowRight,
  Mail,
  Smartphone,
  ShoppingBag,
  Heart,
  Star,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useSupabase } from "@/components/_core/providers/SupabaseProvider";

export default function WelcomeClient() {
  const [confirmationType, setConfirmationType] = useState<
    "email" | "phone" | null
  >(null);
  const { user } = useSupabase();
  const userFirstName = user?.user_metadata?.first_name || "User";
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState(userFirstName);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type") as "email" | "phone";
    const email = searchParams.get("email");
    const name = searchParams.get("name");

    if (type) setConfirmationType(type);
    if (email) setUserEmail(decodeURIComponent(email));
    if (name) setUserName(decodeURIComponent(name));
  }, [searchParams, user]);

  const handleContinue = () => {
    router.push("/");
  };

  const handleStartShopping = () => {
    router.push("/products");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex min-h-screen">
        {/* Left side - Luxury Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 z-10" />
          <img
            src="/placeholder.svg?height=1080&width=720"
            alt="Welcome to ELEVA"
            className="w-full h-full object-cover"
          />

          {/* Floating elements */}
          <motion.div
            className="absolute top-20 left-10 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-semibold text-gray-900">VIP Member</p>
                  <p className="text-xs text-gray-600">Exclusive Access</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-20 right-10 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <Gift className="w-6 h-6 text-pink-600" />
                <div>
                  <p className="font-semibold text-gray-900">Welcome Gift</p>
                  <p className="text-xs text-gray-600">20% Off First Order</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Brand overlay */}
          <div className="absolute bottom-10 left-10 z-20">
            <div className="text-white">
              <h3 className="text-2xl font-light tracking-wider">ELEVA</h3>
              <p className="text-white/80 text-sm">Elevate Your Style</p>
            </div>
          </div>
        </div>

        {/* Right side - Welcome Content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <motion.div
            className="w-full max-w-md space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-light tracking-wider text-gray-900">
                ELEVA
              </h1>
              <p className="text-gray-600 text-sm">Elevate Your Style</p>
            </div>

            {/* Success Icon */}
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </motion.div>

            {/* Welcome Message */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Badge
                  variant="secondary"
                  className="mb-4 bg-gray-100 text-gray-700 px-4 py-1"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Account Confirmed
                </Badge>

                <h1 className="text-3xl font-light text-gray-900 mb-2">
                  Welcome{userName ? `, ${userName}` : ""}!
                </h1>

                <p className="text-gray-600 leading-relaxed">
                  Your {confirmationType === "email" ? "email" : "phone number"}{" "}
                  has been successfully verified. You're now part of the ELEVA
                  family and ready to discover luxury fashion.
                </p>
              </motion.div>

              {/* Confirmation Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center space-x-3">
                  {confirmationType === "email" ? (
                    <Mail className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    {confirmationType === "email"
                      ? userEmail
                      : "Phone verified"}
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </motion.div>
            </div>

            {/* Welcome Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Your VIP Benefits
              </h3>

              <div className="grid gap-3">
                <Card className="border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Welcome Gift</p>
                      <p className="text-sm text-gray-600">
                        20% off your first order
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">VIP Access</p>
                      <p className="text-sm text-gray-600">
                        Early access to new collections
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Premium Support
                      </p>
                      <p className="text-sm text-gray-600">
                        Priority customer service
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={handleStartShopping}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all duration-300 group"
              >
                <ShoppingBag className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={handleContinue}
                variant="outline"
                className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all duration-300"
              >
                <Heart className="mr-2 h-4 w-4" />
                Explore ELEVA
              </Button>
            </motion.div>

            {/* Footer Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-center pt-6 border-t border-gray-200"
            >
              <div className="flex justify-center space-x-6 text-sm">
                <Link
                  href="/size-guide"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Size Guide
                </Link>
                <Link
                  href="/shipping"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Shipping Info
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Support
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
