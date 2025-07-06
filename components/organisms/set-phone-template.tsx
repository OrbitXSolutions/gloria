"use client";

import SetPhoneForm from "../molecules/set-phone-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

export default function SetPhoneTemplate() {
  return (
    <Card className="mx-auto max-w-sm bg-white my-10" suppressHydrationWarning>
      <CardHeader>
        <CardTitle className="text-2xl">{"إدخال رقم الهاتف"}</CardTitle>
        <CardDescription>
          {
            "الرجاء إدخال رقم الهاتف الخاص بك للمتابعة. سوف نرسل لك رمز تحقق (OTP)."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SetPhoneForm />
      </CardContent>
    </Card>
  );
}
