import { getMessages } from "@/Components/i18n/getMessages";
import { isLocale } from "@/Components/i18n/locales";

// /i18n/<locale>.<hash>.js - the UI texts of one language as a script that
// sets window.__NOYAN_MSG (Components/i18n/messagesStore.ts). The hash in
// the name only busts the cache: the content is always the current texts.
export const dynamic = "force-dynamic";

export const GET = async (_req: Request, { params }: { params: { file: string } }) => {
  const locale = String(params?.file || "").split(".")[0];
  if (!isLocale(locale)) return new Response("", { status: 404 });
  const messages = await getMessages(locale);
  // "</" never ends the script early; U+2028/9 are valid in JS strings now
  const body = `window.__NOYAN_MSG=${JSON.stringify(messages).replace(/</g, "\\u003c")};`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
