"use server";
import { ROUTES } from "@/lib/constants/routes";

import { UserSetPhoneSchema } from "@/lib/data/models/schemas/set-phone-schema";
import { setUserPhone } from "@/lib/data/supabase/auth";
import { actionClient } from "@/lib/safe-action";
import { redirect } from "next/navigation";

export const setPhoneAction = actionClient
  .inputSchema(UserSetPhoneSchema)
  .action(async ({ parsedInput: data }) => {
    const { user } = await setUserPhone(data);

    redirect(`${ROUTES.OTP}?phone=${user?.new_phone || ""}&isChanging=true`);
  });
