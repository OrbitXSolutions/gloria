"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useTranslations } from "next-intl";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { setPhoneAction } from "@/app/auth/set-phone/action";
import {
  UserSetPhoneDefaultValues,
  UserSetPhoneSchema,
} from "@/lib/schemas/set-phone-schema";
import { Button } from "../ui/button";

// const setphoneFields: SetPhoneFieldData[] = [
//   {
//     name: "phone",
//     type: "tel",
//     label: "رقم الهاتف",
//     placeholder: "+201234567890",
//   },

// ] as const;

export default function SetPhoneForm() {
  const t = useTranslations("toast");
  const {
    form,
    action,
    handleSubmitWithAction: onSubmit,
    resetFormAndAction: resetForm,
  } = useHookFormAction(setPhoneAction, zodResolver(UserSetPhoneSchema), {
    actionProps: {
      onSuccess: ({ data }) => {
        toast.info(t("phone.otpSent"));
      },
      onError: ({ error }) => {
        console.error("Registration error:", error);
        toast.error(t("phone.registrationFailed"));
      },
    },

    formProps: {
      mode: "onBlur",
      defaultValues: UserSetPhoneDefaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6" suppressHydrationWarning>
        {/* Server Error Display */}
        {action.hasErrored && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-destructive text-center">
              {typeof action.result?.serverError === "string"
                ? action.result.serverError
                : "حدث خطأ في الخادم"}
            </p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          <FormField
            name="phone"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor={field.name}>{"رقم الهاتف"}</FormLabel>
                <FormControl>
                  <Input
                    id={field.name}
                    type="tel"
                    placeholder="+201234567890"
                    disabled={action.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button
          disabled={action.isPending}
          type="submit"
          className="w-full cursor-pointer"
        >
          {action.isPending ? (
            <>
              جاري التسجيل...
              <Spinner size="small" />
            </>
          ) : (
            "إرسال رمز التحقق"
          )}
        </Button>
      </form>
    </Form>
  );
}
