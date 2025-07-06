import { z } from "zod/v4";

// Regex for Egyptian mobile numbers starting with 1 followed by 9 digits
// Captures the 10-digit mobile number (1xxxxxxxxx) in group 1
// Accepts formats: 1xxxxxxxxx, 01xxxxxxxxx, 201xxxxxxxxx, +201xxxxxxxxx, 00201xxxxxxxxx
const EG_MOBILE_REGEX = /^(?:\+20|0020|20|0)?(1\d{9})$/;

export const zodEgyptianPhone = z
  // .string("رقم الهاتف مطلوب")
  // .trim()
  // .default("")
  // .refine((num) => EG_MOBILE_REGEX.test(num), {
  //   message: "يرجى إدخال رقم هاتف مصري صحيح",
  // })
  // .transform<string>((num) => {
  //   const match = num.match(EG_MOBILE_REGEX);
  //   if (!match) {
  //     return "";
  //   }
  //   // match[1] contains the 10-digit mobile number (1xxxxxxxxx)
  //   return `+20${match[1]}`;
  // })
  // for TEst
  .string("رقم الهاتف مطلوب")
  .default("");
