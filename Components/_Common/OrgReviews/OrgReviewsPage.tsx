"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import classes from "./OrgReviewsPage.module.css";

const NS: ContentNamespace[] = ["common", "orgReviews"];

type Review = { _id: string; content?: string; score?: number; createdAt?: string; author?: { username?: string; identity?: { givenName?: string; lastName?: string } } };
type Reviews = { items: Review[]; count: number; average: number };

// A centre's published reviews and average score (2026-10), read-only:
// moderation stays with the super admin.
const OrgReviewsPage = ({ kind, panel }: { kind: "clinic" | "hospital" | "paraClinic" | "insurance"; panel: string }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag, { maximumFractionDigits: 1 }), [intlTag]);
  const date = useMemo(() => new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long", year: "numeric" }), [intlTag]);
  const { data, error } = useSWR<Reviews>(`${API}/${kind}/review`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  useBreadCrump([
    { title: getContent("dashboard"), target: `/${panel}` },
    { title: getContent("orgReviewsTitle"), target: `/${panel}/review` },
  ]);
  const items = Array.isArray(data?.items) ? data.items : [];
  // the display name, or first name and last initial (never the full name)
  const who = (r: Review) =>
    r.author?.username ||
    [r.author?.identity?.givenName, r.author?.identity?.lastName ? `${r.author.identity.lastName.charAt(0)}.` : ""]
      .filter(Boolean)
      .join(" ") ||
    "—";

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.head}>
            <h1 className={classes.title}>{getContent("orgReviewsTitle")}</h1>
            {!!data.count && (
              <span className={classes.average}>
                ★ {getContent("orgReviewsAverage", [num.format(data.average || 0), num.format(data.count)])}
              </span>
            )}
          </div>
          <p className={classes.hint}>{getContent("orgReviewsHint")}</p>
          {!items.length ? (
            <p className={classes.empty}>{getContent("orgReviewsEmpty")}</p>
          ) : (
            <ul className={classes.list}>
              {items.map((r) => (
                <li key={r._id} className={classes.card}>
                  <div className={classes.cardHead}>
                    <InitialAvatar name={who(r)} seed={r._id} size="2.25rem" />
                    <strong>{who(r)}</strong>
                    <span className={classes.score}>{"★".repeat(Math.max(0, Math.min(5, Number(r.score) || 0)))}</span>
                    {!!r.createdAt && <span className={classes.date}>{date.format(new Date(r.createdAt))}</span>}
                  </div>
                  {!!r.content && <p className={classes.content}>{r.content}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default OrgReviewsPage;
