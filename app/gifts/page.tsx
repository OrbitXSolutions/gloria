import Image from "next/image";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Image
        src="/placeholder-logo.png"
        alt="Gloria Logo"
        width={150}
        height={150}
        className="mb-8"
      />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Coming Soon</h1>
      <p className="text-lg text-gray-600 text-center">
        We are working hard to bring you an exciting collection of gifts. Stay
        tuned for updates!
      </p>
    </div>
  );
}
