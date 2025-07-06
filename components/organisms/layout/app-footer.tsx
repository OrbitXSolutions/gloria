import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategories } from "@/lib/common/supabase-queries";
import { ContactInfo } from "@/lib/constants/contact-info";

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
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Link
                  href={ContactInfo.FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Link
                  href={ContactInfo.INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              </Button>
              {/* whatsapp */}
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Link
                  href={ContactInfo.WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-whatsapp"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                </Link>
              </Button>
              {/* Email */}
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Link
                  href={`mailto:${ContactInfo.EMAIL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Mail className="h-5 w-5" />
                </Link>
              </Button>

              {/* <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Twitter className="h-5 w-5" />
              </Button> */}
              {/* <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-2"
              >
                <Youtube className="h-5 w-5" />
              </Button> */}
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
          {/* <div>
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
          </div> */}
          {/* Customer Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Customer Support</h4>
            <p className="text-gray-400 mb-4">
              Have questions or need help with your order? We're here for you.
            </p>
            <ul className="space-y-3 text-gray-400">
              <li>
                <span className="font-medium text-white">Phone:</span>{" "}
                <a
                  href={`tel:${ContactInfo.PHONE}`}
                  className="hover:text-white"
                >
                  {ContactInfo.PHONE}
                </a>
              </li>
              <li>
                <span className="font-medium text-white">Email:</span>{" "}
                <a
                  href={`mailto:${ContactInfo.EMAIL}`}
                  className="hover:text-white"
                >
                  {ContactInfo.EMAIL}
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <Link href="/contact" className="inline-block">
                <Button variant="secondary">Contact Us</Button>
              </Link>
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
