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
