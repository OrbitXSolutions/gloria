import { z } from "zod/v4";
import { zodEgyptianPhone } from "./egyptian-number.schema";

export const UserForRegisterSchema = z
  .object({
    firstName: z
      .string("الإسم الأول مطلوب")
      .min(2, "الاسم الأول يجب أن يكون حرفين على الأقل")
      .max(50, "الاسم الأول طويل جداً"),
    lastName: z
      .string("الإسم الأخير مطلوب")
      .min(2, "الاسم الأخير يجب أن يكون حرفين على الأقل")
      .max(50, "الاسم الأخير طويل جداً"),
    email: z.email("يرجى إدخال بريد إلكتروني صحيح"),
    password: z
      .string("كلمة المرور مطلوبة")
      .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      .max(100, "كلمة المرور طويلة جداً"),
    confirmPassword: z
      .string("تأكيد كلمة المرور مطلوب")
      .min(6, "تأكيد كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      .max(100, "تأكيد كلمة المرور طويلة جداً"),
    phone: zodEgyptianPhone,
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
  });

export type UserForRegister = z.infer<typeof UserForRegisterSchema>;

export const UserForRegisterDefaultValues: UserForRegister = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
};
