import { getSiteVerification } from "@/Components/helpers/siteVerification";

// Search Console's HTML verification file (2026-10: ownership was lost after
// the move to this platform, where no such file existed). next.config
// rewrites "/google<code>.html" here; the names come from the super admin's
// «سئو و لینک‌ها» → «تأیید مالکیت», so a redeploy never drops them.
export const dynamic = "force-dynamic";

export const GET = async (_req: Request, { params }: { params: { file: string } }) => {
  const file = String(params?.file || "");
  const known = /^google[0-9a-f]{8,32}\.html$/.test(file) && (await getSiteVerification(true)).googleFiles.includes(file);
  if (!known) return new Response("Not found", { status: 404 });
  return new Response(`google-site-verification: ${file}`, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
};
