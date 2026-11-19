import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/server/auth/guard";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Server Component: reads the session, so render it inside <Suspense>. */
export async function UserMenu({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.profileImageUrl.replace(/-\d+x\d+\./, "-70x70.")}
          alt=""
          width={40}
          height={40}
          className="size-9 rounded-full bg-surface-3 sm:size-10"
        />
        <span className="hidden text-sm font-semibold lg:inline">{user.displayName}</span>
      </div>
      <form action="/api/auth/logout" method="post">
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-semibold text-muted hover:bg-surface-3 hover:text-fg sm:h-10 sm:px-3"
        >
          <LogOut className="size-[18px]" aria-hidden="true" />
          <span className="hidden sm:inline">{dict.common.logout}</span>
          <span className="sr-only sm:hidden">{dict.common.logout}</span>
        </button>
      </form>
    </div>
  );
}

export function UserMenuSkeleton() {
  return <div className="h-10 w-28 animate-pulse rounded-md bg-surface-3" aria-hidden="true" />;
}
