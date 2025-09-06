import { ThemeProvider } from "@/lib/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { ClientWrapper } from "./client-wrapper.component";
import { LoggerProvider, LoggedErrorBoundary } from "@/components/_core/providers/logger-provider";
import SupabaseProvider from "@/components/_core/providers/SupabaseProvider";
import { Toaster } from "sonner";

interface Props {
  children: React.ReactNode;
  messages: Record<string, any>;
}

export function RootWrapper({ children, messages }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider messages={messages}>
        <SupabaseProvider>
          <LoggedErrorBoundary>
            <LoggerProvider>
              <ClientWrapper>{children}</ClientWrapper>
            </LoggerProvider>
          </LoggedErrorBoundary>
        </SupabaseProvider>
        <Toaster closeButton />
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
