"use client";
import { useMemo } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import { diffDaysYmd, isYmd, TEHRAN_TZ, tehranNoon, tehranTodayYmd } from "@/Components/helpers/tehranTime";
import { clock } from "@/Components/Booking/Flow/bookingFlow";
import classes from "./BookingStatusCard.module.css";

const NS: ContentNamespace[] = ["doctorPanelHome"];

type Blocker =
  | "suspended"
  | "unclaimed"
  | "noName"
  | "noSpeciality"
  | "noAvatar"
  | "noOffice"
  | "noPricedType"
  | "noShift"
  | "hiddenByAdmin"
  | "noFreeTime";

type Status = {
  live: boolean;
  published: boolean;
  slug: string;
  nextSlot: { ymd: string; start: number } | null;
  blockers: Blocker[];
  tips: Blocker[];
};

// each missing step: its text and the panel page that fixes it (none when
// only support can - a suspension, an unlinked or hidden page)
const STEPS: Record<Blocker, { label: ContentKey; href?: string }> = {
  suspended: { label: "bsSuspended" },
  unclaimed: { label: "bsUnclaimed" },
  noName: { label: "bsNoName", href: "/doctorpanel/profile" },
  noSpeciality: { label: "bsNoSpeciality", href: "/doctorpanel/profile" },
  noAvatar: { label: "bsNoAvatar", href: "/doctorpanel/profile" },
  noOffice: { label: "bsNoOffice", href: "/doctorpanel/office" },
  noPricedType: { label: "bsNoPricedType", href: "/doctorpanel/settings" },
  noShift: { label: "bsNoShift", href: "/doctorpanel/shift" },
  hiddenByAdmin: { label: "bsHiddenByAdmin" },
  noFreeTime: { label: "bsNoFreeTime", href: "/doctorpanel/shift" },
};

// «بیماران می‌توانند از شما نوبت بگیرند؟» (2026-10, Doctolib Pro's "your
// profile is online" / Paziresh24's activation list): the doctor's page
// state from the server's own rules (backend Lib/doctorBookingStatus.ts),
// the first free time patients see, and each missing step with its fix.
const BookingStatusCard = ({ hideWhenLive = false }: { hideWhenLive?: boolean }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { data } = useSWR<Status>(`${API}/doctor/booking-status`, (url: string) =>
    fetcher({ url }).then((res) => res?.data?.data),
  );
  if (!data || typeof data !== "object") return null;
  const blockers = (Array.isArray(data.blockers) ? data.blockers : []).filter((b) => STEPS[b]);
  const tips = (Array.isArray(data.tips) ? data.tips : []).filter((b) => STEPS[b]);
  const pageHref = `/dr/${data.slug}`;

  if (data.live) {
    if (hideWhenLive && !tips.length) return null;
    const s = data.nextSlot && isYmd(data.nextSlot.ymd) ? data.nextSlot : null;
    const diff = s ? diffDaysYmd(tehranTodayYmd(), s.ymd) : 0;
    const day = s
      ? diff === 0
        ? getContent("today")
        : diff === 1
          ? getContent("tomorrow")
          : tehranNoon(s.ymd).toLocaleDateString(intlTag, { timeZone: TEHRAN_TZ, weekday: "long", day: "numeric", month: "long" })
      : "";
    return (
      <section className={`${classes.card} ${classes.ok}`}>
        <span className={classes.dot} aria-hidden />
        <div className={classes.body}>
          <strong>{getContent("bsLiveTitle")}</strong>
          {!!s && <p>{getContent("bsLiveNext", [`${day} · ${clock(s.start, nf)}`])}</p>}
          {tips.map((t) => (
            <p key={t} className={classes.tip}>
              {getContent("bsTipAvatar")}{" "}
              {STEPS[t].href && <Link href={STEPS[t].href!}>{getContent("bsFix")}</Link>}
            </p>
          ))}
        </div>
        <Link href={pageHref} className={classes.action} target="_blank">
          {getContent("bsViewPage")}
        </Link>
      </section>
    );
  }

  return (
    <section className={`${classes.card} ${classes.off}`} role="status">
      <span className={classes.dot} aria-hidden />
      <div className={classes.body}>
        <strong>{getContent("bsOffTitle")}</strong>
        {!!blockers.length && <p>{getContent("bsOffLead")}</p>}
        <ul className={classes.list}>
          {blockers.map((b) => (
            <li key={b}>
              <span>{getContent(STEPS[b].label)}</span>
              {STEPS[b].href && (
                <Link href={STEPS[b].href!} className={classes.fix}>
                  {getContent("bsFix")}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      {data.published && (
        <Link href={pageHref} className={classes.action} target="_blank">
          {getContent("bsViewPage")}
        </Link>
      )}
    </section>
  );
};

export default BookingStatusCard;
