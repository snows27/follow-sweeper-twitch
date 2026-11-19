import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/constants";

/** Web app manifest: name + mascot icons when "installed" / added to a home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} – follower tools for Twitch`,
    short_name: APP_NAME,
    start_url: "/",
    display: "standalone",
    background_color: "#0e0e10",
    theme_color: "#9146ff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
