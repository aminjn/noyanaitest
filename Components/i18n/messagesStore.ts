// Where the client components read the UI texts from (2026-10, speed).
//
// The texts of one language are ~480 KB (every panel's). They used to ride
// inside every page's HTML (the root layout passed them to a client
// provider, so React serialized them into each response) - most of the
// page's weight, downloaded and parsed again on every page view on phones.
// Now:
//   - the browser loads them once from /i18n/<locale>.<hash>.js
//     (app/i18n/[file]/route.ts), cached for a year; a new hash (an admin
//     edit, a deploy) is a new URL;
//   - server rendering reads the same texts from a per-language slot the
//     root layout fills for the request (same process, no serialization).
// The script is parser-blocking in <head>, so it has run before the page's
// RSC data (in <body>) lets React hydrate the providers.

export type Messages = Record<string, string>;

type Store = { __noyanMsgs?: Partial<Record<string, Messages>> };

declare global {
  interface Window {
    __NOYAN_MSG?: Messages;
  }
}

export const putServerMessages = (locale: string, messages: Messages) => {
  const g = globalThis as unknown as Store;
  if (!g.__noyanMsgs) g.__noyanMsgs = {};
  g.__noyanMsgs[locale] = messages;
};

export const readMessages = (locale: string): Messages => {
  if (typeof window !== "undefined") return window.__NOYAN_MSG || {};
  return (globalThis as unknown as Store).__noyanMsgs?.[locale] || {};
};
