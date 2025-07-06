"use server";

import { setUserPhone } from "@/app/_actions/auth";
import { actionClient } from "@/lib/common/safe-action";
import { ROUTES } from "@/lib/constants/routes";
import { UserSetPhoneSchema } from "@/lib/schemas/set-phone-schema";
import { redirect } from "next/navigation";

export const setPhoneAction = actionClient
  .inputSchema(UserSetPhoneSchema)
  .action(async ({ parsedInput: data }) => {
    const { user } = await setUserPhone(data);

    redirect(`${ROUTES.OTP}?phone=${user?.new_phone || ""}&isChanging=true`);
  });
