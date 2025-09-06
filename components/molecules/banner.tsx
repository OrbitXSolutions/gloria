"use client";

import Image from "next/image";

export default function Banner() {
  return (
    <section className="app-promo-section relative w-full flex justify-center">
      <div className="max-w-[1200px] w-full">
        <Image
          className="max-md:hidden h-full w-full rounded-3xl shadow-2xl animate-fadein object-cover"
          src="/images/banner-home.jpg"
          width={1200}
          height={500}
          alt="Gloria Home Banner"
          priority
        />
        <Image
          className="md:hidden w-full h-full rounded-2xl shadow-xl animate-fadein object-cover"
          src="/images/banner-home.jpg"
          width={800}
          height={400}
          alt="Gloria Home Banner"
          priority
        />
      </div>
    </section>
  );
}
