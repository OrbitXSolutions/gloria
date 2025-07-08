import { ROUTES } from "@/lib/constants/routes";
import { createSsrClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSsrClient();
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();
  if (getUserError || !user) {
    redirect(ROUTES.LOGIN);
  }

  return children;
}
