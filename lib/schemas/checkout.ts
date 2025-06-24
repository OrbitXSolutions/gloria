import { z } from "zod";

export const guestUserSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]{7,15}$/, "Please enter a valid phone number"),
  address: z.string().min(1, "Address is required"),
  stateCode: z.string().min(1, "Please select an emirate"),
  notes: z.string().optional(),
});

export const checkoutSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    stateCode: z.string().min(1, "State is required"),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    confirmPassword: z.string().min(6).optional(),
    notes: z.string().optional(),
    selectedAddressId: z.number().optional(),
    useNewAddress: z.boolean(),
  })
  .refine(
    (data) => {
      // If guest user, require email and password
      if (data.email && (!data.password || !data.confirmPassword)) {
        return false;
      }
      if (
        data.password &&
        data.confirmPassword &&
        data.password !== data.confirmPassword
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please complete all required fields",
    }
  );

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type GuestUserFormData = z.infer<typeof guestUserSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
