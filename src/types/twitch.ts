/** Raw Twitch Helix API shapes (only the fields we use). */

export type HelixPage<T> = {
  data: T[];
  pagination?: { cursor?: string };
  total?: number;
};

export type HelixUser = {
  id: string;
  login: string;
  display_name: string;
  type: "admin" | "global_mod" | "staff" | "";
  broadcaster_type: "partner" | "affiliate" | "";
  description: string;
  profile_image_url: string;
  created_at: string;
};

export type HelixFollower = {
  user_id: string;
  user_login: string;
  user_name: string;
  followed_at: string;
};

export type HelixUserRef = {
  user_id: string;
  user_login: string;
  user_name: string;
};
