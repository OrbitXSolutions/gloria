import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategories } from "@/lib/common/supabase-queries";

export default async function AppFooter() {
  const categories = await getCategories();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">Luxe Perfumes</h3>
              <p className="text-gray-400 leading-relaxed">
                Discover the world's finest fragrances. We curate premium
                perfumes from the most prestigious brands worldwide.
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/size-guide"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Categories</h4>
            <ul className="space-y-3">
              {categories.length > 0 ? (
                categories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug || category.id}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {category.name_en || "Unnamed Category"}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      href="/women"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Women's Perfumes
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/men"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Men's Cologne
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/unisex"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Unisex Fragrances
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/luxury"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Luxury Collection
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/new-arrivals"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      New Arrivals
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sale"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Sale Items
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Newsletter</h4>
            <p className="text-gray-400 mb-4">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            <div className="space-y-4">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-r-none"
                />
                <Button className="bg-secondary hover:bg-purple-700 rounded-l-none">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                By subscribing, you agree to our Privacy Policy and Terms of
                Service.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Luxe Perfumes. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
