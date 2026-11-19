import type {
  ApiError,
  ApiErrorCode,
  FollowersResponse,
  RemoveAction,
  RemoveResponse,
} from "@/types/api";

/** Browser-side client for our own API routes. */

export class ApiRequestError extends Error {
  name = "ApiRequestError";
  constructor(public code: ApiErrorCode) {
    super(code);
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, { ...init, cache: "no-store", credentials: "same-origin" });
  } catch {
    throw new ApiRequestError("server_error");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(body?.error.code ?? "server_error");
  }
  return (await res.json()) as T;
}

export function fetchFollowers(signal?: AbortSignal) {
  return request<FollowersResponse>("/api/followers", { signal });
}

export function removeBatch(ids: string[], action: RemoveAction) {
  return request<RemoveResponse>("/api/followers/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action }),
  });
}
