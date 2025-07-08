import Contact from "@/components/molecules/contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact me for any inquiries or collaborations.",
};

export default async function Page() {
  return <Contact />;
}
