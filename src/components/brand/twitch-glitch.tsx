/**
 * Twitch "Glitch" logo — for the "Log in with Twitch" button ONLY.
 *
 * Twitch brand rules: use it unmodified, in white / black / Twitch purple,
 * to indicate a Twitch login or integration. Never use it as FollowSweep's
 * own logo or in a way that suggests Twitch made or endorses this app.
 */
export function TwitchGlitch({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}
