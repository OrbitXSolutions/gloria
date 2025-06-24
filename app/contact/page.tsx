import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact me for any inquiries or collaborations.",
};

export default async function Page() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Contact Me</h1>
      <p className="mb-6">
        Feel free to reach out with any questions, collaboration ideas, or just
        to say hello!
      </p>
      {/* <ContactForm /> */}
    </div>
  );
}
