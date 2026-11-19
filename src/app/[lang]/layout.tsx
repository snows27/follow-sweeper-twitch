import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/server";
import { I18nProvider } from "@/i18n/I18nProvider";
import { APP_NAME } from "@/lib/constants";
import { themeInitScript } from "@/lib/theme";
import { InlineScript } from "@/components/common/inline-script";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-thai",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { dict } = await resolveLocale(params);
  return {
    title: { default: `${APP_NAME} – ${dict.common.tagline}`, template: `%s · ${APP_NAME}` },
    description: dict.landing.heroSubtitle,
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { locale, dict } = await resolveLocale(params);
  return (
    // suppressHydrationWarning: the theme script may add data-theme before React hydrates.
    <html lang={locale} className={`${inter.variable} ${notoThai.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint (no flash). */}
        <InlineScript html={themeInitScript} />
      </head>
      <body className="min-h-full">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
        >
          {dict.common.skipToContent}
        </a>
        <I18nProvider locale={locale} dict={dict}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
