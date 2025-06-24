import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Eleva",
  description:
    "Find answers to common questions about Eleva fragrances, shipping, returns, and more.",
  keywords: [
    "FAQ",
    "questions",
    "help",
    "support",
    "perfume help",
    "fragrance questions",
  ],
};

const faqData = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        question: "How long does shipping take?",
        answer:
          "We offer free standard shipping within the UAE, which typically takes 2-3 business days. Express shipping (next-day delivery) is available for an additional fee.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Currently, we only ship within the United Arab Emirates. We're working on expanding our shipping coverage to other Gulf countries soon.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes! Once your order ships, you'll receive a tracking number via email and SMS. You can also track your order in your account dashboard.",
      },
      {
        question: "What if my order is damaged during shipping?",
        answer:
          "We package all orders with care, but if your item arrives damaged, please contact us within 48 hours with photos. We'll arrange a replacement or full refund immediately.",
      },
    ],
  },
  {
    category: "Products & Authenticity",
    questions: [
      {
        question: "Are all your fragrances authentic?",
        answer:
          "Absolutely! We source all our perfumes directly from authorized distributors and brand partners. Every product comes with a guarantee of authenticity.",
      },
      {
        question: "How should I store my perfumes?",
        answer:
          "Store your fragrances in a cool, dry place away from direct sunlight and heat. Avoid the bathroom as humidity can affect the scent. Keep bottles upright and tightly closed.",
      },
      {
        question: "How long do perfumes last?",
        answer:
          "Most fragrances have a shelf life of 3-5 years when stored properly. Unopened bottles can last even longer. The longevity on skin varies by fragrance type and individual skin chemistry.",
      },
      {
        question: "What's the difference between EDT, EDP, and parfum?",
        answer:
          "EDT (Eau de Toilette) has 5-15% fragrance oils, EDP (Eau de Parfum) has 15-20%, and Parfum has 20-30%. Higher concentrations last longer and are more intense.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 14-day return policy for unopened items in original packaging. Due to hygiene reasons, opened fragrances cannot be returned unless defective.",
      },
      {
        question: "How do I return an item?",
        answer:
          "Contact our customer service team to initiate a return. We'll provide you with a prepaid return label and instructions. Refunds are processed within 5-7 business days.",
      },
      {
        question: "Can I exchange a fragrance for a different scent?",
        answer:
          "Exchanges are only possible for unopened items within 14 days of purchase. The item must be in original condition with all packaging intact.",
      },
    ],
  },
  {
    category: "Account & Payment",
    questions: [
      {
        question: "Do I need to create an account to shop?",
        answer:
          "You can shop as a guest, but creating an account lets you track orders, save favorites, and enjoy faster checkout on future purchases.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and cash on delivery within the UAE.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your complete card details on our servers.",
      },
      {
        question: "Can I cancel my order?",
        answer:
          "Orders can be cancelled within 1 hour of placement if they haven't been processed. After that, please contact customer service for assistance.",
      },
    ],
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Find answers to common questions about our products, shipping, and
              policies.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {faqData.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {category.category}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem
                          key={faqIndex}
                          value={`${categoryIndex}-${faqIndex}`}
                        >
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  Still Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Call Us</p>
                      <p className="text-sm text-gray-600">+971 4 123 4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Email Us</p>
                      <p className="text-sm text-gray-600">support@eleva.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Business Hours</p>
                      <p className="text-sm text-gray-600">Sun-Thu: 9AM-8PM</p>
                      <p className="text-sm text-gray-600">Fri-Sat: 10AM-6PM</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 text-center">
                    Can't find what you're looking for? Our customer service
                    team is here to help!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
