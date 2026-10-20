import { notFound, permanentRedirect } from "next/navigation";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { safeLocalPath } from "@/Components/helpers/safeHref";

// A doctor of the old public directory now has a regular doctor profile
// (2026-09 merge): the old URL answers with a 301 to /dr/<slug> (the
// middleware's Redirection usually catches it first; this covers the rest).
const LegacyDoctor = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<{ redirect?: string }>(
    `doctor/${encodeURIComponent(decodeURIComponent(slug))}`,
  );
  // a path on this site only, never another host
  const target = safeLocalPath(data?.redirect);
  if (!target) return notFound();
  permanentRedirect(target);
};

export default LegacyDoctor;
