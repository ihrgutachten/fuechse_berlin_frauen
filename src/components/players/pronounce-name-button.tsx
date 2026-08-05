"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

type PronounceNameButtonProps = {
  name: string;
  /** Optional recorded audio; preferred over TTS when present. */
  audioSrc?: string | null;
  /** BCP-47 language for speechSynthesis, e.g. nl-NL */
  lang?: string;
  /** Phonetic hint for TTS when orthography confuses the engine */
  phonetic?: string | null;
  className?: string;
};

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;
  const prefix = lang.split("-")[0];
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null;
}

export function PronounceNameButton({
  name,
  audioSrc,
  lang = "de-DE",
  phonetic,
  className,
}: PronounceNameButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
    };
  }, []);

  async function play() {
    if (speaking) {
      window.speechSynthesis?.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setSpeaking(false);
      return;
    }

    if (audioSrc) {
      const audio = audioRef.current ?? new Audio(audioSrc);
      audioRef.current = audio;
      setSpeaking(true);
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => {
        setSpeaking(false);
        speakTts();
      };
      try {
        await audio.play();
      } catch {
        setSpeaking(false);
        speakTts();
      }
      return;
    }

    speakTts();
  }

  function speakTts() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(phonetic?.trim() || name);
    utter.lang = lang;
    utter.rate = 0.92;
    const voice = pickVoice(lang);
    if (voice) utter.voice = voice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    // Chrome sometimes needs voices loaded first
    const start = () => window.speechSynthesis.speak(utter);
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const v = pickVoice(lang);
        if (v) utter.voice = v;
        start();
      };
    } else {
      start();
    }
  }

  return (
    <button
      type="button"
      onClick={play}
      aria-label={speaking ? `Aussprache von ${name} stoppen` : `Namen ${name} aussprechen`}
      title="Namen aussprechen"
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fb-green-300)]",
        speaking && "bg-[var(--fb-green-500)] text-[var(--fb-green-950)] border-transparent",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        {speaking ? (
          <path d="M6 7h4v10H6V7zm8 0h4v10h-4V7z" />
        ) : (
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        )}
      </svg>
    </button>
  );
}
