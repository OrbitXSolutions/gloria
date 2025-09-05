"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Facebook,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactInfo } from "@/lib/constants/contact-info";
import {
  sendContactEmail,
  type ContactFormInput,
} from "@/app/_actions/send-contact-email";

export default function Contact() {
  const t = useTranslations("contact")
  const [formData, setFormData] = useState<ContactFormInput>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  // Use the server action with next-safe-action
  const { execute, result, isExecuting, reset } = useAction(sendContactEmail, {
    onSuccess: () => {
      // Reset form on successful submission
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear any previous results when user starts typing
    if (result) {
      reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    execute(formData);
  };

  // Get field-specific validation errors
  const getFieldError = (
    fieldName: keyof ContactFormInput
  ): string | undefined => {
    if (result?.validationErrors?.[fieldName]) {
      return result.validationErrors[fieldName]?._errors?.[0];
    }
    return undefined;
  };

  return (
    <section className="py-16 bg-primary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t("info.title")}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-secondary-100 rounded-full p-3">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t("info.phone")}</h4>
                    <p className="text-gray-600">{ContactInfo.PHONE}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-secondary-100 rounded-full p-3">
                    <Mail className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t("info.email")}</h4>
                    <p className="text-gray-600">{ContactInfo.EMAIL}</p>
                    <div className="flex space-x-4 mt-3 animate-fadein">
                      <a
                        href={ContactInfo.FACEBOOK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-primary transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a
                        href={ContactInfo.INSTAGRAM}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-primary transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a
                        href={ContactInfo.WHATSAPP}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-primary transition-colors"
                        aria-label="WhatsApp"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="bi bi-whatsapp"
                          viewBox="0 0 16 16"
                        >
                          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t("form.title")}
            </h3>

            {/* Success Message */}
            {result?.data?.success && (
              <div className="mb-6 p-4 rounded-lg flex items-center space-x-3 bg-green-50 text-green-800 border border-green-200">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{result.data.message}</p>
              </div>
            )}

            {/* Server Error Message */}
            {result?.serverError && (
              <div className="mb-6 p-4 rounded-lg flex items-center space-x-3 bg-red-50 text-red-800 border border-red-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{result.serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    {t("form.firstName")} *
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t("form.placeholders.firstName")}
                    className={
                      getFieldError("firstName") ? "border-red-500" : ""
                    }
                    disabled={isExecuting}
                  />
                  {getFieldError("firstName") && (
                    <p className="text-red-600 text-sm mt-1">
                      {getFieldError("firstName")}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    {t("form.lastName")} *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t("form.placeholders.lastName")}
                    className={
                      getFieldError("lastName") ? "border-red-500" : ""
                    }
                    disabled={isExecuting}
                  />
                  {getFieldError("lastName") && (
                    <p className="text-red-600 text-sm mt-1">
                      {getFieldError("lastName")}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  {t("form.email")} *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t("form.placeholders.email")}
                  className={getFieldError("email") ? "border-red-500" : ""}
                  disabled={isExecuting}
                />
                {getFieldError("email") && (
                  <p className="text-red-600 text-sm mt-1">
                    {getFieldError("email")}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  {t("form.subject")} *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder={t("form.placeholders.subject")}
                  className={getFieldError("subject") ? "border-red-500" : ""}
                  disabled={isExecuting}
                />
                {getFieldError("subject") && (
                  <p className="text-red-600 text-sm mt-1">
                    {getFieldError("subject")}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  {t("form.message")} *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t("form.placeholders.message")}
                  className={getFieldError("message") ? "border-red-500" : ""}
                  disabled={isExecuting}
                />
                {getFieldError("message") && (
                  <p className="text-red-600 text-sm mt-1">
                    {getFieldError("message")}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isExecuting}
                className="w-full bg-secondary hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isExecuting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  t("form.send")
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
