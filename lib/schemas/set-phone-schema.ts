import { z } from "zod/v4";
import { zodEgyptianPhone } from "./egyptian-number.schema";

export const UserSetPhoneSchema = z.object({
  phone: zodEgyptianPhone,
});

export type UserSetPhone = z.infer<typeof UserSetPhoneSchema>;

export const UserSetPhoneDefaultValues: UserSetPhone = {
  phone: "",
};




