import { ThemeProvider } from "@/lib/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { ClientWrapper } from "./client-wrapper.component";
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
        <ClientWrapper>{children}</ClientWrapper>
        <Toaster closeButton />
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
