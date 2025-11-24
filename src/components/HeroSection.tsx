"use client";
import Image from 'next/image';
import React from 'react';

type Props = {
  title: string;
  description?: string;
  image: string;
};

export default function HeroSection({ title, description, image }: Props) {
  return (
    <section className="w-full mb-8">
      <div className="relative rounded-2xl overflow-hidden h-[420px]">
        <Image src={image} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute left-8 bottom-8 max-w-lg">
          <h1 className="text-4xl font-bold">{title}</h1>
          {description && <p className="mt-2 text-sm text-gray-200/80">{description}</p>}
        </div>
      </div>
    </section>
  );
}
