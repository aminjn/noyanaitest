"use client";

import { useState } from "react";
import useSWRInfinite from "swr/infinite";
import classes from "./DoctorReviews.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";
import Button from "@/Components/UI/Button";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import { Stars } from "@/Components/Visit/VisitFeedbackCard";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "drProfile"];

type Review = {
  _id: string;
  overalScore: number;
  suggest: boolean;
  publicMessage: string;
  submittedAt: string;
  author: string;
  verified: boolean;
};

type ReviewsPage = {
  data: Review[];
  pagesCount: number;
  stats: {
    count: number;
    average: number;
    recommendPercent: number;
    distribution: Record<string, number>;
  };
};

// Verified visit reviews (GET /public/doctor/:id/feedbacks). Only patients
// with a completed visit can post, one review per visit.
const DoctorReviews = ({ doctorId }: { doctorId: string }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = new Intl.NumberFormat(intlTag);
  const [dateFmt] = useState(
    () => new Intl.DateTimeFormat(intlTag, { year: "numeric", month: "long" }),
  );

  const { data, size, setSize, isValidating } = useSWRInfinite<ReviewsPage>(
    (index) => `${API}/public/doctor/${doctorId}/feedbacks?page=${index + 1}`,
    (url: string) => fetcher({ url }).then((res) => res?.data),
  );

  const first = data?.[0];
  const stats = first?.stats;
  const reviews = (data ?? []).flatMap((p) =>
    Array.isArray(p?.data) ? p.data : [],
  );
  const hasMore = !!first && size < (first.pagesCount || 1);

  if (!data) return null;

  if (!stats?.count)
    return <p className={classes.empty}>{getContent("reviewsEmpty")}</p>;

  return (
    <div className={classes.main}>
      <div className={classes.summary}>
        <div className={classes.score}>
          <b>{num.format(stats.average)}</b>
          <Stars value={stats.average} size="1.125rem" />
          <span>{getContent("reviewsCount", [num.format(stats.count)])}</span>
        </div>
        <div className={classes.bars}>
          {[5, 4, 3, 2, 1].map((n) => {
            const c = stats.distribution?.[n] || 0;
            return (
              <div key={n} className={classes.bar}>
                <span>{num.format(n)}</span>
                <span className={classes.track}>
                  <span
                    style={{ width: `${stats.count ? (c / stats.count) * 100 : 0}%` }}
                  />
                </span>
                <span>{num.format(c)}</span>
              </div>
            );
          })}
        </div>
        <p className={classes.recommend}>
          {getContent("reviewsRecommendPercent", [
            // locale-aware percent (e.g. "۱۰۰٪" in Persian, "100%" in English)
            new Intl.NumberFormat(intlTag, { style: "percent" }).format(
              (stats.recommendPercent || 0) / 100,
            ),
          ])}
        </p>
      </div>

      <ul className={classes.list}>
        {reviews.map((r) => (
          <li key={r._id} className={classes.item}>
            <div className={classes.itemHead}>
              <span className={classes.author}>{r.author || "—"}</span>
              {r.verified && (
                <span className={classes.verified}>
                  <CheckCircleIcon />
                  {getContent("reviewsVerified")}
                </span>
              )}
              <span className={classes.date}>
                {safeFormatDate(dateFmt, r.submittedAt)}
              </span>
            </div>
            <div className={classes.itemMeta}>
              <Stars value={r.overalScore} />
              {r.suggest && (
                <span className={classes.recommends}>
                  {getContent("reviewsRecommends")}
                </span>
              )}
            </div>
            {!!r.publicMessage && (
              <p className={classes.text}>{r.publicMessage}</p>
            )}
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className={classes.more}>
          <Button
            mode="Outline"
            size="S"
            isLoading={isValidating}
            onClick={() => setSize(size + 1)}
          >
            {getContent("reviewsMore")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DoctorReviews;
