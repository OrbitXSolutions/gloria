import { z } from "zod/v4";

export const UserVerifyPhoneSchema = z.object({
  token: z
    .string("رمز التحقق مطلوب")
    .trim()
    .length(6, "رمز التحقق يجب أن يكون 6 أرقام"),
  phone: z.string().optional(),
  isChange: z.boolean().optional().default(false),
});

export type UserVerifyPhone = z.infer<typeof UserVerifyPhoneSchema>;
export const UserVerifyPhoneDefaultValues: UserVerifyPhone = {
  token: "",
  isChange: false,
  phone: "",
};
