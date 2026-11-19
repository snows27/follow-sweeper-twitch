"use client";

import { useSearchParams } from "next/navigation";
import { Mascot } from "@/components/common/mascot";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

/** Shows `?error=…` from a failed or expired login, in the user's language, with the mascot. */
export function LoginError() {
  const { dict } = useI18n();
  const code = useSearchParams().get("error");
  if (!code) return null;
  const errors = dict.loginErrors;
  const message = code in errors ? errors[code as keyof typeof errors] : errors.unknown;
  // An expired session is normal (sleepy), not a failure (dizzy).
  const expired = code === "session_expired";

  return (
    <div
      role="alert"
      className={cn(
        "mx-auto mb-6 flex max-w-xl items-center gap-3 rounded-card border px-3 py-2 text-left text-sm",
        expired ? "border-line bg-surface text-fg" : "border-danger/40 bg-danger-soft text-danger-fg",
      )}
    >
      <Mascot name={expired ? "session-expired" : "error"} size={80} />
      <p className="font-semibold">{message}</p>
    </div>
  );
}
