import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { Locale } from "@/i18n/config";

/** Broom mark — used next to the "Follower cleanup" title. */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="8" fill="#9146ff" />
      <path d="M20.5 5.5l-6 11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 16.5h9l3.5 9.5H6.5z" fill="#fff" />
      <path
        d="M11 21l-.8 4M14.5 21l-.3 4M18 21l.3 4"
        stroke="#9146ff"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ locale, href }: { locale: Locale; href?: string }) {
  return (
    <Link href={href ?? `/${locale}`} className="flex items-center gap-2.5 font-extrabold text-fg">
      {/* Mascot face (same art as the app icon). Original PNG, no re-encoding, so it stays crisp. */}
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={40}
        height={40}
        unoptimized
        className="size-9 shrink-0 rounded-[10px] sm:size-10"
      />
      <span className="hidden text-xl tracking-tight min-[420px]:inline">{APP_NAME}</span>
    </Link>
  );
}
