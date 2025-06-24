import { ThemeProvider } from "@/lib/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { ClientWrapper } from "./client-wrapper.component";
import { Toaster } from "sonner";

interface Props {
  children: React.ReactNode;
}

export function RootWrapper({ children }: Props) {
    
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider >
        <ClientWrapper>{children}</ClientWrapper>
        <Toaster
          richColors
          closeButton
        />
      </NextIntlClientProvider>
    </ThemeProvider>
  ); 
}
