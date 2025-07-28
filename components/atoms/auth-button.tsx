"use client";
import { Button } from "@/components/ui/button";
import { User, LogOut, LogIn, Settings } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/_actions/auth";
import { useSupabase } from "../_core/providers/SupabaseProvider";
import Link from "next/link";
import LoadingIndicator from "./LoadingIndicator";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { Spinner } from "../ui/spinner";
import { useTranslations } from "next-intl";

export default function AuthButton() {
  const { user, loading, logout, isLoggingOut } = useSupabaseUser();
  const router = useRouter();
  const t = useTranslations("profile.sidebar");

  // const { execute: signOut, isExecuting } = useAction(signOutAction, {
  //   onSuccess: (result) => {
  //     if (result.data?.success) {
  //       toast.success(result.data.message);
  //       router.refresh();
  //     }
  //   },
  //   onError: (error) => {
  //     toast.error("Failed to sign out");
  //   },
  // });

  const handleSignOut = () => {
    logout();
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-5 w-5" />
      </Button>
    );
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <Settings className="h-4 w-4 mr-2" />
            {t("overview")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile/favorites")}>
            <User className="h-4 w-4 mr-2" />
            {t("favorites")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile/orders")}>
            <User className="h-4 w-4 mr-2" />
            {t("orders")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut}>
            <LogOut className="h-4 w-4 mr-2" />
            {t("signOut")}
            {isLoggingOut && <Spinner size={"small"} className="text-white" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      asChild
      size="sm"
      className="flex items-center gap-2"
    >
      <Link href="/auth/login">
        <LogIn className="h-4 w-4" />
        <span className="hidden md:inline">{t("signIn")}</span>
        <LoadingIndicator loaderClassName="text-white" />
      </Link>
    </Button>
  );
}
