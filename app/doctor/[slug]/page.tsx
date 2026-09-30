import { notFound, permanentRedirect } from "next/navigation";
import { getPublicData } from "@/Components/helpers/getPublicData";

// A doctor of the old public directory now has a regular doctor profile
// (2026-09 merge): the old URL answers with a 301 to /dr/<slug> (the
// middleware's Redirection usually catches it first; this covers the rest).
const LegacyDoctor = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<{ redirect?: string }>(
    `doctor/${encodeURIComponent(decodeURIComponent(slug))}`,
  );
  if (!data?.redirect) return notFound();
  permanentRedirect(data.redirect);
};

export default LegacyDoctor;
