import { z } from "zod/v4";
import { zodEgyptianPhone } from "./egyptian-number.schema";

export const UserForPhoneLoginSchema = z.object({
  password: z
    .string("كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .max(100, "كلمة المرور طويلة جداً"),

  phone: zodEgyptianPhone,
});

export type UserForPhoneLogin = z.infer<typeof UserForPhoneLoginSchema>;

export const UserForPhoneLoginDefaultValues: UserForPhoneLogin = {
  password: "",
  phone: "",
};
