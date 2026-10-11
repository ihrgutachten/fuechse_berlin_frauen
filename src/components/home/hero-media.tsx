"use client";

import Image from "next/image";
import { useState } from "react";

export function HeroMedia() {
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <video
        className="absolute inset-0 h-full w-full object-cover object-[center_35%] motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        onPlaying={() => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          setPlaying(true);
        }}
      >
        <source src="/hero/hero-video.webm" type="video/webm" />
        <source src="/hero/hero-video.mp4" type="video/mp4" />
      </video>
      <Image
        src="/hero/hero-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className={
          playing
            ? "invisible object-cover object-[center_35%]"
            : "object-cover object-[center_35%]"
        }
      />
    </>
  );
}
