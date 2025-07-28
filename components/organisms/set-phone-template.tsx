"use client";

import { useTranslations } from "next-intl";
import SetPhoneForm from "../molecules/set-phone-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

export default function SetPhoneTemplate() {
  const t = useTranslations("auth.forms.setPhone");

  return (
    <Card className="mx-auto max-w-sm bg-white my-10" suppressHydrationWarning>
      <CardHeader>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SetPhoneForm />
      </CardContent>
    </Card>
  );
}
