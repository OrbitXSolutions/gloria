import { service_providers } from "@/lib/generated/prisma";
import { z } from "zod/v4"; // Or your standard Zod import

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB for logo
const MAX_ID_CARD_SIZE_BYTES = 2 * 1024 * 1024; // 2MB for ID cards
const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024; // 25MB for video (adjust as needed)
const MAX_CERTIFICATE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per certificate
const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per document

const ACCEPTED_IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif", // Added gif as a common image type
];
const ACCEPTED_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]; // Added avi
const ACCEPTED_DOCUMENT_MIMES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/jpeg", // Allow images as "documents" too
  "image/png",
  "image/webp",
];
export const serviceDeliveryMethods = ["online", "offline", "both"] as const;

export const serviceProviderSocialMediaSchema = z.object({
  facebook_url: z.url("رابط فيسبوك غير صالح").optional().or(z.literal("")),
  instagram_url: z.url("رابط إنستاجرام غير صالح").optional(),
  whatsapp_url: z
    .url("رابط واتساب غير صالح (مثال: https://wa.me/201234567890)")
    .optional(),

  official_url: z
    .url("رابط الموقع الرسمي غير صالح")
    .optional()
    .or(z.literal("")),

  other_urls: z
    .string()
    .max(500, "قائمة الروابط الأخرى طويلة جداً")
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const urls = val
          .split(",")
          .map((u) => u.trim())
          .filter((u) => u.length > 0);
        if (urls.length > 4) return false;
        return urls.every((url) => /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(url));
      },
      { error: "يرجى تقديم روابط صالحة (بحد أقصى 4 روابط) مفصولة بفواصل." }
    ),
});

export const serviceDetails = z.object({
  logo_image: z.string().optional(),
  logo_image_file: z
    .file("اختر صورة")
    .max(MAX_LOGO_SIZE_BYTES, "حجم الصورة كبير")
    .mime(ACCEPTED_IMAGE_MIMES, "صيغة الصورة غير مدعومة")
    .optional()
    .nullable(),
  service_name: z
    .string("اسم الخدمة مطلوب")
    .min(3, "اسم الخدمة يجب أن يكون 3 أحرف على الأقل")
    .max(100, "اسم الخدمة طويل جداً"),
  service_description: z
    .string("وصف الخدمة مطلوب")
    .min(10, "وصف الخدمة يجب أن يكون 10 أحرف على الأقل")
    .max(1000, "وصف الخدمة طويل جداً"),
  service_category_id: z.uuid("يرجى اختيار فئة خدمة صحيحة"),

  service_delivery_method: z.enum(
    serviceDeliveryMethods,
    "يرجى اختيار طريقة تسليم الخدمة"
  ),

  services: z
    .array(z.string().max(255, "اسم الخدمة طويل جداً"))
    .max(10, "يمكنك إضافة 10 خدمات كحد أقصى")
    .optional()
    .pipe(
      z.transform((val) => {
        if (!val || val.length === 0) return "";
        return val.join(",").trim();
      })
    ),
  // .string()
  // .max(500, "قائمة الخدمات الفرعية طويلة جداً")
  // .optional()
  // .refine(
  //   (val) =>
  //     !val ||
  //     val
  //       .split(",")
  //       .every((s) => s.trim().length > 0 && s.trim().length <= 50),
  //   {
  //     error:
  //       "كل خدمة فرعية يجب ألا تتجاوز 50 حرفًا وأن لا تكون فارغة عند الفصل بفواصل.",
  //   }
  // )
  // .refine((val) => !val || val.split(",").length <= 10, {
  //   error: "يمكنك إضافة 10 خدمات فرعية كحد أقصى.",
  // }),
  slug: z
    .string("الرابط التعريفي مطلوب")
    .min(3, "الرابط التعريفي يجب أن يكون 3 أحرف على الأقل")
    .max(50, "الرابط التعريفي طويل جداً")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "الرابط التعريفي يجب أن يحتوي على أحرف صغيرة وأرقام وفواصل '-' فقط"
    ),
  keywords: z
    .array(z.string().max(30, "الكلمة المفتاحية طويلة جداً"))
    .max(10, "يمكنك إضافة 10 كلمات مفتاحية كحد أقصى")
    .optional()
    .pipe(
      z.transform((val) => {
        if (!val || val.length === 0) return "";
        return val.join(",").trim();
      })
    ),
  // .string()
  // .max(255, "الكلمات المفتاحية طويلة جداً")
  // .optional()
  // .refine(
  //   (val) =>
  //     !val ||
  //     val
  //       .split(",")
  //       .every((s) => s.trim().length > 0 && s.trim().length <= 30),
  //   {
  //     message:
  //       "كل كلمة مفتاحية يجب ألا تتجاوز 30 حرفًا وأن لا تكون فارغة عند الفصل بفواصل.",
  //   }
  // )
  // .refine((val) => !val || val.split(",").length <= 10, {
  //   message: "يمكنك إضافة 10 كلمات مفتاحية كحد أقصى.",
  // }),
});

export const providerDetailsSchema = z.object({
  years_of_experience: z
    .number("سنوات الخبرة مطلوبة")
    .int("سنوات الخبرة يجب أن تكون رقمًا صحيحًا")
    .min(0, "سنوات الخبرة يجب أن تكون رقمًا موجبًا")
    .max(60, "سنوات الخبرة تبدو غير واقعية (الحد الأقصى 60)"),

  address: z.string("العنوان مطلوب").max(255, "العنوان طويل جداً").optional(),
  phone: z.string("رقم الهاتف مطلوب").max(20, "رقم الهاتف طويل جداً"),

  bio: z
    .string("السيرة الذاتية مطلوبة")
    .max(1000, "النبذة التعريفية طويلة جداً")
    .optional(),
});

export const privateDocumentsSchema = z.object({
  id_card_front_file: z
    .file("اختر صورة للبطاقة الشخصية")
    .max(MAX_ID_CARD_SIZE_BYTES, "حجم صورة البطاقة كبير")
    .mime(ACCEPTED_IMAGE_MIMES, "صيغة صورة البطاقة غير مدعومة")
    .optional()
    .nullable(),
  id_card_front_image: z.string().optional(),
  id_card_back_file: z
    .file("اختر صورة للبطاقة الشخصية (الجهة الخلفية)")
    .max(MAX_ID_CARD_SIZE_BYTES, "حجم صورة البطاقة كبير")
    .mime(ACCEPTED_IMAGE_MIMES, "صيغة صورة البطاقة غير مدعومة")
    .nullable(),
  id_card_back_image: z.string().optional(),
  video_url_file: z
    .file("اختر فيديو تعريفي")
    .max(MAX_VIDEO_SIZE_BYTES, "حجم الفيديو كبير جداً")
    .mime(ACCEPTED_VIDEO_MIMES, "صيغة الفيديو غير مدعومة")
    .optional()
    .nullable(),
  video_url: z.string().optional(),
  certificates_images: z
    .array(z.string())
    .optional()

    .pipe(
      z.transform((val) => {
        if (!val || val.length === 0) return "";
        return val.join(", ").trim();
      })
    )
    .nullable(),

  certificates_images_files: z
    .array(
      z
        .file("اختر شهادة")
        .max(MAX_CERTIFICATE_SIZE_BYTES, "حجم الشهادة كبير جداً")
        .mime(ACCEPTED_DOCUMENT_MIMES, "صيغة الشهادة غير مدعومة")
    )
    .max(5, "يمكنك إضافة 5 شهادات كحد أقصى")
    .optional(),
  document_list: z
    .array(z.string())
    .optional()
    .pipe(
      z.transform((val) => {
        if (!val || val.length === 0) return "";
        return val.join(",").trim();
      })
    )
    .nullable(),
  document_list_files: z
    .array(
      z
        .file("اختر مستنداً إضافياً")
        .max(MAX_DOCUMENT_SIZE_BYTES, "حجم المستند كبير جداً")
        .mime(ACCEPTED_DOCUMENT_MIMES, "صيغة المستند غير مدعومة")
    )
    .max(5, "يمكنك إضافة 5 مستندات إضافية كحد أقصى")
    .nullable(),

  notes: z.string().max(500, "الملاحظات طويلة جداً").optional(),
});

export const serviceProviderSchema = z.object({
  ...serviceDetails.shape,
  ...serviceProviderSocialMediaSchema.shape,
  ...providerDetailsSchema.shape,
  ...privateDocumentsSchema.shape,
});

export const serviceProviderTestSchema = z.object({
  service_name: z.string().min(3, "اسم الخدمة مطلوب"),
  logo_image_file: z
    .file("اختر صورة")
    .max(MAX_LOGO_SIZE_BYTES, "حجم الصورة كبير")
    .mime(ACCEPTED_IMAGE_MIMES, "صيغة الصورة غير مدعومة")
    .optional()
    .nullable(),
});

export const serviceProviderFormDetailsStepSchema = z
  .object({
    ...serviceDetails.shape,
    ...serviceProviderSocialMediaSchema.shape,
    ...providerDetailsSchema.shape,
  })
  .check(({ value, issues }) => {
    const isAddressRequired =
      value.service_delivery_method === "both" ||
      value.service_delivery_method === "offline";
    const isOnlineRequired =
      value.service_delivery_method === "both" ||
      value.service_delivery_method === "online";

    if (!value.address && isAddressRequired) {
      issues.push({
        code: "custom",
        path: ["address"],
        message: "العنوان مطلوب عند اختيار طريقة التسليم 'كلاهما'",
        input: value,
      });
    }

    if (!value.logo_image && !value.logo_image_file) {
      issues.push({
        code: "custom",
        path: ["logo_image_file"],
        message: "صورة الشعار مطلوبة",
        input: value,
      });
    }
  });

export const serviceProviderFormDocumentsStepSchema = z
  .object({
    ...privateDocumentsSchema.shape,
  })
  .check(({ value, issues }) => {
    if (!value.id_card_front_image && !value.id_card_front_file) {
      issues.push({
        code: "custom",
        path: ["id_card_front_file"],
        message: "صورة البطاقة الشخصية (الجهة الأمامية) مطلوبة",
        input: value,
      });
    }
    if (!value.id_card_back_image && !value.id_card_back_file) {
      issues.push({
        code: "custom",
        path: ["id_card_back_file"],
        message: "صورة البطاقة الشخصية (الجهة الخلفية) مطلوبة",
        input: value,
      });
    }
    if (!value.video_url_file && !value.video_url) {
      issues.push({
        code: "custom",
        path: ["video_url_file"],
        message: "فيديو تعريفي مطلوب",
        input: value,
      });
    }
  });

export type ServiceProviderFormDetailsStep = z.infer<
  typeof serviceProviderFormDetailsStepSchema
>;
export type ServiceProviderFormDocumentsStep = z.infer<
  typeof serviceProviderFormDocumentsStepSchema
>;
export type ServiceProviderCreateOrUpdate = z.infer<
  typeof serviceProviderSchema
>;

export const ServiceProviderFormDetailsStepDefaultValues: ServiceProviderFormDetailsStep =
  {
    service_name: "",
    service_description: "",
    service_category_id: "",
    service_delivery_method: "online",
    services: "",
    slug: "",
    keywords: "",
    years_of_experience: 0,
    address: "",
    phone: "",
    bio: "",
    facebook_url: "",
    instagram_url: "",
    whatsapp_url: "",
    official_url: "",
    other_urls: "",
    logo_image_file: null,
  };
export const ServiceProviderFormDocumentsStepDefaultValues: ServiceProviderFormDocumentsStep =
  {
    id_card_front_image: "",
    id_card_back_file: null,
    id_card_back_image: "",
    id_card_front_file: null,
    video_url: "",
    video_url_file: null,
    certificates_images: null,
    certificates_images_files: [],
    document_list: null,
    document_list_files: [],
  };

export const ServiceProviderCreateOrUpdateDefaultValues: ServiceProviderCreateOrUpdate =
  {
    ...ServiceProviderFormDetailsStepDefaultValues,
    ...ServiceProviderFormDocumentsStepDefaultValues,
  };

export const profileUpdateSchema = z.object({
  bio: z.string().optional(),
  service_description: z.string().optional(),
});

export class ServiceProviderMapper {
  static toDb(
    data: ServiceProviderCreateOrUpdate,
    { user_id, id }: { user_id: string; id: string } // Default values for user_id and id
  ): Partial<service_providers> {
    return {
      id,
      service_name: data.service_name,
      service_description: data.service_description,
      service_category_id: data.service_category_id,
      service_delivery_method: data.service_delivery_method,
      services: data.services,
      slug: data.slug,
      keywords: data.keywords,
      years_of_experience: data.years_of_experience as any,
      address: data.address || null,
      phone: data.phone,
      bio: data.bio || null,
      facebook_url: data.facebook_url || null,
      instagram_url: data.instagram_url || null,
      whatsapp_url: data.whatsapp_url || null,
      official_url: data.official_url || null,
      other_urls: data.other_urls || null,
      logo_image: data.logo_image || null,
      id_card_front_image: data.id_card_front_image || null,
      id_card_back_image: data.id_card_back_image || null,
      video_url: data.video_url || null,
      certificates_images: data.certificates_images || null,
      document_list: data.document_list || null,
      notes: data.notes || null,
      user_id: user_id || null,
    };
  }

  static fromDb(
    dbData: Partial<service_providers>
  ): ServiceProviderCreateOrUpdate {
    return {
      ...ServiceProviderCreateOrUpdateDefaultValues,
      service_name: dbData.service_name || "",
      service_description: dbData.service_description || "",
      service_category_id: dbData.service_category_id || "",
      service_delivery_method: dbData.service_delivery_method || "online",
      services: dbData.services || "",
      slug: dbData.slug || "",
      keywords: dbData.keywords || "",
      years_of_experience: dbData.years_of_experience?.toNumber() || 0,
      address: dbData.address || "",
      phone: dbData.phone || "",
      bio: dbData.bio || "",
      facebook_url: dbData.facebook_url || "",
      instagram_url: dbData.instagram_url || "",
      whatsapp_url: dbData.whatsapp_url || "",
      official_url: dbData.official_url || "",
      other_urls: dbData.other_urls || "",
      logo_image: dbData.logo_image || "",
      id_card_front_image: dbData.id_card_front_image || "",
      id_card_back_image: dbData.id_card_back_image || "",
      video_url: dbData.video_url || "",
      certificates_images: dbData.certificates_images || "",
      document_list: dbData.document_list || "",
      notes: dbData.notes || "",
    };
  }
}
