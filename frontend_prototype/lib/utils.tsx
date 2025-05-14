import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { base_url, auth_token } from "@/const";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

interface FetchOptions {
  method?: string;
  body?: object;
  signal?: AbortSignal;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { method = "GET", body, signal } = options;

  const response = await fetch(`${base_url}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${auth_token}`,
      "Content-Type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
