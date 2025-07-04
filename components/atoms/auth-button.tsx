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

export default function AuthButton() {
  const { user, loading } = useSupabase();
  const router = useRouter();

  const { execute: signOut, isExecuting } = useAction(signOutAction, {
    onSuccess: (result) => {
      if (result.data?.success) {
        toast.success(result.data.message);
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error("Failed to sign out");
    },
  });

  const handleSignOut = () => {
    signOut();
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
            <span className="hidden md:inline">Account</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <Settings className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile/favorites")}>
            <User className="h-4 w-4 mr-2" />
            Favorites
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile/orders")}>
            <User className="h-4 w-4 mr-2" />
            Orders
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={isExecuting}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push("/auth/login")}
      className="flex items-center gap-2"
    >
      <LogIn className="h-4 w-4" />
      <span className="hidden md:inline">Sign In</span>
    </Button>
  );
}
