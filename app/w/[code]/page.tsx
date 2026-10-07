import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { getServerLocale } from "@/Components/i18n/serverContent";
import { localizePath } from "@/Components/i18n/locales";

// a personal link: never indexed
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Resolved = {
  doctor: { _id: string; slug?: string };
  sessionType: string;
  office: string | null;
  offer: { ymd: string; start: number; end: number } | null;
};

// The waitlist notice's link («نوبت خالی شد», SMS and in-app; backend
// Lib/waitlist.ts): straight to the booking details on the offered slot
// (Components/Booking/Flow/bookingFlow.ts finalizeHref's query). If the
// slot was taken meanwhile, that page says so and offers the next times.
const WaitlistLink = async ({ params }: { params: { code: string } }) => {
  const data = await getPublicData<Resolved>(`waitlist/${encodeURIComponent(params.code)}`);
  if (!data?.doctor?._id) return notFound();
  const q = new URLSearchParams();
  if (data.offer) {
    q.set("d", data.offer.ymd);
    q.set("s", String(data.offer.start));
    q.set("e", String(data.offer.end));
  }
  if (data.sessionType) q.set("t", data.sessionType);
  if (data.office) q.set("o", data.office);
  const qs = q.toString();
  redirect(localizePath(`/book/finalize/${data.doctor._id}${qs ? `?${qs}` : ""}`, getServerLocale()));
};

export default WaitlistLink;
